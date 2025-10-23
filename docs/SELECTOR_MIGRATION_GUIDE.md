# 选择器迁移指南

## 概述

本指南帮助您将现有的选择器组件迁移到基于无头逻辑层的新架构。

## 为什么要迁移？

### 旧架构的问题

- ❌ 每个选择器自己管理状态
- ❌ 重复的键盘事件处理代码
- ❌ 手动计算弹出位置
- ❌ 手动处理点击外部关闭
- ❌ 响应式行为不一致
- ❌ 代码重复，难以维护

### 新架构的优势

- ✅ 统一的逻辑层，无需重复代码
- ✅ 自动键盘导航
- ✅ 自动响应式弹出
- ✅ 自动位置计算和溢出处理
- ✅ 协议驱动，易于扩展
- ✅ 解耦设计，包完全独立

## 迁移步骤

### 步骤 1：添加导入

```typescript
// 旧代码
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 新代码 - 添加这些导入
import type { SelectorConfig, SelectorOption } from '@ldesign/shared/protocols'
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import { renderIcon } from '@ldesign/shared/icons'
```

### 步骤 2：移除旧的状态管理

```typescript
// ❌ 旧代码 - 删除这些
const isOpen = ref(false)
const activeIndex = ref(-1)
const searchQuery = ref('')

function togglePanel() {
  isOpen.value = !isOpen.value
}

function closePanel() {
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  // ...
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
```

### 步骤 3：定义配置

```typescript
// ✅ 新代码 - 定义配置
const config: SelectorConfig = {
  icon: 'ALargeSmall',  // 或 'Palette', 'Languages', 'LayoutTemplate'
  popupMode: 'auto',
  listStyle: 'card',    // 或 'simple', 'grid'
  searchable: false,
  breakpoint: 768
}
```

### 步骤 4：转换选项数据

```typescript
// ❌ 旧代码
const presets = [
  { name: 'small', label: '小号', baseSize: 12 },
  { name: 'medium', label: '中号', baseSize: 14 }
]

// ✅ 新代码 - 转换为 SelectorOption 格式
const options = computed<SelectorOption[]>(() => {
  return presets.map(preset => ({
    value: preset.name,
    label: preset.label,
    description: '描述信息',
    badge: `${preset.baseSize}px`,
    metadata: {
      baseSize: preset.baseSize
    }
  }))
})
```

### 步骤 5：使用无头逻辑

```typescript
// ✅ 新代码 - 使用无头选择器
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options,
  modelValue: currentValue,
  searchable: config.searchable,
  onSelect: (value) => {
    // 你的选择逻辑
    applyPreset(value)
  }
})

// ✅ 使用响应式弹出
const { currentMode, popupStyle } = useResponsivePopup({
  mode: config.popupMode,
  triggerRef,
  panelRef,
  placement: 'bottom-end',
  breakpoint: config.breakpoint,
  isOpen: computed(() => state.value.isOpen)
})
```

### 步骤 6：更新模板

```vue
<!-- ❌ 旧代码 -->
<template>
  <div ref="selectorRef">
    <button @click="togglePanel">
      <svg>...</svg>
    </button>
    
    <div v-if="isOpen" class="panel">
      <div v-for="preset in presets" @click="selectPreset(preset.name)">
        {{ preset.label }}
      </div>
    </div>
  </div>
</template>

<!-- ✅ 新代码 -->
<template>
  <div>
    <button ref="triggerRef" @click="actions.toggle">
      <span v-html="renderIcon('ALargeSmall')" />
    </button>
    
    <Teleport to="body">
      <div 
        v-if="state.isOpen" 
        ref="panelRef" 
        :style="popupStyle" 
        @click.stop
      >
        <div 
          v-for="(option, index) in state.filteredOptions"
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
    </Teleport>
  </div>
</template>
```

### 步骤 7：更新样式

```css
/* ❌ 旧代码 */
.panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  /* ... */
}

/* ✅ 新代码 - 使用 fixed 定位由 popupStyle 控制 */
.panel {
  /* position, top, left 由 popupStyle 控制 */
  min-width: 320px;
  background: white;
  border-radius: 12px;
  /* ... */
}

/* 添加 dialog 模式样式 */
.panel-dialog {
  max-width: 90vw;
  max-height: 80vh;
}
```

## 实际示例对比

### 示例 1：SizeSelector

#### 旧实现（~100行核心逻辑）

```vue
<script setup lang="ts">
const isOpen = ref(false)
const selectorRef = ref<HTMLElement>()

function togglePanel() {
  isOpen.value = !isOpen.value
}

function selectPreset(name: string) {
  applyPreset(name)
  closePanel()
}

function handleClickOutside(event: MouseEvent) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="selectorRef">
    <button @click="togglePanel">图标</button>
    <div v-if="isOpen" class="panel">
      <div v-for="preset in presets" @click="selectPreset(preset.name)">
        {{ preset.name }}
      </div>
    </div>
  </div>
</template>
```

#### 新实现（~30行核心逻辑）

