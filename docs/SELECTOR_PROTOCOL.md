# 选择器协议规范

## 概述

选择器协议定义了统一的选择器接口规范，确保所有选择器组件具有一致的交互行为和 API 设计。

**版本**: v1.0.0  
**文件**: `packages/shared/src/protocols/selector.ts`

## 核心接口

### SelectorConfig - 配置协议

定义选择器的基础配置：

```typescript
interface SelectorConfig {
  icon: string                               // Lucide 图标名称
  popupMode: 'dropdown' | 'dialog' | 'auto' // 弹出模式
  listStyle: 'simple' | 'grid' | 'card'     // 列表样式
  searchable?: boolean                       // 是否可搜索
  breakpoint?: number                        // 响应式断点（px）
}
```

**字段说明**：

- `icon`: 使用的 Lucide 图标名称
  - `'Palette'` - 颜色选择器
  - `'Languages'` - 语言切换器
  - `'ALargeSmall'` - 尺寸选择器
  - `'LayoutTemplate'` - 模板选择器

- `popupMode`: 弹出方式
  - `'dropdown'` - 始终使用下拉菜单
  - `'dialog'` - 始终使用居中对话框
  - `'auto'` - 根据屏幕尺寸自动选择

- `listStyle`: 列表布局样式
  - `'simple'` - 简洁列表（适合少量选项）
  - `'grid'` - 网格布局（适合色块等）
  - `'card'` - 卡片布局（适合带描述的选项）

- `searchable`: 是否支持搜索过滤

- `breakpoint`: 响应式断点，用于 `auto` 模式（默认 768px）

### SelectorOption - 选项协议

定义选项数据格式：

```typescript
interface SelectorOption<T = any> {
  value: T                     // 选项值
  label: string                // 显示标签
  description?: string         // 描述文本
  icon?: string                // 图标
  badge?: string               // 徽章文本
  disabled?: boolean           // 是否禁用
  metadata?: Record<string, any> // 自定义元数据
}
```

**字段说明**：

- `value`: 选项的值（任意类型）
- `label`: 显示的文本
- `description`: 可选的描述信息
- `icon`: 可选的图标（可以是 emoji 或 Lucide 图标名称）
- `badge`: 可选的徽章文本
- `disabled`: 是否禁用此选项
- `metadata`: 自定义数据（如颜色值、尺寸等）

### SelectorState - 状态协议

选择器的运行时状态：

```typescript
interface SelectorState {
  isOpen: boolean              // 是否打开
  isSearching: boolean         // 是否搜索中
  searchQuery: string          // 搜索词
  selectedValue: any           // 当前选中值
  filteredOptions: SelectorOption[] // 过滤后的选项
  activeIndex: number          // 激活的选项索引
}
```

### SelectorActions - 操作协议

选择器支持的操作方法：

```typescript
interface SelectorActions {
  open: () => void              // 打开选择器
  close: () => void             // 关闭选择器
  toggle: () => void            // 切换状态
  select: (value: any) => void  // 选择选项
  search: (query: string) => void  // 搜索
  navigateNext: () => void      // 下一个选项（↓）
  navigatePrev: () => void      // 上一个选项（↑）
  confirmActive: () => void     // 确认当前激活项（Enter）
}
```

## 交互规范

### 键盘导航

所有遵循协议的选择器必须支持以下键盘操作：

| 按键 | 操作 |
|------|------|
| `Escape` | 关闭选择器，焦点返回触发器 |
| `ArrowDown` / `↓` | 移动到下一个选项 |
| `ArrowUp` / `↑` | 移动到上一个选项 |
| `Enter` | 确认选择当前激活的选项 |
| `Home` | 跳转到第一个选项 |
| `End` | 跳转到最后一个选项 |
| `Tab` | 关闭选择器 |

### 鼠标交互

| 操作 | 行为 |
|------|------|
| 点击触发器 | 打开/关闭选择器 |
| 点击选项 | 选择该选项并关闭（可配置） |
| 点击外部 | 关闭选择器 |
| 悬停选项 | 高亮该选项（更新 activeIndex） |

### 触摸交互

| 操作 | 行为 |
|------|------|
| 点击触发器 | 打开/关闭选择器 |
| 点击选项 | 选择该选项并关闭 |
| 点击遮罩 | 关闭选择器（dialog 模式） |

## 响应式行为

### Auto 模式

当 `popupMode` 为 `'auto'` 时：

- **屏幕宽度 < breakpoint**：使用 `dialog` 模式（居中弹窗）
- **屏幕宽度 ≥ breakpoint**：使用 `dropdown` 模式（下拉菜单）

默认断点：768px

### Dropdown 模式

- 弹出位置：触发器下方（或上方，如果下方空间不足）
- 自动溢出处理：超出视口时自动调整位置
- 滚动时更新位置

### Dialog 模式

- 弹出位置：屏幕居中
- 背景遮罩：半透明黑色
- 锁定滚动：防止背景滚动

## 无障碍性

### ARIA 属性

```vue
<button 
  ref="triggerRef"
  :aria-expanded="state.isOpen"
  :aria-label="'选择颜色'"
  @click="actions.toggle"
>
```

### 焦点管理

- 打开时：焦点移到搜索框（如果有）或第一个选项
- 关闭时：焦点返回触发器
- Tab 键：焦点在选项间循环

### 屏幕阅读器

- 选项数量提示
- 当前选中项提示
- 状态变化通知

## 版本兼容性

### v1.0.0

**初始版本**，包含：
- 基础配置协议
- 选项数据协议
- 状态和操作协议
- 事件协议

### 升级策略

协议遵循语义化版本：

- **主版本**（如 2.0.0）：可能包含 breaking changes
- **次版本**（如 1.1.0）：新增功能，向后兼容
- **修订版本**（如 1.0.1）：Bug 修复，完全兼容

## 实现清单

实现一个符合协议的选择器时，请确保：

- [ ] 使用 `useHeadlessSelector` 管理状态和逻辑
- [ ] 使用 `useResponsivePopup` 处理弹出（如果需要）
- [ ] 支持所有必需的键盘操作
- [ ] 正确设置 ARIA 属性
- [ ] 使用 `Teleport to="body"` 渲染弹出层
- [ ] 正确绑定 `triggerRef` 和 `panelRef`
- [ ] 使用 `@click.stop` 防止事件冒泡
- [ ] 响应 `state.activeIndex` 高亮选项
- [ ] 正确处理搜索（如果启用）
- [ ] 深色模式支持

## 相关文档

- [使用指南](./SELECTOR_USAGE_GUIDE.md)
- [API 参考](../src/composables/useHeadlessSelector.ts)
- [实现示例](../../size/src/vue/SizeSelector.vue)


