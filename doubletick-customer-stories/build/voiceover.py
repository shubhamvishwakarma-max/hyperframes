"""Build the narration track + timing map.

Narration copy is taken from the customers_carousels source doc (see
scripts/customer-data.js). Voiceover-only wording: "RM" is spoken as
"relationship manager"; on-screen text keeps "RM".

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
    ("hook-sub", "See how BFSI leaders are turning conversations into measurable outcomes.", 0.75),
    ("scene", "s02", 1.0),
    ("au-name", "A U Small Finance Bank.", 0.0),
    ("au-problem", "Manual calling couldn't scale across lakhs of leads, creating missed revenue opportunities.", 0.4),
    ("au-solution", "DoubleTick combined AI Voice with relationship manager mapping to re-engage leads and route conversations to the right relationship manager.", 0.65),
    ("scene", "s03", 5.2),
    ("pf-name", "Piramal Finance.", 0.0),
    ("pf-problem", "Manual outreach was slowing conversations across the loan lifecycle.", 0.4),
    ("pf-solution", "DoubleTick AI Voice automates outreach across follow-ups, partners and collections, escalating only the conversations that need a relationship manager.", 0.65),
    ("scene", "s04", 4.6),
    ("ww-name", "Wint Wealth.", 0.0),
    ("ww-problem", "Personalized wealth conversations were becoming harder to govern.", 0.4),
    ("ww-solution", "DoubleTick gives Wint Wealth centralized oversight across relationship manager-led WhatsApp conversations, without managers manually reading every chat.", 0.65),
    ("scene", "s05", 4.6),
    ("cd-name", "CoinDCX.", 0.0),
    ("cd-problem", "More WhatsApp journeys created more blind spots across teams.", 0.4),
    ("cd-solution", "DoubleTick brings Sales, VIP and Sub-Broker conversations onto one governed WhatsApp layer with centralized visibility and analytics.", 0.65),
    ("scene", "s06", 4.4),
    ("sc-name", "Samar Capital.", 0.0),
    ("sc-problem", "Relationship manager conversations needed independence without losing enterprise control.", 0.4),
    ("sc-solution", "DoubleTick gives every relationship manager a governed business number with role-based access, while keeping supervisors in control.", 0.65),
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


TAKES_DIR = os.path.join(ROOT, "build/vo-takes")
WPM_MIN, WPM_MAX = 157.0, 163.0  # fitted on speech span; lands 150-165 with edge padding


def load_take(lid):
    """Decode a pre-generated ElevenLabs take (build/vo-takes/<id>.mp3)."""
    import subprocess

    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(TAKES_DIR, lid + ".mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR_OUT), "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def tighten_pauses(audio, max_gap=0.2, keep=0.16):
    """Shorten internal silences longer than max_gap to `keep` seconds (10 ms crossfades)."""
    win = int(0.01 * SR_OUT)
    n = len(audio) // win
    rms = np.sqrt((audio[: n * win].reshape(n, win) ** 2).mean(1))
    quiet = rms < max(0.006, rms.max() * 0.03)
    out, i, last = [], 0, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * win > max_gap * SR_OUT and i > 0 and j < n:
                half = int(keep * SR_OUT / 2)
                out.append(audio[last : i * win + half])
                last = j * win - half
            i = j
        else:
            i += 1
    out.append(audio[last:])
    return np.concatenate(out).astype(np.float32)


def fit_pace(audio, text):
    """Pitch-preserving tempo nudge so full sentences land inside WPM_MIN..WPM_MAX."""
    import subprocess

    audio = tighten_pauses(audio)

    words = len(script_words(text))
    if words < 4:  # customer names keep their natural read
        return audio, 1.0
    nz = np.where(np.abs(audio) > 0.004)[0]
    wpm = words / ((nz[-1] - nz[0]) / SR_OUT) * 60
    target = min(max(wpm, WPM_MIN), WPM_MAX)
    tempo = round(target / wpm, 3)
    if abs(tempo - 1) < 0.005:
        return audio, 1.0
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ac", "1", "-ar", str(SR_OUT), "-i", "-", "-af", f"atempo={tempo}", "-f", "f32le", "-"],
        input=audio.astype(np.float32).tobytes(),
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(out, dtype=np.float32).copy(), tempo


def make_synth():
    provider = os.environ.get("VO_PROVIDER") or (
        "takes" if os.path.isdir(TAKES_DIR) else "elevenlabs" if os.environ.get("ELEVENLABS_API_KEY") else "kokoro"
    )
    if provider == "takes":
        return provider, None
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
        tempo = 1.0
        if synth is None:
            audio, tempo = fit_pace(load_take(lid), text)
        else:
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
        wpm = len(script_words(text)) / dur * 60
        print(f"{lid:12s} {t:7.2f}s  +{dur:5.2f}s  {wpm:4.0f}wpm x{tempo}  asr: {' '.join(w for w, _ in heard)}")
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