```vue
<script setup lang="ts">
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import type { SelectorConfig, SelectorOption } from '@ldesign/shared/protocols'

const config: SelectorConfig = {
  icon: 'ALargeSmall',
  popupMode: 'auto',
  listStyle: 'card'
}

const options = computed<SelectorOption[]>(() => 
  presets.map(p => ({ value: p.name, label: p.label }))
)

const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
  options,
  modelValue: currentPreset,
  onSelect: (value) => applyPreset(value)
})

const { popupStyle } = useResponsivePopup({
  mode: 'auto',
  triggerRef,
  panelRef,
  isOpen: computed(() => state.isOpen)
})
</script>

<template>
  <div>
    <button ref="triggerRef" @click="actions.toggle">图标</button>
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

**减少代码量**: ~70%  
**新增功能**: 键盘导航、响应式弹出、自动溢出处理

## 常见问题

### Q1: 我的选择器有特殊逻辑怎么办？

A: 新架构完全支持！在 `onSelect` 回调中处理你的特殊逻辑：

```typescript
const { state, actions } = useHeadlessSelector({
  onSelect: (value) => {
    // 你的特殊逻辑
    if (value === 'special') {
      handleSpecialCase()
    }
    applySelection(value)
  }
})
```

### Q2: 我需要自定义搜索逻辑？

A: 提供 `searchFilter` 函数：

```typescript
useHeadlessSelector({
  searchFilter: (option, query) => {
    // 自定义搜索逻辑
    return option.metadata.tags.some(tag => tag.includes(query))
  }
})
```

### Q3: 我的 UI 和样式很特殊？

A: 完全没问题！新架构只提供逻辑，UI 完全由你控制：

```vue
<template>
  <div>
    <!-- 你的自定义 UI -->
    <button ref="triggerRef" class="my-custom-trigger">
      <!-- 任何自定义内容 -->
    </button>

    <Teleport to="body">
      <div ref="panelRef" :style="popupStyle" class="my-custom-panel">
        <!-- 任何自定义布局 -->
      </div>
    </Teleport>
  </div>
</template>

<style>
/* 你的自定义样式 */
.my-custom-trigger { /* ... */ }
.my-custom-panel { /* ... */ }
</style>
```

### Q4: 我不想使用响应式弹出？

A: 完全可以！只使用 `useHeadlessSelector`：

```typescript
// 只使用状态和逻辑，不使用响应式弹出
const { state, actions, triggerRef, panelRef } = useHeadlessSelector({...})

// 自己控制位置
const panelStyle = computed(() => ({
  position: 'absolute',
  top: '100%',
  left: 0
}))
```

### Q5: buttons 或 tabs 模式怎么处理？

A: 这些模式不需要弹出逻辑，只使用状态管理：

```vue
<template>
  <!-- buttons 模式 -->
  <div class="button-group">
    <button
      v-for="option in options"
      :class="{ active: state.selectedValue === option.value }"
      @click="actions.select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
```

## Breaking Changes

### 必须的更改

1. **添加 ref 绑定**
   ```vue
   <!-- 必须添加 ref -->
   <button ref="triggerRef">
   <div ref="panelRef">
   ```

2. **使用 Teleport**
   ```vue
   <!-- 面板必须使用 Teleport -->
   <Teleport to="body">
     <div v-if="state.isOpen">
   </Teleport>
   ```

3. **样式从 absolute 改为 fixed**
   ```css
   /* 旧：position: absolute */
   /* 新：由 popupStyle 控制（fixed） */
   ```

### 可选的更改

1. **使用 renderIcon** 替代内联 SVG
2. **使用 Design Tokens** 替代硬编码样式
3. **使用搜索过滤** 功能

## 检查清单

迁移完成后，请检查：

- [ ] 导入了正确的类型和 composables
- [ ] 定义了 `SelectorConfig`
- [ ] 选项数据转换为 `SelectorOption[]` 格式
- [ ] 正确使用 `useHeadlessSelector`
- [ ] 绑定了 `triggerRef` 和 `panelRef`
- [ ] 使用了 `Teleport to="body"`
- [ ] 使用了 `:style="popupStyle"`
- [ ] 添加了 `@click.stop` 防止冒泡
- [ ] 响应了 `state.activeIndex` 高亮
- [ ] 测试了键盘导航
- [ ] 测试了响应式行为
- [ ] 保留了所有原有功能

## 测试建议

### 功能测试

1. **基础功能**
   - [ ] 点击打开/关闭
   - [ ] 选择选项
   - [ ] 选中状态正确

2. **键盘导航**
   - [ ] ↑↓ 键导航
   - [ ] Enter 确认
   - [ ] ESC 关闭
   - [ ] Tab 关闭

3. **响应式行为**
   - [ ] 大屏幕下拉菜单
   - [ ] 小屏幕居中对话框
   - [ ] 窗口调整时自动切换

4. **搜索功能**（如果启用）
   - [ ] 输入搜索词过滤选项
   - [ ] 清空搜索词显示所有

5. **特殊功能**
   - [ ] 保留原有的特殊功能
   - [ ] 国际化正常
   - [ ] 样式正确

## 需要帮助？

查看已完成的实现示例：

- [SizeSelector](../../size/src/vue/SizeSelector.vue)
- [ThemePicker](../../color/src/vue/ThemePicker.vue)
- [LocaleSwitcher](../../i18n/src/adapters/vue/components/LocaleSwitcher.vue)
- [TemplateSelector](../../template/src/components/TemplateSelector.vue)

