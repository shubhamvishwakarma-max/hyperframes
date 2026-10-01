import cv2, numpy as np, math
B=lambda f: cv2.imread(f'clean/c{f-97+1:03d}.png').astype(np.float32)   # clean plate, source frame index f (97..167)
F167=cv2.imread('frames/f168.png').astype(np.float32)
B167=B(167)
a=cv2.imread('pii-title/renders/orig5/frame_000071.png',cv2.IMREAD_UNCHANGED)[...,3:4].astype(np.float32)/255.
N=48
for j in range(1,N+1):
    s=167-20*(1-math.cos(math.pi*j/N))      # glow time eases back and settles (never freezes, never jumps)
    f0=int(math.floor(s)); fr=s-f0
    bg=B(f0) if fr<1e-6 else B(f0)*(1-fr)+B(min(f0+1,167))*fr
    out=F167+(bg-B167)*(1-a)                  # keep the source's own text pixels; only the background under/around it changes
    cv2.imwrite(f'v2/ext/f{167+j+1:03d}.png',np.clip(out+0.5,0,255).astype(np.uint8))
print('ok')
