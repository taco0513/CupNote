<template>
  <div class="welcome-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">☕ 환영합니다!</h1>
        <p class="hero-subtitle">나의 커피 감각 저널, <strong>CupNote</strong></p>
        <p class="hero-description">
          전문가 표현을 참고하되 내 언어로 기록하고,<br />
          함께 나누며 감각을 키워보세요.
        </p>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <router-link to="/coffee-setup" class="start-button">
        <span class="start-icon">🚀</span>
        <span class="start-text">커피 기록 시작하기</span>
      </router-link>
    </section>

    <!-- Features Preview -->
    <section class="features-section">
      <h2 class="features-title">CupNote와 함께하면</h2>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">👅</div>
          <h3 class="feature-title">감각 발전</h3>
          <p class="feature-description">
            SCA 향미표 기반으로 체계적인 테이스팅 경험을 쌓아보세요.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">매치 스코어</h3>
          <p class="feature-description">
            로스터 노트와의 일치도를 측정해 감각의 정확도를 확인하세요.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🌱</div>
          <h3 class="feature-title">성장 추적</h3>
          <p class="feature-description">통계와 배지 시스템으로 커피 여정의 발전을 시각화하세요.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3 class="feature-title">함께 성장</h3>
          <p class="feature-description">다른 사용자들의 기록을 참고해 새로운 관점을 발견하세요.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h3 class="cta-title">오늘의 커피는 어떤 맛일까요?</h3>
        <p class="cta-description">첫 번째 테이스팅으로 커피 감각 여정을 시작해보세요.</p>
        <router-link to="/coffee-setup" class="cta-button"> 지금 시작하기 → </router-link>
      </div>
    </section>

    <!-- App Status Info -->
    <section class="status-section">
      <div class="status-badge">
        <span class="status-icon">🚧</span>
        <span class="status-text">MVP 개발 중</span>
      </div>
      <p class="status-description">
        현재 커피 기록과 테이스팅 기능을 개발하고 있습니다.<br />
        더 많은 기능이 곧 추가될 예정입니다!
      </p>
    </section>
  </div>
</template>

<script setup>
// No additional logic needed for this component
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(124, 88, 66, 0.1);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #a0796a;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.3);
  transition: all 0.3s ease;
  transform: translateY(0);
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(124, 88, 66, 0.4);
}

.start-button:active {
  transform: translateY(-1px);
}

.start-icon {
  font-size: 1.4rem;
}

.start-text {
  white-space: nowrap;
}

/* Features Section */
.features-section {
  margin-bottom: 4rem;
}

.features-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(124, 88, 66, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}

.feature-description {
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #f8f4f0 0%, #f0e8dc 100%);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
  border: 1px solid #e8d5c4;
}

.cta-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-button {
  display: inline-block;
  background: #7c5842;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #5d3f2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

/* Status Section */
.status-section {
  text-align: center;
  padding: 2rem;
  background: #fff8f0;
  border-radius: 12px;
  border: 1px solid #f0e8dc;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffe4b5;
  color: #d2691e;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.status-icon {
  font-size: 1rem;
}

.status-description {
  color: #a0796a;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-container {
    padding: 1rem 0.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .start-button {
    padding: 0.875rem 1.5rem;
    font-size: 1.1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .cta-section {
    padding: 2rem 1.5rem;
  }

  .cta-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .start-button {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }

  .features-title {
    font-size: 1.6rem;
  }

  .cta-title {
    font-size: 1.3rem;
  }

  .cta-description {
    font-size: 1rem;
  }
}
</style>
