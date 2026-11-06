(function () {
"use strict";

  const pageContent = document.getElementById("page-content");
  const headerRoot = document.getElementById("site-header");
  const footerRoot = document.getElementById("site-footer");

  const pages = {
    home: "../views/home.html",
    services: "../views/services.html",
    plans: "../views/plans.html",
    about: "../views/about.html",
    contact: "../views/contact.html",
    dashboard: "../views/dashboard.html"
  };

  function currentPage() {
    const requested = location.hash.replace("#", "").trim();
    return pages[requested] ? requested : "home";
  }

  async function loadPage(name, updateHash = true) {
    const page = pages[name] ? name : "home";
    pageContent.innerHTML = '<div class="nova-loading">در حال بارگذاری...</div>';

    try {
      const response = await fetch(pages[page]);
      if (!response.ok) throw new Error("صفحه بارگذاری نشد");
      pageContent.innerHTML = await response.text();

      if (updateHash) history.replaceState(null, "", "#" + page);
      document.querySelectorAll("[data-page]").forEach(link => {
        const active = link.dataset.page === page;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });

      closeMobileMenu();
      initHomeSlider();
      pageContent.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      pageContent.innerHTML = `
        <section class="nova-section">
          <h1>بارگذاری صفحه انجام نشد</h1>
          <p>لطفاً پروژه را با افزونه Live Server اجرا کنید؛ باز کردن مستقیم فایل‌ها ممکن است مانع بارگذاری صفحات شود.</p>
        </section>`;
      console.error(error);
    }
  }

  function closeMobileMenu() {
    const nav = document.getElementById("nova-nav");
    const toggle = document.querySelector('[data-action="toggle-menu"]');
    if (nav) nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function refreshHeader() {
    if (typeof window.renderHeader === "function") {
      headerRoot.innerHTML = window.renderHeader();
    }
  }

  function initHomeSlider() {
    const slider = document.querySelector("[data-slider]");
    if (!slider) return;

    const track = slider.querySelector(".nova-slider-track");
    const slides = Array.from(slider.querySelectorAll(".nova-slide"));
    const dots = Array.from(slider.querySelectorAll(".nova-slider-dot"));
    const prevBtn = slider.querySelector("[data-slider-prev]");
    const nextBtn = slider.querySelector("[data-slider-next]");

    if (!track || slides.length === 0) return;

    let index = 0;
    let startX = 0;

    function renderSlider() {
      track.style.width = `${slides.length * 100}%`;
      track.style.transform = `translateX(-${index * (100 / slides.length)}%)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function goToSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      renderSlider();
    }

    prevBtn?.addEventListener("click", () => goToSlide(index - 1));
    nextBtn?.addEventListener("click", () => goToSlide(index + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToSlide(Number(dot.dataset.sliderIndex || 0));
      });
    });

    slider.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (event) => {
      const endX = event.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) < 30) return;
      if (diff < 0) goToSlide(index + 1);
      else goToSlide(index - 1);
    }, { passive: true });

    renderSlider();
  }

  window.addEventListener("nova:auth-changed", refreshHeader);

  function showLogin() {
    const username = prompt("نام کاربری را وارد کنید (ورود نمایشی):");
    if (!username || !username.trim()) return;

    if (typeof window.Nova?.setUser === "function") {
      window.Nova.setUser({ username: username.trim(), name: username.trim() });
    } else {
      localStorage.setItem(
        "nova_user",
        JSON.stringify({ username: username.trim(), name: username.trim(), loggedIn: true })
      );
    }

    refreshHeader();
    loadPage("dashboard");
  }

  document.addEventListener("click", function (event) {
    const pageLink = event.target.closest("[data-page]");
    if (pageLink) {
      event.preventDefault();
      loadPage(pageLink.dataset.page);
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    if (action === "toggle-menu") {
      const nav = document.getElementById("nova-nav");
      const isOpen = nav.classList.toggle("open");
      actionElement.setAttribute("aria-expanded", String(isOpen));
    } else if (action === "login") {
      showLogin();
    } else if (action === "dashboard") {
      loadPage("dashboard");
    } else if (action === "logout") {
      if (typeof window.Nova?.logout === "function") {
        window.Nova.logout();
      } else {
        localStorage.removeItem("nova_user");
        refreshHeader();
        loadPage("home");
      }
    }
  });

  window.addEventListener("hashchange", function () {
    loadPage(currentPage(), false);
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.renderHeader === "function") {
      headerRoot.innerHTML = window.renderHeader();
    }
    if (typeof window.renderFooter === "function") {
      footerRoot.innerHTML = window.renderFooter();
    }
    loadPage(currentPage(), false);
    initHomeSlider();
  });

  window.NovaMaster = { loadPage };
})();