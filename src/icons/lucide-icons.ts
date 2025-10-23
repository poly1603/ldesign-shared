/**
 * Lucide 图标 SVG Path 数据
 * 
 * 提供常用 Lucide 图标的 SVG path 数据
 * 各包可以用任何方式渲染这些图标（Vue 组件、React 组件、原生 SVG 等）
 * 
 * 图标来源：https://lucide.dev
 * 所有图标都使用 24x24 viewBox
 */

/**
 * Lucide 图标数据映射
 * 
 * 每个图标包含：
 * - paths: SVG path 元素数组
 * - circles: SVG circle 元素数组（如果有）
 * - rects: SVG rect 元素数组（如果有）
 */
export interface LucideIconData {
  /** SVG path 元素 */
  paths?: Array<{
    d: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    strokeLinecap?: 'round' | 'butt' | 'square'
    strokeLinejoin?: 'round' | 'miter' | 'bevel'
  }>
  /** SVG circle 元素 */
  circles?: Array<{
    cx: number
    cy: number
    r: number
  }>
  /** SVG rect 元素 */
  rects?: Array<{
    x: number
    y: number
    width: number
    height: number
    rx?: number
  }>
}

/**
 * Lucide 图标集合
 */
export const lucideIcons = {
  /**
   * Palette 图标 - 用于颜色选择器
   */
  Palette: {
    paths: [
      {
        d: 'M13.5 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M8 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * Languages 图标 - 用于语言切换器
   */
  Languages: {
    paths: [
      {
        d: 'M4 5h7',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M9 3v2',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'm5 9-3 3 3 3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M2 12h13',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M18 10h3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'm19 6 3 3-3 3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M22 12h-3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * ALargeSmall 图标 - 用于尺寸选择器
   */
  ALargeSmall: {
    paths: [
      {
        d: 'M21 14h-5',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M16 16v-3.5a2.5 2.5 0 0 1 5 0V16',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'M4.5 13h6',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'm3 16 4.5-9 4.5 9',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * LayoutTemplate 图标 - 用于模板选择器
   */
  LayoutTemplate: {
    rects: [
      {
        x: 3,
        y: 3,
        width: 18,
        height: 7,
        rx: 1
      },
      {
        x: 3,
        y: 14,
        width: 7,
        height: 7,
        rx: 1
      },
      {
        x: 14,
        y: 14,
        width: 7,
        height: 7,
        rx: 1
      }
    ]
  },

  /**
   * ChevronDown 图标 - 用于下拉箭头
   */
  ChevronDown: {
    paths: [
      {
        d: 'm6 9 6 6 6-6',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * X 图标 - 用于关闭按钮
   */
  X: {
    paths: [
      {
        d: 'M18 6 6 18',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      {
        d: 'm6 6 12 12',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * Check 图标 - 用于选中标记
   */
  Check: {
    paths: [
      {
        d: 'M20 6 9 17l-5-5',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  },

  /**
   * Search 图标 - 用于搜索框
   */
  Search: {
    circles: [
      {
        cx: 11,
        cy: 11,
        r: 8
      }
    ],
    paths: [
      {
        d: 'm21 21-4.3-4.3',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    ]
  }
} as const

export type LucideIconName = keyof typeof lucideIcons

/**
 * 获取图标数据
 * 
 * @param name - 图标名称
 * @returns 图标数据对象
 * 
 * @example
 * ```typescript
 * const paletteIcon = getIconData('Palette')
 * ```
 */
export function getIconData(name: LucideIconName): LucideIconData {
  return lucideIcons[name]
}

/**
 * 渲染 SVG 图标的辅助函数
 * 
 * @param name - 图标名称
 * @param options - SVG 属性选项
 * @returns SVG 字符串
 * 
 * @example
 * ```typescript
 * const svgString = renderIcon('Palette', { size: 24, color: 'currentColor' })
 * ```
 */
export function renderIcon(
  name: LucideIconName,
  options: {
    size?: number
    color?: string
    strokeWidth?: number
    className?: string
  } = {}
): string {
  const { size = 24, color = 'currentColor', strokeWidth = 2, className = '' } = options
  const iconData = getIconData(name)

  let elements = ''

  // 渲染 paths
  if (iconData.paths) {
    elements += iconData.paths
      .map(path => {
        const attrs = [
          `d="${path.d}"`,
          `stroke="${color}"`,
          `stroke-width="${strokeWidth}"`,
          path.strokeLinecap ? `stroke-linecap="${path.strokeLinecap}"` : '',
          path.strokeLinejoin ? `stroke-linejoin="${path.strokeLinejoin}"` : '',
          'fill="none"'
        ].filter(Boolean).join(' ')
        return `<path ${attrs} />`
      })
      .join('')
  }

  // 渲染 circles
  if (iconData.circles) {
    elements += iconData.circles
      .map(circle => {
        return `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" />`
      })
      .join('')
  }

  // 渲染 rects
  if (iconData.rects) {
    elements += iconData.rects
      .map(rect => {
        const rxAttr = rect.rx ? `rx="${rect.rx}"` : ''
        return `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" ${rxAttr} stroke="${color}" stroke-width="${strokeWidth}" fill="none" />`
      })
      .join('')
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" class="${className}">${elements}</svg>`
}

/**
 * 获取简化的 path 字符串（仅第一个 path）
 * 用于简单的 SVG 渲染场景
 * 
 * @param name - 图标名称
 * @returns path d 属性值
 * 
 * @example
 * ```vue
 * <svg viewBox="0 0 24 24">
 *   <path :d="getIconPath('Palette')" />
 * </svg>
 * ```
 */
export function getIconPath(name: LucideIconName): string {
  const iconData = getIconData(name)
  return iconData.paths?.[0]?.d || ''
}


