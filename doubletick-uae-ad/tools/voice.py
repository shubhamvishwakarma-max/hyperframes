"""Voiceover generator for the DoubleTick UAE ad.

Speaks the supplied script verbatim. Realism comes from three levers the
Kokoro engine exposes, rather than from feeding it a raw paragraph:

1. PHONEME INPUT — every line is converted to phonemes and the brand /
   telecom terms are overridden with hand-written pronunciations before
   synthesis (`is_phonemes=True`). This is what makes U-A-E, P-S-T-N, A-I and
   DoubleTick land correctly. It never touches on-screen spelling.
2. PROSODY — one pass per sentence with its own speech rate, plus authored
   clause/sentence pauses and authored gaps between sentences, so the energy
   curve rises and falls instead of flat-lining.
3. A VOICE CHAIN — high-pass, warmth and presence EQ, gentle compression and
   loudness, so the take sits like a recorded commercial read rather than a
   dry synthesis dump.

Usage:  /tmp/ttsvenv/bin/python tools/voice.py
"""
import os, re, subprocess, sys, tempfile
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
    "UAE": "jˈuː ˈeɪ ˈiː",          # U - A - E, three letters
    "PSTN": "pˈiː ˈɛs tˈiː ˈɛn",    # P - S - T - N, four letters
    "AI": "ˌeɪˈaɪ",                 # A - I, never "aye"
    "DT": "dˈʌbəl tˈɪk",            # Double Tick
}

# (text, speed, gap after in seconds).  Ellipses are written as commas so the
# engine gives a breath-length beat instead of a dead stop.
SCRIPT = {
    "vo1": [
        ("If your sales team takes more than five minutes to call a new project lead,", 1.00, 0.30),
        ("you didn't lose an investor.", 0.96, 0.24),
        ("You just handed millions in off plan revenue, directly to your rival developer.", 1.00, 0.00),
    ],
    "vo2": [
        ("In the {UAE}, slow follow-ups kill launch inventory.", 1.00, 0.26),
        ("While your brokers are manually dialing through spreadsheets, thousands of high intent leads are sitting cold.", 1.05, 0.00),
    ],
    "vo3": [
        ("{DT} {AI} Calling changes that, instantly.", 0.97, 0.28),
        ("The second a lead registers for your new launch, {DT} dials them over direct {PSTN} lines,", 1.06, 0.20),
        ("talking naturally,", 1.00, 0.16),
        ("answering complex payment plan questions,", 1.02, 0.16),
        ("and vetting budget, on the spot.", 0.97, 0.00),
    ],
    "vo4": [
        ("No robotic delays.", 0.97, 0.22),
        ("No missed leads.", 0.95, 0.28),
        ("Your brokers stop chasing unverified phone numbers, and step in only to close live transfers with fully qualified investors.", 1.03, 0.00),
    ],
    "vo5": [
        ("Sell out your next development in record time,", 1.00, 0.20),
        ("without expanding your sales team.", 0.97, 0.26),
        ("Book your {DT} Voice {AI} demo today.", 0.97, 0.00),
    ],
}

# a soft inhale ahead of the two biggest sentence starts — air, not a gasp
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
    # keep punctuation glued to the preceding phoneme so the beat lands there
    return re.sub(r"\s+([,.!?])", r"\1", " ".join(out))


def breath(seconds=0.20, level=0.045):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    w = np.random.default_rng(11).standard_normal(n)
    # crude band-pass 320 - 1900 Hz
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
    """Commercial voice chain: cleanup, warmth, presence, control, loudness."""
    af = (
        "highpass=f=85,"
        "equalizer=f=380:t=q:w=1.1:g=-2,"      # take out the boxiness
        "equalizer=f=180:t=q:w=1.0:g=1.5,"     # chest / warmth
        "equalizer=f=3200:t=q:w=1.4:g=2.5,"    # articulation without hardness
        "equalizer=f=7600:t=q:w=1.6:g=1.2,"    # air
        "acompressor=threshold=-18dB:ratio=3:attack=12:release=180:makeup=2,"
        "loudnorm=I=-15:TP=-1.5:LRA=7"
    )
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", "48000", dst],
        check=True,
    )


def main():
    k = Kokoro(MODEL, VOICES)
    out_dir = os.path.join(ROOT, "assets", "audio")
    report = []
    for key, sentences in SCRIPT.items():
        pieces, marks, cursor = [], [], 0.0
        for i, (text, speed, gap) in enumerate(sentences):
            if (key, i) in BREATH_BEFORE:
                b = breath()
                pieces.append(b)
                cursor += len(b) / SR
            audio, sr = k.create(
                phonemes(text),
                voice=VOICE,
                speed=speed,
                is_phonemes=True,
                trim=True,
                sentence_pause=0.18,
                clause_pause=0.16,
            )
            assert sr == SR, sr
            marks.append((round(cursor, 3), text))
            pieces.append(audio)
            cursor += len(audio) / sr
            if gap:
                pieces.append(np.zeros(int(gap * sr)))
                cursor += gap
        y = np.concatenate(pieces).astype(np.float32)
        raw = os.path.join(tempfile.gettempdir(), key + ".raw.wav")
        sf.write(raw, y, SR, subtype="PCM_16")
        chain(raw, os.path.join(out_dir, key + ".wav"))
        report.append((key, round(len(y) / SR, 2), marks))

    total = 0.0
    for key, dur, marks in report:
        total += dur
        print("%s  %5.2fs" % (key, dur))
        for at, text in marks:
            print("      +%-6.2f %s" % (at, text[:74]))
    print("TOTAL SPEECH %.2fs" % total)


if __name__ == "__main__":
    main()
