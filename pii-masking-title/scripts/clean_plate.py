import cv2, numpy as np
F97=cv2.imread('frames/f098.png').astype(np.float32)
def nconv(D,w,s):
    num=cv2.GaussianBlur(D*w[...,None],(0,0),s); den=cv2.GaussianBlur(w,(0,0),s)
    return num, den
import sys
R=int(sys.argv[1]); KS=[int(x) for x in sys.argv[2].split(",")] if len(sys.argv)>2 else range(71)
for k in KS:
    i=97+k
    F=cv2.imread(f'frames/f{i+1:03d}.png').astype(np.float32)
    m=np.zeros((1080,1920),np.uint8)
    for kk in range(max(0,k-1),min(71,k+2)):  # temporal union guards against sub-frame timing drift
        a=cv2.imread(f'composition/renders/orig/frame_{kk+1:06d}.png',cv2.IMREAD_UNCHANGED)[...,3]
        m|=(a>0).astype(np.uint8)
    # source-derived mask: sharp positive detail vs frame 97 (glow is smooth, text is not)
    Dl=(F-F97).mean(2)
    hp=Dl-cv2.GaussianBlur(Dl,(0,0),12)
    ms=((hp>2.5)|(Dl>25)).astype(np.uint8); ms[:420,:]=0
    ms=cv2.morphologyEx(ms,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    m|=ms
    m=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(R,R)))
    hole=m.astype(np.float32)
    w=1-hole
    w[:330,:]=0  # logo pans vs frame 97 — never use it as a glow sample
    D=F-F97
    est=np.zeros_like(F); filled=np.zeros(F.shape[:2],np.float32)
    for s in (6,12,24,48,96):
        num,den=nconv(D,w,s)
        ok=(den>0.05)&(filled==0)
        est[ok]=num[ok]/den[ok,None]; filled[ok]=1
    plate=F97+est
    soft=cv2.GaussianBlur(hole,(0,0),1.5)
    soft=np.maximum(soft,hole)[...,None]
    out=F*(1-soft)+plate*soft
    cv2.imwrite(f'clean/c{k+1:03d}.png',np.clip(out+0.5,0,255).astype(np.uint8))
print('done')
