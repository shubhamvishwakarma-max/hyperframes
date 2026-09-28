import numpy as np, scipy.io.wavfile as w, json, sys
sr, x = w.read(sys.argv[1]); x = x.astype(np.float32)/32768
sil = json.loads(sys.argv[3])
out=[]; pos=0; n=0
for s,e in sil:
    d=e-s
    keep = 0.30 if d>0.6 else min(d,0.2)
    sI,eI=int(s*sr),int(e*sr)
    out.append(x[pos:sI]); k=int(keep*sr); h=k//2
    out.append(x[sI:sI+h]); out.append(x[eI-(k-h):eI]); pos=eI
out.append(x[pos:])
y=np.concatenate(out)
w.write(sys.argv[2], sr, (np.clip(y,-1,1)*32767).astype(np.int16))
print(len(y)/sr)
