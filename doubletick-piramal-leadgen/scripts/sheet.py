import sys
from PIL import Image, ImageDraw
files=sys.argv[2:]; out=sys.argv[1]
W=540; cols=2; rows=(len(files)+1)//2
s=Image.new('RGB',(W*cols,W*rows),'white'); d=ImageDraw.Draw(s)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((W,W)); s.paste(im,((i%cols)*W,(i//cols)*W))
    d.text(((i%cols)*W+6,(i//cols)*W+4),f.split('/')[-1],fill=(255,0,0))
s.save(out)
