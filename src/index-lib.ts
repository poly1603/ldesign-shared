/**
 * @ldesign/shared - UMD构建专用入口文件
 * 为浏览器环境提供共享工具函数
 * 不包含Vue/React特定集成
 */

// 导出类型
export * from './types'

// 导出工具函数
export * from './utils'

// 导出测试工具
export * from './test-utils'

// 导出错误处理
export * from './error-handler'

// 导出工具函数（明确列出，避免Vue组件）
export * from './utils/array'
export * from './utils/batchUpdate'
export * from './utils/browser'
export * from './utils/cache'
export * from './utils/date'
export * from './utils/dom'
export * from './utils/easing'
export * from './utils/eventBus'
export * from './utils/file'
export * from './utils/format'
export * from './utils/general'
export * from './utils/http'
export * from './utils/observe'
export * from './utils/performance'
export * from './utils/renderNode'
export * from './utils/setStyle'
export * from './utils/string'
export * from './utils/tree'
export * from './utils/validate'
export * from './utils/withInstall'

// 导出基本类型定义
export type {
  // 通用类型
  PlainObject,
  OptionData,
  TreeOptionData,
  SizeEnum,
  ShapeEnum,
  HorizontalAlignEnum,
  VerticalAlignEnum,
  LayoutEnum,
  ClassName,
  CSSSelector,
  KeysType,
  TreeKeysType,
  HTMLElementAttributes,

  // 实用类型
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  Nullable,
  Optional,
  Maybe,
  AnyFunction,
  AsyncFunction,
  Constructor,
  AbstractConstructor,
  ValueOrFunction,
  ValueOrPromise,
  ArrayOrSingle,

  // Web开发类型
  ApiResponse,
  SearchParams,
  UploadFile,
  FormField,
  MenuItem,
  RouteMeta,
  UserInfo,
  ThemeConfig,
  DeviceInfo,
  NotificationConfig
} from './types'

// 导出选择器协议和逻辑层
export * from './protocols'
export * from './icons'
