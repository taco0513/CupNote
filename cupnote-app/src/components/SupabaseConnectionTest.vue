<template>
  <div class="connection-test">
    <h3>🔌 Supabase 연결 테스트</h3>
    
    <div class="status-card">
      <div class="status-item">
        <span class="label">연결 상태:</span>
        <span :class="['status', connectionStatus.type]">
          {{ connectionStatus.message }}
        </span>
      </div>
      
      <div class="status-item">
        <span class="label">프로젝트 URL:</span>
        <span class="value">{{ supabaseUrl || '설정되지 않음' }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">인증 상태:</span>
        <span :class="['status', authStatus.type]">
          {{ authStatus.message }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button @click="testConnection" :disabled="testing" class="test-btn">
        {{ testing ? '테스트 중...' : '연결 테스트' }}
      </button>
      
      <button @click="testDatabase" :disabled="testing" class="test-btn">
        {{ testing ? '테스트 중...' : 'DB 테스트' }}
      </button>
    </div>

    <div v-if="testResults.length > 0" class="test-results">
      <h4>테스트 결과:</h4>
      <div v-for="(result, index) in testResults" :key="index" 
           :class="['result-item', result.success ? 'success' : 'error']">
        <span class="test-name">{{ result.test }}</span>
        <span class="result-message">{{ result.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const testing = ref(false)
const testResults = ref([])
const dbConnection = ref(null)
const authSession = ref(null)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

const connectionStatus = computed(() => {
  if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
    return { type: 'success', message: '설정됨' }
  }
  return { type: 'error', message: '환경변수 미설정' }
})

const authStatus = computed(() => {
  if (authSession.value) {
    return { type: 'success', message: '로그인됨' }
  }
  return { type: 'warning', message: '로그인 필요' }
})

const testConnection = async () => {
  testing.value = true
  testResults.value = []
  
  try {
    // 1. 환경변수 확인
    const envTest = {
      test: '환경변수 확인',
      success: !!(supabaseUrl && supabaseUrl !== 'your_supabase_project_url'),
      message: supabaseUrl ? '✅ 설정됨' : '❌ VITE_SUPABASE_URL 미설정'
    }
    testResults.value.push(envTest)

    // 2. Supabase 클라이언트 초기화 확인
    const clientTest = {
      test: 'Supabase 클라이언트',
      success: !!supabase,
      message: supabase ? '✅ 초기화됨' : '❌ 초기화 실패'
    }
    testResults.value.push(clientTest)

    // 3. 인증 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const sessionTest = {
      test: '인증 세션',
      success: !sessionError,
      message: sessionError ? `❌ ${sessionError.message}` : session ? '✅ 세션 활성' : '⚠️ 로그인 필요'
    }
    testResults.value.push(sessionTest)
    authSession.value = session

  } catch (error) {
    testResults.value.push({
      test: '연결 테스트',
      success: false,
      message: `❌ ${error.message}`
    })
  } finally {
    testing.value = false
  }
}

const testDatabase = async () => {
  testing.value = true
  
  try {
    // 마스터 데이터 조회 테스트
    const { data: flavors, error: flavorError } = await supabase
      .from('flavor_categories')
      .select('*')
      .limit(5)
    
    const flavorTest = {
      test: '향미 데이터 조회',
      success: !flavorError && flavors?.length > 0,
      message: flavorError ? `❌ ${flavorError.message}` : `✅ ${flavors?.length || 0}개 조회됨`
    }
    testResults.value.push(flavorTest)

    const { data: sensory, error: sensoryError } = await supabase
      .from('sensory_expressions')
      .select('*')
      .limit(5)
    
    const sensoryTest = {
      test: '감각 표현 데이터 조회',
      success: !sensoryError && sensory?.length > 0,
      message: sensoryError ? `❌ ${sensoryError.message}` : `✅ ${sensory?.length || 0}개 조회됨`
    }
    testResults.value.push(sensoryTest)

  } catch (error) {
    testResults.value.push({
      test: 'DB 연결 테스트',
      success: false,
      message: `❌ ${error.message}`
    })
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  testConnection()
})
</script>

<style scoped>
.connection-test {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
}

.status-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  font-family: monospace;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.status.success {
  color: #28a745;
  font-weight: 600;
}

.status.warning {
  color: #ffc107;
  font-weight: 600;
}

.status.error {
  color: #dc3545;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.test-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.test-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.test-btn:hover:not(:disabled) {
  background: #0056b3;
}

.test-results {
  margin-top: 1.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

.result-item.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.result-item.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.test-name {
  font-weight: 600;
}

.result-message {
  font-family: monospace;
  font-size: 0.9em;
}
</style>