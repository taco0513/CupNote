// CupNote JavaScript - 핵심 인터랙션 로직

// 한국어 감각 표현 데이터
const sensoryExpressions = {
  acidity: ['싱그러운', '발랄한', '톡 쏘는', '상큼한', '과일 같은', '와인 같은', '시트러스 같은'],
  sweetness: ['농밀한', '달콤한', '꿀 같은', '캐러멜 같은', '설탕 같은', '당밀 같은', '메이플 시럽 같은'],
  bitterness: ['스모키한', '카카오 같은', '허브 느낌의', '고소한', '견과류 같은', '다크 초콜릿 같은', '로스티한'],
  body: ['크리미한', '벨벳 같은', '묵직한', '가벼운', '실키한', '오일리한', '물 같은'],
  aftertaste: ['깔끔한', '길게 남는', '산뜻한', '여운이 좋은', '드라이한', '달콤한 여운의', '복합적인'],
  balance: ['조화로운', '부드러운', '자연스러운', '복잡한', '단순한', '안정된', '역동적인']
};

// 앱 상태 관리
const appState = {
  currentScreen: 'mode-selection',
  selectedMode: null,
  selectedFlavors: [],
  selectedExpressions: {
    acidity: [],
    sweetness: [],
    bitterness: [],
    body: [],
    aftertaste: [],
    balance: []
  },
  currentCategory: 'acidity',
  coffeeInfo: {
    cafeName: '',
    coffeeName: '',
    temperature: 'hot',
    origin: '',
    variety: '',
    processing: '',
    roastLevel: ''
  },
  brewSettings: {
    dripper: 'v60',
    coffeeAmount: 20,
    waterAmount: 320,
    ratio: 16
  },
  brewTimer: {
    isRunning: false,
    startTime: null,
    elapsed: 0,
    totalTime: 0,
    laps: []
  },
  labData: {
    brewMethod: 'v60',
    grindSize: 'medium',
    waterTemp: 93,
    totalBrewTime: 240,
    tds: 1.35,
    extractionYield: 20
  },
  sensorySliders: {
    body: 50,
    acidity: 50,
    sweetness: 50,
    finish: 50,
    bitterness: 50,
    balance: 50
  },
  personalNote: '',
  roasterNote: ''
};

// 화면 순서 정의 (모드별)
const cafeScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'flavor-selection': 'coffee-info',
  'sensory-expression': 'flavor-selection',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};

const brewScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'brew-settings': 'coffee-info',
  'flavor-selection': 'brew-settings',
  'sensory-expression': 'flavor-selection',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};

const labScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'brew-settings': 'coffee-info',
  'experimental-data': 'brew-settings',
  'flavor-selection': 'experimental-data',
  'sensory-mouthfeel': 'flavor-selection',
  'sensory-expression': 'sensory-mouthfeel',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};

// 현재 화면 순서 가져오기
function getCurrentScreenFlow() {
  switch(appState.selectedMode) {
    case 'brew':
      return brewScreenFlow;
    case 'lab':
      return labScreenFlow;
    default:
      return cafeScreenFlow;
  }
}

// 진행률 계산
const progressPercentages = {
  'mode-selection': 14,
  'coffee-info': 29,
  'brew-settings': 37,
  'experimental-data': 35,
  'flavor-selection': 43,
  'sensory-mouthfeel': 52,
  'sensory-expression': 57,
  'personal-notes': 71,
  'roaster-notes': 86,
  'result': 100
};

// 화면 전환
function switchScreen(screenId) {
  // 모든 화면 숨기기
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // 타겟 화면 보이기
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    appState.currentScreen = screenId;
  }
}

// 모드 선택
function selectMode(mode) {
  appState.selectedMode = mode;
  switchScreen('coffee-info');
  
  // 온도 선택 이벤트 바인딩
  bindTemperatureButtons();
}

// 온도 버튼 이벤트 바인딩
function bindTemperatureButtons() {
  document.querySelectorAll('.temp-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.temp-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      appState.coffeeInfo.temperature = this.dataset.temp;
    });
  });
}

