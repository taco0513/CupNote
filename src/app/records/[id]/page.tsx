'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Coffee, MapPin, Star, Edit, Trash2, Thermometer, Clock, Heart, Share2, Camera, MessageCircle, TrendingUp, Award, Home, Store } from 'lucide-react'
import Navigation from '../../../components/Navigation'
import { CoffeeRecordService } from '../../../lib/supabase-service'
import type { CoffeeRecord } from '../../../types/coffee'

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<CoffeeRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecord()
  }, [params.id])

  const loadRecord = async () => {
    try {
      const id = params.id as string
      const records = await CoffeeRecordService.getRecords()
      const foundRecord = records.find(r => r.id === id)
      
      if (foundRecord) {
        setRecord(foundRecord)
      }
    } catch (error) {
      console.error('Failed to load record:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!record || !confirm('정말 이 기록을 삭제하시겠습니까?')) return
    
    try {
      await CoffeeRecordService.deleteRecord(record.id)
      router.push('/my-records')
    } catch (error) {
      console.error('Failed to delete record:', error)
      alert('기록 삭제에 실패했습니다.')
    }
  }

  const parseTasteData = (taste: any): string => {
    if (!taste) return '기록 없음'
    
    if (typeof taste === 'string') {
      if (taste.startsWith('[') || taste.startsWith('{')) {
        try {
          const parsed = JSON.parse(taste)
          
          if (parsed.flavors && Array.isArray(parsed.flavors)) {
            const flavorNames = parsed.flavors.map((f: any) => 
              typeof f === 'string' ? f : f.name || f.flavor || ''
            ).filter(Boolean)
            return flavorNames.length > 0 ? flavorNames.join(', ') : '기록 없음'
          }
          
          if (Array.isArray(parsed)) {
            const items = parsed.map((item: any) => 
              typeof item === 'string' ? item : item.name || item.flavor || ''
            ).filter(Boolean)
            return items.length > 0 ? items.join(', ') : '기록 없음'
          }
          
          if (parsed.selectedFlavors && Array.isArray(parsed.selectedFlavors)) {
            return parsed.selectedFlavors.join(', ')
          }
          
          return taste
        } catch {
          return taste
        }
      }
      return taste
    }
    
    if (Array.isArray(taste)) {
      const items = taste.map((item: any) => 
        typeof item === 'string' ? item : item.name || item.flavor || ''
      ).filter(Boolean)
      return items.length > 0 ? items.join(', ') : '기록 없음'
    }
    
    return String(taste)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <Navigation showBackButton currentPage="my-records" />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-coffee-800 mb-4">기록을 찾을 수 없습니다</h1>
          <button
            onClick={() => router.push('/my-records')}
            className="px-6 py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const getModeDisplay = (mode?: string) => {
    if (mode === 'cafe') return { icon: Store, text: 'Cafe', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    if (mode === 'homecafe') return { icon: Home, text: 'HomeCafe', color: 'bg-green-100 text-green-800 border-green-200' }
    return { icon: Coffee, text: '기록', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  const modeDisplay = getModeDisplay(record.mode)
  const ModeIcon = modeDisplay.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <Navigation showBackButton currentPage="my-records" />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-24 md:pt-20 pb-24">
        {/* 헤로 섹션 */}
        <div className="bg-gradient-to-br from-white to-coffee-50 rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* 이미지 또는 그라데이션 배경 */}
          {record.images && record.images.length > 0 ? (
            <div className="h-48 md:h-64 relative">
              <img
                src={record.images[0]}
                alt={record.coffeeName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ) : (
            <div className="h-32 md:h-40 bg-gradient-to-br from-coffee-400 to-coffee-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee className="h-16 w-16 md:h-20 md:w-20 text-white/20" />
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            {/* 커피 정보 헤더 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-coffee-900">{record.coffeeName}</h1>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${modeDisplay.color} flex items-center gap-1.5`}>
                    <ModeIcon className="h-3.5 w-3.5" />
                    <span>{modeDisplay.text}</span>
                  </span>
                </div>
                <p className="text-lg text-coffee-700 font-medium mb-2">{record.roastery}</p>
                <div className="flex items-center gap-4 text-coffee-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {record.origin && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{record.origin}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/edit/${record.id}`)}
                  className="p-2.5 bg-white/80 backdrop-blur-sm text-coffee-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                  title="수정"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2.5 bg-white/80 backdrop-blur-sm text-red-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md"
                  title="삭제"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 평점 */}
            {record.rating && (
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
                  <span className="text-2xl font-bold text-amber-700">{record.rating}.0</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= record.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="ml-auto text-sm text-amber-700">
                  {record.rating === 5 && '🤩 최고예요!'}
                  {record.rating === 4 && '😊 좋았어요!'}
                  {record.rating === 3 && '🙂 괜찮았어요'}
                  {record.rating === 2 && '😐 그저 그래요'}
                  {record.rating === 1 && '😞 아쉬웠어요'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 테이스팅 정보 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 내가 느낀 맛 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-coffee-800 mb-4 flex items-center">
              <Coffee className="h-5 w-5 mr-2 text-coffee-600" />
              내가 느낀 맛
            </h2>
            <div className="space-y-3">
              {parseTasteData(record.taste).split(', ').map((flavor, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1.5 bg-gradient-to-r from-coffee-100 to-coffee-50 text-coffee-700 rounded-full text-sm font-medium mr-2 mb-2 border border-coffee-200"
                >
                  {flavor}
                </span>
              ))}
            </div>
            {!record.taste || parseTasteData(record.taste) === '기록 없음' && (
              <p className="text-gray-500 italic">아직 기록된 맛이 없어요</p>
            )}
          </div>

          {/* 로스터 노트 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-coffee-800 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-coffee-600" />
              로스터 노트
            </h2>
            {record.roasterNote ? (
              <p className="text-coffee-700 leading-relaxed">{record.roasterNote}</p>
            ) : (
              <p className="text-gray-500 italic">로스터 노트가 없어요</p>
            )}
          </div>
        </div>

        {/* 개인 메모 */}
        {record.memo && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              개인 메모
            </h2>
            <p className="text-blue-700 leading-relaxed italic">"{record.memo}"</p>
          </div>
        )}

        {/* 커피 상세 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-coffee-800 mb-4">커피 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {record.origin && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">원산지</p>
                  <p className="text-sm font-medium text-coffee-800">{record.origin}</p>
                </div>
              </div>
            )}
            {record.roastLevel && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Thermometer className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">로스팅</p>
                  <p className="text-sm font-medium text-coffee-800">{record.roastLevel}</p>
                </div>
              </div>
            )}
            {record.brewMethod && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Coffee className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">추출 방법</p>
                  <p className="text-sm font-medium text-coffee-800">{record.brewMethod}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">기록 시간</p>
                <p className="text-sm font-medium text-coffee-800">
                  {new Date(record.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        {record.images && record.images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-coffee-800 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-coffee-600" />
              사진 ({record.images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {record.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`${record.coffeeName} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-coffee-700 font-medium">
            <Heart className="h-5 w-5" />
            좋아요
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-coffee-700 font-medium">
            <Share2 className="h-5 w-5" />
            공유하기
          </button>
        </div>

        {/* 추천 섹션 */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
          <h2 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            다음에 시도해보세요
          </h2>
          <p className="text-purple-700 mb-3">
            이 커피를 좋아하신다면, 비슷한 프로파일의 다른 커피들도 시도해보세요!
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-sm font-medium border border-purple-200">
              에티오피아 예가체프
            </span>
            <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-sm font-medium border border-purple-200">
              케냐 AA
            </span>
            <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-sm font-medium border border-purple-200">
              콜롬비아 게이샤
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}