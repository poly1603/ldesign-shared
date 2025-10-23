/**
 * useResponsivePopup Composable
 * 
 * 响应式弹出逻辑 - 精确定位，流畅动画，完美体验
 */

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import type { PopupPlacement } from '../protocols'
import { useBreakpoint } from '../hooks/useBreakpoint'

export interface UseResponsivePopupOptions {
  mode: 'dropdown' | 'dialog' | 'auto'
  breakpoint?: number
  triggerRef: Ref<HTMLElement | null>
  panelRef: Ref<HTMLElement | null>
  placement?: PopupPlacement
  offset?: number
  isOpen?: Ref<boolean>
}

export interface UseResponsivePopupReturn {
  currentMode: ComputedRef<'dropdown' | 'dialog'>
  popupStyle: ComputedRef<CSSProperties>
  isMobile: ComputedRef<boolean>
  updatePosition: () => void
}

/**
 * 计算弹出位置
 */
function calculatePosition(
  trigger: HTMLElement,
  panel: HTMLElement,
  placement: PopupPlacement,
  offset: number
): { top: number; left: number } {
  const triggerRect = trigger.getBoundingClientRect()
  const panelRect = panel.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = 0
  let left = 0

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

  const margin = 8
  if (left < margin) {
    left = margin
  } else if (left + panelRect.width > viewportWidth - margin) {
    left = viewportWidth - panelRect.width - margin
  }

  if (top + panelRect.height > viewportHeight - margin) {
    const topAlt = triggerRect.top - panelRect.height - offset
    if (topAlt >= margin) {
      top = topAlt
    }
  } else if (top < margin) {
    top = triggerRect.bottom + offset
  }

  return { top, left }
}

export function useResponsivePopup(
  options: UseResponsivePopupOptions
): UseResponsivePopupReturn {
  const {
    mode,
    breakpoint: customBreakpoint,
    triggerRef,
    panelRef,
    placement = 'bottom',
    offset = 8,
    isOpen
  } = options

  const { isMobile: isSmallScreen, isSmaller } = useBreakpoint()

  const currentMode = computed<'dropdown' | 'dialog'>(() => {
    if (mode === 'dropdown') return 'dropdown'
    if (mode === 'dialog') return 'dialog'
    if (customBreakpoint) {
      return isSmaller(customBreakpoint) ? 'dialog' : 'dropdown'
    }
    return isSmallScreen.value ? 'dialog' : 'dropdown'
  })

  const position = ref({ top: 0, left: 0 })
  const isPositioned = ref(false)
  const isFirstRender = ref(true)

  const popupStyle = computed<CSSProperties>(() => {
    if (currentMode.value === 'dialog') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }
    }

    const style: CSSProperties = {
      position: 'fixed',
      top: `${position.value.top}px`,
      left: `${position.value.left}px`,
      zIndex: 1000
    }

    // 关键修复：第一次渲染时禁用过渡动画
    // 这样元素会立即出现在正确位置，不会从 (0,0) 开始动画
    if (isFirstRender.value || !isPositioned.value) {
      style.transition = 'none'
      style.opacity = '0'
      style.pointerEvents = 'none'  // 禁用点击事件
    }

    return style
  })

  /**
   * 更新位置
   */
  const updatePosition = () => {
    if (currentMode.value === 'dialog') return
    if (!triggerRef.value || !panelRef.value) return

    const newPos = calculatePosition(
      triggerRef.value,
      panelRef.value,
      placement,
      offset
    )
    position.value = newPos
    isPositioned.value = true

    // 在下一帧移除第一次渲染标记，允许过渡动画
    if (isFirstRender.value) {
      requestAnimationFrame(() => {
        isFirstRender.value = false
      })
    }
  }

  /**
   * 监听打开状态
   * 
   * 关键策略：
   * 1. 打开时先标记为未定位
   * 2. nextTick 后计算位置并设置 isPositioned = true
   * 3. requestAnimationFrame 后移除 isFirstRender，允许动画
   */
  if (isOpen) {
    watch(isOpen, (open) => {
      if (open && currentMode.value === 'dropdown') {
        // 重置状态
        isPositioned.value = false
        isFirstRender.value = true

        // 在 DOM 渲染后立即计算位置
        nextTick(() => {
          if (triggerRef.value && panelRef.value) {
            updatePosition()
          }
        })
      } else if (!open) {
        // 关闭时重置状态
        isPositioned.value = false
        isFirstRender.value = true
      }
    }, { immediate: true })
  }

  // 窗口调整
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  const handleResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(updatePosition, 150)
  }

  // 滚动
  let scrollRAF: number | null = null
  const handleScroll = () => {
    if (currentMode.value !== 'dropdown') return
    if (scrollRAF === null) {
      scrollRAF = requestAnimationFrame(() => {
        updatePosition()
        scrollRAF = null
      })
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true })
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
    if (resizeTimer) clearTimeout(resizeTimer)
    if (scrollRAF) cancelAnimationFrame(scrollRAF)
  })

  return {
    currentMode,
    popupStyle,
    isMobile: isSmallScreen,
    updatePosition
  }
}