// 감각 표현 옵션 로드
function loadSensoryOptions(category) {
  const container = document.getElementById('sensory-options');
  const expressions = sensoryExpressions[category];
  
  // 기존 옵션 제거
  container.innerHTML = '';
  
  // 새 옵션 추가
  expressions.forEach(expr => {
    const option = document.createElement('span');
    option.className = 'sensory-option';
    option.textContent = expr;
    
    // 이미 선택된 항목인지 확인
    if (appState.selectedExpressions[category].includes(expr)) {
      option.classList.add('selected');
    }
    
    option.addEventListener('click', () => toggleExpression(category, expr, option));
    container.appendChild(option);
  });
}

// 표현 토글
function toggleExpression(category, expression, element) {
  const selected = appState.selectedExpressions[category];
  const index = selected.indexOf(expression);
  
  if (index > -1) {
    // 선택 해제
    selected.splice(index, 1);
    element.classList.remove('selected');
  } else {
    // 선택 (최대 3개 제한)
    if (selected.length < 3) {
      selected.push(expression);
      element.classList.add('selected');
    } else {
      // 경고 메시지 (간단한 alert로 대체)
      showToast('카테고리당 최대 3개까지 선택할 수 있습니다');
    }
  }
}

// 간단한 토스트 메시지
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 1000;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// 카테고리 탭 이벤트
document.addEventListener('DOMContentLoaded', () => {
  // 탭 버튼 이벤트
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // 활성 탭 변경
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // 해당 카테고리 옵션 로드
      const category = this.dataset.category;
      appState.currentCategory = category;
      loadSensoryOptions(category);
    });
  });
  
  // 초기 옵션 로드
  loadSensoryOptions('acidity');
});

// 뒤로가기
function goBack() {
  const currentFlow = getCurrentScreenFlow();
  const previousScreen = currentFlow[appState.currentScreen];
  if (previousScreen) {
    switchScreen(previousScreen);
  }
}

// Coffee Info에서 다음
function nextFromCoffeeInfo() {
  // 입력값 수집
  appState.coffeeInfo.cafeName = document.getElementById('cafe-name').value;
  appState.coffeeInfo.coffeeName = document.getElementById('coffee-name').value;
  
  // 유효성 검사
  if (!appState.coffeeInfo.cafeName || !appState.coffeeInfo.coffeeName) {
    showToast('카페와 커피 이름을 입력해주세요');
    return;
  }
  
  // 선택 정보 수집
  appState.coffeeInfo.origin = document.getElementById('origin').value;
  appState.coffeeInfo.variety = document.getElementById('variety').value;
  appState.coffeeInfo.processing = document.getElementById('processing').value;
  appState.coffeeInfo.roastLevel = document.getElementById('roast-level').value;
  
  // 모드에 따라 다음 화면 결정
  if (appState.selectedMode === 'brew') {
    switchScreen('brew-settings');
  } else if (appState.selectedMode === 'lab') {
    switchScreen('brew-settings');
  } else {
    switchScreen('flavor-selection');
  }
}

// Flavor Selection 관련 함수
function toggleFlavor(element) {
  const flavor = element.dataset.flavor;
  const index = appState.selectedFlavors.indexOf(flavor);
  
  if (index > -1) {
    // 선택 해제
    appState.selectedFlavors.splice(index, 1);
    element.classList.remove('selected');
  } else {
    // 선택 (최대 5개)
    if (appState.selectedFlavors.length < 5) {
      appState.selectedFlavors.push(flavor);
      element.classList.add('selected');
    } else {
      showToast('최대 5개까지 선택할 수 있습니다');
    }
  }
  
  // 카운트 업데이트
  document.getElementById('flavor-count').textContent = appState.selectedFlavors.length;
}

