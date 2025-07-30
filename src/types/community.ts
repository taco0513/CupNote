// Community Cupping 기능을 위한 타입 정의

export type SessionStatus = 'preparing' | 'active' | 'completed' | 'archived'
export type SessionType = 'public' | 'private' | 'invite-only'
export type ParticipantStatus = 'joined' | 'tasting' | 'completed' | 'left'

// 커핑 세션 기본 정보
export interface CuppingSession {
  id: string
  hostId: string
  title: string
  description?: string
  coffeeInfo: CoffeeBasicInfo
  status: SessionStatus
  sessionType: SessionType
  maxParticipants?: number
  createdAt: Date
  scheduledAt?: Date
  startedAt?: Date
  endedAt?: Date
  inviteCode?: string // private/invite-only 세션용
}

// 커피 기본 정보 (세션용 간소화 버전)
export interface CoffeeBasicInfo {
  name: string
  roastery?: string
  origin?: string
  roastLevel?: string
  processMethod?: string
  varietals?: string[]
}

// 참여자 정보
export interface Participant {
  id: string
  userId: string
  sessionId: string
  nickname: string
  joinedAt: Date
  status: ParticipantStatus
  isHost: boolean
}

// SCA 커핑 평가 기준
export interface CuppingScores {
  aroma: number // 1-10
  flavor: number // 1-10
  aftertaste: number // 1-10
  acidity: number // 1-10
  body: number // 1-10
  balance: number // 1-10
  overall: number // 1-10
  
  // 선택적 추가 평가 항목
  sweetness?: number
  uniformity?: number
  cleanliness?: number
}

// 개별 평가 기록
export interface CuppingEvaluation {
  id: string
  sessionId: string
  participantId: string
  coffeeId: string
  
  // 커핑 점수
  scores: CuppingScores
  
  // 주관적 평가
  flavorNotes: string[]
  personalNotes: string
  defects?: string[]
  
  submittedAt: Date
  isPublic: boolean
}

// 세션 결과 분석
export interface SessionAnalysis {
  sessionId: string
  participantCount: number
  averageScores: CuppingScores & { total: number }
  scoreDistribution: {
    [K in keyof CuppingScores]: number[]
  }
  consensusNotes: CommonFlavorNote[] // 공통적으로 언급된 향미
  diversityIndex: number // 평가 다양성 지수 (0-1)
  topParticipants: string[] // 평가 완료한 참여자들
  agreement: {
    level: number // 0-1, 높을수록 참여자간 합의도 높음
    confidence: 'low' | 'medium' | 'high'
  }
}

// 공통 향미 노트
export interface CommonFlavorNote {
  flavor: string
  mentions: number
  percentage: number // 전체 참여자 중 언급 비율
}

// 커핑 기준 메타데이터
export interface CuppingCriteria {
  key: keyof CuppingScores
  weight: number
  description: string
  scale: string
  tips?: string[]
}

// 세션 생성 폼 데이터
export interface CreateSessionData {
  title: string
  description?: string
  coffeeInfo: CoffeeBasicInfo
  sessionType: SessionType
  maxParticipants?: number
  scheduledAt?: Date
  timeLimit?: number // 평가 시간 제한 (분)
  allowChat: boolean
  anonymousMode: boolean
}

// 실시간 이벤트 타입
export type RealtimeEventType = 
  | 'participant-joined'
  | 'participant-left'
  | 'session-started'
  | 'evaluation-submitted'
  | 'session-completed'
  | 'chat-message'

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType
  sessionId: string
  data: T
  timestamp: Date
}

// 채팅 메시지 (선택적 기능)
export interface ChatMessage {
  id: string
  sessionId: string
  participantId: string
  message: string
  timestamp: Date
  isSystem: boolean
}

// 세션 필터 옵션
export interface SessionFilterOptions {
  status?: SessionStatus[]
  sessionType?: SessionType[]
  hasSlots?: boolean // 참여 가능한 자리가 있는지
  coffeeOrigin?: string
  sortBy?: 'created' | 'participants' | 'scheduled'
  sortOrder?: 'asc' | 'desc'
}

// 커핑 평가 폼 상태
export interface EvaluationFormState {
  scores: Partial<CuppingScores>
  flavorNotes: string[]
  personalNotes: string
  defects: string[]
  isComplete: boolean
  lastSaved?: Date
}

// 결과 차트 데이터
export interface ChartData {
  radar: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
    }[]
  }
  histogram: {
    [K in keyof CuppingScores]: {
      bins: number[]
      counts: number[]
    }
  }
}

// 세션 통계
export interface SessionStats {
  totalSessions: number
  activeSessions: number
  totalParticipants: number
  averageParticipantsPerSession: number
  completionRate: number // 참여 후 평가 완료 비율
  popularOrigins: string[]
  averageSessionDuration: number // 분 단위
}

// 로컬 스토리지 구조
export interface CommunityLocalStorage {
  sessions: CuppingSession[]
  myEvaluations: CuppingEvaluation[]
  participantHistory: Participant[]
  sharedResults: SessionAnalysis[]
  userProfile: {
    nickname: string
    preferredUnits: 'metric' | 'imperial'
    showRealName: boolean
  }
}