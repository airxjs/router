# Code Style

## Core Principles

- **类型安全**：所有 TypeScript 代码必须类型正确
- **最小依赖**：不引入不必要的外部依赖
- **Tree-shakable**：ES modules 设计，支持按需导入

## Naming and Structure

### 文件组织
```
/source/           — 源码
  index.ts        — 主入口，导出所有公开 API
  router.ts       — 路由核心实现
  path.ts         — 路径处理工具
  signal.ts       — Signal 状态管理工具
  *.test.ts       — 测试文件
/output/           — 构建输出（不直接编辑）
```

### 命名规则
- **文件**：`kebab-case.ts`
- **类型/接口**：`PascalCase`
- **函数/变量**：`camelCase`
- **常量**：`SCREAMING_SNAKE_CASE`

### 公开 API（index.ts 导出）
- 所有公开 API 必须有完整的 JSDoc 注释
- 保持 API 稳定性，避免破坏性变更

## Testing and Validation

### 验证命令
```bash
pnpm run build   # TypeScript 编译
pnpm run lint    # ESLint 检查
pnpm run test    # Vitest 测试
pnpm run test:run  # Vitest 单次运行
```

### 测试要求
- 核心功能（router.ts）必须有单元测试
- 路径解析（path.ts）必须有测试覆盖
- 测试使用 Vitest + happy-dom

## Review Checklist

- [ ] TypeScript 类型完整
- [ ] ESLint 检查通过
- [ ] 所有测试通过
- [ ] 构建成功，输出正确
- [ ] 公开 API 有 JSDoc 注释
- [ ] 无破坏性变更（检查 CHANGELOG）

## Change Triggers

当以下情况发生时，需更新本文档：
- 引入新的代码规范或 linter 规则
- 调整公开 API
- 更新测试框架或配置
