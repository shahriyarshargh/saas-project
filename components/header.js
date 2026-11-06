function renderHeader() {
  const currentUser = window.Nova?.getCurrentUser?.();
  const isLoggedIn = Boolean(currentUser?.loggedIn);

  return `
    <header class="site-header">
      <div class="container header-container">

        <a class="brand" href="master.html">
          <span class="brand-mark">ن</span>
          <span class="brand-info"> 
            <span class="brand-sub">خدمات هوشمند</span>
          </span>
        </a>

        <nav class="main-nav" id="main-nav">
          <a href="#home">صفحه اصلی</a>
          <a href="#services">خدمات</a>
          <a href="#plans">تعرفه‌ها</a>
          <a href="#about">درباره ما</a>
          <a href="#contact">تماس با ما</a>
        </nav>

        <div class="header-actions">

          <a
            href="downloads/nova-app.apk"
            class="btn btn-ghost download-app-btn"
            download
          > 
            دانلود اپ
          </a>

          ${
            isLoggedIn
              ? `
                <a href="#dashboard.html" data-page="dashboard" class="btn btn-primary">
                  پنل کاربری
                </a>
              `
              : `
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="Nova.openLogin()">ورود</button>
              `
          }
        </div>
      </div>
      
    </header>
  `;
}

window.renderHeader = renderHeader;