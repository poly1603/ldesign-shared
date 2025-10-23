/**
 * Selector Protocol v1.0.0
 * 
 * 选择器协议 - 定义统一的交互规范
 * 各包实现选择器时应遵循此协议
 * 
 * 版本变更记录：
 * - v1.0.0: 初始版本
 * 
 * 兼容性：
 * - 协议遵循语义化版本
 * - 主版本变更可能有 breaking changes
 * - 次版本变更向后兼容
 */

export const SELECTOR_PROTOCOL_VERSION = '1.0.0'

/**
 * 选择器配置协议
 */
export interface SelectorConfig {
  /** 触发器图标（Lucide 图标名称） */
  icon: string
  /** 弹出模式 */
  popupMode: 'dropdown' | 'dialog' | 'auto'
  /** 列表布局样式 */
  listStyle: 'simple' | 'grid' | 'card'
  /** 是否支持搜索 */
  searchable?: boolean
  /** 响应式断点（用于 auto 模式，单位：px） */
  breakpoint?: number
}

/**
 * 选择器选项协议
 */
export interface SelectorOption<T = any> {
  /** 选项值 */
  value: T
  /** 显示标签 */
  label: string
  /** 描述文本 */
  description?: string
  /** 图标（Lucide 图标名称或自定义） */
  icon?: string
  /** 徽章文本 */
  badge?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义元数据（如 color 包的颜色值） */
  metadata?: Record<string, any>
}

/**
 * 选择器状态协议
 */
export interface SelectorState {
  /** 是否打开 */
  isOpen: boolean
  /** 是否正在搜索 */
  isSearching: boolean
  /** 搜索查询字符串 */
  searchQuery: string
  /** 当前选中的值 */
  selectedValue: any
  /** 过滤后的选项列表 */
  filteredOptions: SelectorOption[]
  /** 当前激活的选项索引（用于键盘导航） */
  activeIndex: number
}

/**
 * 选择器操作协议
 */
export interface SelectorActions {
  /** 打开选择器 */
  open: () => void
  /** 关闭选择器 */
  close: () => void
  /** 切换选择器状态 */
  toggle: () => void
  /** 选择某个值 */
  select: (value: any) => void
  /** 搜索 */
  search: (query: string) => void
  /** 导航到下一个选项 */
  navigateNext: () => void
  /** 导航到上一个选项 */
  navigatePrev: () => void
  /** 确认当前激活的选项 */
  confirmActive: () => void
}

/**
 * 选择器事件协议
 */
export interface SelectorEvents {
  /** 值更新事件 */
  'update:modelValue': [value: any]
  /** 值变化事件 */
  'change': [value: any, option: SelectorOption]
  /** 打开事件 */
  'open': []
  /** 关闭事件 */
  'close': []
  /** 搜索事件 */
  'search': [query: string]
}

/**
 * 响应式断点定义
 */
export const SELECTOR_BREAKPOINTS = {
  /** 移动端断点 */
  mobile: 768,
  /** 平板断点 */
  tablet: 1024,
  /** 桌面端断点 */
  desktop: 1024
} as const

/**
 * 弹出位置
 */
export type PopupPlacement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/**
 * 选择器无障碍属性
 */
export interface SelectorA11yProps {
  /** 触发器 aria-label */
  triggerLabel?: string
  /** 面板 role */
  panelRole?: string
  /** 选项 role */
  optionRole?: string
  /** 是否启用键盘导航 */
  enableKeyboard?: boolean
}



