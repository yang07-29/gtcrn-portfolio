import {Monitor, ShieldCheck} from 'lucide-react';
import delivery from '../data/delivery.json';
import {Badge} from './shared';

export function SnapshotBanner() {
  return <div className="snapshot-banner" role="note"><ShieldCheck size={16}/><strong>公开实验快照</strong><span>试听与图表来自已保存实验；新增测试在本机工作台完成。</span><a href="#local-demo">本机演示说明 →</a></div>;
}

export default function DeliveryStatus() {
  return <aside className="delivery-status" aria-label="当前运行验收">
    <div className="delivery-heading"><span><ShieldCheck size={18}/><strong>当前运行验收</strong></span><small>网页展示、模型运行与真实设备分别验收</small></div>
    <div className="delivery-grid">
      <div><span>本机真实模型联调</span><strong>{delivery.localIntegration.checkCount} 项检查通过</strong><p>已有本机执行、回传与重复性证据。</p></div>
      <div><span>云端派发与结果回传</span><Badge status="pending">待验证</Badge><p>原 Sites 入口受 403 拦截；本站展示固定快照。</p></div>
      <div><span>真实声卡 / 实时麦克风</span><Badge status="not_tested">未测试</Badge><p>软件输出和网页播放不代表设备链路已通过。</p></div>
    </div>
    <p className="delivery-footnote">{delivery.boundary}本页面不接收音频上传，也不执行模型推理。</p>
  </aside>;
}

export function LocalDemoGuide() {
  return <section id="local-demo" className="content-section local-demo-guide">
    <div className="section-heading"><div><p className="eyebrow">LOCAL EXPERIMENT WORKSPACE</p><h2>需要运行新音频？在本机继续。</h2><p>这个公开网址用于分享实验快照；陌生 WAV 测试由电脑上的独立工作台执行。</p></div><Monitor size={26}/></div>
    <ol><li><strong>打开本机工作台</strong><p>在安装项目的电脑上，双击桌面的「GTCRN本地工作台」快捷方式。</p></li><li><strong>导入音频并运行</strong><p>选择输入 WAV；有对应干净参考时再添加参考。使用冻结 E4 seed17 模型执行。</p></li><li><strong>查看新的结果</strong><p>在本机查看输出、试听、指标和日志。没有合格参考时，不计算参考质量分数。</p></li></ol>
    <div className="notice"><ShieldCheck size={18}/><span>本机记录与本页快照独立保存。新结果经人工核对并显式发布后，才会进入公开作品集。</span></div>
  </section>;
}
