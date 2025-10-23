/**
 * useBreakpoint Composable
 * 
 * 检测屏幕尺寸和响应式断点
 * 提供当前断点信息和判断函数
 */

import { computed, onMounted, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

/**
 * 断点定义
 */
export interface BreakpointConfig {
  /** 移动端断点 (px) */
  mobile: number
  /** 平板断点 (px) */
  tablet: number
  /** 桌面端断点 (px) */
  desktop: number
}

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024
}

/**
 * 断点类型
 */
export type BreakpointType = 'mobile' | 'tablet' | 'desktop'

/**
 * useBreakpoint 返回值
 */
export interface UseBreakpointReturn {
  /** 当前窗口宽度 */
  width: Ref<number>
  /** 当前窗口高度 */
  height: Ref<number>
  /** 当前断点类型 */
  current: ComputedRef<BreakpointType>
  /** 是否是移动端 */
  isMobile: ComputedRef<boolean>
  /** 是否是平板 */
  isTablet: ComputedRef<boolean>
  /** 是否是桌面端 */
  isDesktop: ComputedRef<boolean>
  /** 是否小于指定断点 */
  isSmaller: (breakpoint: number) => boolean
  /** 是否大于指定断点 */
  isGreater: (breakpoint: number) => boolean
  /** 手动更新尺寸 */
  update: () => void
}

/**
 * useBreakpoint Composable
 * 
 * @param config - 断点配置
 * @returns 断点信息和判断函数
 * 
 * @example
 * ```typescript
 * const { current, isMobile, isDesktop } = useBreakpoint()
 * 
 * // 根据断点显示不同内容
 * if (isMobile.value) {
 *   // 移动端逻辑
 * }
 * ```
 */
export function useBreakpoint(config: Partial<BreakpointConfig> = {}): UseBreakpointReturn {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...config }

  // 窗口尺寸
  const width = ref(0)
  const height = ref(0)

  /**
   * 更新窗口尺寸
   */
  const update = () => {
    if (typeof window !== 'undefined') {
      width.value = window.innerWidth
      height.value = window.innerHeight
    }
  }

  /**
   * 当前断点类型
   */
  const current = computed<BreakpointType>(() => {
    if (width.value < breakpoints.mobile) {
      return 'mobile'
    }
    if (width.value < breakpoints.desktop) {
      return 'tablet'
    }
    return 'desktop'
  })

  /**
   * 是否是移动端
   */
  const isMobile = computed(() => current.value === 'mobile')

  /**
   * 是否是平板
   */
  const isTablet = computed(() => current.value === 'tablet')

  /**
   * 是否是桌面端
   */
  const isDesktop = computed(() => current.value === 'desktop')

  /**
   * 是否小于指定断点
   */
  const isSmaller = (breakpoint: number): boolean => {
    return width.value < breakpoint
  }

  /**
   * 是否大于指定断点
   */
  const isGreater = (breakpoint: number): boolean => {
    return width.value >= breakpoint
  }

  // 防抖处理
  let resizeTimer: number | null = null
  const handleResize = () => {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = window.setTimeout(() => {
      update()
      resizeTimer = null
    }, 150) as unknown as number
  }

  // 生命周期
  onMounted(() => {
    update()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer)
    }
  })

  return {
    width,
    height,
    current,
    isMobile,
    isTablet,
    isDesktop,
    isSmaller,
    isGreater,
    update
  }
}


