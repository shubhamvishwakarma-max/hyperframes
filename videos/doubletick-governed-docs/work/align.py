import json, re
from pocketsphinx import Decoder, Config, get_model_path
import os
text = """sensitive documents are already moving through whatsapp the real question is are they governed or sitting on an r m's phone with double tick a i follows up on the bank's verified whatsapp number through chat or voice it tells customers what's pending answers questions captures consent and guides secure document submission documents move directly into the institution's controlled workflow and when human help is needed the r m takes over with the full context double tick apply for free pilot today"""
words = text.split()
mp = get_model_path()
d = Decoder(hmm=os.path.join(mp,'en-us/en-us'), dict=os.path.join(mp,'en-us/cmudict-en-us.dict'), samprate=16000, loglevel="ERROR")
# add missing words
extra = {"whatsapp":"W AA T S AE P","r":"AA R","m's":"EH M Z","m":"EH M","double":"D AH B AH L","tick":"T IH K","a":"EY","i":"AY"}
for w,p in extra.items():
    if d.lookup_word(w) is None:
        d.add_word(w,p,True)
for w in set(words):
    if d.lookup_word(w) is None: print("MISSING",w)
d.set_align_text(" ".join(words))
raw = open('work/vo16k.raw','rb').read()
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
out=[]
for s in d.seg():
    if s.word in ('<s>','</s>','<sil>','(NULL)'): continue
    out.append({"w":s.word,"s":round(s.start_frame/100,3),"e":round((s.end_frame+1)/100,3)})
print(len(out), len(words))
json.dump(out, open('work/align.json','w'), indent=0)
for o in out: print(o)
