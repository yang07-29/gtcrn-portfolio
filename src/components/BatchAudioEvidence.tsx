"use client";
import { useEffect, useState } from "react";
import AudioComparison from "./AudioComparison";
import { api, ErrorNotice, Loading, RecordData } from "./shared";

export default function BatchAudioEvidence({cases}:{cases:RecordData[]}) {return cases.length?<BatchAudioContent key={cases.map(c=>c.id).join(",")} cases={cases}/>:null;}
function BatchAudioContent({cases}:{cases:RecordData[]}) {
  const [active,setActive]=useState(cases[0].id),[item,setItem]=useState<RecordData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[refresh,setRefresh]=useState(0);
  function select(id:string){setActive(id);setLoading(true);setItem(null);setError("");setRefresh(n=>n+1);}
  useEffect(()=>{let current=true;api(`/api/public/cases/${encodeURIComponent(active)}`).then(value=>{if(current)setItem(value.case||value);}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});return()=>{current=false;};},[active,refresh]);
  return <section className="batch-audio-evidence"><h3>本批次的公开试听证据</h3><p>以下为已保存的教学摘录，完整批次结论仍以原始协议为准。</p>{cases.length>1&&<div className="batch-audio-tabs">{cases.map(c=><button key={c.id} className={active===c.id?"active":""} aria-pressed={active===c.id} onClick={()=>select(c.id)}>{c.title}</button>)}</div>}{loading?<Loading text="正在读取批次试听证据…"/>:error?<ErrorNotice message={error} onRetry={()=>select(active)}/>:item?<AudioComparison item={item} compact/>:null}</section>;
}
