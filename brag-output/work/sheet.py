import sys
from PIL import Image, ImageDraw
fs=sys.argv[2:]; n=len(fs); cols=3; rows=(n+cols-1)//cols; S=600
out=Image.new('RGB',(cols*S,rows*S),'white'); d=ImageDraw.Draw(out)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((S,S)); out.paste(im,((i%cols)*S,(i//cols)*S)); d.text(((i%cols)*S+6,(i//cols)*S+4),f.split('/')[-1],fill='red')
out.save(sys.argv[1])
