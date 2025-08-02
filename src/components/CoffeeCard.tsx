import React from 'react'
import Link from 'next/link'
import { Coffee, MapPin, Calendar, Star, Camera } from 'lucide-react'
import LazyImage from './LazyImage'
import { CoffeeRecord } from '../types/coffee'

interface CoffeeCardProps {
  record: CoffeeRecord
  variant?: 'default' | 'compact' | 'detailed'
}

export default function CoffeeCard({ record, variant = 'default' }: CoffeeCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const getModeStyle = (mode?: string) => {
    if (mode === 'cafe') return 'from-blue-400 to-sky-500'
    if (mode === 'homecafe') return 'from-green-400 to-emerald-500'
    return 'from-purple-400 to-purple-600'
  }

  if (variant === 'compact') {
    return (
      <Link href={`/coffee/${record.id}`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-coffee-200/30 shadow-sm hover:shadow-lg hover:bg-white/90 transition-all duration-200 group">
          <div className="flex items-start space-x-4">
            {/* 이미지 또는 아이콘 */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {record.images?.[0] ? (
                <LazyImage
                  src={record.images[0]}
                  alt={record.coffeeName}
                  className="w-full h-full rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className={`w-full h-full rounded-xl bg-gradient-to-br ${getModeStyle(record.mode)} flex items-center justify-center shadow-sm`}>
                  <Coffee className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-coffee-800 truncate group-hover:text-coffee-600 transition-colors">
                {record.coffeeName}
              </h3>
              <div className="flex items-center space-x-3 mt-1 text-sm text-coffee-600">
                {record.roastery && (
                  <span className="truncate">{record.roastery}</span>
                )}
                <span>{formatDate(record.date)}</span>
              </div>
              {record.rating && (
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < record.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-coffee-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/coffee/${record.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-coffee-200/30 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-200 group transform hover:-translate-y-1">
        {/* 이미지 영역 */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-coffee-100/50 to-coffee-200/50">
          {record.images?.[0] ? (
            <>
              <LazyImage
                src={record.images[0]}
                alt={record.coffeeName}
                className="w-full h-full object-cover"
              />
              {record.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Camera className="h-3 w-3 mr-1" />
                  {record.images.length}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coffee className="h-16 w-16 text-coffee-300" />
            </div>
          )}
          
          {/* 모드 배지 */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${getModeStyle(record.mode)}`}>
            {record.mode === 'cafe' ? '카페' : '홈카페'}
          </div>
        </div>
        
        {/* 정보 영역 */}
        <div className="p-5">
          {/* 제목과 평점 */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-coffee-800 flex-1 mr-2 group-hover:text-coffee-600 transition-colors">
              {record.coffeeName}
            </h3>
            {record.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-coffee-700">{record.rating}</span>
              </div>
            )}
          </div>
          
          {/* 부가 정보 */}
          <div className="flex items-center space-x-3 text-sm text-coffee-600 mb-3">
            {record.roastery && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{record.roastery}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(record.date)}</span>
            </div>
          </div>
          
          {/* 테이스팅 노트 */}
          {record.taste && (
            <p className="text-sm text-coffee-700 line-clamp-2 mb-3">
              {record.taste}
            </p>
          )}
          
          {/* 매치 스코어 */}
          {record.matchScore && (
            <div className="mt-3 pt-3 border-t border-coffee-100/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-coffee-500">Match Score</span>
                <span className="font-medium text-coffee-700">{record.matchScore.overall}%</span>
              </div>
              <div className="mt-1 h-2 bg-coffee-100/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-coffee-400 to-coffee-600 transition-all duration-300"
                  style={{ width: `${record.matchScore.overall}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}