# GTCRN LAB · 潘洋的语音增强作品集

公开实验快照的独立展示站，使用 React、Vite 和 GitHub Pages。提供同位置 A/B 试听、统一尺度波形和时频谱、三种子结果、实验档案及脱敏证据下载。

**公开网址：[打开 GTCRN 作品集](https://yang07-29.github.io/gtcrn-portfolio/)**

## 展示边界

- 固定 E4 seed17，ONNX SHA256 为 `356bb3c94765b354138a40c9c09e0de7d39684c76e2b43a706c509e8ecb5ab03`。
- 保存 13 组冻结批次、3 个公开案例、9 个试听 WAV。`public/snapshot-manifest.json` 绑定公开文件的完整字节身份。
- 本站为只读快照。音频上传、任务管理和实际模型推理在本机独立工作台完成，记录不会自动同步。
- 原 Sites 云端闭环仍待验证；真实声卡、实时麦克风及耳机物理端到端时延未测试。没有证据时保留“无法确认”。
- GTCRN 架构来自 Rong Xiaobin 的开源项目；项目贡献是复现、场景适配、评测与工程集成。目标场景的改善不能外推到任意噪声，负结果与原域退化一并保存。

## 本地运行

使用 Node.js 24：

```sh
npm ci
npm test
npm run verify
npm run build
npm run preview -- --port 5188 --strictPort
```

打开终端打印的 `/gtcrn-portfolio/` 地址。直接双击构建后的 HTML 不作为支持的启动方式。

## 发布与更新

GitHub Pages 采用 Actions 工作流。向 `main` 推送会验证快照、测试、构建，再发布 `dist`，不需要在仓库保存个人访问令牌。仓库仅存公开展示代码与已批准的公开资源；算法工程及其原始数据、模型、日志不在此仓库。

`scripts/import-snapshot.mjs <existing-curated-site-checkout>` 仅用于首次导入身份记录；已有 manifest 时拒绝覆盖。后续更新须先审阅公开范围，并保留历史快照，不修改冻结实验成绩。

## 来源与许可

试听素材的逐条署名、许可及截取/统一增益说明见 [ATTRIBUTION.md](public/audio/ATTRIBUTION.md)。上游 GTCRN 及打包组件许可见 [licenses](licenses)。展示代码公开可查，不代表数据素材和上游代码适用同一许可。

## 验收

见 [验证记录](docs/VERIFICATION.md)。部署成功、HTTP 可达、浏览器交互、主观听感和真实硬件是不同验收项。
