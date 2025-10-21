# 介绍

欢迎使用 **@ldesign/shared**！这是一个专为 Vue 3 应用设计的高质量共享工具库，提供了丰富的工具函数、Hooks 和类型定义。

## 什么是 @ldesign/shared？

@ldesign/shared 是 LDesign 生态系统的核心工具库，它包含了在现代 Web 开发中经常用到的各种实用功能：

- **🛠️ 工具函数** - 字符串、数组、日期、通用工具等
- **🎣 Vue 3 Hooks** - 响应式的组合式函数
- **🏷️ 类型定义** - 完整的 TypeScript 类型支持

## 设计理念

### 类型安全优先

我们坚信类型安全是现代 JavaScript 开发的基石。@ldesign/shared 使用 TypeScript 编写，提供完整的类型定义，确保你在开发过程中获得最佳的智能提示和错误检查。

```typescript
// ✅ 类型安全的函数调用
const result = formatDate(new Date(), 'YYYY-MM-DD') // string

// ❌ TypeScript 会提示错误
const invalid = formatDate('invalid-date', 123) // Type error
```

### 模块化设计

支持按需导入，只打包你实际使用的功能，有效减少应用的打包体积。

```typescript
// 只导入需要的函数
import { debounce, throttle } from '@ldesign/shared'

// 而不是导入整个库
import * as shared from '@ldesign/shared' // ❌ 不推荐
```

### Vue 3 优化

专为 Vue 3 Composition API 设计，提供响应式的工具函数，与 Vue 3 的响应式系统完美集成。

```vue
<script setup>
import { useLocalStorage } from '@ldesign/shared'

// 响应式的本地存储
const [count, setCount] = useLocalStorage('count', 0)

// 自动同步到 localStorage
const increment = () => setCount(count.value + 1)
</script>
```

## 核心特性

### 🎯 类型安全

- 零 `any` 类型
- 完整的 TypeScript 类型定义
- 智能的类型推导
- 严格的类型检查

### 🧪 高质量

- 100% 测试覆盖率
- 严格的代码审查
- 持续集成和部署
- 性能优化

### 📦 轻量级

- 按需导入支持
- Tree-shaking 友好
- 最小化的运行时开销
- 无外部依赖（除了 Vue 3）

### 🔧 易于使用

- 直观的 API 设计
- 详细的文档和示例
- 一致的命名规范
- 良好的错误处理

## 适用场景

@ldesign/shared 适用于各种 Vue 3 项目：

- **企业级应用** - 提供稳定可靠的基础工具
- **中小型项目** - 快速开发，减少重复代码
- **组件库开发** - 作为基础依赖使用
- **原型开发** - 快速实现常见功能

## 浏览器支持

@ldesign/shared 支持所有现代浏览器：

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

对于需要支持旧版浏览器的项目，建议使用适当的 polyfill。

## 下一步

- [快速开始](/guide/getting-started) - 学习如何安装和使用
- [API 参考](/api/) - 查看完整的 API 文档
- [示例](/examples/) - 查看实际应用示例

## 社区

- [GitHub](https://github.com/ldesign/shared) - 源代码和问题反馈
- [Discord](https://discord.gg/ldesign) - 社区讨论
- [Twitter](https://twitter.com/ldesign) - 最新动态

## 贡献

我们欢迎所有形式的贡献！无论是报告 bug、提出功能建议，还是提交代码，都能帮助 @ldesign/shared 变得更好。

查看我们的[贡献指南](https://github.com/ldesign/shared/blob/main/CONTRIBUTING.md)了解更多信息。
