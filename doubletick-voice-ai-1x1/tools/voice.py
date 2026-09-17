"""Voiceover + subtitle cues for the DoubleTick Voice AI 35s ad.

The supplied narration is spoken verbatim. Realism comes from three levers the
Kokoro engine exposes rather than from feeding it a raw paragraph:

1. PHONEME INPUT — each sentence is phonemised and the brand / telecom terms
   are overridden with hand-written pronunciations before synthesis
   (`is_phonemes=True`), so DoubleTick, Voice A-I, P-S-T-N and U-A-E land
   correctly. On-screen spelling is never touched.
2. PROSODY — one pass per sentence with its own rate, plus authored clause and
   sentence pauses and authored gaps, so the read has an energy curve.
3. A VOICE CHAIN — EQ, compression and loudness, so it sits like a recorded
   commercial read.

It also emits assets/subtitles.json: phrase-level cues covering the ENTIRE
narration, timed by allocating each sentence's measured duration across its
phrases in proportion to their phoneme length. Paste the array into index.html
(the composition must not fetch at render time).

Usage:  /tmp/ttsvenv/bin/python tools/voice.py
"""
import json, os, re, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.expanduser("~/.cache/hyperframes/tts")
MODEL = os.path.join(CACHE, "models/kokoro-v1.0.onnx")
VOICES = os.path.join(CACHE, "voices/voices-v1.0.bin")
VOICE = os.environ.get("DT_VOICE", "af_heart")
SR = 24000

# ---- pronunciation dictionary (audio layer only) -------------------------
PHON = {
    "DT": "dˈʌbəl tˈɪk",            # Double Tick
    "AI": "ˌeɪˈaɪ",                 # A - I, never "aye"
    "PSTN": "pˈiː ˈɛs tˈiː ˈɛn",    # P - S - T - N
    "UAE": "jˈuː ˈeɪ ˈiː",          # U - A - E
}

# Each sentence: (tts text, speed, gap after).  Each phrase: (subtitle text,
# tts text) — the subtitle keeps the real spelling, the tts text carries the
# pronunciation markers.  Phrases concatenate back to the exact narration.
SCRIPT = {
    "vo1": [
        (1.12, 0.26, [
            ("Taking more than five minutes", "Taking more than five minutes"),
            ("to call a new project lead?", "to call a new project lead?"),
        ]),
        (1.10, 0.00, [
            ("Your competitor might already", "Your competitor might already"),
            ("be talking to them.", "be talking to them."),
        ]),
    ],
    "vo2": [
        (1.12, 0.24, [
            ("In UAE real estate, slow follow-ups", "In {UAE} real estate, slow follow-ups"),
            ("kill launch momentum.", "kill launch momentum."),
        ]),
        (1.10, 0.00, [
            ("High-intent leads", "High intent leads"),
            ("can go cold in minutes.", "can go cold in minutes."),
        ]),
    ],
    "vo3": [
        (1.18, 0.16, [
            ("DoubleTick Voice AI calls every new lead", "{DT} Voice {AI} calls every new lead"),
            ("instantly over PSTN —", "instantly over {PSTN},"),
        ]),
        (1.16, 0.14, [
            ("answers project and", "answers project and"),
            ("payment-plan questions,", "payment plan questions,"),
        ]),
        (1.12, 0.00, [
            ("qualifies their budget, and", "qualifies their budget, and"),
            ("identifies serious investors.", "identifies serious investors."),
        ]),
    ],
    "vo4": [
        (1.16, 0.00, [
            ("Your brokers stop chasing cold numbers", "Your brokers stop chasing cold numbers"),
            ("and step in when qualified buyers", "and step in when qualified buyers"),
            ("are ready to talk.", "are ready to talk."),
        ]),
    ],
    "vo5": [
        (1.16, 0.18, [
            ("Convert more launch leads without", "Convert more launch leads without"),
            ("expanding your sales team.", "expanding your sales team."),
        ]),
        (1.10, 0.00, [
            ("Book your DoubleTick Voice AI", "Book your {DT} Voice {AI}"),
            ("demo today.", "demo today."),
        ]),
    ],
}

# where each voiceover file is placed on the master timeline
VO_START = {"vo1": 0.3, "vo2": 5.95, "vo3": 12.45, "vo4": 23.12, "vo5": 28.3}
BREATH_BEFORE = {("vo3", 0), ("vo5", 0)}

