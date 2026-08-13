# سرآشپز هوشمند (Smart Chef)

آشپزی هوشمند مبتنی بر مواد موجود — مونورپوی TypeScript با وب Next.js و موبایل Expo (RTL فارسی).

**ریپو:** [github.com/ahmadra7/atlas](https://github.com/ahmadra7/atlas)

## ساختار

```
apps/web                 Next.js + React + TypeScript (UI اصلی)
apps/mobile              Expo WebView + native voice bridge
packages/contracts       قراردادهای API مشترک
packages/api-client      کلاینت API (فعلاً mock)
packages/design-tokens   توکن‌های طراحی
packages/shared          نرمال‌سازی فارسی و برچسب‌ها
```

## پیش‌نیاز

- Node.js ≥ 20
- برای اندروید محلی: Android SDK / دستگاه یا شبیه‌ساز
- برای APK ابری: حساب Expo + `eas-cli`

## نصب و اجرا

```bash
npm install
npm run dev:web      # http://localhost:3000
npm run dev:mobile   # Expo Dev Client / Expo Go
```

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

وب فعلاً با `mode: "mock"` کار می‌کند تا Nest API آماده شود.
