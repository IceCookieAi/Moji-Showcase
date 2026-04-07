# Moji Showcase

Сайт-витрина для зрителей стримов с Moji. Показывает аватаров, их голоса и объясняет что зрители могут делать.

**Деплой:** GitHub Pages - автоматически при пуше в `main`.

---

## Добавление аватара

1. Положи PNG-картинку в `assets/avatars/имя.png`
2. Положи WAV/MP3 превью в `assets/audio/имя.wav`
3. Добавь запись в `data/avatars.json`:

```json
{
  "id": "уникальный-id",
  "name": "Имя аватара",
  "tier": "normal",
  "category": "actor",
  "description": "Краткое описание",
  "image": "assets/avatars/имя.png",
  "audio": "assets/audio/имя.wav",
  "tags": ["тег1", "тег2"]
}
```

**Поля:**

- `tier`: `"normal"` или `"vip"` - VIP показывает золотой badge
- `category`: `"actor"` (обычный) или `"ai"` (AI-аватар, голубой badge)
- `audio`: если файла нет - кнопка Play будет неактивна

---

## Добавление TTS-примера

Добавь запись в `data/tts-examples.json`:

```json
{
  "id": "my-example",
  "label": "Название примера",
  "text": "[тег] Текст сообщения",
  "tags": ["тег"],
  "audio": "assets/audio/examples/my-example.wav"
}
```

Теги вида `[тег]` автоматически подсвечиваются в тексте.
Если `audio: null` - кнопка Play неактивна.

---

## Смена темы

В `assets/css/tokens.css` добавь новый блок:

```css
[data-theme="my-theme"] {
  --accent-1: #ваш-цвет;
  --accent-2: #ваш-цвет-2;
  --glow: rgba(r, g, b, 0.25);
  --glow-strong: rgba(r, g, b, 0.45);
}
```

В `assets/js/theme.js` добавь `"my-theme"` в массив `THEMES`.

---

## Локальный запуск

```bash
npx serve .
# или
python -m http.server 8080
```

Открой `http://localhost:8080`
