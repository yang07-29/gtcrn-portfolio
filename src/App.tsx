import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowRight,ArrowUpRight,AudioLines,Code2,Cpu,FileAudio,Headphones,Layers,Menu,ShieldCheck,Waves,X} from 'lucide-react';
import AudioComparison from './components/AudioComparison';
import BatchDetails from './components/BatchDetails';
import {ProjectContribution,TechnicalChallenges} from './components/ProjectStory';
import SeedContrast from './components/SeedContrast';
import DeliveryStatus,{LocalDemoGuide} from './components/DeliveryStatus';
import {api,Badge,Brand,ErrorNotice,Loading,number,RecordData,SectionHeading} from './components/shared';
import {assetUrl} from './data-client';
import {experimentGroups,selectExperiments} from './experiment-groups';

const sceneNames:Record<string,string>={'keyboard-strong':'键盘敲击','fan-strong':'风扇噪声','clean-control':'干净人声'};
function SceneSelector({cases,selected,onSelect,compact=false}:{cases:RecordData[];selected:string;onSelect:(item:RecordData)=>void;compact?:boolean}){
 return <div className={compact?'scene-selector compact':'scene-selector'} role="group" aria-label={compact?'首屏场景选择':'完整对比场景选择'}>{cases.map(item=><button key={item.id} aria-pressed={selected===item.id} onClick={()=>onSelect(item)} className={selected===item.id?'selected':''}>{sceneNames[item.id]||item.title}</button>)}</div>;
}


