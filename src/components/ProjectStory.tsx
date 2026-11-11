import {ArrowDown,ArrowUpRight,Check,ChevronDown,Cpu,GitBranch,SlidersHorizontal} from 'lucide-react';
import {measurementText} from '../metric-format';
import {number,RecordData,SectionHeading,signed} from './shared';

type StoryProps={batches:RecordData[];onOpen:(id:string)=>void};
const metric=(batches:RecordData[],id:string,name:string)=>batches.find(batch=>batch.id===id)?.metrics?.find((item:RecordData)=>item.name===name)?.value;

function ControlledBranches(){return <div className="protocol-figure" aria-label="同父模型、同预算的三分支对照实验">
  <div className="protocol-caption"><GitBranch size={16}/><span>怎样排除“只是多训练了”的影响</span></div>
  <div className="parent-node"><span>同一 E3 父检查点</span><small>模型 · Adam · 随机状态</small></div><div className="branch-connector" aria-hidden="true"/>
  <div className="branch-nodes">{[['E3c','原域续训','等预算控制组'],['E4','目标噪声增广','场景适配'],['E5','去除波形损失','损失消融']].map(([id,title,subtitle])=><div className={id==='E4'?'focus':''} key={id}><b>{id}</b><strong>{title}</strong><small>{subtitle}</small></div>)}</div>
  <div className="protocol-foot"><Check size={15}/><span>每支额外 5,000 次更新 · seed 17 / 29 / 43</span></div>
</div>;}

export function ProjectContribution({batches,onOpen}:StoryProps){
  const work=[
    {icon:SlidersHorizontal,title:'搭建训练与受控实验',body:'固定数据清单，构建 E3c / E4 / E5 同预算分支，完成目标噪声适配、波形损失消融与三种子复验。',id:'three-seed-replication',link:'核对训练对照与复验'},
    {icon:GitBranch,title:'补充来源级泛化评估',body:'新增 12 条原始噪声录音，按来源等权汇总，检查不同噪声与增强强度的取舍，保留退化案例。',id:'external-noise-12',link:'核对新增来源评估'},
    {icon:Cpu,title:'交付独立流式推理',body:'用 NumPy 与 ONNX Runtime 实现无需 PyTorch 的文件推理，处理跨帧状态、任意分块、尾帧输出和模型身份校验。',id:'file-streaming',link:'核对流式运行结果'}
  ];
  return <section id="work" className="content-section"><SectionHeading index="01" kicker="MY CONTRIBUTION" title="我做了什么。" description="围绕 16 kHz 单通道通话语音，完成场景适配、实验验证和可运行交付。"/>
    <div className="ownership-note"><span><strong>上游提供</strong>GTCRN 网络架构与开源实现</span><ArrowDown size={17}/><span><strong>本项目完成</strong>训练与数据协议、对照消融、评估分析、流式封装</span></div>
    <div className="work-layout"><div className="work-list">{work.map((item,index)=><article key={item.id}><span className="work-index">0{index+1}</span><div><item.icon size={21}/><h3>{item.title}</h3><p>{item.body}</p><button className="text-button" disabled={!batches.some(batch=>batch.id===item.id)} onClick={()=>onOpen(item.id)}>{item.link}<ArrowUpRight size={14}/></button></div></article>)}</div><ControlledBranches/></div>
    <p className="source-credit">网络架构来自 Rong Xiaobin 的 <a href="https://github.com/Xiaobin-Rong/gtcrn" target="_blank" rel="noreferrer">GTCRN 开源实现 <ArrowUpRight size={12}/></a>；本项目训练协议与原论文不同。</p>
  </section>;
}

