# 选择器使用指南

## 快速开始

### 1. 导入依赖

```typescript
import type { SelectorConfig, SelectorOption } from '@ldesign/shared/protocols'
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import { renderIcon } from '@ldesign/shared/icons'
```

### 2. 定义配置

```typescript
const config: SelectorConfig = {
  icon: 'Palette', // 'Palette' | 'Languages' | 'ALargeSmall' | 'LayoutTemplate'
  popupMode: 'auto', // 'dropdown' | 'dialog' | 'auto'
  listStyle: 'grid', // 'simple' | 'grid' | 'card'
  searchable: true,
  breakpoint: 768 // 小于此值使用 dialog 模式
}
```

### 3. 准备选项数据

```typescript
const options = computed<SelectorOption[]>(() => [
  {
    value: 'option1',
    label: '选项1',
    description: '这是描述',
    icon: '🎨',
    badge: '推荐',
    metadata: { color: '#1890ff' }
  }
])
```

### 4. 使用无头选择器

```typescript
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options,
  modelValue: currentValue,
  searchable: true,
  onSelect: (value) => {
    console.log('选中:', value)
  }
})
```

### 5. 使用响应式弹出

```typescript
const { currentMode, popupStyle } = useResponsivePopup({
  mode: 'auto',
  triggerRef,
  panelRef,
  placement: 'bottom-start',
  isOpen: computed(() => state.value.isOpen)
})
```

### 6. 编写模板

```vue
<template>
  <div>
    <!-- 触发器 -->
    <button ref="triggerRef" @click="actions.toggle">
      <span v-html="renderIcon('Palette')" />
    </button>

    <!-- 面板 -->
    <Teleport to="body">
      <div v-if="state.isOpen" ref="panelRef" :style="popupStyle" @click.stop>
        <div v-for="option in state.filteredOptions" @click="actions.select(option.value)">
          {{ option.label }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
```

## API 参考

### useHeadlessSelector

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| options | `Ref<SelectorOption[]>` | 选项列表 |
| modelValue | `Ref<any>` | 当前值 |
| searchable | `boolean` | 是否可搜索 |
| searchFilter | `Function` | 自定义搜索函数 |
| onSelect | `Function` | 选择回调 |
| onChange | `Function` | 值变化回调 |
| closeOnSelect | `boolean` | 选择后自动关闭 |

#### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| state | `Ref<SelectorState>` | 状态对象 |
| actions | `SelectorActions` | 操作方法 |
| triggerRef | `Ref<HTMLElement>` | 触发器引用 |
| panelRef | `Ref<HTMLElement>` | 面板引用 |

#### state 对象

```typescript
{
  isOpen: boolean           // 是否打开
  isSearching: boolean      // 是否搜索中
  searchQuery: string       // 搜索词
  selectedValue: any        // 当前值
  filteredOptions: []       // 过滤后的选项
  activeIndex: number       // 激活索引
}
```

#### actions 方法

```typescript
{
  open()              // 打开
  close()             // 关闭
  toggle()            // 切换
  select(value)       // 选择
  search(query)       // 搜索
  navigateNext()      // 下一个
  navigatePrev()      // 上一个
  confirmActive()     // 确认当前
}
```

### useResponsivePopup

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| mode | `'dropdown' \| 'dialog' \| 'auto'` | 弹出模式 |
| triggerRef | `Ref<HTMLElement>` | 触发器引用 |
| panelRef | `Ref<HTMLElement>` | 面板引用 |
| placement | `PopupPlacement` | 弹出位置 |
| breakpoint | `number` | 断点值（px） |
| isOpen | `Ref<boolean>` | 是否打开 |

#### 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| currentMode | `ComputedRef<'dropdown' \| 'dialog'>` | 当前模式 |
| popupStyle | `ComputedRef<CSSProperties>` | 弹出样式 |
| isMobile | `ComputedRef<boolean>` | 是否移动端 |
| updatePosition | `Function` | 更新位置 |

## 键盘快捷键

