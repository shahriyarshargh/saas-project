(function () {
  "use strict";

  const USER_KEY = "nova_user";
  const REQUESTS_KEY = "nova_requests";

  // خواندن امن اطلاعات از localStorage
  function readStorage(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`خطا در خواندن ${key}:`, error);
      return fallback;
    }
  }

  // ذخیره امن اطلاعات در localStorage
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`خطا در ذخیره ${key}:`, error);
      return false;
    }
  }

  // ساخت پیام اطلاع‌رسانی
  function showToast(message, type = "info") {
    let toast = document.getElementById("nova-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "nova-toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("show");

    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // اطلاعات کاربر فعلی
  function getCurrentUser() {
    return readStorage(USER_KEY, null);
  }

  // بررسی وضعیت ورود
  function isLoggedIn() {
    const user = getCurrentUser();
    return Boolean(user && user.loggedIn);
  }

  // ذخیره اطلاعات کاربر پس از ورود
  function setUser(user) {
    if (!user || !user.username) {
      return false;
    }

    const userData = {
      username: String(user.username),
      name: String(user.name || user.username),
      loggedIn: true,
      loginAt: new Date().toISOString(),
    };

    const saved = writeStorage(USER_KEY, userData);

    if (saved) {
      // اطلاع به بخش‌های دیگر صفحه
      window.dispatchEvent(
        new CustomEvent("nova:auth-changed", {
          detail: userData,
        }),
      );
    }

    return saved;
  }

  // خروج از حساب کاربری
  function logout() {
    localStorage.removeItem(USER_KEY);

    window.dispatchEvent(
      new CustomEvent("nova:auth-changed", {
        detail: null,
      }),
    );

    showToast("با موفقیت از حساب کاربری خارج شدید.", "success");

    const currentPath = window.location.pathname || "";
    const currentHash = (window.location.hash || "").toLowerCase();
    const isDashboardPage =
      currentPath.endsWith("dashboard.html") ||
      currentHash === "#dashboard" ||
      currentHash === "#/dashboard";

    const redirectUrl = isDashboardPage
      ? "master.html#home"
      : "index.html#login";

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 700);
  }

  // باز کردن پنجره ورود
  function openLogin() {
    const modal = document.querySelector(".modal-backdrop");

    if (!modal) {
      window.location.href = "index.html#login";
      return;
    }

    modal.classList.add("open");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    const usernameInput =
      modal.querySelector('[name="username"]') ||
      modal.querySelector("#login-username");

    if (usernameInput) {
      setTimeout(() => usernameInput.focus(), 150);
    }
  }

  // بستن پنجره ورود
  function closeLogin() {
    const modal = document.querySelector(".modal-backdrop");
    modal.style.display = "none";

    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  // ذخیره درخواست کاربر
  function saveRequest(request) {
    const requests = getRequests();

    const newRequest = {
      id: Date.now(),
      ...request,
      username: getCurrentUser()?.username || null,
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);

    const saved = writeStorage(REQUESTS_KEY, requests);

    if (saved) {
      showToast("درخواست شما با موفقیت ثبت شد.", "success");
    }

    return saved ? newRequest : null;
  }

  // دریافت درخواست‌ها
  function getRequests() {
    const requests = readStorage(REQUESTS_KEY, []);
    return Array.isArray(requests) ? requests : [];
  }

  // کنترل منوی موبایل
  function initMobileMenu() {
    document.addEventListener("click", function (event) {
      const toggle = event.target.closest("#menu-toggle");
      const nav = document.querySelector(".main-nav");

      if (toggle && nav) {
        const isOpen = nav.classList.toggle("show");

        toggle.setAttribute("aria-expanded", String(isOpen));
        return;
      }

      // بستن منو با انتخاب لینک
      const navLink = event.target.closest(".main-nav a");

      if (navLink && nav) {
        nav.classList.remove("show");

        const menuButton = document.getElementById("menu-toggle");
        if (menuButton) {
          menuButton.setAttribute("aria-expanded", "false");
        }
      }
    });

    // بستن منو با کلیک بیرون آن
    document.addEventListener("click", function (event) {
      const nav = document.querySelector(".main-nav");
      const toggle = document.getElementById("menu-toggle");

      if (!nav || !toggle) return;

      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // کنترل بستن پنجره ورود
  function initLoginModal() {
    document.addEventListener("click", function (event) {
      const closeButton = event.target.closest(
        ".modal-close, [data-close-login]",
      );

      if (closeButton) {
        closeLogin();
        return;
      }

      const backdrop = event.target.closest(".modal-backdrop");

      if (backdrop && event.target === backdrop) {
        closeLogin();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeLogin();
      }
    });
  }

  // جلوگیری از ورود به پنل بدون ورود
  function protectDashboard() {
    const currentPath = window.location.pathname || "";
    const currentHash = (window.location.hash || "").toLowerCase();
    const isDashboard =
      currentPath.endsWith("dashboard.html") ||
      currentHash === "#dashboard" ||
      currentHash === "#/dashboard";

    if (isDashboard && !isLoggedIn()) {
      window.location.replace("index.html#login");
    }
  }

  // API عمومی پروژه
  window.Nova = {
    showToast,
    getCurrentUser,
    isLoggedIn,
    setUser,
    logout,
    openLogin,
    closeLogin,
    saveRequest,
    getRequests,
  };

  // راه‌اندازی بخش‌های عمومی
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initLoginModal();
    protectDashboard();

    // باز شدن خودکار پنجره ورود با آدرس #login
    if (window.location.hash === "#login") {
      openLogin();
    }
  });
})();