// Flavor Selection에서 다음
function nextFromFlavorSelection() {
  if (appState.selectedFlavors.length === 0) {
    showToast('최소 1개 이상의 향미를 선택해주세요');
    return;
  }
  
  switchScreen('sensory-expression');
  // 첫 카테고리 로드
  loadSensoryOptions('acidity');
}

// Sensory Expression에서 다음
function nextFromSensoryExpression() {
  const totalSelections = Object.values(appState.selectedExpressions)
    .reduce((sum, arr) => sum + arr.length, 0);
  
  if (totalSelections < 3) {
    showToast('최소 3개 이상의 표현을 선택해주세요');
    return;
  }
  
  switchScreen('personal-notes');
}

// Personal Comment 관련 함수
function addQuickTag(text) {
  const noteField = document.getElementById('personal-note');
  if (noteField.value) {
    noteField.value += ' ';
  }
  noteField.value += text;
  updateCharCount();
}

function updateCharCount() {
  const noteField = document.getElementById('personal-note');
  const count = noteField.value.length;
  document.getElementById('char-count').textContent = count;
}

function nextFromPersonalNotes() {
  appState.personalNote = document.getElementById('personal-note').value;
  
  // Brew Mode인 경우 타이머 정보 추가
  if (appState.selectedMode === 'brew' && appState.brewTimer.totalTime > 0) {
    const brewTime = Math.round(appState.brewTimer.totalTime / 1000);
    let timeInfo = `\n\n[추출 시간: ${formatTime(brewTime)}]`;
    
    // 랩타임이 있는 경우 상세 정보 추가
    if (appState.brewTimer.laps.length > 0) {
      timeInfo += '\n[단계별 시간]';
      appState.brewTimer.laps.forEach(lap => {
        const lapSeconds = Math.floor(lap.lapTime / 1000);
        timeInfo += `\n• ${lap.label}: ${formatTime(lapSeconds)}`;
      });
    }
    
    appState.personalNote += timeInfo;
  }
  
  switchScreen('roaster-notes');
}

function skipPersonalNotes() {
  appState.personalNote = '';
  switchScreen('roaster-notes');
}

// Roaster Notes 관련 함수
function skipRoasterNotes() {
  appState.roasterNote = '';
  submitTasting();
}

// Brew Settings 관련 함수
function adjustCoffeeAmount(delta) {
  const min = 15;
  const max = 30;
  const newAmount = appState.brewSettings.coffeeAmount + delta;
  
  if (newAmount >= min && newAmount <= max) {
    appState.brewSettings.coffeeAmount = newAmount;
    document.getElementById('coffee-amount').textContent = newAmount;
    
    // 물량 자동 계산
    updateWaterAmount();
  }
}

function updateWaterAmount() {
  const { coffeeAmount, ratio } = appState.brewSettings;
  const waterAmount = Math.round(coffeeAmount * ratio);
  
  appState.brewSettings.waterAmount = waterAmount;
  document.getElementById('water-amount').textContent = waterAmount;
  document.getElementById('current-ratio').textContent = `1:${ratio}`;
}