- `↑` - 上一个选项
- `↓` - 下一个选项
- `Enter` - 确认选择
- `Esc` - 关闭选择器
- `Home` - 第一个选项
- `End` - 最后一个选项
- `Tab` - 关闭选择器

## 最佳实践

### 1. 使用 Teleport

始终使用 `Teleport to="body"` 确保弹出层不被裁剪：

```vue
<Teleport to="body">
  <div v-if="state.isOpen" ref="panelRef">
    <!-- 内容 -->
  </div>
</Teleport>
```

### 2. 阻止事件冒泡

在面板上使用 `@click.stop` 防止关闭：

```vue
<div @click.stop>
  <!-- 面板内容 -->
</div>
```

### 3. 键盘导航高亮

使用 `state.activeIndex` 高亮当前项：

```vue
<div 
  :class="{ hover: state.activeIndex === index }"
  @mouseenter="state.activeIndex = index"
>
```

### 4. 响应式断点

使用 auto 模式自动适配：

```typescript
const { currentMode } = useResponsivePopup({
  mode: 'auto',  // 小屏幕自动切换为 dialog
  breakpoint: 768
})
```

### 5. 自定义搜索

提供自定义搜索函数：

```typescript
useHeadlessSelector({
  searchFilter: (option, query) => {
    // 自定义搜索逻辑
    return option.label.includes(query) || option.value.includes(query)
  }
})
```

## 示例：完整的颜色选择器

```vue
<script setup lang="ts">
import type { SelectorConfig, SelectorOption } from '@ldesign/shared/protocols'
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import { renderIcon } from '@ldesign/shared/icons'

// 配置
const config: SelectorConfig = {
  icon: 'Palette',
  popupMode: 'auto',
  listStyle: 'grid',
  searchable: true
}

// 选项
const colorOptions = computed<SelectorOption[]>(() => [
  { value: 'blue', label: '蓝色', metadata: { color: '#1890ff' } },
  { value: 'red', label: '红色', metadata: { color: '#f5222d' } },
  { value: 'green', label: '绿色', metadata: { color: '#52c41a' } }
])

const currentColor = ref('blue')

// 无头逻辑
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options: colorOptions,
  modelValue: currentColor,
  searchable: true,
  onSelect: (value) => {
    currentColor.value = value
  }
})

// 响应式弹出
const { popupStyle } = useResponsivePopup({
  mode: 'auto',
  triggerRef,
  panelRef,
  placement: 'bottom-start',
  isOpen: computed(() => state.isOpen)
})
</script>

<template>
  <div>
    <!-- 触发器 -->
    <button ref="triggerRef" @click="actions.toggle">
      <span v-html="renderIcon('Palette')" />
      选择颜色
    </button>

    <!-- 面板 -->
    <Teleport to="body">
      <div v-if="state.isOpen" ref="panelRef" :style="popupStyle" @click.stop>
        <!-- 搜索框 -->
        <input 
          :value="state.searchQuery"
          @input="actions.search($event.target.value)"
          placeholder="搜索..."
        />

        <!-- 网格 -->
        <div class="color-grid">
          <div
            v-for="(option, index) in state.filteredOptions"
            :key="option.value"
            :style="{ backgroundColor: option.metadata.color }"
            :class="{ 
              active: state.selectedValue === option.value,
              hover: state.activeIndex === index
            }"
            @click="actions.select(option.value)"
            @mouseenter="state.activeIndex = index"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
</style>
```

## 可选：使用样式 Tokens

```typescript
// 在组件中导入
import '@ldesign/shared/styles/selector-tokens.css'
```

```css
/* 在样式中使用 */
.my-selector {
  background: var(--ld-selector-trigger-bg);
  border-radius: var(--ld-selector-trigger-radius);
}
```

## 参考实现

- `packages/size/src/vue/SizeSelector.vue` - 尺寸选择器
- `packages/color/src/vue/ThemePicker.vue` - 颜色选择器  
- `packages/i18n/src/adapters/vue/components/LocaleSwitcher.vue` - 语言切换器
- `packages/template/src/components/TemplateSelector.vue` - 模板选择器

