# Karina — портфолио графического дизайнера

Техническая основа: React, TypeScript, Vite и обычный CSS.
Реализован первый экран PORTFOLIO: HTML-заголовок и подпись с эффектами
размытия, шесть прозрачных PNG и адаптация для планшетов и телефонов.
Сразу после Hero подключён первый экран RAT DOT через общий `ProjectIntro`.
Иллюстрация RAT DOT подключена из `public/assets/RatDot/rat-dot-cover.png`.
После него добавлена галерея RAT DOT с девятью локальными изображениями
из `public/assets/RatDot/gallery/`. После RAT DOT подключены описание и
галерея WOLFS с локальной обложкой и семью изображениями галереи.
ABOUT и MASCOT S7 пока не реализованы.

## Требования и запуск

Node.js `^20.19.0 || >=22.12.0` и npm (см. `engines` в `package.json`).

```sh
npm ci
npm run dev
```

Откройте адрес Vite в терминале (обычно http://localhost:5173).

## Проверки и сборка

```sh
npm run typecheck
npm run build
npm run preview
```

`build` проверяет типы и создаёт production-сборку в `dist/`.
`preview` позволяет просмотреть эту сборку локально.
Тестовый раннер пока не настроен; стартовый тест Create React App удалён.

## Структура

- `index.html` — HTML-точка входа Vite.
- `src/main.tsx` — подключение React, локального Inter и глобальных стилей.
- `src/App.tsx` — корневой компонент приложения.
- `src/sections/Hero/` — компонент обложки, CSS и конфигурация всех 13 объектов.
- `src/components/ProjectIntro/` — общий вводный экран проекта.
- `src/components/ProjectGallery/` — общая галерея с вложенными Grid-сетками.
- `src/data/ratDotGallery.ts`, `src/types/gallery.ts` — раскладка RAT DOT и типы галерей.
- `src/data/wolfs.ts`, `src/data/wolfsGallery.ts` — описание и отдельная сетка WOLFS.
- `src/data/ratDot.ts`, `src/types/project.ts` — данные RAT DOT и типы проектов.
- `src/styles/tokens.css` — цвета, типографика и размеры из макета.
- `src/styles/global.css` — базовые стили и настройки прокрутки.
- `public/` — статические файлы.

Inter поставляется через `@fontsource-variable/inter`: Vite включает файлы
шрифта в сборку, внешние шрифтовые сервисы не используются.
Декор находится в `public/assets/hero/`. Семь объектов отключены до получения
корректных прозрачных экспортов. Статусы и координаты описаны в
[docs/hero-assets.md](docs/hero-assets.md).
Размеры, недостающие материалы и допущения RAT DOT описаны в
[docs/project-intro.md](docs/project-intro.md).
Структура галереи и список необходимых экспортов:
[docs/project-gallery.md](docs/project-gallery.md).
Геометрия и список необходимых изображений WOLFS: [docs/wolfs.md](docs/wolfs.md).

Правила разработки находятся в [AGENTS.md](AGENTS.md).
