import React from 'react'

import { Share2, Heart, MessageCircle, Bookmark } from 'lucide-react'

import { CoffeeRecord } from '../types/coffee'

interface CoffeeShareCardProps {
  record: CoffeeRecord
  isPublic?: boolean
  likes?: number
  comments?: number
  onShare?: () => void
  onLike?: () => void
  onComment?: () => void
}

export default function CoffeeShareCard({ 
  record, 
  isPublic = false,
  likes = 0,
  comments = 0,
  onShare,
  onLike,
  onComment
}: CoffeeShareCardProps) {
  
  const generateShareImage = () => {
    // 공유용 이미지 생성 로직
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // 배경
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
      gradient.addColorStop(0, '#F5E6D3')
      gradient.addColorStop(1, '#E6D2BB')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1080)
      
      // 커피 정보
      ctx.fillStyle = '#3E2A1A'
      ctx.font = 'bold 64px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(record.coffeeName, 540, 400)
      
      ctx.font = '48px sans-serif'
      ctx.fillStyle = '#5A3E28'
      ctx.fillText(record.roastery || '', 540, 480)
      
      // 별점
      const stars = '⭐'.repeat(record.rating || 0)
      ctx.font = '56px sans-serif'
      ctx.fillText(stars, 540, 580)
      
      // 테이스팅 노트
      if (record.taste) {
        ctx.font = '36px sans-serif'
        ctx.fillStyle = '#704F33'
        const words = record.taste.split(' ')
        const lines = []
        let currentLine = ''
        
        words.forEach(word => {
          if (ctx.measureText(currentLine + word).width < 800) {
            currentLine += word + ' '
          } else {
            lines.push(currentLine.trim())
            currentLine = word + ' '
          }
        })
        lines.push(currentLine.trim())
        
        lines.forEach((line, index) => {
          ctx.fillText(line, 540, 700 + (index * 50))
        })
      }
      
      // CupNote 로고
      ctx.font = 'bold 32px sans-serif'
      ctx.fillStyle = '#8B6341'
      ctx.fillText('☕ CupNote', 540, 980)
    }
    
    return canvas.toDataURL('image/png')
  }
  
  const handleShare = async () => {
    const imageUrl = generateShareImage()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${record.coffeeName} - CupNote`,
          text: `${record.coffeeName} (${record.roastery}) - ${record.rating}점\n${record.taste}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(
        `${record.coffeeName} (${record.roastery}) - ${record.rating}점\n${record.taste}\n\n☕ CupNote에서 기록`
      )
      alert('링크가 복사되었습니다!')
    }
    
    onShare?.()
  }
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 메인 콘텐츠 */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-coffee-800">{record.coffeeName}</h3>
            <p className="text-coffee-600">{record.roastery}</p>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < (record.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
        </div>
        
        {record.taste && (
          <p className="text-coffee-700 mb-4">{record.taste}</p>
        )}
        
        {/* 공개 여부 표시 */}
        {isPublic && (
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Share2 className="h-3 w-3 mr-1" />
            공개됨
          </div>
        )}
      </div>
      
      {/* 액션 바 */}
      <div className="border-t border-coffee-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className="flex items-center space-x-1 text-coffee-600 hover:text-red-500 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm">{likes > 0 && likes}</span>
            </button>
            
            <button
              onClick={onComment}
              className="flex items-center space-x-1 text-coffee-600 hover:text-coffee-800 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{comments > 0 && comments}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-coffee-600 hover:text-coffee-800 transition-colors">
              <Bookmark className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 text-coffee-600 hover:text-coffee-800 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}