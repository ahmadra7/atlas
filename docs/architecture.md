# معماری بک‌اند سرآشپز هوشمند

## هدف
سیستم چندکاربره واقعی: همهٔ مواد، دستورها، یخچال، علاقه‌مندی‌ها و جلسات پخت از دیتابیس خوانده/نوشته می‌شوند — بدون هاردکد در کلاینت.

## پشته (چرا این‌ها)
| لایه | انتخاب | دلیل |
|------|--------|------|
| API | **NestJS** | ماژولار، مناسب تیم/مقیاس، هم‌راستا با TypeScript مونورپو |
| ORM / مهاجرت | **Prisma** | اسکیما واضح، type-safe، seed و migration استاندارد |
| دیتابیس | **PostgreSQL 16** | چندکاربره، هزاران دستور، ایندکس و جستجو |
| کش (مرحله بعد) | Redis | کش پیشنهادها، rate-limit، صف |
| جستجو (مرحله بعد) | Postgres `pg_trgm` → در صورت نیاز Meilisearch | فارسی/علیاس مواد |
| احراز هویت | JWT (access) + User در DB | آمادهٔ رشد به OTP موبایل |

## دامنه داده (جداول اصلی)
- **User** — پروفایل و ترجیحات غذایی
- **Ingredient** + **IngredientAlias** — کاتالوگ مواد (قابل گسترش بدون تغییر کد)
- **Recipe** + **RecipeVersion** + **RecipeIngredient** + **RecipeStep** — دستورها نسخه‌دار (جلسه پخت به نسخه قفل می‌شود)
- **InventoryItem** — یخچال هر کاربر
- **Favorite** — علاقه‌مندی per-user
- **CookingSession** — پخت مرحله‌ای و تاریخچه
- **AnalyticsEvent** (اختیاری بعدی)

## مرزها
```
apps/web  ──HTTP──►  apps/api (Nest)  ──Prisma──►  PostgreSQL
apps/mobile (WebView همان وب)
packages/contracts   قراردادهای مشترک
packages/api-client  کلاینت (mode: http | mock)
```

رتبه‌بندی پیشنهاد غذا **فقط سمت سرور** است.

## مقیاس‌پذیری بعدی
1. Read replica / connection pool (PgBouncer)
2. Redis برای recommendations پرتکرار
3. CDN برای تصاویر دستور
4. Job برای import دسته‌ای دستورهای پخت
5. Auth با OTP پیامک

## اجرای محلی (PostgreSQL)
```bash
# 1) Docker Desktop را نصب کن، بعد:
docker compose up -d postgres

# 2) API
npm install --legacy-peer-deps
npm run db:migrate -w @atlas/api
npm run db:seed -w @atlas/api
npm run dev:api
npm run dev:web
```

`DATABASE_URL` پیش‌فرض: `postgresql://atlas:atlas@localhost:5432/atlas?schema=public`
