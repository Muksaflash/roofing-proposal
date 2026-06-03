# Roofing Proposal GitHub Pages

Готовая статичная страница для коммерческого предложения и клиентского брифа.

## Как опубликовать через GitHub Pages

1. Создай новый репозиторий на GitHub.
2. Загрузи в него эти файлы:
   - `index.html`
   - `commercial-proposal-roofing-ai.md`
   - `client-brief.html`
   - `client-brief.md`
   - `apps-script/brief-intake/Code.gs`
   - `apps-script/brief-intake/README.md`
   - `.nojekyll`
   - `README.md`
3. Открой `Settings` -> `Pages`.
4. В `Build and deployment` выбери `Deploy from a branch`.
5. Выбери ветку `main` и папку `/root`.
6. Нажми `Save`.

Через минуту-две GitHub покажет ссылку на страницу.

## Что редактировать

Текст предложения меняется в `commercial-proposal-roofing-ai.md`.
Страница `index.html` автоматически подгружает этот Markdown-файл.

Короткий клиентский бриф для сбора материалов находится в:

- `client-brief.html` - отдельная страница для ссылки или печати в PDF;
- `client-brief.md` - версия для копирования в письмо или мессенджер.

## Отправка брифа через Google Apps Script

Код backend-обработчика находится в `apps-script/brief-intake/Code.gs`.

Схема:

1. Клиент заполняет `client-brief.html`.
2. Нажимает `Отправить`.
3. Форма отправляет данные в Google Apps Script Web App.
4. Apps Script проверяет passcode.
5. Если passcode верный, заявка уходит на указанный email.

Важно: GitHub Pages не дает настоящую серверную защиту паролем. Passcode на стороне Apps Script защищает именно отправку формы от случайных или спамных заявок. Если нужно полностью закрыть просмотр брифа, лучше размещать форму внутри Apps Script/Google Form с доступом по Google-аккаунту или использовать отдельный сервис с настоящей авторизацией.
