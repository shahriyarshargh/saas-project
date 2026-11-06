(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form =
      document.getElementById("login-form") ||
      document.querySelector(".login-modal form");

    const forgotLink = document.getElementById("forgot-password");
    if (forgotLink) {
      forgotLink.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }

    if (!form) {
      return;
    }

    // دریافت فیلدهای فرم
    function getField(name, fallbackId) {
      return (
        form.elements.namedItem(name) || document.getElementById(fallbackId)
      );
    }

    const usernameInput = getField("username", "login-username");
    const passwordInput = getField("password", "login-password");
    const tokenInput = getField("token", "login-token");

    // جلوگیری از ارسال معمولی فرم
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!window.Nova) {
        console.error("فایل app.js بارگذاری نشده است.");
        return;
      }

      const username = usernameInput?.value.trim() || "";
      const password = passwordInput?.value || "";
      const token = tokenInput?.value.trim() || "";

      // بررسی فیلدها
      if (!username) {
        Nova.showToast("لطفاً نام کاربری را وارد کنید.", "error");
        usernameInput?.focus();
        return;
      }

      if (!password) {
        Nova.showToast("لطفاً رمز عبور را وارد کنید.", "error");
        passwordInput?.focus();
        return;
      }

      if (!token) {
        Nova.showToast("لطفاً توکن خود را وارد کنید.", "error");
        tokenInput?.focus();
        return;
      }

      // جلوگیری از ثبت اطلاعات حساس در localStorage
      const saved = Nova.setUser({
        username: username,
        name: username,
      });

      if (!saved) {
        Nova.showToast(
          "ذخیره اطلاعات ورود انجام نشد. دوباره تلاش کنید.",
          "error",
        );
        return;
      }

      // پاک کردن رمز و توکن از فرم
      passwordInput.value = "";
      tokenInput.value = "";

      Nova.showToast("ورود با موفقیت انجام شد.", "success");

      // بستن پنجره ورود
      Nova.closeLogin();

      // انتقال به پنل کاربری
      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 600);
    });
  });
})();
