import React from 'react'

interface TasteProfile {
  acidity: number      // 산미
  sweetness: number    // 단맛
  bitterness: number   // 쓴맛
  body: number         // 바디감
  aroma: number        // 향
  aftertaste: number   // 여운
}

interface TasteRadarChartProps {
  profile: TasteProfile
  size?: number
  showLabels?: boolean
}

export default function TasteRadarChart({ 
  profile, 
  size = 200,
  showLabels = true 
}: TasteRadarChartProps) {
  const dimensions = Object.keys(profile) as (keyof TasteProfile)[]
  const dimensionLabels = {
    acidity: '산미',
    sweetness: '단맛',
    bitterness: '쓴맛',
    body: '바디감',
    aroma: '향',
    aftertaste: '여운'
  }
  
  const center = size / 2
  const radius = size * 0.35
  const angleStep = (Math.PI * 2) / dimensions.length
  
  // 각 축의 좌표 계산
  const getCoordinate = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2
    const distance = (value / 5) * radius
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance
    }
  }
  
  // 배경 그리드 좌표
  const gridLevels = [1, 2, 3, 4, 5]
  const gridPaths = gridLevels.map(level => {
    const points = dimensions.map((_, index) => {
      const coord = getCoordinate(level, index)
      return `${coord.x},${coord.y}`
    })
    return points.join(' ')
  })
  
  // 데이터 폴리곤
  const dataPoints = dimensions.map((dim, index) => {
    const coord = getCoordinate(profile[dim], index)
    return `${coord.x},${coord.y}`
  }).join(' ')
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="transform rotate-0">
        {/* 배경 그리드 */}
        <g className="opacity-20">
          {gridPaths.map((path, index) => (
            <polygon
              key={index}
              points={path}
              fill="none"
              stroke="#8B6341"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* 축 라인 */}
        <g className="opacity-30">
          {dimensions.map((_, index) => {
            const endCoord = getCoordinate(5, index)
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={endCoord.x}
                y2={endCoord.y}
                stroke="#8B6341"
                strokeWidth="1"
              />
            )
          })}
        </g>
        
        {/* 데이터 영역 */}
        <polygon
          points={dataPoints}
          fill="url(#coffeeGradient)"
          fillOpacity="0.6"
          stroke="#8B6341"
          strokeWidth="2"
        />
        
        {/* 데이터 포인트 */}
        {dimensions.map((dim, index) => {
          const coord = getCoordinate(profile[dim], index)
          return (
            <circle
              key={index}
              cx={coord.x}
              cy={coord.y}
              r="4"
              fill="#8B6341"
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
        
        {/* 그라디언트 정의 */}
        <defs>
          <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C19A6B" />
            <stop offset="100%" stopColor="#8B6341" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 라벨 */}
      {showLabels && (
        <div className="absolute inset-0">
          {dimensions.map((dim, index) => {
            const angle = index * angleStep - Math.PI / 2
            const labelDistance = radius + 25
            const x = center + Math.cos(angle) * labelDistance
            const y = center + Math.sin(angle) * labelDistance
            
            return (
              <div
                key={dim}
                className="absolute text-xs font-medium text-coffee-700"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-center">
                  <div>{dimensionLabels[dim]}</div>
                  <div className="text-coffee-500">{profile[dim]}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}