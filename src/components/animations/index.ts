/**
 * @document-ref MICRO_ANIMATIONS.md#component-exports
 * @design-ref DESIGN_SYSTEM.md#animation-system
 * @compliance-check 2025-08-02 - 애니메이션 컴포넌트 통합 export
 */

// 애니메이션 컴포넌트들
export { default as AnimatedCounter } from './AnimatedCounter'
export { default as CoffeeIcon } from './CoffeeIcon'
export { default as AnimatedButton } from './AnimatedButton'

// 애니메이션 훅들
export * from '../../hooks/useAnimations'

// 타입 정의
export type { AnimationType, AnimationOptions } from '../../hooks/useAnimations'