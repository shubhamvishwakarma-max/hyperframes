"""Build the narration track + timing map.

Narration copy is taken verbatim from the customers_carousels source doc
(see content/customer-data.js). Only spoken-form spellings differ
("R M", "B F S I") so the TTS pronounces abbreviations letter by letter.

Voice providers (VO_PROVIDER, default: elevenlabs when ELEVENLABS_API_KEY is set):
  elevenlabs  "Aaditya - Healthcare Advisor" (ELEVENLABS_VOICE_ID, or looked up
              by name in the account's voices), eleven_multilingual_v2, speed 0.95.
  kokoro      Kokoro-82M (local, offline), 50/50 blend of hm_omega + hm_psi
              speaking English with en-us phonemes; speed 0.95.

Keyword sync: each line is transcribed by a local ASR and the ASR words are
aligned back onto the SCRIPT words, so window.VO carries script words with
timestamps whatever the voice (scene cues look up script words, e.g. "LAKHS").

Outputs:
  assets/audio/narration.wav     48 kHz mono narration bed
  build/vo-timing.json           line + word timings (ASR-aligned)
  scripts/vo-timing.js           same map exposed as window.VO for scenes
"""

import difflib
import json
import os
import re
import sys
import urllib.request

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
SPEED = 0.95
SR_OUT = 48000

# Pronunciation overrides (phoneme level): Indian-English readings.
PHONEME_FIX = [
    ("pˈɜːɹæməl", "pɪɹˈɑːməl"),  # Piramal -> Pi-RAA-mal
    ("ɐ jˈuː", "ˈeɪ jˈuː"),  # A U -> "A-U"
    ("sˈæmɚ", "sˈʌmɑːɹ"),  # Samar -> SUH-maar
    ("lˈækz", "lˈɑːks"),  # lakhs -> laakhs
    ("sˈʌbbɹˈoʊkɚ", "sˈʌb bɹˈoʊkɚ"),  # Sub-Broker
    ("ɹˈoʊlbˈeɪst", "ɹˈoʊl bˈeɪst"),  # role-based
    ("bˈiː ˈɛf ˈɛs aɪ", "bˈiː ˌɛf ˌɛs ˈaɪ"),  # BFSI, stress the final letter
    ("ɾ", "t"),  # Indian English does not flap /t/ (automates, capital, escalating)
]

# (id, spoken text, gap BEFORE this line in seconds)
# Scene boundaries are marked with "scene" entries: (scene_id, lead_in_s).
SCRIPT = [
    ("scene", "s01", 0.7),
    ("hook-q", "How many opportunities are hiding inside unworked leads and unmanaged conversations?", 0.0),
    ("hook-sub", "See how B F S I leaders are turning conversations into measurable outcomes.", 0.75),
    ("scene", "s02", 1.0),
    ("au-name", "A U Small Finance Bank.", 0.0),
    ("au-problem", "Manual calling couldn't scale across lakhs of leads, creating missed revenue opportunities.", 0.5),
    ("au-solution", "DoubleTick combined AI Voice with R M mapping to re-engage leads and route conversations to the right R M.", 0.8),
    ("scene", "s03", 5.2),
    ("pf-name", "Piramal Finance.", 0.0),
    ("pf-problem", "Manual outreach was slowing conversations across the loan lifecycle.", 0.5),
    ("pf-solution", "DoubleTick AI Voice automates outreach across follow-ups, partners and collections, escalating only the conversations that need an R M.", 0.8),
    ("scene", "s04", 4.6),
    ("ww-name", "Wint Wealth.", 0.0),
    ("ww-problem", "Personalized wealth conversations were becoming harder to govern.", 0.5),
    ("ww-solution", "DoubleTick gives Wint Wealth centralized oversight across R M-led WhatsApp conversations, without managers manually reading every chat.", 0.8),
    ("scene", "s05", 4.6),
    ("cd-name", "Coin D C X.", 0.0),
    ("cd-problem", "More WhatsApp journeys created more blind spots across teams.", 0.5),
    ("cd-solution", "DoubleTick brings Sales, VIP and Sub-Broker conversations onto one governed WhatsApp layer with centralized visibility and analytics.", 0.8),
    ("scene", "s06", 4.4),
    ("sc-name", "Samar Capital.", 0.0),
    ("sc-problem", "R M conversations needed independence without losing enterprise control.", 0.5),
    ("sc-solution", "DoubleTick gives every R M a governed business number with role-based access, while keeping supervisors in control.", 0.8),
    # Recap carries no narration (strict PDF-only VO): metrics speak visually.
    ("scene", "s07", 4.4),
    ("scene", "s08", 6.4),
    ("cta-q", "Still managing customer conversations manually?", 0.5),
    ("cta-sub", "Let DoubleTick show you what can be automated.", 0.7),
    ("end", "end", 3.2),  # hold completed CTA + music resolve
]


def phonemes_for(k, text):
    ph = k.tokenizer.phonemize(text, "en-us")
    for a, b in PHONEME_FIX:
        ph = ph.replace(a, b)
    return ph


ELEVEN_API = "https://api.elevenlabs.io/v1"
ELEVEN_VOICE_NAME = "Aaditya"  # "Aaditya - Healthcare Advisor"
ELEVEN_SETTINGS = {"stability": 0.6, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 0.95}


