/**
 * useHeadlessSelector Composable
 * 
 * 无头选择器 - 提供核心逻辑，UI 由各包自行实现
 * 这是选择器的核心，实现了状态管理、键盘导航、搜索过滤等功能
 */

import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { SelectorOption, SelectorState, SelectorActions } from '../protocols'
import {
  filterOptions,
  findOption,
  findOptionIndex,
  getNextAvailableIndex,
  isClickOutside
} from '../utils/selector-helpers'

/**
 * useHeadlessSelector 选项
 */
export interface UseHeadlessSelectorOptions {
  /** 选项列表 */
  options: Ref<SelectorOption[]> | SelectorOption[]
  /** 当前选中的值 */
  modelValue?: Ref<any> | any
  /** 是否支持搜索 */
  searchable?: boolean
  /** 自定义搜索过滤函数 */
  searchFilter?: (option: SelectorOption, query: string) => boolean
  /** 搜索字段 */
  searchFields?: string[]
  /** 选择回调 */
  onSelect?: (value: any, option: SelectorOption) => void
  /** 值变化回调 */
  onChange?: (value: any, option: SelectorOption) => void
  /** 打开回调 */
  onOpen?: () => void
  /** 关闭回调 */
  onClose?: () => void
  /** 搜索回调 */
  onSearch?: (query: string) => void
  /** 是否在选择后自动关闭 */
  closeOnSelect?: boolean
  /** 是否启用键盘导航 */
  enableKeyboard?: boolean
}

/**
 * useHeadlessSelector 返回值
 */
export interface UseHeadlessSelectorReturn {
  /** 状态 */
  state: Readonly<Ref<SelectorState>>
  /** 操作方法 */
  actions: SelectorActions
  /** 获取选项 */
  getOptionByValue: (value: any) => SelectorOption | undefined
  /** 判断是否选中 */
  isSelected: (value: any) => boolean
  /** 触发器引用 */
  triggerRef: Ref<HTMLElement | null>
  /** 面板引用 */
  panelRef: Ref<HTMLElement | null>
}

/**
 * useHeadlessSelector
 * 
 * @param options - 配置选项
 * @returns 选择器状态和操作方法
 * 
 * @example
 * ```typescript
 * const { state, actions, triggerRef, panelRef } = useHeadlessSelector({
 *   options: colorOptions,
 *   modelValue: currentColor,
 *   searchable: true,
 *   onSelect: (value) => {
 *     console.log('Selected:', value)
 *   }
 * })
 * ```
 */
