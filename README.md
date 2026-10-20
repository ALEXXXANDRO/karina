# Karina — портфолио графического дизайнера

Техническая основа: React, TypeScript, Vite и обычный CSS.
Реализован первый экран PORTFOLIO: HTML-заголовок и подпись с эффектами
размытия, шесть прозрачных PNG и адаптация для планшетов и телефонов.
Сразу после Hero подключён первый экран RAT DOT через общий `ProjectIntro`.
Иллюстрация RAT DOT подключена из `public/assets/RatDot/rat-dot-cover.png`.
После него добавлена галерея RAT DOT с девятью локальными изображениями
из `public/assets/RatDot/gallery/`. После RAT DOT подключены описание и
галерея WOLFS с локальной обложкой и семью изображениями галереи.
После WOLFS добавлен MASCOT S7: описание с локальной обложкой и галерея
с пятью локальными изображениями. ABOUT пока не реализован.

## Требования и запуск

Node.js `^20.19.0 || >=22.12.0` и npm (см. `engines` в `package.json`).

```sh
npm ci
npm run dev
```

Откройте адрес Vite в терминале (обычно http://localhost:5173/karina/).

## Проверки и сборка

```sh
npm run typecheck
npm run build
npm run preview
```

`build` проверяет типы и создаёт production-сборку в `dist/`.
`preview` позволяет просмотреть эту сборку локально.
Тестовый раннер пока не настроен; стартовый тест Create React App удалён.

## GitHub Pages

Репозиторий: https://github.com/ALEXXXANDRO/karina.
Адрес сайта: https://alexxxandro.github.io/karina/.
В `vite.config.ts` задан `base: '/karina/'`; он также используется локально.
После `npm run build` команда `npm run preview` открывает сборку по адресу
http://localhost:4173/karina/ (или на порту, указанном Vite).

Для первой публикации в репозитории откройте **Settings → Pages** и выберите
**GitHub Actions** в поле **Source**. Отправьте изменения в ветку `main`:
workflow `.github/workflows/deploy.yml` установит зависимости через `npm ci`,
проверит TypeScript, соберёт приложение и опубликует содержимое `dist`.
Проверить результат можно во вкладке **Actions**; workflow также поддерживает
ручной запуск через **Run workflow**. Каталог `dist` коммитить не нужно.

Изображения из `public/assets/` подключаются через `import.meta.env.BASE_URL`,
а локальные шрифты обрабатываются Vite. Пути сохраняют регистр, включая
`assets/RatDot/`. При переименовании репозитория необходимо обновить `base`.

## Структура

- `index.html` — HTML-точка входа Vite.
- `src/main.tsx` — подключение React, локального Inter и глобальных стилей.
- `src/App.tsx` — корневой компонент приложения.
- `src/sections/Hero/` — компонент обложки, CSS и конфигурация всех 13 объектов.
- `src/components/ProjectIntro/` — общий вводный экран проекта.
- `src/components/ProjectGallery/` — общая галерея с вложенными Grid-сетками.
- `src/data/ratDotGallery.ts`, `src/types/gallery.ts` — раскладка RAT DOT и типы галерей.
- `src/data/wolfs.ts`, `src/data/wolfsGallery.ts` — описание и отдельная сетка WOLFS.
- `src/data/mascotS7.ts`, `src/data/mascotS7Gallery.ts` — описание и сетка S7.
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
Геометрия S7, недостающие изображения и временные тексты из макета:
[docs/mascot-s7.md](docs/mascot-s7.md).

Правила разработки находятся в [AGENTS.md](AGENTS.md).
