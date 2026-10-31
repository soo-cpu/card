# 음악 v2: 신나는 하우스 팝 (124 BPM). 장면 전환(2.9초 = 6박)에 박자를 맞춤.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt
sr=44100; T=float(sys.argv[1]); OUT=sys.argv[2]
HOOK=2.6; SCN=2.9; NS=8; DROP=HOOK; ENDT=HOOK+SCN*NS
beat=SCN/6; n=int(sr*T); rng=np.random.default_rng(7)
L=np.zeros(n); R=np.zeros(n)
def hz(m): return 440*2**((m-69)/12)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
def add(x,t,g=1.0,pan=0.0):
    i=int(t*sr)
    if i>=n or i+len(x)<=0: return
    a=max(0,-i); x=x[a:]; i=max(i,0); m=min(len(x),n-i)
    L[i:i+m]+=x[:m]*g*(1-max(pan,0)); R[i:i+m]+=x[:m]*g*(1+min(pan,0))
def saw(f,d,det=0.0):
    t=np.arange(int(d*sr))/sr; return 2*((t*f*(1+det))%1)-1
# 소리 재료
def kick():
    t=np.arange(int(0.35*sr))/sr; f=50+110*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t*7)
def clap():
    t=np.arange(int(0.25*sr))/sr; x=hp(rng.standard_normal(len(t)),900)
    env=np.exp(-t*18)+0.5*np.exp(-np.maximum(t-0.012,0)*40)*(t>0.012)
    return lp(x,6000)*env*0.6
def hat(d=0.05,f=7000):
    t=np.arange(int(d*sr))/sr; return hp(rng.standard_normal(len(t)),f)*np.exp(-t*(60 if d<0.1 else 14))*0.35
def pluck(m,d=0.35):
    t=np.arange(int(d*sr))/sr; x=sum(saw(hz(m),d,dt) for dt in (-0.004,0,0.004))/3
    return lp(x,5000)*np.exp(-t*9)*np.minimum(1,t/0.003)
def stab(ms,d):
    t=np.arange(int(d*sr))/sr; x=sum(saw(hz(m),d,dt) for m in ms for dt in (-0.006,0.006))/(2*len(ms))
    return lp(x,2600)*np.exp(-t*5)*np.minimum(1,t/0.004)
def bass(m,d):
    t=np.arange(int(d*sr))/sr; x=saw(hz(m),d)*0.6+np.sin(2*np.pi*hz(m)*t)*0.8
    return lp(x,420)*np.minimum(1,t/0.004)*np.exp(-t*3)
# 코드: C  G  Am  F (밝은 팝 진행)
CH=[[60,64,67,72],[59,62,67,71],[57,60,64,69],[57,60,65,69]]; RT=[36,43,45,41]
MEL=[76,79,81,79, 76,74,72,74, 76,79,84,83, 81,79,76,79]   # 8분음표 훅
# 1) 인트로(훅 화면): 필터 걸린 코드 + 상승음 + 스네어 롤
for k in range(6):
    t0=DROP-beat*(6-k); c=CH[0] if k<4 else CH[1]
    add(lp(stab(c,beat*0.9),900+k*400),t0,0.35)
rl=int(HOOK*sr); tt=np.arange(rl)/sr
riser=hp(rng.standard_normal(rl),2000)*(tt/HOOK)**2*0.18
add(riser,0,1.0)
for k in range(16):
    tk=DROP-beat*2+k*beat/8; add(clap()*0.5,tk,0.25+0.5*k/16)
# 2) 본편: 장면 8개 = 48박
nb=int(SCN*NS/beat)
for b in range(nb):
    t0=DROP+b*beat; bar=b//4; c=CH[bar%4]; r=RT[bar%4]
    add(kick(),t0,0.95)
    if b%2==1: add(clap(),t0,0.8,0.1)
    add(hat(0.12,6000),t0+beat/2,0.6,-0.3)              # 오픈 하이햇(엇박)
    for s in (0.25,0.75): add(hat(),t0+beat*s,0.35,0.3)  # 16비트 하이햇
    add(bass(r,beat*0.45),t0+beat/2,0.55)                 # 하우스 엇박 베이스
    # 코드 스탭: 펌핑 느낌으로 엇박에
    add(stab(c,beat*0.4),t0+beat/2,0.28,-0.2); add(stab(c,beat*0.3),t0+beat*0.75,0.18,0.2)
    if b>=12:  # 넷째 마디부터 멜로디 등장
        for h in range(2):
            m=MEL[((b-12)*2+h)%16]; add(pluck(m),t0+h*beat/2,0.22,0.15)
    if b%6==0:  # 장면 바뀔 때마다 심벌
        t=np.arange(int(1.2*sr))/sr; add(hp(rng.standard_normal(len(t)),5000)*np.exp(-t*3.5)*0.25,t0,0.7)
# 3) 엔딩: 큰 마무리 화음 + 잔향
t0=ENDT; add(kick(),t0,1.0); add(clap(),t0,0.8)
fin=[48,55,60,64,67,72,76]
d=T-t0; t=np.arange(int(d*sr))/sr
pad=sum(saw(hz(m),d,dt) for m in fin for dt in (-0.005,0.005))/(2*len(fin))
add(lp(pad,1800)*np.exp(-t*0.45)*np.minimum(1,t/0.02),t0,1.5)
for k,m in enumerate([72,76,79,84]): add(pluck(m,0.8),t0+0.25+k*beat/2,0.25)
for k in range(4): add(kick()*0.6,t0+beat*(k+1),0.4)
# 마스터
mix=np.stack([L,R],1)
mix[:int(0.05*sr)]*=np.linspace(0,1,int(0.05*sr))[:,None]
fl=int(1.2*sr); mix[-fl:]*=np.linspace(1,0,fl)[:,None]
mix=np.tanh(mix/np.max(np.abs(mix))*1.6)/np.tanh(1.6)*0.89
d=np.int16(mix*32767)
w=wave.open(OUT,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(d.tobytes()); w.close()
print('ok',T)
