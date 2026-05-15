# Инструкция по деплою NetNext

Полное руководство для разработчика по развёртыванию проекта на VPS.

---

## Содержание

1. [Требования к серверу](#1-требования-к-серверу)
2. [Подготовка сервера](#2-подготовка-сервера)
3. [Установка зависимостей](#3-установка-зависимостей)
4. [Настройка PostgreSQL](#4-настройка-postgresql)
5. [Настройка Redis](#5-настройка-redis)
6. [Клонирование проекта](#6-клонирование-проекта)
7. [Переменные окружения](#7-переменные-окружения)
8. [Инициализация базы данных](#8-инициализация-базы-данных)
9. [Сборка и запуск](#9-сборка-и-запуск)
10. [Настройка Nginx](#10-настройка-nginx)
11. [SSL сертификат](#11-ssl-сертификат)
12. [PM2 и автозапуск](#12-pm2-и-автозапуск)
13. [Telegram Bot](#13-telegram-bot)
14. [Email Mailing System](#14-email-mailing-system)
15. [Admin Panel](#15-admin-panel)
16. [CI/CD настройка](#16-cicd-настройка)
17. [Проверка работоспособности](#17-проверка-работоспособности)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Требования к серверу

| Параметр | Минимум | Рекомендуется |
|----------|---------|---------------|
| OS | Ubuntu 22.04 | Ubuntu 24.04 LTS |
| RAM | 2 GB | 4 GB |
| CPU | 2 cores | 4 cores |
| Disk | 20 GB SSD | 40 GB SSD |
| Node.js | 20.x | 20.x LTS |
| Python | 3.10+ | 3.11+ |

**Важно:** Playwright требует минимум 2GB RAM для стабильной работы headless Chrome.

---

## 2. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка базовых утилит
sudo apt install -y curl wget git nano htop ufw python3 python3-pip python3-venv

# Настройка firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Создание пользователя для деплоя (опционально)
sudo adduser deploy
sudo usermod -aG sudo deploy
```

---

## 3. Установка зависимостей

### Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node -v  # должно быть v20.x.x
npm -v
```

### pnpm

```bash
npm install -g pnpm

# Проверка
pnpm -v
```

### PostgreSQL 16

```bash
sudo apt install -y postgresql postgresql-contrib

# Проверка
sudo systemctl status postgresql
psql --version
```

### Redis

```bash
sudo apt install -y redis-server

# Включение автозапуска
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Проверка
redis-cli ping  # должно вернуть PONG
```

### Зависимости Playwright

```bash
sudo apt install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  libxshmfence1 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libatk1.0-0 \
  libcups2
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## 4. Настройка PostgreSQL

```bash
# Вход в PostgreSQL
sudo -u postgres psql

# Создание пользователя и базы
CREATE USER netnext WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE netnext OWNER netnext;
GRANT ALL PRIVILEGES ON DATABASE netnext TO netnext;

# Выход
\q
```

**Замените `STRONG_PASSWORD_HERE` на надёжный пароль!**

Для генерации пароля:
```bash
openssl rand -base64 24
```

---

## 5. Настройка Redis

По умолчанию Redis работает только на localhost, что безопасно. Дополнительная настройка не требуется.

Для проверки:
```bash
redis-cli ping
# Ответ: PONG
```

---

## 6. Клонирование проекта

```bash
# Переход в директорию
cd /var/www

# Клонирование (замените URL на ваш репозиторий)
sudo git clone https://github.com/YOUR_ORG/netnext.git
cd netnext

# Установка владельца (если используете отдельного пользователя)
sudo chown -R deploy:deploy /var/www/netnext

# Установка зависимостей
pnpm install

# Установка Playwright браузера
npx playwright install chromium
```

---

## 7. Переменные окружения

```bash
# Копирование шаблона
cp .env.example .env.local

# Редактирование
nano .env.local
```

### Полный список переменных:

```env
# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://netnext:YOUR_DB_PASSWORD@localhost:5432/netnext

# ========================================
# REDIS
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# SECURITY
# ========================================
# Генерация: openssl rand -hex 32
ENCRYPTION_KEY=your_64_character_hex_key_here

# Пароль для админ-панели (Basic Auth)
ADMIN_PASSWORD=your_secure_admin_password

# ========================================
# TELEGRAM BOT
# ========================================
# Получить у @BotFather в Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
# ID чата для уведомлений (можно узнать через @userinfobot)
TELEGRAM_CHAT_ID=-1001234567890

# ========================================
# EMAIL (SMTP)
# ========================================
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hello@netnext.site
SMTP_PASS=your_smtp_password
SMTP_FROM=hello@netnext.site

# DKIM подпись (опционально, для улучшения доставляемости)
DKIM_DOMAIN=netnext.site
DKIM_SELECTOR=vps
DKIM_PRIVATE_KEY_PATH=/etc/opendkim/keys/vps.private

# ========================================
# SITE
# ========================================
NEXT_PUBLIC_SITE_URL=https://netnext.site
```

---

## 8. Инициализация базы данных

База данных инициализируется автоматически при первом запуске приложения. 
Система миграций отслеживает версию схемы в таблице `schema_migrations`.

Для ручной инициализации:
```bash
pnpm db:init
```

### Текущие таблицы (версия 2):

- `leads` - заявки с сайта
- `analytics_events` - события аналитики
- `variant_feedback` - обратная связь по вариантам
- `niche_cache` - кэш ниш для генератора
- `preview_shares` - шаринг превью
- `chat_sessions` - сессии чата (сайт + Telegram)
- `chat_messages` - сообщения чата
- `mailing_campaigns` - email-кампании
- `mailing_recipients` - получатели рассылок
- `email_templates` - шаблоны писем
- `email_unsubscribes` - отписки (ВАЖНО для anti-spam)

---

## 9. Сборка и запуск

### Сборка

```bash
pnpm build
```

### Тестовый запуск

```bash
pnpm start
```

Откройте http://YOUR_SERVER_IP:3000 для проверки.

---

## 10. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/netnext
```

Содержимое:

```nginx
server {
    listen 80;
    server_name netnext.site www.netnext.site;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для долгих операций (скрапинг)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # Статика
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

Активация:

```bash
sudo ln -s /etc/nginx/sites-available/netnext /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. SSL сертификат

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d netnext.site -d www.netnext.site

# Автообновление (проверка)
sudo certbot renew --dry-run
```

---

## 12. PM2 и автозапуск

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
cd /var/www/netnext
pm2 start ecosystem.config.js

# Сохранение конфигурации
pm2 save

# Настройка автозапуска
pm2 startup
# Выполните команду которую выведет pm2 startup
```

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'netnext',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/netnext',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'netnext-telegram',
      script: 'telegram-bot/bot.py',
      interpreter: 'python3',
      cwd: '/var/www/netnext',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PYTHONUNBUFFERED: '1'
      }
    },
    {
      name: 'netnext-email-worker',
      script: 'node',
      args: '-e "require(\'./lib/mailings/queue\').startWorker()"',
      cwd: '/var/www/netnext',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

### Полезные команды PM2:

```bash
pm2 status          # Статус приложений
pm2 logs netnext    # Логи
pm2 restart all     # Перезапуск всех
pm2 reload all      # Graceful reload
pm2 monit           # Мониторинг в реальном времени
```

---

## 13. Telegram Bot

Telegram бот работает в режиме long polling и обеспечивает:
- Уведомления о новых заявках с сайта
- Relay сообщений между посетителями сайта и оператором
- Двустороннюю связь через AI-чат на сайте

### Настройка

1. Создайте бота через @BotFather
2. Получите токен и добавьте в `.env.local`
3. Узнайте ID чата (отправьте сообщение боту, затем используйте @userinfobot)
4. Добавьте `TELEGRAM_CHAT_ID` в `.env.local`

### Зависимости Python

```bash
cd /var/www/netnext/telegram-bot
python3 -m venv venv
source venv/bin/activate
pip install python-telegram-bot psycopg2-binary python-dotenv
```

### Запуск через PM2

Бот уже настроен в `ecosystem.config.js`. При деплое он запустится автоматически.

---

## 14. Email Mailing System

Система массовых email-рассылок с защитой от спама.

### Особенности

- **Rate limiting**: 50 писем/час для предотвращения блокировки
- **Exponential backoff**: автоматические повторы при ошибках
- **Unsubscribe handling**: обязательная ссылка отписки в каждом письме
- **DKIM signing**: опциональная подпись для улучшения доставляемости
- **Queue-based**: асинхронная отправка через BullMQ + Redis

### Anti-Spam рекомендации

1. **Обязательно настройте DKIM** - без него письма часто попадают в спам
2. **Используйте SPF** - добавьте DNS запись для домена
3. **Не превышайте лимиты** - 50 писем/час достаточно для коммерческих предложений
4. **Проверяйте репутацию** - используйте mail-tester.com
5. **Соблюдайте GDPR/закон о рекламе** - только согласившимся получателям

### Настройка DKIM

```bash
# Генерация ключей
sudo mkdir -p /etc/opendkim/keys
sudo opendkim-genkey -b 2048 -d netnext.site -s vps -D /etc/opendkim/keys

# Добавьте DNS TXT запись из файла vps.txt
cat /etc/opendkim/keys/vps.txt
```

### Email Worker

Worker для отправки писем запускается через PM2 отдельным процессом:

```bash
pm2 start netnext-email-worker
pm2 logs netnext-email-worker
```

---

## 15. Admin Panel

Админ-панель доступна по адресу: `https://netnext.site/admin`

### Функции

- **Dashboard**: общая статистика, последние заявки, активные чаты
- **Mailings**: управление email-кампаниями, шаблоны, логи отправки
- **Settings**: настройки SMTP, Telegram, безопасности

### Авторизация

Используется Basic Auth. Пароль задаётся в `ADMIN_PASSWORD`.

```bash
# Генерация надёжного пароля
openssl rand -base64 24
```

---

## 16. CI/CD настройка

### GitHub Secrets

В настройках репозитория (Settings -> Secrets and variables -> Actions) добавьте:

| Secret | Значение |
|--------|----------|
| `VPS_HOST` | IP адрес или домен сервера |
| `VPS_USER` | Пользователь SSH (root или deploy) |
| `VPS_SSH_KEY` | Приватный SSH ключ |

### Генерация SSH ключа для деплоя:

```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# Копирование публичного ключа на сервер
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server

# Приватный ключ (скопировать в GitHub Secret VPS_SSH_KEY)
cat ~/.ssh/github_deploy
```

---

## 17. Проверка работоспособности

### Чеклист:

```bash
# 1. PostgreSQL
psql -U netnext -d netnext -c "SELECT COUNT(*) FROM leads;"

# 2. Redis
redis-cli ping

# 3. Node.js приложение
curl http://localhost:3000

# 4. Nginx
curl http://netnext.site

# 5. SSL
curl https://netnext.site

# 6. Telegram бот
pm2 logs netnext-telegram --lines 10

# 7. Email worker
pm2 logs netnext-email-worker --lines 10

# 8. Админка
curl -u admin:YOUR_PASSWORD https://netnext.site/admin
```

---

## 18. Troubleshooting

### Playwright не работает

```bash
npx playwright install-deps chromium
npx playwright install chromium --force
```

### PostgreSQL connection refused

```bash
sudo systemctl status postgresql
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Redis connection refused

```bash
sudo systemctl status redis-server
```

### Telegram бот не отвечает

```bash
pm2 logs netnext-telegram --lines 50
# Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
```

### Email не отправляются

```bash
pm2 logs netnext-email-worker --lines 50
# Проверьте SMTP настройки
# Проверьте репутацию домена на mail-tester.com
```

### Next.js build fails

```bash
rm -rf .next node_modules/.cache
pnpm install
pnpm build
```

---

## Контакты

При возникновении проблем обращайтесь к техническому руководителю проекта.