export function TechnicalChallenges({batches,onOpen}:StoryProps){
  const cases=metric(batches,'file-streaming','数值检查');
  const error=metric(batches,'file-streaming','数值最大绝对差');
  const sourceGain=metric(batches,'external-noise-12','E4−E3c · SI-SDR');
  return <section id="challenges" className="content-section"><SectionHeading index="02" kicker="TECHNICAL DECISIONS" title="我怎样解决技术难点。" description="每个处理都有对应的实验记录，能继续追到方法、限制和证据摘录。"/>
    <div className="challenge-list">
      <details className="challenge-item" name="technical-challenges" open><summary><span className="challenge-number">01</span><span><strong>适配收益，来自增广还是多训练？</strong><small>我用同父状态、同预算对照，再做三种子复验。</small></span><ChevronDown size={20}/></summary><div className="challenge-body"><dl><div><dt>难在哪里</dt><dd>若只把适配模型和较早的父模型比较，额外训练量会混入“适配收益”。</dd></div><div><dt>我的处理</dt><dd>从同一 E3 父状态分出原域续训 E3c、目标增广 E4、去波形损失 E5；保留 Adam 与随机状态，各续训 5,000 次。再对 17 / 29 / 43 三个种子复验。</dd></div><div><dt>怎样验证</dt><dd>在相同冻结测试与共同有效样本上比较；报告种子均值和样本标准差，原官方集退化也保留。</dd></div></dl><div className="challenge-conclusion"><p>因此，目标场景结果的基线是<strong>等预算 E3c</strong>，不是未经处理的输入，也不是原论文成绩。</p><button className="text-button" onClick={()=>onOpen('three-seed-replication')}>查看三种子证据<ArrowUpRight size={15}/></button></div></div></details>
      <details className="challenge-item" name="technical-challenges"><summary><span className="challenge-number">02</span><span><strong>任意分块，怎样保持输出连续？</strong><small>我把频谱缓存、网络状态与 OLA 合成状态跨块保存。</small></span><ChevronDown size={20}/></summary><div className="challenge-body"><dl><div><dt>难在哪里</dt><dd>文件块边界不一定对齐 256 点步长；每块独立处理会重置上下文，尾部也可能丢样本。</dd></div><div><dt>我的处理</dt><dd>用 NumPy 增量 STFT / iSTFT 与 OLA 保存分析合成缓存，显式传递 ONNX 网络状态；flush 补齐尾帧并按原长度输出，reset 用于开始新的流。</dd></div><div><dt>怎样验证</dt><dd>覆盖不同长度与分块，检查保长、flush / reset、前缀因果和参考实现一致性。{typeof cases==='number'&&typeof error==='number'?<><strong>{number(cases,0)} 组数值对照</strong>的最大绝对差为 <strong>{measurementText(error)}</strong>，低于 1e-4 验收阈值。</>:<>数值验收结果无法确认。</>}</dd></div></dl><div className="challenge-conclusion"><p>这是文件驱动的软件流式验证；<strong>真实声卡、麦克风和芯片部署未测试。</strong></p><button className="text-button" onClick={()=>onOpen('file-streaming')}>查看数值与性能证据<ArrowUpRight size={15}/></button></div></div></details>
      <details className="challenge-item" name="technical-challenges"><summary><span className="challenge-number">03</span><span><strong>混音变多，是否就能证明泛化？</strong><small>我按噪声原录音统计，单独补充新增来源检查。</small></span><ChevronDown size={20}/></summary><div className="challenge-body"><dl><div><dt>难在哪里</dt><dd>同一录音的切片与不同 SNR 混音彼此相关，条数增加不等于独立来源增加；平均分也可能掩盖退化。</dd></div><div><dt>我的处理</dt><dd>登记 4 类声音、12 条新增噪声原录音；固定 seed17 模型和原有 4 句语音，构造 384 条混音及 8 个干净对照，按原录音等权汇总，保留干湿混合诊断。</dd></div><div><dt>怎样验证</dt><dd>新增来源相对 E3c 的 SI-SDR 均值为 <strong>{signed(sourceGain,2)} dB</strong>，部分来源仍退化；不能只挑键盘改善案例来代表所有噪声。</dd></div></dl><div className="challenge-conclusion"><p>它支持<strong>新增噪声来源迁移</strong>的结论；只有 seed17、既有说话人，不是全新说话人盲测。</p><button className="text-button" onClick={()=>onOpen('external-noise-12')}>查看来源与负结果<ArrowUpRight size={15}/></button></div></div></details>
    </div>
  </section>;
}
