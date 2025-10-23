/**
 * useResponsivePopup Composable
 * 
 * 响应式弹出逻辑 - 根据屏幕尺寸自动决定弹出方式
 * 
 * 核心功能：
 * 1. 根据屏幕尺寸自动选择 dropdown 或 dialog 模式
 * 2. 精确计算弹出位置，避免溢出
 * 3. 监听滚动和窗口大小变化，动态更新位置
 */

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import type { PopupPlacement } from '../protocols'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { calculatePopupPosition } from '../utils/selector-helpers'

/**
 * useResponsivePopup 选项
 */
export interface UseResponsivePopupOptions {
  /** 弹出模式 */
  mode: 'dropdown' | 'dialog' | 'auto'
  /** 响应式断点（用于 auto 模式，默认768px） */
  breakpoint?: number
  /** 触发器引用 */
  triggerRef: Ref<HTMLElement | null>
  /** 面板引用 */
  panelRef: Ref<HTMLElement | null>
  /** 下拉位置 */
  placement?: PopupPlacement
  /** 偏移量（px） */
  offset?: number
  /** 是否打开（用于监听状态变化） */
  isOpen?: Ref<boolean>
}

/**
 * useResponsivePopup 返回值
 */
export interface UseResponsivePopupReturn {
  /** 当前实际使用的模式 */
  currentMode: ComputedRef<'dropdown' | 'dialog'>
  /** 弹出面板的样式 */
  popupStyle: ComputedRef<CSSProperties>
  /** 是否移动端 */
  isMobile: ComputedRef<boolean>
  /** 手动更新位置 */
  updatePosition: () => void
}

/**
 * useResponsivePopup
 * 
 * @param options - 配置选项
 * @returns 响应式弹出信息
 */
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

  // 使用断点检测
  const { isMobile: isSmallScreen, isSmaller } = useBreakpoint()

  /**
   * 当前实际使用的模式
   */
  const currentMode = computed<'dropdown' | 'dialog'>(() => {
    if (mode === 'dropdown') return 'dropdown'
    if (mode === 'dialog') return 'dialog'

    // auto 模式：根据断点自动决定
    if (customBreakpoint) {
      return isSmaller(customBreakpoint) ? 'dialog' : 'dropdown'
    }

    return isSmallScreen.value ? 'dialog' : 'dropdown'
  })

  /**
   * 位置状态（使用ref确保响应式）
   */
  const position = ref({ top: 0, left: 0 })

  /**
   * 是否已计算过位置
   */
  const hasCalculated = ref(false)

  /**
   * 弹出面板的样式
   */
  const popupStyle = computed<CSSProperties>(() => {
    if (currentMode.value === 'dialog') {
      // Dialog 模式：居中显示
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }
    }

    // Dropdown 模式：定位在触发器下方
    // 关键：第一次打开时先隐藏（opacity: 0），计算好位置后再显示
    return {
      position: 'fixed',
      top: `${position.value.top}px`,
      left: `${position.value.left}px`,
      zIndex: 1000,
      opacity: hasCalculated.value ? '1' : '0',
      transition: hasCalculated.value ? 'opacity 150ms ease' : 'none'
    }
  })

  /**
   * 更新位置（核心函数）
   * 
   * 关键：使用 requestAnimationFrame 确保在浏览器重绘后计算
   * 这样可以获得面板的真实尺寸
   */
  const updatePosition = () => {
    // Dialog 模式不需要计算位置
    if (currentMode.value === 'dialog') {
      hasCalculated.value = true
      return
    }

    // 确保元素都存在
    if (!triggerRef.value || !panelRef.value) {
      return
    }

    // 使用 requestAnimationFrame 确保在下一帧计算
    // 此时CSS已完全应用，尺寸准确
    requestAnimationFrame(() => {
      if (triggerRef.value && panelRef.value) {
        const newPosition = calculatePopupPosition(
          triggerRef.value,
          panelRef.value,
          placement,
          offset
        )
        position.value = newPosition
        hasCalculated.value = true
      }
    })
  }

  /**
   * 监听窗口大小变化（防抖）
   */
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  const handleResize = () => {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = setTimeout(() => {
      updatePosition()
      resizeTimer = null
    }, 150)
  }

  /**
   * 监听滚动（节流）
   */
  let scrollTimer: ReturnType<typeof setTimeout> | null = null
  const handleScroll = () => {
    if (currentMode.value !== 'dropdown') {
      return
    }

    if (scrollTimer === null) {
      scrollTimer = setTimeout(() => {
        updatePosition()
        scrollTimer = null
      }, 16) // ~60fps
    }
  }

  /**
   * 监听弹出状态变化
   * 
   * 关键优化：当打开时，使用多重策略确保位置准确
   */
  if (isOpen) {
    watch(isOpen, (open) => {
      if (open && currentMode.value === 'dropdown') {
        // 重置状态
        hasCalculated.value = false
        
        // 策略1：立即计算（使用当前可能不准确的尺寸）
        nextTick(() => {
          updatePosition()
        })

        // 策略2：延迟计算（等待CSS完全加载）
        nextTick(() => {
          setTimeout(() => {
            updatePosition()
          }, 100)
        })
      } else if (!open) {
        // 关闭时重置标志
        hasCalculated.value = false
      }
    })
  }

  /**
   * 生命周期钩子
   */
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
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer)
    }
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer)
    }
  })

  return {
    currentMode,
    popupStyle,
    isMobile: isSmallScreen,
    updatePosition
  }
}
