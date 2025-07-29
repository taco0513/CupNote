<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-main">CupNote</span>
          <span class="title-sub">커피 테이스팅 노트</span>
        </h1>
        <p class="hero-description">
          당신의 커피 감각을 기록하고<br>
          로스터의 의도와 비교해보세요
        </p>
        <div class="hero-actions">
          <RouterLink to="/coffee-setup" class="btn-primary">
            ☕ 커피 기록 시작하기
          </RouterLink>
          <RouterLink to="/records" class="btn-secondary">
            📚 나의 기록 보기
          </RouterLink>
        </div>
      </div>
      <div class="hero-image">
        <div class="coffee-cup">☕</div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">이런 분들께 추천해요</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3 class="feature-title">정확한 감각 평가</h3>
          <p class="feature-description">
            내가 느낀 향미가 로스터의 의도와<br>
            얼마나 일치하는지 확인해보세요
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3 class="feature-title">성장하는 커피 감각</h3>
          <p class="feature-description">
            꾸준한 기록으로 점점 발전하는<br>
            나의 커피 감각을 확인하세요
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3 class="feature-title">재미있는 도전</h3>
          <p class="feature-description">
            배지와 레벨 시스템으로<br>
            더 즐거운 커피 라이프
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <h2 class="section-title">간단한 사용법</h2>
      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4 class="step-title">커피 정보 입력</h4>
            <p class="step-description">카페명, 커피 이름 등 기본 정보</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4 class="step-title">향미 선택</h4>
            <p class="step-description">느껴지는 향과 맛을 선택</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4 class="step-title">감각 표현</h4>
            <p class="step-description">산미, 단맛 등 감각을 기록</p>
          </div>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4 class="step-title">결과 확인</h4>
            <p class="step-description">매치 스코어와 인사이트 확인</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">지금 시작해보세요!</h2>
        <p class="cta-description">
          첫 번째 커피를 기록하고<br>
          당신의 커피 여정을 시작하세요
        </p>
        <RouterLink to="/coffee-setup" class="btn-primary btn-large">
          🚀 무료로 시작하기
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  min-height: 70vh;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  margin-bottom: 1.5rem;
}

.title-main {
  display: block;
  font-size: 4rem;
  font-weight: 900;
  color: #7C5842;
  letter-spacing: -2px;
  margin-bottom: 0.5rem;
}

.title-sub {
  display: block;
  font-size: 1.5rem;
  font-weight: 400;
  color: #A0796A;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coffee-cup {
  font-size: 15rem;
  animation: float 3s ease-in-out infinite;
}

/* Features Section */
.features-section {
  background: white;
  padding: 4rem 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 16px;
  background: #FFF8F0;
  border: 1px solid #F0E8DC;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  text-align: left;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.9rem;
  color: #666;
}

.step-arrow {
  font-size: 2rem;
  color: #D4B896;
  margin: 0 0.5rem;
}

/* CTA Section */
.cta-section {
  background: #7C5842;
  padding: 4rem 2rem;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.25rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover {
  border-color: #D4B896;
  background: #F8F4F0;
  transform: translateY(-2px);
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .title-main {
    font-size: 3rem;
  }
  
  .title-sub {
    font-size: 1.25rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .coffee-cup {
    font-size: 8rem;
    margin-top: 2rem;
  }
  
  .steps-container {
    flex-direction: column;
  }
  
  .step-arrow {
    transform: rotate(90deg);
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
}
</style>