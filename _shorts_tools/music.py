import numpy as np, wave, sys
sr=44100; T=float(sys.argv[1]); n=int(sr*T); t=np.arange(n)/sr
def note(m): return 440*2**((m-69)/12)
out=np.zeros(n)
chords=[[48,55,64,71],[45,52,60,67],[41,48,57,64],[43,50,59,65]]  # Cmaj7 Am7 Fmaj7 G7sus
bar=2.9
for b in range(int(T/bar)+1):
    c=chords[b%4]; s0=int((b*bar)*sr)
    for k,m in enumerate(c):  # pad
        L=int(bar*1.3*sr); seg=np.arange(L)/sr; i0=s0; i1=min(n,i0+L)
        if i0>=n: continue
        env=np.minimum(1,seg/0.6)*np.exp(-seg*0.5)
        w=(np.sin(2*np.pi*note(m)*seg)+0.3*np.sin(2*np.pi*note(m)*2*seg))*env*0.05
        out[i0:i1]+=w[:i1-i0]
    for j,m in enumerate([c[1]+12,c[2]+12,c[3]+12,c[2]+12]):  # piano arp
        st=s0+int(j*bar/4*sr); L=int(1.6*sr); seg=np.arange(L)/sr; i1=min(n,st+L)
        if st>=n: continue
        env=np.exp(-seg*3.2)*np.minimum(1,seg/0.005)
        w=(np.sin(2*np.pi*note(m)*seg)+0.4*np.sin(2*np.pi*note(m)*2*seg)+0.15*np.sin(2*np.pi*note(m)*3*seg))*env*0.09
        out[st:i1]+=w[:i1-st]
fade=np.ones(n); fl=int(1.5*sr); fade[-fl:]=np.linspace(1,0,fl); fade[:int(0.3*sr)]=np.linspace(0,1,int(0.3*sr))
out*=fade; out/=np.max(np.abs(out))*1.25
d=np.int16(out*32767); st=np.stack([d,d],1)
w=wave.open(sys.argv[2],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(st.tobytes()); w.close()
