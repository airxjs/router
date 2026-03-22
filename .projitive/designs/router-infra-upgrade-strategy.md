# Router 基建升级与依赖同步策略（TASK-0005 产出）

## 1. 目标

本文档定义 `airx-router` 随 `airx` 主框架同步迭代的版本策略，明确 peerDependencies声明、Node/TypeScript 环境支持范围、CI 配置和发布节奏，确保 Router 不因落后而拖慢生态整体迭代。

---

## 2. 当前包状态

| 项目 | 当前版本 | peer dependency | 构建方式 |
|------|---------|----------------|---------|
| `airx-router` | `0.3.0-alpha.1` | `airx@^0.3.0-alpha.1` | TypeScript (`tsc`) |
| `airx`（依赖目标） | `0.4.0` | — | Vite library build |

**问题**：peerDependencies 声明的是 `^0.3.0-alpha.1`，而 airx 当前已发布 `0.4.0`，存在版本偏移。

---

## 3. 目标支持范围

```
airx-router@0.3.x+
├── peer: airx ^0.3.0 || ^0.4.0（需补齐 0.4.x 支持声明）
├── Node.js: >=16.0.0（从无声明 → 明确声明）
├── TypeScript: >=5.0.0（升级自 ~5.0.0，与 airx 保持同步）
└── 构建产物: ESM（统一采用标准 exports）
```

### 3.1 peerDependencies 更新规则

| 触发条件 | 操作 | 版本类型 |
|---------|------|---------|
| airx 发布 minor/patch（无 API 变化） | 扩展 `peerDependencies` 范围 | patch |
| airx 发布 minor（有新 API，Router 选择使用） | 更新 `peerDependencies` 下限 | minor |
| airx 发布 major（破坏性变更） | 更新 `peerDependencies`，发布新 major 或 new minor | major/minor |

### 3.2 Node.js 版本策略

| 阶段 | 支持范围 | 理由 |
|------|---------|------|
| 当前（0.3.x） | >=16.0.0 | Node.js 16 是最后一个需要明确支持的 LTS |
| 计划（0.4.x） | >=18.0.0 | Node.js 18 是当前 LTS，16 EOL 于 2023-09 |

---

## 4. Breaking Change 政策

以下情况视为 Router Breaking Change，需发布新 major：

| 类型 | 示例 |
|------|------|
| 路由匹配行为变更 | 嵌套路由匹配规则改变 |
| Public API 移除或重命名 | `useRouter()` 改名 |
| peerDependencies 下限提升 | airx 最低要求从 `^0.3.0` → `^0.4.0` |
| 配置格式变更 | `Route` 类型字段变化 |

以下不视为 Breaking Change（允许 minor 版本）：

| 类型 | 示例 |
|------|------|
| 新增路由类型 | 新增 `LazyRoute` |
| 性能优化 | 路由匹配算法优化 |
| 修复已有 Bug | 重定向双触发修复 |

---

## 5. 分阶段升级路径

### 5.1 短期（0.3.x 稳定阶段）

1. 补齐 `engines` 字段声明 `{ "node": ">=16.0.0" }`
2. 将 `peerDependencies` 从 `^0.3.0-alpha.1` 扩展至 `^0.3.0 || ^0.4.0`
3. 更新 devDependencies 中的 typescript 至 `~5.3.0`（与 airx 同步）

```json
// package.json 目标状态
{
  "engines": { "node": ">=16.0.0" },
  "peerDependencies": {
    "airx": "^0.3.0 || ^0.4.0"
  }
}
```

### 5.2 中期（0.4.x 发布阶段）

1. 同步使用 airx `0.4.0` API（若有新的 inject/provide 接口变化）
2. 验证 Router 在 airx `0.4.0` 下的行为正确性（参见 TASK-0006 验证矩阵）
3. 发布 `airx-router@0.3.x`（当前稳定 minor 系列）

### 5.3 与 airx 同步发布节奏

遵循跨项目发布协调策略（参见 yinxulai.github.io/.projitive/designs/release-coordination-policy.md）：

```
当 airx 发布新版本时：
- Day 1: airx 发布
- Day 2: airx-router 验证兼容性，更新 peerDependencies，发布
- Day 3: 主站完成升级验证
```

---

## 6. CI 验证配置

### 6.1 当前 CI 现状

- 仓库已有 `.github/workflows/` 目录
- 目标：在 CI 中验证 airx 目标版本范围的兼容性

### 6.2 矩阵测试建议

```yaml
# 建议在 CI 中添加矩阵测试
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    airx-version: ['^0.3.0', '^0.4.0']
```

### 6.3 门禁要求

| 检查项 | 命令 | 标准 |
|--------|------|------|
| 类型检查 | `tsc --noEmit` | 零 error |
| lint | `npm run lint` | 零 error |
| 单元测试 | `npm run test:run` | 100% pass |
| 构建产物 | `npm run build` | 生成 `output/index.js` 与 `output/index.d.ts` |

---

## 7. 风险矩阵

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| airx 信号 API 变更导致 Router 编译失败 | 中 | 高 | 在 `source/signal.ts` 适配层中收欛变更面 |
| peerDependencies 版本范围过宽引入行为不兼容 | 低 | 中 | 每次 airx 大版本都运行行为回归测试套件 |
| 多研究版本 Node 行为差异 | 低 | 低 | CI 矩阵测试覆盖 18/20/22 |

---

## 8. 验收标准

TASK-0005 完成时满足：

- [x] peerDependencies 目标范围已明确（≥0.3.0，含 0.4.x）
- [x] Node.js/TypeScript 支持范围已声明
- [x] Breaking Change 政策已书面化
- [x] 分阶段升级路径已定义
- [x] CI 矩阵测试方案已规划

---

## 9. 参考资料

- `package.json` — 当前依赖声明
- `.github/workflows/` — CI 配置
- `.projitive/designs/router-airx-compatibility-matrix.md` — 版本兼容矩阵
- `yinxulai.github.io/.projitive/designs/release-coordination-policy.md` — 发布协调策略
