# Interview Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 面试官可快速核对本人工作、难点处理和真实结果，手机可顺畅阅读与试听。

**Architecture:** 保留静态快照适配，新增独立项目叙事组件。所有指标从现有批次读取；小数格式修复独立于数据。由当前会话直接执行，按本地 skill 安装约定使用可用工具与现有授权。

**Tech Stack:** React 19、TypeScript、Vite、GitHub Pages。

**Spec:** `docs/INTERVIEW_PRESENTATION_SPEC.md`

## Global Constraints

- 冻结模型、E4 seed17、13 批次、3 案例、9 WAV 和全部公开快照字节不改动。
- 不新增后端、训练、指标或硬件通过结论；保留负结果和未测试标记。
- 沿用现有公开仓库和 GitHub Pages；算法仓库保持私有。

## Review Focus

- 缺少指标：显示无法确认，不能显示虚构零值或完成数。
- 很小但非零的误差：科学记数法保留，不得变为 0.000。
- 两种增益基线：案例输出对带噪输入，与研究 E4 对 E3c 分开解释。
- 窄屏/短屏：操作目标足够大、筛选不隐藏、弹窗不遮挡关闭入口。
- 证据入口：困难处理与批次相连，负结果和所有历史批次仍可达。

### Task 1: 叙事与指标精度

**Files:** 新增 `src/components/ProjectStory.tsx`、`src/metric-format.ts`；修改 `src/App.tsx`、`src/components/BatchDetails.tsx`；新增 `tests/metric-format.test.mjs`。

**Interfaces:** 项目叙事接收 `batches` 和 `onOpen(id)`；格式函数接收数值和精度、返回显示字符串。

- [x] 为科学记数、真实零值与缺失值添加回归测试并确认原缺陷。
- [x] 明确上游/本人归属，补充公平对照、来源泛化和流式状态三个难点的处理与证据。
- [x] 重新排列主内容；解释两种增益基线；修复详情小数误差显示。
- [x] 运行测试、类型/构建和快照身份检查。

### Task 2: 手机体验与发布

**Files:** 修改 `src/styles.css`、`src/App.tsx`；新增验收文档。

**Interfaces:** 手机快捷导览使用已有锚点；保持试听与批次弹窗现有接口。

- [x] 增大媒体控件、进度条触摸区与关闭按钮，结果数字及档案筛选适配窄屏。
- [x] 用真实浏览器检查桌面、320/390 宽与横向短屏；验证导览、试听保位、误差详情、证据链接、负结果和所有档案。
- [x] 保存截图与验收结果；通过发布审查后提交推送并核对线上包和冻结资源。
- [x] 恢复浏览器尺寸并停止本任务预览服务，交付网址和实际验证范围。

完成依据：[面试展示验收](../../INTERVIEW_PRESENTATION_ACCEPTANCE_20261111.md) 与 [线上验证记录](../../VERIFICATION.md)。