def _eleven(path, body=None):
    req = urllib.request.Request(
        ELEVEN_API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def eleven_voice_id():
    vid = os.environ.get("ELEVENLABS_VOICE_ID")
    if vid:
        return vid
    voices = json.loads(_eleven("/voices"))["voices"]
    hits = [v for v in voices if ELEVEN_VOICE_NAME.lower() in v["name"].lower()]
    if not hits:
        raise SystemExit(
            f'Voice "{ELEVEN_VOICE_NAME}" not in this ElevenLabs account. Add "Aaditya - Healthcare Advisor" '
            "from the Voice Library to My Voices, or set ELEVENLABS_VOICE_ID."
        )
    print("ElevenLabs voice:", hits[0]["name"], hits[0]["voice_id"])
    return hits[0]["voice_id"]


def make_synth():
    provider = os.environ.get("VO_PROVIDER") or ("elevenlabs" if os.environ.get("ELEVENLABS_API_KEY") else "kokoro")
    if provider == "elevenlabs":
        vid = eleven_voice_id()
        texts = [it[1] for it in SCRIPT if it[0] not in ("scene", "end")]

        def synth(text):
            i = texts.index(text)
            pcm = _eleven(
                f"/text-to-speech/{vid}?output_format=pcm_44100",
                {
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "language_code": "en",
                    "voice_settings": ELEVEN_SETTINGS,
                    "previous_text": texts[i - 1] if i else None,
                    "next_text": texts[i + 1] if i + 1 < len(texts) else None,
                },
            )
            a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
            return resample_poly(a, SR_OUT, 44100).astype(np.float32)

        return provider, synth
    k = Kokoro(MODEL, VOICES)
    voice = 0.5 * k.get_voice_style("hm_omega") + 0.5 * k.get_voice_style("hm_psi")

    def synth(text):
        audio, sr = k.create(phonemes_for(k, text), voice=voice, speed=SPEED, is_phonemes=True)
        return resample_poly(audio, SR_OUT, sr).astype(np.float32)

    return "kokoro", synth


def script_words(text):
    return re.sub(r"[^A-Z0-9' ]", " ", text.upper().replace("-", " ")).split()


def align(text, asr_words, dur):
    """Give every script word a time: matched ASR words keep theirs, the rest interpolate."""
    sw = script_words(text)
    aw = [w for w, _ in asr_words]
    times = [None] * len(sw)
    for blk in difflib.SequenceMatcher(a=sw, b=aw, autojunk=False).get_matching_blocks():
        for j in range(blk.size):
            times[blk.a + j] = asr_words[blk.b + j][1]
    known = [(i, tm) for i, tm in enumerate(times) if tm is not None] or [(0, 0.0)]
    xs, ys = zip(*([(-1, 0.0)] + known + [(len(sw), dur)]))
    return [(w, float(times[i] if times[i] is not None else np.interp(i, xs, ys))) for i, w in enumerate(sw)]


def main():
    provider, synth = make_synth()
    print("VO provider:", provider)
    sys.path.insert(0, os.path.dirname(__file__))
    from asr import transcribe  # local sherpa-onnx transducer

    t = 0.0
    chunks = []
    lines = {}
    scenes = {}
    last_scene = None
    for item in SCRIPT:
        if item[0] == "scene":
            _, sid, lead = item
            t += lead
            if last_scene:
                scenes[last_scene]["end"] = round(t, 3)
            scenes[sid] = {"start": round(t, 3)}
            last_scene = sid
            continue
        if item[0] == "end":
            t += item[2]
            scenes[last_scene]["end"] = round(t, 3)
            continue
        lid, text, gap = item
        t += gap
        audio = synth(text)
        nz = np.where(np.abs(audio) > 0.004)[0]  # trim provider lead/tail silence
        if len(nz):
            audio = audio[max(nz[0] - int(0.03 * SR_OUT), 0) : nz[-1] + int(0.08 * SR_OUT)]
        fade = int(0.012 * SR_OUT)
        audio[:fade] *= np.linspace(0, 1, fade)
        audio[-fade:] *= np.linspace(1, 0, fade)
        dur = len(audio) / SR_OUT
        heard = transcribe(audio, SR_OUT)
        words = align(text, heard, len(audio) / SR_OUT)
        lines[lid] = {
            "text": text,
            "start": round(t, 3),
            "end": round(t + dur, 3),
            "words": [{"w": w, "t": round(t + s, 3)} for w, s in words],
        }
        chunks.append((t, audio))
        print(f"{lid:12s} {t:7.2f}s  +{dur:5.2f}s  asr: {' '.join(w for w, _ in heard)}")
        t += dur

    total = t
    out = np.zeros(int(np.ceil(total * SR_OUT)) + SR_OUT, dtype=np.float32)
    for start, a in chunks:
        i = int(round(start * SR_OUT))
        out[i : i + len(a)] += a
    out = out[: int(np.ceil(total * SR_OUT))]
    peak = np.abs(out).max()
    out *= 0.89 / peak  # ~-1 dBFS peak; loudness set in the final mix
    os.makedirs(os.path.join(ROOT, "assets/audio"), exist_ok=True)
    sf.write(os.path.join(ROOT, "assets/audio/narration.wav"), out, SR_OUT, subtype="PCM_16")

    timing = {"total": round(total, 3), "provider": provider, "scenes": scenes, "lines": lines}
    with open(os.path.join(ROOT, "build/vo-timing.json"), "w") as f:
        json.dump(timing, f, indent=1)
    with open(os.path.join(ROOT, "scripts/vo-timing.js"), "w") as f:
        f.write("// Generated by build/voiceover.py - do not edit by hand.\n")
        f.write("window.VO = " + json.dumps(timing) + ";\n")
    spoken = sum(len(v["text"].split()) for v in lines.values())
    speech = sum(v["end"] - v["start"] for v in lines.values())
    print(f"total {total:.2f}s  speech {speech:.1f}s  ~{spoken / speech * 60:.0f} wpm")


if __name__ == "__main__":
    main()
