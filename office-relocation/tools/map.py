import matplotlib; matplotlib.use("Agg")
import koreanize_matplotlib, matplotlib.pyplot as plt
NAVY="#1F4E79"; YEL="#FFC000"; GRAY="#7F7F7F"
st={"성수역":(37.54459,127.05607),"뚝섬역":(37.54724,127.04739),"구의역":(37.53718,127.08618),
    "광나루역":(37.54530,127.10352),"청량리역":(37.57997,127.04774),"용두역":(37.57406,127.03828),"강변역":(37.53510,127.09470)}
lst={"①추천 연무장1길 15-1\n(2층 35평 300만)":(37.54449,127.05116),"④더 스페이스 타워\n광나루로 144 (49.6평 480만)":(37.55130,127.04643)}
area={"성수동":(37.5445,127.053),"광장동":(37.5450,127.1035),"구의동":(37.5395,127.088),"청량리 일대":(37.5790,127.044)}
def draw(fn,xl,yl,title,showarea):
    fig,ax=plt.subplots(figsize=(7.2,5.2),dpi=170)
    ax.set_facecolor("#F2F2F2")
    if showarea:
        for n,(la,lo) in area.items():
            ax.add_patch(plt.Circle((lo,la),0.0075,color="#D1E3F3",zorder=1)); ax.text(lo,la-0.0105 if n=="성수동" else la+0.0085,n,ha="center",fontsize=11,color=NAVY,weight="bold")
    for n,(la,lo) in st.items():
        if xl[0]<lo<xl[1] and yl[0]<la<yl[1]:
            ax.plot(lo,la,"s",color=NAVY,ms=7,zorder=3); ax.text(lo+0.0004,la-0.0009,n,fontsize=9,color=NAVY)
    for n,(la,lo) in lst.items():
        ax.plot(lo,la,"*",color=YEL,mec=NAVY,ms=17,zorder=4)
        if not showarea: ax.text(lo+0.0005,la+0.0004,n,fontsize=8.5)
    if not showarea:
        for (a,b,t) in [((37.54459,127.05607),(37.54449,127.05116),"도보 약 9분 (595m)"),((37.54724,127.04739),(37.55130,127.04643),"도보 약 11분 (673m)")]:
            ax.plot([a[1],b[1]],[a[0],b[0]],"--",color=GRAY,lw=1)
            ax.text((a[1]+b[1])/2,(a[0]+b[0])/2-0.0007,t,fontsize=8,color=GRAY,ha="center")
    ax.set_xlim(*xl); ax.set_ylim(*yl); ax.set_aspect(1/0.79)
    ax.set_xticks([]); ax.set_yticks([]); ax.set_title(title,color=NAVY,fontsize=12,weight="bold")
    ax.text(0.01,0.01,"■ 지하철역  ★ 정확한 주소가 확인된 매물  (위경도 기준 약도, 실제 지도 아님)",transform=ax.transAxes,fontsize=7.5,color=GRAY)
    fig.tight_layout(); fig.savefig(fn)
draw("map_all.png",(127.030,127.112),(37.528,37.588),"찾는 지역 4곳 위치 약도",True)
draw("map_ss.png",(127.040,127.062),(37.540,37.555),"성수동 확대 — 매물과 역 거리",False)
