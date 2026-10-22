import numpy as np, wave, sys
SR=48000; DUR=42.5; N=int(SR*DUR)
rng=np.random.default_rng(7)
def write(path,x):
    x=np.clip(x,-1,1); d=(x*32767).astype(np.int16)
    with wave.open(path,'wb') as w:
        w.setnchannels(2 if x.ndim==2 else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
def hz(m): return 440*2**((m-69)/12)
def add(buf,sig,t0,gain=1.0,pan=0.0):
    i=int(t0*SR); 
    if i>=len(buf): return
    j=min(len(buf),i+len(sig)); s=sig[:j-i]*gain
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    buf[i:j,0]+=s*l*1.414/2*1.414; buf[i:j,1]+=s*r*1.414/2*1.414
def env(n,a,r,shape=1.0):
    t=np.arange(n)/SR; e=np.minimum(1,t/max(a,1e-4))*np.exp(-t/max(r,1e-4)); return e
def tone(f,d,harm=((1,1),),a=0.005,r=0.3,det=0.0):
    n=int(d*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for k,(h,g) in enumerate(harm):
        rr=r/(1+0.6*(h-1))
        s+=g*np.sin(2*np.pi*f*h*t*(1+det*(k%2*2-1)))*np.exp(-t/rr)
    return s*np.minimum(1,t/a)
def smooth(x,k):
    if k<=1: return x
    c=np.cumsum(np.concatenate([[0],x])); y=(c[k:]-c[:-k])/k
    return np.concatenate([y,np.zeros(k-1)])
def lp(x,k): return smooth(smooth(x,k),k)
def hp(x,k): return x-lp(x,k)

beat=60/112; bar=4*beat; OFF=-bar/2  # bar k starts at OFF+k*bar ; bar 5 starts at 9.643
def bt(k,b=0): return OFF+k*bar+b*beat
music=np.zeros((N,2)); sfx=np.zeros((N,2))

# chords (midi)
D=[50,54,57,62,66]; A=[45,52,57,61,64]; Bm=[47,54,59,62,66]; G=[43,50,55,59,62]
def pad(ch,t0,d,g=0.06,bright=1.0):
    n=int(d*SR); t=np.arange(n)/SR
    s=np.zeros(n)
    for m in ch[1:]:
        f=hz(m)
        for det in (-0.0025,0.0025):
            s+=np.sin(2*np.pi*f*(1+det)*t)+0.25*bright*np.sin(2*np.pi*2*f*(1+det)*t)+0.08*bright*np.sin(2*np.pi*3*f*t)
    a=np.minimum(1,t/0.35); rel=np.minimum(1,(d-t)/0.4); s*=a*np.clip(rel,0,1)*g/len(ch)
    add(music,s,t0,1.0,0)
def pluck(m,t0,g=0.05,pan=0.0,r=0.35):
    s=tone(hz(m),r*3,((1,1),(2,0.35),(3,0.12),(4,0.05)),a=0.002,r=r); add(music,s,t0,g,pan)
def kick(t0,g=0.5):
    n=int(0.45*SR); t=np.arange(n)/SR; f=45+75*np.exp(-t/0.035); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t/0.16)*np.minimum(1,t/0.002); add(music,s,t0,g)
def hat(t0,g=0.05,pan=0.2):
    n=int(0.06*SR); s=hp(rng.standard_normal(n),3)*np.exp(-np.arange(n)/SR/0.018); add(music,s,t0,g,pan)
def clap(t0,g=0.09):
    n=int(0.2*SR); x=rng.standard_normal(n); s=hp(lp(x,3),12)*np.exp(-np.arange(n)/SR/0.06); add(music,s,t0,g,0)
def bass(m,t0,d,g=0.16):
    n=int(d*SR); t=np.arange(n)/SR; f=hz(m)
    s=(np.sin(2*np.pi*f*t)+0.3*np.sin(2*np.pi*2*f*t))*np.minimum(1,t/0.005)*np.exp(-t/0.25)*np.clip((d-t)/0.03,0,1); add(music,s,t0,g)

# --- Section A: problem (0 - 9.643) bars 0..4 (bar0 starts -1.07)
progA=[Bm,G,Bm,G,Bm]
for k in range(5):
    t0=max(0,bt(k)); pad(progA[k],t0,bt(k+1)-t0+0.3,g=0.05,bright=0.6)
    ch=progA[k]; arp=[ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+12]
    for b in range(8):
        tt=bt(k,b*0.5)
        if tt<0.05: continue
        pluck(arp[b%4],tt,g=0.022+0.01*(k>=2),pan=(-0.3 if b%2 else 0.3),r=0.22)
    if k>=2:
        for b in range(4): hat(bt(k,b+0.5),g=0.02)
# riser 7.9 -> 9.64
n=int((9.643-7.9)*SR); t=np.arange(n)/SR; x=rng.standard_normal(n)
ris=hp(x,2)*(t/t[-1])**2.2*0.12; ris+=np.sin(2*np.pi*np.cumsum(300+900*(t/t[-1])**2)/SR)*(t/t[-1])**3*0.03
add(sfx,ris,7.9,1.0)

# --- Section B: groove 9.643 - 31.0 (bars 5..14), breakdown at ~31
progB=[D,A,Bm,G]
for k in range(5,15):
    ch=progB[(k-5)%4]; pad(ch,bt(k),bar+0.3,g=0.055,bright=1.0)
    for b in range(4):
        kick(bt(k,b),0.42 if k>5 or b>0 else 0.55)
        hat(bt(k,b+0.5),g=0.035,pan=0.25)
        if b in (1,3) and k>=6: clap(bt(k,b),0.06)
        bass(ch[0],bt(k,b),beat*0.45); bass(ch[0],bt(k,b+0.5),beat*0.4,g=0.11)
    arp=[ch[1]+12,ch[2]+12,ch[3]+12,ch[4]+12,ch[3]+12,ch[2]+12,ch[3]+12,ch[4]+12]
    for b in range(8): pluck(arp[b],bt(k,b*0.5),g=0.026,pan=(-0.35 if b%2 else 0.35),r=0.25)
# bar 15 starts 30.79 -> breakdown: pad only, riser into 31.85
pad(Bm,bt(15),1.4,g=0.05,bright=0.5)
n=int((31.85-30.95)*SR); t=np.arange(n)/SR; add(sfx,hp(rng.standard_normal(n),2)*(t/t[-1])**2.5*0.07,30.95)
# impact 31.85
n=int(1.6*SR); t=np.arange(n)/SR; f=38+50*np.exp(-t/0.06)
boom=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/0.45)*0.55; add(sfx,boom,31.85)
for m in D[1:]: pluck(m+12,31.85,g=0.05,r=0.9)
pad(D,31.85,3.4,g=0.06,bright=0.8)
# section D 31.85-35.2: soft, half-time kick from bar 17
for k in (16,17):
    ch=[D,A][k-16]
    for b in range(8): pluck([ch[1]+24,ch[2]+12,ch[3]+12,ch[2]+12][b%4],bt(k,b*0.5),g=0.018,pan=(-0.3 if b%2 else 0.3),r=0.2)
    if k==17:
        kick(bt(k,0),0.3); kick(bt(k,2),0.3)
        for b in range(4): hat(bt(k,b+0.5),0.025)
