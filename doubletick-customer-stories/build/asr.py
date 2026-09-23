"""Local ASR (sherpa-onnx zipformer transducer) used only at build time:
QA of the narration and word-level timestamps for keyword -> visual sync."""
import os

import numpy as np
import sherpa_onnx
from scipy.signal import resample_poly

MODEL_DIR = os.environ.get("ASR_MODEL_DIR", "/tmp/asr/sherpa-onnx-zipformer-en-2023-06-26/")
_rec = None


def _recognizer():
    global _rec
    if _rec is None:
        d = MODEL_DIR
        _rec = sherpa_onnx.OfflineRecognizer.from_transducer(
            encoder=d + "encoder-epoch-99-avg-1.int8.onnx",
            decoder=d + "decoder-epoch-99-avg-1.onnx",
            joiner=d + "joiner-epoch-99-avg-1.int8.onnx",
            tokens=d + "tokens.txt",
            num_threads=4,
        )
    return _rec


def transcribe(audio, sr):
    a = resample_poly(audio, 16000, sr).astype(np.float32) if sr != 16000 else audio
    s = _recognizer().create_stream()
    s.accept_waveform(16000, a)
    _recognizer().decode_stream(s)
    words = []
    for tok, ts in zip(s.result.tokens, s.result.timestamps):
        if tok.startswith("▁") or tok.startswith(" ") or not words:
            words.append([tok.lstrip("▁ "), ts])
        else:
            words[-1][0] += tok
    return [(w, float(t)) for w, t in words if w]
