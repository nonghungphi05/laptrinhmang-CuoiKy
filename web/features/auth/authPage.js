const FEATURES = [
    { icon: '💬', title: 'Chat realtime', desc: 'Tin nhắn tức thời, đồng bộ đa thiết bị.' },
    { icon: '🎥', title: 'Gọi video nhóm', desc: 'Tối đa 4 người, chia sẻ màn hình, trò chuyện mượt mà.' },
    { icon: '📦', title: 'Gửi tệp lớn', desc: 'Upload lên đến 20MB, xem trước ảnh và tải xuống một chạm.' },
    { icon: '🛡️', title: 'Bảo mật token', desc: '"Mã hóa mạnh mẽ, phân quyền minh bạch.' },
    { icon: '⚡', title: 'Nhẹ & nhanh', desc: 'Nhẹ nhàng nhưng mạnh mẽ, tốc độ tức thì, trải nghiệm mượt mà.' },
    { icon: '🎨', title: 'Thiết kế mềm mại', desc: 'Đẹp mắt, hiện đại, trải nghiệm thân thiện cho người dùng.' }
  ];
  
  export function renderAuthPage({ mount, http, store, onSuccess }) {
    mount.innerHTML = buildLandingMarkup();
    const elements = collectElements(mount);
    initNavScroll(mount);
    initAuthTabs(elements);
    initPasswordToggle(elements);
    initForm(elements, http, store, onSuccess);
    initMotionAnimations(mount);
  }
  
  function buildLandingMarkup() {
    return `
      <div class="landing">
        ${renderHeader()}
        <main>
          ${renderHeroSection()}
          ${renderFeatureSection()}
          ${renderMetricsSection()}
        </main>
        ${renderFooter()}
      </div>
    `;
  }
  
  function renderHeader() {
    return `
      <header class="landing-header">
        <div class="inner">
          <div class="brand-mark">
            <img src="./assets/logo.png" alt="MessZola Logo" width="40" height="40" loading="lazy" />
            <img src="./assets/logo1.png" alt="MessZola Logo" width="130" height="30" loading="lazy" />
          </div>
          <nav class="landing-nav" aria-label="Primary">
            ${['Sản phẩm', 'Tính năng', 'Pricing'].map((item, idx) => `
              <button type="button" data-nav="${['hero','features','pricing'][idx]}">${item}</button>
            `).join('')}
          </nav>
          <div class="hero-ctas" style="margin:0;gap:0.75rem;">
            <button class="btn-ghost" type="button" data-scroll="auth">Đăng nhập</button>
            <button class="btn-primary" type="button" data-scroll="hero">Dùng miễn phí</button>
          </div>
        </div>
      </header>
    `;
  }
  
  function renderHeroSection() {
    return `
      <section class="landing-hero" id="hero" data-section="hero">
        <div class="hero-grid">
          <div class="hero-text" data-motion="fade-up">
            <h1>MessZola kết nối gần xa, trò chuyện thả ga.</h1>
            <p>Ứng dụng chat cho học tập và làm việc nhóm. Nhắn tin, gọi video, chia sẻ tệp và kết nối bạn bè mọi lúc, mọi nơi.</p>
            <div class="hero-ctas">
              <button class="btn-primary" type="button" data-scroll="auth">Dùng miễn phí</button>
              <button class="btn-secondary" type="button" data-scroll="features">Xem thêm</button>
            </div>
          </div>
          <div class="hero-preview" aria-label="Xem thử MessZola" data-motion="fade-up">
            <div class="preview-window">
              <div style="position:absolute;bottom:1.5rem;left:1.5rem;background:#fff;padding:0.75rem 1rem;border-radius:12px;box-shadow:var(--shadow-soft);display:flex;align-items:center;gap:0.5rem;">
                <div style="width:36px;height:36px;border-radius:12px;background:rgba(109,131,242,.12);display:grid;place-items:center;color:var(--color-primary);font-weight:600;">AI</div>
                <div>
                  <p style="margin:0;font-weight:600;">Mai • đang nhập...</p>
                  <small style="color:var(--color-muted);">“Nhớ bật camera nhé!”</small>
                </div>
              </div>
            </div>
            ${renderAuthCard()}
          </div>
        </div>
      </section>
    `;
  }
  
  function renderAuthCard() {
    return `
      <section class="auth-shell" aria-label="Đăng nhập MessZola" id="auth">
        <div class="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected="true" data-auth-tab="login">Đăng nhập</button>
          <button type="button" role="tab" aria-selected="false" data-auth-tab="register">Đăng ký</button>
        </div>
        <form class="auth-form" id="authForm" novalidate>
          <div class="auth-field">
            <label for="phoneInput">Số điện thoại</label>
            <input id="phoneInput" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="error-phone" aria-invalid="false" />
            <span class="field-error" id="error-phone" aria-live="polite"></span>
          </div>
  
          <div class="auth-field" data-display-name>
            <label for="displayNameInput">Tên hiển thị</label>
            <input id="displayNameInput" name="displayName" type="text"  aria-describedby="error-displayName" aria-invalid="false" />
            <span class="field-error" id="error-displayName" aria-live="polite"></span>
          </div>
  
          <div class="auth-field">
            <label for="passwordInput">Mật khẩu</label>
            <div class="input-wrapper">
              <input id="passwordInput" name="password" type="password" placeholder="••••••••" required minlength="6" aria-describedby="error-password" aria-invalid="false" />
              <button type="button" class="toggle-visibility" data-toggle-password aria-label="Hiển thị mật khẩu">Hiện</button>
            </div>
            <span class="field-error" id="error-password" aria-live="polite"></span>
          </div>
  
          <p class="field-error" id="error-global" aria-live="assertive"></p>
          <button class="auth-submit" type="submit">
            <span>Tiếp tục</span>
          </button>
          <p class="auth-hint">Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Quyền riêng tư.</p>
        </form>
      </section>
    `;
  }
  
  function renderFeatureSection() {
    return `
      <section class="features-section" id="features" data-section="features">
        <div class="section-heading" data-motion="fade-up">
          <p style="color:var(--color-accent);font-weight:600;">Tính năng nổi bật</p>
          <h2>Tất cả thứ bạn cần cho một nền tảng chat hiện đại</h2>
          <p>Trò chuyện nhanh chóng, kết nối ổn định, giao diện tinh tế.</p>
        </div>
        <div class="feature-grid">
          ${FEATURES.map((feature) => `
            <article class="feature-card" data-motion="fade-up">
              <div class="feature-icon" aria-hidden="true">${feature.icon}</div>
              <h3>${feature.title}</h3>
              <p>${feature.desc}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }
  
  function renderMetricsSection() {
    return `
      <section class="metrics" id="pricing" data-section="pricing">
        <div class="metrics-card" data-motion="fade-up">
          <div>
            <p style="margin:0 0 0.5rem;font-size:0.95rem;letter-spacing:0.08em;text-transform:uppercase;">Trust & Adoption</p>
            <h3 style="margin:0;font-size:2rem;">10K+ người sử dụng để giao tiếp và học tập.</h3>
          </div>
          <div class="metric-badge">
            <span>⚡</span>
            <div>
              <strong>OOP · WebRTC · SQL.js</strong>
              <p style="margin:0;">03 ngày triển khai, sẵn sàng mở rộng</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }
  
  function renderFooter() {
    const year = new Date().getFullYear();
    return `
      <footer class="landing-footer">
        <p>MessZola • LiteTalk Stack v1.0 • © ${year}</p>
        <div class="footer-links">
          <a href="#">Điều khoản</a>
          <a href="#">Quyền riêng tư</a>
          <a href="#">Hỗ trợ</a>
        </div>
      </footer>
    `;
  }
  
function collectElements(root) {
  return {
    tabs: root.querySelectorAll('[data-auth-tab]'),
    form: root.querySelector('#authForm'),
    displayField: root.querySelector('[data-display-name]'),
    submitBtn: root.querySelector('.auth-submit'),
    errors: {
      phone: root.querySelector('#error-phone'),
      password: root.querySelector('#error-password'),
      displayName: root.querySelector('#error-displayName'),
      global: root.querySelector('#error-global')
    },
    phoneInput: root.querySelector('#phoneInput'),
    passwordInput: root.querySelector('#passwordInput'),
    displayInput: root.querySelector('#displayNameInput'),
    togglePasswordBtn: root.querySelector('[data-toggle-password]')
  };
}

function initNavScroll(root) {
  const buttons = root.querySelectorAll('[data-scroll]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.scroll));
  });
  const navButtons = root.querySelectorAll('[data-nav]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.nav));
  });
}

function scrollToSection(id) {
  const target = document.querySelector(`[data-section="${id}"]`) || document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}