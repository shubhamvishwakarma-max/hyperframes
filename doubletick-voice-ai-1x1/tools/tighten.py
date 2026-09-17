"""Strip dead air from a Kokoro TTS take: hard-trim head/tail, cap internal
pauses at ~0.14s. Keeps word delivery natural while removing the long gaps the
model inserts at commas and spelled-out letters (U. A. E. / P. S. T. N.)."""
import sys, numpy as np, soundfile as sf


def tighten(src, dst, max_gap=0.20, keep=0.14, thresh_db=-42):
    d, sr = sf.read(src)
    if d.ndim > 1:
        d = d.mean(axis=1)
    win = int(0.01 * sr)
    n = len(d) // win
    db = 20 * np.log10(np.array([np.sqrt(np.mean(d[i * win:(i + 1) * win] ** 2)) + 1e-9 for i in range(n)]))
    loud = db > thresh_db
    out, i = [], 0
    while i < n:
        j = i
        if loud[i]:
            while j < n and loud[j]:
                j += 1
            out.append(d[i * win:j * win])
        else:
            while j < n and not loud[j]:
                j += 1
            gap = (j - i) * win / sr
            keep_s = 0.02 if (i == 0 or j >= n) else (min(gap, keep) if gap > max_gap else gap)
            out.append(np.zeros(int(keep_s * sr)))
        i = j
    y = np.concatenate(out)
    sf.write(dst, y.astype(np.float32), sr, subtype="PCM_16")
    return len(y) / sr


if __name__ == "__main__":
    print(round(tighten(sys.argv[1], sys.argv[2]), 2))
