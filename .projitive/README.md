# Projitive Governance Workspace

This directory (`.projitive/`) is the governance root for this project.

## Conventions
- Keep roadmap/task source of truth in .projitive governance store.
- Treat roadmap.md/tasks.md as generated views from governance store.
- Keep IDs stable (TASK-xxxx / ROADMAP-xxxx).
- Update report evidence before status transitions.

## Project Info
- Project: router
- Package: `airx-router`
- Role: AirxJS 生态的前端路由层，负责路由匹配、嵌套路由和跳转
- Tech Stack: TypeScript, Rollup, History, path-to-regexp, ESLint
- Primary Concern: 与 airx 核心版本的兼容性、路由行为正确性、示例与文档完整性

## Ecosystem Relation
- Dependency: 依赖 `airx` 作为 peer dependency
- Downstream Impact: 主站和基于 Airx 的应用路由行为都依赖本项目稳定性

## Current Governance Focus
- 建立兼容性矩阵与测试基线
- 收敛嵌套路由、重定向等核心行为规范
- 完善与 airx 核心的协同发布节奏
