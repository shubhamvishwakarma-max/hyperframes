import cv2,numpy as np,sys,os
src_dir=sys.argv[1]; out=sys.argv[2]; os.makedirs(out,exist_ok=True)
for k in range(71):
    bg=cv2.imread(f'clean/c{k+1:03d}.png').astype(np.float32)
    r=cv2.imread(f'{src_dir}/frame_{k+1:06d}.png',cv2.IMREAD_UNCHANGED).astype(np.float32)
    a=r[...,3:4]/255.
    cv2.imwrite(f'{out}/f{97+k+1:03d}.png',np.clip(r[...,:3]*a+bg*(1-a)+0.5,0,255).astype(np.uint8))
