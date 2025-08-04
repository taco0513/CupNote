/**
 * 맛 프로파일 레이더 차트 컴포넌트
 * 깔끔한 육각형 디자인 with 브라운 테마
 */
'use client'

import { useEffect, useRef } from 'react'

interface FlavorRadarChartProps {
  data?: {
    산미: number
    아로마: number
    단맛: number
    바디: number
    쓴맛: number
    향미: number
  }
  maxValue?: number
  size?: number
}

export default function FlavorRadarChart({ 
  data = {
    산미: 4.2,
    아로마: 3.8,
    단맛: 2.5,
    바디: 3.5,
    쓴맛: 2.0,
    향미: 4.0
  },
  maxValue = 5,
  size = 320
}: FlavorRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 고해상도 지원
    const scale = window.devicePixelRatio || 1
    canvas.width = size * scale
    canvas.height = size * scale
    ctx.scale(scale, scale)
    
    // 중심점
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35
    
    // 레이블과 값
    const labels = Object.keys(data)
    const values = Object.values(data)
    const angleStep = (Math.PI * 2) / labels.length
    
    // 배경 클리어
    ctx.clearRect(0, 0, size, size)
    
    // 배경 육각형 그리기 (5개 레벨)
    for (let level = 5; level >= 1; level--) {
      ctx.beginPath()
      const levelRadius = (radius * level) / 5
      
      for (let i = 0; i <= labels.length; i++) {
        const angle = angleStep * i - Math.PI / 2
        const x = centerX + Math.cos(angle) * levelRadius
        const y = centerY + Math.sin(angle) * levelRadius
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      // 배경 색상 - 가장 바깥쪽이 연한 색
      if (level === 5) {
        ctx.fillStyle = '#f5f5f5'
        ctx.fill()
      }
      
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    
    // 중심에서 각 꼭지점으로 선 그리기
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    
    for (let i = 0; i < labels.length; i++) {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      const angle = angleStep * i - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    
    // 데이터 영역 그리기
    ctx.beginPath()
    
    for (let i = 0; i <= labels.length; i++) {
      const value = values[i % labels.length]
      const angle = angleStep * i - Math.PI / 2
      const distance = (value / maxValue) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    // 채우기 - 반투명 브라운
    ctx.fillStyle = 'rgba(139, 69, 19, 0.15)'
    ctx.fill()
    
    // 테두리 - 진한 브라운
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 2.5
    ctx.stroke()
    
    // 데이터 포인트 그리기
    for (let i = 0; i < labels.length; i++) {
      const value = values[i]
      const angle = angleStep * i - Math.PI / 2
      const distance = (value / maxValue) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      
      // 포인트 원
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#8B4513'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // 레이블 그리기
    ctx.fillStyle = '#333'
    ctx.font = '14px Inter, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i < labels.length; i++) {
      const angle = angleStep * i - Math.PI / 2
      const labelDistance = radius + 30
      const x = centerX + Math.cos(angle) * labelDistance
      const y = centerY + Math.sin(angle) * labelDistance
      
      ctx.fillText(labels[i], x, y)
    }
    
  }, [data, maxValue, size])
  
  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="mx-auto"
    />
  )
}