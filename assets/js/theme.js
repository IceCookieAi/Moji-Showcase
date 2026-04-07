/**
 * theme.js
 * Переключение между темами: violet-pink → pink-gold → dark-ocean.
 * Тема сохраняется в localStorage.
 * При смене темы кнопка показывает иконку следующей темы.
 */

const THEMES = ['violet-pink', 'pink-gold', 'dark-ocean'];
const STORAGE_KEY = 'moji-theme';

/** Иконки SVG для каждой темы (показываем иконку текущей темы) */
const THEME_ICONS = {
  'violet-pink': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>`,
  'pink-gold': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>`,
  'dark-ocean': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>`,
};

/** Подсказки для tooltip */
const THEME_TITLES = {
  'violet-pink': 'Тема: Violet-Pink - нажми для Pink-Gold',
  'pink-gold': 'Тема: Pink-Gold - нажми для Dark-Ocean',
  'dark-ocean': 'Тема: Dark-Ocean - нажми для Violet-Pink',
};

function getStoredTheme() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function storeTheme(theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { }
}

function applyTheme(theme) {
  // Плавный переход: слегка сжимаем body, меняем тему, возвращаем
  document.documentElement.dataset.theme = theme;
  updateButton(theme);
}

function updateButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.innerHTML = THEME_ICONS[theme] || THEME_ICONS['violet-pink'];
  btn.title = THEME_TITLES[theme] || 'Смени тему';
  btn.setAttribute('aria-label', THEME_TITLES[theme] || 'Смени тему');
}

function initTheme() {
  const stored = getStoredTheme();
  const theme = THEMES.includes(stored) ? stored : THEMES[0];
  applyTheme(theme);

  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || THEMES[0];
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx === -1 ? 0 : idx + 1) % THEMES.length];

    // Мини-анимация: кнопка крутится
    btn.style.transform = 'rotate(180deg) scale(0.85)';
    btn.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
      btn.style.transform = '';
      btn.style.transition = '';
    }, 300);

    applyTheme(next);
    storeTheme(next);
  });
}