export default function App(){
 const [data,setData]=useState<RecordData|null>(null),[error,setError]=useState('');
 const [activeId,setActiveId]=useState(''),[activeCase,setActiveCase]=useState<RecordData|null>(null),[caseLoading,setCaseLoading]=useState(true),[caseError,setCaseError]=useState('');
 const [batch,setBatch]=useState<RecordData|null>(null),[group,setGroup]=useState('featured'),[menu,setMenu]=useState(false);
 const requestId=useRef(0);
 const chooseCase=useCallback((item:RecordData)=>{
  const request=++requestId.current;setActiveId(item.id);setCaseLoading(true);setCaseError('');
  const url=new URL(window.location.href);url.searchParams.set('case',item.id);window.history.replaceState(null,'',url);
  api(`/api/public/cases/${encodeURIComponent(item.id)}`).then(value=>{if(request===requestId.current)setActiveCase(value.case||value);}).catch(caught=>{if(request===requestId.current)setCaseError(caught.message);}).finally(()=>{if(request===requestId.current)setCaseLoading(false);});
 },[]);
 const load=useCallback(async()=>{
  try{const value=await api('/api/public');setData(value);setError('');const selected=new URLSearchParams(window.location.search).get('case');if(value.cases?.length)chooseCase(value.cases.find((item:RecordData)=>item.id===selected)||value.cases[0]);}
  catch(caught){setError(caught instanceof Error?caught.message:'实验记录暂时无法读取。');}
 },[chooseCase]);
 useEffect(()=>{void load();return()=>{requestId.current++;};},[load]);
 useEffect(()=>{if(!menu)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menu]);
 const closeBatch=useCallback(()=>setBatch(null),[]);
 const cases:RecordData[]=data?.cases||[],batches:RecordData[]=data?.batches||[];
 const seed=batches.find(item=>item.id==='three-seed-replication');
 const target=seed?.metrics?.find((metric:RecordData)=>metric.dataset==='controlled_target'&&metric.metricId==='si_sdr_db'&&metric.method==='E4-E3c');
 const streaming=batches.find(item=>item.id==='file-streaming'),p99=streaming?.metrics?.find((metric:RecordData)=>metric.name==='P99计算耗时');
 const sources=batches.find(item=>item.id==='external-noise-12'),sourceGain=sources?.metrics?.find((metric:RecordData)=>metric.metricId==='si_sdr_db');
 const visibleBatches=selectExperiments(batches,group);
 const openBatch=(id:string)=>setBatch(batches.find(item=>item.id===id)||null);
 const player=(preview=false)=>error?<ErrorNotice message={error} onRetry={()=>void load()}/>:caseError?<ErrorNotice message={caseError} onRetry={()=>chooseCase(cases.find(item=>item.id===activeId)||cases[0])}/>:caseLoading?<Loading text="正在加载真实音频…"/>:activeCase?<AudioComparison item={activeCase} preview={preview}/>:<Loading text="等待公开案例"/>;

 return <div className="portfolio"><div inert={Boolean(batch)}>
  <a className="skip-link" href="#main">跳转到内容</a>
  <header className="site-header"><div className="header-inner"><Brand/><nav className={menu?'open':''} aria-label="主导航">{[['work','我的工作'],['challenges','技术难点'],['experiments','真实结果'],['listen','试听对比'],['engineering','流式工程']].map(([id,label])=><a key={id} href={`#${id}`} onClick={()=>setMenu(false)}>{label}</a>)}</nav><a className="source-link" href="https://github.com/yang07-29/gtcrn-portfolio" target="_blank" rel="noreferrer">展示站源码 <ArrowUpRight size={15}/></a><button className="mobile-menu icon-button" aria-label={menu?'关闭导航':'打开导航'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></header>
  <main id="main">
   <section className="hero"><div className="page-width"><div className="hero-main">
    <div className="hero-copy"><p className="eyebrow"><span className="status-dot"/> GTCRN / SPEECH ENHANCEMENT</p><h1><span className="hero-model">从噪声中，</span><span className="hero-focus">听见人声。</span></h1><p className="hero-description">基于 GTCRN 的轻量通话语音增强与流式推理。<br className="desktop-break"/>我完成场景适配、受控复验与独立 CPU 运行。</p><div className="hero-actions"><a className="button primary" href="#work">查看我的工作 <ArrowRight size={17}/></a><a className="button dark-outline" href="#listen"><Headphones size={17}/>试听降噪效果</a></div><div className="hero-specs" aria-label="模型处理规格"><div><span>16 kHz</span><small>SAMPLE RATE</small></div><div><span>512 / 256</span><small>FFT / HOP</small></div><div><span>CPU · FP32</span><small>FILE STREAMING</small></div></div><div className="hero-author"><span>PY</span><div><strong>潘洋</strong><small>数据与实验 · 结果分析 · 流式工程</small></div><a href="#local-demo" aria-label="查看本机项目演示说明"><ArrowUpRight size={19}/></a></div></div>
    <div className="stage-card"><div className="stage-topline"><span><AudioLines size={16}/> A/B MONITOR · 01</span><span>16 kHz / MONO</span></div><SceneSelector cases={cases} selected={activeId} onSelect={chooseCase} compact/>{player(true)}<div className="stage-foot"><span>固定片段 · 同位置切换</span><a href="#listen">查看完整指标 <ArrowDown size={14}/></a></div></div>
   </div><div className="hero-bottom"><span><ShieldCheck size={14}/>公开实验快照 · 固定 E4 seed17</span><a href="#work">从听感，到可核对的实验 <ArrowDown size={15}/></a></div></div></section>

   <div className="proof-rail page-width" aria-label="项目关键结果"><button onClick={()=>openBatch('three-seed-replication')}><span>目标噪声集 SI-SDR 增益</span><strong>{target?`+${number(target.value,2)}`:'—'}<em>dB</em></strong><small>等预算 E3c 对照 · 3 种子均值 <ArrowUpRight size={13}/></small></button><button onClick={()=>openBatch('file-streaming')}><span>CPU 软件处理 P99</span><strong>{number(p99?.value,2)}<em>ms</em></strong><small>本机单线程 · 不含设备 I/O <ArrowUpRight size={13}/></small></button><button onClick={()=>openBatch('external-noise-12')}><span>新增来源 SI-SDR 改善</span><strong>{sourceGain?`+${number(sourceGain.value,2)}`:'—'}<em>dB</em></strong><small>12 来源等权 · 仅 seed17 <ArrowUpRight size={13}/></small></button></div>
   <div className="page-width">{error&&<ErrorNotice message={error} onRetry={()=>void load()}/>}


    <ProjectContribution batches={batches} onOpen={openBatch}/>
    <TechnicalChallenges batches={batches} onOpen={openBatch}/>

    <section id="experiments" className="content-section"><SectionHeading index="03" kicker="RESULTS & EVIDENCE" title="真实结果与结论。" description="目标收益、来源迁移和原域退化分别报告，不把一次试听或一组测试外推到所有场景。"/><SeedContrast batch={seed} onOpen={()=>openBatch('three-seed-replication')}/><div className="research-takeaway"><strong>这组结果说明了什么？</strong><p>等预算和三种子对照支持固定目标场景的适配收益；原官方集退化说明存在分布取舍。新增 12 来源只是 seed17 的噪声迁移检查，不能替代新说话人、真实耳机或实时麦克风验证。</p><button className="text-button" onClick={()=>openBatch('external-noise-12')}>查看新增来源结果与限制 <ArrowUpRight size={15}/></button></div><div className="archive-heading"><h3>可追溯的实验档案</h3><span>{batches.length||'—'} 组原始记录</span></div><div className="archive-filters" role="group" aria-label="实验档案筛选">{experimentGroups.map(item=><button key={item.id} className={group===item.id?'selected':''} aria-pressed={group===item.id} disabled={!data} onClick={()=>setGroup(item.id)}>{item.label}<span>{data?selectExperiments(batches,item.id).length:'—'}</span></button>)}</div><div className="experiment-list">{visibleBatches.map((item,index)=><button className="experiment-row" key={item.id} onClick={()=>setBatch(item)}><span className="experiment-index">{String(index+1).padStart(2,'0')}</span><span className="experiment-copy"><strong>{item.title}</strong><span>{item.summary}</span></span><Badge status={item.status||(item.frozen?'frozen':'pending')}/><ArrowUpRight size={19}/></button>)}</div></section>

    <section id="listen" className="content-section"><SectionHeading index="04" kicker="LISTEN" title="先听变化，再看指标。" description="选一段录音，在同一位置切换输入、增强与参考。既听噪声残留，也听字头、尾音是否完整。"/><div className="comparison-baseline"><strong>两个比较基线，分开解读。</strong><p>下面是单个 4 秒片段的“增强输出 vs 当前输入”；研究结果则是“E4 vs 等预算 E3c”。单段试听增益不能当作测试集均值。</p></div><div className="listening-layout"><aside className="listening-context"><span className="section-label">三个观察角度</span><SceneSelector cases={cases} selected={activeId} onSelect={chooseCase}/><div className="scene-context"><Badge status={activeId==='fan-strong'?'needs_review':'frozen'}>{cases.find(item=>item.id===activeId)?.tag||'公开案例'}</Badge><p>{cases.find(item=>item.id===activeId)?.description||'正在读取已保存案例。'}</p></div><a className="text-button" href={assetUrl('audio/ATTRIBUTION.md')} target="_blank" rel="noreferrer">素材来源与许可 <ArrowUpRight size={14}/></a></aside><div className="demo-card">{player()}</div></div>{activeCase?.id===activeId&&!!activeCase?.boundaries?.length&&<details className="case-boundaries"><summary>这段试听的适用边界</summary><ul>{activeCase.boundaries.map((item:string)=><li key={item}>{item}</li>)}</ul></details>}</section>

    <section id="engineering" className="content-section"><SectionHeading index="05" kicker="STREAMING ENGINEERING" title="让模型，接上连续音频。" description="保留跨块状态，让时频分析、网络与波形重建连续运行。"/><div className="signal-chain">{[{icon:FileAudio,title:'输入适配',meta:'单声道 · 16 kHz',text:'保留原文件，生成独立输入副本'},{icon:Waves,title:'增量 STFT',meta:'512 窗 / 256 步长',text:'缓存跨块保留，连续产生时频帧'},{icon:Cpu,title:'GTCRN 增强',meta:'ERB · 分组卷积 · GRU',text:'固定 E4 seed17，估计复数掩码'},{icon:Layers,title:'波形重建',meta:'iSTFT · OLA · flush',text:'尾帧完整输出，输入输出等长'}].map((item,index)=><article key={item.title}><div><span>0{index+1}</span><item.icon size={23}/></div><h3>{item.title}</h3><strong>{item.meta}</strong><p>{item.text}</p>{index<3&&<ArrowRight className="chain-arrow" size={18}/>}</article>)}</div><div className="engineering-note"><p><strong>16 ms 帧步长，1.19 ms 软件处理 P99。</strong>32 ms 是首完整输出所需的输入缓存量；这些值都不等于耳机物理端到端延迟。</p><button className="text-button" onClick={()=>openBatch('file-streaming')}>核对流式验收 <ArrowUpRight size={15}/></button></div></section>

    <section id="boundaries" className="content-section"><SectionHeading index="06" kicker="VERIFICATION BOUNDARIES" title="清楚交代，验证到了哪一步。" description="文件推理、真实声卡与实时麦克风分别验收。"/><DeliveryStatus/><details className="capability-details"><summary>查看原实验快照中的完整能力记录</summary><div className="boundary-table">{(data?.capabilities||[]).map((item:RecordData)=><div className="boundary-row" key={item.id}><strong>{item.title}</strong><Badge status={item.status}/><p>{item.detail||item.description}</p></div>)}</div><p className="muted">以上状态来自冻结快照，不自动继承当前展示站的页面检查结果。</p></details></section>
    <LocalDemoGuide/>
    <section className="closing-section"><span className="eyebrow">PAN YANG / AUDIO ENGINEERING</span><h2>试听、实验、实现。<br/>每个结果都有来处。</h2><div><a className="button primary" href="#listen"><Headphones size={17}/>再听一组对比</a><a className="button outline" href="https://github.com/yang07-29/gtcrn-portfolio" target="_blank" rel="noreferrer"><Code2 size={17}/>展示站源码 <ArrowUpRight size={16}/></a></div></section>
   </div>
  </main>
  <footer className="site-footer page-width"><div><Brand compact/><p>基于 GTCRN 的轻量级通话语音增强与流式推理<br/>公开实验快照 · {data?.updatedAt?.slice(0,10)||'日期读取中'}</p></div><div><a href={assetUrl('audio/ATTRIBUTION.md')} target="_blank" rel="noreferrer">素材署名与许可 <ArrowUpRight size={13}/></a><a href={assetUrl('snapshot-manifest.json')} target="_blank" rel="noreferrer">快照文件身份 <ArrowUpRight size={13}/></a><a href="https://github.com/Xiaobin-Rong/gtcrn" target="_blank" rel="noreferrer">上游 GTCRN / MIT <ArrowUpRight size={13}/></a></div></footer>
  <nav className="mobile-jump-nav" aria-label="手机展示快捷导航">{[['work','我的工作'],['challenges','技术难点'],['experiments','真实结果'],['listen','试听对比']].map(([id,label],index)=><a href={`#${id}`} key={id} onClick={()=>setMenu(false)}><span>0{index+1}</span>{label}</a>)}</nav>
 </div>{batch&&<BatchDetails batch={batch} cases={cases} onClose={closeBatch}/>}</div>;
}
