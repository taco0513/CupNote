/**
 * @document-ref MICRO_ANIMATIONS.md#coffee-themed-animations
 * @design-ref DESIGN_SYSTEM.md#coffee-icons
 * @compliance-check 2025-08-02 - 커피 테마 애니메이션 아이콘
 */
import React from 'react'

import { Coffee } from 'lucide-react'

import { useCoffeeAnimation } from '../../hooks/useAnimations'

interface CoffeeIconProps {
  size?: number
  withSteam?: boolean
  withPulse?: boolean
  className?: string
  onClick?: () => void
}

export default function CoffeeIcon({
  size = 24,
  withSteam = false,
  withPulse = false,
  className = '',
  onClick
}: CoffeeIconProps) {
  const { steamClass, pulseClass, startBrewing } = useCoffeeAnimation()

  const handleClick = () => {
    if (withSteam) {
      startBrewing()
    }
    onClick?.()
  }

  const iconClass = [
    className,
    withSteam ? steamClass : '',
    withPulse ? pulseClass : '',
    onClick ? 'cursor-pointer coffee-button' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={`relative inline-block ${iconClass}`} onClick={handleClick}>
      <Coffee size={size} />
    </div>
  )
}