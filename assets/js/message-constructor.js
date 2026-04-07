/**
 * message-constructor.js
 * Конструктор сообщения для зрителя.
 * Карточки с превью голоса, поиск, формат [Аватар] текст.
 */

const PLAY_ICON_SM = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
const STOP_ICON_SM = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;

async function initMessageConstructor() {
  const textarea = document.getElementById("msgText");
  const grid = document.getElementById("constructorAvatarsGrid");
  const searchInput = document.getElementById("constructorSearch");
  const preview = document.getElementById("previewMessage");
  const hint = document.getElementById("previewHint");
  const copyBtn = document.getElementById("copyBtn");
  const tabPrefix = document.getElementById("tabPrefix");
  const tabNoPrefix = document.getElementById("tabNoPrefix");
  const tabsContainer = document.querySelector(".constructor-preview__tabs");
  const prefixInput = document.getElementById("prefixInput");
  const prefixEdit = document.getElementById("prefixEdit");
  const headerHint = document.getElementById("headerHint");
  const charCount = document.getElementById("charCount");

  // Способы выкупа
  const methodChat = document.getElementById("methodChat");
  const methodPoints = document.getElementById("methodPoints");
  const methodDonate = document.getElementById("methodDonate");
  const methodSub = document.getElementById("methodSub");
  const DEFAULT_TEXT = "Привет, это Moji, добро пожаловать на стрим";

  if (!textarea || !grid || !preview) return;

  let selectedAvatar = null; // null = случайный
  let prefixMode = false;    // Активен ли префикс tts (по умолчанию выкл)
  let currentMethod = "chat"; // chat, points, donate
  let allCards = []; // {el, avatar}

  // ── Создать карточку аватара в гриде ─────────────────────────────────────
  function createMiniCard(avatar) {
    const isRandom = avatar === null;
    const hasAudio = !isRandom && avatar.audio && avatar.audio.trim() !== "";

    const card = document.createElement("div");
    card.className = "mini-avatar-card";
    if (isRandom) card.dataset.random = "1";
    else card.dataset.id = avatar.id;

    card.innerHTML = isRandom
      ? `
        <div class="mini-avatar-card__random-img">🎲</div>
        <div class="mini-avatar-card__footer">
          <span class="mini-avatar-card__name">Случайный</span>
        </div>
      `
      : `
        <img class="mini-avatar-card__img"
             src="${avatar.image}"
             alt="${avatar.name}"
             loading="lazy"
             onerror="this.src='assets/avatars/placeholder.svg'" />
        <div class="mini-avatar-card__footer">
          <span class="mini-avatar-card__name">${avatar.name}</span>
          <button
            class="mini-avatar-card__play"
            aria-label="Прослушать ${avatar.name}"
            ${!hasAudio ? "disabled" : ""}
          >${PLAY_ICON_SM}</button>
        </div>
      `;

    // Клик по карточке - выбор аватара
    card.addEventListener("click", (e) => {
      // Не срабатывает если кликнули по кнопке Play
      if (e.target.closest(".mini-avatar-card__play")) return;
      selectCard(card, isRandom ? null : avatar);
    });

    // Play кнопка
    if (!isRandom && hasAudio) {
      const playBtn = card.querySelector(".mini-avatar-card__play");
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        AudioPlayer.play(avatar.audio, playBtn);
      });
    }

    return card;
  }

  // ── Выбрать карточку ─────────────────────────────────────────────────────
  function selectCard(card, avatar) {
    // Снять предыдущий выбор
    allCards.forEach(({ el }) => el.classList.remove("is-selected"));

    const isSame =
      selectedAvatar === avatar ||
      (selectedAvatar && avatar && selectedAvatar.id === avatar.id);

    if (isSame) {
      // Повторный клик - сброс на случайный
      selectedAvatar = null;
      const randomCard = allCards.find((c) => c.avatar === null);
      if (randomCard) randomCard.el.classList.add("is-selected");
    } else {
      card.classList.add("is-selected");
      selectedAvatar = avatar;
    }
    renderPreview();
  }

  // ── Загрузить аватаров ────────────────────────────────────────────────────
  try {
    const avatars = await loadAvatars();
    grid.innerHTML = "";

    // Первая карточка - «Случайный» (выбрана по умолчанию)
    const randomCard = createMiniCard(null);
    randomCard.classList.add("is-selected");
    grid.appendChild(randomCard);
    allCards.push({ el: randomCard, avatar: null });

    avatars.forEach((av) => {
      const card = createMiniCard(av);
      grid.appendChild(card);
      allCards.push({ el: card, avatar: av });
    });
  } catch (err) {
    console.error("[Constructor] Ошибка загрузки:", err);
    grid.innerHTML = `<span class="constructor-no-results">Не удалось загрузить аватаров</span>`;
  }

  // ── Поиск ─────────────────────────────────────────────────────────────────
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      let visible = 0;
      allCards.forEach(({ el, avatar }) => {
        const name = avatar ? avatar.name.toLowerCase() : "случайный";
        const show =
          !q ||
          name.includes(q) ||
          (avatar === null && "случайный".includes(q));
        el.style.display = show ? "" : "none";
        if (show) visible++;
      });
      // Показать «нет результатов»
      let noRes = grid.querySelector(".constructor-no-results");
      if (visible === 0) {
        if (!noRes) {
          noRes = document.createElement("div");
          noRes.className = "constructor-no-results";
          noRes.textContent = "Аватаров не найдено";
          grid.appendChild(noRes);
        }
      } else if (noRes) {
        noRes.remove();
      }
    });
  }

  // ── Переключение режима превью ────────────────────────────────────────────
  tabPrefix.addEventListener("click", () => {
    prefixMode = true;
    tabPrefix.classList.add("is-active");
    tabNoPrefix.classList.remove("is-active");
    renderPreview();
  });
  tabNoPrefix.addEventListener("click", () => {
    prefixMode = false;
    tabNoPrefix.classList.add("is-active");
    tabPrefix.classList.remove("is-active");
    renderPreview();
  });

  // ── Способы выкупа ────────────────────────────────────────────────────────
  function setMethod(method) {
    currentMethod = method;
    [methodChat, methodPoints, methodDonate, methodSub].forEach((btn) => {
      if (btn) btn.classList.toggle("is-active", btn.dataset.method === method);
    });
    renderPreview();
  }

  methodChat.addEventListener("click", () => setMethod("chat"));
  methodPoints.addEventListener("click", () => setMethod("points"));
  methodDonate.addEventListener("click", () => setMethod("donate"));
  if (methodSub) {
    methodSub.addEventListener("click", () => setMethod("sub"));
  }

  textarea.addEventListener("input", renderPreview);
  if (prefixInput) {
    prefixInput.addEventListener("input", renderPreview);
  }
  renderPreview();

  // ── Копировать ────────────────────────────────────────────────────────────
  copyBtn.addEventListener("click", async () => {
    const text = buildRawMessage();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback для HTTP (без HTTPS clipboard API недоступен)
      const el = Object.assign(document.createElement("textarea"), {
        value: text,
        style: "position:fixed;opacity:0;top:0;left:0",
        readOnly: true,
      });
      document.body.appendChild(el);
      el.focus();
      el.select();
      el.setSelectionRange(0, text.length);
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    copyBtn.classList.add("is-copied");
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>`;
    setTimeout(() => {
      copyBtn.classList.remove("is-copied");
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> <span>Copy</span>`;
    }, 2000);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function buildRawMessage() {
    const text = textarea.value.trim() || DEFAULT_TEXT;
    const avatarPart = selectedAvatar ? `[${selectedAvatar.name}] ` : "";

    // Префикс добавляется ТОЛЬКО если способ выкупа - CHAT и включен режим префикса
    const prefixVisible = currentMethod === "chat" && prefixMode;
    const prefixVal = prefixInput ? prefixInput.value.trim() : "tts";
    const prefixStr = prefixVisible ? `${prefixVal} ` : "";

    return `${prefixStr}${avatarPart}${text}`;
  }

  function renderPreview() {
    const userText = textarea.value.trim();
    const text = userText || DEFAULT_TEXT;
    const isDefault = !userText;

    copyBtn.disabled = false;
    copyBtn.style.opacity = "";

    const avatarPart = selectedAvatar
      ? `<span class="msg-avatar">[${escHtml(selectedAvatar.name)}]</span> `
      : "";

    const textPart = `<span class="msg-text msg-text-highlight${isDefault ? " msg-default" : ""}">${escHtml(text)}</span>`;

    // Логика видимости префикса
    const isChat = currentMethod === "chat";
    const prefixVisible = isChat && prefixMode;
    const prefixVal = prefixInput ? prefixInput.value.trim() : "tts";

    const prefixPart = prefixVisible
      ? `<span class="msg-prefix">${escHtml(prefixVal)} </span>`
      : "";

    // Оновляем содержимое превью
    preview.innerHTML = `${prefixPart}${avatarPart}${textPart}`;

    // Скрываем/показываем табы выбора префикса и инпут префикса (только для чата)
    if (tabsContainer) {
      tabsContainer.classList.toggle("is-hidden", !isChat);
    }
    if (prefixEdit) {
      prefixEdit.classList.toggle("is-hidden", !prefixVisible);
    }
    if (headerHint) {
      headerHint.classList.toggle("is-hidden", !isChat);
    }

    // Скрываем/показываем подсказку !setavatar
    if (hint) {
      hint.classList.toggle("is-hidden", !isChat);
      if (isChat) {
        hint.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <span>Чтобы закрепить аватара навсегда: <code>!setavatar ${selectedAvatar ? escHtml(selectedAvatar.name) : "имя"}</code></span>
        `;
      }
    }

    // Обновляем счетчик символов
    if (charCount) {
      const len = userText.length;
      charCount.textContent = `${len}/500`;
      charCount.classList.toggle("is-warning", len >= 400 && len < 500);
      charCount.classList.toggle("is-error", len >= 500);
    }
  }

  function escHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
