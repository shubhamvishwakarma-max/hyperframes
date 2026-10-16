
import numpy as np, wave
SR=44100; DUR=47.3; N=int(SR*DUR); rng=np.random.default_rng(11)
def t_(d): return np.arange(int(SR * d)) / SR
def place(buf, sig, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def lowpass(x, k):  # moving-average FIR (cheap low-pass)
    return np.convolve(x, np.ones(k) / k, mode="same")
def note(m): return 440.0 * 2 ** ((m - 69) / 12)

def kick(amp=1.0):
    tt = t_(0.32); f = 45 + 85 * np.exp(-tt * 28)
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
def hat(amp=0.25, d=0.05):
    tt = t_(d); n = rng.standard_normal(len(tt)); n = n - lowpass(n, 6)
    return amp * n * np.exp(-tt * 70)
def clap(amp=0.35):
    tt = t_(0.18); n = rng.standard_normal(len(tt)); n = lowpass(n, 3) - lowpass(n, 18)
    return amp * n * np.exp(-tt * 22)
def pad(midis, d, amp=0.08):
    tt = t_(d); s = np.zeros(len(tt))
    for m in midis:
        for det in (-0.12, 0.0, 0.12):
            s += np.sin(2 * np.pi * note(m + det) * tt)
    env = np.minimum(1, tt / 0.35) * np.minimum(1, (d - tt) / 0.4)
    return amp * s / (3 * len(midis)) * env
def bass(m, d, amp=0.22):
    tt = t_(d); f = note(m); s = sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 6))
    s = lowpass(s, 20); env = np.minimum(1, tt / 0.01) * np.exp(-tt * 2.2)
    return amp * s * env

def pop(f=880, d=0.09, amp=0.35):
    tt = t_(d); fr = f * (1 + 0.5 * np.exp(-tt * 60))
    return amp * np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 38)
def blip_down(amp=0.3):
    tt = t_(0.22); fr = 620 * np.exp(-tt * 5)
    return amp * np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.4 * np.exp(-tt * 14)
def whoosh(d=0.6, amp=0.28, up=True):
    tt = t_(d); n = rng.standard_normal(len(tt)); k = 2 + (np.arange(len(tt)) // 2000)
    lp = lowpass(n, 8) - lowpass(n, 40)
    shape = np.sin(np.pi * tt / d) ** 2
    return amp * lp * shape
def tick_s(amp=0.3):
    tt = t_(0.06); s = amp * np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 90); s[:int(0.05*SR)] += pop(1500, 0.05, amp * 0.6); return s
def snap(amp=0.4):
    tt = t_(0.12); body = np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 40)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 300)
    return amp * (0.7 * body + 0.3 * click)
def impact(amp=0.55):
    tt = t_(0.9); f = 38 + 70 * np.exp(-tt * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 120)
    shimmer = sum(np.sin(2 * np.pi * note(m) * tt) for m in (84, 88, 91)) / 3 * np.exp(-tt * 6)
    return amp * (0.8 * boom + 0.25 * click + 0.12 * shimmer)
def chime(amp=0.3):
    tt = t_(1.4); s = sum(np.sin(2 * np.pi * note(m) * tt) * w for m, w in ((72, 1), (79, .7), (84, .5), (88, .35)))
    return amp * s / 2.5 * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.005)

music=np.zeros(N); sfx=np.zeros(N); BEAT=0.5
PROB=[[57,60,64],[53,57,60],[50,53,57],[52,56,59]]   # Am F Dm E (night)
SOL=[[48,55,64],[55,59,62],[57,60,64],[53,57,65]]    # C G Am F
RP=[45,41,38,40]; RS=[36,43,45,41]
P_END=10.0; S_END=43.6
# night: sparse pad + clock-tick hats + soft kick
for b in range(int(P_END/2)):
    place(music,pad(PROB[b%4],2.05,0.06),b*2.0); place(music,bass(RP[b%4],1.9,0.10),b*2.0)
for b in range(int(P_END/BEAT)):
    t0=b*BEAT
    if b%2==0 and t0>=4.4: place(music,kick(0.45),t0)
    place(music,hat(0.05,0.03),t0)
