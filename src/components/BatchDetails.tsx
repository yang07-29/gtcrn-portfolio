import {useEffect,useRef} from 'react';
import {X,ArrowDownToLine} from 'lucide-react';
import BatchAudioEvidence from './BatchAudioEvidence';
import {Badge,EvidenceList,number,RecordData} from './shared';

export default function BatchDetails({batch,cases,onClose}:{batch:RecordData;cases:RecordData[];onClose:()=>void}){
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onClose();}
   if(event.key==='Tab'){
    const elements=Array.from(panel.current?.querySelectorAll<HTMLElement>('button,a[href],input,summary,[tabindex="0"]')||[]).filter(element=>element.offsetParent!==null);
    const first=elements[0],last=elements.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};
 },[onClose]);
 return <div className="modal-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={panel} className="batch-modal" role="dialog" aria-modal="true" aria-labelledby="batch-title">
  <div className="modal-topline"><span className="eyebrow">EXPERIMENT RECORD</span><button className="icon-button" onClick={onClose} aria-label="关闭实验详情"><X size={21}/></button></div>
  <h2 id="batch-title">{batch.title}</h2><Badge status={batch.status||'frozen'}/><p className="modal-summary">{batch.summary}</p>
  <BatchAudioEvidence cases={cases.filter(item=>item.batchId===batch.id)}/>
  {[["实验目的",batch.purpose],["实验方法",batch.method],["实验结论",batch.conclusion]].filter(item=>item[1]).map(([title,text])=><div className="detail-section" key={title}><h3>{title}</h3><p>{text}</p></div>)}
  {!!batch.metrics?.length&&<div className="table-scroll"><table><thead><tr><th>指标与范围</th><th>实测结果</th><th>统计口径</th></tr></thead><tbody>{batch.metrics.map((metric:RecordData,index:number)=>{const count=['项','条','次','组','个'].includes(metric.unit)&&Number.isInteger(metric.value);const precision=count?0:metric.metricId==='stoi'||metric.name?.includes('STOI')?6:3;return <tr key={index}><td><strong>{metric.name}</strong><small>{metric.dataset} {metric.method}</small></td><td className="metric-number">{number(metric.value,precision)}{metric.spread!==undefined?` ± ${number(metric.spread,precision)}`:''} {metric.unit}</td><td>{metric.aggregation}<small>{metric.definition}</small></td></tr>;})}</tbody></table></div>}
  {!!batch.boundaries?.length&&<div className="detail-section boundary-note"><h3>适用范围与限制</h3><ul>{batch.boundaries.map((item:string)=><li key={item}>{item}</li>)}</ul></div>}
  {!!batch.questions?.length&&<details className="detail-section"><summary>复现中的关键问题</summary><ul>{batch.questions.map((item:string|RecordData,index:number)=><li key={index}>{typeof item==='string'?item:<><strong>{item.q}</strong><p>{item.a}</p></>}</li>)}</ul></details>}
  {!!batch.evidence?.length&&<div className="detail-section"><h3><ArrowDownToLine size={16}/> 核对来源证据</h3><EvidenceList items={batch.evidence}/></div>}
 </section></div>;
}
