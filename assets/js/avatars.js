/**
 * avatars.js
 * Загружает data/avatars.json и рендерит горизонтальный карусельный список.
 * Экспортирует loadAvatars() для переиспользования в message-constructor.js.
 */

const PLAY_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
const STOP_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;

// Кешируем данные чтобы не делать повторный fetch в конструкторе
let _avatarsCache = null;

async function loadAvatars() {
  if (_avatarsCache) return _avatarsCache;
  const res = await fetch('data/avatars.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  _avatarsCache = data.filter(av => av.category !== 'ai');
  return _avatarsCache;
}

function createAvatarCard(avatar) {
  const hasAudio = avatar.audio && avatar.audio.trim() !== '';

  const badgesHtml = [
    avatar.tier === 'vip'    ? `<span class="badge badge--vip">VIP</span>` : '',
    avatar.category === 'ai' ? `<span class="badge badge--ai">AI</span>`   : '',
  ].filter(Boolean).join('');

  const card = document.createElement('div');
  card.className = 'avatar-card';
  card.dataset.id = avatar.id;

  card.innerHTML = `
    <div class="avatar-card__image-wrap">
      <img
        class="avatar-card__image"
        src="${avatar.image}"
        alt="${avatar.name}"
        loading="lazy"
        onerror="this.src='assets/avatars/placeholder.svg'"
      />
      <div class="avatar-card__play-ring"></div>
    </div>
    <div class="avatar-card__footer">
      <div class="avatar-card__meta">
        <p class="avatar-card__name">${avatar.name}</p>
        ${badgesHtml ? `<div class="avatar-card__badges">${badgesHtml}</div>` : ''}
      </div>
      <button
        class="avatar-card__play"
        aria-label="${hasAudio ? `Прослушать голос ${avatar.name}` : 'Аудио не добавлено'}"
        ${!hasAudio ? 'disabled title="Аудио пока не добавлено"' : ''}
      >${PLAY_ICON}</button>
    </div>
  `;

  if (hasAudio) {
    const btn = card.querySelector('.avatar-card__play');
    btn.addEventListener('click', () => AudioPlayer.play(avatar.audio, btn));
  }

  return card;
}

function initCarouselNav(carousel) {
  const wrap = carousel.closest('.avatars-carousel-wrap');
  if (!wrap) return;

  const prev = wrap.querySelector('.carousel-nav--prev');
  const next = wrap.querySelector('.carousel-nav--next');
  if (!prev || !next) return;

  const SCROLL = 200;
  prev.addEventListener('click', () => carousel.scrollBy({ left: -SCROLL * 3, behavior: 'smooth' }));
  next.addEventListener('click', () => carousel.scrollBy({ left:  SCROLL * 3, behavior: 'smooth' }));
}

async function initAvatars() {
  const carousel = document.getElementById('avatarsCarousel');
  if (!carousel) return;

  try {
    const avatars = await loadAvatars();
    carousel.innerHTML = '';
    avatars.forEach(av => carousel.appendChild(createAvatarCard(av)));
    initCarouselNav(carousel);
  } catch (err) {
    console.error('[Avatars] Ошибка загрузки:', err);
    carousel.innerHTML = `
      <div class="avatars-loading" style="flex-direction:column;gap:8px;width:100%">
        <span style="color:var(--text-muted)">Не удалось загрузить аватаров</span>
        <span style="font-size:0.8rem;color:var(--text-muted)">Добавьте файлы в data/avatars.json</span>
      </div>
    `;
  }
}
