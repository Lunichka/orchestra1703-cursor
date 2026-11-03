# Сайт Оркестра 1703

Статический сайт: работает на GitHub Pages и на любом обычном хостинге, без внешних CDN.

## Как поменять афишу, новости, контакты

Через админку: **https://orchestra1703.com/admin** (вход по токену GitHub, см. ниже).
Админка сохраняет изменения в файлы `content/*.json`, GitHub Pages обновляет сайт за 1–2 минуты.

| Раздел админки | Файл |
| --- | --- |
| Афиша | `content/concerts.json` |
| Новости | `content/news.json` |
| Галерея | `content/gallery.json` |
| Видео | `content/video.json` |
| Пресса | `content/press.json` |
| Об оркестре | `content/about.json` |
| Контакты | `content/contacts.json` |

- Прошедшие даты сайт скрывает сам.
- Фото из админки сжимаются в WebP (до 1600 px) и попадают в `images/uploads/`.
- Настройки полей админки — `admin/config.yml`.

### Токен для входа в админку

GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
Доступ: Only select repositories → `orchestra1703-cursor`; Permissions → Contents: **Read and write**.
У токена есть срок действия — поставьте напоминание продлить.

### Важно, если правите код руками

Админка коммитит прямо в `main`. Перед своими правками всегда делайте `git pull`, иначе `git push` не пройдёт.

## Как поменять вёрстку

Исходники — в `src/` (`app.jsx` — разметка и логика, `site.css` — стили на Tailwind).
После правок нужно пересобрать `assets/app.js` и `assets/site.css`:

```bash
npm install
npm run build      # один раз
npm run watch      # пересборка на лету при правках
npm run serve      # локальный просмотр на http://localhost:5173
```

## Адреса страниц

`/#/afisha`, `/#/concert/<id>`, `/#/about`, `/#/gallery`, `/#/contacts` — ссылками на них можно делиться.

## Дизайн-система

Общая с квизом «Кто ты из мира музыки?»: зелёный `#143127`, коралловый `#ff5757`, горчичный `#ffba55`, кремовый `#efe3da`, бумага `#fffae7`; контур 4px, жёсткая тень 8px, кнопки «нажимаются» в тень; шрифты Despair Display (заголовки), Steppe (текст), DRUZHOK (акценты).
