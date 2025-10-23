/**
 * Selector Helper Functions
 * 
 * 选择器工具函数库
 */

import type { SelectorOption, PopupPlacement } from '../protocols'

/**
 * 弹出位置计算结果
 */
export interface PopupPosition {
  top: number
  left: number
  transform?: string
}

/**
 * 视口信息
 */
export interface ViewportInfo {
  width: number
  height: number
  scrollX: number
  scrollY: number
}

/**
 * 元素边界信息
 */
export interface ElementBounds {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

/**
 * 获取视口信息
 */
export function getViewport(): ViewportInfo {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, scrollX: 0, scrollY: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX || window.pageXOffset,
    scrollY: window.scrollY || window.pageYOffset
  }
}

/**
 * 获取元素边界（相对于视口）
 * 使用 getBoundingClientRect 返回相对于视口的坐标
 */
export function getElementBounds(element: HTMLElement): ElementBounds {
  const rect = element.getBoundingClientRect()

  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 计算弹出位置
 * 
 * 关键优化：
 * 1. 使用视口坐标（fixed定位）
 * 2. 智能溢出处理
 * 3. 优先级：先满足用户指定的placement，溢出时才调整
 * 
 * @param trigger - 触发器元素
 * @param panel - 面板元素
 * @param placement - 弹出位置
 * @param offset - 偏移量
 * @returns 位置信息
 */
export function calculatePopupPosition(
  trigger: HTMLElement,
  panel: HTMLElement,
  placement: PopupPlacement = 'bottom',
  offset: number = 8
): PopupPosition {
  const triggerRect = trigger.getBoundingClientRect()
  const panelRect = panel.getBoundingClientRect()
  const viewport = getViewport()

  let top = 0
  let left = 0

  // 根据 placement 计算基础位置
  switch (placement) {
    case 'bottom':
      top = triggerRect.bottom + offset
      left = triggerRect.left + (triggerRect.width - panelRect.width) / 2
      break

    case 'bottom-start':
      top = triggerRect.bottom + offset
      left = triggerRect.left
      break

    case 'bottom-end':
      top = triggerRect.bottom + offset
      left = triggerRect.right - panelRect.width
      break

    case 'top':
      top = triggerRect.top - panelRect.height - offset
      left = triggerRect.left + (triggerRect.width - panelRect.width) / 2
      break

    case 'top-start':
      top = triggerRect.top - panelRect.height - offset
      left = triggerRect.left
      break

    case 'top-end':
      top = triggerRect.top - panelRect.height - offset
      left = triggerRect.right - panelRect.width
      break
  }

  // 水平方向溢出处理
  const margin = 8
  if (left < margin) {
    // 左侧溢出
    left = margin
  } else if (left + panelRect.width > viewport.width - margin) {
    // 右侧溢出
    left = viewport.width - panelRect.width - margin
  }

  // 垂直方向溢出处理
  if (top + panelRect.height > viewport.height - margin) {
    // 底部溢出，尝试显示在上方
    const topAlt = triggerRect.top - panelRect.height - offset
    if (topAlt >= margin) {
      top = topAlt
    } else {
      // 上下都放不下，显示在视口内能容纳的最佳位置
      top = Math.max(margin, Math.min(top, viewport.height - panelRect.height - margin))
    }
  } else if (top < margin) {
    // 顶部溢出，显示在下方
    top = triggerRect.bottom + offset
  }

  return { top, left }
}

/**
 * 检查元素是否溢出视口
 */
export function checkOverflow(
  bounds: { top: number; left: number; width: number; height: number },
  viewport: ViewportInfo
): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
  return {
    top: bounds.top < 0,
    right: bounds.left + bounds.width > viewport.width,
    bottom: bounds.top + bounds.height > viewport.height,
    left: bounds.left < 0
  }
}

/**
 * 搜索过滤选项
 * 
 * @param options - 选项列表
 * @param query - 搜索关键词
 * @param searchFields - 搜索字段（默认：label, description）
 * @returns 过滤后的选项列表
 */
export function filterOptions(
  options: SelectorOption[],
  query: string,
  searchFields: string[] = ['label', 'description']
): SelectorOption[] {
  if (!query || query.trim() === '') {
    return options
  }

  const lowerQuery = query.toLowerCase().trim()

  return options.filter(option => {
    // 搜索指定字段
    for (const field of searchFields) {
      const value = option[field as keyof SelectorOption]
      if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
        return true
      }
    }

    // 搜索 metadata
    if (option.metadata) {
      for (const value of Object.values(option.metadata)) {
        if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
          return true
        }
      }
    }

    return false
  })
}

/**
 * 滚动到选中项
 * 
 * @param container - 容器元素
 * @param selected - 选中的元素
 * @param behavior - 滚动行为
 */
export function scrollToSelected(
  container: HTMLElement,
  selected: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  if (!container || !selected) {
    return
  }

  const containerRect = container.getBoundingClientRect()
  const selectedRect = selected.getBoundingClientRect()

  const containerTop = container.scrollTop
  const containerBottom = containerTop + containerRect.height

  const selectedTop = selectedRect.top - containerRect.top + containerTop
  const selectedBottom = selectedTop + selectedRect.height

  // 如果选中项在可视区域外，则滚动
  if (selectedTop < containerTop) {
    // 在上方，滚动到顶部
    container.scrollTo({
      top: selectedTop,
      behavior
    })
  } else if (selectedBottom > containerBottom) {
    // 在下方，滚动到底部
    container.scrollTo({
      top: selectedBottom - containerRect.height,
      behavior
    })
  }
}

/**
 * 获取选项的显示文本
 */
export function getOptionLabel(option: SelectorOption): string {
  return option.label || String(option.value)
}

/**
 * 查找选项
 */
export function findOption(options: SelectorOption[], value: any): SelectorOption | undefined {
  return options.find(option => option.value === value)
}

/**
 * 查找选项索引
 */
export function findOptionIndex(options: SelectorOption[], value: any): number {
  return options.findIndex(option => option.value === value)
}

/**
 * 获取下一个可用选项的索引
 * 
 * @param options - 选项列表
 * @param currentIndex - 当前索引
 * @param direction - 方向（1: 下一个，-1: 上一个）
 * @returns 下一个可用选项的索引
 */
export function getNextAvailableIndex(
  options: SelectorOption[],
  currentIndex: number,
  direction: 1 | -1 = 1
): number {
  if (options.length === 0) {
    return -1
  }

  let nextIndex = currentIndex + direction
  let attempts = 0

  // 循环查找，避免死循环
  while (attempts < options.length) {
    // 循环索引
    if (nextIndex < 0) {
      nextIndex = options.length - 1
    } else if (nextIndex >= options.length) {
      nextIndex = 0
    }

    // 找到可用选项
    if (!options[nextIndex]?.disabled) {
      return nextIndex
    }

    nextIndex += direction
    attempts++
  }

  return -1
}

/**
 * 检查是否点击在元素外部
 * 
 * @param event - 鼠标事件
 * @param elements - 元素列表
 * @returns 是否在外部
 */
export function isClickOutside(event: MouseEvent, ...elements: (HTMLElement | null)[]): boolean {
  const target = event.target as Node

  for (const element of elements) {
    if (element && element.contains(target)) {
      return false
    }
  }

  return true
}