pad(A,bt(17),bar,g=0.05)
# section E 35.2 (bar18=35.5) - 40.6 full + lift
for k in range(18,21):
    ch=[Bm,G,A][k-18]; pad(ch,bt(k),bar+0.3,g=0.06,bright=1.1)
    for b in range(4):
        kick(bt(k,b),0.42); hat(bt(k,b+0.5),0.035,0.25); hat(bt(k,b+0.25),0.012,-0.3); hat(bt(k,b+0.75),0.012,-0.3)
        if b in (1,3): clap(bt(k,b),0.06)
        bass(ch[0],bt(k,b),beat*0.45); bass(ch[0],bt(k,b+0.5),beat*0.4,g=0.11)
    arp=[ch[1]+12,ch[2]+12,ch[3]+12,ch[4]+12,ch[3]+24,ch[2]+12,ch[3]+12,ch[4]+12]
    for b in range(8): pluck(arp[b],bt(k,b*0.5),g=0.028,pan=(-0.35 if b%2 else 0.35),r=0.25)
# bar 21 at 41.93; final resolve at 40.6 -> start a D resolve at 40.6
endT=40.6
mask=np.ones(N); i=int(endT*SR); mask[i:]=0
# fade the groove tail into the resolve
fade=int(0.08*SR); mask[i-fade:i]=np.linspace(1,0,fade)
music*=mask[:,None]
pad(D,40.6,1.9,g=0.07,bright=0.9); kick(40.6,0.4); bass(38,40.6,1.2,g=0.18)
for j,m in enumerate([62,66,69,74,78]): pluck(m+12,40.6+j*0.035,g=0.035,pan=-0.4+0.2*j,r=0.9)
# global music fade-out
t=np.arange(N)/SR; music*=np.clip((DUR-t)/0.9,0,1)[:,None]; music*=np.clip(t/0.25,0,1)[:,None]

