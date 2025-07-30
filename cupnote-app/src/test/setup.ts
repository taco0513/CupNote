import { vi, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// Vue Test Utils 설정
config.global.stubs = {
  // 전역 스텁 설정
}

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as Storage

// sessionStorage 모킹
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.sessionStorage = sessionStorageMock as Storage

// fetch 모킹
global.fetch = vi.fn()

// IntersectionObserver 모킹
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// window.matchMedia 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// URL.createObjectURL 모킹
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Supabase 클라이언트 모킹을 위한 설정
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        session: vi.fn(),
        user: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      })),
    })),
  }
})

// 테스트 환경 설정
beforeEach(() => {
  // 각 테스트 전에 실행할 설정
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  // 각 테스트 후에 정리
  vi.restoreAllMocks()
})
