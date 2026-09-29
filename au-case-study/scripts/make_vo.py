"""Synthesize the voiceover line-by-line with Kokoro (hm_omega, en-gb) and write
exact per-line timings for subtitles.

Usage: python3 scripts/make_vo.py hm_omega en-gb 1.28 assets/audio/vo.wav
"""

import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/root/.cache/hyperframes/tts/models/kokoro-v1.0.onnx", "/root/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG, SPEED = sys.argv[1], sys.argv[2], float(sys.argv[3])
# (display subtitle, spoken text, pause AFTER in seconds)
cues = [
 ("AU Small Finance Bank faced a scale problem.", "A U Small Finance Bank faced a scale problem.", 0.35),
 ("Lakhs of rejected and cross-sell leads had potential —", "Laakhs of rejected and cross-sell leads had potential,", 0.1),
 ("but manually calling, qualifying and following up with every customer wasn’t practical.", "but manually calling, qualifying and following up with every customer wasn't practical.", 0.35),
 ("So they deployed DoubleTick AI Voice.", "So they deployed Double Tick A I Voice.", 0.35),
 ("AI automatically re-engaged customers, understood their requirements,", "A I automatically re-engaged customers, understood their requirements,", 0.06),
 ("classified intent and surfaced qualified opportunities for the sales team.", "classified intent and surfaced qualified opportunities for the sales team.", 0.35),
 ("At scale, this delivered:", "At scale, this delivered:", 0.22),
 ("3.12 lakh+ AI calls,", "three point one two laakh plus A I calls,", 0.25),
 ("5,000+ qualified leads,", "five thousand plus, qualified leads,", 0.22),
 ("and 1,726 recovered Gold Loan opportunities.", "and seventeen hundred and twenty-six recovered Gold Loan opportunities.", 0.4),
 ("From unworked leads to sales-ready conversations —", "From unworked leads to sales-ready conversations.", 0.1),
 ("powered by DoubleTick.", "Powered by Double Tick.", 0.0),
]
LEAD = 0.35
out, t, meta, sr = [np.zeros(int(LEAD*24000), dtype=np.float32)], LEAD, [], 24000
for disp, spoken, gap in cues:
    s, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang=LANG)
    a = np.abs(s); thr = 0.01
    idx = np.where(a > thr)[0]
    s = s[max(0, idx[0]-int(0.02*sr)): min(len(s), idx[-1]+int(0.06*sr))]
    # compress internal comma pauses to natural breath gaps
    w=int(0.01*sr); env=np.array([np.abs(s[i:i+w]).max() for i in range(0,len(s),w)])
    keep=[]; run=0
    for i,v in enumerate(env):
        if v<0.008:
            run+=1
            if run>16: continue   # cap any silent run at 160ms
        else: run=0
        keep.append(s[i*w:(i+1)*w])
    s=np.concatenate(keep)
    d = len(s)/sr
    meta.append({"text": disp, "start": round(t,3), "end": round(t+d,3)})
    out += [s, np.zeros(int(gap*sr), dtype=np.float32)]
    t += d + gap
y = np.concatenate(out)
sf.write(sys.argv[4], y, sr)
json.dump(meta, open(sys.argv[4].replace('.wav','.json'),'w'), indent=1, ensure_ascii=False)
print("total", round(len(y)/sr,2))
for m in meta: print(m)
