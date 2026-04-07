/**
 * audio-player.js
 * Глобальный синглтон аудиоплеера.
 * Гарантирует что одновременно играет только один трек.
 */

const AudioPlayer = (() => {
  let currentAudio = null;
  let currentBtn = null;

  const ICON_PLAY = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  const ICON_STOP = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (currentBtn) {
      _setButtonState(currentBtn, false);
      currentBtn = null;
    }
  }

  function _setButtonState(btn, playing) {
    if (!btn) return;

    // Avatar card play button
    if (btn.classList.contains("avatar-card__play")) {
      const card = btn.closest(".avatar-card");
      if (card) card.classList.toggle("is-playing", playing);
      btn.innerHTML = playing ? ICON_STOP : ICON_PLAY;
      btn.setAttribute(
        "aria-label",
        playing ? "Остановить" : "Прослушать голос",
      );
    }

    // TTS card play button
    if (btn.classList.contains("tts-card__play")) {
      btn.classList.toggle("is-playing", playing);
      const label = btn.querySelector(".play-label");
      if (label) label.textContent = playing ? "Стоп" : "Слушать";
      const icon = btn.querySelector("svg");
      if (icon) icon.outerHTML = playing ? ICON_STOP : ICON_PLAY;
    }
  }

  /**
   * Воспроизвести аудио по src.
   * @param {string} src - путь к аудио файлу
   * @param {HTMLElement} btn - кнопка-триггер для обновления состояния
   */
  function play(src, btn) {
    // Если нажали на уже играющий - стоп
    if (currentBtn === btn) {
      stopCurrent();
      return;
    }

    stopCurrent();

    const audio = new Audio(src);
    currentAudio = audio;
    currentBtn = btn;

    _setButtonState(btn, true);

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        _setButtonState(btn, false);
        currentAudio = null;
        currentBtn = null;
      }
    });

    audio.addEventListener("error", () => {
      console.warn("[AudioPlayer] Не удалось загрузить:", src);
      if (currentAudio === audio) {
        _setButtonState(btn, false);
        currentAudio = null;
        currentBtn = null;
      }
    });

    audio.play().catch(() => {
      // autoplay policy - браузер заблокировал без взаимодействия
      _setButtonState(btn, false);
      currentAudio = null;
      currentBtn = null;
    });
  }

  return { play, stop: stopCurrent };
})();
