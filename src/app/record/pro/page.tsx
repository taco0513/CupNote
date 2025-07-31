'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Beaker, Coffee, Scale, ThermometerSun, Star, Camera, Save, ArrowLeft, Award } from 'lucide-react'
import Link from 'next/link'

import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import ImageUpload from '../../../components/ImageUpload'
import { supabaseService } from '../../../lib/supabase-service'
import { UI_LABELS } from '../../../config'

interface ProRecord {
  // Step 1: 원두 상세 정보
  coffeeName: string
  farm: string
  variety: string
  processing: string
  altitude: string
  harvestDate: string
  
  // Step 2: 로스팅 정보
  roaster: string
  roastDate: string
  roastLevel: string
  developmentTime: string
  firstCrackTemp: string
  
  // Step 3: 추출 파라미터
  brewingMethod: string
  doseIn: number
  yieldOut: number
  extractionTime: number
  waterTemp: number
  grindSetting: string
  
  // Step 4: SCA 커핑 평가 (9항목)
  fragrance: number
  flavor: number
  aftertaste: number
  acidity: number
  body: number
  balance: number
  uniformity: number
  cleanCup: number
  sweetness: number
  
  // Step 5: 과학적 데이터
  tds: number
  extractionYield: number
  waterAnalysis: string
  refractometerReading: string
  
  // Step 6: 전문가 노트
  cuppingNotes: string
  flavorWheel: string[]
  defects: string
  
  // Step 7: 데이터 분석
  scoreTotal: number
  grade: string
  recommendations: string
  
  // Step 8: 전문가 리포트
  image?: File | null
  reportNotes: string
  certification: boolean
}

