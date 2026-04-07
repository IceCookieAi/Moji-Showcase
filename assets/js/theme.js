/**
 * theme.js
 * Переключение между темами violet-pink / pink-gold.
 * Тема сохраняется в localStorage.
 */

const THEMES = ['violet-pink', 'pink-gold'];
const STORAGE_KEY = 'moji-theme';

function getStoredTheme() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function storeTheme(theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function initTheme() {
  const stored = getStoredTheme();
  const theme  = THEMES.includes(stored) ? stored : THEMES[0];
  applyTheme(theme);

  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || THEMES[0];
    const next    = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    applyTheme(next);
    storeTheme(next);
  });
}