tt=t_(1.2); n=rng.standard_normal(len(tt)); n=n-lowpass(n,4); place(music,0.12*n*(tt/1.2)**2,P_END-1.2)
# day groove
for b in range(int(np.ceil((S_END-P_END)/2))):
    t0=P_END+b*2.0; ch=SOL[b%4]
    place(music,pad([m+12 for m in ch],2.05,0.05),t0); place(music,pad(ch,2.05,0.045),t0)
    for q in range(4):
        if t0+q*BEAT<S_END: place(music,bass(RS[b%4],0.45,0.18),t0+q*BEAT)
for b in range(int((S_END-P_END)/BEAT)):
    t0=P_END+b*BEAT
    if 40.6<=t0<41.1: continue   # tiny breath before the payoff
    place(music,kick(0.72),t0); place(music,hat(0.11),t0+BEAT/2); place(music,hat(0.05,0.03),t0+BEAT/4)
    if b%2==1: place(music,clap(0.26),t0)
# CTA resolve
for i,ch in enumerate([[53,57,60,65],[48,55,60,64]]):
    place(music,pad(ch,2.0,0.08),S_END+i*1.85); place(music,bass([41,36][i],1.9,0.15),S_END+i*1.85)
env=np.ones(N); fo=int(1.4*SR); env[-fo:]=np.linspace(1,0,fo); env[:int(0.03*SR)]=np.linspace(0,1,int(0.03*SR)); music*=env
# sfx (video time)
for i in range(5): place(sfx,tick_s(0.06),0.5+i*1.0)          # clock ticks
place(sfx,pop(820,0.09,0.32),0.6)
for i in range(3): place(sfx,pop(520,0.05,0.08),1.8+i*0.25)    # typing
place(sfx,blip_down(0.12),2.75)
place(sfx,tick_s(0.14),3.05)
for i,a in enumerate([5.0,6.2,7.4]): place(sfx,blip_down(0.14),a)
place(sfx,whoosh(0.9,0.32),9.4); place(sfx,impact(0.26),10.1)
for i in range(4): place(sfx,snap(0.22),10.75+i*0.09)
place(sfx,whoosh(1.0,0.14),11.5)
for i in range(4): place(sfx,pop(700+i*90,0.06,0.12),13.2+i*0.25)
place(sfx,chime(0.16),13.4)
place(sfx,whoosh(0.6,0.18),16.1)
for a in [17.95,20.2]: place(sfx,pop(1040,0.09,0.24),a)
for a in [19.3,21.2]: place(sfx,pop(860,0.09,0.22),a)
for a in [18.45,19.75,21.65]: place(sfx,tick_s(0.2),a+0.3)
place(sfx,whoosh(0.5,0.16),23.75)
for a in [25.15,25.6]: place(sfx,tick_s(0.24),a)
place(sfx,chime(0.22),26.15)
place(sfx,whoosh(0.6,0.18),27.2)
for a in [27.45,27.75,29.55]: place(sfx,pop(1040,0.09,0.22),a)
place(sfx,pop(860,0.09,0.22),28.75)
place(sfx,snap(0.3),30.45)
place(sfx,whoosh(0.4,0.12),31.05)
place(sfx,pop(600,0.06,0.12),31.55)
place(sfx,chime(0.22),32.65); place(sfx,pop(1100,0.09,0.2),33.25)
place(sfx,pop(860,0.09,0.22),35.85); place(sfx,tick_s(0.22),36.55)
place(sfx,whoosh(0.5,0.16),37.0)
for i in range(4): place(sfx,tick_s(0.16),37.35+i*0.16+0.65)
place(sfx,snap(0.34),39.15)
place(sfx,whoosh(1.4,0.14),41.15)
for i in range(7): place(sfx,pop(700+i*70,0.05,0.08),41.15+i*0.25)
place(sfx,impact(0.3),42.65); place(sfx,chime(0.26),42.7)
place(sfx,chime(0.24),44.5); place(sfx,pop(1200,0.07,0.10),45.7)
def write(path,x):
    x=x/max(1e-9,np.max(np.abs(x)))*0.89; st=np.stack([x,x],1)
    with wave.open(path,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes())
write('music.wav',music); write('sfx.wav',sfx); print('ok')
