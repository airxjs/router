# Tasks

This file is generated from .projitive sqlite tables by Projitive MCP. Manual edits will be overwritten.

## TASK-0004 | DONE | 完善 Router 集成文档
- owner: GitHub Copilot
- summary: 补充与 airx 主框架协作的接入文档、示例与限制说明。
- updatedAt: 2026-03-21T15:09:05.893Z
- roadmapRefs: ROADMAP-0001
- links:
  - README.md
  - .projitive/README.md
## TASK-0003 | DONE | 补齐路由行为测试与示例覆盖
- owner: GitHub Copilot
- summary: 围绕嵌套路由、重定向和历史模式建立首批行为验证。
- updatedAt: 2026-03-21T15:07:00.957Z
- roadmapRefs: ROADMAP-0001
- links:
  - source/router.test.ts
  - vitest.config.ts
  - vitest.setup.ts
  - package.json
## TASK-0007 | DONE | 审计 Router 与 Signals 交互语义并定义回归用例
- owner: yinxulai
- summary: 完成规划与决策。识别了 Router 中依赖 signals 的状态传播路径（currentElement signal），确认了全局 Signal 单例风险，定义了 8 个回归测试用例。
- updatedAt: 2026-03-21T14:47:25.121Z
- roadmapRefs: ROADMAP-0002
- links:
  - source/router.ts
  - source/signal.ts
  - designs/research/TASK-0007.implementation-research.md
  - designs/core/architecture.md
  - designs/core/style-guide.md
  - .projitive/reports/TASK-0007-execution-report.md
  - .projitive/designs/router-airx-compatibility-matrix.md
## TASK-0006 | TODO | 定义 Router 功能正确性验证矩阵
- owner: yinxulai
- summary: 仅做规划与决策。覆盖路由匹配、导航守卫、history/hash 行为、重定向与嵌套路由，明确可用性门禁与回归策略。
- updatedAt: 2026-03-21T14:20:51.095Z
- roadmapRefs: ROADMAP-0002
- links:
  - home/yinxulai/Project/airxjs/router/source/router.ts
  - home/yinxulai/Project/airxjs/router/.projitive/designs/router-airx-compatibility-matrix.md
## TASK-0005 | TODO | 建立 Router 基建升级与依赖同步策略
- owner: yinxulai
- summary: 仅做规划与决策。定义 router 随 airx 同步迭代的版本策略，明确 peerDependencies、Node/TS、CI 与发布节奏。
- updatedAt: 2026-03-21T14:20:34.128Z
- roadmapRefs: ROADMAP-0002
- links:
  - home/yinxulai/Project/airxjs/router/package.json
  - home/yinxulai/Project/airxjs/router/.github/workflows
  - home/yinxulai/Project/airxjs/router/.projitive/designs/router-airx-compatibility-matrix.md
## TASK-0002 | DONE | 梳理 Router 与 Airx 版本兼容矩阵
- owner: GitHub Copilot
- summary: 完成 Router 对 Airx 运行时模型的依赖梳理，并形成兼容矩阵文档。
- updatedAt: 2026-03-21T14:00:06.495Z
- roadmapRefs: ROADMAP-0001
- links:
  - source/router.ts
  - source/path.ts
  - .projitive/designs/router-airx-compatibility-matrix.md
  - home/yinxulai/Project/yinxulai.github.io/package.json
## TASK-0001 | DONE | Bootstrap governance workspace
- owner: GitHub Copilot
- summary: 初始化 airx-router 项目治理骨架，并补充项目定位、技术栈和治理重点说明。
- updatedAt: 2026-03-21T13:50:22.754Z
- roadmapRefs: ROADMAP-0001
- links:
  - .projitive/README.md
  - .projitive/tasks.md
  - .projitive/roadmap.md
