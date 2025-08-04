/**
 * 맛 프로파일 레이더 차트 컴포넌트
 * 스크린샷 스타일 - 깔끔한 브라운 테마 육각형 차트
 */
'use client'

import { useMemo, useState } from 'react'

interface FlavorData {
  labels: string[]
  values: number[] // 0-5 scale
  maxValue?: number
}

interface FlavorRadarChartProps {
  data: FlavorData
  previousData?: FlavorData
  size?: number
  strokeColor?: string
  fillColor?: string
  previousStrokeColor?: string
  previousFillColor?: string
  showValues?: boolean
  showGrid?: boolean
}

export default function FlavorRadarChart({
  data,
  previousData,
  size = 300,
  strokeColor = '#8B4513', // Saddle Brown
  fillColor = 'rgba(139, 69, 19, 0.12)', // Lighter fill
  previousStrokeColor = '#D2691E', // Chocolate
  previousFillColor = 'rgba(210, 105, 30, 0.06)',
  showValues = false,
  showGrid = true
}: FlavorRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxValue = data.maxValue || 5
  const center = size / 2
  const radius = size * 0.35
  const angleStep = (2 * Math.PI) / data.labels.length

  // 좌표 계산 함수
  const getCoordinates = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2 // -90도에서 시작 (12시 방향)
    const r = (value / maxValue) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    }
  }

  // 현재 데이터 포인트
  const currentPoints = useMemo(() => {
    return data.values.map((value, index) => getCoordinates(value, index))
  }, [data.values])

  // 이전 데이터 포인트
  const previousPoints = useMemo(() => {
    if (!previousData) return null
    return previousData.values.map((value, index) => getCoordinates(value, index))
  }, [previousData?.values])

  // 폴리곤 포인트 문자열 생성
  const createPolygonPoints = (points: { x: number; y: number }[]) => {
    return points.map(p => `${p.x},${p.y}`).join(' ')
  }

  // 그리드 라인 생성
  const gridLevels = [1, 2, 3, 4, 5]
  const gridColors = ['#f8f8f8', '#f3f3f3', '#eeeeee', '#e8e8e8', '#e2e2e2']

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        className="transform transition-transform hover:scale-105"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))' }}
      >
        <defs>
          {/* 그라데이션 정의 */}
          <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="previousGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={previousStrokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={previousStrokeColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* 배경 그리드 (육각형) */}
        {showGrid && (
          <g className="grid">
            {/* 배경 채우기 */}
            {gridLevels.slice().reverse().map((level, idx) => {
              const gridPoints = data.labels.map((_, index) => {
                const angle = angleStep * index - Math.PI / 2
                const r = (level / 5) * radius
                return {
                  x: center + r * Math.cos(angle),
                  y: center + r * Math.sin(angle)
                }
              })
              return (
                <polygon
                  key={`fill-${level}`}
                  points={createPolygonPoints(gridPoints)}
                  fill={gridColors[idx]}
                  stroke="none"
                />
              )
            })}
            {/* 그리드 라인 */}
            {gridLevels.map((level) => {
              const gridPoints = data.labels.map((_, index) => {
                const angle = angleStep * index - Math.PI / 2
                const r = (level / 5) * radius
                return {
                  x: center + r * Math.cos(angle),
                  y: center + r * Math.sin(angle)
                }
              })
              return (
                <polygon
                  key={`line-${level}`}
                  points={createPolygonPoints(gridPoints)}
                  fill="none"
                  stroke="#d4d4d4"
                  strokeWidth={level === 5 ? "1.5" : "0.5"}
                  opacity={level === 5 ? 1 : 0.4}
                />
              )
            })}

            {/* 중심선 */}
            {data.labels.map((_, index) => {
              const angle = angleStep * index - Math.PI / 2
              const endX = center + radius * Math.cos(angle)
              const endY = center + radius * Math.sin(angle)
              return (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke="#d4d4d4"
                  strokeWidth="0.5"
                  opacity="0.3"
                  strokeDasharray="2,3"
                />
              )
            })}
          </g>
        )}

        {/* 이전 데이터 (있는 경우) */}
        {previousPoints && (
          <g className="previous-data">
            <polygon
              points={createPolygonPoints(previousPoints)}
              fill={previousFillColor}
              stroke={previousStrokeColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {previousPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
                stroke={previousStrokeColor}
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </g>
        )}

        {/* 현재 데이터 */}
        <g className="current-data">
          {/* 채워진 영역 */}
          <polygon
            points={createPolygonPoints(currentPoints)}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ 
              filter: 'url(#blur)',
              opacity: 0.9
            }}
          />
          {/* 더 진한 외곽선 */}
          <polygon
            points={createPolygonPoints(currentPoints)}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          
          {/* 포인트 (노드) */}
          {currentPoints.map((point, index) => (
            <g 
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* 호버 효과 영역 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="transparent"
              />
              {/* 외곽 원 (호버시 표시) */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? "8" : "6"}
                fill={strokeColor}
                opacity={hoveredIndex === index ? 0.2 : 0}
                className="transition-all duration-200"
              />
              {/* 메인 포인트 - 브라운 배경 */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? "6" : "5"}
                fill={strokeColor}
                className="transition-all duration-200"
              />
              {/* 흰색 중심 */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? "3" : "2.5"}
                fill="white"
                className="transition-all duration-200"
              />
            </g>
          ))}
        </g>

        {/* 라벨 */}
        <g className="labels">
          {data.labels.map((label, index) => {
            const angle = angleStep * index - Math.PI / 2
            const labelRadius = radius + 28
            const x = center + labelRadius * Math.cos(angle)
            const y = center + labelRadius * Math.sin(angle)
            
            // 텍스트 앵커 조정
            let textAnchor = 'middle'
            let dy = 0
            
            // 위치별 세밀한 조정
            if (index === 0) { // 상단
              dy = -3
            } else if (index === 3) { // 하단
              dy = 3
            } else if (x < center - 10) {
              textAnchor = 'end'
            } else if (x > center + 10) {
              textAnchor = 'start'
            }
            
            return (
              <text
                key={index}
                x={x}
                y={y + dy}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="fill-gray-700 text-[13px] font-medium"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {label}
              </text>
            )
          })}
        </g>

        {/* 값 표시 (호버시 또는 showValues일 때) */}
        {currentPoints.map((point, index) => (
          <g 
            key={`value-${index}`} 
            className="transition-all duration-200"
            style={{ 
              opacity: showValues || hoveredIndex === index ? 1 : 0,
              pointerEvents: 'none'
            }}
          >
            <rect
              x={point.x - 18}
              y={point.y - 28}
              width="36"
              height="20"
              rx="10"
              fill={strokeColor}
              opacity="0.95"
            />
            <text
              x={point.x}
              y={point.y - 13}
              textAnchor="middle"
              className="fill-white text-[11px] font-semibold"
            >
              {data.values[index].toFixed(1)}
            </text>
          </g>
        ))}
        
        {/* SVG 필터 정의 */}
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}