function selectDripper(dripper) {
  // 기존 선택 해제
  document.querySelectorAll('.dripper-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // 새 선택 적용
  const selectedOption = document.querySelector(`[data-dripper="${dripper}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    appState.brewSettings.dripper = dripper;
  }
}

function selectRatio(ratio) {
  // 기존 선택 해제
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // 새 선택 적용
  const selectedBtn = document.querySelector(`[data-ratio="${ratio}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
    appState.brewSettings.ratio = parseFloat(ratio);
    
    // 물량 자동 계산
    updateWaterAmount();
  }
}

function loadPersonalRecipe() {
  // 개인 레시피 불러오기 (LocalStorage에서)
  const savedRecipe = localStorage.getItem('personalRecipe');
  if (savedRecipe) {
    const recipe = JSON.parse(savedRecipe);
    
    // 설정 적용
    appState.brewSettings = { ...recipe };
    
    // UI 업데이트
    document.getElementById('coffee-amount').textContent = recipe.coffeeAmount;
    selectDripper(recipe.dripper);
    selectRatio(recipe.ratio);
    updateWaterAmount();
    
    showToast('개인 레시피를 불러왔습니다');
  } else {
    showToast('저장된 레시피가 없습니다');
  }
}

function savePersonalRecipe() {
  // 현재 설정을 개인 레시피로 저장
  localStorage.setItem('personalRecipe', JSON.stringify(appState.brewSettings));
  showToast('레시피가 저장되었습니다');
}

// 브루잉 타이머 관련 함수
let timerInterval = null;

function startBrewTimer() {
  if (appState.brewTimer.isRunning) return;
  
  appState.brewTimer.isRunning = true;
  appState.brewTimer.startTime = Date.now();
  
  // UI 업데이트
  document.getElementById('timer-btn').textContent = '일시정지';
  document.getElementById('timer-btn').classList.add('pause');
  
  // 타이머 시작
  timerInterval = setInterval(() => {
    appState.brewTimer.elapsed = Date.now() - appState.brewTimer.startTime;
    updateTimerDisplay();
  }, 100);
}

function pauseBrewTimer() {
  if (!appState.brewTimer.isRunning) return;
  
  appState.brewTimer.isRunning = false;
  appState.brewTimer.totalTime += appState.brewTimer.elapsed;
  appState.brewTimer.elapsed = 0;
  
  // UI 업데이트
  document.getElementById('timer-btn').textContent = '계속';
  document.getElementById('timer-btn').classList.remove('pause');
  document.getElementById('timer-btn').classList.add('resume');
  
  clearInterval(timerInterval);
}

function resumeBrewTimer() {
  appState.brewTimer.isRunning = true;
  appState.brewTimer.startTime = Date.now();
  
  // UI 업데이트
  document.getElementById('timer-btn').textContent = '일시정지';
  document.getElementById('timer-btn').classList.remove('resume');
  document.getElementById('timer-btn').classList.add('pause');
  
  // 타이머 재시작
  timerInterval = setInterval(() => {
    appState.brewTimer.elapsed = Date.now() - appState.brewTimer.startTime;
    updateTimerDisplay();
  }, 100);
}

function stopBrewTimer() {
  appState.brewTimer.isRunning = false;
  appState.brewTimer.totalTime += appState.brewTimer.elapsed;
  appState.brewTimer.elapsed = 0;
  
  // UI 업데이트
  document.getElementById('timer-btn').textContent = '시작';
  document.getElementById('timer-btn').classList.remove('pause', 'resume');
  document.getElementById('stop-btn').style.display = 'none';
  
  clearInterval(timerInterval);
  
  // 최종 시간을 실험 노트에 저장
  const finalTime = Math.round(appState.brewTimer.totalTime / 1000);
  showToast(`추출 완료! 총 시간: ${formatTime(finalTime)}`);
}

function resetBrewTimer() {
  appState.brewTimer.isRunning = false;
  appState.brewTimer.startTime = null;
  appState.brewTimer.elapsed = 0;
  appState.brewTimer.totalTime = 0;
  appState.brewTimer.laps = [];
  
  // UI 초기화
  document.getElementById('timer-display').textContent = '00:00';
  document.getElementById('timer-btn').textContent = '시작';
  document.getElementById('timer-btn').classList.remove('pause', 'resume');
  document.getElementById('stop-btn').style.display = 'none';
  document.getElementById('lap-btn').style.display = 'none';
  
  // 랩타임 리스트 초기화
  const lapList = document.getElementById('lap-list');
  if (lapList) {
    lapList.innerHTML = '';
  }
  
  clearInterval(timerInterval);
}

function recordLap() {
  if (!appState.brewTimer.isRunning) return;
  
  const currentTime = appState.brewTimer.totalTime + appState.brewTimer.elapsed;
  const lapNumber = appState.brewTimer.laps.length + 1;
  
  // 랩타임 계산 (이전 랩부터의 시간)
  const previousLapTime = appState.brewTimer.laps.length > 0 
    ? appState.brewTimer.laps[appState.brewTimer.laps.length - 1].totalTime 
    : 0;
  const lapTime = currentTime - previousLapTime;
  
  // 랩 데이터 저장
  const lap = {
    number: lapNumber,
    totalTime: currentTime,
    lapTime: lapTime,
    label: getLapLabel(lapNumber)
  };
  
  appState.brewTimer.laps.push(lap);
  
  // UI에 랩타임 추가
  addLapToDisplay(lap);
  
  // 피드백
  showToast(`${lap.label} 완료 - ${formatTime(Math.floor(lapTime / 1000))}`);
}

function getLapLabel(lapNumber) {
  const labels = [
    '뜸들이기 (Blooming)',
    '1차 추출',
    '2차 추출', 
    '3차 추출',
    '4차 추출',
    '5차 추출'
  ];
  
  return labels[lapNumber - 1] || `${lapNumber}차 추출`;
}

function addLapToDisplay(lap) {
  const lapList = document.getElementById('lap-list');
  if (!lapList) return;
  
  const lapItem = document.createElement('div');
  lapItem.className = 'lap-item';
  lapItem.innerHTML = `
    <div class="lap-info">
      <span class="lap-label">${lap.label}</span>
      <span class="lap-time">${formatTime(Math.floor(lap.lapTime / 1000))}</span>
    </div>
    <div class="lap-total">총 ${formatTime(Math.floor(lap.totalTime / 1000))}</div>
  `;
  
  // 최신 랩을 맨 위에 추가
  lapList.insertBefore(lapItem, lapList.firstChild);
}

function updateTimerDisplay() {
  const totalElapsed = appState.brewTimer.totalTime + appState.brewTimer.elapsed;
  const seconds = Math.floor(totalElapsed / 1000);
  document.getElementById('timer-display').textContent = formatTime(seconds);
  
  // Stop, Lap 버튼 표시
  if (seconds > 0) {
    document.getElementById('stop-btn').style.display = 'inline-block';
    document.getElementById('lap-btn').style.display = 'inline-block';
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  const btn = document.getElementById('timer-btn');
  
  if (!appState.brewTimer.isRunning && appState.brewTimer.totalTime === 0) {
    // 시작
    startBrewTimer();
  } else if (appState.brewTimer.isRunning) {
    // 일시정지
    pauseBrewTimer();
  } else {
    // 재개
    resumeBrewTimer();
  }
}

function nextFromBrewSettings() {
  switchScreen('flavor-selection');
}

// Lab Mode Experimental Data 관련 함수
function adjustLabValue(field, delta) {
  const ranges = {
    waterTemp: { min: 80, max: 100, step: 1 },
    totalBrewTime: { min: 120, max: 600, step: 15 },
    tds: { min: 0.8, max: 2.5, step: 0.01 },
    extractionYield: { min: 15, max: 25, step: 0.1 }
  };
  
  const range = ranges[field];
  if (!range) return;
  
  const currentValue = appState.labData[field];
  let newValue = currentValue + (delta * range.step);
  
  // 범위 제한
  newValue = Math.max(range.min, Math.min(range.max, newValue));
  
  // 소수점 처리
  if (field === 'tds') {
    newValue = Math.round(newValue * 100) / 100;
  } else if (field === 'extractionYield') {
    newValue = Math.round(newValue * 10) / 10;
  } else {
    newValue = Math.round(newValue);
  }
  
  appState.labData[field] = newValue;
  document.getElementById(field).textContent = newValue;
}

function selectBrewMethod(method) {
  // 기존 선택 해제
  document.querySelectorAll('.brew-method-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // 새 선택 적용
  const selectedOption = document.querySelector(`[data-method="${method}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    appState.labData.brewMethod = method;
  }
}

function selectGrindSize(size) {
  // 기존 선택 해제
  document.querySelectorAll('.grind-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // 새 선택 적용
  const selectedOption = document.querySelector(`[data-grind="${size}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    appState.labData.grindSize = size;
  }
}

function nextFromExperimentalData() {
  switchScreen('flavor-selection');
}

// Sensory Mouthfeel 관련 함수
function updateSlider(parameter, value) {
  appState.sensorySliders[parameter] = parseInt(value);
  
  // 슬라이더 값 표시 업데이트
  const valueDisplay = document.getElementById(`${parameter}-value`);
  if (valueDisplay) {
    valueDisplay.textContent = value;
  }
  
  // 색상 업데이트 (중간값 50을 기준으로)
  const slider = document.getElementById(`${parameter}-slider`);
  if (slider) {
    const percentage = (value - 0) / (100 - 0) * 100;
    slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--bg-muted) ${percentage}%, var(--bg-muted) 100%)`;
  }
}

function nextFromSensoryMouthfeel() {
  switchScreen('sensory-expression');
}

// 테이스팅 제출
function submitTasting() {
  // 로스터 노트 수집
  appState.roasterNote = document.getElementById('roaster-note').value;
  
  // 결과 화면으로 이동
  showResult();
}

// 결과 화면 표시
function showResult() {
  switchScreen('result');
  
  // 결과 데이터 표시
  document.getElementById('result-coffee').textContent = appState.coffeeInfo.coffeeName;
  document.getElementById('result-cafe').textContent = appState.coffeeInfo.cafeName;
  
  // 선택한 표현들 표시
  const tagsContainer = document.getElementById('expression-tags');
  tagsContainer.innerHTML = '';
  
  // 향미 표시
  appState.selectedFlavors.forEach(flavor => {
    const tag = document.createElement('span');
    tag.className = 'expression-tag';
    tag.textContent = flavor;
    tagsContainer.appendChild(tag);
  });
  
  // 감각 표현 표시
  Object.entries(appState.selectedExpressions).forEach(([category, expressions]) => {
    expressions.forEach(expr => {
      const tag = document.createElement('span');
      tag.className = 'expression-tag';
      tag.textContent = expr;
      tagsContainer.appendChild(tag);
    });
  });
  
  // Lab Mode인 경우 슬라이더 데이터 표시
  if (appState.selectedMode === 'lab') {
    const sliderResults = document.createElement('div');
    sliderResults.className = 'slider-results';
    sliderResults.innerHTML = '<h4>슬라이더 평가 결과</h4>';
    
    Object.entries(appState.sensorySliders).forEach(([parameter, value]) => {
      const sliderTag = document.createElement('span');
      sliderTag.className = 'slider-tag';
      sliderTag.textContent = `${parameter}: ${value}`;
      sliderResults.appendChild(sliderTag);
    });
    
    tagsContainer.appendChild(sliderResults);
  }
  
  // Match Score 계산 (간단한 버전)
  if (appState.roasterNote) {
    const matchScore = calculateMatchScore();
    document.querySelector('.score-value').textContent = matchScore + '%';
  }
  
  // 첫 기록 achievement 표시 (1초 후)
  setTimeout(() => {
    const achievement = document.getElementById('achievement');
    achievement.classList.add('show');
    
    // 3초 후 숨기기
    setTimeout(() => {
      achievement.classList.remove('show');
    }, 3000);
  }, 1000);
}

// Match Score 계산 (간단한 구현)
function calculateMatchScore() {
  // 로스터 노트와 사용자 선택을 비교
  // 실제로는 더 복잡한 알고리즘 필요
  const roasterWords = appState.roasterNote.toLowerCase().split(/[\s,]+/);
  let matches = 0;
  
  // 향미 매칭
  appState.selectedFlavors.forEach(flavor => {
    if (roasterWords.some(word => flavor.toLowerCase().includes(word) || word.includes(flavor.toLowerCase()))) {
      matches++;
    }
  });
  
  // 기본 점수 + 매칭 보너스
  const baseScore = 70;
  const bonusPerMatch = 10;
  const score = Math.min(baseScore + (matches * bonusPerMatch), 95);
  
  return score;
}

// 앱 리셋
function resetApp() {
  // 상태 초기화
  appState.selectedMode = null;
  appState.selectedFlavors = [];
  appState.selectedExpressions = {
    acidity: [],
    sweetness: [],
    bitterness: [],
    body: [],
    aftertaste: [],
    balance: []
  };
  appState.coffeeInfo = {
    cafeName: '',
    coffeeName: '',
    temperature: 'hot',
    origin: '',
    variety: '',
    processing: '',
    roastLevel: ''
  };
  appState.personalNote = '';
  appState.roasterNote = '';
  
  // 브루잉 타이머 초기화
  appState.brewTimer = {
    isRunning: false,
    startTime: null,
    elapsed: 0,
    totalTime: 0,
    laps: []
  };
  
  // 타이머 인터벌 정리
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Lab Mode 데이터 초기화
  appState.labData = {
    brewMethod: 'v60',
    grindSize: 'medium',
    waterTemp: 93,
    totalBrewTime: 240,
    tds: 1.35,
    extractionYield: 20
  };
  
  appState.sensorySliders = {
    body: 50,
    acidity: 50,
    sweetness: 50,
    finish: 50,
    bitterness: 50,
    balance: 50
  };
  
  // 입력 필드 초기화
  document.getElementById('cafe-name').value = '';
  document.getElementById('coffee-name').value = '';
  document.getElementById('origin').value = '';
  document.getElementById('variety').value = '';
  document.getElementById('processing').value = '';
  document.getElementById('roast-level').value = '';
  document.getElementById('personal-note').value = '';
  document.getElementById('roaster-note').value = '';
  
  // 첫 화면으로
  switchScreen('mode-selection');
}

// 공유 기능 (간단한 구현)
function shareResult() {
  const text = `CupNote에서 ${appState.coffeeInfo.coffeeName} 테이스팅을 완료했어요! 🎯 Match Score: 85%`;
  
  if (navigator.share) {
    navigator.share({
      title: 'CupNote 테이스팅 결과',
      text: text
    }).catch(err => console.log('공유 취소'));
  } else {
    // 클립보드에 복사
    navigator.clipboard.writeText(text).then(() => {
      showToast('결과가 클립보드에 복사되었습니다');
    });
  }
}

// 모바일 뷰포트 높이 조정 (iOS 대응)
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 초기화
window.addEventListener('load', () => {
  setViewportHeight();
  
  // Flavor 옵션에 클릭 이벤트 추가
  document.querySelectorAll('.flavor-option').forEach(option => {
    option.addEventListener('click', function() {
      toggleFlavor(this);
    });
  });
  
  // Personal note 문자 수 카운팅
  const personalNote = document.getElementById('personal-note');
  if (personalNote) {
    personalNote.addEventListener('input', updateCharCount);
  }
  
  // Brew Mode 드리퍼 선택 이벤트
  document.querySelectorAll('.dripper-option').forEach(option => {
    option.addEventListener('click', function() {
      selectDripper(this.dataset.dripper);
    });
  });
  
  // Brew Mode 비율 프리셋 이벤트
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectRatio(this.dataset.ratio);
    });
  });
  
  // Lab Mode 이벤트
  document.querySelectorAll('.brew-method-option').forEach(option => {
    option.addEventListener('click', function() {
      selectBrewMethod(this.dataset.method);
    });
  });
  
  document.querySelectorAll('.grind-option').forEach(option => {
    option.addEventListener('click', function() {
      selectGrindSize(this.dataset.grind);
    });
  });
  
  // Sensory Mouthfeel Slider 이벤트
  document.querySelectorAll('.sensory-mouthfeel-slider').forEach(slider => {
    slider.addEventListener('input', function() {
      updateSlider(this.dataset.parameter, this.value);
    });
  });
});

window.addEventListener('resize', setViewportHeight);

// 모바일 터치 최적화
document.addEventListener('touchstart', () => {}, {passive: true});