export default function ProModePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [record, setRecord] = useState<ProRecord>({
    coffeeName: '',
    farm: '',
    variety: '',
    processing: '',
    altitude: '',
    harvestDate: '',
    roaster: '',
    roastDate: '',
    roastLevel: '',
    developmentTime: '',
    firstCrackTemp: '',
    brewingMethod: 'cupping',
    doseIn: 8.25,
    yieldOut: 150,
    extractionTime: 240,
    waterTemp: 93,
    grindSetting: '',
    fragrance: 0,
    flavor: 0,
    aftertaste: 0,
    acidity: 0,
    body: 0,
    balance: 0,
    uniformity: 0,
    cleanCup: 0,
    sweetness: 0,
    tds: 0,
    extractionYield: 0,
    waterAnalysis: '',
    refractometerReading: '',
    cuppingNotes: '',
    flavorWheel: [],
    defects: '',
    scoreTotal: 0,
    grade: '',
    recommendations: '',
    image: null,
    reportNotes: '',
    certification: false,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 이미지 업로드 (있다면)
      let imageUrl = null
      if (record.image) {
        imageUrl = await supabaseService.uploadImage(record.image, 'coffee-photos')
      }

      // SCA 총점 계산 (10점 만점 * 9항목 = 90점)
      const scaTotal = record.fragrance + record.flavor + record.aftertaste + 
                      record.acidity + record.body + record.balance + 
                      record.uniformity + record.cleanCup + record.sweetness

      // 100점 환산 및 등급 계산
      const finalScore = (scaTotal / 90) * 100
      let grade = 'Commercial'
      if (finalScore >= 90) grade = 'Outstanding'
      else if (finalScore >= 85) grade = 'Excellent'  
      else if (finalScore >= 80) grade = 'Very Good'
      else if (finalScore >= 70) grade = 'Good'

      // 커피 기록 저장
      const coffeeRecord = {
        coffee_name: record.coffeeName,
        roaster: record.roaster,
        rating: Math.round(finalScore / 20), // 5점 척도 변환
        notes: `${record.cuppingNotes}\n\nSCA 점수: ${finalScore.toFixed(1)}/100 (${grade})`,
        image_url: imageUrl,
        tasting_mode: 'pro',
        // 프로 모드 전용 데이터
        pro_data: {
          bean_details: {
            farm: record.farm,
            variety: record.variety,
            processing: record.processing,
            altitude: record.altitude,
            harvest_date: record.harvestDate,
          },
          roasting_data: {
            roast_date: record.roastDate,
            roast_level: record.roastLevel,
            development_time: record.developmentTime,
            first_crack_temp: record.firstCrackTemp,
          },
          brewing_parameters: {
            method: record.brewingMethod,
            dose_in: record.doseIn,
            yield_out: record.yieldOut,
            extraction_time: record.extractionTime,
            water_temp: record.waterTemp,
            grind_setting: record.grindSetting,
          },
          sca_scores: {
            fragrance: record.fragrance,
            flavor: record.flavor,
            aftertaste: record.aftertaste,
            acidity: record.acidity,
            body: record.body,
            balance: record.balance,
            uniformity: record.uniformity,
            clean_cup: record.cleanCup,
            sweetness: record.sweetness,
            total: scaTotal,
            final_score: finalScore,
            grade: grade,
          },
          scientific_data: {
            tds: record.tds,
            extraction_yield: record.extractionYield,
            water_analysis: record.waterAnalysis,
            refractometer: record.refractometerReading,
          },
          professional_notes: {
            cupping_notes: record.cuppingNotes,
            flavor_wheel: record.flavorWheel,
            defects: record.defects,
            recommendations: record.recommendations,
            report_notes: record.reportNotes,
            certification: record.certification,
          },
        },
        created_at: new Date().toISOString(),
      }

      await supabaseService.saveCoffeeRecord(coffeeRecord)

      // 결과 페이지로 이동
      router.push('/result')
    } catch (error) {
      console.error('Error saving record:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // 원두 정보
        return record.coffeeName.trim() !== ''
      case 2: // 로스팅 정보
        return record.roaster.trim() !== '' && record.roastDate.trim() !== ''
      case 3: // 추출 파라미터
        return record.doseIn > 0 && record.yieldOut > 0
      case 4: // SCA 평가
        return record.fragrance > 0 && record.flavor > 0 && record.aftertaste > 0
      case 5: // 과학적 데이터
        return record.tds > 0 || record.extractionYield > 0
      case 6: // 전문가 노트
        return record.cuppingNotes.trim() !== ''
      case 7: // 데이터 분석
        return true // 자동 계산
      case 8: // 리포트
        return true // 선택사항
      default:
        return false
    }
  }

  const stepTitles = [
    '원두 상세정보',
    '로스팅 데이터', 
    '추출 파라미터',
    'SCA 커핑 평가',
    '과학적 측정',
    '전문가 노트',
    '점수 분석',
    '전문가 리포트'
  ]

  // SCA 총점 계산
  const calculateSCATotal = () => {
    return record.fragrance + record.flavor + record.aftertaste + 
           record.acidity + record.body + record.balance + 
           record.uniformity + record.cleanCup + record.sweetness
  }

  // 100점 환산 점수
  const getFinalScore = () => {
    const scaTotal = calculateSCATotal()
    return (scaTotal / 90) * 100
  }

  // 등급 계산
  const getGrade = () => {
    const score = getFinalScore()
    if (score >= 90) return 'Outstanding'
    if (score >= 85) return 'Excellent'  
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    return 'Commercial'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* 헤더 */}
          <div className="flex items-center mb-6">
            <Link href="/mode-selection" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-purple-600 hover:text-purple-800" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-purple-800 flex items-center">
                🔬 {UI_LABELS.modes?.pro || '프로 모드'}
              </h1>
              <p className="text-purple-600">SCA 표준 기반 전문가급 분석</p>
            </div>
          </div>

          {/* 진행 단계 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-600">단계 {currentStep}/8</span>
              <span className="text-sm text-purple-600">{stepTitles[currentStep - 1]}</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* 단계별 컨텐츠 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Coffee className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">원두 상세 정보</h2>
                  <p className="text-gray-600">원두의 세부 정보를 입력하세요</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      커피명 *
                    </label>
                    <input
                      type="text"
                      value={record.coffeeName}
                      onChange={(e) => setRecord({ ...record, coffeeName: e.target.value })}
                      placeholder="예: 에티오피아 예가체프 G1"
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        농장/지역
                      </label>
                      <input
                        type="text"
                        value={record.farm}
                        onChange={(e) => setRecord({ ...record, farm: e.target.value })}
                        placeholder="예: Konga Cooperative"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        품종
                      </label>
                      <input
                        type="text"
                        value={record.variety}
                        onChange={(e) => setRecord({ ...record, variety: e.target.value })}
                        placeholder="예: Heirloom Varieties"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가공 방식
                      </label>
                      <select
                        value={record.processing}
                        onChange={(e) => setRecord({ ...record, processing: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      >
                        <option value="">선택하세요</option>
                        <option value="washed">워시드 (Washed)</option>
                        <option value="natural">내추럴 (Natural)</option>
                        <option value="honey">허니 (Honey)</option>
                        <option value="pulped_natural">펄프드 내추럴</option>
                        <option value="anaerobic">아나에로빅</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        해발고도
                      </label>
                      <input
                        type="text"
                        value={record.altitude}
                        onChange={(e) => setRecord({ ...record, altitude: e.target.value })}
                        placeholder="예: 1,800-2,000m"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수확 시기
                    </label>
                    <input
                      type="text"
                      value={record.harvestDate}
                      onChange={(e) => setRecord({ ...record, harvestDate: e.target.value })}
                      placeholder="예: 2024년 10월"
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <ThermometerSun className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">로스팅 데이터</h2>
                  <p className="text-gray-600">로스팅 정보를 입력하세요</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      로스터리 *
                    </label>
                    <input
                      type="text"
                      value={record.roaster}
                      onChange={(e) => setRecord({ ...record, roaster: e.target.value })}
                      placeholder="예: Blue Bottle Coffee"
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        로스팅 날짜 *
                      </label>
                      <input
                        type="date"
                        value={record.roastDate}
                        onChange={(e) => setRecord({ ...record, roastDate: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        로스팅 레벨
                      </label>
                      <select
                        value={record.roastLevel}
                        onChange={(e) => setRecord({ ...record, roastLevel: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      >
                        <option value="">선택하세요</option>
                        <option value="light">라이트 로스트</option>
                        <option value="medium_light">미디엄 라이트</option>
                        <option value="medium">미디엄</option>
                        <option value="medium_dark">미디엄 다크</option>
                        <option value="dark">다크 로스트</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        개발 시간
                      </label>
                      <input
                        type="text"
                        value={record.developmentTime}
                        onChange={(e) => setRecord({ ...record, developmentTime: e.target.value })}
                        placeholder="예: 2분 30초"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1차 크랙 온도
                      </label>
                      <input
                        type="text"
                        value={record.firstCrackTemp}
                        onChange={(e) => setRecord({ ...record, firstCrackTemp: e.target.value })}
                        placeholder="예: 196°C"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Scale className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">추출 파라미터</h2>
                  <p className="text-gray-600">정밀한 추출 데이터를 입력하세요</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추출 방식
                    </label>
                    <select
                      value={record.brewingMethod}
                      onChange={(e) => setRecord({ ...record, brewingMethod: e.target.value })}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    >
                      <option value="cupping">커핑</option>
                      <option value="espresso">에스프레소</option>
                      <option value="v60">V60</option>
                      <option value="chemex">Chemex</option>
                      <option value="aeropress">AeroPress</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        원두량 (g) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={record.doseIn}
                        onChange={(e) => setRecord({ ...record, doseIn: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        추출량 (ml) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={record.yieldOut}
                        onChange={(e) => setRecord({ ...record, yieldOut: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        추출 시간 (초)
                      </label>
                      <input
                        type="number"
                        value={record.extractionTime}
                        onChange={(e) => setRecord({ ...record, extractionTime: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        물 온도 (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={record.waterTemp}
                        onChange={(e) => setRecord({ ...record, waterTemp: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        분쇄도 설정
                      </label>
                      <input
                        type="text"
                        value={record.grindSetting}
                        onChange={(e) => setRecord({ ...record, grindSetting: e.target.value })}
                        placeholder="예: 3.5 (Comandante)"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 추출 비율 표시 */}
                  {record.doseIn > 0 && record.yieldOut > 0 && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-purple-800 font-medium">
                        추출 비율: 1:{(record.yieldOut / record.doseIn).toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Award className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">SCA 커핑 평가</h2>
                  <p className="text-gray-600">9가지 항목을 10점 만점으로 평가하세요</p>
                </div>

                <div className="space-y-6">
                  {[
                    { key: 'fragrance', label: '향 (Fragrance/Aroma)', description: '건조 향과 젖은 향' },
                    { key: 'flavor', label: '맛 (Flavor)', description: '전체적인 맛의 특성' },
                    { key: 'aftertaste', label: '후미 (Aftertaste)', description: '삼킨 후 남는 맛' },
                    { key: 'acidity', label: '산미 (Acidity)', description: '산의 강도와 품질' },
                    { key: 'body', label: '바디 (Body)', description: '질감과 무게감' },
                    { key: 'balance', label: '밸런스 (Balance)', description: '전체적인 조화' },
                    { key: 'uniformity', label: '균일성 (Uniformity)', description: '컵 간 일관성' },
                    { key: 'cleanCup', label: '클린컵 (Clean Cup)', description: '결점 없는 깨끗함' },
                    { key: 'sweetness', label: '단맛 (Sweetness)', description: '단맛의 품질' },
                  ].map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {item.label} *
                          </label>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {record[item.key as keyof ProRecord]}/10
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button
                            key={score}
                            onClick={() => setRecord({ ...record, [item.key]: score })}
                            className={`
                              w-8 h-8 rounded text-sm font-medium transition-all
                              ${
                                score <= (record[item.key as keyof ProRecord] as number)
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-200 hover:bg-purple-200'
                              }
                            `}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* 현재 총점 표시 */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-purple-800 font-bold text-lg">
                        현재 총점: {calculateSCATotal()}/90
                      </p>
                      <p className="text-purple-600">
                        100점 환산: {getFinalScore().toFixed(1)}점 ({getGrade()})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 나머지 단계들은 간단하게 구현 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Beaker className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">과학적 측정</h2>
                  <p className="text-gray-600">TDS, 수율 등 과학적 데이터</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TDS (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={record.tds}
                        onChange={(e) => setRecord({ ...record, tds: parseFloat(e.target.value) || 0 })}
                        placeholder="예: 1.25"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        추출 수율 (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={record.extractionYield}
                        onChange={(e) => setRecord({ ...record, extractionYield: parseFloat(e.target.value) || 0 })}
                        placeholder="예: 20.5"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      물 분석 정보
                    </label>
                    <textarea
                      value={record.waterAnalysis}
                      onChange={(e) => setRecord({ ...record, waterAnalysis: e.target.value })}
                      placeholder="경도, 알칼리도, pH 등"
                      rows={3}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Star className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">전문가 노트</h2>
                  <p className="text-gray-600">상세한 커핑 노트를 작성하세요</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      커핑 노트 *
                    </label>
                    <textarea
                      value={record.cuppingNotes}
                      onChange={(e) => setRecord({ ...record, cuppingNotes: e.target.value })}
                      placeholder="향미, 특징, 개인적 평가 등을 상세히 기록하세요"
                      rows={6}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      결점 사항
                    </label>
                    <textarea
                      value={record.defects}
                      onChange={(e) => setRecord({ ...record, defects: e.target.value })}
                      placeholder="발견된 결점이나 부정적 특성"
                      rows={3}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Award className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">점수 분석</h2>
                  <p className="text-gray-600">최종 점수 및 등급</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-purple-800">
                        {getFinalScore().toFixed(1)}/100
                      </h3>
                      <p className="text-xl font-semibold text-purple-600">
                        {getGrade()}
                      </p>
                      <p className="text-sm text-purple-700">
                        SCA 총점: {calculateSCATotal()}/90
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      개선 권고사항
                    </label>
                    <textarea
                      value={record.recommendations}
                      onChange={(e) => setRecord({ ...record, recommendations: e.target.value })}
                      placeholder="향후 개선할 수 있는 점들을 기록하세요"
                      rows={4}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Save className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-800">전문가 리포트</h2>
                  <p className="text-gray-600">최종 리포트 완성</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="font-medium text-purple-800 mb-2">평가 요약</h3>
                    <div className="text-sm text-purple-700 space-y-1">
                      <p><strong>커피:</strong> {record.coffeeName}</p>
                      <p><strong>최종 점수:</strong> {getFinalScore().toFixed(1)}/100 ({getGrade()})</p>
                      <p><strong>로스터:</strong> {record.roaster}</p>
                      <p><strong>추출 방식:</strong> {record.brewingMethod}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사진 업로드
                    </label>
                    <div className="max-w-sm mx-auto">
                      <ImageUpload
                        onImageSelect={(file) => setRecord({ ...record, image: file })}
                        previewClassName="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최종 리포트 노트
                    </label>
                    <textarea
                      value={record.reportNotes}
                      onChange={(e) => setRecord({ ...record, reportNotes: e.target.value })}
                      placeholder="전체적인 평가와 결론을 작성하세요"
                      rows={4}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">전문가 인증</h4>
                      <p className="text-sm text-gray-600">이 평가가 공식 인증을 받은 것인지 표시</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={record.certification}
                        onChange={(e) => setRecord({ ...record, certification: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all
                ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                }
              `}
            >
              이전
            </button>

            {currentStep < 8 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all flex items-center
                  ${
                    canProceed()
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all flex items-center
                  ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }
                `}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '완료'}
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}