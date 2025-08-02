/**
 * @document-ref MICRO_ANIMATIONS.md#number-counter-animation
 * @design-ref DESIGN_SYSTEM.md#animation-system
 * @compliance-check 2025-08-02 - 숫자 카운터 애니메이션 컴포넌트
 */
import React from 'react'
import { useCounterAnimation } from '../../hooks/useAnimations'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatValue?: (value: number) => string
  prefix?: string
  suffix?: string
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  className = '',
  formatValue = (v) => v.toString(),
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const { currentValue, className: animationClass } = useCounterAnimation(value, duration)

  return (
    <span className={`${className} ${animationClass}`}>
      {prefix}{formatValue(currentValue)}{suffix}
    </span>
  )
}