export function useHeadlessSelector(
  options: UseHeadlessSelectorOptions
): UseHeadlessSelectorReturn {
  const {
    options: optionsProp,
    modelValue: modelValueProp,
    searchable = false,
    searchFilter,
    searchFields = ['label', 'description'],
    onSelect,
    onChange,
    onOpen,
    onClose,
    onSearch,
    closeOnSelect = true,
    enableKeyboard = true
  } = options

  // 转换为 ref
  const optionsRef = ref(optionsProp) as Ref<SelectorOption[]>
  const modelValueRef = ref(modelValueProp)

  // 状态
  const isOpen = ref(false)
  const searchQuery = ref('')
  const activeIndex = ref(-1)

  // 引用
  const triggerRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)

  /**
   * 过滤后的选项
   */
  const filteredOptions = computed(() => {
    if (!searchable || !searchQuery.value) {
      return optionsRef.value
    }

    if (searchFilter) {
      return optionsRef.value.filter(option => searchFilter(option, searchQuery.value))
    }

    return filterOptions(optionsRef.value, searchQuery.value, searchFields)
  })

  /**
   * 当前选中的选项
   */
  const selectedOption = computed(() => {
    return findOption(optionsRef.value, modelValueRef.value)
  })

  /**
   * 是否正在搜索
   */
  const isSearching = computed(() => {
    return searchable && searchQuery.value.length > 0
  })

  /**
   * 状态对象
   */
  const state = computed<SelectorState>(() => ({
    isOpen: isOpen.value,
    isSearching: isSearching.value,
    searchQuery: searchQuery.value,
    selectedValue: modelValueRef.value,
    filteredOptions: filteredOptions.value,
    activeIndex: activeIndex.value
  }))

  /**
   * 打开选择器
   */
  const open = () => {
    if (isOpen.value) return

    isOpen.value = true

    // 重置状态
    searchQuery.value = ''

    // 设置激活的选项为当前选中项
    const selectedIndex = findOptionIndex(filteredOptions.value, modelValueRef.value)
    activeIndex.value = selectedIndex

    onOpen?.()
  }

  /**
   * 关闭选择器
   */
  const close = () => {
    if (!isOpen.value) return

    isOpen.value = false
    searchQuery.value = ''
    activeIndex.value = -1

    onClose?.()
  }

  /**
   * 切换选择器状态
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * 选择选项
   */
  const select = (value: any) => {
    const option = findOption(optionsRef.value, value)

    if (!option || option.disabled) {
      return
    }

    const oldValue = modelValueRef.value
    modelValueRef.value = value

    onSelect?.(value, option)

    if (oldValue !== value) {
      onChange?.(value, option)
    }

    if (closeOnSelect) {
      close()
    }
  }

  /**
   * 搜索
   */
  const search = (query: string) => {
    searchQuery.value = query
    // 重置激活索引
    activeIndex.value = 0
    onSearch?.(query)
  }

  /**
   * 导航到下一个选项
   */
  const navigateNext = () => {
    if (filteredOptions.value.length === 0) return

    const nextIndex = getNextAvailableIndex(
      filteredOptions.value,
      activeIndex.value,
      1
    )

    if (nextIndex !== -1) {
      activeIndex.value = nextIndex
    }
  }

  /**
   * 导航到上一个选项
   */
  const navigatePrev = () => {
    if (filteredOptions.value.length === 0) return

    const prevIndex = getNextAvailableIndex(
      filteredOptions.value,
      activeIndex.value,
      -1
    )

    if (prevIndex !== -1) {
      activeIndex.value = prevIndex
    }
  }

  /**
   * 确认当前激活的选项
   */
  const confirmActive = () => {
    if (activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
      const activeOption = filteredOptions.value[activeIndex.value]
      if (activeOption && !activeOption.disabled) {
        select(activeOption.value)
      }
    }
  }

  /**
   * 获取选项
   */
  const getOptionByValue = (value: any): SelectorOption | undefined => {
    return findOption(optionsRef.value, value)
  }

  /**
   * 判断是否选中
   */
  const isSelected = (value: any): boolean => {
    return modelValueRef.value === value
  }

  /**
   * 键盘事件处理
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value || !enableKeyboard) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        close()
        triggerRef.value?.focus()
        break

      case 'ArrowDown':
        event.preventDefault()
        navigateNext()
        break

      case 'ArrowUp':
        event.preventDefault()
        navigatePrev()
        break

      case 'Enter':
        event.preventDefault()
        confirmActive()
        break

      case 'Home':
        event.preventDefault()
        activeIndex.value = 0
        break

      case 'End':
        event.preventDefault()
        activeIndex.value = filteredOptions.value.length - 1
        break

      case 'Tab':
        // Tab 键关闭选择器
        close()
        break
    }
  }

  /**
   * 点击外部关闭
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (!isOpen.value) return

    if (isClickOutside(event, triggerRef.value, panelRef.value)) {
      close()
    }
  }

  /**
   * 监听 modelValue 变化
   */
  watch(() => modelValueProp, (newValue) => {
    if (ref(modelValueProp)) {
      modelValueRef.value = newValue
    }
  })

  /**
   * 监听 options 变化
   */
  watch(() => optionsProp, (newOptions) => {
    if (ref(optionsProp)) {
      optionsRef.value = newOptions as SelectorOption[]
    }
  })

  /**
   * 生命周期
   */
  onMounted(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('click', handleClickOutside)
    }
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleClickOutside)
    }
  })

  // 操作方法
  const actions: SelectorActions = {
    open,
    close,
    toggle,
    select,
    search,
    navigateNext,
    navigatePrev,
    confirmActive
  }

  return {
    state: state as Readonly<Ref<SelectorState>>,
    actions,
    getOptionByValue,
    isSelected,
    triggerRef,
    panelRef
  }
}

