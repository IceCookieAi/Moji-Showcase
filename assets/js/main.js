/**
 * main.js
 * Точка входа - инициализирует все модули после загрузки DOM.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAvatars();
  initMessageConstructor();
  initScrollHeader();
});

function initScrollHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => {
    header.style.boxShadow =
      window.scrollY > 10 ? "0 1px 32px rgba(0,0,0,0.5)" : "none";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}
