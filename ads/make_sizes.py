import re, subprocess, sys
S='/tmp/claude-0/-home-user-hyperframes/c336b6f8-c5bd-5e13-9c1e-250811b634fc/scratchpad'
ADS=[('doubletick-team-handoff','index.html','#ui','doubletick-team-handoff'),
     ('doubletick-overdue-followups','index-cx.html','#cx','doubletick-overdue-followups-cx'),
     ('doubletick-pipeline','index-v4-funnel.html','#pb','doubletick-pipeline-v4-funnel')]
B='244,243,236'
def fade(card_top, card_h, cta_top, end_alpha):
    st=max(0.0,(cta_top-60-card_top)/card_h)*100
    return (f'linear-gradient(to bottom, rgba({B},0) 0%, rgba({B},0) {st:.1f}%, rgba({B},0.4) {st+5:.1f}%, '
            f'rgba({B},0.62) {st+18:.1f}%, rgba({B},{end_alpha}) 100%)')
def portrait(src, card, W, H, dy, fb, end_alpha):
    sub_top=int(re.search(r'\.sub \{ position: absolute; top: (\d+)px',src).group(1))
    card_top=452+dy; card_h=H-card_top+2; cta_top=H-fb-62
    css=f'''
  /* ---- size override {W}x{H} ---- */
  html, body, .ad {{ width: {W}px !important; height: {H}px !important; }}
  .logo {{ top: {70+dy}px !important; }}
  .headline {{ top: {158+dy}px !important; }}
  .sub {{ top: {sub_top+dy}px !important; }}
  {card} {{ top: {card_top}px !important; height: {card_h}px !important; }}
  {card}::after {{ background: {fade(card_top,card_h,cta_top,end_alpha)} !important; }}
  .footer {{ bottom: {fb}px !important; }}
'''
    return src.replace('</style>',css+'</style>',1)
def landscape(src, card):
    W,H=1280,628; sc=0.6; ct=60; ch=int((H-ct)/sc)+40
    css=f'''
  /* ---- size override 1280x628 ---- */
  html, body, .ad {{ width: {W}px !important; height: {H}px !important; }}
  .cell, .dot {{ display: none !important; }}
  .logo {{ top: 48px !important; left: 56px !important; height: 30px !important; }}
  .headline {{ top: 104px !important; left: 56px !important; width: 560px !important; font-size: 40px !important; line-height: 1.08 !important; white-space: normal !important; }}
  .sub {{ left: 56px !important; width: 540px !important; font-size: 18px !important; line-height: 1.42 !important; }}
  .footer {{ left: 56px !important; bottom: auto !important; }}
  .cta {{ height: 52px !important; font-size: 20px !important; padding: 0 26px !important; }}
  {card} {{ left: 660px !important; top: {ct}px !important; height: {ch}px !important; transform: scale({sc}); transform-origin: top left; }}
  {card}::after {{ background: linear-gradient(to bottom, rgba({B},0) 0%, rgba({B},0) 62%, rgba({B},0.45) 78%, rgba({B},0.8) 100%) !important; }}
'''
    js='''<script>
document.fonts.ready.then(function(){
  var h=document.querySelector('.headline'), s=document.querySelector('.sub'), f=document.querySelector('.footer');
  var hb=h.offsetTop+h.offsetHeight; s.style.top=(hb+18)+'px';
  var sb=s.offsetTop+s.offsetHeight; f.style.top=(sb+30)+'px';
});
</script>'''
    src=src.replace('</style>',css+'</style>',1)
    return src.replace('</body>',js+'\n</body>',1)

