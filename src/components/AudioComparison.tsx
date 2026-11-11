"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Download, Headphones, AudioLines, ScanLine, Info } from "lucide-react";
import { RecordData, number, signed } from "./shared";
import {assetUrl} from "../data-client";

const colors: Record<string,string> = {input:"#6095be", enhanced:"#12a58a", reference:"#9a89bb"};
const names: Record<string,string> = {input:"模型输入", enhanced:"增强输出", reference:"参考人声"};
const clock = (v:number) => `${Math.floor((v||0)/60)}:${String(Math.floor((v||0)%60)).padStart(2,"0")}`;
function mediaOf(item:RecordData) {const media=item.media||item.audio||{}; return {input:media.input||media.noisy||null, enhanced:media.enhanced||media.output||null, reference:media.reference||null};}
function metricsOf(item:RecordData) {const m=item.summary?.metrics||item.metrics||{}; return {raw:m,available:m.available ?? Boolean(m.input_vs_reference||m.input), before:m.input_vs_reference||m.input||{},after:m.enhanced_vs_reference||m.enhanced||m.output||{}};}
function VisualPlot({item,mode,position,onSeek}:{item:RecordData;mode:string;position:number;onSeek:(n:number)=>void}) {
  const canvas=useRef<HTMLCanvasElement>(null); const wrap=useRef<HTMLDivElement>(null);
  const plots=item.plots||item.summary?.plots||{}; const data=plots[mode];
  const duration=data?.duration_seconds||item.summary?.audio?.duration_seconds||item.duration_seconds||item.durationSeconds||4;
  useEffect(()=>{
    const paint=()=>{
      if(!canvas.current || !data) return;
      const w=Math.max(260,canvas.current.clientWidth),h=canvas.current.clientHeight||280,ratio=Math.min(window.devicePixelRatio||1,2);
      canvas.current.width=w*ratio;canvas.current.height=h*ratio; const ctx=canvas.current.getContext("2d"); if(!ctx)return;ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
      ctx.font='11px "Segoe UI", "Microsoft YaHei", sans-serif';
      const keys=["input","enhanced","reference"].filter(k=>mode==="waveform"?data[`min_${k}`]?.length:data[`${k}_db`]?.length);
      const left=62,right=mode==="spectrogram"?42:18,top=29,bottom=24,gap=25,pw=w-left-right;
      if(!keys.length){ctx.fillStyle="#687a87";ctx.fillText("这份记录没有可绘制的数据",left,55);return;}
      const rh=(h-top-bottom-gap*(keys.length-1))/keys.length;
      if(mode==="waveform"){
        const peak=Math.max(0.001,...keys.flatMap(k=>[...data[`min_${k}`].map((v:number)=>Math.abs(v)),...data[`max_${k}`].map((v:number)=>Math.abs(v))]));
        keys.forEach((k,j)=>{const y=top+j*(rh+gap),mid=y+rh/2,mins=data[`min_${k}`],maxs=data[`max_${k}`];ctx.fillStyle=colors[k];ctx.textAlign="left";ctx.fillText(names[k],left,y-8);ctx.strokeStyle="#dce8eb";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(left,mid);ctx.lineTo(w-right,mid);ctx.stroke();ctx.strokeStyle=colors[k];ctx.lineWidth=Math.max(.8,pw/mins.length*.7);ctx.beginPath();mins.forEach((v:number,i:number)=>{const x=left+(data.time_seconds?.[i]??i/mins.length*duration)/duration*pw;ctx.moveTo(x,mid-maxs[i]/peak*rh*.47);ctx.lineTo(x,mid-v/peak*rh*.47)});ctx.stroke();ctx.fillStyle="#94a2ac";ctx.textAlign="right";ctx.fillText(number(peak,2),left-8,y+5);ctx.fillText("0",left-8,mid+3);});
      } else {
        const low=data.min_db??-100,high=data.max_db??0;
        const color=(db:number)=>{const t=Math.max(0,Math.min(1,(db-low)/(high-low))); const a=t<.5?[18,38,58]:[28,145,140],b=t<.5?[28,145,140]:[250,219,153],r=t<.5?t*2:(t-.5)*2;return a.map((v,i)=>Math.round(v+(b[i]-v)*r));};
        keys.forEach((k,j)=>{const values=data[`${k}_db`],y=top+j*(rh+gap),image=document.createElement("canvas");image.width=values.length;image.height=values[0].length;const ic=image.getContext("2d")!;const pixels=ic.createImageData(image.width,image.height);for(let t=0;t<image.width;t++)for(let f=0;f<image.height;f++){const off=((image.height-f-1)*image.width+t)*4;const rgb=color(values[t][f]);pixels.data.set([...rgb,255],off);}ic.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(image,left,y,pw,rh);ctx.imageSmoothingEnabled=true;ctx.fillStyle=colors[k];ctx.textAlign="left";ctx.fillText(names[k],left,y-8);ctx.fillStyle="#8b9aa5";ctx.textAlign="right";ctx.fillText("8 kHz",left-8,y+5);ctx.fillText("0",left-8,y+rh);});
        const grad=ctx.createLinearGradient(0,h-bottom,0,top);grad.addColorStop(0,"#12263a");grad.addColorStop(.5,"#1c918c");grad.addColorStop(1,"#fadB99");ctx.fillStyle=grad;ctx.fillRect(w-26,top,6,h-top-bottom);ctx.font="9px sans-serif";ctx.fillStyle="#8b9aa5";ctx.textAlign="left";ctx.fillText("0",w-17,top+6);ctx.fillText("−100",w-25,h-bottom+13);
      }
      ctx.fillStyle="#8b9aa5";ctx.textAlign="center";ctx.font="10px sans-serif";for(let i=0;i<=4;i++)ctx.fillText(`${number(duration*i/4,duration<10?1:0)}${i===4?" s":""}`,left+pw*i/4,h-5);
      if(position<=duration){const x=left+position/duration*pw;ctx.strokeStyle="#153e55aa";ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,h-bottom);ctx.stroke();}
    };paint();const observer=new ResizeObserver(paint);if(wrap.current)observer.observe(wrap.current);return()=>observer.disconnect();
  },[data,duration,mode,position]);
  return <><div ref={wrap} className="audio-visual" onClick={e=>{if(!data)return; const r=e.currentTarget.getBoundingClientRect();onSeek(Math.max(0,Math.min(duration,(e.clientX-r.left-62)/(r.width-62-(mode==="spectrogram"?42:18))*duration)));}}>{data?<canvas ref={canvas} role="img" aria-label={mode==="waveform"?"处理前后统一幅值波形":"处理前后统一色标时频谱"}/>:<div className="plot-empty">这份记录暂无{mode==="waveform"?"波形":"时频谱"}证据，仍可试听。</div>}</div><p className="plot-caption">{data?.scope || (mode==="waveform"?"各音源使用同一幅值尺度；点击图中位置可跳转试听。":"各音源使用相同色标，颜色变淡不等于质量一定改善。")}</p></>;
}
function WaveOverview({item,position,source,onSeek}:{item:RecordData;position:number;source:string;onSeek:(seconds:number)=>void}){
  const data=item.plots?.waveform,duration=data?.duration_seconds||item.durationSeconds||4;
  const tracks=useMemo(()=>{
    if(!data)return [];
    const peak=Math.max(.0001,...['input','enhanced','reference'].flatMap(role=>[...(data[`min_${role}`]||[]),...(data[`max_${role}`]||[])].map((value:number)=>Math.abs(value))));
    return ['input','enhanced'].filter(role=>data[`min_${role}`]?.length).map(role=>{
      const minimum:number[]=data[`min_${role}`],maximum:number[]=data[`max_${role}`],bins=Math.min(96,minimum.length);
      const path=Array.from({length:bins},(_,index)=>{
        const start=Math.floor(index*minimum.length/bins),end=Math.max(start+1,Math.floor((index+1)*minimum.length/bins));
        const low=Math.min(...minimum.slice(start,end)),high=Math.max(...maximum.slice(start,end)),x=4+index/Math.max(1,bins-1)*592;
        return `M${x.toFixed(1)},${(35-high/peak*29).toFixed(1)}V${(35-low/peak*29).toFixed(1)}`;
      }).join('');return {role,path};
    });
  },[data]);
  return <div className="wave-overview" aria-label="输入与增强波形概览，使用同一幅值尺度">{tracks.map(track=><div className="wave-row" key={track.role}><span>{track.role==='input'?'输入录音':'增强输出'}</span><svg viewBox="0 0 600 70" role="img" aria-label={track.role==='input'?'输入录音真实波形':'增强输出真实波形'} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();onSeek(Math.max(0,Math.min(duration,(event.clientX-rect.left)/rect.width*duration)));}}><line x1="0" x2="600" y1="35" y2="35" stroke="#303e57"/><path d={track.path} fill="none" stroke={track.role==='input'?'#8294b1':'#8aaaff'} strokeWidth="2.8" opacity={source===track.role?1:.55}/><line x1={Math.min(600,position/duration*600)} x2={Math.min(600,position/duration*600)} y1="0" y2="70" stroke="#cad8ff" opacity=".75"/></svg></div>)}<div className="wave-overview-axis"><span>0.0 s</span><span>同一幅值尺度</span><span>{number(duration,1)} s</span></div></div>;
}
export default function AudioComparison({item,compact=false,preview=false}:{item:RecordData;compact?:boolean;preview?:boolean}) {return <AudioPlayer key={`${item.id||item.case_id||"result"}:${mediaOf(item).input||""}`} item={item} compact={compact} preview={preview}/>;}
function AudioPlayer({item,compact=false,preview=false}:{item:RecordData;compact?:boolean;preview?:boolean}) {
  const initialMedia=mediaOf(item),initialSource=Object.keys(initialMedia).find(k=>initialMedia[k as keyof typeof initialMedia])||"input",initialUrl=initialMedia[initialSource as keyof typeof initialMedia],playerId=useId();
  const ref=useRef<HTMLAudioElement>(null);const generation=useRef(0);const pending=useRef<{position:number;playing:boolean}|null>(null);
  const [source,setSource]=useState(initialSource),[playing,setPlaying]=useState(false),[position,setPosition]=useState(0),[duration,setDuration]=useState(item.duration_seconds||item.durationSeconds||item.summary?.audio?.duration_seconds||0),[mode,setMode]=useState("waveform"),[error,setError]=useState("");
  const media=mediaOf(item),metric=metricsOf(item);
  function change(role:string, reset=false) {const a=ref.current,url=media[role as keyof typeof media];if(!a||!url)return;const snapshot={position:reset?0:pending.current?.position??a.currentTime??0,playing:reset?false:pending.current?.playing??!a.paused};pending.current=snapshot;const gen=++generation.current;a.pause();a.onloadedmetadata=null;a.src=url;a.onloadedmetadata=()=>{if(gen!==generation.current)return;a.currentTime=Math.min(snapshot.position,Math.max(0,a.duration-.001));setPosition(a.currentTime);setDuration(a.duration);pending.current=null;if(snapshot.playing)a.play().catch(()=>setError("请点击播放按钮继续试听。"));};a.load();setSource(role);setError("");}
  useEffect(()=>{const a=ref.current;if(!a||!initialUrl)return;a.src=initialUrl;a.onloadedmetadata=()=>setDuration(a.duration);a.load();return()=>{a.onloadedmetadata=null;a.pause();};},[initialUrl]);
  useEffect(()=>{const stopOthers=(event:Event)=>{if((event as CustomEvent<string>).detail!==playerId){if(pending.current)pending.current.playing=false;ref.current?.pause();}};window.addEventListener("gtcrn-audio-play",stopOthers);return()=>window.removeEventListener("gtcrn-audio-play",stopOthers);},[playerId]);

  function seek(n:number){const a=ref.current;if(pending.current)pending.current.position=n;if(a&&a.readyState>=1)a.currentTime=Math.min(a.duration,n);setPosition(n);}
  function toggle(){const a=ref.current;if(!a)return;if(pending.current){pending.current.playing=!pending.current.playing;return;}if(a.paused)a.play().catch(()=>setError("音频暂时无法播放，请稍后重试或下载文件。"));else a.pause();}
  return <div className={`audio-comparison ${compact?"compact":""} ${preview?"audio-preview":""}`} role="group" aria-label={preview?'首屏音频对比':'完整音频对比'}>
    <div className="audio-detail-header"><div><span className="eyebrow">A/B LISTENING</span><h3>{item.title||item.label||"本次处理结果"}</h3></div><span className="small-tag"><Headphones size={14}/>建议佩戴耳机</span></div>
    {item.description&&<p className="audio-description">{item.description}</p>}
    {!Object.values(media).some(Boolean)&&<div className="notice"><Info size={17}/><span>这条精选仅公开结论，没有公开试听音频。音频对比无法确认。</span></div>}
    <div className="audio-plot-toolbar"><div className="segmented"><button aria-pressed={mode==="waveform"} className={mode==="waveform"?"selected":""} onClick={()=>setMode("waveform")}><AudioLines size={15}/>波形</button><button aria-pressed={mode==="spectrogram"} className={mode==="spectrogram"?"selected":""} onClick={()=>setMode("spectrogram")}><ScanLine size={15}/>时频谱</button></div><span>统一尺度 · 点击定位</span></div>
    {preview?<WaveOverview item={item} position={position} source={source} onSeek={seek}/>:<VisualPlot item={item} mode={mode} position={position} onSeek={seek}/>}
    <div className="ab-player"><div className="player-sources">{Object.keys(names).map(role=><button key={role} disabled={!media[role as keyof typeof media]} className={source===role?"selected":""} aria-pressed={source===role} onClick={()=>change(role)}><i style={{background:colors[role]}}/>{names[role]}</button>)}<span>切换时保留播放位置</span></div><div className="transport"><button className="play-button" aria-label={playing?"暂停试听":"开始试听"} disabled={!media[source as keyof typeof media]} onClick={toggle}>{playing?<Pause size={20}/>:<Play size={20}/>}</button><span className="time">{clock(position)}</span><input aria-label="试听进度" type="range" min={0} max={duration||1} step={.01} value={Math.min(position,duration||1)} onChange={e=>seek(Number(e.target.value))}/><span className="time">{clock(duration)}</span><button className="icon-button" aria-label="从头试听" onClick={()=>seek(0)}><RotateCcw size={17}/></button>{media.enhanced&&<a className="icon-button" href={media.enhanced} download aria-label="下载增强音频"><Download size={17}/></a>}</div></div>
    <audio ref={ref} preload="metadata" onTimeUpdate={()=>setPosition(ref.current?.currentTime||0)} onPlay={()=>{setPlaying(true);window.dispatchEvent(new CustomEvent("gtcrn-audio-play",{detail:playerId}));}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{if(ref.current?.getAttribute("src"))setError("音频未能加载，文件可能不可用。");}}/>
    {error&&<p className="inline-error" role="alert">{error}</p>}
    {metric.available?<><div className="metric-pair">{[["si_sdr_db","SI-SDR","允许整体音量缩放","delta_si_sdr_db"],["gain_sensitive_sdr_db","幅度敏感 SDR","保留幅度误差","delta_gain_sensitive_sdr_db"]].map(([key,title,hint,deltaKey])=>{const before=metric.before[key],after=metric.after[key],bounded=metric.raw.input_numeric_ceiling||metric.raw.delta_applicable===false||metric.before.metric_flags?.some((flag:string)=>flag.includes("numeric_bound"));const delta=bounded?null:Object.prototype.hasOwnProperty.call(metric.raw,deltaKey)?metric.raw[deltaKey]:typeof before==="number"&&typeof after==="number"?after-before:null;return <div className="metric-cell" key={key}><div><strong>{title}</strong><span>{hint}</span></div><p><small>{bounded?"数值上限":number(before)}</small><span>→</span><b>{number(after)}</b><em>dB</em></p><span className={delta===null?"muted":delta<0?"negative":"positive"}>{bounded?"不计算提升量":delta===null?"无法确认":`${signed(delta)} dB`}</span></div>;})}</div>{(metric.raw.input_numeric_ceiling||metric.raw.delta_applicable===false)&&<div className="notice"><Info size={17}/><span>输入就是干净参考，已到达计算的数值上限。此时不把输入与输出相减；请关注输出指标与人声是否被误伤。</span></div>}</>:<div className="notice"><Info size={17}/><span>没有合格参考时，不计算 SI-SDR／SDR。可结合试听检查噪声残留与人声损伤。</span></div>}
    {metric.available&&<details className="metric-definition"><summary>这两个数值具体表示什么</summary><p><strong>SI-SDR：</strong>{metric.raw.definition?.si_sdr_db||"去均值后，将输出投影到参考；比较投影目标与残差能量，允许整体比例缩放。"}</p><p><strong>幅度敏感 SDR：</strong>{metric.raw.definition?.gain_sensitive_sdr_db||"10log10(参考能量/原幅度误差能量)，惩罚增益偏差；不是长滤波对齐的 BSS Eval SDR。"}</p><p>数值越高通常表示与这一参考更接近；仍需试听人声是否自然，不能直接当作噪声减少百分比。</p></details>}
    <p className="listening-guidance">保持音量不变，既听背景是否减弱，也听字头、字尾是否完整。网页能播放，不等于真实声卡链路已经验收。</p>
    {!!item.licenses?.length&&<details className="audio-attribution"><summary>试听素材来源与许可</summary><ul>{item.licenses.map((license:RecordData,index:number)=><li key={index}><a href={license.url} target="_blank" rel="noreferrer">{license.title||"来源素材"}</a><span>{license.creator} · <a href={license.licenseUrl} target="_blank" rel="noreferrer">{license.license}</a></span></li>)}</ul><p>公开片段为统一增益处理后的 4 秒教学摘录。<a href={assetUrl("audio/ATTRIBUTION.md")} target="_blank" rel="noreferrer">完整署名与处理说明</a></p></details>}
  </div>;
}
