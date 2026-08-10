# ATLAS

آشپزی هوشمند مبتنی بر مواد موجود — مونورپو مطابق مستندات ATLAS.

## ساختار

```
apps/web                 Next.js + React + TypeScript (RTL فارسی)
packages/contracts       قراردادهای API مشترک
packages/api-client      کلاینت API (فعلاً mock)
packages/design-tokens   توکن‌های طراحی
packages/shared          نرمال‌سازی فارسی و برچسب‌ها
```

## اجرای وب

```bash
npm install
npm run dev:web
```

آدرس پیش‌فرض: [http://localhost:3000](http://localhost:3000)

## مسیر پذیرش MVP

مواد → پیشنهادها → دستور → پخت مرحله‌ای → اتمام/خروج

## منبع حقیقت

- `../ATLAS-COMPLETE-DOCUMENTATION-v1`
- `../ATLAS-Agent-Complete-Implementation-Pack-v1`

وب فعلاً با `mode: "mock"` کار می‌کند تا Nest API آماده شود. رتبه‌بندی در پروداکشن سمت سرور می‌ماند.