# ---------------- SFX ----------------
def pop(t0,m=81,g=0.06,pan=0.0):
    s=tone(hz(m),0.25,((1,1),(2,0.2)),a=0.001,r=0.05); s2=tone(hz(m+5),0.2,((1,1),),a=0.001,r=0.04)
    add(sfx,s,t0,g,pan); add(sfx,s2,t0+0.045,g*0.8,pan)
def tick(t0,m=86,g=0.03,pan=0.0):
    add(sfx,tone(hz(m),0.08,((1,1),(3,0.2)),a=0.0005,r=0.012),t0,g,pan)
def snap(t0,g=0.05,pan=0.0):
    n=int(0.05*SR); s=hp(rng.standard_normal(n),2)*np.exp(-np.arange(n)/SR/0.006); add(sfx,s,t0,g,pan); tick(t0,93,g*0.6,pan)
def whoosh(t0,d=0.45,g=0.05,pan=0.0):
    n=int(d*SR); t=np.arange(n)/SR; x=rng.standard_normal(n); e=np.sin(np.pi*t/d)**2
    add(sfx,lp(x,6)*e,t0,g,pan)
def chime(t0,notes=(74,78,81),g=0.045,sp=0.05,r=0.5):
    for j,m in enumerate(notes): add(sfx,tone(hz(m),r*3,((1,1),(2,0.12),(4.01,0.05)),a=0.002,r=r),t0+j*sp,g,-0.2+0.2*j)
whoosh(0.0,0.6,0.035)
for i in range(6): tick(0.0+i*0.09+0.35,[74,78,81,74,78,81][i],0.018,(-0.5,0,0.5)[i%3])
chipNotes=[81,78,83,76,81,85,78,83]
for i in range(8): pop(1.05+i*0.28,chipNotes[i],0.032,(-0.4 if i%2 else 0.4))
whoosh(4.5,0.6,0.04)
for i in range(4): tick(5.4+i*0.18,[71,74,71,74][i],0.025,(-0.4 if i%2==0 else 0.4))
add(sfx,tone(hz(66),0.6,((1,1),(2,0.2)),a=0.003,r=0.12),6.3,0.05); add(sfx,tone(hz(65),0.6,((1,1),),a=0.003,r=0.12),6.42,0.04)
whoosh(9.2,0.45,0.05,-0.5); whoosh(9.2,0.45,0.05,0.5)
snap(9.62,0.06)
chime(9.92,(74,78,81,86),0.05,0.045,0.6)
for j in range(12): tick(10.6+j*0.16+0.75,[86,90,93][j%3],0.014,0)
for i in range(6): tick(12.6+i*0.04+0.7,88,0.012,-0.5+0.2*i)
for i in range(4): snap(13.5+i*0.17+0.12,0.03,0.3)
# count-up shimmer
n=int(1.6*SR); t=np.arange(n)/SR; add(sfx,hp(rng.standard_normal(n),2)*0.01*np.sin(np.pi*t/1.6),13.0)
for i in range(4): tick(16.5+i*0.9,93,0.012)
whoosh(21.45,0.5,0.035)
pop(22.1,81,0.06); tick(22.45,86,0.02); tick(22.55,88,0.02)
snap(23.15,0.05); pop(23.45,86,0.05,0.3)
chime(23.9,(78,81,86),0.045)
for i in range(6): pop(24.8+(0 if i==0 else 0.1+i*0.12),[74,76,78,81,83,86][i],0.028,(-0.4+0.16*i))
add(sfx,boom[:int(0.6*SR)]*0.35,25.6)
whoosh(27.1,0.5,0.03)
whoosh(27.9,0.3,0.03,0.4); pop(28.05,83,0.055,0.35); pop(28.95,78,0.05,-0.3)
chime(29.35,(78,81,85,90),0.05,0.05,0.7)
for i in range(4): tick(35.45+i*0.12,[74,78,81,86][i],0.022,-0.45+0.3*i)
whoosh(35.6,1.3,0.025)
for i in range(4): tick(36.7+i*0.16,[86,88,90,93][i],0.02,-0.45+0.3*i)
whoosh(39.0,0.5,0.035); snap(39.55,0.035)
chime(40.6,(74,78,81,86,90),0.05,0.06,0.9)

# simple stereo room: short multi-tap reflections on sfx
def room(x,taps=((0.023,0.25),(0.041,0.18),(0.067,0.12),(0.11,0.08))):
    y=x.copy()
    for d,g in taps:
        k=int(d*SR); y[k:,0]+=x[:-k,1]*g; y[k:,1]+=x[:-k,0]*g
    return y
sfx=room(sfx); music=room(music,((0.031,0.18),(0.057,0.12),(0.09,0.08)))
write('audio/music.wav',music*0.9); write('audio/sfx.wav',sfx*0.9)
print('peak music',np.abs(music).max(),'sfx',np.abs(sfx).max())
