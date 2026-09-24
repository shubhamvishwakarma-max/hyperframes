"""Conform cached ElevenLabs clips onto the picture-locked Axis Bank x DoubleTick timeline.

Steps per clip: trim edge silence -> tighten over-long internal pauses (only if the
line overruns its slot) -> gentle time-compression capped at MAX_TEMPO (only if still
over) -> light voice processing -> place at the original line's start, pushed later
only if the previous line hasn't finished + a breathing gap.

Never calls ElevenLabs; it only reads audio/**.mp3, so re-running is free.
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

FF = sys.argv[1] if len(sys.argv) > 1 else "ffmpeg"
ROOT = Path(__file__).parent
WORK = ROOT / "work"
SR = 48000
VIDEO_END = 194.67
END_PAD = 0.35  # keep the last word clear of the final frame
GAP = 0.25  # breathing room between speakers (150-350 ms target)
MAX_PAUSE = 0.36  # pauses longer than this get shortened when a line overruns
MAX_TEMPO = 1.10  # hard cap on time-compression

# Per-speaker processing: HPF, gentle EQ, light compression, soft de-ess.
VOICE_CHAIN = (
    "highpass=f=75,"
    "equalizer=f=250:t=q:w=1.2:g=-1.5,"
    "equalizer=f=3200:t=q:w=1.0:g=1.0,"
    "deesser=i=0.3,"
    "acompressor=threshold=-20dB:ratio=2.2:attack=8:release=120:makeup=1.5"
)


def run(args):
    subprocess.run([FF, "-v", "error", "-y", *args], check=True)


def load(path):
    raw = subprocess.run(
        [FF, "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def save(path, x):
    subprocess.run(
        [FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(path)],
        input=x.astype(np.float32).tobytes(),
        check=True,
    )


def tighten_pauses(x, max_pause):
    """Shorten silent stretches longer than max_pause, crossfading the cut."""
    win = int(0.01 * SR)
    frames = len(x) // win
    rms = np.sqrt(np.mean(x[: frames * win].reshape(frames, win) ** 2, axis=1) + 1e-12)
    silent = 20 * np.log10(rms) < -42
    out, i, cursor = [], 0, 0
    fade = int(0.015 * SR)
    while i < frames:
        if silent[i]:
            j = i
            while j < frames and silent[j]:
                j += 1
            length = (j - i) * win / SR
            if length > max_pause and i > 0 and j < frames:
                keep = int(max_pause * SR)
                a, b = i * win, j * win
                head = a + keep // 2
                tail = b - keep // 2
                out.append(x[cursor:head])
                cursor = tail
            i = j
        else:
            i += 1
    out.append(x[cursor:])
    y = np.concatenate(out)
    # tiny fades at the joins are unnecessary: cuts land inside silence
    _ = fade
    return y


def main():
    cues = json.loads((ROOT / "cues.json").read_text())
    WORK.mkdir(exist_ok=True)
    timeline = np.zeros(int((VIDEO_END + 1) * SR), dtype=np.float32)
    report = []
    prev_end = 0.0
    for idx, (name, cue) in enumerate(cues):
        base = name.split("/")[1]
        trimmed = WORK / f"{base}_trim.wav"
        run(
            [
                "-i", str(ROOT / "audio" / f"{name}.mp3"),
                "-af",
                "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,"
                "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,"
                + VOICE_CHAIN,
                "-ar", str(SR), "-ac", "1", str(trimmed),
            ]
        )
        x = load(trimmed)
        start = max(cue, prev_end + GAP) if idx else cue
        nxt = cues[idx + 1][1] if idx + 1 < len(cues) else VIDEO_END - END_PAD + GAP
        avail = nxt - GAP - start
        raw_dur = len(x) / SR
        steps = []
        if raw_dur > avail:
            x = tighten_pauses(x, MAX_PAUSE)
            steps.append(f"pauses {raw_dur:.2f}->{len(x) / SR:.2f}s")
        dur = len(x) / SR
        tempo = 1.0
        if dur > avail:
            tempo = min(MAX_TEMPO, dur / avail)
            src, dst = WORK / f"{base}_p.wav", WORK / f"{base}_t.wav"
            save(src, x)
            run(["-i", str(src), "-af", f"atempo={tempo:.4f}", str(dst)])
            x = load(dst)
            steps.append(f"tempo x{tempo:.3f}")
        dur = len(x) / SR
        s = int(start * SR)
        timeline[s : s + len(x)] += x
        end = start + dur
        overflow = end - (nxt - GAP)
        report.append(
            {
                "clip": name,
                "orig_start": cue,
                "new_start": round(start, 3),
                "shift": round(start - cue, 3),
                "end": round(end, 3),
                "dur": round(dur, 3),
                "tempo": round(tempo, 3),
                "steps": steps,
                "spill_into_next_gap": round(max(0.0, overflow), 3),
            }
        )
        prev_end = end
    save(WORK / "dialogue_raw.wav", timeline[: int(VIDEO_END * SR)])
    (ROOT / "timeline_report.json").write_text(json.dumps(report, indent=1))
    for r in report:
        print(
            f"{r['clip']:24s} {r['orig_start']:7.2f} -> {r['new_start']:7.2f} "
            f"(shift {r['shift']:+.2f}) end {r['end']:7.2f} tempo {r['tempo']:.3f} "
            f"spill {r['spill_into_next_gap']:.2f} {'; '.join(r['steps'])}"
        )


if __name__ == "__main__":
    main()
