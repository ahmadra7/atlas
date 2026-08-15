# سرآشپز هوشمند (Smart Chef)

آشپزی هوشمند مبتنی بر مواد موجود — مونورپوی TypeScript با وب Next.js و موبایل Expo (RTL فارسی).

**ریپو:** [github.com/ahmadra7/atlas](https://github.com/ahmadra7/atlas)

## ساختار

```
apps/web                 Next.js + React + TypeScript (UI اصلی)
apps/api                 NestJS + Prisma + PostgreSQL
apps/mobile              Expo WebView + native voice bridge
packages/contracts       قراردادهای API مشترک
packages/api-client      کلاینت API (mock | http)
packages/design-tokens   توکن‌های طراحی
packages/shared          نرمال‌سازی فارسی و برچسب‌ها
```

معماری کامل: [`docs/architecture.md`](docs/architecture.md)

## پیش‌نیاز

- Node.js ≥ 20
- Docker (برای PostgreSQL محلی)
- برای اندروید محلی: Android SDK / دستگاه یا شبیه‌ساز
- برای APK ابری: حساب Expo + `eas-cli`

## نصب و اجرا

```bash
npm install --legacy-peer-deps
docker compose up -d postgres   # نیاز به Docker Desktop
npm run db:migrate -w @atlas/api
npm run db:seed -w @atlas/api
npm run dev:api        # http://localhost:4000/api
npm run dev:web        # http://localhost:3000  (mode=http)
```

کاربر دمو بعد از seed: `ahmad@atlas.local` / `atlas-demo`

وب با `NEXT_PUBLIC_ATLAS_API_MODE=http` به API وصل می‌شود. برای برگشت موقت به mock همان متغیر را `mock` بگذار.

دیتابیس هدف: **PostgreSQL** (نه SQLite). جزئیات: `docs/architecture.md`.
### تونل (گوشی خارج از Wi‑Fi محلی)

```bash
npm run tunnel:web   # تونل پایدار به :3000 و به‌روزرسانی WEB_APP_URL
# سپس Cloudflare به Metro :8081 + اسکریپت:
# npx cloudflared tunnel --url http://127.0.0.1:8081
# node apps/mobile/scripts/start-expo-tunnel.mjs
```

### بیلد اندروید (EAS)

```bash
npm run build:apk        # APK پیش‌نمایش
npm run build:dev-apk    # development client
```

## مسیر محصول (MVP)

مواد → پیشنهادها → دستور → پخت مرحله‌ای → اتمام

## کیفیت

```bash
npm run lint
npm run typecheck
npm run build
```

وب با `NEXT_PUBLIC_ATLAS_API_MODE=http` به Nest/Postgres وصل می‌شود. جزئیات: `docs/architecture.md`.
