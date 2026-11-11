"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { number, signed, RecordData } from "./shared";

export default function SeedContrast({batch,onOpen}:{batch?:RecordData;onOpen:()=>void}) {
  const [metric,setMetric]=useState("si_sdr_db");
  if(!batch)return null;
  const rows=["controlled_target","official_full"].map(dataset=>batch.metrics?.find((m:RecordData)=>m.dataset===dataset&&m.method==="E4-E3c"&&m.metricId===metric)).filter(Boolean) as RecordData[];
  const bound=Math.max(.0001,...rows.map(m=>Math.abs(m.value||0)+(m.spread||0)))*1.15,places=metric==="si_sdr_db"?3:5;
  const x=(v:number)=>250+v/bound*220;
  return <div className="seed-contrast"><div className="seed-contrast-heading"><div><span className="small-eyebrow">THE TRADE-OFF</span><h3>同样的适配，在两个范围里的表现。</h3><p>E4 相对等预算控制组 E3c；三种子 17 / 29 / 43。</p></div><div className="segmented"><button className={metric==="si_sdr_db"?"selected":""} aria-pressed={metric==="si_sdr_db"} onClick={()=>setMetric("si_sdr_db")}>SI-SDR</button><button className={metric==="stoi"?"selected":""} aria-pressed={metric==="stoi"} onClick={()=>setMetric("stoi")}>STOI</button></div></div>
    <div className="seed-chart">{rows.map(row=><div className="seed-chart-row" key={row.dataset}><div><strong>{row.dataset==="controlled_target"?"受控目标场景":"原始官方测试集"}</strong><span>{row.dataset==="controlled_target"?"适配的目标范围":"范围外的代价"}</span></div><svg viewBox="0 0 500 52" role="img" aria-label={`${row.dataset}：${signed(row.value,places)}，样本标准差${number(row.spread,places)}`}><line x1="30" y1="26" x2="470" y2="26" stroke="#e1e8e9"/><line x1="250" y1="5" x2="250" y2="47" stroke="#a5b8bd" strokeDasharray="3 3"/><rect x={Math.min(250,x(row.value))} y="18" width={Math.abs(x(row.value)-250)} height="16" rx="3" fill={row.value<0?"#c78b6b":"#3aa68e"}/><line x1={x(row.value-row.spread)} x2={x(row.value+row.spread)} y1="26" y2="26" stroke="#244b57" strokeWidth="1.6"/>{[row.value-row.spread,row.value+row.spread].map((v,i)=><line key={i} x1={x(v)} x2={x(v)} y1="20" y2="32" stroke="#244b57" strokeWidth="1.6"/>)}</svg><div className={`seed-value ${row.value<0?"negative":"positive"}`}><strong>{signed(row.value,places)} <small>{row.unit}</small></strong><span>± {number(row.spread,places)} · n = {row.n}</span></div></div>)}</div>
    <div className="seed-chart-scale"><span>负值：相对退化</span><span>0 · 无变化</span><span>正值：相对改善</span></div><div className="seed-chart-note"><p>误差线是三个种子均值之间的样本标准差，不是音频样本的置信区间；改善范围不外推为任意噪声都有效。</p><button className="text-button" onClick={onOpen}>查看完整协议 <ArrowUpRight size={14}/></button></div>
  </div>;
}
