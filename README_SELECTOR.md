# @ldesign/shared - 选择器系统

## 概述

`@ldesign/shared` 提供了一套完整的**无头选择器系统**，采用**协议驱动 + 无头组件**架构，帮助您快速构建统一、灵活、高性能的选择器组件。

## 特性

- 🎯 **协议驱动** - 类型安全的接口规范
- 🧠 **无头组件** - 逻辑和 UI 完全分离
- 📱 **响应式** - 自动适配移动端和桌面端
- ⌨️ **键盘导航** - 完整的键盘快捷键支持
- 🎨 **灵活定制** - UI 和样式完全自主控制
- 🔌 **解耦设计** - 包之间完全独立
- 📦 **轻量级** - 只引入逻辑代码（~5KB）
- 🌙 **深色模式** - 开箱即用的深色模式支持

## 快速开始

### 安装

```bash
# 作为 workspace 依赖已存在
pnpm install
```

### 基础用法

```vue
<script setup lang="ts">
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import type { SelectorOption } from '@ldesign/shared/protocols'
import { renderIcon } from '@ldesign/shared/icons'

// 1. 定义选项
const options: SelectorOption[] = [
  { value: 'small', label: '小号', badge: '12px' },
  { value: 'medium', label: '中号', badge: '14px' },
  { value: 'large', label: '大号', badge: '16px' }
]

// 2. 使用无头逻辑
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options,
  modelValue: ref('medium'),
  onSelect: (value) => console.log('选中:', value)
})

// 3. 使用响应式弹出
const { popupStyle } = useResponsivePopup({
  mode: 'auto', // 自动适配
  triggerRef,
  panelRef,
  isOpen: computed(() => state.isOpen)
})
</script>

<template>
  <div>
    <!-- 触发器 -->
    <button ref="triggerRef" @click="actions.toggle">
      <span v-html="renderIcon('ALargeSmall')" />
      选择尺寸
    </button>

    <!-- 面板 -->
    <Teleport to="body">
      <div v-if="state.isOpen" ref="panelRef" :style="popupStyle" @click.stop>
        <div 
          v-for="option in state.filteredOptions"
          :class="{ active: state.selectedValue === option.value }"
          @click="actions.select(option.value)"
        >
          {{ option.label }} - {{ option.badge }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
```

## 核心 API

### useHeadlessSelector

无头选择器 - 提供完整的状态管理和交互逻辑。

```typescript
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options,          // 选项列表
  modelValue,       // 当前值
  searchable,       // 是否可搜索
  onSelect,         // 选择回调
})
```

**返回值**：
- `state` - 状态对象（isOpen, selectedValue, filteredOptions 等）
- `actions` - 操作方法（open, close, toggle, select 等）
- `triggerRef` - 触发器元素引用
- `panelRef` - 面板元素引用

### useResponsivePopup

响应式弹出 - 自动适配屏幕尺寸。

```typescript
const { currentMode, popupStyle } = useResponsivePopup({
  mode: 'auto',     // 'dropdown' | 'dialog' | 'auto'
  triggerRef,       // 触发器引用
  panelRef,         // 面板引用
  placement,        // 弹出位置
  breakpoint        // 断点值
})
```

**返回值**：
- `currentMode` - 当前模式（dropdown 或 dialog）
- `popupStyle` - 弹出样式对象（position, top, left 等）
- `isMobile` - 是否移动端
- `updatePosition` - 手动更新位置

### 可用图标

```typescript
import { renderIcon, getIconPath } from '@ldesign/shared/icons'

// 方式1：渲染 SVG 字符串
const svg = renderIcon('Palette', { size: 24 })

// 方式2：获取 path 数据
const path = getIconPath('Palette')
```

**可用图标**：
- `Palette` - 调色板（颜色选择器）
- `Languages` - 语言（语言切换器）
- `ALargeSmall` - 字号（尺寸选择器）
- `LayoutTemplate` - 布局（模板选择器）
- `ChevronDown`, `X`, `Check`, `Search`

## 键盘导航

所有使用无头选择器的组件自动支持：

| 按键 | 操作 |
|------|------|
| `↑` / `↓` | 导航选项 |
| `Enter` | 确认选择 |
| `Esc` | 关闭选择器 |
| `Home` / `End` | 首/尾选项 |
| `Tab` | 关闭选择器 |

## 响应式行为

使用 `auto` 模式时：

- **屏幕 < 768px** → 居中对话框
- **屏幕 ≥ 768px** → 下拉菜单

```typescript
useResponsivePopup({
  mode: 'auto',
  breakpoint: 768 // 可自定义
})
```

## 样式定制

### 方式1：使用 Design Tokens（推荐）

```typescript
import '@ldesign/shared/styles/selector-tokens.css'
```

```css
.my-selector {
  background: var(--ld-selector-trigger-bg);
  border-radius: var(--ld-selector-trigger-radius);
}
```

### 方式2：完全自定义

```css
.my-custom-selector {
  /* 你的样式 */
}
```

## 实现示例

查看完整的实现示例：

- [SizeSelector](../size/src/vue/SizeSelector.vue) - 尺寸选择器
- [ThemePicker](../color/src/vue/ThemePicker.vue) - 颜色选择器
- [LocaleSwitcher](../i18n/src/adapters/vue/components/LocaleSwitcher.vue) - 语言切换器
- [TemplateSelector](../template/src/components/TemplateSelector.vue) - 模板选择器

## 文档

- [使用指南](./docs/SELECTOR_USAGE_GUIDE.md) - 详细的使用说明
- [协议规范](./docs/SELECTOR_PROTOCOL.md) - 接口定义和规范
- [迁移指南](./docs/SELECTOR_MIGRATION_GUIDE.md) - 从旧版本升级

## 导出

```typescript
// 协议
import type { 
  SelectorConfig, 
  SelectorOption, 
  SelectorState, 
  SelectorActions 
} from '@ldesign/shared/protocols'

// Composables
import { 
  useHeadlessSelector, 
  useResponsivePopup 
} from '@ldesign/shared/composables'

// Hooks
import { useBreakpoint } from '@ldesign/shared/hooks'

// 图标
import { renderIcon, getIconPath, lucideIcons } from '@ldesign/shared/icons'

// 工具函数
import { 
  calculatePopupPosition,
  filterOptions,
  scrollToSelected
} from '@ldesign/shared/utils/selector-helpers'

// 样式
import '@ldesign/shared/styles/selector-tokens.css'
```

## License

MIT