def stories(src, card):
    W,H=1080,1920
    css=f"""
  /* ---- size override 1080x1920 (stories) ---- */
  html, body, .ad {{ width: {W}px !important; height: {H}px !important; }}
  .logo {{ top: 250px !important; height: 46px !important; }}
  .headline {{ top: 336px !important; width: 952px !important; font-size: 72px !important; line-height: 1.06 !important; white-space: normal !important; text-wrap: balance; }}
  .headline br + .red {{ display: block; text-wrap: balance; }}
  .sub {{ width: 952px !important; font-size: 31px !important; line-height: 1.4 !important; text-wrap: pretty; }}
  .footer {{ bottom: auto !important; }}
  .cta {{ height: 76px !important; font-size: 29px !important; padding: 0 38px !important; }}
  {card} {{ height: 1200px !important; }}
  {card}::after {{ background: linear-gradient(to bottom, rgba({B},0) 0%, rgba({B},0) 50%, rgba({B},0.45) 60%, rgba({B},0.75) 72%, rgba({B},0.95) 100%) !important; }}
"""
    js="""<script>
document.fonts.ready.then(function(){
  var h=document.querySelector('.headline'), s=document.querySelector('.sub'), f=document.querySelector('.footer'), c=document.querySelector('CARD');
  s.style.top=(h.offsetTop+h.offsetHeight+30)+'px';
  f.style.top=(s.offsetTop+s.offsetHeight+44)+'px';
  var ct=f.offsetTop+f.offsetHeight+60; c.style.setProperty('top',ct+'px','important'); c.style.setProperty('height',(1920-ct+2)+'px','important');
});
</script>""".replace('CARD',card)
    return src.replace('</style>',css+'</style>',1).replace('</body>',js+'\n</body>',1)
def landscape2(src, card):
    W,H=1280,628; sc=0.7; ct=56; ch=int((H-ct)/sc)+40
    css=f"""
  /* ---- size override 1280x628 ---- */
  html, body, .ad {{ width: {W}px !important; height: {H}px !important; }}
  .cell, .dot {{ display: none !important; }}
  .logo {{ top: 44px !important; left: 56px !important; height: 30px !important; }}
  .headline {{ left: 56px !important; width: 530px !important; font-size: 38px !important; line-height: 1.08 !important; white-space: normal !important; text-wrap: balance; }}
  .headline br + .red {{ display: block; text-wrap: balance; }}
  .sub {{ left: 56px !important; width: 520px !important; font-size: 18px !important; line-height: 1.45 !important; text-wrap: pretty; }}
  .footer {{ left: 56px !important; bottom: auto !important; }}
  .cta {{ height: 52px !important; font-size: 20px !important; padding: 0 26px !important; }}
  {card} {{ left: 628px !important; top: {ct}px !important; height: {ch}px !important; transform: scale({sc}); transform-origin: top left; }}
  {card}::after {{ background: linear-gradient(to bottom, rgba({B},0) 0%, rgba({B},0) 58%, rgba({B},0.5) 76%, rgba({B},0.85) 100%) !important; }}
"""
    js="""<script>
document.fonts.ready.then(function(){
  var h=document.querySelector('.headline'), s=document.querySelector('.sub'), f=document.querySelector('.footer');
  var gap1=18, gap2=30, total=h.offsetHeight+gap1+s.offsetHeight+gap2+f.offsetHeight;
  var top=Math.max(100, 98+(628-98-40-total)/2);
  h.style.top=top+'px'; s.style.top=(top+h.offsetHeight+gap1)+'px'; f.style.top=(top+h.offsetHeight+gap1+s.offsetHeight+gap2)+'px';
});
</script>"""
    return src.replace('</style>',css+'</style>',1).replace('</body>',js+'\n</body>',1)

SIZES=[('1080x1350',lambda s,c: portrait(s,c,1080,1350,70,190,0.9)),
       ('1080x1920',stories),
       ('1280x628',landscape2)]
root='/home/user/hyperframes/ads'
for folder,html,card,stem in ADS:
    src=open(f'{root}/{folder}/{html}').read()
    for name,fn in SIZES:
        out=f'{root}/{folder}/{html[:-5]}-{name}.html'
        open(out,'w').write(fn(src,card))
        w,h=name.split('x')
        subprocess.run(['node',f'{S}/shot2.js',out,f'{root}/{folder}/{stem}-{name}.png',w,h],check=True)
    print(folder,'ok')
