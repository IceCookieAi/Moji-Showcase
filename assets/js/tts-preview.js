/**
 * tts-preview.js
 * Загружает data/tts-examples.json и рендерит TTS-примеры.
 * Теги вида [тег] подсвечиваются в тексте.
 */

const PLAY_ICON_SMALL = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
const STOP_ICON_SMALL = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;

/**
 * Оборачивает теги [тег] в <span class="tts-tag">
 */
function highlightTags(text) {
  return text.replace(/\[([^\]]+)\]/g, '<span class="tts-tag">[$1]</span>');
}

function createTtsCard(example) {
  const hasAudio = example.audio && example.audio.trim() !== '';
  const card = document.createElement('div');
  card.className = 'tts-card' + (!hasAudio ? ' tts-card--no-audio' : '');

  card.innerHTML = `
    <div class="tts-card__header">
      <span class="tts-card__label">${example.label}</span>
      <button class="tts-card__play" aria-label="${hasAudio ? 'Прослушать пример' : 'Аудио не добавлено'}" ${!hasAudio ? 'disabled' : ''}>
        ${PLAY_ICON_SMALL}
        <span class="play-label">Слушать</span>
      </button>
    </div>
    <p class="tts-card__text">"${highlightTags(example.text)}"</p>
  `;

  if (hasAudio) {
    const btn = card.querySelector('.tts-card__play');
    btn.addEventListener('click', () => {
      AudioPlayer.play(example.audio, btn);
    });
  }

  return card;
}

async function initTtsPreview() {
  const container = document.getElementById('ttsExamples');
  if (!container) return;

  try {
    const res = await fetch('data/tts-examples.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const examples = await res.json();

    container.innerHTML = '';
    examples.forEach(ex => {
      container.appendChild(createTtsCard(ex));
    });
  } catch (err) {
    console.error('[TTS Preview] Ошибка загрузки:', err);
    container.innerHTML = `
      <div class="avatars-loading">
        <span style="color:var(--text-muted)">Не удалось загрузить примеры</span>
      </div>
    `;
  }
}
