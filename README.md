# File Date Editor Website

Продуктовый сайт и страница загрузки File Date Editor. Использует Next.js App Router, TypeScript, Tailwind CSS, Framer Motion и Lucide. Серверные компоненты получают сведения о релизах из GitHub. Отдельный сервер и база данных не нужны.

## Локальный запуск

Требуется Node.js 22.13 или новее. Для nvm в проекте есть файл `.nvmrc`.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Без GitHub-настроек загрузки и история версий показывают состояние «Публичные выпуски ещё не подключены». Демонстрация, FAQ, темы и все языки доступны сразу.

Английская версия использует `/`, `/download`, `/changelog`, `/privacy` и `/terms`. Для русской и румынской версий добавляется префикс `/ru` или `/ro`. Тексты и метаданные хранятся в `messages/`. Для английских URL с префиксом `/en` настроено постоянное перенаправление.

## Подключение GitHub Releases

1. Укажите в `.env.local` или в настройках хостинга `GITHUB_REPOSITORY_OWNER` и `GITHUB_REPOSITORY_NAME`. Это должны быть владелец и имя публичного **репозитория приложения**, в котором выходят релизы.
2. Опубликуйте стабильный выпуск в GitHub Releases и прикрепите установщики как release assets. Для публичного macOS-дистрибутива соберите DMG из приложения, подписанного Developer ID и прошедшего нотариализацию. Найденная локальная ad hoc сборка в сайт не включена.
3. Перезапустите локальный сервер или сделайте новый деплой, если изменили переменные окружения. Для новых выпусков в уже подключённом репозитории повторный деплой не требуется.
4. Проверьте `/download` и `/changelog`. Страница загрузок показывает сопоставленные GitHub-файлы, размер, версию, дату и опциональный SHA-256 из поля `digest`. Требования для Windows задаёт издатель.

| Переменная | Назначение |
| --- | --- |
| `GITHUB_TOKEN` | Необязательный серверный токен для более высокого лимита запросов. Достаточно доступа на чтение публичных релизов. Не добавляйте префикс `NEXT_PUBLIC_`. |
| `RELEASE_ASSET_MAPPING` | Необязательный JSON-массив правил, например для новых имён файлов или требований к Windows. |
| `GITHUB_RELEASE_FALLBACK_JSON` | Необязательный JSON-массив последних известных стабильных объектов GitHub API, полученных из того же репозитория. Данные из него помечаются как резервные. |
| `NEXT_PUBLIC_SITE_URL` | Публичный HTTPS-origin сайта. Используется в canonical, hreflang, карточках соцсетей, sitemap и Schema.org. |
| `PRODUCT_CONTACT_EMAIL` | Необязательный публичный адрес для связи в подвале. |

Правила в [config/product.ts](config/product.ts) применяются по порядку. В `pattern` символ `*` означает произвольное число символов. Сайт распознаёт универсальный `File Date Editor.dmg`, DMG с архитектурой в имени, Windows EXE/MSI с архитектурой и Windows ZIP с маркерами ОС и архитектуры. Укажите свои правила для остальных имён. Используйте только подтверждённые требования в `minimum`.

```json
[
  {
    "pattern": "FileDateEditor-*-mac-universal.dmg",
    "platform": "mac",
    "architecture": "universal",
    "format": "dmg",
    "minimum": "macOS 14"
  },
  {
    "pattern": "FileDateEditor-*-windows-arm64-portable.zip",
    "platform": "windows",
    "architecture": "arm64",
    "format": "zip"
  }
]
```

Последний стабильный выпуск поступает из GitHub API `/releases/latest`. История читает все страницы `/releases`, фильтрует черновики и prerelease, затем сортирует по дате публикации. Next.js кеширует ответы и обновляет страницы каждые 15 минут при наличии трафика. При сетевых ошибках и лимитах сайт использует настроенный резерв или показывает сообщение. Разделы Markdown с заголовками Features, Improvements, Bug Fixes отображаются отдельно. HTML, удалённые изображения и ссылки вне HTTPS исключаются.

Источники: [GitHub Releases API](https://docs.github.com/en/rest/releases), [подпись и нотариализация macOS](https://support.apple.com/en-us/102445).

## Реальные скриншоты

Интерактивная демонстрация использует условный файл и выполняется в памяти браузера. Её можно проверить без установки приложения. Чтобы добавить настоящий снимок macOS, положите оптимизированный WebP в `public/screenshots/macos.webp` и соберите сайт заново. Блок появится после «Как это работает». Если соотношение сторон отличается от 1600×1029, обновите размеры в [components/sections/app-preview.tsx](components/sections/app-preview.tsx).

## Проверки

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Для уже установленного Google Chrome используйте `PLAYWRIGHT_CHANNEL=chrome npm test`. Тесты запускают отдельный сервер на порту 3100 и подставляют тестовые ответы GitHub локально. Эти данные не используются сайтом вне тестов.

## Деплой на Vercel

1. Загрузите исходники **сайта** в репозиторий и импортируйте его в Vercel. Выберите пресет Next.js и Node.js 22.x. Стандартная команда сборки — `npm run build`.
2. В Project Settings → Environment Variables задайте публичный HTTPS-адрес в `NEXT_PUBLIC_SITE_URL`, реквизиты публичного репозитория приложения и необходимые необязательные переменные. Для домена Vercel также доступен fallback `VERCEL_PROJECT_PRODUCTION_URL`, если включены системные переменные.
3. Создайте деплой. Проверьте страницы на всех языках, `/robots.txt`, `/sitemap.xml`, карточки соцсетей и ссылки на опубликованные установщики.

Ссылки: [Next.js на Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [переменные окружения Vercel](https://vercel.com/docs/environment-variables).

Для самостоятельного запуска production-сервера используйте `npm run build`, затем `npm start`. Сборке необходим стандартный серверный режим Next.js для обновления данных и генерации Open Graph.