tok = Tokenizer()


def phonemes(text):
    out = []
    for part in re.split(r"(\{[A-Z]+\})", text):
        if not part:
            continue
        if part.startswith("{"):
            out.append(PHON[part[1:-1]])
        else:
            p = tok.phonemize(part, lang="en-us").strip()
            if p:
                out.append(p)
    return re.sub(r"\s+([,.!?])", r"\1", " ".join(out))


def breath(seconds=0.20, level=0.045):
    n = int(seconds * SR)
    w = np.random.default_rng(11).standard_normal(n)
    for f, hp in ((1900, False), (320, True)):
        k = np.exp(-2 * np.pi * f / SR)
        y = np.zeros(n)
        prev = prevx = 0.0
        for i in range(n):
            if hp:
                prev = k * (prev + w[i] - prevx); prevx = w[i]
            else:
                prev = (1 - k) * w[i] + k * prev
            y[i] = prev
        w = y * (1.0 if hp else 3.0)
    env = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return (w / (np.max(np.abs(w)) + 1e-9)) * env * level


def chain(src, dst):
    af = (
        "highpass=f=85,"
        "equalizer=f=380:t=q:w=1.1:g=-2,"
        "equalizer=f=180:t=q:w=1.0:g=1.5,"
        "equalizer=f=3200:t=q:w=1.4:g=2.5,"
        "equalizer=f=7600:t=q:w=1.6:g=1.2,"
        "acompressor=threshold=-18dB:ratio=3:attack=12:release=180:makeup=2,"
        "loudnorm=I=-15:TP=-1.5:LRA=7"
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", "48000", dst], check=True)


def main():
    k = Kokoro(MODEL, VOICES)
    out_dir = os.path.join(ROOT, "assets", "audio")
    cues, total = [], 0.0

    for key, sentences in SCRIPT.items():
        pieces, cursor = [], 0.0
        for si, (speed, gap, phrases) in enumerate(sentences):
            if (key, si) in BREATH_BEFORE:
                b = breath()
                pieces.append(b)
                cursor += len(b) / SR

            ph_parts = [phonemes(t) for _, t in phrases]
            audio, sr = k.create(
                " ".join(ph_parts), voice=VOICE, speed=speed, is_phonemes=True,
                trim=True, sentence_pause=0.18, clause_pause=0.16,
            )
            dur = len(audio) / sr

            # split the measured duration across phrases by phoneme length
            weights = [max(1, len(re.sub(r"[ˈˌ ]", "", p))) for p in ph_parts]
            span = sum(weights)
            at = cursor
            for (sub_text, _), w in zip(phrases, weights):
                seg = dur * w / span
                cues.append({
                    "g": key + "/" + str(si),
                    "t": round(VO_START[key] + at, 2),
                    "d": round(seg, 2),
                    "text": sub_text,
                })
                at += seg

            pieces.append(audio)
            cursor += dur
            if gap:
                pieces.append(np.zeros(int(gap * sr)))
                cursor += gap

        y = np.concatenate(pieces).astype(np.float32)
        raw = os.path.join(tempfile.gettempdir(), key + ".raw.wav")
        sf.write(raw, y, SR, subtype="PCM_16")
        chain(raw, os.path.join(out_dir, key + ".wav"))
        print("%s  start %5.2f  dur %5.2f  end %5.2f" % (key, VO_START[key], cursor, VO_START[key] + cursor))
        total += cursor

    # merge into two-line cards, never spanning two spoken sentences
    cards = []
    i = 0
    while i < len(cues):
        pair = [cues[i]]
        if i + 1 < len(cues) and cues[i + 1]["g"] == cues[i]["g"]:
            pair.append(cues[i + 1])
        cards.append({
            "t": pair[0]["t"],
            "d": round(sum(c["d"] for c in pair), 2),
            "l1": pair[0]["text"],
            "l2": pair[1]["text"] if len(pair) > 1 else "",
        })
        i += len(pair)
    with open(os.path.join(ROOT, "assets", "subtitles.json"), "w") as f:
        json.dump(cards, f, indent=2)
    print("speech total %.2fs   %d subtitle cards" % (total, len(cards)))


if __name__ == "__main__":
    main()
