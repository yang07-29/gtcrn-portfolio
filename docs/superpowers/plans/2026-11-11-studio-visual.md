# Light Audio Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按用户最终选择的白色主调和真实波形试听台，整体重做桌面与手机作品集并直接发布。

**Architecture:** 保留静态数据、音频播放器状态逻辑、实验筛选和证据弹窗，替换完整视觉系统；首屏重排为项目主题与试听工作台。实际波形共用尺度，时间刻度来自片段时长，不添加模拟电平或设备通过状态。按本地 skill 安装约定，由当前会话使用实际可用工具直接实施。

**Tech Stack:** React、TypeScript、Vite、GitHub Pages。

**Spec:** 用户最终选择“白色吧”，取代此前深色方向；保留手机端同步优化与完成直接发布的授权。

## Global Constraints

- 不改固定模型、E4 seed17、13 批次、3 案例、9 WAV 或原公开资源字节。
- 保留个人贡献、技术难点、比较基线、负结果、来源许可和未测试边界。
- 保留 44 像素手机触摸区、键盘操作、减少动效偏好、弹窗焦点与滚动行为。
- 使用原独立公开展示仓库和 GitHub Pages，不改变算法仓库权限。

## Review Focus

- 深蓝只用于波形、选择和真实播放状态，不表示硬件验收通过。
- 波形按共同幅值尺度绘制，刻度与实际时长一致，零/小误差/缺失值不混淆。
- 手机首屏、横屏与弹窗没有全局横向溢出，控件不被底部导航遮挡。
- 更换配色后波形、声谱图、误差棒、表格和证据仍清楚可读。
- 网站试听、文件推理、真实声卡和实时麦克风仍分开说明。

### Task 1: 完整视觉替换

**Files:** 修改 `src/styles.css`、`src/App.tsx`、`src/components/AudioComparison.tsx`、`src/components/SeedContrast.tsx`。

- [x] 替换视觉系统、首屏版式、图表色彩和真实波形时间刻度。
- [x] 运行现有测试、类型构建、快照身份核验。

### Task 2: 视觉验收与发布

**Files:** 新增验收记录，更新验证文档。

- [ ] 用可用浏览器实际检查桌面、手机、试听、筛选、图表及证据弹窗；记录实际验证范围。
- [ ] 通过公开资源审查后提交推送，核对 Pages 发布和线上资源身份。
- [ ] 保存截图、恢复临时视口并关闭任务预览，交付已验证网址。

本轮浏览器控制接口异常，可视与手机复查保持待验证；不使用旧截图替代本版证据。公开资源、构建与发布检查继续执行。
