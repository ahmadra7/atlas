import type { Ingredient } from "@atlas/contracts";
import { normalizePersian } from "@atlas/shared";
import { ingredientIdFromName } from "./ids";
import { PERSIAN_RECIPES } from "./persianRecipes";

const EXTRA_ALIASES: Record<string, string[]> = {
  "گوجه‌فرنگی": ["گوجه", "گوجه فرنگی"],
  "سیب‌زمینی": ["سیب زمینی", "سیبزمینی"],
  "تخم‌مرغ": ["تخم مرغ", "تخممرغ"],
  "مرغ": ["سینه مرغ", "ران مرغ"],
  "سینه مرغ": ["مرغ"],
  "گوشت خورشتی": ["گوشت", "گوشت گوسفند", "گوشت گوساله"],
  "گوشت چرخ‌کرده": ["گوشت چرخ کرده", "گوشت چرخکرده"],
  "گوشت چرخکرده": ["گوشت چرخ کرده", "گوشت"],
  "گوشت با استخوان": ["گوشت"],
  "رب گوجه فرنگی": ["رب گوجه"],
  "نان": ["نان لواش", "نان سنگک", "نان بربری"],
  "نان سنگک": ["سنگک", "نان"],
  "سبزی قورمه": ["سبزی قرمه", "سبزی خورشتی"],
  "سبزی کوکو": ["سبزی کوکوسبزی"],
  "سبزی آش": ["سبزی آش رشته"],
  "فلفل سیاه": ["فلفل"],
  "جو پرک": ["جو"],
  "نخود فرنگی": ["نخودفرنگی"],
  "تن ماهی": [
    "تن",
    "تنماهی",
    "تون ماهی",
    "تونا",
    "تون",
    "tuna",
    "ماهی تن",
    "کنسرو تن",
    "کنسرو تن ماهی",
    "کنسرو ماهی",
  ],
};

// Raw list of ingredients from food database with usage-based popularity
const RAW_INGREDIENTS = [
  {
    "id": "ing-b7d8029",
    "name": "شکر",
    "normalizedName": "شکر",
    "category": "عمومی",
    "popularity": 99,
    "aliases": [
      "شکر"
    ]
  },
  {
    "id": "ing-7b4c4ac2",
    "name": "پیاز",
    "normalizedName": "پیاز",
    "category": "عمومی",
    "popularity": 90,
    "aliases": [
      "پیاز"
    ]
  },
  {
    "id": "ing-b7de27c",
    "name": "آرد",
    "normalizedName": "ارد",
    "category": "عمومی",
    "popularity": 79,
    "aliases": [
      "آرد"
    ]
  },
  {
    "id": "ing-7bff326a",
    "name": "تخم مرغ",
    "normalizedName": "تخم مرغ",
    "category": "عمومی",
    "popularity": 71,
    "aliases": [
      "تخم مرغ"
    ]
  },
  {
    "id": "ing-b7ff06f",
    "name": "نمک",
    "normalizedName": "نمک",
    "category": "عمومی",
    "popularity": 70,
    "aliases": [
      "نمک"
    ]
  },
  {
    "id": "ing-b7b6c1a",
    "name": "کره",
    "normalizedName": "کره",
    "category": "عمومی",
    "popularity": 67,
    "aliases": [
      "کره"
    ]
  },
  {
    "id": "ing-b7d35eb",
    "name": "سیر",
    "normalizedName": "سیر",
    "category": "عمومی",
    "popularity": 66,
    "aliases": [
      "سیر"
    ]
  },
  {
    "id": "ing-7b2d9a36",
    "name": "برنج",
    "normalizedName": "برنج",
    "category": "عمومی",
    "popularity": 41,
    "aliases": [
      "برنج"
    ]
  },
  {
    "id": "ing-fc6f8f9a",
    "name": "روغن زیتون",
    "normalizedName": "روغن زیتون",
    "category": "عمومی",
    "popularity": 38,
    "aliases": [
      "روغن زیتون"
    ]
  },
  {
    "id": "ing-b7d952c",
    "name": "شیر",
    "normalizedName": "شیر",
    "category": "عمومی",
    "popularity": 37,
    "aliases": [
      "شیر"
    ]
  },
  {
    "id": "ing-a028121c",
    "name": "گوجه فرنگی",
    "normalizedName": "گوجه فرنگی",
    "category": "عمومی",
    "popularity": 34,
    "aliases": [
      "گوجه فرنگی"
    ]
  },
  {
    "id": "ing-7b22ece0",
    "name": "روغن",
    "normalizedName": "روغن",
    "category": "عمومی",
    "popularity": 27,
    "aliases": [
      "روغن"
    ]
  },
  {
    "id": "ing-5925ea",
    "name": "آب",
    "normalizedName": "اب",
    "category": "عمومی",
    "popularity": 26,
    "aliases": [
      "آب"
    ]
  },
  {
    "id": "ing-3437e70f",
    "name": "آبلیمو",
    "normalizedName": "ابلیمو",
    "category": "عمومی",
    "popularity": 21,
    "aliases": [
      "آبلیمو"
    ]
  },
  {
    "id": "ing-51807cae",
    "name": "ادویه‌ها",
    "normalizedName": "ادویه ها",
    "category": "عمومی",
    "popularity": 19,
    "aliases": [
      "ادویه‌ها"
    ]
  },
  {
    "id": "ing-7b2cbd6e",
    "name": "خامه",
    "normalizedName": "خامه",
    "category": "عمومی",
    "popularity": 17,
    "aliases": [
      "خامه"
    ]
  },
  {
    "id": "ing-50a76201",
    "name": "سبزیجات",
    "normalizedName": "سبزیجات",
    "category": "عمومی",
    "popularity": 17,
    "aliases": [
      "سبزیجات"
    ]
  },
  {
    "id": "ing-9ac0c829",
    "name": "بکینگ پودر",
    "normalizedName": "بکینگ پودر",
    "category": "عمومی",
    "popularity": 16,
    "aliases": [
      "بکینگ پودر"
    ]
  },
  {
    "id": "ing-b7e75875",
    "name": "گوشت چرخ کرده",
    "normalizedName": "گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 16,
    "aliases": [
      "گوشت چرخ کرده"
    ]
  },
  {
    "id": "ing-cf101be2",
    "name": "نمک و فلفل به مقدار لازم",
    "normalizedName": "نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 16,
    "aliases": [
      "نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-2689b0",
    "name": "دارچین",
    "normalizedName": "دارچین",
    "category": "عمومی",
    "popularity": 15,
    "aliases": [
      "دارچین"
    ]
  },
  {
    "id": "ing-b636c295",
    "name": "سس سویا",
    "normalizedName": "سس سویا",
    "category": "عمومی",
    "popularity": 15,
    "aliases": [
      "سس سویا"
    ]
  },
  {
    "id": "ing-ec3664a4",
    "name": "وانیل",
    "normalizedName": "وانیل",
    "category": "عمومی",
    "popularity": 15,
    "aliases": [
      "وانیل"
    ]
  },
  {
    "id": "ing-7b80b40a",
    "name": "هویج",
    "normalizedName": "هویج",
    "category": "عمومی",
    "popularity": 14,
    "aliases": [
      "هویج"
    ]
  },
  {
    "id": "ing-b7e65cb",
    "name": "مرغ",
    "normalizedName": "مرغ",
    "category": "عمومی",
    "popularity": 14,
    "aliases": [
      "مرغ"
    ]
  },
  {
    "id": "ing-2730bd45",
    "name": "رب گوجه فرنگی",
    "normalizedName": "رب گوجه فرنگی",
    "category": "عمومی",
    "popularity": 13,
    "aliases": [
      "رب گوجه فرنگی"
    ]
  },
  {
    "id": "ing-7b7f8ec5",
    "name": "فلفل",
    "normalizedName": "فلفل",
    "category": "عمومی",
    "popularity": 13,
    "aliases": [
      "فلفل"
    ]
  },
  {
    "id": "ing-9123ab46",
    "name": "پودر قند",
    "normalizedName": "پودر قند",
    "category": "عمومی",
    "popularity": 13,
    "aliases": [
      "پودر قند"
    ]
  },
  {
    "id": "ing-7bff326a",
    "name": "تخم‌مرغ",
    "normalizedName": "تخم مرغ",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "تخم‌مرغ"
    ]
  },
  {
    "id": "ing-d0ceab83",
    "name": "سیب‌زمینی",
    "normalizedName": "سیب زمینی",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "سیب‌زمینی"
    ]
  },
  {
    "id": "ing-b7d414b",
    "name": "عسل",
    "normalizedName": "عسل",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "عسل"
    ]
  },
  {
    "id": "ing-7ae61521",
    "name": "گلاب",
    "normalizedName": "گلاب",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "گلاب"
    ]
  },
  {
    "id": "ing-7ae5e51c",
    "name": "گوشت",
    "normalizedName": "گوشت",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "گوشت"
    ]
  },
  {
    "id": "ing-93ba796",
    "name": "جوش شیرین",
    "normalizedName": "جوش شیرین",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "جوش شیرین"
    ]
  },
  {
    "id": "ing-bac2b587",
    "name": "نمک و فلفل",
    "normalizedName": "نمک و فلفل",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "نمک و فلفل"
    ]
  },
  {
    "id": "ing-7b4af13e",
    "name": "ماست",
    "normalizedName": "ماست",
    "category": "عمومی",
    "popularity": 12,
    "aliases": [
      "ماست"
    ]
  },
  {
    "id": "ing-2f33c97",
    "name": "سس مایونز",
    "normalizedName": "سس مایونز",
    "category": "عمومی",
    "popularity": 11,
    "aliases": [
      "سس مایونز"
    ]
  },
  {
    "id": "ing-8551451a",
    "name": "فلفل سیاه",
    "normalizedName": "فلفل سیاه",
    "category": "عمومی",
    "popularity": 11,
    "aliases": [
      "فلفل سیاه"
    ]
  },
  {
    "id": "ing-49466821",
    "name": "زرده تخم مرغ",
    "normalizedName": "زرده تخم مرغ",
    "category": "عمومی",
    "popularity": 11,
    "aliases": [
      "زرده تخم مرغ"
    ]
  },
  {
    "id": "ing-7232b405",
    "name": "بیکینگ پودر",
    "normalizedName": "بیکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیکینگ پودر"
    ]
  },
  {
    "id": "ing-3fd74915",
    "name": "سینه مرغ",
    "normalizedName": "سینه مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ"
    ]
  },
  {
    "id": "ing-9776ee92",
    "name": "گوشت مرغ",
    "normalizedName": "گوشت مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ"
    ]
  },
  {
    "id": "ing-d0ceab83",
    "name": "سیب زمینی",
    "normalizedName": "سیب زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی"
    ]
  },
  {
    "id": "ing-3065a680",
    "name": "گوشت گوسفند",
    "normalizedName": "گوشت گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفند"
    ]
  },
  {
    "id": "ing-d82806d",
    "name": "آرد سفید",
    "normalizedName": "ارد سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید"
    ]
  },
  {
    "id": "ing-ce8f735f",
    "name": "زعفران",
    "normalizedName": "زعفران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران"
    ]
  },
  {
    "id": "ing-94089c80",
    "name": "پنیر خامه ای",
    "normalizedName": "پنیر خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای"
    ]
  },
  {
    "id": "ing-8f0b5323",
    "name": "پودر کاکائو",
    "normalizedName": "پودر کاکائو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو"
    ]
  },
  {
    "id": "ing-a940daf5",
    "name": "گوشت چرخکرده",
    "normalizedName": "گوشت چرخکرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخکرده"
    ]
  },
  {
    "id": "ing-e0a5240c",
    "name": "جعفری",
    "normalizedName": "جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری"
    ]
  },
  {
    "id": "ing-7b82a877",
    "name": "قارچ",
    "normalizedName": "قارچ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ"
    ]
  },
  {
    "id": "ing-7b4a5fc0",
    "name": "پنیر",
    "normalizedName": "پنیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر"
    ]
  },
  {
    "id": "ing-be70fee0",
    "name": "جعفری خرد شده",
    "normalizedName": "جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خرد شده"
    ]
  },
  {
    "id": "ing-d68af988",
    "name": "زردچوبه",
    "normalizedName": "زردچوبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه"
    ]
  },
  {
    "id": "ing-92cdfd87",
    "name": "فلفل دلمه‌ای",
    "normalizedName": "فلفل دلمه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای"
    ]
  },
  {
    "id": "ing-fadc7a22",
    "name": "اسانس وانیل",
    "normalizedName": "اسانس وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل"
    ]
  },
  {
    "id": "ing-91250f23",
    "name": "پودر سیر",
    "normalizedName": "پودر سیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سیر"
    ]
  },
  {
    "id": "ing-97785f1c",
    "name": "گوشت گاو",
    "normalizedName": "گوشت گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گاو"
    ]
  },
  {
    "id": "ing-605cf778",
    "name": "پودر دارچین",
    "normalizedName": "پودر دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر دارچین"
    ]
  },
  {
    "id": "ing-e0f39b28",
    "name": "شکر قهوه ای",
    "normalizedName": "شکر قهوه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای"
    ]
  },
  {
    "id": "ing-e8512c59",
    "name": "عصاره وانیل",
    "normalizedName": "عصاره وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره وانیل"
    ]
  },
  {
    "id": "ing-7f8a5043",
    "name": "پیازچه",
    "normalizedName": "پیازچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه"
    ]
  },
  {
    "id": "ing-8527a9a1",
    "name": "فلفل قرمز",
    "normalizedName": "فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز"
    ]
  },
  {
    "id": "ing-cc7042e5",
    "name": "زعفران دم کرده",
    "normalizedName": "زعفران دم کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده"
    ]
  },
  {
    "id": "ing-c8473b7d",
    "name": "زنجبیل",
    "normalizedName": "زنجبیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل"
    ]
  },
  {
    "id": "ing-4d278f77",
    "name": "روغن مایع",
    "normalizedName": "روغن مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مایع"
    ]
  },
  {
    "id": "ing-b6823a6d",
    "name": "بادمجان",
    "normalizedName": "بادمجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان"
    ]
  },
  {
    "id": "ing-7ae969a9",
    "name": "کشمش",
    "normalizedName": "کشمش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش"
    ]
  },
  {
    "id": "ing-b7d41a0",
    "name": "عدس",
    "normalizedName": "عدس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس"
    ]
  },
  {
    "id": "ing-92cdfd87",
    "name": "فلفل دلمه ای",
    "normalizedName": "فلفل دلمه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای"
    ]
  },
  {
    "id": "ing-32d347a4",
    "name": "آب مرغ",
    "normalizedName": "اب مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب مرغ"
    ]
  },
  {
    "id": "ing-693f272e",
    "name": "پودر هل",
    "normalizedName": "پودر هل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر هل"
    ]
  },
  {
    "id": "ing-1a2a1058",
    "name": "سرکه سفید",
    "normalizedName": "سرکه سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سفید"
    ]
  },
  {
    "id": "ing-dfc5437f",
    "name": "زیتون",
    "normalizedName": "زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون"
    ]
  },
  {
    "id": "ing-7b804cca",
    "name": "نخود",
    "normalizedName": "نخود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود"
    ]
  },
  {
    "id": "ing-7a6545dc",
    "name": "سفیده تخم مرغ",
    "normalizedName": "سفیده تخم مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم مرغ"
    ]
  },
  {
    "id": "ing-7b298311",
    "name": "خیار",
    "normalizedName": "خیار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار"
    ]
  },
  {
    "id": "ing-255c8f68",
    "name": "سیر رنده شده",
    "normalizedName": "سیر رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر رنده شده"
    ]
  },
  {
    "id": "ing-8d3785af",
    "name": "آب لیمو",
    "normalizedName": "اب لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو"
    ]
  },
  {
    "id": "ing-2650befe",
    "name": "پنیر پارمزان",
    "normalizedName": "پنیر پارمزان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان"
    ]
  },
  {
    "id": "ing-fb298ed0",
    "name": "گردو خرد شده",
    "normalizedName": "گردو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو خرد شده"
    ]
  },
  {
    "id": "ing-b90ef898",
    "name": "شکر سفید",
    "normalizedName": "شکر سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر سفید"
    ]
  },
  {
    "id": "ing-7b22afe9",
    "name": "سرکه",
    "normalizedName": "سرکه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه"
    ]
  },
  {
    "id": "ing-4d71e6ae",
    "name": "پیاز خرد شده",
    "normalizedName": "پیاز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز خرد شده"
    ]
  },
  {
    "id": "ing-4dd0e734",
    "name": "کره نرم شده",
    "normalizedName": "کره نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نرم شده"
    ]
  },
  {
    "id": "ing-31e2a6ee",
    "name": "خاک قند",
    "normalizedName": "خاک قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاک قند"
    ]
  },
  {
    "id": "ing-d7e6aa06",
    "name": "گشنیز",
    "normalizedName": "گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز"
    ]
  },
  {
    "id": "ing-1f5ddb51",
    "name": "نان تست",
    "normalizedName": "نان تست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست"
    ]
  },
  {
    "id": "ing-94ef4dc1",
    "name": "خامه ترش",
    "normalizedName": "خامه ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش"
    ]
  },
  {
    "id": "ing-da3016f3",
    "name": "کالباس",
    "normalizedName": "کالباس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس"
    ]
  },
  {
    "id": "ing-b7d35f2",
    "name": "سیب",
    "normalizedName": "سیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب"
    ]
  },
  {
    "id": "ing-32d3b11a",
    "name": "آب جوش",
    "normalizedName": "اب جوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب جوش"
    ]
  },
  {
    "id": "ing-5b606669",
    "name": "پودر فلفل قرمز",
    "normalizedName": "پودر فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل قرمز"
    ]
  },
  {
    "id": "ing-dd95987f",
    "name": "نمک و فلفل به میزان دلخواه",
    "normalizedName": "نمک و فلفل به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل به میزان دلخواه"
    ]
  },
  {
    "id": "ing-fca9c4d3",
    "name": "برگ بو",
    "normalizedName": "برگ بو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ بو"
    ]
  },
  {
    "id": "ing-db8b846f",
    "name": "شکر دانه ریز",
    "normalizedName": "شکر دانه ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر دانه ریز"
    ]
  },
  {
    "id": "ing-aa17e8e",
    "name": "اسانس وانیل چند قطره",
    "normalizedName": "اسانس وانیل چند قطره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل چند قطره"
    ]
  },
  {
    "id": "ing-7b474e2b",
    "name": "میگو",
    "normalizedName": "میگو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو"
    ]
  },
  {
    "id": "ing-e0e6eb27",
    "name": "بادام",
    "normalizedName": "بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام"
    ]
  },
  {
    "id": "ing-a028121c",
    "name": "گوجه‌فرنگی",
    "normalizedName": "گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه‌فرنگی"
    ]
  },
  {
    "id": "ing-3d1a704c",
    "name": "گوشت گوسفندی",
    "normalizedName": "گوشت گوسفندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفندی"
    ]
  },
  {
    "id": "ing-2f14c818",
    "name": "نمک و فلفل سیاه",
    "normalizedName": "نمک و فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه"
    ]
  },
  {
    "id": "ing-7b2c8218",
    "name": "خرما",
    "normalizedName": "خرما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما"
    ]
  },
  {
    "id": "ing-3a57dc4c",
    "name": "فلفل سبز",
    "normalizedName": "فلفل سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز"
    ]
  },
  {
    "id": "ing-7b82dd60",
    "name": "لیمو",
    "normalizedName": "لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو"
    ]
  },
  {
    "id": "ing-d0870460",
    "name": "سیب زمینی متوسط",
    "normalizedName": "سیب زمینی متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی متوسط"
    ]
  },
  {
    "id": "ing-7ae8603c",
    "name": "گردو",
    "normalizedName": "گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو"
    ]
  },
  {
    "id": "ing-32d58a87",
    "name": "آب سرد",
    "normalizedName": "اب سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب سرد"
    ]
  },
  {
    "id": "ing-512df4f3",
    "name": "شکلات تخته ای",
    "normalizedName": "شکلات تخته ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای"
    ]
  },
  {
    "id": "ing-7b2313db",
    "name": "زرشک",
    "normalizedName": "زرشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرشک"
    ]
  },
  {
    "id": "ing-769ce2ff",
    "name": "پنیر چدار",
    "normalizedName": "پنیر چدار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار"
    ]
  },
  {
    "id": "ing-ed17c689",
    "name": "کره آب شده",
    "normalizedName": "کره اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره آب شده"
    ]
  },
  {
    "id": "ing-d0fc436d",
    "name": "نمک و فلفل مقدار لازم",
    "normalizedName": "نمک و فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-7b4b062c",
    "name": "ماهی",
    "normalizedName": "ماهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی"
    ]
  },
  {
    "id": "ing-4bfb24b6",
    "name": "پودر ژلاتین",
    "normalizedName": "پودر ژلاتین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژلاتین"
    ]
  },
  {
    "id": "ing-e43c7d62",
    "name": "پاستا",
    "normalizedName": "پاستا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا"
    ]
  },
  {
    "id": "ing-ca49b51d",
    "name": "پنیر پارمزان رنده شده",
    "normalizedName": "پنیر پارمزان رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان رنده شده"
    ]
  },
  {
    "id": "ing-4d3a5fcc",
    "name": "روغن کنجد",
    "normalizedName": "روغن کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کنجد"
    ]
  },
  {
    "id": "ing-379a0c31",
    "name": "مغز گردو",
    "normalizedName": "مغز گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو"
    ]
  },
  {
    "id": "ing-b975def7",
    "name": "سرکه بالزامیک",
    "normalizedName": "سرکه بالزامیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه بالزامیک"
    ]
  },
  {
    "id": "ing-b640d171",
    "name": "سس خردل",
    "normalizedName": "سس خردل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس خردل"
    ]
  },
  {
    "id": "ing-738c6efc",
    "name": "پنیر چدار رنده شده",
    "normalizedName": "پنیر چدار رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار رنده شده"
    ]
  },
  {
    "id": "ing-13358807",
    "name": "سیر خرد شده",
    "normalizedName": "سیر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر خرد شده"
    ]
  },
  {
    "id": "ing-31887ac2",
    "name": "کدو سبز",
    "normalizedName": "کدو سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز"
    ]
  },
  {
    "id": "ing-46a49d9b",
    "name": "قارچ خرد شده",
    "normalizedName": "قارچ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ خرد شده"
    ]
  },
  {
    "id": "ing-50238830",
    "name": "رب گوجه",
    "normalizedName": "رب گوجه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه"
    ]
  },
  {
    "id": "ing-4624d2e1",
    "name": "پیاز متوسط",
    "normalizedName": "پیاز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط"
    ]
  },
  {
    "id": "ing-8e99133f",
    "name": "نخود فرنگی",
    "normalizedName": "نخود فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی"
    ]
  },
  {
    "id": "ing-5dae9c9a",
    "name": "خمیر مایه",
    "normalizedName": "خمیر مایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مایه"
    ]
  },
  {
    "id": "ing-423a1beb",
    "name": "آووکادو",
    "normalizedName": "اووکادو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آووکادو"
    ]
  },
  {
    "id": "ing-9e52a58",
    "name": "توت فرنگی",
    "normalizedName": "توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی"
    ]
  },
  {
    "id": "ing-4fe125ab",
    "name": "رب انار",
    "normalizedName": "رب انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب انار"
    ]
  },
  {
    "id": "ing-7ae93184",
    "name": "کاهو",
    "normalizedName": "کاهو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو"
    ]
  },
  {
    "id": "ing-b9645fb5",
    "name": "کره ی بدون نمک",
    "normalizedName": "کره ی بدون نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک"
    ]
  },
  {
    "id": "ing-3a7d9942",
    "name": "پودر سوخاری",
    "normalizedName": "پودر سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سوخاری"
    ]
  },
  {
    "id": "ing-a406f36a",
    "name": "گشنیز خرد شده",
    "normalizedName": "گشنیز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز خرد شده"
    ]
  },
  {
    "id": "ing-f2d8bdaf",
    "name": "روغن گیاهی",
    "normalizedName": "روغن گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن گیاهی"
    ]
  },
  {
    "id": "ing-127af3cf",
    "name": "لیمو ترش",
    "normalizedName": "لیمو ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش"
    ]
  },
  {
    "id": "ing-809a4bc5",
    "name": "نشاسته ذرت",
    "normalizedName": "نشاسته ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته ذرت"
    ]
  },
  {
    "id": "ing-8ed9b17b",
    "name": "دانه انار",
    "normalizedName": "دانه انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار"
    ]
  },
  {
    "id": "ing-e7023c76",
    "name": "چوب دارچین",
    "normalizedName": "چوب دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب دارچین"
    ]
  },
  {
    "id": "ing-7190a653",
    "name": "آرد سوخاری",
    "normalizedName": "ارد سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری"
    ]
  },
  {
    "id": "ing-8449bc57",
    "name": "آرد ذرت",
    "normalizedName": "ارد ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد ذرت"
    ]
  },
  {
    "id": "ing-7b4c4ac2",
    "name": "پياز",
    "normalizedName": "پیاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پياز"
    ]
  },
  {
    "id": "ing-8d336792",
    "name": "آب ولرم",
    "normalizedName": "اب ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ولرم"
    ]
  },
  {
    "id": "ing-30630e4c",
    "name": "گوشت گوساله",
    "normalizedName": "گوشت گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوساله"
    ]
  },
  {
    "id": "ing-b5afbe94",
    "name": "شیر ولرم",
    "normalizedName": "شیر ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر ولرم"
    ]
  },
  {
    "id": "ing-bd66161a",
    "name": "پودر نارگیل",
    "normalizedName": "پودر نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل"
    ]
  },
  {
    "id": "ing-6baa2cf9",
    "name": "سبزیجات تازه",
    "normalizedName": "سبزیجات تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات تازه"
    ]
  },
  {
    "id": "ing-50af1c2d",
    "name": "پنیر پیتزا",
    "normalizedName": "پنیر پیتزا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا"
    ]
  },
  {
    "id": "ing-28b942d4",
    "name": "جعفری تازه",
    "normalizedName": "جعفری تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه"
    ]
  },
  {
    "id": "ing-a122559",
    "name": "گوشت خورشتی",
    "normalizedName": "گوشت خورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت خورشتی"
    ]
  },
  {
    "id": "ing-fc1b7647",
    "name": "جو پرک",
    "normalizedName": "جو پرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو پرک"
    ]
  },
  {
    "id": "ing-68754fbc",
    "name": "پودر آویشن",
    "normalizedName": "پودر اویشن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر آویشن"
    ]
  },
  {
    "id": "ing-d3f6cc76",
    "name": "کره ذوب شده",
    "normalizedName": "کره ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ذوب شده"
    ]
  },
  {
    "id": "ing-b7e589a",
    "name": "موز",
    "normalizedName": "موز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز"
    ]
  },
  {
    "id": "ing-c6a478af",
    "name": "پیازچه خرد شده",
    "normalizedName": "پیازچه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه خرد شده"
    ]
  },
  {
    "id": "ing-562dace",
    "name": "خلال بادام",
    "normalizedName": "خلال بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال بادام"
    ]
  },
  {
    "id": "ing-59a3b84d",
    "name": "پوره کدو حلوایی",
    "normalizedName": "پوره کدو حلوایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره کدو حلوایی"
    ]
  },
  {
    "id": "ing-265fd76b",
    "name": "فلفل دلمه ای خرد شده",
    "normalizedName": "فلفل دلمه ای خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای خرد شده"
    ]
  },
  {
    "id": "ing-7b25052d",
    "name": "زیره",
    "normalizedName": "زیره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره"
    ]
  },
  {
    "id": "ing-d85a4af",
    "name": "آرد برنج",
    "normalizedName": "ارد برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد برنج"
    ]
  },
  {
    "id": "ing-df5e8b52",
    "name": "سوسیس",
    "normalizedName": "سوسیس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس"
    ]
  },
  {
    "id": "ing-6eafa54a",
    "name": "پنیر موزارلا",
    "normalizedName": "پنیر موزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلا"
    ]
  },
  {
    "id": "ing-e8be062b",
    "name": "ادویه به مقدار لازم",
    "normalizedName": "ادویه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه به مقدار لازم"
    ]
  },
  {
    "id": "ing-f0acbc7b",
    "name": "آب لیموی تازه",
    "normalizedName": "اب لیموی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیموی تازه"
    ]
  },
  {
    "id": "ing-d50e0b6c",
    "name": "پنیر فتا",
    "normalizedName": "پنیر فتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر فتا"
    ]
  },
  {
    "id": "ing-ab75921e",
    "name": "سرکه سیب",
    "normalizedName": "سرکه سیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سیب"
    ]
  },
  {
    "id": "ing-7b7e1f80",
    "name": "نودل",
    "normalizedName": "نودل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل"
    ]
  },
  {
    "id": "ing-8d908653",
    "name": "آب گوشت",
    "normalizedName": "اب گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوشت"
    ]
  },
  {
    "id": "ing-2650aa3f",
    "name": "پنیر پارمسان",
    "normalizedName": "پنیر پارمسان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمسان"
    ]
  },
  {
    "id": "ing-b5d8defe",
    "name": "پودر کاری",
    "normalizedName": "پودر کاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاری"
    ]
  },
  {
    "id": "ing-b5c671e5",
    "name": "پودر زیره",
    "normalizedName": "پودر زیره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زیره"
    ]
  },
  {
    "id": "ing-d831560",
    "name": "آرد ساده",
    "normalizedName": "ارد ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد ساده"
    ]
  },
  {
    "id": "ing-6d82b037",
    "name": "تخم مرغ پخته",
    "normalizedName": "تخم مرغ پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ پخته"
    ]
  },
  {
    "id": "ing-7ae60c46",
    "name": "گندم",
    "normalizedName": "گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گندم"
    ]
  },
  {
    "id": "ing-b8004a2",
    "name": "نان",
    "normalizedName": "نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان"
    ]
  },
  {
    "id": "ing-eb2ddb7a",
    "name": "شکلات چیپسی",
    "normalizedName": "شکلات چیپسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات چیپسی"
    ]
  },
  {
    "id": "ing-5d7a8cee",
    "name": "نشاسته",
    "normalizedName": "نشاسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته"
    ]
  },
  {
    "id": "ing-c51c6943",
    "name": "کرفس خرد شده",
    "normalizedName": "کرفس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرفس خرد شده"
    ]
  },
  {
    "id": "ing-38b35ab5",
    "name": "پودر زنجبیل",
    "normalizedName": "پودر زنجبیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زنجبیل"
    ]
  },
  {
    "id": "ing-6dad13ee",
    "name": "تخم مرغ بزرگ",
    "normalizedName": "تخم مرغ بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ بزرگ"
    ]
  },
  {
    "id": "ing-db87d9f",
    "name": "آرد گندم",
    "normalizedName": "ارد گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم"
    ]
  },
  {
    "id": "ing-738a9215",
    "name": "باترمیلک",
    "normalizedName": "باترمیلک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باترمیلک"
    ]
  },
  {
    "id": "ing-b800018",
    "name": "لپه",
    "normalizedName": "لپه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لپه"
    ]
  },
  {
    "id": "ing-326ccf3d",
    "name": "اسفناج",
    "normalizedName": "اسفناج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج"
    ]
  },
  {
    "id": "ing-eb641b6a",
    "name": "لوبیا",
    "normalizedName": "لوبیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا"
    ]
  },
  {
    "id": "ing-a8a0c8c8",
    "name": "نعنا خشک",
    "normalizedName": "نعنا خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا خشک"
    ]
  },
  {
    "id": "ing-81615269",
    "name": "خامه فرم گرفته",
    "normalizedName": "خامه فرم گرفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرم گرفته"
    ]
  },
  {
    "id": "ing-b5f73d53",
    "name": "سس کچاپ",
    "normalizedName": "سس کچاپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کچاپ"
    ]
  },
  {
    "id": "ing-e378ed24",
    "name": "زیره سبز",
    "normalizedName": "زیره سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره سبز"
    ]
  },
  {
    "id": "ing-cc087006",
    "name": "پیاز بزرگ",
    "normalizedName": "پیاز بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز بزرگ"
    ]
  },
  {
    "id": "ing-e103de3e",
    "name": "ترخون",
    "normalizedName": "ترخون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترخون"
    ]
  },
  {
    "id": "ing-35e173ec",
    "name": "پودر زیره سبز",
    "normalizedName": "پودر زیره سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زیره سبز"
    ]
  },
  {
    "id": "ing-6331a7ee",
    "name": "آب پرتقال",
    "normalizedName": "اب پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب پرتقال"
    ]
  },
  {
    "id": "ing-9d6cd92e",
    "name": "لوبیا قرمز",
    "normalizedName": "لوبیا قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا قرمز"
    ]
  },
  {
    "id": "ing-7b32665a",
    "name": "شوید",
    "normalizedName": "شوید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید"
    ]
  },
  {
    "id": "ing-e0df4b71",
    "name": "شکلات",
    "normalizedName": "شکلات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات"
    ]
  },
  {
    "id": "ing-7ae5e469",
    "name": "گوجه",
    "normalizedName": "گوجه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه"
    ]
  },
  {
    "id": "ing-e232b374",
    "name": "آویشن",
    "normalizedName": "اویشن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن"
    ]
  },
  {
    "id": "ing-90ac5fde",
    "name": "خامه پرچرب",
    "normalizedName": "خامه پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پرچرب"
    ]
  },
  {
    "id": "ing-cc4fd14c",
    "name": "پیاز کوچک",
    "normalizedName": "پیاز کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک"
    ]
  },
  {
    "id": "ing-d9159359",
    "name": "آرد نخودچی",
    "normalizedName": "ارد نخودچی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نخودچی"
    ]
  },
  {
    "id": "ing-593666",
    "name": "هل",
    "normalizedName": "هل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هل"
    ]
  },
  {
    "id": "ing-c1205605",
    "name": "گوجه خرد شده",
    "normalizedName": "گوجه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه خرد شده"
    ]
  },
  {
    "id": "ing-6c186668",
    "name": "سیر ریز خرد شده",
    "normalizedName": "سیر ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر ریز خرد شده"
    ]
  },
  {
    "id": "ing-b5690b8a",
    "name": "پودر پیاز",
    "normalizedName": "پودر پیاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پیاز"
    ]
  },
  {
    "id": "ing-955a50b1",
    "name": "روغن سرخ کردنی",
    "normalizedName": "روغن سرخ کردنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن سرخ کردنی"
    ]
  },
  {
    "id": "ing-8d8314d1",
    "name": "شکلات تلخ",
    "normalizedName": "شکلات تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ"
    ]
  },
  {
    "id": "ing-9d78133b",
    "name": "لوبیا سفید",
    "normalizedName": "لوبیا سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سفید"
    ]
  },
  {
    "id": "ing-7ae8e9af",
    "name": "کرفس",
    "normalizedName": "کرفس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرفس"
    ]
  },
  {
    "id": "ing-7cc53c41",
    "name": "سس سالسا",
    "normalizedName": "سس سالسا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سالسا"
    ]
  },
  {
    "id": "ing-b7b6f11",
    "name": "کشک",
    "normalizedName": "کشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشک"
    ]
  },
  {
    "id": "ing-8a7070f4",
    "name": "کره یا روغن",
    "normalizedName": "کره یا روغن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن"
    ]
  },
  {
    "id": "ing-cabeb1c9",
    "name": "کره بادام زمینی",
    "normalizedName": "کره بادام زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بادام زمینی"
    ]
  },
  {
    "id": "ing-cf101be2",
    "name": "نمك و فلفل به مقدار لازم",
    "normalizedName": "نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-3dec1b19",
    "name": "پنیر ماسکارپونه",
    "normalizedName": "پنیر ماسکارپونه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ماسکارپونه"
    ]
  },
  {
    "id": "ing-44ebcb7",
    "name": "تورتیا",
    "normalizedName": "تورتیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تورتیا"
    ]
  },
  {
    "id": "ing-818dde2f",
    "name": "ادویه‌جات",
    "normalizedName": "ادویه جات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌جات"
    ]
  },
  {
    "id": "ing-91241b6a",
    "name": "پودر نان",
    "normalizedName": "پودر نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نان"
    ]
  },
  {
    "id": "ing-946d7bec",
    "name": "ریحان تازه",
    "normalizedName": "ریحان تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان تازه"
    ]
  },
  {
    "id": "ing-91e549e7",
    "name": "سیب زمینی بزرگ",
    "normalizedName": "سیب زمینی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی بزرگ"
    ]
  },
  {
    "id": "ing-4e83d266",
    "name": "هویج خرد شده",
    "normalizedName": "هویج خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج خرد شده"
    ]
  },
  {
    "id": "ing-aef625be",
    "name": "زنجبیل رنده شده",
    "normalizedName": "زنجبیل رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل رنده شده"
    ]
  },
  {
    "id": "ing-32d5d671",
    "name": "آب گرم",
    "normalizedName": "اب گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گرم"
    ]
  },
  {
    "id": "ing-b977b123",
    "name": "فلفل دلمه ای قرمز",
    "normalizedName": "فلفل دلمه ای قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز"
    ]
  },
  {
    "id": "ing-c3fbfec0",
    "name": "آب لیمو ترش",
    "normalizedName": "اب لیمو ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو ترش"
    ]
  },
  {
    "id": "ing-5b0205d2",
    "name": "پودر فلفل سیاه",
    "normalizedName": "پودر فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سیاه"
    ]
  },
  {
    "id": "ing-618ad7ab",
    "name": "لیمو ترش بزرگ",
    "normalizedName": "لیمو ترش بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش بزرگ"
    ]
  },
  {
    "id": "ing-77eb4e51",
    "name": "جوز هندی",
    "normalizedName": "جوز هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوز هندی"
    ]
  },
  {
    "id": "ing-8d808d3d",
    "name": "آب انار",
    "normalizedName": "اب انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب انار"
    ]
  },
  {
    "id": "ing-8a1ecf6e",
    "name": "خامه قنادی",
    "normalizedName": "خامه قنادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه قنادی"
    ]
  },
  {
    "id": "ing-f735819a",
    "name": "نعناع تازه",
    "normalizedName": "نعناع تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع تازه"
    ]
  },
  {
    "id": "ing-15e89a02",
    "name": "روغن زیتون خالص",
    "normalizedName": "روغن زیتون خالص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون خالص"
    ]
  },
  {
    "id": "ing-26859111",
    "name": "نعناع خشک",
    "normalizedName": "نعناع خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع خشک"
    ]
  },
  {
    "id": "ing-b0e1eafc",
    "name": "سس گوجه فرنگی",
    "normalizedName": "سس گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوجه فرنگی"
    ]
  },
  {
    "id": "ing-c61f415",
    "name": "کره یا روغن جامد",
    "normalizedName": "کره یا روغن جامد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن جامد"
    ]
  },
  {
    "id": "ing-de1cd610",
    "name": "اسانس وانیل مقداری",
    "normalizedName": "اسانس وانیل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل مقداری"
    ]
  },
  {
    "id": "ing-410491b2",
    "name": "پنیر ماسکارپونه یا خامه ای",
    "normalizedName": "پنیر ماسکارپونه یا خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ماسکارپونه یا خامه ای"
    ]
  },
  {
    "id": "ing-9126f1b6",
    "name": "پودر ژله",
    "normalizedName": "پودر ژله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله"
    ]
  },
  {
    "id": "ing-9819a7b4",
    "name": "سیر له شده",
    "normalizedName": "سیر له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر له شده"
    ]
  },
  {
    "id": "ing-f1b0a4f7",
    "name": "ماهی سالمون",
    "normalizedName": "ماهی سالمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی سالمون"
    ]
  },
  {
    "id": "ing-b7265075",
    "name": "خرده نان",
    "normalizedName": "خرده نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده نان"
    ]
  },
  {
    "id": "ing-cbdef7c6",
    "name": "پیاز قرمز",
    "normalizedName": "پیاز قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز"
    ]
  },
  {
    "id": "ing-7ae8a8c9",
    "name": "کنجد",
    "normalizedName": "کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد"
    ]
  },
  {
    "id": "ing-e28dab8e",
    "name": "ادویه",
    "normalizedName": "ادویه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه"
    ]
  },
  {
    "id": "ing-d4d76025",
    "name": "فیله مرغ",
    "normalizedName": "فیله مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ"
    ]
  },
  {
    "id": "ing-b1a8ba8",
    "name": "نان باگت",
    "normalizedName": "نان باگت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان باگت"
    ]
  },
  {
    "id": "ing-1d1d81ee",
    "name": "پنیر پیتزا رنده شده",
    "normalizedName": "پنیر پیتزا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا رنده شده"
    ]
  },
  {
    "id": "ing-ed7fb963",
    "name": "لوبیا سبز",
    "normalizedName": "لوبیا سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سبز"
    ]
  },
  {
    "id": "ing-9ce3491b",
    "name": "پودر کاکائو خالص",
    "normalizedName": "پودر کاکائو خالص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو خالص"
    ]
  },
  {
    "id": "ing-4dc191bf",
    "name": "گوجه فرنگی متوسط",
    "normalizedName": "گوجه فرنگی متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی متوسط"
    ]
  },
  {
    "id": "ing-f269d63",
    "name": "روغن زیتون یا روغن مایع",
    "normalizedName": "روغن زیتون یا روغن مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا روغن مایع"
    ]
  },
  {
    "id": "ing-f614def3",
    "name": "ذرت پخته",
    "normalizedName": "ذرت پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت پخته"
    ]
  },
  {
    "id": "ing-b7d952c",
    "name": "شير",
    "normalizedName": "شیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شير"
    ]
  },
  {
    "id": "ing-b7d8029",
    "name": "شكر",
    "normalizedName": "شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شكر"
    ]
  },
  {
    "id": "ing-dc6c8fa3",
    "name": "پنیر رنده شده",
    "normalizedName": "پنیر رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر رنده شده"
    ]
  },
  {
    "id": "ing-32ba6d77",
    "name": "خامه فرمی",
    "normalizedName": "خامه فرمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرمی"
    ]
  },
  {
    "id": "ing-7b7f83af",
    "name": "فندق",
    "normalizedName": "فندق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق"
    ]
  },
  {
    "id": "ing-b7b614b",
    "name": "کدو",
    "normalizedName": "کدو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو"
    ]
  },
  {
    "id": "ing-a3fb5d86",
    "name": "نمک و فلفل به میزان لازم",
    "normalizedName": "نمک و فلفل به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل به میزان لازم"
    ]
  },
  {
    "id": "ing-8df5748a",
    "name": "نمک به مقدار لازم",
    "normalizedName": "نمک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک به مقدار لازم"
    ]
  },
  {
    "id": "ing-7b2d54d3",
    "name": "خمیر",
    "normalizedName": "خمیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر"
    ]
  },
  {
    "id": "ing-f1f25ea0",
    "name": "فلفل سبز خرد شده",
    "normalizedName": "فلفل سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز خرد شده"
    ]
  },
  {
    "id": "ing-b2fe0ddb",
    "name": "آبلیموی تازه",
    "normalizedName": "ابلیموی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیموی تازه"
    ]
  },
  {
    "id": "ing-628a5ec9",
    "name": "بادمجان بزرگ",
    "normalizedName": "بادمجان بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان بزرگ"
    ]
  },
  {
    "id": "ing-b7d8959",
    "name": "تره",
    "normalizedName": "تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره"
    ]
  },
  {
    "id": "ing-b7d26ae",
    "name": "ذرت",
    "normalizedName": "ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت"
    ]
  },
  {
    "id": "ing-85f37e51",
    "name": "اسفناج خرد شده",
    "normalizedName": "اسفناج خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج خرد شده"
    ]
  },
  {
    "id": "ing-5f7ff549",
    "name": "زعفران سائیده",
    "normalizedName": "زعفران سائیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران سائیده"
    ]
  },
  {
    "id": "ing-b32a57d",
    "name": "نان پیتا",
    "normalizedName": "نان پیتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان پیتا"
    ]
  },
  {
    "id": "ing-b8013a0e",
    "name": "ماست پر چرب",
    "normalizedName": "ماست پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست پر چرب"
    ]
  },
  {
    "id": "ing-8e934bb3",
    "name": "روغن آفتابگردان",
    "normalizedName": "روغن افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن آفتابگردان"
    ]
  },
  {
    "id": "ing-cbf11d29",
    "name": "هویج رنده شده",
    "normalizedName": "هویج رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج رنده شده"
    ]
  },
  {
    "id": "ing-6cb82aa1",
    "name": "پرتقال",
    "normalizedName": "پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرتقال"
    ]
  },
  {
    "id": "ing-e243e7d1",
    "name": "پاپریکا",
    "normalizedName": "پاپریکا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاپریکا"
    ]
  },
  {
    "id": "ing-93c410a0",
    "name": "نمک و فلفل سیاه به میزان دلخواه",
    "normalizedName": "نمک و فلفل سیاه به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه به میزان دلخواه"
    ]
  },
  {
    "id": "ing-710c04ce",
    "name": "پودر گشنیز",
    "normalizedName": "پودر گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گشنیز"
    ]
  },
  {
    "id": "ing-7b475e6b",
    "name": "میخک",
    "normalizedName": "میخک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میخک"
    ]
  },
  {
    "id": "ing-5193b59e",
    "name": "گشنیز تازه",
    "normalizedName": "گشنیز تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز تازه"
    ]
  },
  {
    "id": "ing-86f7307e",
    "name": "ژلاتین",
    "normalizedName": "ژلاتین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژلاتین"
    ]
  },
  {
    "id": "ing-52970d32",
    "name": "زیره سیاه",
    "normalizedName": "زیره سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره سیاه"
    ]
  },
  {
    "id": "ing-8a0fc030",
    "name": "پیاز داغ",
    "normalizedName": "پیاز داغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز داغ"
    ]
  },
  {
    "id": "ing-7b2c7891",
    "name": "خردل",
    "normalizedName": "خردل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خردل"
    ]
  },
  {
    "id": "ing-9c1405f1",
    "name": "لیمو عمانی",
    "normalizedName": "لیمو عمانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو عمانی"
    ]
  },
  {
    "id": "ing-e8f9c46c",
    "name": "خلال پسته",
    "normalizedName": "خلال پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته"
    ]
  },
  {
    "id": "ing-a4967831",
    "name": "لیموی ارگانیک",
    "normalizedName": "لیموی ارگانیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیموی ارگانیک"
    ]
  },
  {
    "id": "ing-e00bc0c8",
    "name": "پیاز قرمز کوچک",
    "normalizedName": "پیاز قرمز کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز کوچک"
    ]
  },
  {
    "id": "ing-a6accfa0",
    "name": "پیاز کوچک خرد شده",
    "normalizedName": "پیاز کوچک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک خرد شده"
    ]
  },
  {
    "id": "ing-15823e68",
    "name": "کاهو خرد شده",
    "normalizedName": "کاهو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو خرد شده"
    ]
  },
  {
    "id": "ing-3518a60b",
    "name": "کنسرو ذرت",
    "normalizedName": "کنسرو ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو ذرت"
    ]
  },
  {
    "id": "ing-7ad5a23d",
    "name": "نمک و فلفل سیاه به مقدار لازم",
    "normalizedName": "نمک و فلفل سیاه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه به مقدار لازم"
    ]
  },
  {
    "id": "ing-5926a7",
    "name": "یخ",
    "normalizedName": "یخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یخ"
    ]
  },
  {
    "id": "ing-d33e554e",
    "name": "مخمر فوری",
    "normalizedName": "مخمر فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمر فوری"
    ]
  },
  {
    "id": "ing-b9aeade9",
    "name": "فلفل دلمه ای کوچک",
    "normalizedName": "فلفل دلمه ای کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای کوچک"
    ]
  },
  {
    "id": "ing-7d3dc9",
    "name": "شوید خشک",
    "normalizedName": "شوید خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید خشک"
    ]
  },
  {
    "id": "ing-87d3909c",
    "name": "گردوی خرد شده",
    "normalizedName": "گردوی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردوی خرد شده"
    ]
  },
  {
    "id": "ing-b7b6d8d",
    "name": "کلم",
    "normalizedName": "کلم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم"
    ]
  },
  {
    "id": "ing-4eaaf2b8",
    "name": "کرم تارتار",
    "normalizedName": "کرم تارتار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرم تارتار"
    ]
  },
  {
    "id": "ing-7b2f5cb7",
    "name": "تمشک",
    "normalizedName": "تمشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک"
    ]
  },
  {
    "id": "ing-7b47d625",
    "name": "پسته",
    "normalizedName": "پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته"
    ]
  },
  {
    "id": "ing-3699a075",
    "name": "برنج سوشی",
    "normalizedName": "برنج سوشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج سوشی"
    ]
  },
  {
    "id": "ing-8806f85e",
    "name": "سبزیجات معطر به مقدار لازم",
    "normalizedName": "سبزیجات معطر به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات معطر به مقدار لازم"
    ]
  },
  {
    "id": "ing-84f51529",
    "name": "هویج متوسط",
    "normalizedName": "هویج متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج متوسط"
    ]
  },
  {
    "id": "ing-a17cba29",
    "name": "بلغور گندم",
    "normalizedName": "بلغور گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلغور گندم"
    ]
  },
  {
    "id": "ing-950432f6",
    "name": "عصاره مرغ",
    "normalizedName": "عصاره مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره مرغ"
    ]
  },
  {
    "id": "ing-a99f2fde",
    "name": "خامه پر چرب",
    "normalizedName": "خامه پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پر چرب"
    ]
  },
  {
    "id": "ing-cbb6e046",
    "name": "گل کلم",
    "normalizedName": "گل کلم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم"
    ]
  },
  {
    "id": "ing-a9282e43",
    "name": "نخود سبز",
    "normalizedName": "نخود سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود سبز"
    ]
  },
  {
    "id": "ing-9c065a85",
    "name": "سینه مرغ بدون استخوان",
    "normalizedName": "سینه مرغ بدون استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ بدون استخوان"
    ]
  },
  {
    "id": "ing-e0f39b28",
    "name": "شکر قهوه‌ای",
    "normalizedName": "شکر قهوه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه‌ای"
    ]
  },
  {
    "id": "ing-34b73dcc",
    "name": "پوست لیمو رنده شده",
    "normalizedName": "پوست لیمو رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیمو رنده شده"
    ]
  },
  {
    "id": "ing-437a04d7",
    "name": "آب لیمو تازه",
    "normalizedName": "اب لیمو تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو تازه"
    ]
  },
  {
    "id": "ing-53b70e35",
    "name": "شیره طلائی",
    "normalizedName": "شیره طلائی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره طلائی"
    ]
  },
  {
    "id": "ing-b0f3cc3d",
    "name": "کلم بروکلی",
    "normalizedName": "کلم بروکلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی"
    ]
  },
  {
    "id": "ing-ce299a6d",
    "name": "برگ نعنا",
    "normalizedName": "برگ نعنا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ نعنا"
    ]
  },
  {
    "id": "ing-e93bdfc5",
    "name": "بادام هندی",
    "normalizedName": "بادام هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام هندی"
    ]
  },
  {
    "id": "ing-4735c423",
    "name": "ماکارونی فرمی",
    "normalizedName": "ماکارونی فرمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی فرمی"
    ]
  },
  {
    "id": "ing-d401099b",
    "name": "ران مرغ",
    "normalizedName": "ران مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ"
    ]
  },
  {
    "id": "ing-e4771226",
    "name": "موسیر",
    "normalizedName": "موسیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موسیر"
    ]
  },
  {
    "id": "ing-94089c80",
    "name": "پنیر خامه‌ای",
    "normalizedName": "پنیر خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه‌ای"
    ]
  },
  {
    "id": "ing-5e5f05bc",
    "name": "خیارشور",
    "normalizedName": "خیارشور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیارشور"
    ]
  },
  {
    "id": "ing-bbb6b83f",
    "name": "پیاز کوچک ریز شده",
    "normalizedName": "پیاز کوچک ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک ریز شده"
    ]
  },
  {
    "id": "ing-eb3da5fb",
    "name": "کشمش پلویی",
    "normalizedName": "کشمش پلویی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش پلویی"
    ]
  },
  {
    "id": "ing-e24a8e8d",
    "name": "پیاز متوسط خرد شده",
    "normalizedName": "پیاز متوسط خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط خرد شده"
    ]
  },
  {
    "id": "ing-1a1d145d",
    "name": "شکر گرانوله",
    "normalizedName": "شکر گرانوله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر گرانوله"
    ]
  },
  {
    "id": "ing-8f1d24c0",
    "name": "دانه کنجد",
    "normalizedName": "دانه کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه کنجد"
    ]
  },
  {
    "id": "ing-e75e600a",
    "name": "آرد الک شده",
    "normalizedName": "ارد الک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد الک شده"
    ]
  },
  {
    "id": "ing-b5d99174",
    "name": "پودر گردو",
    "normalizedName": "پودر گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گردو"
    ]
  },
  {
    "id": "ing-5922e1",
    "name": "جو",
    "normalizedName": "جو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو"
    ]
  },
  {
    "id": "ing-36becf6b",
    "name": "برنج پخته",
    "normalizedName": "برنج پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج پخته"
    ]
  },
  {
    "id": "ing-2b3ba3bc",
    "name": "خیار شور",
    "normalizedName": "خیار شور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور"
    ]
  },
  {
    "id": "ing-a8bfd0ce",
    "name": "بادمجان متوسط",
    "normalizedName": "بادمجان متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان متوسط"
    ]
  },
  {
    "id": "ing-8d392f6c",
    "name": "آب میوه",
    "normalizedName": "اب میوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب میوه"
    ]
  },
  {
    "id": "ing-8cd5ec13",
    "name": "سیر تازه",
    "normalizedName": "سیر تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر تازه"
    ]
  },
  {
    "id": "ing-120f4e04",
    "name": "بادام شیرین",
    "normalizedName": "بادام شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام شیرین"
    ]
  },
  {
    "id": "ing-123c3116",
    "name": "بادام زمینی",
    "normalizedName": "بادام زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی"
    ]
  },
  {
    "id": "ing-8ea20718",
    "name": "دانه خردل",
    "normalizedName": "دانه خردل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه خردل"
    ]
  },
  {
    "id": "ing-d7a8bf8d",
    "name": "گلابی",
    "normalizedName": "گلابی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی"
    ]
  },
  {
    "id": "ing-326199a8",
    "name": "سینه مرغ پخته",
    "normalizedName": "سینه مرغ پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ پخته"
    ]
  },
  {
    "id": "ing-b5ba74ee",
    "name": "شیر عسلی",
    "normalizedName": "شیر عسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر عسلی"
    ]
  },
  {
    "id": "ing-b0922a19",
    "name": "کره بدون نمک",
    "normalizedName": "کره بدون نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بدون نمک"
    ]
  },
  {
    "id": "ing-16892d98",
    "name": "خامه صبحانه",
    "normalizedName": "خامه صبحانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه صبحانه"
    ]
  },
  {
    "id": "ing-71101f9c",
    "name": "شیر پرچرب",
    "normalizedName": "شیر پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پرچرب"
    ]
  },
  {
    "id": "ing-91235de1",
    "name": "پودر شکر",
    "normalizedName": "پودر شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر شکر"
    ]
  },
  {
    "id": "ing-d2a61249",
    "name": "ریحان تازه به مقدار لازم",
    "normalizedName": "ریحان تازه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان تازه به مقدار لازم"
    ]
  },
  {
    "id": "ing-977637f3",
    "name": "گوشت خوک",
    "normalizedName": "گوشت خوک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت خوک"
    ]
  },
  {
    "id": "ing-592065",
    "name": "سس",
    "normalizedName": "سس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس"
    ]
  },
  {
    "id": "ing-383bf98b",
    "name": "گوشت گوسفند یا گاو",
    "normalizedName": "گوشت گوسفند یا گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفند یا گاو"
    ]
  },
  {
    "id": "ing-326d35da",
    "name": "سینه مرغ کامل",
    "normalizedName": "سینه مرغ کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ کامل"
    ]
  },
  {
    "id": "ing-9e76e5d2",
    "name": "پودر خمیر مایه",
    "normalizedName": "پودر خمیر مایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خمیر مایه"
    ]
  },
  {
    "id": "ing-265fd76b",
    "name": "فلفل دلمه‌ای خرد شده",
    "normalizedName": "فلفل دلمه ای خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای خرد شده"
    ]
  },
  {
    "id": "ing-665f2e23",
    "name": "پوره سیب زمینی",
    "normalizedName": "پوره سیب زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره سیب زمینی"
    ]
  },
  {
    "id": "ing-b600294f",
    "name": "پودر چیلی",
    "normalizedName": "پودر چیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر چیلی"
    ]
  },
  {
    "id": "ing-e5d4df4f",
    "name": "کنسرو لوبیا",
    "normalizedName": "کنسرو لوبیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو لوبیا"
    ]
  },
  {
    "id": "ing-93d4c1da",
    "name": "برگ ریحان تازه",
    "normalizedName": "برگ ریحان تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ریحان تازه"
    ]
  },
  {
    "id": "ing-d2300862",
    "name": "ماست ساده",
    "normalizedName": "ماست ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست ساده"
    ]
  },
  {
    "id": "ing-3657771c",
    "name": "نان ترتیلا",
    "normalizedName": "نان ترتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان ترتیلا"
    ]
  },
  {
    "id": "ing-c3afc4d",
    "name": "ماست کم چرب",
    "normalizedName": "ماست کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست کم چرب"
    ]
  },
  {
    "id": "ing-d368338",
    "name": "جعفری تازه خرد شده",
    "normalizedName": "جعفری تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه خرد شده"
    ]
  },
  {
    "id": "ing-e54e90d2",
    "name": "مخمر خشک فعال",
    "normalizedName": "مخمر خشک فعال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمر خشک فعال"
    ]
  },
  {
    "id": "ing-1ce44b0e",
    "name": "فلفل دلمه ای سبز",
    "normalizedName": "فلفل دلمه ای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای سبز"
    ]
  },
  {
    "id": "ing-5dea6dc4",
    "name": "مرغ کامل",
    "normalizedName": "مرغ کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ کامل"
    ]
  },
  {
    "id": "ing-7b21a896",
    "name": "سماق",
    "normalizedName": "سماق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سماق"
    ]
  },
  {
    "id": "ing-ad435601",
    "name": "پیاز ریز خرد شده",
    "normalizedName": "پیاز ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز ریز خرد شده"
    ]
  },
  {
    "id": "ing-cdd66697",
    "name": "نخود پخته",
    "normalizedName": "نخود پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود پخته"
    ]
  },
  {
    "id": "ing-d652bb96",
    "name": "گوجه گیلاسی",
    "normalizedName": "گوجه گیلاسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه گیلاسی"
    ]
  },
  {
    "id": "ing-77cdfc50",
    "name": "جعفری تازه و خرد شده",
    "normalizedName": "جعفری تازه و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه و خرد شده"
    ]
  },
  {
    "id": "ing-9996095",
    "name": "ماست چکیده",
    "normalizedName": "ماست چکیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست چکیده"
    ]
  },
  {
    "id": "ing-5d0d0ac8",
    "name": "گردو پودر شده",
    "normalizedName": "گردو پودر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو پودر شده"
    ]
  },
  {
    "id": "ing-5ef248ec",
    "name": "تخم مرغ زده شده",
    "normalizedName": "تخم مرغ زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ زده شده"
    ]
  },
  {
    "id": "ing-7b488272",
    "name": "پونه",
    "normalizedName": "پونه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه"
    ]
  },
  {
    "id": "ing-b6350a54",
    "name": "سس سفید",
    "normalizedName": "سس سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سفید"
    ]
  },
  {
    "id": "ing-5d6fe355",
    "name": "زعفران سائیده شده",
    "normalizedName": "زعفران سائیده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران سائیده شده"
    ]
  },
  {
    "id": "ing-b5f93c89",
    "name": "سس گوجه",
    "normalizedName": "سس گوجه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوجه"
    ]
  },
  {
    "id": "ing-6d1b41a2",
    "name": "پیاز متوسط رنده شده",
    "normalizedName": "پیاز متوسط رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط رنده شده"
    ]
  },
  {
    "id": "ing-b3abbaf7",
    "name": "مارچوبه",
    "normalizedName": "مارچوبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارچوبه"
    ]
  },
  {
    "id": "ing-fc6f8f9a",
    "name": "روغن زيتون",
    "normalizedName": "روغن زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زيتون"
    ]
  },
  {
    "id": "ing-1c2bc4f4",
    "name": "روغن یا کره",
    "normalizedName": "روغن یا کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن یا کره"
    ]
  },
  {
    "id": "ing-cc1b50f0",
    "name": "گوجه فرنگی خرد شده",
    "normalizedName": "گوجه فرنگی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی خرد شده"
    ]
  },
  {
    "id": "ing-97464900",
    "name": "نمک و فلفل سیاه تازه ساییده شده",
    "normalizedName": "نمک و فلفل سیاه تازه ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه تازه ساییده شده"
    ]
  },
  {
    "id": "ing-5dc0502f",
    "name": "لیموترش",
    "normalizedName": "لیموترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیموترش"
    ]
  },
  {
    "id": "ing-67f38537",
    "name": "آبلیمو تازه",
    "normalizedName": "ابلیمو تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو تازه"
    ]
  },
  {
    "id": "ing-257256c0",
    "name": "تن ماهی",
    "normalizedName": "تن ماهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تن ماهی"
    ]
  },
  {
    "id": "ing-2dd18007",
    "name": "نان همبرگر",
    "normalizedName": "نان همبرگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان همبرگر"
    ]
  },
  {
    "id": "ing-f6033030",
    "name": "برنج نیم دانه",
    "normalizedName": "برنج نیم دانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج نیم دانه"
    ]
  },
  {
    "id": "ing-9d474ba6",
    "name": "لوبیا چیتی",
    "normalizedName": "لوبیا چیتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا چیتی"
    ]
  },
  {
    "id": "ing-634be909",
    "name": "زعفران دم شده",
    "normalizedName": "زعفران دم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم شده"
    ]
  },
  {
    "id": "ing-a4c502e1",
    "name": "کدو سبز متوسط",
    "normalizedName": "کدو سبز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز متوسط"
    ]
  },
  {
    "id": "ing-9680b8dc",
    "name": "شیر پر چرب",
    "normalizedName": "شیر پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پر چرب"
    ]
  },
  {
    "id": "ing-b7d35eb",
    "name": "سير",
    "normalizedName": "سیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سير"
    ]
  },
  {
    "id": "ing-f3bfd8f1",
    "name": "پنیر ریکوتا",
    "normalizedName": "پنیر ریکوتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا"
    ]
  },
  {
    "id": "ing-376c9628",
    "name": "مغز پسته",
    "normalizedName": "مغز پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز پسته"
    ]
  },
  {
    "id": "ing-b5a86d23",
    "name": "پودر میخک",
    "normalizedName": "پودر میخک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر میخک"
    ]
  },
  {
    "id": "ing-f7ecd41b",
    "name": "شیر نارگیل",
    "normalizedName": "شیر نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نارگیل"
    ]
  },
  {
    "id": "ing-67f7c46f",
    "name": "پودر بادام",
    "normalizedName": "پودر بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر بادام"
    ]
  },
  {
    "id": "ing-dae13fb4",
    "name": "توت فرنگی خرد شده",
    "normalizedName": "توت فرنگی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی خرد شده"
    ]
  },
  {
    "id": "ing-57782d3a",
    "name": "چیپس شکلاتی",
    "normalizedName": "چیپس شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی"
    ]
  },
  {
    "id": "ing-d7726501",
    "name": "کمپوت آناناس",
    "normalizedName": "کمپوت اناناس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کمپوت آناناس"
    ]
  },
  {
    "id": "ing-3da66dc0",
    "name": "شکلات سفید",
    "normalizedName": "شکلات سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید"
    ]
  },
  {
    "id": "ing-e0e0b9be",
    "name": "بستنی",
    "normalizedName": "بستنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی"
    ]
  },
  {
    "id": "ing-32d3ab58",
    "name": "آب داغ",
    "normalizedName": "اب داغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب داغ"
    ]
  },
  {
    "id": "ing-5a7c53a7",
    "name": "پودر کاکائو غیر شیرین",
    "normalizedName": "پودر کاکائو غیر شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو غیر شیرین"
    ]
  },
  {
    "id": "ing-5dd41a25",
    "name": "خمیر تارت",
    "normalizedName": "خمیر تارت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر تارت"
    ]
  },
  {
    "id": "ing-7b476323",
    "name": "میوه",
    "normalizedName": "میوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه"
    ]
  },
  {
    "id": "ing-4e8a75b9",
    "name": "بیسکوییت",
    "normalizedName": "بیسکوییت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت"
    ]
  },
  {
    "id": "ing-484fbbb4",
    "name": "پودر قند مقداری",
    "normalizedName": "پودر قند مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند مقداری"
    ]
  },
  {
    "id": "ing-14fead7e",
    "name": "خمیر پیتزا",
    "normalizedName": "خمیر پیتزا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پیتزا"
    ]
  },
  {
    "id": "ing-1d960b95",
    "name": "سویا سس",
    "normalizedName": "سویا سس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سویا سس"
    ]
  },
  {
    "id": "ing-becc99a0",
    "name": "ماهی تن",
    "normalizedName": "ماهی تن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی تن"
    ]
  },
  {
    "id": "ing-935cee34",
    "name": "برگ نعناع",
    "normalizedName": "برگ نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ نعناع"
    ]
  },
  {
    "id": "ing-352d60c0",
    "name": "ادویه‌های مراکشی",
    "normalizedName": "ادویه های مراکشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌های مراکشی"
    ]
  },
  {
    "id": "ing-2fc7503a",
    "name": "ماکارونی",
    "normalizedName": "ماکارونی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی"
    ]
  },
  {
    "id": "ing-eb4209b2",
    "name": "نودلز",
    "normalizedName": "نودلز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودلز"
    ]
  },
  {
    "id": "ing-c6e07c2a",
    "name": "آرد 1 و نیم",
    "normalizedName": "ارد 1 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 1 و نیم"
    ]
  },
  {
    "id": "ing-b1d8bf28",
    "name": "نمک نوک",
    "normalizedName": "نمک نوک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نوک"
    ]
  },
  {
    "id": "ing-bc5b3fbb",
    "name": "اگر شیره پس از خنک شدن سریع از  نریخت یعنی که شربتش قوام آمده است.",
    "normalizedName": "اگر شیره پس از خنک شدن سریع از نریخت یعنی که شربتش قوام امده است.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اگر شیره پس از خنک شدن سریع از  نریخت یعنی که شربتش قوام آمده است."
    ]
  },
  {
    "id": "ing-84518685",
    "name": "آرد 1 و",
    "normalizedName": "ارد 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 1 و"
    ]
  },
  {
    "id": "ing-97ead202",
    "name": "سینه مرغ بدون پوست و استخوان",
    "normalizedName": "سینه مرغ بدون پوست و استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ بدون پوست و استخوان"
    ]
  },
  {
    "id": "ing-f5663e86",
    "name": "پنیر موزورلا رنده شده",
    "normalizedName": "پنیر موزورلا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزورلا رنده شده"
    ]
  },
  {
    "id": "ing-1b374cd8",
    "name": "خمیر یوفکا",
    "normalizedName": "خمیر یوفکا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر یوفکا"
    ]
  },
  {
    "id": "ing-f51fe4b7",
    "name": "کره سرد",
    "normalizedName": "کره سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره سرد"
    ]
  },
  {
    "id": "ing-b977b123",
    "name": "فلفل دلمه‌ای قرمز",
    "normalizedName": "فلفل دلمه ای قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای قرمز"
    ]
  },
  {
    "id": "ing-8dc10e42",
    "name": "برگ ریحان",
    "normalizedName": "برگ ریحان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ریحان"
    ]
  },
  {
    "id": "ing-80c437c7",
    "name": "ادویه ایتالیایی",
    "normalizedName": "ادویه ایتالیایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه ایتالیایی"
    ]
  },
  {
    "id": "ing-612de57c",
    "name": "عصاره سبزیجات",
    "normalizedName": "عصاره سبزیجات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره سبزیجات"
    ]
  },
  {
    "id": "ing-1bf34758",
    "name": "ریحان خرد شده",
    "normalizedName": "ریحان خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان خرد شده"
    ]
  },
  {
    "id": "ing-d4531901",
    "name": "برگ نعنا خرد شده",
    "normalizedName": "برگ نعنا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ نعنا خرد شده"
    ]
  },
  {
    "id": "ing-17fccc72",
    "name": "تخم مرغ هم زده",
    "normalizedName": "تخم مرغ هم زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ هم زده"
    ]
  },
  {
    "id": "ing-a6a3a84e",
    "name": "هویج بزرگ",
    "normalizedName": "هویج بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج بزرگ"
    ]
  },
  {
    "id": "ing-54629927",
    "name": "خلال پوست پرتقال",
    "normalizedName": "خلال پوست پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پوست پرتقال"
    ]
  },
  {
    "id": "ing-7b80855b",
    "name": "نعنا",
    "normalizedName": "نعنا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا"
    ]
  },
  {
    "id": "ing-b613ee0a",
    "name": "سس پستو",
    "normalizedName": "سس پستو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس پستو"
    ]
  },
  {
    "id": "ing-b591d4d9",
    "name": "پودر خردل",
    "normalizedName": "پودر خردل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خردل"
    ]
  },
  {
    "id": "ing-a44ef92e",
    "name": "فلفل قرمز خشک شده",
    "normalizedName": "فلفل قرمز خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز خشک شده"
    ]
  },
  {
    "id": "ing-6bfec46d",
    "name": "کدو حلوایی",
    "normalizedName": "کدو حلوایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی"
    ]
  },
  {
    "id": "ing-5b2a6d2a",
    "name": "گل کلم خرد شده",
    "normalizedName": "گل کلم خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم خرد شده"
    ]
  },
  {
    "id": "ing-b240b8ad",
    "name": "سس مارینارا",
    "normalizedName": "سس مارینارا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مارینارا"
    ]
  },
  {
    "id": "ing-109186e9",
    "name": "پنیر موزارلا رنده شده",
    "normalizedName": "پنیر موزارلا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلا رنده شده"
    ]
  },
  {
    "id": "ing-ece5cc19",
    "name": "پودر پاپریکا",
    "normalizedName": "پودر پاپریکا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پاپریکا"
    ]
  },
  {
    "id": "ing-4d3f458f",
    "name": "لوبیا سبز خرد شده",
    "normalizedName": "لوبیا سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سبز خرد شده"
    ]
  },
  {
    "id": "ing-5d317c6f",
    "name": "هل سبز",
    "normalizedName": "هل سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هل سبز"
    ]
  },
  {
    "id": "ing-138a4c36",
    "name": "شوید خرد شده",
    "normalizedName": "شوید خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید خرد شده"
    ]
  },
  {
    "id": "ing-753551a4",
    "name": "جوانه گندم",
    "normalizedName": "جوانه گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوانه گندم"
    ]
  },
  {
    "id": "ing-2a6c80f4",
    "name": "شنبلیله",
    "normalizedName": "شنبلیله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شنبلیله"
    ]
  },
  {
    "id": "ing-7c8b64ab",
    "name": "آرد سمولینا",
    "normalizedName": "ارد سمولینا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سمولینا"
    ]
  },
  {
    "id": "ing-2ddf3607",
    "name": "فلفل و نمک",
    "normalizedName": "فلفل و نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و نمک"
    ]
  },
  {
    "id": "ing-3e3b9beb",
    "name": "آرد چند منظوره (ساده)",
    "normalizedName": "ارد چند منظوره (ساده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد چند منظوره (ساده)"
    ]
  },
  {
    "id": "ing-b5f40e0c",
    "name": "سس ماهی",
    "normalizedName": "سس ماهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس ماهی"
    ]
  },
  {
    "id": "ing-8df96817",
    "name": "نمک به میزان دلخواه",
    "normalizedName": "نمک به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک به میزان دلخواه"
    ]
  },
  {
    "id": "ing-cb651fdc",
    "name": "ماهی قزل آلا",
    "normalizedName": "ماهی قزل الا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی قزل آلا"
    ]
  },
  {
    "id": "ing-900f1bd",
    "name": "فلفل به میزان دلخواه",
    "normalizedName": "فلفل به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل به میزان دلخواه"
    ]
  },
  {
    "id": "ing-904946b9",
    "name": "ژامبون",
    "normalizedName": "ژامبون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون"
    ]
  },
  {
    "id": "ing-766f2b4f",
    "name": "پنیر گودا",
    "normalizedName": "پنیر گودا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر گودا"
    ]
  },
  {
    "id": "ing-ff290240",
    "name": "اسفناج پخته",
    "normalizedName": "اسفناج پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج پخته"
    ]
  },
  {
    "id": "ing-4708f51",
    "name": "کلم بروکلی خرد شده",
    "normalizedName": "کلم بروکلی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی خرد شده"
    ]
  },
  {
    "id": "ing-51d7eb99",
    "name": "سیر داغ",
    "normalizedName": "سیر داغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر داغ"
    ]
  },
  {
    "id": "ing-b705c115",
    "name": "نمک و فلفل مقداری",
    "normalizedName": "نمک و فلفل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل مقداری"
    ]
  },
  {
    "id": "ing-d0fc436d",
    "name": "نمك و فلفل مقدار لازم",
    "normalizedName": "نمک و فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك و فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-64d16165",
    "name": "زعفران دمکرده",
    "normalizedName": "زعفران دمکرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دمکرده"
    ]
  },
  {
    "id": "ing-9ef228e7",
    "name": "ذرت کنسروی",
    "normalizedName": "ذرت کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت کنسروی"
    ]
  },
  {
    "id": "ing-33c04250",
    "name": "خیار شور خرد شده",
    "normalizedName": "خیار شور خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور خرد شده"
    ]
  },
  {
    "id": "ing-7b3a37bb",
    "name": "ارده",
    "normalizedName": "ارده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارده"
    ]
  },
  {
    "id": "ing-df042dfd",
    "name": "نمک مقداری",
    "normalizedName": "نمک مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک مقداری"
    ]
  },
  {
    "id": "ing-e0e668eb",
    "name": "باقلا",
    "normalizedName": "باقلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقلا"
    ]
  },
  {
    "id": "ing-f62afb71",
    "name": "خامه ترش یا ماست",
    "normalizedName": "خامه ترش یا ماست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش یا ماست"
    ]
  },
  {
    "id": "ing-879a5fc7",
    "name": "روغن و نمک به مقدار لازم",
    "normalizedName": "روغن و نمک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و نمک به مقدار لازم"
    ]
  },
  {
    "id": "ing-d40c2845",
    "name": "زنجبیل تازه",
    "normalizedName": "زنجبیل تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه"
    ]
  },
  {
    "id": "ing-cb6b0a05",
    "name": "نمک مقدار لازم",
    "normalizedName": "نمک مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک مقدار لازم"
    ]
  },
  {
    "id": "ing-65a009ce",
    "name": "خمیر مایه فوری",
    "normalizedName": "خمیر مایه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مایه فوری"
    ]
  },
  {
    "id": "ing-b4afe445",
    "name": "روغن به مقدار لازم",
    "normalizedName": "روغن به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن به مقدار لازم"
    ]
  },
  {
    "id": "ing-b7dd00e",
    "name": "آلو",
    "normalizedName": "الو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو"
    ]
  },
  {
    "id": "ing-1a2d1f9a",
    "name": "سرکه برنج",
    "normalizedName": "سرکه برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه برنج"
    ]
  },
  {
    "id": "ing-1f071b25",
    "name": "هندوانه",
    "normalizedName": "هندوانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه"
    ]
  },
  {
    "id": "ing-d4c3c0f2",
    "name": "پنیر خامه ای یا ماسکارپونه",
    "normalizedName": "پنیر خامه ای یا ماسکارپونه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای یا ماسکارپونه"
    ]
  },
  {
    "id": "ing-7ecc0602",
    "name": "نخود فرنگی پخته",
    "normalizedName": "نخود فرنگی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی پخته"
    ]
  },
  {
    "id": "ing-62d4850b",
    "name": "دانه خشخاش",
    "normalizedName": "دانه خشخاش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه خشخاش"
    ]
  },
  {
    "id": "ing-532ad68",
    "name": "آرد سوخاری یا خرده نان",
    "normalizedName": "ارد سوخاری یا خرده نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری یا خرده نان"
    ]
  },
  {
    "id": "ing-db8bcf73",
    "name": "بستنی وانیلی",
    "normalizedName": "بستنی وانیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی وانیلی"
    ]
  },
  {
    "id": "ing-da4d45eb",
    "name": "کاکائو",
    "normalizedName": "کاکائو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاکائو"
    ]
  },
  {
    "id": "ing-c171d3b3",
    "name": "وانیل مایع",
    "normalizedName": "وانیل مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل مایع"
    ]
  },
  {
    "id": "ing-79824baf",
    "name": "تخم شربتی",
    "normalizedName": "تخم شربتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم شربتی"
    ]
  },
  {
    "id": "ing-95b8cc68",
    "name": "رنگ خوراکی",
    "normalizedName": "رنگ خوراکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی"
    ]
  },
  {
    "id": "ing-844b71d0",
    "name": "آرد کیک",
    "normalizedName": "ارد کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد کیک"
    ]
  },
  {
    "id": "ing-47ff183b",
    "name": "قهوه فوری",
    "normalizedName": "قهوه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه فوری"
    ]
  },
  {
    "id": "ing-1f70176c",
    "name": "مارشمالو",
    "normalizedName": "مارشمالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارشمالو"
    ]
  },
  {
    "id": "ing-d435fc1",
    "name": "شیر سرد",
    "normalizedName": "شیر سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر سرد"
    ]
  },
  {
    "id": "ing-a9a81fa8",
    "name": "خامه ی غلیظ",
    "normalizedName": "خامه ی غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ"
    ]
  },
  {
    "id": "ing-f9d045d4",
    "name": "عصاره یا اسانس وانیل",
    "normalizedName": "عصاره یا اسانس وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره یا اسانس وانیل"
    ]
  },
  {
    "id": "ing-ab5396e6",
    "name": "شکر شیرینی پزی",
    "normalizedName": "شکر شیرینی پزی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر شیرینی پزی"
    ]
  },
  {
    "id": "ing-c85047ab",
    "name": "ژله آلوورا",
    "normalizedName": "ژله الوورا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله آلوورا"
    ]
  },
  {
    "id": "ing-769cffa2",
    "name": "رنگ خوراکی مقدار لازم",
    "normalizedName": "رنگ خوراکی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی مقدار لازم"
    ]
  },
  {
    "id": "ing-6db02345",
    "name": "فلفل و زردچوبه به مقدار لازم",
    "normalizedName": "فلفل و زردچوبه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و زردچوبه به مقدار لازم"
    ]
  },
  {
    "id": "ing-6bfddbbb",
    "name": "سبزیجات معطر",
    "normalizedName": "سبزیجات معطر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات معطر"
    ]
  },
  {
    "id": "ing-4595c0da",
    "name": "خمیرمایه",
    "normalizedName": "خمیرمایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیرمایه"
    ]
  },
  {
    "id": "ing-7b21c175",
    "name": "سویا",
    "normalizedName": "سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سویا"
    ]
  },
  {
    "id": "ing-d586da99",
    "name": "گوشت گاو یا مرغ",
    "normalizedName": "گوشت گاو یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گاو یا مرغ"
    ]
  },
  {
    "id": "ing-5a987080",
    "name": "گوشت مرغ یا گوشت گاو",
    "normalizedName": "گوشت مرغ یا گوشت گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ یا گوشت گاو"
    ]
  },
  {
    "id": "ing-7ae37bd6",
    "name": "چربی",
    "normalizedName": "چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چربی"
    ]
  },
  {
    "id": "ing-21c6d732",
    "name": "سس باربیکیو",
    "normalizedName": "سس باربیکیو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس باربیکیو"
    ]
  },
  {
    "id": "ing-dfc456b4",
    "name": "ریحان",
    "normalizedName": "ریحان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان"
    ]
  },
  {
    "id": "ing-5513e5",
    "name": "گوشت مرغ یا گوسفند",
    "normalizedName": "گوشت مرغ یا گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ یا گوسفند"
    ]
  },
  {
    "id": "ing-32d33a98",
    "name": "آب نصف",
    "normalizedName": "اب نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نصف"
    ]
  },
  {
    "id": "ing-44a44846",
    "name": "پنیر موزارلای",
    "normalizedName": "پنیر موزارلای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلای"
    ]
  },
  {
    "id": "ing-bb5c9b35",
    "name": "تره خرد شده",
    "normalizedName": "تره خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره خرد شده"
    ]
  },
  {
    "id": "ing-bdd4b63e",
    "name": "ساقه کرفس",
    "normalizedName": "ساقه کرفس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه کرفس"
    ]
  },
  {
    "id": "ing-b84af871",
    "name": "ماست یونانی",
    "normalizedName": "ماست یونانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یونانی"
    ]
  },
  {
    "id": "ing-49353b4a",
    "name": "موسیر خرد شده",
    "normalizedName": "موسیر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موسیر خرد شده"
    ]
  },
  {
    "id": "ing-1cac5361",
    "name": "پیاز رنده شده",
    "normalizedName": "پیاز رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز رنده شده"
    ]
  },
  {
    "id": "ing-6dad13ee",
    "name": "تخم‌مرغ بزرگ",
    "normalizedName": "تخم مرغ بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم‌مرغ بزرگ"
    ]
  },
  {
    "id": "ing-27d82519",
    "name": "پودر جوز هندی",
    "normalizedName": "پودر جوز هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر جوز هندی"
    ]
  },
  {
    "id": "ing-bfe949bb",
    "name": "آویشن خشک شده",
    "normalizedName": "اویشن خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن خشک شده"
    ]
  },
  {
    "id": "ing-69e80d65",
    "name": "پنیر موزارلای رنده شده",
    "normalizedName": "پنیر موزارلای رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلای رنده شده"
    ]
  },
  {
    "id": "ing-e9c36b72",
    "name": "خیار متوسط",
    "normalizedName": "خیار متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار متوسط"
    ]
  },
  {
    "id": "ing-b51cb848",
    "name": "گل کلم کوچک",
    "normalizedName": "گل کلم کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم کوچک"
    ]
  },
  {
    "id": "ing-6f5efae7",
    "name": "آرد سلف رایزینگ",
    "normalizedName": "ارد سلف رایزینگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سلف رایزینگ"
    ]
  },
  {
    "id": "ing-691bae57",
    "name": "پیاز خلال شده",
    "normalizedName": "پیاز خلال شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز خلال شده"
    ]
  },
  {
    "id": "ing-724dc159",
    "name": "بروکلی خرد شده",
    "normalizedName": "بروکلی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بروکلی خرد شده"
    ]
  },
  {
    "id": "ing-ba041d93",
    "name": "سیاه دانه",
    "normalizedName": "سیاه دانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیاه دانه"
    ]
  },
  {
    "id": "ing-b83710aa",
    "name": "پیاز قرمز خرد شده",
    "normalizedName": "پیاز قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز خرد شده"
    ]
  },
  {
    "id": "ing-9ad9a011",
    "name": "رنده پوست پرتقال",
    "normalizedName": "رنده پوست پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست پرتقال"
    ]
  },
  {
    "id": "ing-eebc8059",
    "name": "خرده نان یا پودر سوخاری",
    "normalizedName": "خرده نان یا پودر سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده نان یا پودر سوخاری"
    ]
  },
  {
    "id": "ing-c29a866a",
    "name": "روغن زیتون بکر",
    "normalizedName": "روغن زیتون بکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون بکر"
    ]
  },
  {
    "id": "ing-526075cf",
    "name": "فلفل دلمه ای قرمز خرد شده",
    "normalizedName": "فلفل دلمه ای قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز خرد شده"
    ]
  },
  {
    "id": "ing-80c9512b",
    "name": "آب مرغ یا سبزیجات",
    "normalizedName": "اب مرغ یا سبزیجات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب مرغ یا سبزیجات"
    ]
  },
  {
    "id": "ing-5a9136df",
    "name": "رشته پلویی",
    "normalizedName": "رشته پلویی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته پلویی"
    ]
  },
  {
    "id": "ing-a8334c2c",
    "name": "آویشن تازه",
    "normalizedName": "اویشن تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن تازه"
    ]
  },
  {
    "id": "ing-e2966e12",
    "name": "تخم مرغ کمی هم زده",
    "normalizedName": "تخم مرغ کمی هم زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ کمی هم زده"
    ]
  },
  {
    "id": "ing-32f9671f",
    "name": "شیر کم چرب",
    "normalizedName": "شیر کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر کم چرب"
    ]
  },
  {
    "id": "ing-48e2cbbc",
    "name": "آرد همه منظوره",
    "normalizedName": "ارد همه منظوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد همه منظوره"
    ]
  },
  {
    "id": "ing-59236a",
    "name": "به",
    "normalizedName": "به",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به"
    ]
  },
  {
    "id": "ing-6fc40002",
    "name": "فیله ماهی",
    "normalizedName": "فیله ماهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی"
    ]
  },
  {
    "id": "ing-bc60667a",
    "name": "آرد مخمر دار",
    "normalizedName": "ارد مخمر دار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد مخمر دار"
    ]
  },
  {
    "id": "ing-9f7ab047",
    "name": "دانه ذرت",
    "normalizedName": "دانه ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ذرت"
    ]
  },
  {
    "id": "ing-48a88906",
    "name": "خمیر پای",
    "normalizedName": "خمیر پای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پای"
    ]
  },
  {
    "id": "ing-6a3fe56d",
    "name": "پنیر سوئیسی رنده شده",
    "normalizedName": "پنیر سوئیسی رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر سوئیسی رنده شده"
    ]
  },
  {
    "id": "ing-5b39e57e",
    "name": "پیاز سرخ کرده",
    "normalizedName": "پیاز سرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز سرخ کرده"
    ]
  },
  {
    "id": "ing-3e26481f",
    "name": "هویج خلال شده",
    "normalizedName": "هویج خلال شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج خلال شده"
    ]
  },
  {
    "id": "ing-62384642",
    "name": "بادمجان قلمی",
    "normalizedName": "بادمجان قلمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان قلمی"
    ]
  },
  {
    "id": "ing-7c3352b1",
    "name": "پیاز ریز شده",
    "normalizedName": "پیاز ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز ریز شده"
    ]
  },
  {
    "id": "ing-c970a2f",
    "name": "دانه هل",
    "normalizedName": "دانه هل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه هل"
    ]
  },
  {
    "id": "ing-731c4ed2",
    "name": "پیاز متوسط ریز شده",
    "normalizedName": "پیاز متوسط ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط ریز شده"
    ]
  },
  {
    "id": "ing-7afd6472",
    "name": "پیاز داغ عسلی",
    "normalizedName": "پیاز داغ عسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز داغ عسلی"
    ]
  },
  {
    "id": "ing-47671310",
    "name": "کاهو پیچ",
    "normalizedName": "کاهو پیچ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو پیچ"
    ]
  },
  {
    "id": "ing-2355e8fe",
    "name": "ترشی زنجبیل",
    "normalizedName": "ترشی زنجبیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترشی زنجبیل"
    ]
  },
  {
    "id": "ing-33dff1ce",
    "name": "آبغوره",
    "normalizedName": "ابغوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبغوره"
    ]
  },
  {
    "id": "ing-be22dd8d",
    "name": "زرده ی تخم مرغ",
    "normalizedName": "زرده ی تخم مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده ی تخم مرغ"
    ]
  },
  {
    "id": "ing-60197ef0",
    "name": "سفیده ی تخم مرغ",
    "normalizedName": "سفیده ی تخم مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده ی تخم مرغ"
    ]
  },
  {
    "id": "ing-14ea79a8",
    "name": "مرغ متوسط",
    "normalizedName": "مرغ متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ متوسط"
    ]
  },
  {
    "id": "ing-ba5068c4",
    "name": "آب لیمو ترش بزرگ",
    "normalizedName": "اب لیمو ترش بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو ترش بزرگ"
    ]
  },
  {
    "id": "ing-e9f5b28",
    "name": "خلال پرتقال",
    "normalizedName": "خلال پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پرتقال"
    ]
  },
  {
    "id": "ing-5b52728a",
    "name": "نمک و زردچوبه",
    "normalizedName": "نمک و زردچوبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و زردچوبه"
    ]
  },
  {
    "id": "ing-eb913682",
    "name": "نعناع",
    "normalizedName": "نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع"
    ]
  },
  {
    "id": "ing-570253e9",
    "name": "ذوب شده",
    "normalizedName": "ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذوب شده"
    ]
  },
  {
    "id": "ing-19da528d",
    "name": "سرکه قرمز",
    "normalizedName": "سرکه قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه قرمز"
    ]
  },
  {
    "id": "ing-1022aec2",
    "name": "شوید تازه",
    "normalizedName": "شوید تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید تازه"
    ]
  },
  {
    "id": "ing-41124cfd",
    "name": "لیمو ارگانیک",
    "normalizedName": "لیمو ارگانیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ارگانیک"
    ]
  },
  {
    "id": "ing-5a6ea7e7",
    "name": "آویشن خشک",
    "normalizedName": "اویشن خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن خشک"
    ]
  },
  {
    "id": "ing-cefa344b",
    "name": "رازیانه",
    "normalizedName": "رازیانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رازیانه"
    ]
  },
  {
    "id": "ing-91e2963b",
    "name": "سیب زمینی تازه",
    "normalizedName": "سیب زمینی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی تازه"
    ]
  },
  {
    "id": "ing-55a28357",
    "name": "خردل ساییده نشده",
    "normalizedName": "خردل ساییده نشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خردل ساییده نشده"
    ]
  },
  {
    "id": "ing-43b46ada",
    "name": "گوجه فرنگی رسیده",
    "normalizedName": "گوجه فرنگی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی رسیده"
    ]
  },
  {
    "id": "ing-428ee627",
    "name": "ریحان خشک",
    "normalizedName": "ریحان خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان خشک"
    ]
  },
  {
    "id": "ing-450e7c53",
    "name": "آب گوجه فرنگی",
    "normalizedName": "اب گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوجه فرنگی"
    ]
  },
  {
    "id": "ing-fefe0785",
    "name": "اسفناج تازه",
    "normalizedName": "اسفناج تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج تازه"
    ]
  },
  {
    "id": "ing-6dccaf3d",
    "name": "نان تست خرد شده",
    "normalizedName": "نان تست خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست خرد شده"
    ]
  },
  {
    "id": "ing-55b3ace",
    "name": "تخم مرغ کمی هم زده شده",
    "normalizedName": "تخم مرغ کمی هم زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ کمی هم زده شده"
    ]
  },
  {
    "id": "ing-151ee40e",
    "name": "ماست پرچرب",
    "normalizedName": "ماست پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست پرچرب"
    ]
  },
  {
    "id": "ing-7544f4a8",
    "name": "آبلیمو یا سرکه",
    "normalizedName": "ابلیمو یا سرکه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو یا سرکه"
    ]
  },
  {
    "id": "ing-adae3aae",
    "name": "شوید تازه خرد شده",
    "normalizedName": "شوید تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید تازه خرد شده"
    ]
  },
  {
    "id": "ing-e8d70a31",
    "name": "مارگارین یا کره",
    "normalizedName": "مارگارین یا کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارگارین یا کره"
    ]
  },
  {
    "id": "ing-3033003a",
    "name": "برنج خام",
    "normalizedName": "برنج خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج خام"
    ]
  },
  {
    "id": "ing-6f997b54",
    "name": "قارچ متوسط",
    "normalizedName": "قارچ متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ متوسط"
    ]
  },
  {
    "id": "ing-b7e6493",
    "name": "ماش",
    "normalizedName": "ماش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماش"
    ]
  },
  {
    "id": "ing-99cfca3e",
    "name": "ماست خامه ای",
    "normalizedName": "ماست خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست خامه ای"
    ]
  },
  {
    "id": "ing-b8f63748",
    "name": "ماست یا دوغ",
    "normalizedName": "ماست یا دوغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یا دوغ"
    ]
  },
  {
    "id": "ing-48dfae92",
    "name": "نمک و فلفل سیاه مقدار لازم",
    "normalizedName": "نمک و فلفل سیاه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه مقدار لازم"
    ]
  },
  {
    "id": "ing-a45c8102",
    "name": "مرغ چرخ کرده",
    "normalizedName": "مرغ چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ چرخ کرده"
    ]
  },
  {
    "id": "ing-d977bbbf",
    "name": "کره به مقدار لازم",
    "normalizedName": "کره به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره به مقدار لازم"
    ]
  },
  {
    "id": "ing-f8552894",
    "name": "خرمالو",
    "normalizedName": "خرمالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرمالو"
    ]
  },
  {
    "id": "ing-bc858163",
    "name": "نعنا تازه",
    "normalizedName": "نعنا تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا تازه"
    ]
  },
  {
    "id": "ing-86456ad8",
    "name": "گوشت قرمز",
    "normalizedName": "گوشت قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت قرمز"
    ]
  },
  {
    "id": "ing-508daa13",
    "name": "سبزی آش",
    "normalizedName": "سبزی اش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی آش"
    ]
  },
  {
    "id": "ing-d789a861",
    "name": "چغندر",
    "normalizedName": "چغندر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر"
    ]
  },
  {
    "id": "ing-9087ca12",
    "name": "جعفری خرد شده مقداری",
    "normalizedName": "جعفری خرد شده مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خرد شده مقداری"
    ]
  },
  {
    "id": "ing-6db04c2a",
    "name": "تخم مرغ درشت",
    "normalizedName": "تخم مرغ درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ درشت"
    ]
  },
  {
    "id": "ing-ce1d3191",
    "name": "سیب متوسط",
    "normalizedName": "سیب متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب متوسط"
    ]
  },
  {
    "id": "ing-f196d287",
    "name": "نمک و فلفل و زردچوبه به مقدار لازم",
    "normalizedName": "نمک و فلفل و زردچوبه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل و زردچوبه به مقدار لازم"
    ]
  },
  {
    "id": "ing-8c451987",
    "name": "نمک و روغن به مقدار لازم",
    "normalizedName": "نمک و روغن به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و روغن به مقدار لازم"
    ]
  },
  {
    "id": "ing-9c5f0327",
    "name": "زردچوبه و نمک و فلفل به مقدار لازم",
    "normalizedName": "زردچوبه و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-8868161e",
    "name": "رنگ خوراکی قرمز مقداری",
    "normalizedName": "رنگ خوراکی قرمز مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی قرمز مقداری"
    ]
  },
  {
    "id": "ing-b380525d",
    "name": "ادویه کاری",
    "normalizedName": "ادویه کاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه کاری"
    ]
  },
  {
    "id": "ing-71988cce",
    "name": "مرغ چرخ شده",
    "normalizedName": "مرغ چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ چرخ شده"
    ]
  },
  {
    "id": "ing-3860b798",
    "name": "گوجه فرنگی بزرگ",
    "normalizedName": "گوجه فرنگی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی بزرگ"
    ]
  },
  {
    "id": "ing-678425be",
    "name": "جعفری مقداری",
    "normalizedName": "جعفری مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری مقداری"
    ]
  },
  {
    "id": "ing-de8f08d6",
    "name": "وانیل مقداری",
    "normalizedName": "وانیل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل مقداری"
    ]
  },
  {
    "id": "ing-aaeed7ad",
    "name": "زردچوبه به مقدار لازم",
    "normalizedName": "زردچوبه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه به مقدار لازم"
    ]
  },
  {
    "id": "ing-eaf7c266",
    "name": "روغن زیتون یا مایع",
    "normalizedName": "روغن زیتون یا مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا مایع"
    ]
  },
  {
    "id": "ing-3437e70f",
    "name": "آبليمو",
    "normalizedName": "ابلیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبليمو"
    ]
  },
  {
    "id": "ing-e0a5240c",
    "name": "جعفري",
    "normalizedName": "جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفري"
    ]
  },
  {
    "id": "ing-d0ceab83",
    "name": "سيب زميني",
    "normalizedName": "سیب زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سيب زميني"
    ]
  },
  {
    "id": "ing-b7ff06f",
    "name": "نمك",
    "normalizedName": "نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك"
    ]
  },
  {
    "id": "ing-288ecb45",
    "name": "آلبالو",
    "normalizedName": "البالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلبالو"
    ]
  },
  {
    "id": "ing-205dd66f",
    "name": "فلفل سبز تند",
    "normalizedName": "فلفل سبز تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز تند"
    ]
  },
  {
    "id": "ing-f82f18a0",
    "name": "زیتون سیاه",
    "normalizedName": "زیتون سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون سیاه"
    ]
  },
  {
    "id": "ing-49cee155",
    "name": "برگ نعنا تازه",
    "normalizedName": "برگ نعنا تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ نعنا تازه"
    ]
  },
  {
    "id": "ing-826b4467",
    "name": "تخم گشنیز",
    "normalizedName": "تخم گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم گشنیز"
    ]
  },
  {
    "id": "ing-79e61077",
    "name": "مایونز",
    "normalizedName": "مایونز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مایونز"
    ]
  },
  {
    "id": "ing-eaa36a5d",
    "name": "روغن زیتون یا کنجد",
    "normalizedName": "روغن زیتون یا کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا کنجد"
    ]
  },
  {
    "id": "ing-f3f259d7",
    "name": "قارچ درشت",
    "normalizedName": "قارچ درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ درشت"
    ]
  },
  {
    "id": "ing-9cc21330",
    "name": "برگ گشنیز",
    "normalizedName": "برگ گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ گشنیز"
    ]
  },
  {
    "id": "ing-fcff0c83",
    "name": "پودر کاکائو تلخ",
    "normalizedName": "پودر کاکائو تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو تلخ"
    ]
  },
  {
    "id": "ing-900c222e",
    "name": "پنیر خامه ای نرم شده",
    "normalizedName": "پنیر خامه ای نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای نرم شده"
    ]
  },
  {
    "id": "ing-9a9c1bde",
    "name": "موز بزرگ",
    "normalizedName": "موز بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز بزرگ"
    ]
  },
  {
    "id": "ing-df103d2c",
    "name": "شکلات سفید خرد شده",
    "normalizedName": "شکلات سفید خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید خرد شده"
    ]
  },
  {
    "id": "ing-7a88734a",
    "name": "پودر قند برای تزیین",
    "normalizedName": "پودر قند برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند برای تزیین"
    ]
  },
  {
    "id": "ing-b34385c2",
    "name": "شکر آسیاب شده",
    "normalizedName": "شکر اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر آسیاب شده"
    ]
  },
  {
    "id": "ing-b65d0e6c",
    "name": "رنگ خوراکی قرمز",
    "normalizedName": "رنگ خوراکی قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی قرمز"
    ]
  },
  {
    "id": "ing-be30975e",
    "name": "آرد بادام",
    "normalizedName": "ارد بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد بادام"
    ]
  },
  {
    "id": "ing-839b4192",
    "name": "پوره سیب",
    "normalizedName": "پوره سیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره سیب"
    ]
  },
  {
    "id": "ing-6e28406d",
    "name": "تخمه کدو",
    "normalizedName": "تخمه کدو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخمه کدو"
    ]
  },
  {
    "id": "ing-9d836138",
    "name": "چوب دارچین کوچک",
    "normalizedName": "چوب دارچین کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب دارچین کوچک"
    ]
  },
  {
    "id": "ing-86878536",
    "name": "چیپس شکلات",
    "normalizedName": "چیپس شکلات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلات"
    ]
  },
  {
    "id": "ing-eb4205e2",
    "name": "نوتلا",
    "normalizedName": "نوتلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوتلا"
    ]
  },
  {
    "id": "ing-8ee8414",
    "name": "بلوبری",
    "normalizedName": "بلوبری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلوبری"
    ]
  },
  {
    "id": "ing-5daeda32",
    "name": "خمیر فیلو",
    "normalizedName": "خمیر فیلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر فیلو"
    ]
  },
  {
    "id": "ing-5d1b4ce1",
    "name": "شکلات ساده خرد شده",
    "normalizedName": "شکلات ساده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات ساده خرد شده"
    ]
  },
  {
    "id": "ing-5e4851f6",
    "name": "پودر کاکائوی شیرین نشده",
    "normalizedName": "پودر کاکائوی شیرین نشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائوی شیرین نشده"
    ]
  },
  {
    "id": "ing-e4abb7cb",
    "name": "شکلات نیمه شیرین (ساده) خرد شده",
    "normalizedName": "شکلات نیمه شیرین (ساده) خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین (ساده) خرد شده"
    ]
  },
  {
    "id": "ing-f1071e8",
    "name": "خامه زده شده",
    "normalizedName": "خامه زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه زده شده"
    ]
  },
  {
    "id": "ing-891c64f5",
    "name": "عصاره ی وانیل",
    "normalizedName": "عصاره ی وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره ی وانیل"
    ]
  },
  {
    "id": "ing-dfce4db8",
    "name": "عصاره",
    "normalizedName": "عصاره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره"
    ]
  },
  {
    "id": "ing-d786a7e5",
    "name": "آرد معمولی",
    "normalizedName": "ارد معمولی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد معمولی"
    ]
  },
  {
    "id": "ing-e6ca160d",
    "name": "نمک نوک قاشق چایخوری",
    "normalizedName": "نمک نوک قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نوک قاشق چایخوری"
    ]
  },
  {
    "id": "ing-b9faf8b1",
    "name": "جوش شیرین یا بکینگ پودر",
    "normalizedName": "جوش شیرین یا بکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین یا بکینگ پودر"
    ]
  },
  {
    "id": "ing-102dcc73",
    "name": "پودر قهوه فوری",
    "normalizedName": "پودر قهوه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قهوه فوری"
    ]
  },
  {
    "id": "ing-b7deb79c",
    "name": "شیر یا بستنی",
    "normalizedName": "شیر یا بستنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا بستنی"
    ]
  },
  {
    "id": "ing-331668ec",
    "name": "خامه عسلی",
    "normalizedName": "خامه عسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه عسلی"
    ]
  },
  {
    "id": "ing-cf6e5b21",
    "name": "بیسکوییت شکلاتی",
    "normalizedName": "بیسکوییت شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت شکلاتی"
    ]
  },
  {
    "id": "ing-7b30105b",
    "name": "ثعلب",
    "normalizedName": "ثعلب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ثعلب"
    ]
  },
  {
    "id": "ing-74acd2c8",
    "name": "شیر یا آب",
    "normalizedName": "شیر یا اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا آب"
    ]
  },
  {
    "id": "ing-f849860e",
    "name": "خامه پاستوریزه",
    "normalizedName": "خامه پاستوریزه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پاستوریزه"
    ]
  },
  {
    "id": "ing-3990d992",
    "name": "سبزیجات خشک",
    "normalizedName": "سبزیجات خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات خشک"
    ]
  },
  {
    "id": "ing-b7d86c9",
    "name": "دال",
    "normalizedName": "دال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دال"
    ]
  },
  {
    "id": "ing-40ed660c",
    "name": "پودر فلفل قرمز به مقدار لازم",
    "normalizedName": "پودر فلفل قرمز به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل قرمز به مقدار لازم"
    ]
  },
  {
    "id": "ing-2cfee64b",
    "name": "کبد گاو",
    "normalizedName": "کبد گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کبد گاو"
    ]
  },
  {
    "id": "ing-4f1e71d1",
    "name": "آویشن به مقدار لازم",
    "normalizedName": "اویشن به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن به مقدار لازم"
    ]
  },
  {
    "id": "ing-61fedde8",
    "name": "نori (ورق‌های جلبک)",
    "normalizedName": "نori (ورق های جلبک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نori (ورق‌های جلبک)"
    ]
  },
  {
    "id": "ing-7b2f514e",
    "name": "توفو",
    "normalizedName": "توفو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توفو"
    ]
  },
  {
    "id": "ing-b19804e",
    "name": "نان تاکو",
    "normalizedName": "نان تاکو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تاکو"
    ]
  },
  {
    "id": "ing-e962e8c5",
    "name": "سس فاهیتا",
    "normalizedName": "سس فاهیتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فاهیتا"
    ]
  },
  {
    "id": "ing-383a8585",
    "name": "گوشت گوسفند یا مرغ",
    "normalizedName": "گوشت گوسفند یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفند یا مرغ"
    ]
  },
  {
    "id": "ing-e4ac9e24",
    "name": "محمول",
    "normalizedName": "محمول",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "محمول"
    ]
  },
  {
    "id": "ing-b3a0029c",
    "name": "گوشت مرغ یا گوشت گوسفند",
    "normalizedName": "گوشت مرغ یا گوشت گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ یا گوشت گوسفند"
    ]
  },
  {
    "id": "ing-da987a46",
    "name": "ادویه‌های مختلف",
    "normalizedName": "ادویه های مختلف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌های مختلف"
    ]
  },
  {
    "id": "ing-b7ffde8",
    "name": "فول",
    "normalizedName": "فول",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فول"
    ]
  },
  {
    "id": "ing-eb7f42f2",
    "name": "پیاز سرخ شده",
    "normalizedName": "پیاز سرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز سرخ شده"
    ]
  },
  {
    "id": "ing-913ddd9b",
    "name": "شکر نصف",
    "normalizedName": "شکر نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر نصف"
    ]
  },
  {
    "id": "ing-84518f07",
    "name": "آرد 3 و",
    "normalizedName": "ارد 3 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 3 و"
    ]
  },
  {
    "id": "ing-d7f46170",
    "name": "گردوی",
    "normalizedName": "گردوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردوی"
    ]
  },
  {
    "id": "ing-612bbb3f",
    "name": "نشانه قوام آمدن مربا : مقداری از شربت را در ی بریزد",
    "normalizedName": "نشانه قوام امدن مربا : مقداری از شربت را در ی بریزد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشانه قوام آمدن مربا : مقداری از شربت را در ی بریزد"
    ]
  },
  {
    "id": "ing-d7211551",
    "name": "نکته : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند.",
    "normalizedName": "نکته : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند."
    ]
  },
  {
    "id": "ing-afad29cd",
    "name": "فلفل قرمز خرد شده",
    "normalizedName": "فلفل قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز خرد شده"
    ]
  },
  {
    "id": "ing-955a50b1",
    "name": "روغن سرخ‌کردنی",
    "normalizedName": "روغن سرخ کردنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن سرخ‌کردنی"
    ]
  },
  {
    "id": "ing-f393e37",
    "name": "برنج پخته شده",
    "normalizedName": "برنج پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج پخته شده"
    ]
  },
  {
    "id": "ing-1f930547",
    "name": "سیر خردشده",
    "normalizedName": "سیر خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر خردشده"
    ]
  },
  {
    "id": "ing-7655a5a4",
    "name": "جو دو سر",
    "normalizedName": "جو دو سر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو دو سر"
    ]
  },
  {
    "id": "ing-92b2b8b",
    "name": "نخود پخته شده",
    "normalizedName": "نخود پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود پخته شده"
    ]
  },
  {
    "id": "ing-cef72ef9",
    "name": "تمر هندی",
    "normalizedName": "تمر هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمر هندی"
    ]
  },
  {
    "id": "ing-cc099d42",
    "name": "پیاز درشت",
    "normalizedName": "پیاز درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز درشت"
    ]
  },
  {
    "id": "ing-59203c",
    "name": "رب",
    "normalizedName": "رب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب"
    ]
  },
  {
    "id": "ing-b62b8f81",
    "name": "سس قرمز",
    "normalizedName": "سس قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس قرمز"
    ]
  },
  {
    "id": "ing-fdf8bc45",
    "name": "مرزنگوش خشک",
    "normalizedName": "مرزنگوش خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرزنگوش خشک"
    ]
  },
  {
    "id": "ing-5dd5c238",
    "name": "ریحان خردشده",
    "normalizedName": "ریحان خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان خردشده"
    ]
  },
  {
    "id": "ing-c5e7e4da",
    "name": "مرغ پخته خرد شده",
    "normalizedName": "مرغ پخته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پخته خرد شده"
    ]
  },
  {
    "id": "ing-9038663a",
    "name": "برنج دانه بلند",
    "normalizedName": "برنج دانه بلند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج دانه بلند"
    ]
  },
  {
    "id": "ing-830d626e",
    "name": "کدوی سبز",
    "normalizedName": "کدوی سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدوی سبز"
    ]
  },
  {
    "id": "ing-3607fa25",
    "name": "گوشت چرخ کرده گوسفندی",
    "normalizedName": "گوشت چرخ کرده گوسفندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده گوسفندی"
    ]
  },
  {
    "id": "ing-cd024cae",
    "name": "کدو حلوایی رنده شده",
    "normalizedName": "کدو حلوایی رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی رنده شده"
    ]
  },
  {
    "id": "ing-8446de5b",
    "name": "آرد نان",
    "normalizedName": "ارد نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نان"
    ]
  },
  {
    "id": "ing-b5d104a7",
    "name": "سس چیلی",
    "normalizedName": "سس چیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس چیلی"
    ]
  },
  {
    "id": "ing-62a0323c",
    "name": "سیر رنده یا ریز خرد شده",
    "normalizedName": "سیر رنده یا ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر رنده یا ریز خرد شده"
    ]
  },
  {
    "id": "ing-7c3abf2e",
    "name": "آب سبزیجات",
    "normalizedName": "اب سبزیجات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب سبزیجات"
    ]
  },
  {
    "id": "ing-26455141",
    "name": "رزماری تازه",
    "normalizedName": "رزماری تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری تازه"
    ]
  },
  {
    "id": "ing-743f7662",
    "name": "فلفل دلمه ای سبز خرد شده",
    "normalizedName": "فلفل دلمه ای سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای سبز خرد شده"
    ]
  },
  {
    "id": "ing-50ab3037",
    "name": "پونه کوهی خشک شده",
    "normalizedName": "پونه کوهی خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه کوهی خشک شده"
    ]
  },
  {
    "id": "ing-723fdb47",
    "name": "میگو پاک شده",
    "normalizedName": "میگو پاک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو پاک شده"
    ]
  },
  {
    "id": "ing-b4e3d7d",
    "name": "نان لواش",
    "normalizedName": "نان لواش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان لواش"
    ]
  },
  {
    "id": "ing-bad302",
    "name": "پرتقال متوسط",
    "normalizedName": "پرتقال متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرتقال متوسط"
    ]
  },
  {
    "id": "ing-23ff41f4",
    "name": "لیموی تازه",
    "normalizedName": "لیموی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیموی تازه"
    ]
  },
  {
    "id": "ing-d99c7b62",
    "name": "زیتون بی هسته",
    "normalizedName": "زیتون بی هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون بی هسته"
    ]
  },
  {
    "id": "ing-919e8361",
    "name": "کدو سبز رنده شده",
    "normalizedName": "کدو سبز رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز رنده شده"
    ]
  },
  {
    "id": "ing-6a3b9a6c",
    "name": "پودر وانیل",
    "normalizedName": "پودر وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر وانیل"
    ]
  },
  {
    "id": "ing-4508143",
    "name": "فلفل سیاه و آویشن",
    "normalizedName": "فلفل سیاه و اویشن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه و آویشن"
    ]
  },
  {
    "id": "ing-ca05a952",
    "name": "ساقه کرفس خرد شده",
    "normalizedName": "ساقه کرفس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه کرفس خرد شده"
    ]
  },
  {
    "id": "ing-dba1300f",
    "name": "نعنای تازه",
    "normalizedName": "نعنای تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنای تازه"
    ]
  },
  {
    "id": "ing-71bef3b",
    "name": "روغن زیتون یا روغن گیاهی",
    "normalizedName": "روغن زیتون یا روغن گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا روغن گیاهی"
    ]
  },
  {
    "id": "ing-9966f68e",
    "name": "کره یا روغن زیتون",
    "normalizedName": "کره یا روغن زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن زیتون"
    ]
  },
  {
    "id": "ing-491e4e32",
    "name": "مرغ پخته و خرد شده",
    "normalizedName": "مرغ پخته و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پخته و خرد شده"
    ]
  },
  {
    "id": "ing-f6ae159",
    "name": "کلم پیچ",
    "normalizedName": "کلم پیچ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم پیچ"
    ]
  },
  {
    "id": "ing-58cca4f9",
    "name": "آلو بخارا",
    "normalizedName": "الو بخارا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو بخارا"
    ]
  },
  {
    "id": "ing-9764724f",
    "name": "فلفل و زعفران به میزان دلخواه",
    "normalizedName": "فلفل و زعفران به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و زعفران به میزان دلخواه"
    ]
  },
  {
    "id": "ing-3c197fc9",
    "name": "کنجد بو داده",
    "normalizedName": "کنجد بو داده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد بو داده"
    ]
  },
  {
    "id": "ing-20179120",
    "name": "ژامبون گوشت",
    "normalizedName": "ژامبون گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون گوشت"
    ]
  },
  {
    "id": "ing-d43f937",
    "name": "شیر گرم",
    "normalizedName": "شیر گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر گرم"
    ]
  },
  {
    "id": "ing-573cbf34",
    "name": "سینه مرغ پخته شده",
    "normalizedName": "سینه مرغ پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ پخته شده"
    ]
  },
  {
    "id": "ing-fb0cf3a5",
    "name": "برگ اسفناج کوچک",
    "normalizedName": "برگ اسفناج کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ اسفناج کوچک"
    ]
  },
  {
    "id": "ing-7b2f94fd",
    "name": "شاهی",
    "normalizedName": "شاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شاهی"
    ]
  },
  {
    "id": "ing-8cd527cb",
    "name": "سیر درشت",
    "normalizedName": "سیر درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر درشت"
    ]
  },
  {
    "id": "ing-222ff322",
    "name": "نمک و فلفل و زردچوبه",
    "normalizedName": "نمک و فلفل و زردچوبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل و زردچوبه"
    ]
  },
  {
    "id": "ing-95575639",
    "name": "تمرهندی",
    "normalizedName": "تمرهندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمرهندی"
    ]
  },
  {
    "id": "ing-c4acc3d8",
    "name": "فلفل و دارچین",
    "normalizedName": "فلفل و دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و دارچین"
    ]
  },
  {
    "id": "ing-a51d2b79",
    "name": "جگر مرغ",
    "normalizedName": "جگر مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جگر مرغ"
    ]
  },
  {
    "id": "ing-1d1f843b",
    "name": "گوشت قیمه ای",
    "normalizedName": "گوشت قیمه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت قیمه ای"
    ]
  },
  {
    "id": "ing-4574c96a",
    "name": "پیاز بزرگ خرد شده",
    "normalizedName": "پیاز بزرگ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز بزرگ خرد شده"
    ]
  },
  {
    "id": "ing-a45a7348",
    "name": "ماهی دودی",
    "normalizedName": "ماهی دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی دودی"
    ]
  },
  {
    "id": "ing-4293fd70",
    "name": "قرص عصاره مرغ",
    "normalizedName": "قرص عصاره مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قرص عصاره مرغ"
    ]
  },
  {
    "id": "ing-d6bf35ee",
    "name": "بادام پرک تست شده",
    "normalizedName": "بادام پرک تست شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام پرک تست شده"
    ]
  },
  {
    "id": "ing-f9b8d2fa",
    "name": "سفیده تخم مرغ کمی زده شده",
    "normalizedName": "سفیده تخم مرغ کمی زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم مرغ کمی زده شده"
    ]
  },
  {
    "id": "ing-be512742",
    "name": "فلفل قرمز تند",
    "normalizedName": "فلفل قرمز تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز تند"
    ]
  },
  {
    "id": "ing-a6d473",
    "name": "دانه فلفل سیاه",
    "normalizedName": "دانه فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه فلفل سیاه"
    ]
  },
  {
    "id": "ing-619c0a77",
    "name": "لیمو ترش تازه",
    "normalizedName": "لیمو ترش تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش تازه"
    ]
  },
  {
    "id": "ing-4d708d81",
    "name": "روغن جامد",
    "normalizedName": "روغن جامد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن جامد"
    ]
  },
  {
    "id": "ing-2a89f150",
    "name": "آب نارنج یا آبغوره",
    "normalizedName": "اب نارنج یا ابغوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارنج یا آبغوره"
    ]
  },
  {
    "id": "ing-b97bbbd3",
    "name": "برگه زردآلو",
    "normalizedName": "برگه زردالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگه زردآلو"
    ]
  },
  {
    "id": "ing-52558d90",
    "name": "سیر تازه رنده شده",
    "normalizedName": "سیر تازه رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر تازه رنده شده"
    ]
  },
  {
    "id": "ing-f84e3462",
    "name": "سس قرمز تند",
    "normalizedName": "سس قرمز تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس قرمز تند"
    ]
  },
  {
    "id": "ing-5377d2b1",
    "name": "پودر رزماری",
    "normalizedName": "پودر رزماری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر رزماری"
    ]
  },
  {
    "id": "ing-e884afdf",
    "name": "مریم گلی",
    "normalizedName": "مریم گلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مریم گلی"
    ]
  },
  {
    "id": "ing-85534cf4",
    "name": "فلفل سفید",
    "normalizedName": "فلفل سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سفید"
    ]
  },
  {
    "id": "ing-83462f1b",
    "name": "کشک غلیظ",
    "normalizedName": "کشک غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشک غلیظ"
    ]
  },
  {
    "id": "ing-22dbcc4",
    "name": "رب انار ترش",
    "normalizedName": "رب انار ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب انار ترش"
    ]
  },
  {
    "id": "ing-bf62a006",
    "name": "کدو سبز بزرگ",
    "normalizedName": "کدو سبز بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز بزرگ"
    ]
  },
  {
    "id": "ing-8d80ba6e",
    "name": "آب غوره",
    "normalizedName": "اب غوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب غوره"
    ]
  },
  {
    "id": "ing-82bd61b5",
    "name": "زردچوبه و دارچین",
    "normalizedName": "زردچوبه و دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و دارچین"
    ]
  },
  {
    "id": "ing-3b1b7de1",
    "name": "سبزی (جعفری",
    "normalizedName": "سبزی (جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی (جعفری"
    ]
  },
  {
    "id": "ing-f6e1a1c2",
    "name": "نمک و زردچوبه و فلفل",
    "normalizedName": "نمک و زردچوبه و فلفل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و زردچوبه و فلفل"
    ]
  },
  {
    "id": "ing-8b96616c",
    "name": "پیازکوچک",
    "normalizedName": "پیازکوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازکوچک"
    ]
  },
  {
    "id": "ing-290f4a0c",
    "name": "تخم مرغ کمی زده شده",
    "normalizedName": "تخم مرغ کمی زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ کمی زده شده"
    ]
  },
  {
    "id": "ing-2f32f600",
    "name": "ریحان تازه خرد شده",
    "normalizedName": "ریحان تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان تازه خرد شده"
    ]
  },
  {
    "id": "ing-9666eabe",
    "name": "سیخ چوبی",
    "normalizedName": "سیخ چوبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیخ چوبی"
    ]
  },
  {
    "id": "ing-a98b3fde",
    "name": "لوبیا سبز پخته",
    "normalizedName": "لوبیا سبز پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سبز پخته"
    ]
  },
  {
    "id": "ing-7bf5ddec",
    "name": "زعفران آب شده",
    "normalizedName": "زعفران اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران آب شده"
    ]
  },
  {
    "id": "ing-e0e66fc4",
    "name": "بامیه",
    "normalizedName": "بامیه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بامیه"
    ]
  },
  {
    "id": "ing-2aee4c6",
    "name": "شکر شیرینی پزی یا خاک قند",
    "normalizedName": "شکر شیرینی پزی یا خاک قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر شیرینی پزی یا خاک قند"
    ]
  },
  {
    "id": "ing-8ed61c24",
    "name": "دانه زیره",
    "normalizedName": "دانه زیره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه زیره"
    ]
  },
  {
    "id": "ing-23382e8a",
    "name": "مغز بادام",
    "normalizedName": "مغز بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز بادام"
    ]
  },
  {
    "id": "ing-8d908653",
    "name": "آب‌گوشت",
    "normalizedName": "اب گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب‌گوشت"
    ]
  },
  {
    "id": "ing-e103d137",
    "name": "تربچه",
    "normalizedName": "تربچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تربچه"
    ]
  },
  {
    "id": "ing-8a0fd36e",
    "name": "پیاز سرخ",
    "normalizedName": "پیاز سرخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز سرخ"
    ]
  },
  {
    "id": "ing-eceb6519",
    "name": "نمک و فلفل سیاه به میزان لازم",
    "normalizedName": "نمک و فلفل سیاه به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه به میزان لازم"
    ]
  },
  {
    "id": "ing-b7d9dde",
    "name": "صدف",
    "normalizedName": "صدف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "صدف"
    ]
  },
  {
    "id": "ing-7e7ad840",
    "name": "نمک و فلفل سیاه تازه",
    "normalizedName": "نمک و فلفل سیاه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه تازه"
    ]
  },
  {
    "id": "ing-92979635",
    "name": "خیار بزرگ",
    "normalizedName": "خیار بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار بزرگ"
    ]
  },
  {
    "id": "ing-1af27041",
    "name": "آووکادوی رسیده",
    "normalizedName": "اووکادوی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آووکادوی رسیده"
    ]
  },
  {
    "id": "ing-ea06832c",
    "name": "تره فرنگی",
    "normalizedName": "تره فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره فرنگی"
    ]
  },
  {
    "id": "ing-fed7d2e",
    "name": "کدوخورشتی",
    "normalizedName": "کدوخورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدوخورشتی"
    ]
  },
  {
    "id": "ing-71240e8a",
    "name": "زعفران حل شده",
    "normalizedName": "زعفران حل شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران حل شده"
    ]
  },
  {
    "id": "ing-3405783a",
    "name": "کنسرو نخود فرنگی",
    "normalizedName": "کنسرو نخود فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو نخود فرنگی"
    ]
  },
  {
    "id": "ing-bda49553",
    "name": "گوجه فرنگی متوسط خرد شده",
    "normalizedName": "گوجه فرنگی متوسط خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی متوسط خرد شده"
    ]
  },
  {
    "id": "ing-89904224",
    "name": "پیاز قرمز کوچک خرد شده",
    "normalizedName": "پیاز قرمز کوچک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز کوچک خرد شده"
    ]
  },
  {
    "id": "ing-4f062693",
    "name": "زیتون خرد شده",
    "normalizedName": "زیتون خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون خرد شده"
    ]
  },
  {
    "id": "ing-719c56de",
    "name": "نخود فرنگی پخته شده",
    "normalizedName": "نخود فرنگی پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی پخته شده"
    ]
  },
  {
    "id": "ing-f505a65b",
    "name": "پودر سیر به میزان دلخواه",
    "normalizedName": "پودر سیر به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سیر به میزان دلخواه"
    ]
  },
  {
    "id": "ing-181d03d",
    "name": "ترخینه",
    "normalizedName": "ترخینه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترخینه"
    ]
  },
  {
    "id": "ing-5cc54547",
    "name": "سبزی آش ( تره",
    "normalizedName": "سبزی اش ( تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی آش ( تره"
    ]
  },
  {
    "id": "ing-5db743d2",
    "name": "نعنا )",
    "normalizedName": "نعنا )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا )"
    ]
  },
  {
    "id": "ing-66e0d5f5",
    "name": "برگ کرفس خرد شده",
    "normalizedName": "برگ کرفس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ کرفس خرد شده"
    ]
  },
  {
    "id": "ing-5de891b4",
    "name": "نان تست به مقدار لازم",
    "normalizedName": "نان تست به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست به مقدار لازم"
    ]
  },
  {
    "id": "ing-6f8c3fe8",
    "name": "روغن زیتون مقداری",
    "normalizedName": "روغن زیتون مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون مقداری"
    ]
  },
  {
    "id": "ing-d4d76025",
    "name": "فيله مرغ",
    "normalizedName": "فیله مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فيله مرغ"
    ]
  },
  {
    "id": "ing-3fd74915",
    "name": "سينه مرغ",
    "normalizedName": "سینه مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سينه مرغ"
    ]
  },
  {
    "id": "ing-a3b059f5",
    "name": "کره و نمك و فلفل به مقدار لازم",
    "normalizedName": "کره و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره و نمك و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-f66052fc",
    "name": "پوره گوجه فرنگی",
    "normalizedName": "پوره گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره گوجه فرنگی"
    ]
  },
  {
    "id": "ing-db544f5e",
    "name": "پای مرغ",
    "normalizedName": "پای مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پای مرغ"
    ]
  },
  {
    "id": "ing-b397b480",
    "name": "بال مرغ",
    "normalizedName": "بال مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بال مرغ"
    ]
  },
  {
    "id": "ing-e5ba5a38",
    "name": "خمیر فیلو مقدار لازم",
    "normalizedName": "خمیر فیلو مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر فیلو مقدار لازم"
    ]
  },
  {
    "id": "ing-54eada9a",
    "name": "کلم بنفش خرد شده",
    "normalizedName": "کلم بنفش خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بنفش خرد شده"
    ]
  },
  {
    "id": "ing-661053df",
    "name": "نخودفرنگی",
    "normalizedName": "نخودفرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخودفرنگی"
    ]
  },
  {
    "id": "ing-7b37d3eb",
    "name": "انبه",
    "normalizedName": "انبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه"
    ]
  },
  {
    "id": "ing-b2422301",
    "name": "کدو حلوایی خرد شده",
    "normalizedName": "کدو حلوایی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی خرد شده"
    ]
  },
  {
    "id": "ing-7b37d2b2",
    "name": "انار",
    "normalizedName": "انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انار"
    ]
  },
  {
    "id": "ing-d3d9a9ef",
    "name": "خمیر مخصوص پای مقدار لازم",
    "normalizedName": "خمیر مخصوص پای مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مخصوص پای مقدار لازم"
    ]
  },
  {
    "id": "ing-15f9d461",
    "name": "تره فرنگی یا پیازچه",
    "normalizedName": "تره فرنگی یا پیازچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره فرنگی یا پیازچه"
    ]
  },
  {
    "id": "ing-2a119806",
    "name": "زنجبیل تازه رنده شده",
    "normalizedName": "زنجبیل تازه رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه رنده شده"
    ]
  },
  {
    "id": "ing-36def7f6",
    "name": "گوشت راسته یا فیله گوسفند یا گوساله",
    "normalizedName": "گوشت راسته یا فیله گوسفند یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت راسته یا فیله گوسفند یا گوساله"
    ]
  },
  {
    "id": "ing-759dfd79",
    "name": "ماهی بدون تیغ",
    "normalizedName": "ماهی بدون تیغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی بدون تیغ"
    ]
  },
  {
    "id": "ing-dfc226a4",
    "name": "ریواس",
    "normalizedName": "ریواس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریواس"
    ]
  },
  {
    "id": "ing-5e0ae670",
    "name": "نارنگی",
    "normalizedName": "نارنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارنگی"
    ]
  },
  {
    "id": "ing-512e0c2e",
    "name": "سینه یا ران مرغ",
    "normalizedName": "سینه یا ران مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه یا ران مرغ"
    ]
  },
  {
    "id": "ing-a63dcaf7",
    "name": "برنج قهوه ای",
    "normalizedName": "برنج قهوه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج قهوه ای"
    ]
  },
  {
    "id": "ing-7d59912a",
    "name": "شیره خرما یا انگور",
    "normalizedName": "شیره خرما یا انگور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره خرما یا انگور"
    ]
  },
  {
    "id": "ing-385e8a5c",
    "name": "گوجه فرنگی درشت",
    "normalizedName": "گوجه فرنگی درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی درشت"
    ]
  },
  {
    "id": "ing-ae6db250",
    "name": "کره مقدار لازم",
    "normalizedName": "کره مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره مقدار لازم"
    ]
  },
  {
    "id": "ing-bf68e605",
    "name": "چغندر قرمز",
    "normalizedName": "چغندر قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر قرمز"
    ]
  },
  {
    "id": "ing-f3cefbe6",
    "name": "تخم مرغ خام",
    "normalizedName": "تخم مرغ خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ خام"
    ]
  },
  {
    "id": "ing-53c7ce36",
    "name": "آرد سوخاری به مقدار لازم",
    "normalizedName": "ارد سوخاری به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری به مقدار لازم"
    ]
  },
  {
    "id": "ing-97764502",
    "name": "گوشت بره",
    "normalizedName": "گوشت بره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت بره"
    ]
  },
  {
    "id": "ing-3606f1b9",
    "name": "آرد سوخاری مقدار لازم",
    "normalizedName": "ارد سوخاری مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری مقدار لازم"
    ]
  },
  {
    "id": "ing-bcd520ee",
    "name": "به بزرگ",
    "normalizedName": "به بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به بزرگ"
    ]
  },
  {
    "id": "ing-af699e0b",
    "name": "آلو خورشتی",
    "normalizedName": "الو خورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو خورشتی"
    ]
  },
  {
    "id": "ing-4df51b1f",
    "name": "کالباس خرد شده",
    "normalizedName": "کالباس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس خرد شده"
    ]
  },
  {
    "id": "ing-91e5fea3",
    "name": "سیب زمینی درشت",
    "normalizedName": "سیب زمینی درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی درشت"
    ]
  },
  {
    "id": "ing-ce717399",
    "name": "برگ کرفس",
    "normalizedName": "برگ کرفس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ کرفس"
    ]
  },
  {
    "id": "ing-b7b6f11",
    "name": "كشك",
    "normalizedName": "کشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كشك"
    ]
  },
  {
    "id": "ing-f59c50d9",
    "name": "نخود اش",
    "normalizedName": "نخود اش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود اش"
    ]
  },
  {
    "id": "ing-32d347a4",
    "name": "اب مرغ",
    "normalizedName": "اب مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اب مرغ"
    ]
  },
  {
    "id": "ing-b7e75875",
    "name": "گوشت چرخ كرده",
    "normalizedName": "گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ كرده"
    ]
  },
  {
    "id": "ing-7b474e2b",
    "name": "ميگو",
    "normalizedName": "میگو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ميگو"
    ]
  },
  {
    "id": "ing-b7b6c1a",
    "name": "كره",
    "normalizedName": "کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كره"
    ]
  },
  {
    "id": "ing-d82806d",
    "name": "آرد سفيد",
    "normalizedName": "ارد سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفيد"
    ]
  },
  {
    "id": "ing-3437e70f",
    "name": "ابلیمو",
    "normalizedName": "ابلیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ابلیمو"
    ]
  },
  {
    "id": "ing-df754d1d",
    "name": "ماست نصف پیمانه",
    "normalizedName": "ماست نصف پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست نصف پیمانه"
    ]
  },
  {
    "id": "ing-242fdc54",
    "name": "سبزی ( تره",
    "normalizedName": "سبزی ( تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی ( تره"
    ]
  },
  {
    "id": "ing-7b32665a",
    "name": "شويد",
    "normalizedName": "شوید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شويد"
    ]
  },
  {
    "id": "ing-9ac0c829",
    "name": "بكينگ پودر",
    "normalizedName": "بکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بكينگ پودر"
    ]
  },
  {
    "id": "ing-7b80b40a",
    "name": "هويج",
    "normalizedName": "هویج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هويج"
    ]
  },
  {
    "id": "ing-36a0c83c",
    "name": "شیر پر چرب یا خامه",
    "normalizedName": "شیر پر چرب یا خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پر چرب یا خامه"
    ]
  },
  {
    "id": "ing-7ae60d81",
    "name": "گلپر",
    "normalizedName": "گلپر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلپر"
    ]
  },
  {
    "id": "ing-235d2d1d",
    "name": "انار ترش",
    "normalizedName": "انار ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انار ترش"
    ]
  },
  {
    "id": "ing-70d3ec10",
    "name": "پیازداغ",
    "normalizedName": "پیازداغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازداغ"
    ]
  },
  {
    "id": "ing-2e26fd86",
    "name": "پودر خمیر مایه فوری",
    "normalizedName": "پودر خمیر مایه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خمیر مایه فوری"
    ]
  },
  {
    "id": "ing-5eb352fe",
    "name": "سرکه انگور",
    "normalizedName": "سرکه انگور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه انگور"
    ]
  },
  {
    "id": "ing-b6299665",
    "name": "سس فلفل",
    "normalizedName": "سس فلفل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فلفل"
    ]
  },
  {
    "id": "ing-b5c48683",
    "name": "شیر کامل",
    "normalizedName": "شیر کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر کامل"
    ]
  },
  {
    "id": "ing-83e495dd",
    "name": "برای سرو",
    "normalizedName": "برای سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای سرو"
    ]
  },
  {
    "id": "ing-6877f70",
    "name": "کاهو سالادی",
    "normalizedName": "کاهو سالادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو سالادی"
    ]
  },
  {
    "id": "ing-7e7f4c1f",
    "name": "سس بشامل",
    "normalizedName": "سس بشامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس بشامل"
    ]
  },
  {
    "id": "ing-cbe80222",
    "name": "فلفل سیاه به میزان دلخواه",
    "normalizedName": "فلفل سیاه به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه به میزان دلخواه"
    ]
  },
  {
    "id": "ing-99cffaf",
    "name": "زیتون بدون هسته",
    "normalizedName": "زیتون بدون هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون بدون هسته"
    ]
  },
  {
    "id": "ing-7b323cca",
    "name": "شلغم",
    "normalizedName": "شلغم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شلغم"
    ]
  },
  {
    "id": "ing-f825ef8",
    "name": "پونه کوهی",
    "normalizedName": "پونه کوهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه کوهی"
    ]
  },
  {
    "id": "ing-6436ae15",
    "name": "پاستا صدفی",
    "normalizedName": "پاستا صدفی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا صدفی"
    ]
  },
  {
    "id": "ing-b3f917a8",
    "name": "هات داگ",
    "normalizedName": "هات داگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هات داگ"
    ]
  },
  {
    "id": "ing-5bc1f937",
    "name": "سرکه سفید یا قرمز",
    "normalizedName": "سرکه سفید یا قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سفید یا قرمز"
    ]
  },
  {
    "id": "ing-fc33436e",
    "name": "تخم کرفس",
    "normalizedName": "تخم کرفس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم کرفس"
    ]
  },
  {
    "id": "ing-43dd5d44",
    "name": "پنیر کاتیج",
    "normalizedName": "پنیر کاتیج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر کاتیج"
    ]
  },
  {
    "id": "ing-cf384286",
    "name": "سس تند",
    "normalizedName": "سس تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تند"
    ]
  },
  {
    "id": "ing-116da222",
    "name": "نخود سبز پخته شده",
    "normalizedName": "نخود سبز پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود سبز پخته شده"
    ]
  },
  {
    "id": "ing-b6431829",
    "name": "سس تاکو",
    "normalizedName": "سس تاکو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تاکو"
    ]
  },
  {
    "id": "ing-34e1263c",
    "name": "کاهوی سالادی",
    "normalizedName": "کاهوی سالادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهوی سالادی"
    ]
  },
  {
    "id": "ing-2d7e7869",
    "name": "سینه ی مرغ بدون استخوان",
    "normalizedName": "سینه ی مرغ بدون استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه ی مرغ بدون استخوان"
    ]
  },
  {
    "id": "ing-cb951750",
    "name": "شیره طلائی یا عسل",
    "normalizedName": "شیره طلائی یا عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره طلائی یا عسل"
    ]
  },
  {
    "id": "ing-38976752",
    "name": "گوجه فرنگی کوچک",
    "normalizedName": "گوجه فرنگی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی کوچک"
    ]
  },
  {
    "id": "ing-f1bb8760",
    "name": "انار دان شده",
    "normalizedName": "انار دان شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انار دان شده"
    ]
  },
  {
    "id": "ing-17bfcde1",
    "name": "پونه خشک",
    "normalizedName": "پونه خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه خشک"
    ]
  },
  {
    "id": "ing-cf0e08d5",
    "name": "ژامبون خرد شده",
    "normalizedName": "ژامبون خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون خرد شده"
    ]
  },
  {
    "id": "ing-fc9479bc",
    "name": "کلم سفید",
    "normalizedName": "کلم سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم سفید"
    ]
  },
  {
    "id": "ing-1c4f0343",
    "name": "فندق خرد شده",
    "normalizedName": "فندق خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق خرد شده"
    ]
  },
  {
    "id": "ing-56793480",
    "name": "پنیر موتزارلا",
    "normalizedName": "پنیر موتزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موتزارلا"
    ]
  },
  {
    "id": "ing-ce733b32",
    "name": "برگ کاهو",
    "normalizedName": "برگ کاهو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ کاهو"
    ]
  },
  {
    "id": "ing-fcb2e269",
    "name": "کلم قرمز",
    "normalizedName": "کلم قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم قرمز"
    ]
  },
  {
    "id": "ing-43a6892a",
    "name": "کالباس گوشت",
    "normalizedName": "کالباس گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس گوشت"
    ]
  },
  {
    "id": "ing-d8abc74d",
    "name": "هل آسیاب شده",
    "normalizedName": "هل اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هل آسیاب شده"
    ]
  },
  {
    "id": "ing-5d0f2cae",
    "name": "مارشمالوی کوچک",
    "normalizedName": "مارشمالوی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارشمالوی کوچک"
    ]
  },
  {
    "id": "ing-ef2a7896",
    "name": "شکلات نوتلا",
    "normalizedName": "شکلات نوتلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نوتلا"
    ]
  },
  {
    "id": "ing-4f1c2560",
    "name": "بیسکویت دایجستیو",
    "normalizedName": "بیسکویت دایجستیو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکویت دایجستیو"
    ]
  },
  {
    "id": "ing-e2829568",
    "name": "آب یخ",
    "normalizedName": "اب یخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب یخ"
    ]
  },
  {
    "id": "ing-9fcd8ef0",
    "name": "پودر قند الک شده",
    "normalizedName": "پودر قند الک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند الک شده"
    ]
  },
  {
    "id": "ing-e188ad1a",
    "name": "عصاره بادام",
    "normalizedName": "عصاره بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره بادام"
    ]
  },
  {
    "id": "ing-d41db1e",
    "name": "شیر داغ",
    "normalizedName": "شیر داغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر داغ"
    ]
  },
  {
    "id": "ing-97f2727a",
    "name": "بادام زمینی خرد شده",
    "normalizedName": "بادام زمینی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی خرد شده"
    ]
  },
  {
    "id": "ing-4ba5fdc9",
    "name": "شیره بادام",
    "normalizedName": "شیره بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره بادام"
    ]
  },
  {
    "id": "ing-bc384258",
    "name": "سفیده تخم مرغ بزرگ",
    "normalizedName": "سفیده تخم مرغ بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم مرغ بزرگ"
    ]
  },
  {
    "id": "ing-58317329",
    "name": "پودر چای سبز",
    "normalizedName": "پودر چای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر چای سبز"
    ]
  },
  {
    "id": "ing-c0979c15",
    "name": "باتر میلک",
    "normalizedName": "باتر میلک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باتر میلک"
    ]
  },
  {
    "id": "ing-3252a6bf",
    "name": "بیسکوئیت خرد شده",
    "normalizedName": "بیسکوئیت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت خرد شده"
    ]
  },
  {
    "id": "ing-efd8407e",
    "name": "آب آناناس",
    "normalizedName": "اب اناناس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب آناناس"
    ]
  },
  {
    "id": "ing-83995ce1",
    "name": "پوره لبو",
    "normalizedName": "پوره لبو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره لبو"
    ]
  },
  {
    "id": "ing-72a29449",
    "name": "هندوانه خرد شده",
    "normalizedName": "هندوانه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه خرد شده"
    ]
  },
  {
    "id": "ing-5fb3bcd6",
    "name": "پودر ژله هندوانه",
    "normalizedName": "پودر ژله هندوانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله هندوانه"
    ]
  },
  {
    "id": "ing-1c0b557a",
    "name": "شکلات نیمه شیرین",
    "normalizedName": "شکلات نیمه شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین"
    ]
  },
  {
    "id": "ing-c6f8e64c",
    "name": "رنگ قرمز خوراکی",
    "normalizedName": "رنگ قرمز خوراکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ قرمز خوراکی"
    ]
  },
  {
    "id": "ing-e542603f",
    "name": "شکلات تلخ مرغوب",
    "normalizedName": "شکلات تلخ مرغوب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ مرغوب"
    ]
  },
  {
    "id": "ing-a1446600",
    "name": "رنده پوست نارنگی",
    "normalizedName": "رنده پوست نارنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست نارنگی"
    ]
  },
  {
    "id": "ing-b1db588f",
    "name": "نمک کمی",
    "normalizedName": "نمک کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک کمی"
    ]
  },
  {
    "id": "ing-fae2d1a5",
    "name": "موز له شده",
    "normalizedName": "موز له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز له شده"
    ]
  },
  {
    "id": "ing-6861f712",
    "name": "جوهر لیمو",
    "normalizedName": "جوهر لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوهر لیمو"
    ]
  },
  {
    "id": "ing-4465c33c",
    "name": "پودر پودینگ وانیلی",
    "normalizedName": "پودر پودینگ وانیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پودینگ وانیلی"
    ]
  },
  {
    "id": "ing-fc475f70",
    "name": "شیر تغلیظ شده",
    "normalizedName": "شیر تغلیظ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر تغلیظ شده"
    ]
  },
  {
    "id": "ing-f521c1a8",
    "name": "کره نرم",
    "normalizedName": "کره نرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نرم"
    ]
  },
  {
    "id": "ing-fb094859",
    "name": "قهوه دم شده",
    "normalizedName": "قهوه دم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه دم شده"
    ]
  },
  {
    "id": "ing-34665544",
    "name": "وانیل کمی",
    "normalizedName": "وانیل کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل کمی"
    ]
  },
  {
    "id": "ing-2e39c685",
    "name": "مارگارین",
    "normalizedName": "مارگارین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارگارین"
    ]
  },
  {
    "id": "ing-5e0e48d2",
    "name": "نارگیل",
    "normalizedName": "نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل"
    ]
  },
  {
    "id": "ing-e94c0e9b",
    "name": "آرد سفید الک شده",
    "normalizedName": "ارد سفید الک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید الک شده"
    ]
  },
  {
    "id": "ing-c803b200",
    "name": "توت فرنگی تازه",
    "normalizedName": "توت فرنگی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی تازه"
    ]
  },
  {
    "id": "ing-64c19348",
    "name": "ریواس خرد شده",
    "normalizedName": "ریواس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریواس خرد شده"
    ]
  },
  {
    "id": "ing-b0055f80",
    "name": "کره که به دمای اتاق رسیده باشد",
    "normalizedName": "کره که به دمای اتاق رسیده باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره که به دمای اتاق رسیده باشد"
    ]
  },
  {
    "id": "ing-d11eacc9",
    "name": "خاک قند یا شکر قنادی",
    "normalizedName": "خاک قند یا شکر قنادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاک قند یا شکر قنادی"
    ]
  },
  {
    "id": "ing-c5f1ba87",
    "name": "پوست رنده شده لیمو ترش بزرگ",
    "normalizedName": "پوست رنده شده لیمو ترش بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست رنده شده لیمو ترش بزرگ"
    ]
  },
  {
    "id": "ing-8142f110",
    "name": "خامه ی سبک",
    "normalizedName": "خامه ی سبک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی سبک"
    ]
  },
  {
    "id": "ing-dd1efa7",
    "name": "زرده تخم مرغ زده شده",
    "normalizedName": "زرده تخم مرغ زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرغ زده شده"
    ]
  },
  {
    "id": "ing-47d24f82",
    "name": "خامه ی غلیظ (دوبل)",
    "normalizedName": "خامه ی غلیظ (دوبل)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ (دوبل)"
    ]
  },
  {
    "id": "ing-14101e9",
    "name": "خرد شده",
    "normalizedName": "خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرد شده"
    ]
  },
  {
    "id": "ing-bc80bc31",
    "name": "آرد آماده",
    "normalizedName": "ارد اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد آماده"
    ]
  },
  {
    "id": "ing-1537342c",
    "name": "شکلات سفید ذوب شده",
    "normalizedName": "شکلات سفید ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید ذوب شده"
    ]
  },
  {
    "id": "ing-c31b39c8",
    "name": "خامه برای تزئین",
    "normalizedName": "خامه برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه برای تزئین"
    ]
  },
  {
    "id": "ing-7b801f8f",
    "name": "قهوه",
    "normalizedName": "قهوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه"
    ]
  },
  {
    "id": "ing-d7f23d29",
    "name": "شکر قنادی",
    "normalizedName": "شکر قنادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قنادی"
    ]
  },
  {
    "id": "ing-a2fa4647",
    "name": "شکلات تلخ و شیرین (ساده)",
    "normalizedName": "شکلات تلخ و شیرین (ساده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ و شیرین (ساده)"
    ]
  },
  {
    "id": "ing-b0de7fb9",
    "name": "شاه توت",
    "normalizedName": "شاه توت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شاه توت"
    ]
  },
  {
    "id": "ing-33139544",
    "name": "خامه غلیظ",
    "normalizedName": "خامه غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه غلیظ"
    ]
  },
  {
    "id": "ing-1cd52869",
    "name": "نمک دانه ریز",
    "normalizedName": "نمک دانه ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دانه ریز"
    ]
  },
  {
    "id": "ing-7a6545dc",
    "name": "سفیده تخم‌مرغ",
    "normalizedName": "سفیده تخم مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم‌مرغ"
    ]
  },
  {
    "id": "ing-ec3664a4",
    "name": "وانيل",
    "normalizedName": "وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانيل"
    ]
  },
  {
    "id": "ing-261640fe",
    "name": "ادویه مخلوط",
    "normalizedName": "ادویه مخلوط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مخلوط"
    ]
  },
  {
    "id": "ing-29740e76",
    "name": "کره خرد شده",
    "normalizedName": "کره خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره خرد شده"
    ]
  },
  {
    "id": "ing-19be7e1c",
    "name": "سس کارامل",
    "normalizedName": "سس کارامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کارامل"
    ]
  },
  {
    "id": "ing-7cd17f48",
    "name": "خرما بدون هسته",
    "normalizedName": "خرما بدون هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما بدون هسته"
    ]
  },
  {
    "id": "ing-11cf91b6",
    "name": "شیره خرما",
    "normalizedName": "شیره خرما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره خرما"
    ]
  },
  {
    "id": "ing-4f21898a",
    "name": "آب هندوانه",
    "normalizedName": "اب هندوانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب هندوانه"
    ]
  },
  {
    "id": "ing-3ef0ca94",
    "name": "بیسکوئیت کراکر",
    "normalizedName": "بیسکوئیت کراکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت کراکر"
    ]
  },
  {
    "id": "ing-2e3f7417",
    "name": "پودر زعفران",
    "normalizedName": "پودر زعفران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زعفران"
    ]
  },
  {
    "id": "ing-1e0a07a9",
    "name": "ژله انار",
    "normalizedName": "ژله انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله انار"
    ]
  },
  {
    "id": "ing-18e13ed1",
    "name": "پودر کاپوچینو",
    "normalizedName": "پودر کاپوچینو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاپوچینو"
    ]
  },
  {
    "id": "ing-f8ec783",
    "name": "شکر مقدار لازم",
    "normalizedName": "شکر مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر مقدار لازم"
    ]
  },
  {
    "id": "ing-fd62b2cc",
    "name": "خمیر پای مقدار لازم",
    "normalizedName": "خمیر پای مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پای مقدار لازم"
    ]
  },
  {
    "id": "ing-e9cd8c3f",
    "name": "رنده پوست لیمو ترش",
    "normalizedName": "رنده پوست لیمو ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست لیمو ترش"
    ]
  },
  {
    "id": "ing-53214f4c",
    "name": "شیر یا خامه",
    "normalizedName": "شیر یا خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا خامه"
    ]
  },
  {
    "id": "ing-c246184e",
    "name": "خرده بیسکوییت",
    "normalizedName": "خرده بیسکوییت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده بیسکوییت"
    ]
  },
  {
    "id": "ing-b80056e",
    "name": "هلو",
    "normalizedName": "هلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هلو"
    ]
  },
  {
    "id": "ing-b8e2ef2",
    "name": "پودر ژله قرمز",
    "normalizedName": "پودر ژله قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله قرمز"
    ]
  },
  {
    "id": "ing-b9bb5e1",
    "name": "پودر ژله انار",
    "normalizedName": "پودر ژله انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله انار"
    ]
  },
  {
    "id": "ing-8aaff90c",
    "name": "ورقه ژلاتین کوچک",
    "normalizedName": "ورقه ژلاتین کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورقه ژلاتین کوچک"
    ]
  },
  {
    "id": "ing-654bf8ab",
    "name": "پودر ژله توت فرنگی",
    "normalizedName": "پودر ژله توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله توت فرنگی"
    ]
  },
  {
    "id": "ing-28ea35c5",
    "name": "پودر نسکافه یا قهوه فوری",
    "normalizedName": "پودر نسکافه یا قهوه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نسکافه یا قهوه فوری"
    ]
  },
  {
    "id": "ing-33098632",
    "name": "خامه ساده",
    "normalizedName": "خامه ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ساده"
    ]
  },
  {
    "id": "ing-e94a15b4",
    "name": "نبات مقداری",
    "normalizedName": "نبات مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نبات مقداری"
    ]
  },
  {
    "id": "ing-19bfc297",
    "name": "پنیر ماسکارپونه یا پنیر خامه ای",
    "normalizedName": "پنیر ماسکارپونه یا پنیر خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ماسکارپونه یا پنیر خامه ای"
    ]
  },
  {
    "id": "ing-5c77ec35",
    "name": "قهوه دم کرده",
    "normalizedName": "قهوه دم کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه دم کرده"
    ]
  },
  {
    "id": "ing-913e7dc6",
    "name": "شکر ریز",
    "normalizedName": "شکر ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر ریز"
    ]
  },
  {
    "id": "ing-5cfded61",
    "name": "خلال پسته و زعفران دم کرده به مقدار لازم",
    "normalizedName": "خلال پسته و زعفران دم کرده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته و زعفران دم کرده به مقدار لازم"
    ]
  },
  {
    "id": "ing-785ddc9e",
    "name": "ریحان تازه مقداری",
    "normalizedName": "ریحان تازه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان تازه مقداری"
    ]
  },
  {
    "id": "ing-cf4f391e",
    "name": "آب معدنی یا آب گاز دار مقدار لازم",
    "normalizedName": "اب معدنی یا اب گاز دار مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب معدنی یا آب گاز دار مقدار لازم"
    ]
  },
  {
    "id": "ing-28d3bfe1",
    "name": "پودر قند یا شکر",
    "normalizedName": "پودر قند یا شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند یا شکر"
    ]
  },
  {
    "id": "ing-b7ca9fe",
    "name": "ژله",
    "normalizedName": "ژله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله"
    ]
  },
  {
    "id": "ing-2b2fd472",
    "name": "زغال اخته تازه",
    "normalizedName": "زغال اخته تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زغال اخته تازه"
    ]
  },
  {
    "id": "ing-86ad90f2",
    "name": "گلاب نصف لیوان",
    "normalizedName": "گلاب نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلاب نصف لیوان"
    ]
  },
  {
    "id": "ing-343cab3",
    "name": "وانیل نصف قاشق چایخوری",
    "normalizedName": "وانیل نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-79e31443",
    "name": "پودر کاستارد",
    "normalizedName": "پودر کاستارد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاستارد"
    ]
  },
  {
    "id": "ing-b5990d47",
    "name": "پودر قهوه",
    "normalizedName": "پودر قهوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قهوه"
    ]
  },
  {
    "id": "ing-fa660220",
    "name": "زعفران آب کرده",
    "normalizedName": "زعفران اب کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران آب کرده"
    ]
  },
  {
    "id": "ing-82351427",
    "name": "بیسکوییت لیدی فینگر",
    "normalizedName": "بیسکوییت لیدی فینگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت لیدی فینگر"
    ]
  },
  {
    "id": "ing-76d81805",
    "name": "لپه پخته",
    "normalizedName": "لپه پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لپه پخته"
    ]
  },
  {
    "id": "ing-c5ebcd80",
    "name": "زعفران دم‌کرده به مقدار لازم",
    "normalizedName": "زعفران دم کرده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم‌کرده به مقدار لازم"
    ]
  },
  {
    "id": "ing-e979fc05",
    "name": "سبزی خورشتی",
    "normalizedName": "سبزی خورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی خورشتی"
    ]
  },
  {
    "id": "ing-7b21650d",
    "name": "رشته",
    "normalizedName": "رشته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته"
    ]
  },
  {
    "id": "ing-201875c9",
    "name": "گوشت گوسفندی یا مرغ",
    "normalizedName": "گوشت گوسفندی یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفندی یا مرغ"
    ]
  },
  {
    "id": "ing-c2af873f",
    "name": "برگ ملوخیه",
    "normalizedName": "برگ ملوخیه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ملوخیه"
    ]
  },
  {
    "id": "ing-7b7e1a56",
    "name": "نوری",
    "normalizedName": "نوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوری"
    ]
  },
  {
    "id": "ing-b7b40e8",
    "name": "چای",
    "normalizedName": "چای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چای"
    ]
  },
  {
    "id": "ing-e75802e1",
    "name": "چای سبز",
    "normalizedName": "چای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چای سبز"
    ]
  },
  {
    "id": "ing-e4d558a8",
    "name": "پیتزا",
    "normalizedName": "پیتزا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیتزا"
    ]
  },
  {
    "id": "ing-d59d71b3",
    "name": "ادویه بریانی به مقدار لازم",
    "normalizedName": "ادویه بریانی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه بریانی به مقدار لازم"
    ]
  },
  {
    "id": "ing-2cb831c4",
    "name": "فلفل قرمز به مقدار لازم",
    "normalizedName": "فلفل قرمز به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز به مقدار لازم"
    ]
  },
  {
    "id": "ing-27d81a0e",
    "name": "سس گوچوجانگ",
    "normalizedName": "سس گوچوجانگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوچوجانگ"
    ]
  },
  {
    "id": "ing-d7c2184f",
    "name": "کیمچی",
    "normalizedName": "کیمچی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیمچی"
    ]
  },
  {
    "id": "ing-49466821",
    "name": "زرده تخم‌مرغ",
    "normalizedName": "زرده تخم مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم‌مرغ"
    ]
  },
  {
    "id": "ing-8ec64c3e",
    "name": "لازانیا",
    "normalizedName": "لازانیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لازانیا"
    ]
  },
  {
    "id": "ing-47e86272",
    "name": "برنج ریسوتو",
    "normalizedName": "برنج ریسوتو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج ریسوتو"
    ]
  },
  {
    "id": "ing-d7e87636",
    "name": "گیلاس",
    "normalizedName": "گیلاس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیلاس"
    ]
  },
  {
    "id": "ing-e4d5a32b",
    "name": "پیاز)",
    "normalizedName": "پیاز)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز)"
    ]
  },
  {
    "id": "ing-b5a86b7f",
    "name": "پودر میسو",
    "normalizedName": "پودر میسو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر میسو"
    ]
  },
  {
    "id": "ing-256c9e0c",
    "name": "عدس زرد",
    "normalizedName": "عدس زرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس زرد"
    ]
  },
  {
    "id": "ing-389b4b28",
    "name": "ادویه‌جات هندی به مقدار لازم",
    "normalizedName": "ادویه جات هندی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌جات هندی به مقدار لازم"
    ]
  },
  {
    "id": "ing-d74c3e44",
    "name": "چاتنی",
    "normalizedName": "چاتنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چاتنی"
    ]
  },
  {
    "id": "ing-8949193a",
    "name": "مایه خمیر",
    "normalizedName": "مایه خمیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مایه خمیر"
    ]
  },
  {
    "id": "ing-504bd308",
    "name": "رشته نودل",
    "normalizedName": "رشته نودل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته نودل"
    ]
  },
  {
    "id": "ing-d99c1d85",
    "name": "کوسکوس",
    "normalizedName": "کوسکوس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کوسکوس"
    ]
  },
  {
    "id": "ing-c7fdba4d",
    "name": "چوریسو",
    "normalizedName": "چوریسو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوریسو"
    ]
  },
  {
    "id": "ing-818dde2f",
    "name": "ادویه جات",
    "normalizedName": "ادویه جات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه جات"
    ]
  },
  {
    "id": "ing-d9fdc4a4",
    "name": "گوشت (گوسفند یا مرغ)",
    "normalizedName": "گوشت (گوسفند یا مرغ)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت (گوسفند یا مرغ)"
    ]
  },
  {
    "id": "ing-b36b578e",
    "name": "ادویه‌ها (زیره",
    "normalizedName": "ادویه ها (زیره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌ها (زیره"
    ]
  },
  {
    "id": "ing-7b829461",
    "name": "قرمز",
    "normalizedName": "قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قرمز"
    ]
  },
  {
    "id": "ing-a07ddf16",
    "name": "زعفران)",
    "normalizedName": "زعفران)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران)"
    ]
  },
  {
    "id": "ing-466977f1",
    "name": "فاصولیا",
    "normalizedName": "فاصولیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فاصولیا"
    ]
  },
  {
    "id": "ing-733132c9",
    "name": "ملوخیه",
    "normalizedName": "ملوخیه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ملوخیه"
    ]
  },
  {
    "id": "ing-6cca8b1c",
    "name": "پا گاو",
    "normalizedName": "پا گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پا گاو"
    ]
  },
  {
    "id": "ing-95952724",
    "name": "برگ انگور",
    "normalizedName": "برگ انگور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ انگور"
    ]
  },
  {
    "id": "ing-e4a49a68",
    "name": "مغزها",
    "normalizedName": "مغزها",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغزها"
    ]
  },
  {
    "id": "ing-7b2b8bc0",
    "name": "حبوب",
    "normalizedName": "حبوب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حبوب"
    ]
  },
  {
    "id": "ing-b4f4560e",
    "name": "باقلای سبز",
    "normalizedName": "باقلای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقلای سبز"
    ]
  },
  {
    "id": "ing-7068ceec",
    "name": "دانه ی کنجد",
    "normalizedName": "دانه ی کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی کنجد"
    ]
  },
  {
    "id": "ing-fa949992",
    "name": "روغن نصف",
    "normalizedName": "روغن نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن نصف"
    ]
  },
  {
    "id": "ing-dd1f0492",
    "name": "روغن کانولا یا زیتون",
    "normalizedName": "روغن کانولا یا زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کانولا یا زیتون"
    ]
  },
  {
    "id": "ing-e0f5f531",
    "name": "پیازچه  نصف",
    "normalizedName": "پیازچه نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه  نصف"
    ]
  },
  {
    "id": "ing-b1d8b6dd",
    "name": "نمک نصف",
    "normalizedName": "نمک نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نصف"
    ]
  },
  {
    "id": "ing-91ff557e",
    "name": "سیب زمینی پخته",
    "normalizedName": "سیب زمینی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی پخته"
    ]
  },
  {
    "id": "ing-578601af",
    "name": "پودر تخم گشنیز",
    "normalizedName": "پودر تخم گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر تخم گشنیز"
    ]
  },
  {
    "id": "ing-378ad2a3",
    "name": "جعفری ریز",
    "normalizedName": "جعفری ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری ریز"
    ]
  },
  {
    "id": "ing-61090128",
    "name": "آرد 3 و نیم",
    "normalizedName": "ارد 3 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 3 و نیم"
    ]
  },
  {
    "id": "ing-88abeb34",
    "name": "پودر خمیر ترش",
    "normalizedName": "پودر خمیر ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خمیر ترش"
    ]
  },
  {
    "id": "ing-5afffdbc",
    "name": "پودر فلفل سفید",
    "normalizedName": "پودر فلفل سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سفید"
    ]
  },
  {
    "id": "ing-7ae6dbc4",
    "name": "کیوی",
    "normalizedName": "کیوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیوی"
    ]
  },
  {
    "id": "ing-3985618e",
    "name": "پوست پرتقال",
    "normalizedName": "پوست پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست پرتقال"
    ]
  },
  {
    "id": "ing-84517a86",
    "name": "آرد 2 و",
    "normalizedName": "ارد 2 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 2 و"
    ]
  },
  {
    "id": "ing-5925ea",
    "name": "اب",
    "normalizedName": "اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اب"
    ]
  },
  {
    "id": "ing-dfdac44f",
    "name": "پوست لیمو",
    "normalizedName": "پوست لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیمو"
    ]
  },
  {
    "id": "ing-39494e90",
    "name": "تخمه آفتابگردان",
    "normalizedName": "تخمه افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخمه آفتابگردان"
    ]
  },
  {
    "id": "ing-8605203f",
    "name": "پودر قند 1 و",
    "normalizedName": "پودر قند 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند 1 و"
    ]
  },
  {
    "id": "ing-84b1bdbd",
    "name": "آرد جو دوسر",
    "normalizedName": "ارد جو دوسر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد جو دوسر"
    ]
  },
  {
    "id": "ing-3f151bde",
    "name": "سس باربکیو",
    "normalizedName": "سس باربکیو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس باربکیو"
    ]
  },
  {
    "id": "ing-320e09ad",
    "name": "انگور سیاه بدون دانه",
    "normalizedName": "انگور سیاه بدون دانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور سیاه بدون دانه"
    ]
  },
  {
    "id": "ing-4022b795",
    "name": "بادام یا گردوی خرد شده",
    "normalizedName": "بادام یا گردوی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام یا گردوی خرد شده"
    ]
  },
  {
    "id": "ing-98273723",
    "name": "پودی کاری",
    "normalizedName": "پودی کاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودی کاری"
    ]
  },
  {
    "id": "ing-fca9c05e",
    "name": "برگ مو",
    "normalizedName": "برگ مو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ مو"
    ]
  },
  {
    "id": "ing-e4ac4583",
    "name": "قارچ اسلایس شده",
    "normalizedName": "قارچ اسلایس شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ اسلایس شده"
    ]
  },
  {
    "id": "ing-474850e7",
    "name": "هویج کوچک رنده شده",
    "normalizedName": "هویج کوچک رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج کوچک رنده شده"
    ]
  },
  {
    "id": "ing-53ad4663",
    "name": "فیله مرغ یا سینه مرغ بی استخوان",
    "normalizedName": "فیله مرغ یا سینه مرغ بی استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ یا سینه مرغ بی استخوان"
    ]
  },
  {
    "id": "ing-d1364c27",
    "name": "پودر نان (یا پودر سوخاری)",
    "normalizedName": "پودر نان (یا پودر سوخاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نان (یا پودر سوخاری)"
    ]
  },
  {
    "id": "ing-d0b8bcb7",
    "name": "اسپری روغن",
    "normalizedName": "اسپری روغن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسپری روغن"
    ]
  },
  {
    "id": "ing-bfaa014c",
    "name": "کدو سبز کوچک",
    "normalizedName": "کدو سبز کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز کوچک"
    ]
  },
  {
    "id": "ing-67aa724d",
    "name": "س­یب زمینی متوسط",
    "normalizedName": "س­یب زمینی متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "س­یب زمینی متوسط"
    ]
  },
  {
    "id": "ing-6a3375c5",
    "name": "ران مرغ بدون استخوان و بدون پوست",
    "normalizedName": "ران مرغ بدون استخوان و بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ بدون استخوان و بدون پوست"
    ]
  },
  {
    "id": "ing-8181f383",
    "name": "جعفری خشک شده",
    "normalizedName": "جعفری خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خشک شده"
    ]
  },
  {
    "id": "ing-790157c8",
    "name": "سس پیتزا",
    "normalizedName": "سس پیتزا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس پیتزا"
    ]
  },
  {
    "id": "ing-a2433939",
    "name": "گوجه حلقه شده",
    "normalizedName": "گوجه حلقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه حلقه شده"
    ]
  },
  {
    "id": "ing-1dfd253e",
    "name": "پنیر پارمزان زنده شده",
    "normalizedName": "پنیر پارمزان زنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان زنده شده"
    ]
  },
  {
    "id": "ing-ee3218bb",
    "name": "برنج دانه بلند پخته شده",
    "normalizedName": "برنج دانه بلند پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج دانه بلند پخته شده"
    ]
  },
  {
    "id": "ing-8c559092",
    "name": "سینه مرغ پخته شده بدون پوست",
    "normalizedName": "سینه مرغ پخته شده بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ پخته شده بدون پوست"
    ]
  },
  {
    "id": "ing-fb50ef73",
    "name": "برگ اسفناج تازه",
    "normalizedName": "برگ اسفناج تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ اسفناج تازه"
    ]
  },
  {
    "id": "ing-4baec1ff",
    "name": "پنیر ریکوتا یا پنیر خامه‌ای",
    "normalizedName": "پنیر ریکوتا یا پنیر خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا یا پنیر خامه‌ای"
    ]
  },
  {
    "id": "ing-32d33840",
    "name": "آب نمک",
    "normalizedName": "اب نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نمک"
    ]
  },
  {
    "id": "ing-c79eada3",
    "name": "نشاسته سیب‌زمینی یا نشاسته ذرت",
    "normalizedName": "نشاسته سیب زمینی یا نشاسته ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته سیب‌زمینی یا نشاسته ذرت"
    ]
  },
  {
    "id": "ing-517cd65a",
    "name": "مرزنجوش خشک شده",
    "normalizedName": "مرزنجوش خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرزنجوش خشک شده"
    ]
  },
  {
    "id": "ing-cc9cd309",
    "name": "تره یا ساقه پیازچه خرد شده",
    "normalizedName": "تره یا ساقه پیازچه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره یا ساقه پیازچه خرد شده"
    ]
  },
  {
    "id": "ing-82ff2352",
    "name": "فیله ماهی تیلاپیا",
    "normalizedName": "فیله ماهی تیلاپیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی تیلاپیا"
    ]
  },
  {
    "id": "ing-964997da",
    "name": "برگ آویشن تازه",
    "normalizedName": "برگ اویشن تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ آویشن تازه"
    ]
  },
  {
    "id": "ing-e5ee7c75",
    "name": "ران مرغ کوچک",
    "normalizedName": "ران مرغ کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ کوچک"
    ]
  },
  {
    "id": "ing-f4104db",
    "name": "زعفران حل شده در آب",
    "normalizedName": "زعفران حل شده در اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران حل شده در آب"
    ]
  },
  {
    "id": "ing-a63a11",
    "name": "زنجبیل خرد شده",
    "normalizedName": "زنجبیل خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل خرد شده"
    ]
  },
  {
    "id": "ing-62de90b2",
    "name": "سس سویا (کم نمک)",
    "normalizedName": "سس سویا (کم نمک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سویا (کم نمک)"
    ]
  },
  {
    "id": "ing-5b8d0609",
    "name": "کنجد بوداده",
    "normalizedName": "کنجد بوداده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد بوداده"
    ]
  },
  {
    "id": "ing-7b4b191a",
    "name": "مخمر",
    "normalizedName": "مخمر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمر"
    ]
  },
  {
    "id": "ing-fc9dda91",
    "name": "برای سر هم کردن پیتزا:",
    "normalizedName": "برای سر هم کردن پیتزا:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای سر هم کردن پیتزا:"
    ]
  },
  {
    "id": "ing-fcfa51bc",
    "name": "سس فلفل قرمز یا کچاپ",
    "normalizedName": "سس فلفل قرمز یا کچاپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فلفل قرمز یا کچاپ"
    ]
  },
  {
    "id": "ing-b5fed74c",
    "name": "استیک نازک راسته گاو",
    "normalizedName": "استیک نازک راسته گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استیک نازک راسته گاو"
    ]
  },
  {
    "id": "ing-b73cfcc6",
    "name": "نمک دانه درشت",
    "normalizedName": "نمک دانه درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دانه درشت"
    ]
  },
  {
    "id": "ing-babf482d",
    "name": "گوجه پوست کنده خرد شده",
    "normalizedName": "گوجه پوست کنده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه پوست کنده خرد شده"
    ]
  },
  {
    "id": "ing-359e4339",
    "name": "ریحان و جعفری خرد شده",
    "normalizedName": "ریحان و جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان و جعفری خرد شده"
    ]
  },
  {
    "id": "ing-9f492b7b",
    "name": "کنسرو سالمون",
    "normalizedName": "کنسرو سالمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو سالمون"
    ]
  },
  {
    "id": "ing-9d44697c",
    "name": "ذرت فریز شده",
    "normalizedName": "ذرت فریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت فریز شده"
    ]
  },
  {
    "id": "ing-53f0b0a5",
    "name": "سس تارتار",
    "normalizedName": "سس تارتار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تارتار"
    ]
  },
  {
    "id": "ing-47113d7f",
    "name": "موز کاملاً رسیده",
    "normalizedName": "موز کاملاً رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز کاملاً رسیده"
    ]
  },
  {
    "id": "ing-78896c4d",
    "name": "ران مرغ با استخوان",
    "normalizedName": "ران مرغ با استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ با استخوان"
    ]
  },
  {
    "id": "ing-aca8b0e8",
    "name": "گشنیز یا جعفری خرد شده",
    "normalizedName": "گشنیز یا جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز یا جعفری خرد شده"
    ]
  },
  {
    "id": "ing-274628bc",
    "name": "پنیر پارمسان رنده شده",
    "normalizedName": "پنیر پارمسان رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمسان رنده شده"
    ]
  },
  {
    "id": "ing-cebbc2ee",
    "name": "روغن هسته انگور",
    "normalizedName": "روغن هسته انگور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن هسته انگور"
    ]
  },
  {
    "id": "ing-cf7dc95",
    "name": "مربا و پودر قند",
    "normalizedName": "مربا و پودر قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا و پودر قند"
    ]
  },
  {
    "id": "ing-a4d16150",
    "name": "فیله سالمون",
    "normalizedName": "فیله سالمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله سالمون"
    ]
  },
  {
    "id": "ing-58e2aa6e",
    "name": "سبزی معطر خرد شده تازه",
    "normalizedName": "سبزی معطر خرد شده تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر خرد شده تازه"
    ]
  },
  {
    "id": "ing-7f04814b",
    "name": "ریحان و نعنا)",
    "normalizedName": "ریحان و نعنا)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان و نعنا)"
    ]
  },
  {
    "id": "ing-7cf678d7",
    "name": "لیمو ترش برای سرو",
    "normalizedName": "لیمو ترش برای سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش برای سرو"
    ]
  },
  {
    "id": "ing-805f03f5",
    "name": "فلفل هالوپینو",
    "normalizedName": "فلفل هالوپینو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل هالوپینو"
    ]
  },
  {
    "id": "ing-a65ac404",
    "name": "هویج کوچک",
    "normalizedName": "هویج کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج کوچک"
    ]
  },
  {
    "id": "ing-f3c3feb4",
    "name": "گوشت راسته گاو برش خورده به صورت استیک",
    "normalizedName": "گوشت راسته گاو برش خورده به صورت استیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت راسته گاو برش خورده به صورت استیک"
    ]
  },
  {
    "id": "ing-abea7195",
    "name": "رزماری خردشده",
    "normalizedName": "رزماری خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری خردشده"
    ]
  },
  {
    "id": "ing-bc7d36c6",
    "name": "سوسیس یا کوکتل گوشت",
    "normalizedName": "سوسیس یا کوکتل گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس یا کوکتل گوشت"
    ]
  },
  {
    "id": "ing-e786b1a7",
    "name": "سیب‌زمینی خردشده یا رنده‌شده",
    "normalizedName": "سیب زمینی خردشده یا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب‌زمینی خردشده یا رنده‌شده"
    ]
  },
  {
    "id": "ing-d10f8bc0",
    "name": "فلفل سبز خردشده",
    "normalizedName": "فلفل سبز خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز خردشده"
    ]
  },
  {
    "id": "ing-a0300f11",
    "name": "مغزگردو",
    "normalizedName": "مغزگردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغزگردو"
    ]
  },
  {
    "id": "ing-e1c4cc03",
    "name": "زعفران غلیظ دم شده",
    "normalizedName": "زعفران غلیظ دم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران غلیظ دم شده"
    ]
  },
  {
    "id": "ing-12db2a00",
    "name": "مرغ یا جوجه کامل",
    "normalizedName": "مرغ یا جوجه کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ یا جوجه کامل"
    ]
  },
  {
    "id": "ing-661b6bca",
    "name": "نخ دندان",
    "normalizedName": "نخ دندان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخ دندان"
    ]
  },
  {
    "id": "ing-d7641e05",
    "name": "فیله گوشت گاو یا گوسفند",
    "normalizedName": "فیله گوشت گاو یا گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله گوشت گاو یا گوسفند"
    ]
  },
  {
    "id": "ing-2c996ac3",
    "name": "فلفل تند سبز خرد شده",
    "normalizedName": "فلفل تند سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند سبز خرد شده"
    ]
  },
  {
    "id": "ing-6a3b2586",
    "name": "نان پیتا یا نان معمولی کوچک",
    "normalizedName": "نان پیتا یا نان معمولی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان پیتا یا نان معمولی کوچک"
    ]
  },
  {
    "id": "ing-c433381b",
    "name": "سوسیس ایتالیایی",
    "normalizedName": "سوسیس ایتالیایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس ایتالیایی"
    ]
  },
  {
    "id": "ing-ab456798",
    "name": "آویشن خرد شده",
    "normalizedName": "اویشن خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن خرد شده"
    ]
  },
  {
    "id": "ing-6ec086c5",
    "name": "پنیر موزورلا",
    "normalizedName": "پنیر موزورلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزورلا"
    ]
  },
  {
    "id": "ing-743f7662",
    "name": "فلفل دلمه‌ای سبز خرد شده",
    "normalizedName": "فلفل دلمه ای سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای سبز خرد شده"
    ]
  },
  {
    "id": "ing-526075cf",
    "name": "فلفل دلمه‌ای قرمز خرد شده",
    "normalizedName": "فلفل دلمه ای قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای قرمز خرد شده"
    ]
  },
  {
    "id": "ing-a29bcfaf",
    "name": "ذرت پخته شده",
    "normalizedName": "ذرت پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت پخته شده"
    ]
  },
  {
    "id": "ing-59cbd551",
    "name": "پنیر موزورلا یا چدار",
    "normalizedName": "پنیر موزورلا یا چدار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزورلا یا چدار"
    ]
  },
  {
    "id": "ing-d7f3d106",
    "name": "سوسیس (اختیاری)",
    "normalizedName": "سوسیس (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس (اختیاری)"
    ]
  },
  {
    "id": "ing-6af5c1ac",
    "name": "اسفناج پخته خرد شده",
    "normalizedName": "اسفناج پخته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج پخته خرد شده"
    ]
  },
  {
    "id": "ing-8c9958b7",
    "name": "ژامبون مرغ",
    "normalizedName": "ژامبون مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون مرغ"
    ]
  },
  {
    "id": "ing-9cd6848a",
    "name": "مغز کاج",
    "normalizedName": "مغز کاج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز کاج"
    ]
  },
  {
    "id": "ing-e809871b",
    "name": "کره قهوه ای",
    "normalizedName": "کره قهوه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره قهوه ای"
    ]
  },
  {
    "id": "ing-2f668c87",
    "name": "ران مرغ تکه تکه شده",
    "normalizedName": "ران مرغ تکه تکه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ تکه تکه شده"
    ]
  },
  {
    "id": "ing-f5fc27c1",
    "name": "خمیر پای (۲۲ سانتیمتری)",
    "normalizedName": "خمیر پای (۲۲ سانتیمتری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پای (۲۲ سانتیمتری)"
    ]
  },
  {
    "id": "ing-aa3d2066",
    "name": "خلال پوست لیمو",
    "normalizedName": "خلال پوست لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پوست لیمو"
    ]
  },
  {
    "id": "ing-e33ca583",
    "name": "فلفل سبز تند خرد شده",
    "normalizedName": "فلفل سبز تند خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز تند خرد شده"
    ]
  },
  {
    "id": "ing-e0d6dc40",
    "name": "پیازچه رنده شده",
    "normalizedName": "پیازچه رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه رنده شده"
    ]
  },
  {
    "id": "ing-778bde47",
    "name": "نان پیتای پاکتی",
    "normalizedName": "نان پیتای پاکتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان پیتای پاکتی"
    ]
  },
  {
    "id": "ing-2d4ac01d",
    "name": "پیاز قرمز کوچک خلال شده",
    "normalizedName": "پیاز قرمز کوچک خلال شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز کوچک خلال شده"
    ]
  },
  {
    "id": "ing-f3575373",
    "name": "روغن آفتاب گردان",
    "normalizedName": "روغن افتاب گردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن آفتاب گردان"
    ]
  },
  {
    "id": "ing-b30f04e5",
    "name": "حبه سیر خرد شده",
    "normalizedName": "حبه سیر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حبه سیر خرد شده"
    ]
  },
  {
    "id": "ing-7d24a289",
    "name": "حبه سیر",
    "normalizedName": "حبه سیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حبه سیر"
    ]
  },
  {
    "id": "ing-1205d005",
    "name": "ژامبون بیکن (ترجیحاً 90%)",
    "normalizedName": "ژامبون بیکن (ترجیحاً 90%)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون بیکن (ترجیحاً 90%)"
    ]
  },
  {
    "id": "ing-320c6a71",
    "name": "سس آلفردو",
    "normalizedName": "سس الفردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس آلفردو"
    ]
  },
  {
    "id": "ing-98bc668b",
    "name": "پیاز کوچک باریک شده",
    "normalizedName": "پیاز کوچک باریک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک باریک شده"
    ]
  },
  {
    "id": "ing-7d75ec93",
    "name": "مرغ سوخاری تکه تکه یا ریش ریش شده",
    "normalizedName": "مرغ سوخاری تکه تکه یا ریش ریش شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ سوخاری تکه تکه یا ریش ریش شده"
    ]
  },
  {
    "id": "ing-f2ed288e",
    "name": "پیاز خردشده",
    "normalizedName": "پیاز خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز خردشده"
    ]
  },
  {
    "id": "ing-1705648c",
    "name": "عسل گرم شده",
    "normalizedName": "عسل گرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل گرم شده"
    ]
  },
  {
    "id": "ing-71df903",
    "name": "آب گرم (60 درجه)",
    "normalizedName": "اب گرم (60 درجه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گرم (60 درجه)"
    ]
  },
  {
    "id": "ing-8e52cfc2",
    "name": "سینه مرغ بدون پوست واستخوان",
    "normalizedName": "سینه مرغ بدون پوست واستخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ بدون پوست واستخوان"
    ]
  },
  {
    "id": "ing-d2e8c7a4",
    "name": "عدس قرمز",
    "normalizedName": "عدس قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس قرمز"
    ]
  },
  {
    "id": "ing-73486ff9",
    "name": "گشنیر تازه و خرد شده",
    "normalizedName": "گشنیر تازه و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیر تازه و خرد شده"
    ]
  },
  {
    "id": "ing-49799f0f",
    "name": "مرغ (سینه یا ران)",
    "normalizedName": "مرغ (سینه یا ران)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ (سینه یا ران)"
    ]
  },
  {
    "id": "ing-35355925",
    "name": "رزماری تازه یا خشک شده",
    "normalizedName": "رزماری تازه یا خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری تازه یا خشک شده"
    ]
  },
  {
    "id": "ing-c4333968",
    "name": "آویشن تازه یا خشک شده",
    "normalizedName": "اویشن تازه یا خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن تازه یا خشک شده"
    ]
  },
  {
    "id": "ing-a18282a8",
    "name": "جعفری یا گشنیز خرد شده",
    "normalizedName": "جعفری یا گشنیز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری یا گشنیز خرد شده"
    ]
  },
  {
    "id": "ing-1d4c399d",
    "name": "راسته گوساله ورقه شده",
    "normalizedName": "راسته گوساله ورقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "راسته گوساله ورقه شده"
    ]
  },
  {
    "id": "ing-7582bdcd",
    "name": "برگ ریحان خشک شده",
    "normalizedName": "برگ ریحان خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ریحان خشک شده"
    ]
  },
  {
    "id": "ing-3e378c86",
    "name": "پنیر چدار یا موزارلا برای تزیین( اختیاری)",
    "normalizedName": "پنیر چدار یا موزارلا برای تزیین( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار یا موزارلا برای تزیین( اختیاری)"
    ]
  },
  {
    "id": "ing-71f1ce32",
    "name": "سس تند(اختیاری)",
    "normalizedName": "سس تند(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تند(اختیاری)"
    ]
  },
  {
    "id": "ing-5aa236b3",
    "name": "تخم گشنیز پودر شده",
    "normalizedName": "تخم گشنیز پودر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم گشنیز پودر شده"
    ]
  },
  {
    "id": "ing-c5ba924e",
    "name": "شوید تازه برای تزیین",
    "normalizedName": "شوید تازه برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید تازه برای تزیین"
    ]
  },
  {
    "id": "ing-9f94622d",
    "name": "جعفری یا پیازچه خرد شده",
    "normalizedName": "جعفری یا پیازچه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری یا پیازچه خرد شده"
    ]
  },
  {
    "id": "ing-8df9bba9",
    "name": "خامه ترش و",
    "normalizedName": "خامه ترش و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش و"
    ]
  },
  {
    "id": "ing-d1eaad7a",
    "name": "کره مارگارین",
    "normalizedName": "کره مارگارین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره مارگارین"
    ]
  },
  {
    "id": "ing-86efe7f5",
    "name": "سنگک یا تافتون",
    "normalizedName": "سنگک یا تافتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سنگک یا تافتون"
    ]
  },
  {
    "id": "ing-e4c9038e",
    "name": "پنیر گرویر( یا گودا)",
    "normalizedName": "پنیر گرویر( یا گودا)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر گرویر( یا گودا)"
    ]
  },
  {
    "id": "ing-a9f9fd7f",
    "name": "رنده پوست پرتقال یا لیمو",
    "normalizedName": "رنده پوست پرتقال یا لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست پرتقال یا لیمو"
    ]
  },
  {
    "id": "ing-6a36ad97",
    "name": "کشمش سبز تیزابی",
    "normalizedName": "کشمش سبز تیزابی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش سبز تیزابی"
    ]
  },
  {
    "id": "ing-4677341d",
    "name": "کره آب شده( اختیاری)",
    "normalizedName": "کره اب شده( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره آب شده( اختیاری)"
    ]
  },
  {
    "id": "ing-325636c4",
    "name": "سینه مرغ با پوست و استخوان",
    "normalizedName": "سینه مرغ با پوست و استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ با پوست و استخوان"
    ]
  },
  {
    "id": "ing-9b4e5d9",
    "name": "فیله ماهی سالمون",
    "normalizedName": "فیله ماهی سالمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی سالمون"
    ]
  },
  {
    "id": "ing-fba662d7",
    "name": "پوره سیب بدون شکر",
    "normalizedName": "پوره سیب بدون شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره سیب بدون شکر"
    ]
  },
  {
    "id": "ing-652ced10",
    "name": "آرد گندم کامل",
    "normalizedName": "ارد گندم کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم کامل"
    ]
  },
  {
    "id": "ing-b8a5ebf1",
    "name": "مغز گردوی خرد شده",
    "normalizedName": "مغز گردوی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردوی خرد شده"
    ]
  },
  {
    "id": "ing-45f28ed1",
    "name": "گوجه رنده یا خرد شده",
    "normalizedName": "گوجه رنده یا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه رنده یا خرد شده"
    ]
  },
  {
    "id": "ing-534cf37a",
    "name": "فلفل قرمز خشک شده (اختیاری)",
    "normalizedName": "فلفل قرمز خشک شده (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز خشک شده (اختیاری)"
    ]
  },
  {
    "id": "ing-c043f9cc",
    "name": "میوه به",
    "normalizedName": "میوه به",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه به"
    ]
  },
  {
    "id": "ing-b4aff9e6",
    "name": "ادویه راس الحانوت",
    "normalizedName": "ادویه راس الحانوت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه راس الحانوت"
    ]
  },
  {
    "id": "ing-700b1fd",
    "name": "ساقه کرفس ریز خرد شده",
    "normalizedName": "ساقه کرفس ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه کرفس ریز خرد شده"
    ]
  },
  {
    "id": "ing-91d00b49",
    "name": "هویج ریز خرد شده",
    "normalizedName": "هویج ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج ریز خرد شده"
    ]
  },
  {
    "id": "ing-326c7a3b",
    "name": "سینه مرغ کوچک",
    "normalizedName": "سینه مرغ کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ کوچک"
    ]
  },
  {
    "id": "ing-1ce41137",
    "name": "فلفل دلمه ای خرد",
    "normalizedName": "فلفل دلمه ای خرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای خرد"
    ]
  },
  {
    "id": "ing-191c250c",
    "name": "کدوی خرد یا حلقه شده",
    "normalizedName": "کدوی خرد یا حلقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدوی خرد یا حلقه شده"
    ]
  },
  {
    "id": "ing-110aa141",
    "name": "پودر سیر یا سیر تازه له شده",
    "normalizedName": "پودر سیر یا سیر تازه له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سیر یا سیر تازه له شده"
    ]
  },
  {
    "id": "ing-353df7ac",
    "name": "مخمر خشک فعال (خمیر مایه)",
    "normalizedName": "مخمر خشک فعال (خمیر مایه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمر خشک فعال (خمیر مایه)"
    ]
  },
  {
    "id": "ing-646071fc",
    "name": "آب گرم ( حدود",
    "normalizedName": "اب گرم ( حدود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گرم ( حدود"
    ]
  },
  {
    "id": "ing-d06b2f58",
    "name": "گوشت بوقلمون چرخ کرده",
    "normalizedName": "گوشت بوقلمون چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت بوقلمون چرخ کرده"
    ]
  },
  {
    "id": "ing-878b3564",
    "name": "سس سویا برای سس مخصوص",
    "normalizedName": "سس سویا برای سس مخصوص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سویا برای سس مخصوص"
    ]
  },
  {
    "id": "ing-6c72719f",
    "name": "پیازچه خرد برای تزیین",
    "normalizedName": "پیازچه خرد برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه خرد برای تزیین"
    ]
  },
  {
    "id": "ing-50a7886f",
    "name": "سیب زمینی خرد شده",
    "normalizedName": "سیب زمینی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی خرد شده"
    ]
  },
  {
    "id": "ing-92b61cee",
    "name": "زنجبیل تازه و رنده شده",
    "normalizedName": "زنجبیل تازه و رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه و رنده شده"
    ]
  },
  {
    "id": "ing-5430f2dc",
    "name": "برگ گشنیز خرد شده",
    "normalizedName": "برگ گشنیز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ گشنیز خرد شده"
    ]
  },
  {
    "id": "ing-11472653",
    "name": "سیر رنده یا خرد شده",
    "normalizedName": "سیر رنده یا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر رنده یا خرد شده"
    ]
  },
  {
    "id": "ing-f69e4309",
    "name": "هویج نگینی خرد شده",
    "normalizedName": "هویج نگینی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج نگینی خرد شده"
    ]
  },
  {
    "id": "ing-c7c13280",
    "name": "سیب زمینی نگینی خرد شده",
    "normalizedName": "سیب زمینی نگینی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی نگینی خرد شده"
    ]
  },
  {
    "id": "ing-fd484bf8",
    "name": "ذرت تازه یا منجمد",
    "normalizedName": "ذرت تازه یا منجمد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت تازه یا منجمد"
    ]
  },
  {
    "id": "ing-c5a7c029",
    "name": "نخود فرنگی تازه یا منجمد",
    "normalizedName": "نخود فرنگی تازه یا منجمد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی تازه یا منجمد"
    ]
  },
  {
    "id": "ing-9294d8d3",
    "name": "ادویه ایتالیایی( اختیاری)",
    "normalizedName": "ادویه ایتالیایی( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه ایتالیایی( اختیاری)"
    ]
  },
  {
    "id": "ing-f4a367de",
    "name": "گوشت خورشتی گوسفند یا گوساله",
    "normalizedName": "گوشت خورشتی گوسفند یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت خورشتی گوسفند یا گوساله"
    ]
  },
  {
    "id": "ing-88747899",
    "name": "فلفل قرمز تازه",
    "normalizedName": "فلفل قرمز تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز تازه"
    ]
  },
  {
    "id": "ing-83883ea1",
    "name": "آلوبخارا تازه",
    "normalizedName": "الوبخارا تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلوبخارا تازه"
    ]
  },
  {
    "id": "ing-d27143dc",
    "name": "گشنیز یا جعفری تازه",
    "normalizedName": "گشنیز یا جعفری تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز یا جعفری تازه"
    ]
  },
  {
    "id": "ing-476633e4",
    "name": "چغندر (لبو)",
    "normalizedName": "چغندر (لبو)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر (لبو)"
    ]
  },
  {
    "id": "ing-bb266840",
    "name": "پیازچه ریز خرد شده",
    "normalizedName": "پیازچه ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه ریز خرد شده"
    ]
  },
  {
    "id": "ing-6bf695df",
    "name": "رنده پوست لیموترش",
    "normalizedName": "رنده پوست لیموترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست لیموترش"
    ]
  },
  {
    "id": "ing-ecdcd2cb",
    "name": "ران مرغ بدون استخوان",
    "normalizedName": "ران مرغ بدون استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران مرغ بدون استخوان"
    ]
  },
  {
    "id": "ing-77a0bc2",
    "name": "روغن گیاهی برای کباب کردن",
    "normalizedName": "روغن گیاهی برای کباب کردن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن گیاهی برای کباب کردن"
    ]
  },
  {
    "id": "ing-b0ee6950",
    "name": "رنده پوست لیمو",
    "normalizedName": "رنده پوست لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست لیمو"
    ]
  },
  {
    "id": "ing-bcf33276",
    "name": "آب پرتقال تازه",
    "normalizedName": "اب پرتقال تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب پرتقال تازه"
    ]
  },
  {
    "id": "ing-d0e003d4",
    "name": "خلال پسته و بادام برای تزئین (اختیاری)",
    "normalizedName": "خلال پسته و بادام برای تزئین (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته و بادام برای تزئین (اختیاری)"
    ]
  },
  {
    "id": "ing-df59374e",
    "name": "پنیر سوئیسی",
    "normalizedName": "پنیر سوئیسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر سوئیسی"
    ]
  },
  {
    "id": "ing-ce826d68",
    "name": "خرده نان ادویه زده یا پودر سوخاری",
    "normalizedName": "خرده نان ادویه زده یا پودر سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده نان ادویه زده یا پودر سوخاری"
    ]
  },
  {
    "id": "ing-9bafb452",
    "name": "روغن کمی برای تفت دادن",
    "normalizedName": "روغن کمی برای تفت دادن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کمی برای تفت دادن"
    ]
  },
  {
    "id": "ing-993d5ec5",
    "name": "موسیر رنده شده",
    "normalizedName": "موسیر رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موسیر رنده شده"
    ]
  },
  {
    "id": "ing-27ab39e1",
    "name": "کدو سبز درشت رنده شده",
    "normalizedName": "کدو سبز درشت رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو سبز درشت رنده شده"
    ]
  },
  {
    "id": "ing-95473277",
    "name": "ریحان ریز خرد شده",
    "normalizedName": "ریحان ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان ریز خرد شده"
    ]
  },
  {
    "id": "ing-f2844b6e",
    "name": "نمک به میزان لازم",
    "normalizedName": "نمک به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک به میزان لازم"
    ]
  },
  {
    "id": "ing-685fda59",
    "name": "زرده تخم مرغ هم زده",
    "normalizedName": "زرده تخم مرغ هم زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرغ هم زده"
    ]
  },
  {
    "id": "ing-ef20f0fd",
    "name": "مخمر نان",
    "normalizedName": "مخمر نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمر نان"
    ]
  },
  {
    "id": "ing-85616725",
    "name": "سوسیس از وسط نصف شده",
    "normalizedName": "سوسیس از وسط نصف شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس از وسط نصف شده"
    ]
  },
  {
    "id": "ing-1b4f9ee4",
    "name": "سیب زمینی بزرگ رنده شده",
    "normalizedName": "سیب زمینی بزرگ رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی بزرگ رنده شده"
    ]
  },
  {
    "id": "ing-c1916469",
    "name": "دانه انار مقداری",
    "normalizedName": "دانه انار مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار مقداری"
    ]
  },
  {
    "id": "ing-b7de201a",
    "name": "گشنیز تازه و خرد شده",
    "normalizedName": "گشنیز تازه و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز تازه و خرد شده"
    ]
  },
  {
    "id": "ing-fa952980",
    "name": "روغن کمی",
    "normalizedName": "روغن کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کمی"
    ]
  },
  {
    "id": "ing-238b0c62",
    "name": "ادویه کاجون",
    "normalizedName": "ادویه کاجون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه کاجون"
    ]
  },
  {
    "id": "ing-ea7728cb",
    "name": "گلابی رسیده",
    "normalizedName": "گلابی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی رسیده"
    ]
  },
  {
    "id": "ing-70833942",
    "name": "شربت طلایی یا شربت زنجبیل کمی",
    "normalizedName": "شربت طلایی یا شربت زنجبیل کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت طلایی یا شربت زنجبیل کمی"
    ]
  },
  {
    "id": "ing-b33a31e8",
    "name": "نان تست سبوس دار",
    "normalizedName": "نان تست سبوس دار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست سبوس دار"
    ]
  },
  {
    "id": "ing-3e58ad77",
    "name": "شپله (میوه کبر) خرد شده",
    "normalizedName": "شپله (میوه کبر) خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شپله (میوه کبر) خرد شده"
    ]
  },
  {
    "id": "ing-4b2375b8",
    "name": "پارمزان رنده شده",
    "normalizedName": "پارمزان رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پارمزان رنده شده"
    ]
  },
  {
    "id": "ing-1c31821b",
    "name": "روغن زیتون به میزان لازم",
    "normalizedName": "روغن زیتون به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون به میزان لازم"
    ]
  },
  {
    "id": "ing-7402af2f",
    "name": "روغن زیتون (برای‌ تهیه سس)",
    "normalizedName": "روغن زیتون (برای تهیه سس)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون (برای‌ تهیه سس)"
    ]
  },
  {
    "id": "ing-1406b51",
    "name": "گوجه خرد یا رنده شده",
    "normalizedName": "گوجه خرد یا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه خرد یا رنده شده"
    ]
  },
  {
    "id": "ing-27bf8dbd",
    "name": "شکر (اختیاری)",
    "normalizedName": "شکر (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر (اختیاری)"
    ]
  },
  {
    "id": "ing-cadc718e",
    "name": "چیلی سبز",
    "normalizedName": "چیلی سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیلی سبز"
    ]
  },
  {
    "id": "ing-ce10db6c",
    "name": "گرام‌ماسالا",
    "normalizedName": "گرام ماسالا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گرام‌ماسالا"
    ]
  },
  {
    "id": "ing-49f869c4",
    "name": "ژامبون گوشت دودی",
    "normalizedName": "ژامبون گوشت دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون گوشت دودی"
    ]
  },
  {
    "id": "ing-2bc9bf98",
    "name": "عصاره مرغ (یا سبزیجات)",
    "normalizedName": "عصاره مرغ (یا سبزیجات)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره مرغ (یا سبزیجات)"
    ]
  },
  {
    "id": "ing-e777c499",
    "name": "فلفل هالوپینو خرد شده",
    "normalizedName": "فلفل هالوپینو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل هالوپینو خرد شده"
    ]
  },
  {
    "id": "ing-fc337d26",
    "name": "تخم کتان",
    "normalizedName": "تخم کتان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم کتان"
    ]
  },
  {
    "id": "ing-891371a3",
    "name": "موز رسیده له شده",
    "normalizedName": "موز رسیده له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز رسیده له شده"
    ]
  },
  {
    "id": "ing-85b4ce5a",
    "name": "چیپس شکلاتی تلخ",
    "normalizedName": "چیپس شکلاتی تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی تلخ"
    ]
  },
  {
    "id": "ing-70ae34a",
    "name": "بیکن دودی",
    "normalizedName": "بیکن دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیکن دودی"
    ]
  },
  {
    "id": "ing-6e7a5719",
    "name": "نان کروتان",
    "normalizedName": "نان کروتان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان کروتان"
    ]
  },
  {
    "id": "ing-bb6b361b",
    "name": "کاهو فرانسوی چند برگ",
    "normalizedName": "کاهو فرانسوی چند برگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو فرانسوی چند برگ"
    ]
  },
  {
    "id": "ing-b9a8e0dd",
    "name": "خمیر ورقه ای 2قطعه",
    "normalizedName": "خمیر ورقه ای 2قطعه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر ورقه ای 2قطعه"
    ]
  },
  {
    "id": "ing-a9ec3a9f",
    "name": "قارچ اسلایس",
    "normalizedName": "قارچ اسلایس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ اسلایس"
    ]
  },
  {
    "id": "ing-c73032d1",
    "name": "سینه مرغ خورد شده",
    "normalizedName": "سینه مرغ خورد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ خورد شده"
    ]
  },
  {
    "id": "ing-b7e7176a",
    "name": "نمک و فلفل بسته به ذائقه",
    "normalizedName": "نمک و فلفل بسته به ذائقه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل بسته به ذائقه"
    ]
  },
  {
    "id": "ing-c0cfab3d",
    "name": "راسته گوساله",
    "normalizedName": "راسته گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "راسته گوساله"
    ]
  },
  {
    "id": "ing-6dcbfa9f",
    "name": "آویشن خشک به میزان دلخواه",
    "normalizedName": "اویشن خشک به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن خشک به میزان دلخواه"
    ]
  },
  {
    "id": "ing-c749ce2f",
    "name": "کاهو و گشنیز",
    "normalizedName": "کاهو و گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو و گشنیز"
    ]
  },
  {
    "id": "ing-f81bcdb9",
    "name": "موز متوسط",
    "normalizedName": "موز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز متوسط"
    ]
  },
  {
    "id": "ing-dfbd316c",
    "name": "هویج بزرگ خرد شده از طول",
    "normalizedName": "هویج بزرگ خرد شده از طول",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج بزرگ خرد شده از طول"
    ]
  },
  {
    "id": "ing-b6ff27af",
    "name": "لوبیاسبزخرد شده",
    "normalizedName": "لوبیاسبزخرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیاسبزخرد شده"
    ]
  },
  {
    "id": "ing-6fe2e9f2",
    "name": "فیله گوشت",
    "normalizedName": "فیله گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله گوشت"
    ]
  },
  {
    "id": "ing-f21f3aaf",
    "name": "روغن نباتی",
    "normalizedName": "روغن نباتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن نباتی"
    ]
  },
  {
    "id": "ing-d3170b85",
    "name": "گوشت چرخ کرده گوساله",
    "normalizedName": "گوشت چرخ کرده گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده گوساله"
    ]
  },
  {
    "id": "ing-2bb93bba",
    "name": "پیاز کوچک رنده شده و کمی آب گرفته",
    "normalizedName": "پیاز کوچک رنده شده و کمی اب گرفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک رنده شده و کمی آب گرفته"
    ]
  },
  {
    "id": "ing-e801862b",
    "name": "نان همبرگری",
    "normalizedName": "نان همبرگری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان همبرگری"
    ]
  },
  {
    "id": "ing-98a73aaf",
    "name": "برگ رز ماری",
    "normalizedName": "برگ رز ماری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ رز ماری"
    ]
  },
  {
    "id": "ing-f0fbe8a5",
    "name": "کاکوتی یا آویشن خشک",
    "normalizedName": "کاکوتی یا اویشن خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاکوتی یا آویشن خشک"
    ]
  },
  {
    "id": "ing-f930be03",
    "name": "سس فرانسوی",
    "normalizedName": "سس فرانسوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فرانسوی"
    ]
  },
  {
    "id": "ing-791899b7",
    "name": "پنیر ورقه ای",
    "normalizedName": "پنیر ورقه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ورقه ای"
    ]
  },
  {
    "id": "ing-855d54ec",
    "name": "فلفل دلمه",
    "normalizedName": "فلفل دلمه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه"
    ]
  },
  {
    "id": "ing-9aa5da85",
    "name": "ژامبون یا سوسیس",
    "normalizedName": "ژامبون یا سوسیس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون یا سوسیس"
    ]
  },
  {
    "id": "ing-61dd2516",
    "name": "لیمو سنگی",
    "normalizedName": "لیمو سنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو سنگی"
    ]
  },
  {
    "id": "ing-2363afd0",
    "name": "فیله مرغ مزه دار شده",
    "normalizedName": "فیله مرغ مزه دار شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ مزه دار شده"
    ]
  },
  {
    "id": "ing-6da2cea9",
    "name": "تخم مرغ آبپز",
    "normalizedName": "تخم مرغ ابپز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ آبپز"
    ]
  },
  {
    "id": "ing-97322781",
    "name": "ژامبون یا کالباس چرخ شده",
    "normalizedName": "ژامبون یا کالباس چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون یا کالباس چرخ شده"
    ]
  },
  {
    "id": "ing-3b109e1a",
    "name": "گوشت مغز ران گوسفند یا گوساله (بی استخوان)",
    "normalizedName": "گوشت مغز ران گوسفند یا گوساله (بی استخوان)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مغز ران گوسفند یا گوساله (بی استخوان)"
    ]
  },
  {
    "id": "ing-4d738144",
    "name": "میگو ریز",
    "normalizedName": "میگو ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو ریز"
    ]
  },
  {
    "id": "ing-d71262d9",
    "name": "پودر فلفل پاپریکا",
    "normalizedName": "پودر فلفل پاپریکا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل پاپریکا"
    ]
  },
  {
    "id": "ing-aab94270",
    "name": "لوبیا چشم بلبلی پخته شده",
    "normalizedName": "لوبیا چشم بلبلی پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا چشم بلبلی پخته شده"
    ]
  },
  {
    "id": "ing-bc9ea168",
    "name": "فلفل تند کوچک",
    "normalizedName": "فلفل تند کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند کوچک"
    ]
  },
  {
    "id": "ing-6ae3b6a4",
    "name": "روغن حیوانی",
    "normalizedName": "روغن حیوانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن حیوانی"
    ]
  },
  {
    "id": "ing-d7d5ad74",
    "name": "زعفران سائیده و حل شده",
    "normalizedName": "زعفران سائیده و حل شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران سائیده و حل شده"
    ]
  },
  {
    "id": "ing-6fad864c",
    "name": "پنیر پیتزا یا موزارلا",
    "normalizedName": "پنیر پیتزا یا موزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا یا موزارلا"
    ]
  },
  {
    "id": "ing-f3eadd49",
    "name": "فیله مرغ خرد شده",
    "normalizedName": "فیله مرغ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ خرد شده"
    ]
  },
  {
    "id": "ing-9c92112e",
    "name": "شوید خرد شده تازه",
    "normalizedName": "شوید خرد شده تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید خرد شده تازه"
    ]
  },
  {
    "id": "ing-8e928f6c",
    "name": "لوبیا چشم بلبلی پخته",
    "normalizedName": "لوبیا چشم بلبلی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا چشم بلبلی پخته"
    ]
  },
  {
    "id": "ing-44808d32",
    "name": "فیله ماهی بدون استخوان",
    "normalizedName": "فیله ماهی بدون استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی بدون استخوان"
    ]
  },
  {
    "id": "ing-df2e84c0",
    "name": "آب لیموترش",
    "normalizedName": "اب لیموترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیموترش"
    ]
  },
  {
    "id": "ing-f4df2202",
    "name": "سس بشامل رقیق",
    "normalizedName": "سس بشامل رقیق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس بشامل رقیق"
    ]
  },
  {
    "id": "ing-1f152460",
    "name": "نان تست مکعبی",
    "normalizedName": "نان تست مکعبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست مکعبی"
    ]
  },
  {
    "id": "ing-5b9bbaa1",
    "name": "نان سوخاری خرد شده",
    "normalizedName": "نان سوخاری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان سوخاری خرد شده"
    ]
  },
  {
    "id": "ing-2f4873f8",
    "name": "پنیر پیتزا یا پارمزان",
    "normalizedName": "پنیر پیتزا یا پارمزان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا یا پارمزان"
    ]
  },
  {
    "id": "ing-68716a44",
    "name": "تقسیم شده به",
    "normalizedName": "تقسیم شده به",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تقسیم شده به"
    ]
  },
  {
    "id": "ing-add72c55",
    "name": "پیاز متوسط اسلایس شده",
    "normalizedName": "پیاز متوسط اسلایس شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط اسلایس شده"
    ]
  },
  {
    "id": "ing-54d556e5",
    "name": "قرص عصاره مرغ (حل شده در کمی آبجوش)",
    "normalizedName": "قرص عصاره مرغ (حل شده در کمی ابجوش)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قرص عصاره مرغ (حل شده در کمی آبجوش)"
    ]
  },
  {
    "id": "ing-2fbab666",
    "name": "گوشت گوساله (اسکالوپ یا راسته)",
    "normalizedName": "گوشت گوساله (اسکالوپ یا راسته)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوساله (اسکالوپ یا راسته)"
    ]
  },
  {
    "id": "ing-edabe971",
    "name": "نان سبزیجات خشک و خرد شده",
    "normalizedName": "نان سبزیجات خشک و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان سبزیجات خشک و خرد شده"
    ]
  },
  {
    "id": "ing-8588dc2b",
    "name": "فلفل چیلی خرد شده",
    "normalizedName": "فلفل چیلی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل چیلی خرد شده"
    ]
  },
  {
    "id": "ing-6e064c5d",
    "name": "پودر گشنیز خشک",
    "normalizedName": "پودر گشنیز خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گشنیز خشک"
    ]
  },
  {
    "id": "ing-ab82ef3c",
    "name": "گوشت کت گاو یا گوساله تکه شده",
    "normalizedName": "گوشت کت گاو یا گوساله تکه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت کت گاو یا گوساله تکه شده"
    ]
  },
  {
    "id": "ing-6897315d",
    "name": "گوشت گردن با استخوان",
    "normalizedName": "گوشت گردن با استخوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گردن با استخوان"
    ]
  },
  {
    "id": "ing-6b92b350",
    "name": "گوشت گردن گوشفند",
    "normalizedName": "گوشت گردن گوشفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گردن گوشفند"
    ]
  },
  {
    "id": "ing-6b2544ff",
    "name": "زردچوبه و فلفل سیاه",
    "normalizedName": "زردچوبه و فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و فلفل سیاه"
    ]
  },
  {
    "id": "ing-adf503b5",
    "name": "عصاره گوشت حل شده در آب جوش",
    "normalizedName": "عصاره گوشت حل شده در اب جوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره گوشت حل شده در آب جوش"
    ]
  },
  {
    "id": "ing-186378e9",
    "name": "کنجد یا مغز تخمه",
    "normalizedName": "کنجد یا مغز تخمه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد یا مغز تخمه"
    ]
  },
  {
    "id": "ing-fa96dccb",
    "name": "روغن ذرت",
    "normalizedName": "روغن ذرت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن ذرت"
    ]
  },
  {
    "id": "ing-6fd49ac7",
    "name": "بلغور جو یا جو پرک",
    "normalizedName": "بلغور جو یا جو پرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلغور جو یا جو پرک"
    ]
  },
  {
    "id": "ing-9527000d",
    "name": "تره فرنگی یا پیازچه خرد شده",
    "normalizedName": "تره فرنگی یا پیازچه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره فرنگی یا پیازچه خرد شده"
    ]
  },
  {
    "id": "ing-5a9122b5",
    "name": "رشته پلوئی",
    "normalizedName": "رشته پلوئی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته پلوئی"
    ]
  },
  {
    "id": "ing-f7ff6dce",
    "name": "برنج سفید دانه درشت",
    "normalizedName": "برنج سفید دانه درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج سفید دانه درشت"
    ]
  },
  {
    "id": "ing-4ddc43f",
    "name": "سس هویسین",
    "normalizedName": "سس هویسین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس هویسین"
    ]
  },
  {
    "id": "ing-3e260f6d",
    "name": "ران و سینه مرغ",
    "normalizedName": "ران و سینه مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ران و سینه مرغ"
    ]
  },
  {
    "id": "ing-d7d8eccd",
    "name": "نخود و لوبیا",
    "normalizedName": "نخود و لوبیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود و لوبیا"
    ]
  },
  {
    "id": "ing-71bc88f4",
    "name": "گوشت با استخوان (کمی چرب)",
    "normalizedName": "گوشت با استخوان (کمی چرب)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت با استخوان (کمی چرب)"
    ]
  },
  {
    "id": "ing-7fb40550",
    "name": "سبزیجات (شامل خرش",
    "normalizedName": "سبزیجات (شامل خرش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات (شامل خرش"
    ]
  },
  {
    "id": "ing-b6f2c452",
    "name": "نعناع و خلواش)",
    "normalizedName": "نعناع و خلواش)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع و خلواش)"
    ]
  },
  {
    "id": "ing-35e89eb2",
    "name": "نعناع و خرش ریز شده",
    "normalizedName": "نعناع و خرش ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع و خرش ریز شده"
    ]
  },
  {
    "id": "ing-6d099e7d",
    "name": "سبزی (شامل نعناع",
    "normalizedName": "سبزی (شامل نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی (شامل نعناع"
    ]
  },
  {
    "id": "ing-5b5ec656",
    "name": "گشنیز و خلواش)",
    "normalizedName": "گشنیز و خلواش)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز و خلواش)"
    ]
  },
  {
    "id": "ing-89b1a206",
    "name": "هویج و چغندر",
    "normalizedName": "هویج و چغندر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج و چغندر"
    ]
  },
  {
    "id": "ing-7b7e1a94",
    "name": "قیسی",
    "normalizedName": "قیسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قیسی"
    ]
  },
  {
    "id": "ing-60857227",
    "name": "شکلات نیمه شیرین (ساده)",
    "normalizedName": "شکلات نیمه شیرین (ساده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین (ساده)"
    ]
  },
  {
    "id": "ing-841368f2",
    "name": "بادام زمینی برشته و خردشده",
    "normalizedName": "بادام زمینی برشته و خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی برشته و خردشده"
    ]
  },
  {
    "id": "ing-2d015854",
    "name": "کاستارد (اختیاری) جهت سرو",
    "normalizedName": "کاستارد (اختیاری) جهت سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاستارد (اختیاری) جهت سرو"
    ]
  },
  {
    "id": "ing-aeaeb722",
    "name": "سبزیجات خرد شده (نعناع",
    "normalizedName": "سبزیجات خرد شده (نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات خرد شده (نعناع"
    ]
  },
  {
    "id": "ing-d4bbeaef",
    "name": "گشنیز)",
    "normalizedName": "گشنیز)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز)"
    ]
  },
  {
    "id": "ing-51c905ed",
    "name": "کنسرو لوبیا آبکشی شده",
    "normalizedName": "کنسرو لوبیا ابکشی شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو لوبیا آبکشی شده"
    ]
  },
  {
    "id": "ing-67007395",
    "name": "ماکارونی ریز",
    "normalizedName": "ماکارونی ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی ریز"
    ]
  },
  {
    "id": "ing-5e697381",
    "name": "نمنک و فلفل",
    "normalizedName": "نمنک و فلفل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمنک و فلفل"
    ]
  },
  {
    "id": "ing-dcc6b43f",
    "name": "زعفران ساییده شده",
    "normalizedName": "زعفران ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران ساییده شده"
    ]
  },
  {
    "id": "ing-f2f93fb9",
    "name": "نمک به میزان کافی",
    "normalizedName": "نمک به میزان کافی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک به میزان کافی"
    ]
  },
  {
    "id": "ing-18d9ff25",
    "name": "گوشت گوساله چرخ کرده",
    "normalizedName": "گوشت گوساله چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوساله چرخ کرده"
    ]
  },
  {
    "id": "ing-26e9bda",
    "name": "جعفری ساطوری",
    "normalizedName": "جعفری ساطوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری ساطوری"
    ]
  },
  {
    "id": "ing-f3cec8f0",
    "name": "تخم مرغ زده",
    "normalizedName": "تخم مرغ زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ زده"
    ]
  },
  {
    "id": "ing-39670b23",
    "name": "سیب زمینی پخته پوست گرفته",
    "normalizedName": "سیب زمینی پخته پوست گرفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی پخته پوست گرفته"
    ]
  },
  {
    "id": "ing-62a8365b",
    "name": "کره سرد خرد شده",
    "normalizedName": "کره سرد خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره سرد خرد شده"
    ]
  },
  {
    "id": "ing-2bdf0f1",
    "name": "آب لیمو یا آب نارنج",
    "normalizedName": "اب لیمو یا اب نارنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو یا آب نارنج"
    ]
  },
  {
    "id": "ing-eae789f1",
    "name": "آب نارنج یا آب لیمو",
    "normalizedName": "اب نارنج یا اب لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارنج یا آب لیمو"
    ]
  },
  {
    "id": "ing-8da48e06",
    "name": "جعفری ساطوری شده",
    "normalizedName": "جعفری ساطوری شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری ساطوری شده"
    ]
  },
  {
    "id": "ing-b65e5f10",
    "name": "نخود آبگوشتی",
    "normalizedName": "نخود ابگوشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود آبگوشتی"
    ]
  },
  {
    "id": "ing-31f65a09",
    "name": "تره و ترخون) ساطوری شده",
    "normalizedName": "تره و ترخون) ساطوری شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره و ترخون) ساطوری شده"
    ]
  },
  {
    "id": "ing-bff1fc09",
    "name": "کشمش یا آلو",
    "normalizedName": "کشمش یا الو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش یا آلو"
    ]
  },
  {
    "id": "ing-ca618974",
    "name": "گوجه فرنگی پوست کنده",
    "normalizedName": "گوجه فرنگی پوست کنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی پوست کنده"
    ]
  },
  {
    "id": "ing-66cf9d55",
    "name": "نعناع و جعفری ساطوری",
    "normalizedName": "نعناع و جعفری ساطوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع و جعفری ساطوری"
    ]
  },
  {
    "id": "ing-90443565",
    "name": "کره آب کرده",
    "normalizedName": "کره اب کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره آب کرده"
    ]
  },
  {
    "id": "ing-584414f6",
    "name": "كره‌ي بي‌نمك نرم شده",
    "normalizedName": "کره ی بی نمک نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كره‌ي بي‌نمك نرم شده"
    ]
  },
  {
    "id": "ing-2c8f8437",
    "name": "پارمزان ريز رنده شده",
    "normalizedName": "پارمزان ریز رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پارمزان ريز رنده شده"
    ]
  },
  {
    "id": "ing-91250f23",
    "name": "پودر سير",
    "normalizedName": "پودر سیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سير"
    ]
  },
  {
    "id": "ing-b73cfcc6",
    "name": "نمك دانه درشت",
    "normalizedName": "نمک دانه درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك دانه درشت"
    ]
  },
  {
    "id": "ing-a61410b1",
    "name": "نمک دانه درشت و فلفل سیاه",
    "normalizedName": "نمک دانه درشت و فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دانه درشت و فلفل سیاه"
    ]
  },
  {
    "id": "ing-924b68d8",
    "name": "كره‌ي بي‌نمك",
    "normalizedName": "کره ی بی نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كره‌ي بي‌نمك"
    ]
  },
  {
    "id": "ing-ed50015a",
    "name": "خوراک لوبیا کنسروی",
    "normalizedName": "خوراک لوبیا کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خوراک لوبیا کنسروی"
    ]
  },
  {
    "id": "ing-4e5553d9",
    "name": "پودر نعناع خشک",
    "normalizedName": "پودر نعناع خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نعناع خشک"
    ]
  },
  {
    "id": "ing-2f1f6923",
    "name": "نمک و فلفل قرمز",
    "normalizedName": "نمک و فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل قرمز"
    ]
  },
  {
    "id": "ing-d5146fdf",
    "name": "چغاله بادام",
    "normalizedName": "چغاله بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغاله بادام"
    ]
  },
  {
    "id": "ing-e64b7043",
    "name": "آب لیمو ترش و آبغوره",
    "normalizedName": "اب لیمو ترش و ابغوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو ترش و آبغوره"
    ]
  },
  {
    "id": "ing-2decc716",
    "name": "برنج خرد کرده",
    "normalizedName": "برنج خرد کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج خرد کرده"
    ]
  },
  {
    "id": "ing-e68c805",
    "name": "سماق خشک",
    "normalizedName": "سماق خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سماق خشک"
    ]
  },
  {
    "id": "ing-aba942b4",
    "name": "سبزی (تره",
    "normalizedName": "سبزی (تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی (تره"
    ]
  },
  {
    "id": "ing-f894ca80",
    "name": "گشنیز و کمی نعناع)",
    "normalizedName": "گشنیز و کمی نعناع)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز و کمی نعناع)"
    ]
  },
  {
    "id": "ing-8ad12572",
    "name": "پیاز درشت سرخ شده",
    "normalizedName": "پیاز درشت سرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز درشت سرخ شده"
    ]
  },
  {
    "id": "ing-e0d787b4",
    "name": "خلواش",
    "normalizedName": "خلواش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلواش"
    ]
  },
  {
    "id": "ing-59ce951b",
    "name": "نعناع و کمی اسفناج )",
    "normalizedName": "نعناع و کمی اسفناج )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع و کمی اسفناج )"
    ]
  },
  {
    "id": "ing-d4699342",
    "name": "زردچوبه و فلفل و نمک",
    "normalizedName": "زردچوبه و فلفل و نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و فلفل و نمک"
    ]
  },
  {
    "id": "ing-f9b38bf9",
    "name": "سبزی قورمه",
    "normalizedName": "سبزی قورمه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی قورمه"
    ]
  },
  {
    "id": "ing-9193bbd2",
    "name": "ماست ساده پرچرب",
    "normalizedName": "ماست ساده پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست ساده پرچرب"
    ]
  },
  {
    "id": "ing-e5c63052",
    "name": "خامه ترش کم چرب",
    "normalizedName": "خامه ترش کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش کم چرب"
    ]
  },
  {
    "id": "ing-a3ad5405",
    "name": "کلم قرمز خرد شده",
    "normalizedName": "کلم قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم قرمز خرد شده"
    ]
  },
  {
    "id": "ing-35651698",
    "name": "پیاز کوچک اسلایس شده",
    "normalizedName": "پیاز کوچک اسلایس شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک اسلایس شده"
    ]
  },
  {
    "id": "ing-73d37c6e",
    "name": "ماهی تیلاپیا فیله شده",
    "normalizedName": "ماهی تیلاپیا فیله شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی تیلاپیا فیله شده"
    ]
  },
  {
    "id": "ing-d0bd428e",
    "name": "میوه دلخواه",
    "normalizedName": "میوه دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه دلخواه"
    ]
  },
  {
    "id": "ing-33d8e07c",
    "name": "نان تست مکعبی شده",
    "normalizedName": "نان تست مکعبی شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست مکعبی شده"
    ]
  },
  {
    "id": "ing-2ecc5ac6",
    "name": "مرغ پخته شده خرد شده",
    "normalizedName": "مرغ پخته شده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پخته شده خرد شده"
    ]
  },
  {
    "id": "ing-2d3580e1",
    "name": "بروکلی تازه خرد شده",
    "normalizedName": "بروکلی تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بروکلی تازه خرد شده"
    ]
  },
  {
    "id": "ing-4f05e9e0",
    "name": "سیر له یا رنده شده",
    "normalizedName": "سیر له یا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر له یا رنده شده"
    ]
  },
  {
    "id": "ing-2fd7f016",
    "name": "رول آماده نا کروسان",
    "normalizedName": "رول اماده نا کروسان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رول آماده نا کروسان"
    ]
  },
  {
    "id": "ing-65231e7",
    "name": "سرکه شراب قرمز",
    "normalizedName": "سرکه شراب قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه شراب قرمز"
    ]
  },
  {
    "id": "ing-48bb2b8a",
    "name": "پودر فلفل قرمز تند",
    "normalizedName": "پودر فلفل قرمز تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل قرمز تند"
    ]
  },
  {
    "id": "ing-af2a28e6",
    "name": "میگو تمیز شده",
    "normalizedName": "میگو تمیز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو تمیز شده"
    ]
  },
  {
    "id": "ing-8d987b6",
    "name": "ورقه های نازک و بلند گوشت بوقلمون",
    "normalizedName": "ورقه های نازک و بلند گوشت بوقلمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورقه های نازک و بلند گوشت بوقلمون"
    ]
  },
  {
    "id": "ing-727f64ae",
    "name": "گوشت بوقلمون چرخ شده بدون چربی",
    "normalizedName": "گوشت بوقلمون چرخ شده بدون چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت بوقلمون چرخ شده بدون چربی"
    ]
  },
  {
    "id": "ing-13cde884",
    "name": "نان فرانسوی",
    "normalizedName": "نان فرانسوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان فرانسوی"
    ]
  },
  {
    "id": "ing-e2dec5ec",
    "name": "روغن هسته انگور یا روغن کنجد",
    "normalizedName": "روغن هسته انگور یا روغن کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن هسته انگور یا روغن کنجد"
    ]
  },
  {
    "id": "ing-6288990d",
    "name": "بادمجان درشت",
    "normalizedName": "بادمجان درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان درشت"
    ]
  },
  {
    "id": "ing-bc43e292",
    "name": "آب انار ترش یا آبغوره",
    "normalizedName": "اب انار ترش یا ابغوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب انار ترش یا آبغوره"
    ]
  },
  {
    "id": "ing-da51e482",
    "name": "خلواش و چوچاق ریز شده تازه یا خشک",
    "normalizedName": "خلواش و چوچاق ریز شده تازه یا خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلواش و چوچاق ریز شده تازه یا خشک"
    ]
  },
  {
    "id": "ing-edd9d4f1",
    "name": "گرد لیمو",
    "normalizedName": "گرد لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گرد لیمو"
    ]
  },
  {
    "id": "ing-a900466f",
    "name": "روغن و پیاز",
    "normalizedName": "روغن و پیاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و پیاز"
    ]
  },
  {
    "id": "ing-2470a5cc",
    "name": "ادویه و نمک",
    "normalizedName": "ادویه و نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه و نمک"
    ]
  },
  {
    "id": "ing-e14a70b0",
    "name": "ماهی تکه تکه شده",
    "normalizedName": "ماهی تکه تکه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی تکه تکه شده"
    ]
  },
  {
    "id": "ing-b708306f",
    "name": "فلفل سبز شیرین",
    "normalizedName": "فلفل سبز شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز شیرین"
    ]
  },
  {
    "id": "ing-d783cabd",
    "name": "آبلیمو وزعفران",
    "normalizedName": "ابلیمو وزعفران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو وزعفران"
    ]
  },
  {
    "id": "ing-ea867bc1",
    "name": "پرک بادام",
    "normalizedName": "پرک بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرک بادام"
    ]
  },
  {
    "id": "ing-e7b6e773",
    "name": "برگه زرد آلو",
    "normalizedName": "برگه زرد الو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگه زرد آلو"
    ]
  },
  {
    "id": "ing-5d8029b1",
    "name": "زرد آلو خشک",
    "normalizedName": "زرد الو خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرد آلو خشک"
    ]
  },
  {
    "id": "ing-4d0bbe03",
    "name": "کنجد سائیده شده",
    "normalizedName": "کنجد سائیده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد سائیده شده"
    ]
  },
  {
    "id": "ing-7b2714a1",
    "name": "غوره",
    "normalizedName": "غوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "غوره"
    ]
  },
  {
    "id": "ing-71887e91",
    "name": "آلوی خشک",
    "normalizedName": "الوی خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلوی خشک"
    ]
  },
  {
    "id": "ing-3f1beaf3",
    "name": "مرغ پاک شده و قطعه قطعه شده",
    "normalizedName": "مرغ پاک شده و قطعه قطعه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پاک شده و قطعه قطعه شده"
    ]
  },
  {
    "id": "ing-510f4f41",
    "name": "شکر گرانوله شده",
    "normalizedName": "شکر گرانوله شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر گرانوله شده"
    ]
  },
  {
    "id": "ing-bf82acc1",
    "name": "کاملا خرد شده",
    "normalizedName": "کاملا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاملا خرد شده"
    ]
  },
  {
    "id": "ing-a9ed6f5",
    "name": "کره ی سرد یا روغن شیرینی پزی گیاهی",
    "normalizedName": "کره ی سرد یا روغن شیرینی پزی گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی سرد یا روغن شیرینی پزی گیاهی"
    ]
  },
  {
    "id": "ing-a689e072",
    "name": "ماهی سوف بزرگ",
    "normalizedName": "ماهی سوف بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی سوف بزرگ"
    ]
  },
  {
    "id": "ing-2a5b6811",
    "name": "آب نارنج یا آبلیمو",
    "normalizedName": "اب نارنج یا ابلیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارنج یا آبلیمو"
    ]
  },
  {
    "id": "ing-8ee02d9d",
    "name": "هویج ریز تازه",
    "normalizedName": "هویج ریز تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج ریز تازه"
    ]
  },
  {
    "id": "ing-30eb8d8e",
    "name": "دانه ی رازیانه",
    "normalizedName": "دانه ی رازیانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی رازیانه"
    ]
  },
  {
    "id": "ing-72a7ddaf",
    "name": "دانه گشنیز",
    "normalizedName": "دانه گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه گشنیز"
    ]
  },
  {
    "id": "ing-aee0b085",
    "name": "کلم بروکلی تازه",
    "normalizedName": "کلم بروکلی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی تازه"
    ]
  },
  {
    "id": "ing-2727180f",
    "name": "برگه فلفل قرمز له شده",
    "normalizedName": "برگه فلفل قرمز له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگه فلفل قرمز له شده"
    ]
  },
  {
    "id": "ing-2f8f7f03",
    "name": "عدس نیم پز",
    "normalizedName": "عدس نیم پز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس نیم پز"
    ]
  },
  {
    "id": "ing-e0c009e7",
    "name": "جوانه",
    "normalizedName": "جوانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوانه"
    ]
  },
  {
    "id": "ing-a9409083",
    "name": "جعفری خرد شده (به دلخواه)",
    "normalizedName": "جعفری خرد شده (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خرد شده (به دلخواه)"
    ]
  },
  {
    "id": "ing-b652f8f2",
    "name": "نان تست (به دلخواه)",
    "normalizedName": "نان تست (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست (به دلخواه)"
    ]
  },
  {
    "id": "ing-572e6aaa",
    "name": "ماهی ماکرل تازه",
    "normalizedName": "ماهی ماکرل تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی ماکرل تازه"
    ]
  },
  {
    "id": "ing-7602e0c",
    "name": "سس هاریسا",
    "normalizedName": "سس هاریسا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس هاریسا"
    ]
  },
  {
    "id": "ing-936c5585",
    "name": "پرتقال بزرگ",
    "normalizedName": "پرتقال بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرتقال بزرگ"
    ]
  },
  {
    "id": "ing-4e6a3fe6",
    "name": "مارچوبه ترجیحا درشت",
    "normalizedName": "مارچوبه ترجیحا درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارچوبه ترجیحا درشت"
    ]
  },
  {
    "id": "ing-34dce34d",
    "name": "میگوی خام پاک نشده و بزرگ",
    "normalizedName": "میگوی خام پاک نشده و بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگوی خام پاک نشده و بزرگ"
    ]
  },
  {
    "id": "ing-f069ce8c",
    "name": "سوسیس کوکتل تازه",
    "normalizedName": "سوسیس کوکتل تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس کوکتل تازه"
    ]
  },
  {
    "id": "ing-8cbf50f",
    "name": "صدف دریایی بزرگ",
    "normalizedName": "صدف دریایی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "صدف دریایی بزرگ"
    ]
  },
  {
    "id": "ing-81604fdd",
    "name": "فلفل پاپریکای دودی شده به میزان دلخواه",
    "normalizedName": "فلفل پاپریکای دودی شده به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل پاپریکای دودی شده به میزان دلخواه"
    ]
  },
  {
    "id": "ing-d4159ca6",
    "name": "آب انگور تازه یا سرکه قرمز",
    "normalizedName": "اب انگور تازه یا سرکه قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب انگور تازه یا سرکه قرمز"
    ]
  },
  {
    "id": "ing-f11cef34",
    "name": "روغن زیتون و نان باگت جهت سرو",
    "normalizedName": "روغن زیتون و نان باگت جهت سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون و نان باگت جهت سرو"
    ]
  },
  {
    "id": "ing-d4d8432b",
    "name": "فیله گاو",
    "normalizedName": "فیله گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله گاو"
    ]
  },
  {
    "id": "ing-f876940e",
    "name": "دانه های رازیانه",
    "normalizedName": "دانه های رازیانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه های رازیانه"
    ]
  },
  {
    "id": "ing-7ae4f8bc",
    "name": "سیب زمینی تازه و ریز",
    "normalizedName": "سیب زمینی تازه و ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی تازه و ریز"
    ]
  },
  {
    "id": "ing-736cac45",
    "name": "گوشت بره چرخ شده ی مرغوب",
    "normalizedName": "گوشت بره چرخ شده ی مرغوب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت بره چرخ شده ی مرغوب"
    ]
  },
  {
    "id": "ing-cf186269",
    "name": "ماست ساده یا خامه ای",
    "normalizedName": "ماست ساده یا خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست ساده یا خامه ای"
    ]
  },
  {
    "id": "ing-1996c062",
    "name": "نان لواش یا نان پیتا یا هر نان دیگر جهت سرو",
    "normalizedName": "نان لواش یا نان پیتا یا هر نان دیگر جهت سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان لواش یا نان پیتا یا هر نان دیگر جهت سرو"
    ]
  },
  {
    "id": "ing-922c4349",
    "name": "میگوی خام بزرگ همراه با سر و پوسته هایش",
    "normalizedName": "میگوی خام بزرگ همراه با سر و پوسته هایش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگوی خام بزرگ همراه با سر و پوسته هایش"
    ]
  },
  {
    "id": "ing-47e7eed3",
    "name": "برنج ریزوتو",
    "normalizedName": "برنج ریزوتو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج ریزوتو"
    ]
  },
  {
    "id": "ing-73c5586a",
    "name": "زعفران اختیاری",
    "normalizedName": "زعفران اختیاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران اختیاری"
    ]
  },
  {
    "id": "ing-3c007fec",
    "name": "اسکویید (ماهی مرکب) کوچک",
    "normalizedName": "اسکویید (ماهی مرکب) کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسکویید (ماهی مرکب) کوچک"
    ]
  },
  {
    "id": "ing-930b6cb7",
    "name": "پنیر ریکوتا بدون آب",
    "normalizedName": "پنیر ریکوتا بدون اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا بدون آب"
    ]
  },
  {
    "id": "ing-cdcdda4d",
    "name": "خرده نان تازه",
    "normalizedName": "خرده نان تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده نان تازه"
    ]
  },
  {
    "id": "ing-f47bd41f",
    "name": "باقالی تازه",
    "normalizedName": "باقالی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقالی تازه"
    ]
  },
  {
    "id": "ing-378662fb",
    "name": "برگه فلفل خشک شده",
    "normalizedName": "برگه فلفل خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگه فلفل خشک شده"
    ]
  },
  {
    "id": "ing-8ca49ce8",
    "name": "رب گوجه تازه",
    "normalizedName": "رب گوجه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه تازه"
    ]
  },
  {
    "id": "ing-8e32125d",
    "name": "کمی شکر جهت مزه دار کردن غذا",
    "normalizedName": "کمی شکر جهت مزه دار کردن غذا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کمی شکر جهت مزه دار کردن غذا"
    ]
  },
  {
    "id": "ing-e0c03ab3",
    "name": "فیله ماهی سفید با پوست",
    "normalizedName": "فیله ماهی سفید با پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی سفید با پوست"
    ]
  },
  {
    "id": "ing-f20b4ea0",
    "name": "مرزنگوش یا پونه کوهی",
    "normalizedName": "مرزنگوش یا پونه کوهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرزنگوش یا پونه کوهی"
    ]
  },
  {
    "id": "ing-1fa5c773",
    "name": "آب سبزیجات پخته",
    "normalizedName": "اب سبزیجات پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب سبزیجات پخته"
    ]
  },
  {
    "id": "ing-e54b4e12",
    "name": "سینه ی اردک گوشتی با پوست",
    "normalizedName": "سینه ی اردک گوشتی با پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه ی اردک گوشتی با پوست"
    ]
  },
  {
    "id": "ing-2fca5287",
    "name": "ادویه هندی یا چینی",
    "normalizedName": "ادویه هندی یا چینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه هندی یا چینی"
    ]
  },
  {
    "id": "ing-c7a66919",
    "name": "آناناس رسیده کوچک",
    "normalizedName": "اناناس رسیده کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس رسیده کوچک"
    ]
  },
  {
    "id": "ing-1d11c58a",
    "name": "بادام زمینی برشته شده",
    "normalizedName": "بادام زمینی برشته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی برشته شده"
    ]
  },
  {
    "id": "ing-ab7590c5",
    "name": "سرکه سرخ",
    "normalizedName": "سرکه سرخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سرخ"
    ]
  },
  {
    "id": "ing-144d6e58",
    "name": "ترخون تازه یک مشت",
    "normalizedName": "ترخون تازه یک مشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترخون تازه یک مشت"
    ]
  },
  {
    "id": "ing-51162470",
    "name": "پیازکوهی تازه",
    "normalizedName": "پیازکوهی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازکوهی تازه"
    ]
  },
  {
    "id": "ing-17d4efc4",
    "name": "دانه کیپر یا شپله",
    "normalizedName": "دانه کیپر یا شپله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه کیپر یا شپله"
    ]
  },
  {
    "id": "ing-3026123c",
    "name": "لوبیا سبز ریز و تازه",
    "normalizedName": "لوبیا سبز ریز و تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سبز ریز و تازه"
    ]
  },
  {
    "id": "ing-61f3db3b",
    "name": "استیک ماهی تن",
    "normalizedName": "استیک ماهی تن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استیک ماهی تن"
    ]
  },
  {
    "id": "ing-b3829906",
    "name": "گشنیز ساییده شده",
    "normalizedName": "گشنیز ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز ساییده شده"
    ]
  },
  {
    "id": "ing-b8942256",
    "name": "شوید تازه یک دسته",
    "normalizedName": "شوید تازه یک دسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید تازه یک دسته"
    ]
  },
  {
    "id": "ing-a7f03470",
    "name": "فیله سالمون با پوست",
    "normalizedName": "فیله سالمون با پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله سالمون با پوست"
    ]
  },
  {
    "id": "ing-1e98f5a7",
    "name": "روغن زیتون یا روغن آفتابگردان",
    "normalizedName": "روغن زیتون یا روغن افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا روغن آفتابگردان"
    ]
  },
  {
    "id": "ing-43f8fd4b",
    "name": "خامه ترش یا مایونز کم چرب",
    "normalizedName": "خامه ترش یا مایونز کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش یا مایونز کم چرب"
    ]
  },
  {
    "id": "ing-678e3282",
    "name": "فلفل سیاه تازه ساییده شده",
    "normalizedName": "فلفل سیاه تازه ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه تازه ساییده شده"
    ]
  },
  {
    "id": "ing-a9a12a90",
    "name": "پنیر پارمزان یک قطعه",
    "normalizedName": "پنیر پارمزان یک قطعه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان یک قطعه"
    ]
  },
  {
    "id": "ing-1877f12f",
    "name": "سرکه انگور سفید",
    "normalizedName": "سرکه انگور سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه انگور سفید"
    ]
  },
  {
    "id": "ing-fae8cd8c",
    "name": "تا حدامکان تازه باشد",
    "normalizedName": "تا حدامکان تازه باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تا حدامکان تازه باشد"
    ]
  },
  {
    "id": "ing-412e0557",
    "name": "روغن آفتاب گردان یا گیاهی",
    "normalizedName": "روغن افتاب گردان یا گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن آفتاب گردان یا گیاهی"
    ]
  },
  {
    "id": "ing-ecfcb27a",
    "name": "نمک دریا",
    "normalizedName": "نمک دریا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دریا"
    ]
  },
  {
    "id": "ing-d7f7c95b",
    "name": "سوسیس چوریزو",
    "normalizedName": "سوسیس چوریزو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس چوریزو"
    ]
  },
  {
    "id": "ing-22d18915",
    "name": "سس فلفلی تاباسکو چند قطره",
    "normalizedName": "سس فلفلی تاباسکو چند قطره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فلفلی تاباسکو چند قطره"
    ]
  },
  {
    "id": "ing-74f6888c",
    "name": "نان مرغوب",
    "normalizedName": "نان مرغوب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان مرغوب"
    ]
  },
  {
    "id": "ing-5fbec0e9",
    "name": "ترشی یا شور شپله",
    "normalizedName": "ترشی یا شور شپله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترشی یا شور شپله"
    ]
  },
  {
    "id": "ing-9449f8ed",
    "name": "ماکارونی یا پاستای صدفی",
    "normalizedName": "ماکارونی یا پاستای صدفی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی یا پاستای صدفی"
    ]
  },
  {
    "id": "ing-69648d90",
    "name": "نمک و پودر فلفل سیاه",
    "normalizedName": "نمک و پودر فلفل سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و پودر فلفل سیاه"
    ]
  },
  {
    "id": "ing-b5b5a7a0",
    "name": "فیله ماهی هالیبوت",
    "normalizedName": "فیله ماهی هالیبوت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی هالیبوت"
    ]
  },
  {
    "id": "ing-eba2f4c3",
    "name": "گوجه فرنگی گیلاسی",
    "normalizedName": "گوجه فرنگی گیلاسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی گیلاسی"
    ]
  },
  {
    "id": "ing-ea8a651e",
    "name": "سس پستوی تازه",
    "normalizedName": "سس پستوی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس پستوی تازه"
    ]
  },
  {
    "id": "ing-c24a8040",
    "name": "نان به دلخواه",
    "normalizedName": "نان به دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان به دلخواه"
    ]
  },
  {
    "id": "ing-78494a61",
    "name": "روغن به میزان لازم",
    "normalizedName": "روغن به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن به میزان لازم"
    ]
  },
  {
    "id": "ing-d5c00a49",
    "name": "ماءالشعیر ساده",
    "normalizedName": "ماءالشعیر ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماءالشعیر ساده"
    ]
  },
  {
    "id": "ing-ce176a00",
    "name": "سیب زمینی آب پز",
    "normalizedName": "سیب زمینی اب پز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی آب پز"
    ]
  },
  {
    "id": "ing-2c9bff7",
    "name": "سس گوجه فرنگی جهت سرو",
    "normalizedName": "سس گوجه فرنگی جهت سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوجه فرنگی جهت سرو"
    ]
  },
  {
    "id": "ing-4d687146",
    "name": "پیاز بزرگ ورقه شده",
    "normalizedName": "پیاز بزرگ ورقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز بزرگ ورقه شده"
    ]
  },
  {
    "id": "ing-fb998546",
    "name": "زنجبیل تازه پوست کنده و رنده شده",
    "normalizedName": "زنجبیل تازه پوست کنده و رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه پوست کنده و رنده شده"
    ]
  },
  {
    "id": "ing-ecd10409",
    "name": "گل کلم متوسط خرد شده",
    "normalizedName": "گل کلم متوسط خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم متوسط خرد شده"
    ]
  },
  {
    "id": "ing-e470581c",
    "name": "شیر نارگیل بسته بندی شده",
    "normalizedName": "شیر نارگیل بسته بندی شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نارگیل بسته بندی شده"
    ]
  },
  {
    "id": "ing-ea1cfb14",
    "name": "برگ های اسفناج ریز و تازه چین",
    "normalizedName": "برگ های اسفناج ریز و تازه چین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ های اسفناج ریز و تازه چین"
    ]
  },
  {
    "id": "ing-40b973d4",
    "name": "تره و جعفری خرد شده",
    "normalizedName": "تره و جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره و جعفری خرد شده"
    ]
  },
  {
    "id": "ing-94f0ce76",
    "name": "خامه سفت",
    "normalizedName": "خامه سفت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه سفت"
    ]
  },
  {
    "id": "ing-25f9ac7d",
    "name": "آب نمک رقیق",
    "normalizedName": "اب نمک رقیق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نمک رقیق"
    ]
  },
  {
    "id": "ing-11f9c7a5",
    "name": "آرد سبوس دار",
    "normalizedName": "ارد سبوس دار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سبوس دار"
    ]
  },
  {
    "id": "ing-a7bc822d",
    "name": "زیره درسته",
    "normalizedName": "زیره درسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره درسته"
    ]
  },
  {
    "id": "ing-26b946da",
    "name": "زنجبیل تازه له شده",
    "normalizedName": "زنجبیل تازه له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه له شده"
    ]
  },
  {
    "id": "ing-24d5ea1d",
    "name": "خامه کم چرب",
    "normalizedName": "خامه کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه کم چرب"
    ]
  },
  {
    "id": "ing-df79edb4",
    "name": "فیله مرغ پخته خرد شده",
    "normalizedName": "فیله مرغ پخته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ پخته خرد شده"
    ]
  },
  {
    "id": "ing-7b5f78d1",
    "name": "سبزی محلی (شامل جعفری و گشنیز)",
    "normalizedName": "سبزی محلی (شامل جعفری و گشنیز)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی محلی (شامل جعفری و گشنیز)"
    ]
  },
  {
    "id": "ing-8329afd9",
    "name": "فیله ماهی (معمولا ماهی کاد)",
    "normalizedName": "فیله ماهی (معمولا ماهی کاد)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی (معمولا ماهی کاد)"
    ]
  },
  {
    "id": "ing-28a3093d",
    "name": "سس تارتار برای سرو",
    "normalizedName": "سس تارتار برای سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تارتار برای سرو"
    ]
  },
  {
    "id": "ing-2ddfa794",
    "name": "فلفل و آرد",
    "normalizedName": "فلفل و ارد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و آرد"
    ]
  },
  {
    "id": "ing-fbd73c6b",
    "name": "گوشت چرخ شده ی بره",
    "normalizedName": "گوشت چرخ شده ی بره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ شده ی بره"
    ]
  },
  {
    "id": "ing-f3d858f2",
    "name": "گشنیز تازه خرد شده",
    "normalizedName": "گشنیز تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز تازه خرد شده"
    ]
  },
  {
    "id": "ing-f8d0d98f",
    "name": "نعنای تازه ی خرد شده",
    "normalizedName": "نعنای تازه ی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنای تازه ی خرد شده"
    ]
  },
  {
    "id": "ing-5f7c7289",
    "name": "آرد نخود آبگوشتی",
    "normalizedName": "ارد نخود ابگوشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نخود آبگوشتی"
    ]
  },
  {
    "id": "ing-9641fa0f",
    "name": "نمک و فلفل سیاه میزان دلخواه",
    "normalizedName": "نمک و فلفل سیاه میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل سیاه میزان دلخواه"
    ]
  },
  {
    "id": "ing-d7f489a9",
    "name": "روغن برای مالیدن روی غذا",
    "normalizedName": "روغن برای مالیدن روی غذا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن برای مالیدن روی غذا"
    ]
  },
  {
    "id": "ing-97330d30",
    "name": "روغن سرخ کردنی به میزان لازم",
    "normalizedName": "روغن سرخ کردنی به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن سرخ کردنی به میزان لازم"
    ]
  },
  {
    "id": "ing-84908c06",
    "name": "بروکلی ریز شده",
    "normalizedName": "بروکلی ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بروکلی ریز شده"
    ]
  },
  {
    "id": "ing-6f42150c",
    "name": "سبزی پلوئی (تره",
    "normalizedName": "سبزی پلوئی (تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی پلوئی (تره"
    ]
  },
  {
    "id": "ing-a39f5ab6",
    "name": "گشنیز و کمی شنبلیله)",
    "normalizedName": "گشنیز و کمی شنبلیله)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز و کمی شنبلیله)"
    ]
  },
  {
    "id": "ing-6dc35c54",
    "name": "گوشت ماهیچه",
    "normalizedName": "گوشت ماهیچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ماهیچه"
    ]
  },
  {
    "id": "ing-34ec8517",
    "name": "ژامبون گوشت 90% یا گوشت چرخ کرده",
    "normalizedName": "ژامبون گوشت 90% یا گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون گوشت 90% یا گوشت چرخ کرده"
    ]
  },
  {
    "id": "ing-cffbeb3e",
    "name": "نان پیتا یا تافتون",
    "normalizedName": "نان پیتا یا تافتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان پیتا یا تافتون"
    ]
  },
  {
    "id": "ing-f8643257",
    "name": "سیب زمینی استامبولی",
    "normalizedName": "سیب زمینی استامبولی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی استامبولی"
    ]
  },
  {
    "id": "ing-dbe66b25",
    "name": "لبو به دلخواه برای تزئین",
    "normalizedName": "لبو به دلخواه برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو به دلخواه برای تزئین"
    ]
  },
  {
    "id": "ing-e1c20e90",
    "name": "جعفریِ تازه یک دسته",
    "normalizedName": "جعفریِ تازه یک دسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفریِ تازه یک دسته"
    ]
  },
  {
    "id": "ing-36689700",
    "name": "پودر زیره ی سبز",
    "normalizedName": "پودر زیره ی سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زیره ی سبز"
    ]
  },
  {
    "id": "ing-b5f84ca9",
    "name": "سس کنجد",
    "normalizedName": "سس کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کنجد"
    ]
  },
  {
    "id": "ing-4c357091",
    "name": "نعنای تازه یک مشت",
    "normalizedName": "نعنای تازه یک مشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنای تازه یک مشت"
    ]
  },
  {
    "id": "ing-91aced47",
    "name": "نان تورتیلا یا نان پیتا به میزان دلخواه برای سرو",
    "normalizedName": "نان تورتیلا یا نان پیتا به میزان دلخواه برای سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تورتیلا یا نان پیتا به میزان دلخواه برای سرو"
    ]
  },
  {
    "id": "ing-259b0f24",
    "name": "ترشی فلفل به دلخواه",
    "normalizedName": "ترشی فلفل به دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترشی فلفل به دلخواه"
    ]
  },
  {
    "id": "ing-eb3db691",
    "name": "کشمش پلوئی",
    "normalizedName": "کشمش پلوئی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش پلوئی"
    ]
  },
  {
    "id": "ing-cf6d5249",
    "name": "سبزی آروگولای وحشی (منداب)",
    "normalizedName": "سبزی اروگولای وحشی (منداب)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی آروگولای وحشی (منداب)"
    ]
  },
  {
    "id": "ing-64f19700",
    "name": "آرد گندم سیاه",
    "normalizedName": "ارد گندم سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم سیاه"
    ]
  },
  {
    "id": "ing-1e2ffcda",
    "name": "نمک نرم و ریز",
    "normalizedName": "نمک نرم و ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نرم و ریز"
    ]
  },
  {
    "id": "ing-76cad391",
    "name": "ماست ساده کم چرب",
    "normalizedName": "ماست ساده کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست ساده کم چرب"
    ]
  },
  {
    "id": "ing-d1a0199a",
    "name": "سالمون دودی",
    "normalizedName": "سالمون دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سالمون دودی"
    ]
  },
  {
    "id": "ing-1fdd1b10",
    "name": "پوره ی گوجه فرنگی",
    "normalizedName": "پوره ی گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره ی گوجه فرنگی"
    ]
  },
  {
    "id": "ing-2590bc7b",
    "name": "فلفل پاپریکای دودی شده ی داغ",
    "normalizedName": "فلفل پاپریکای دودی شده ی داغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل پاپریکای دودی شده ی داغ"
    ]
  },
  {
    "id": "ing-300cb5d",
    "name": "نان مرغوب و ترد برای زمان سرو (به دلخواه)",
    "normalizedName": "نان مرغوب و ترد برای زمان سرو (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان مرغوب و ترد برای زمان سرو (به دلخواه)"
    ]
  },
  {
    "id": "ing-a4b70144",
    "name": "کاهو خرد شده (دلخواه)",
    "normalizedName": "کاهو خرد شده (دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو خرد شده (دلخواه)"
    ]
  },
  {
    "id": "ing-afc36d6f",
    "name": "باقالی ریز پخته شده بدون پوست",
    "normalizedName": "باقالی ریز پخته شده بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقالی ریز پخته شده بدون پوست"
    ]
  },
  {
    "id": "ing-d13d0d80",
    "name": "پنیر فتا خرد شده",
    "normalizedName": "پنیر فتا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر فتا خرد شده"
    ]
  },
  {
    "id": "ing-8819236a",
    "name": "نارگیل کاملا خرد شده و یا پودر نارگیل",
    "normalizedName": "نارگیل کاملا خرد شده و یا پودر نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل کاملا خرد شده و یا پودر نارگیل"
    ]
  },
  {
    "id": "ing-3fb6fbbb",
    "name": "پیاز قرمز کوچک ریز شده",
    "normalizedName": "پیاز قرمز کوچک ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز کوچک ریز شده"
    ]
  },
  {
    "id": "ing-ef0586ff",
    "name": "نان چاپاتی هندی یا نان دلخواه",
    "normalizedName": "نان چاپاتی هندی یا نان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان چاپاتی هندی یا نان دلخواه"
    ]
  },
  {
    "id": "ing-5bc6cce8",
    "name": "هویج کوچک خرد شده",
    "normalizedName": "هویج کوچک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج کوچک خرد شده"
    ]
  },
  {
    "id": "ing-530d9e4d",
    "name": "پیاز خرد شده متوسط",
    "normalizedName": "پیاز خرد شده متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز خرد شده متوسط"
    ]
  },
  {
    "id": "ing-ac92b3c2",
    "name": "چغندر متوسط",
    "normalizedName": "چغندر متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر متوسط"
    ]
  },
  {
    "id": "ing-ad3c6090",
    "name": "پاستا آشیانه ای",
    "normalizedName": "پاستا اشیانه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا آشیانه ای"
    ]
  },
  {
    "id": "ing-8004b998",
    "name": "جعفری مقداری برای تزئین",
    "normalizedName": "جعفری مقداری برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری مقداری برای تزئین"
    ]
  },
  {
    "id": "ing-3d4ed1e9",
    "name": "لوبیا قرمز پخته شده بدون آب",
    "normalizedName": "لوبیا قرمز پخته شده بدون اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا قرمز پخته شده بدون آب"
    ]
  },
  {
    "id": "ing-4c4c5e07",
    "name": "آووکادو خرد شده",
    "normalizedName": "اووکادو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آووکادو خرد شده"
    ]
  },
  {
    "id": "ing-eb1ea4be",
    "name": "سس تند به میزان دلخواه",
    "normalizedName": "سس تند به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تند به میزان دلخواه"
    ]
  },
  {
    "id": "ing-debc903e",
    "name": "مرغ ریش شده",
    "normalizedName": "مرغ ریش شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ ریش شده"
    ]
  },
  {
    "id": "ing-94a349e8",
    "name": "سیررنده شده",
    "normalizedName": "سیررنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیررنده شده"
    ]
  },
  {
    "id": "ing-3d64a38c",
    "name": "سیب زمینی متوسط خرد شده",
    "normalizedName": "سیب زمینی متوسط خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی متوسط خرد شده"
    ]
  },
  {
    "id": "ing-602ccaad",
    "name": "ترخون خشک",
    "normalizedName": "ترخون خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترخون خشک"
    ]
  },
  {
    "id": "ing-6f331e6e",
    "name": "لوبیا سبز خرد شده پخته شده",
    "normalizedName": "لوبیا سبز خرد شده پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سبز خرد شده پخته شده"
    ]
  },
  {
    "id": "ing-6905b194",
    "name": "باقالی دان شده پخته شده",
    "normalizedName": "باقالی دان شده پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقالی دان شده پخته شده"
    ]
  },
  {
    "id": "ing-9ec62f",
    "name": "لوبیا قرمز پخته شده",
    "normalizedName": "لوبیا قرمز پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا قرمز پخته شده"
    ]
  },
  {
    "id": "ing-ff32a463",
    "name": "ادویه طعم دهنده",
    "normalizedName": "ادویه طعم دهنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه طعم دهنده"
    ]
  },
  {
    "id": "ing-a2e7c7ba",
    "name": "پیاز متوسط ریز شده 1عدد",
    "normalizedName": "پیاز متوسط ریز شده 1عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط ریز شده 1عدد"
    ]
  },
  {
    "id": "ing-8725a7ef",
    "name": "آرد نصف لیوان",
    "normalizedName": "ارد نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نصف لیوان"
    ]
  },
  {
    "id": "ing-6d4d9bbc",
    "name": "شیرپر چرب",
    "normalizedName": "شیرپر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرپر چرب"
    ]
  },
  {
    "id": "ing-a73d2ff9",
    "name": "هویج ریز شده",
    "normalizedName": "هویج ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج ریز شده"
    ]
  },
  {
    "id": "ing-972550c7",
    "name": "زرد چوبه و فلفل سیاه به میزان دلخواه",
    "normalizedName": "زرد چوبه و فلفل سیاه به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرد چوبه و فلفل سیاه به میزان دلخواه"
    ]
  },
  {
    "id": "ing-33f8e4ca",
    "name": "کاهو کوچک",
    "normalizedName": "کاهو کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو کوچک"
    ]
  },
  {
    "id": "ing-eb3dca07",
    "name": "نمک و",
    "normalizedName": "نمک و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و"
    ]
  },
  {
    "id": "ing-b384fd3c",
    "name": "ماهی تیلاپیا",
    "normalizedName": "ماهی تیلاپیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی تیلاپیا"
    ]
  },
  {
    "id": "ing-795e5450",
    "name": "ریحان خورد شده",
    "normalizedName": "ریحان خورد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان خورد شده"
    ]
  },
  {
    "id": "ing-eca594ce",
    "name": "لوبیا قرمز پخته شده یا کنسرو لوبیا",
    "normalizedName": "لوبیا قرمز پخته شده یا کنسرو لوبیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا قرمز پخته شده یا کنسرو لوبیا"
    ]
  },
  {
    "id": "ing-491db552",
    "name": "گشنیز تازه و خورد شده",
    "normalizedName": "گشنیز تازه و خورد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز تازه و خورد شده"
    ]
  },
  {
    "id": "ing-b4b09dc2",
    "name": "فلفل دلمه ای قرمز و سبز",
    "normalizedName": "فلفل دلمه ای قرمز و سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز و سبز"
    ]
  },
  {
    "id": "ing-8d137668",
    "name": "پودر فلفل سیاه و آبلیمو به میزان دلخواه",
    "normalizedName": "پودر فلفل سیاه و ابلیمو به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سیاه و آبلیمو به میزان دلخواه"
    ]
  },
  {
    "id": "ing-f60bb457",
    "name": "نعنا داغ مقداری برای تزیین",
    "normalizedName": "نعنا داغ مقداری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا داغ مقداری برای تزیین"
    ]
  },
  {
    "id": "ing-4ee05a0c",
    "name": "ساقه نرم کرفس",
    "normalizedName": "ساقه نرم کرفس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه نرم کرفس"
    ]
  },
  {
    "id": "ing-4639e624",
    "name": "کاهوی خرد شده",
    "normalizedName": "کاهوی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهوی خرد شده"
    ]
  },
  {
    "id": "ing-ec05c231",
    "name": "آبلیموی تازه مقدار لازم",
    "normalizedName": "ابلیموی تازه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیموی تازه مقدار لازم"
    ]
  },
  {
    "id": "ing-bbe3b0b3",
    "name": "گوجه فرنگی ریز",
    "normalizedName": "گوجه فرنگی ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی ریز"
    ]
  },
  {
    "id": "ing-f21411fa",
    "name": "پودر زیره سیاه",
    "normalizedName": "پودر زیره سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زیره سیاه"
    ]
  },
  {
    "id": "ing-682bdac6",
    "name": "پنیر گودا رنده شده مقدار لازم",
    "normalizedName": "پنیر گودا رنده شده مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر گودا رنده شده مقدار لازم"
    ]
  },
  {
    "id": "ing-ec10a5b7",
    "name": "زرشک برای تزیین",
    "normalizedName": "زرشک برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرشک برای تزیین"
    ]
  },
  {
    "id": "ing-f47bcd1b",
    "name": "فيله گوساله",
    "normalizedName": "فیله گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فيله گوساله"
    ]
  },
  {
    "id": "ing-1907d278",
    "name": "راسته يا فيله گوساله",
    "normalizedName": "راسته یا فیله گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "راسته يا فيله گوساله"
    ]
  },
  {
    "id": "ing-d7bef2de",
    "name": "ماست يا خامه",
    "normalizedName": "ماست یا خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست يا خامه"
    ]
  },
  {
    "id": "ing-88402d6c",
    "name": "فيله گوسفند یا گوساله",
    "normalizedName": "فیله گوسفند یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فيله گوسفند یا گوساله"
    ]
  },
  {
    "id": "ing-8572fb50",
    "name": "فلفل سیاه مقدار لازم",
    "normalizedName": "فلفل سیاه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه مقدار لازم"
    ]
  },
  {
    "id": "ing-dc2f7723",
    "name": "سبزیجات منجمد ( هویج",
    "normalizedName": "سبزیجات منجمد ( هویج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات منجمد ( هویج"
    ]
  },
  {
    "id": "ing-1917256d",
    "name": "پنیر چدار مقداری",
    "normalizedName": "پنیر چدار مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار مقداری"
    ]
  },
  {
    "id": "ing-c94200f9",
    "name": "رزماری",
    "normalizedName": "رزماری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری"
    ]
  },
  {
    "id": "ing-9196d0b1",
    "name": "پیاز داغ و نعنا داغ به مقدار لازم",
    "normalizedName": "پیاز داغ و نعنا داغ به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز داغ و نعنا داغ به مقدار لازم"
    ]
  },
  {
    "id": "ing-fbf0a490",
    "name": "پیاز داغ و کشک و نعنا مقدار لازم",
    "normalizedName": "پیاز داغ و کشک و نعنا مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز داغ و کشک و نعنا مقدار لازم"
    ]
  },
  {
    "id": "ing-b7e6328",
    "name": "مغز",
    "normalizedName": "مغز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز"
    ]
  },
  {
    "id": "ing-a2895765",
    "name": "زبان گاو یا گوساله",
    "normalizedName": "زبان گاو یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زبان گاو یا گوساله"
    ]
  },
  {
    "id": "ing-72e506c0",
    "name": "آویشن تازه خرد شده",
    "normalizedName": "اویشن تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن تازه خرد شده"
    ]
  },
  {
    "id": "ing-937a3d4a",
    "name": "گردو سائیده",
    "normalizedName": "گردو سائیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو سائیده"
    ]
  },
  {
    "id": "ing-4d55b581",
    "name": "سبزی پلویی خشک",
    "normalizedName": "سبزی پلویی خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی پلویی خشک"
    ]
  },
  {
    "id": "ing-d57db4df",
    "name": "سس گوجه فرنگی تند",
    "normalizedName": "سس گوجه فرنگی تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوجه فرنگی تند"
    ]
  },
  {
    "id": "ing-a07c6ae0",
    "name": "آبلیمو و برگ گشنیز مقداری",
    "normalizedName": "ابلیمو و برگ گشنیز مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو و برگ گشنیز مقداری"
    ]
  },
  {
    "id": "ing-72464f90",
    "name": "رنده پوست لیمو ترش یا پرتقال",
    "normalizedName": "رنده پوست لیمو ترش یا پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده پوست لیمو ترش یا پرتقال"
    ]
  },
  {
    "id": "ing-ad90c973",
    "name": "کلم برگ قرمز خرد شده",
    "normalizedName": "کلم برگ قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم برگ قرمز خرد شده"
    ]
  },
  {
    "id": "ing-606678a6",
    "name": "کلم برگ سفید خرد شده",
    "normalizedName": "کلم برگ سفید خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم برگ سفید خرد شده"
    ]
  },
  {
    "id": "ing-4c070aef",
    "name": "لوبیا چیتی کنسروی",
    "normalizedName": "لوبیا چیتی کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا چیتی کنسروی"
    ]
  },
  {
    "id": "ing-d261a6ca",
    "name": "کلم برگ سفید",
    "normalizedName": "کلم برگ سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم برگ سفید"
    ]
  },
  {
    "id": "ing-d28c259f",
    "name": "کلم برگ قرمز",
    "normalizedName": "کلم برگ قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم برگ قرمز"
    ]
  },
  {
    "id": "ing-32d998da",
    "name": "پنیر موزارلا یا پنیر فتا مقداری",
    "normalizedName": "پنیر موزارلا یا پنیر فتا مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلا یا پنیر فتا مقداری"
    ]
  },
  {
    "id": "ing-bf26314d",
    "name": "زعفران مقداری",
    "normalizedName": "زعفران مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران مقداری"
    ]
  },
  {
    "id": "ing-497d8006",
    "name": "آویشن مقداری",
    "normalizedName": "اویشن مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن مقداری"
    ]
  },
  {
    "id": "ing-8066d708",
    "name": "میگو متوسط",
    "normalizedName": "میگو متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو متوسط"
    ]
  },
  {
    "id": "ing-3a959ef4",
    "name": "گشنیز مقداری",
    "normalizedName": "گشنیز مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز مقداری"
    ]
  },
  {
    "id": "ing-42f92a7",
    "name": "رازیانه خرد شده",
    "normalizedName": "رازیانه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رازیانه خرد شده"
    ]
  },
  {
    "id": "ing-f6a4eb2d",
    "name": "پوست پرتقال رنده شده",
    "normalizedName": "پوست پرتقال رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست پرتقال رنده شده"
    ]
  },
  {
    "id": "ing-97c8bc44",
    "name": "لوبیا سفید یا لوبیا چشم بلبلی",
    "normalizedName": "لوبیا سفید یا لوبیا چشم بلبلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سفید یا لوبیا چشم بلبلی"
    ]
  },
  {
    "id": "ing-dbb12339",
    "name": "آب گوشت یا آب مرغ",
    "normalizedName": "اب گوشت یا اب مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوشت یا آب مرغ"
    ]
  },
  {
    "id": "ing-642d5b50",
    "name": "قلوه گوسفند",
    "normalizedName": "قلوه گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قلوه گوسفند"
    ]
  },
  {
    "id": "ing-bc79c652",
    "name": "دل گوسفند",
    "normalizedName": "دل گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دل گوسفند"
    ]
  },
  {
    "id": "ing-d397db8b",
    "name": "جگر گوسفند",
    "normalizedName": "جگر گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جگر گوسفند"
    ]
  },
  {
    "id": "ing-4921a806",
    "name": "جگر سفید",
    "normalizedName": "جگر سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جگر سفید"
    ]
  },
  {
    "id": "ing-9d7c7eb2",
    "name": "پنیر پارمزان برای تزیین",
    "normalizedName": "پنیر پارمزان برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان برای تزیین"
    ]
  },
  {
    "id": "ing-3c99ca5",
    "name": "لیمو ترش مقدار لازم",
    "normalizedName": "لیمو ترش مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش مقدار لازم"
    ]
  },
  {
    "id": "ing-a45911e8",
    "name": "ماهی بزرگ",
    "normalizedName": "ماهی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی بزرگ"
    ]
  },
  {
    "id": "ing-bc9f9cf5",
    "name": "کشک و نعنا مقداری",
    "normalizedName": "کشک و نعنا مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشک و نعنا مقداری"
    ]
  },
  {
    "id": "ing-a38b4192",
    "name": "سبزی اش ( جعفری",
    "normalizedName": "سبزی اش ( جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی اش ( جعفری"
    ]
  },
  {
    "id": "ing-80dd96b4",
    "name": "اسفناج )",
    "normalizedName": "اسفناج )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج )"
    ]
  },
  {
    "id": "ing-90bad27e",
    "name": "نعنا خشک و کشک مقدار لازم",
    "normalizedName": "نعنا خشک و کشک مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا خشک و کشک مقدار لازم"
    ]
  },
  {
    "id": "ing-a9450cfe",
    "name": "ساقه پیازچه خرد شده",
    "normalizedName": "ساقه پیازچه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه پیازچه خرد شده"
    ]
  },
  {
    "id": "ing-1fe030f6",
    "name": "نودل یا رشته فرنگی",
    "normalizedName": "نودل یا رشته فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل یا رشته فرنگی"
    ]
  },
  {
    "id": "ing-f40956b1",
    "name": "جوانه ماش",
    "normalizedName": "جوانه ماش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوانه ماش"
    ]
  },
  {
    "id": "ing-15d4ca7d",
    "name": "روغن کنجد یا زیتون",
    "normalizedName": "روغن کنجد یا زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کنجد یا زیتون"
    ]
  },
  {
    "id": "ing-ef067d9f",
    "name": "مربا یا میوه خرد شده",
    "normalizedName": "مربا یا میوه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا یا میوه خرد شده"
    ]
  },
  {
    "id": "ing-a7c31e22",
    "name": "بیسکوییت یا شیرینی خشک خرد شده",
    "normalizedName": "بیسکوییت یا شیرینی خشک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت یا شیرینی خشک خرد شده"
    ]
  },
  {
    "id": "ing-174ef91f",
    "name": "شکلات تخته ای خرد شده",
    "normalizedName": "شکلات تخته ای خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای خرد شده"
    ]
  },
  {
    "id": "ing-294d54ab",
    "name": "فلفل دلمه ای یا کدو سبز",
    "normalizedName": "فلفل دلمه ای یا کدو سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای یا کدو سبز"
    ]
  },
  {
    "id": "ing-ad2bce10",
    "name": "سینه مرغ چرخ شده",
    "normalizedName": "سینه مرغ چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ چرخ شده"
    ]
  },
  {
    "id": "ing-f399046",
    "name": "برنج پخته سرد",
    "normalizedName": "برنج پخته سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج پخته سرد"
    ]
  },
  {
    "id": "ing-9578f049",
    "name": "نمک و فلفل قرمز مقدار لازم",
    "normalizedName": "نمک و فلفل قرمز مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل قرمز مقدار لازم"
    ]
  },
  {
    "id": "ing-ec4608c0",
    "name": "جعفری برای تزیین",
    "normalizedName": "جعفری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری برای تزیین"
    ]
  },
  {
    "id": "ing-3d440248",
    "name": "سس خردل یا سس مایونز",
    "normalizedName": "سس خردل یا سس مایونز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس خردل یا سس مایونز"
    ]
  },
  {
    "id": "ing-9519d523",
    "name": "لیمو ترش برای تزیین",
    "normalizedName": "لیمو ترش برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش برای تزیین"
    ]
  },
  {
    "id": "ing-e7626567",
    "name": "سبزی ریحان یا پونه کوهی",
    "normalizedName": "سبزی ریحان یا پونه کوهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی ریحان یا پونه کوهی"
    ]
  },
  {
    "id": "ing-3d879694",
    "name": "ترخون تازه مقداری",
    "normalizedName": "ترخون تازه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترخون تازه مقداری"
    ]
  },
  {
    "id": "ing-22601226",
    "name": "گوشت قلوه گاه گوسفند",
    "normalizedName": "گوشت قلوه گاه گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت قلوه گاه گوسفند"
    ]
  },
  {
    "id": "ing-e21a5e88",
    "name": "آبلیمو و نمک و فلفل سیاه مقداری",
    "normalizedName": "ابلیمو و نمک و فلفل سیاه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو و نمک و فلفل سیاه مقداری"
    ]
  },
  {
    "id": "ing-e266ae9b",
    "name": "زعفران سائیده مقداری",
    "normalizedName": "زعفران سائیده مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران سائیده مقداری"
    ]
  },
  {
    "id": "ing-1d17b9d3",
    "name": "آرد سوخاری و نمک و فلفل مقدار لازم",
    "normalizedName": "ارد سوخاری و نمک و فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری و نمک و فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-148b4875",
    "name": "آرد نان یا آرد ساده",
    "normalizedName": "ارد نان یا ارد ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نان یا آرد ساده"
    ]
  },
  {
    "id": "ing-2cb2c1bf",
    "name": "روغن زیتون به مقدارلازم",
    "normalizedName": "روغن زیتون به مقدارلازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون به مقدارلازم"
    ]
  },
  {
    "id": "ing-4df611ac",
    "name": "گوشت خرچنگ",
    "normalizedName": "گوشت خرچنگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت خرچنگ"
    ]
  },
  {
    "id": "ing-9d357420",
    "name": "فلفل به مقدار لازم",
    "normalizedName": "فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-1249e33f",
    "name": "آلو قیسی",
    "normalizedName": "الو قیسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو قیسی"
    ]
  },
  {
    "id": "ing-d1fc7dd1",
    "name": "سیب شیرین",
    "normalizedName": "سیب شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب شیرین"
    ]
  },
  {
    "id": "ing-9190739e",
    "name": "کلم بروکلی متوسط",
    "normalizedName": "کلم بروکلی متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی متوسط"
    ]
  },
  {
    "id": "ing-a80e3a77",
    "name": "آب مرغ یا آب سیب",
    "normalizedName": "اب مرغ یا اب سیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب مرغ یا آب سیب"
    ]
  },
  {
    "id": "ing-7c1bad8f",
    "name": "آبلیمو و نمک و فلفل مقدار لازم",
    "normalizedName": "ابلیمو و نمک و فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو و نمک و فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-eaf03b80",
    "name": "نمک و فلفل و آبلیمو به مقدار لازم",
    "normalizedName": "نمک و فلفل و ابلیمو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل و آبلیمو به مقدار لازم"
    ]
  },
  {
    "id": "ing-6804db76",
    "name": "خلال پوست نارنگی",
    "normalizedName": "خلال پوست نارنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پوست نارنگی"
    ]
  },
  {
    "id": "ing-b200c201",
    "name": "شوید تازه ریز خرد شده",
    "normalizedName": "شوید تازه ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید تازه ریز خرد شده"
    ]
  },
  {
    "id": "ing-ed7b118",
    "name": "شوید و نمک",
    "normalizedName": "شوید و نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید و نمک"
    ]
  },
  {
    "id": "ing-bdbb389e",
    "name": "جعفری خرد شده مقداری برای تزیین",
    "normalizedName": "جعفری خرد شده مقداری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خرد شده مقداری برای تزیین"
    ]
  },
  {
    "id": "ing-45bf9fdd",
    "name": "بادام زمینی یا بادام هندی",
    "normalizedName": "بادام زمینی یا بادام هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی یا بادام هندی"
    ]
  },
  {
    "id": "ing-61b17b68",
    "name": "کره مقداری",
    "normalizedName": "کره مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره مقداری"
    ]
  },
  {
    "id": "ing-14e49287",
    "name": "ماست یا روغن مایع",
    "normalizedName": "ماست یا روغن مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یا روغن مایع"
    ]
  },
  {
    "id": "ing-2894415a",
    "name": "سینه کامل مرغ",
    "normalizedName": "سینه کامل مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه کامل مرغ"
    ]
  },
  {
    "id": "ing-d1fa861d",
    "name": "روغن مایع مقدار لازم",
    "normalizedName": "روغن مایع مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مایع مقدار لازم"
    ]
  },
  {
    "id": "ing-dd698f50",
    "name": "کره و روغن و نمک به مقدار لازم",
    "normalizedName": "کره و روغن و نمک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره و روغن و نمک به مقدار لازم"
    ]
  },
  {
    "id": "ing-400cf24e",
    "name": "آرد نخودچی یا آرد سوخاری مقدار لازم",
    "normalizedName": "ارد نخودچی یا ارد سوخاری مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نخودچی یا آرد سوخاری مقدار لازم"
    ]
  },
  {
    "id": "ing-c6e03751",
    "name": "روغن یا کره به مقدار لازم",
    "normalizedName": "روغن یا کره به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن یا کره به مقدار لازم"
    ]
  },
  {
    "id": "ing-6f7f5513",
    "name": "پودر سوخاری یا خرده نان مقدار لازم",
    "normalizedName": "پودر سوخاری یا خرده نان مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سوخاری یا خرده نان مقدار لازم"
    ]
  },
  {
    "id": "ing-f329813b",
    "name": "خمیر پاستای مخصوص",
    "normalizedName": "خمیر پاستای مخصوص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پاستای مخصوص"
    ]
  },
  {
    "id": "ing-b8f6581c",
    "name": "ماست یا شیر",
    "normalizedName": "ماست یا شیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یا شیر"
    ]
  },
  {
    "id": "ing-cb276b91",
    "name": "بکینگ پودر یا جوش شیرین",
    "normalizedName": "بکینگ پودر یا جوش شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بکینگ پودر یا جوش شیرین"
    ]
  },
  {
    "id": "ing-db60152c",
    "name": "کرفس ریز خرد شده",
    "normalizedName": "کرفس ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرفس ریز خرد شده"
    ]
  },
  {
    "id": "ing-dcd57780",
    "name": "چغندر قرمز ( لبو )",
    "normalizedName": "چغندر قرمز ( لبو )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر قرمز ( لبو )"
    ]
  },
  {
    "id": "ing-7aab8243",
    "name": "روغن زیتون یا مایع به مقدار لازم",
    "normalizedName": "روغن زیتون یا مایع به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا مایع به مقدار لازم"
    ]
  },
  {
    "id": "ing-30799317",
    "name": "زنجبیل تازه مقداری",
    "normalizedName": "زنجبیل تازه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه مقداری"
    ]
  },
  {
    "id": "ing-69d12d28",
    "name": "نشاسته سیب زمینی",
    "normalizedName": "نشاسته سیب زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته سیب زمینی"
    ]
  },
  {
    "id": "ing-1a00e525",
    "name": "گوشت ماهی قزل آلا",
    "normalizedName": "گوشت ماهی قزل الا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ماهی قزل آلا"
    ]
  },
  {
    "id": "ing-f0b3cb39",
    "name": "گوجه فرنگی به مقدار لازم",
    "normalizedName": "گوجه فرنگی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی به مقدار لازم"
    ]
  },
  {
    "id": "ing-3fbb5d98",
    "name": "کنگر خرد شده",
    "normalizedName": "کنگر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنگر خرد شده"
    ]
  },
  {
    "id": "ing-7521078f",
    "name": "نعناع و جعفری خرد شده",
    "normalizedName": "نعناع و جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع و جعفری خرد شده"
    ]
  },
  {
    "id": "ing-fd1eb9c",
    "name": "ازگیل ژاپنی",
    "normalizedName": "ازگیل ژاپنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ازگیل ژاپنی"
    ]
  },
  {
    "id": "ing-fbfb6950",
    "name": "تخم خردل",
    "normalizedName": "تخم خردل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم خردل"
    ]
  },
  {
    "id": "ing-d064c62c",
    "name": "نخود فرنگی پخته یا نیمه آماده",
    "normalizedName": "نخود فرنگی پخته یا نیمه اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی پخته یا نیمه آماده"
    ]
  },
  {
    "id": "ing-b24170bd",
    "name": "نمک و کره به مقدار لازم",
    "normalizedName": "نمک و کره به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و کره به مقدار لازم"
    ]
  },
  {
    "id": "ing-1e679eaf",
    "name": "زعفران دم کرده غلیظ",
    "normalizedName": "زعفران دم کرده غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده غلیظ"
    ]
  },
  {
    "id": "ing-e8964c31",
    "name": "سیب زرد یا قرمز",
    "normalizedName": "سیب زرد یا قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زرد یا قرمز"
    ]
  },
  {
    "id": "ing-cd4b0154",
    "name": "لپه خام",
    "normalizedName": "لپه خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لپه خام"
    ]
  },
  {
    "id": "ing-72133621",
    "name": "خیار سالادی بزرگ",
    "normalizedName": "خیار سالادی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار سالادی بزرگ"
    ]
  },
  {
    "id": "ing-1e2c2529",
    "name": "نعنا خشک و جعفری",
    "normalizedName": "نعنا خشک و جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا خشک و جعفری"
    ]
  },
  {
    "id": "ing-c17ee64f",
    "name": "آبغوره یا آبلیمو",
    "normalizedName": "ابغوره یا ابلیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبغوره یا آبلیمو"
    ]
  },
  {
    "id": "ing-67007ba9",
    "name": "ماکارونی خشک",
    "normalizedName": "ماکارونی خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی خشک"
    ]
  },
  {
    "id": "ing-77fde3c0",
    "name": "ابلیمو و نمک و فلفل به مقدار لازم",
    "normalizedName": "ابلیمو و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ابلیمو و نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-7991f0e",
    "name": "نان لواش یا نان پیتا",
    "normalizedName": "نان لواش یا نان پیتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان لواش یا نان پیتا"
    ]
  },
  {
    "id": "ing-25ad7eda",
    "name": "سس مایونز یا فرانسوی",
    "normalizedName": "سس مایونز یا فرانسوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز یا فرانسوی"
    ]
  },
  {
    "id": "ing-444fb450",
    "name": "خیارشور خرد شده",
    "normalizedName": "خیارشور خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیارشور خرد شده"
    ]
  },
  {
    "id": "ing-6e151dd8",
    "name": "دنده گوسفند",
    "normalizedName": "دنده گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دنده گوسفند"
    ]
  },
  {
    "id": "ing-c7446940",
    "name": "سس باربیکیو یا سس گوجه فرنگی",
    "normalizedName": "سس باربیکیو یا سس گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس باربیکیو یا سس گوجه فرنگی"
    ]
  },
  {
    "id": "ing-36db000c",
    "name": "سس مایونز یا ماست چکیده",
    "normalizedName": "سس مایونز یا ماست چکیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز یا ماست چکیده"
    ]
  },
  {
    "id": "ing-35540b41",
    "name": "عصاره گوشت",
    "normalizedName": "عصاره گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره گوشت"
    ]
  },
  {
    "id": "ing-68754fbc",
    "name": "پودر اویشن",
    "normalizedName": "پودر اویشن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر اویشن"
    ]
  },
  {
    "id": "ing-c5ebcd80",
    "name": "زعفران دم کرده به مقدار لازم",
    "normalizedName": "زعفران دم کرده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده به مقدار لازم"
    ]
  },
  {
    "id": "ing-a3b059f5",
    "name": "کره و نمک و فلفل به مقدار لازم",
    "normalizedName": "کره و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره و نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-db69a332",
    "name": "اسفناج و نمک و فلفل به مقدار لازم",
    "normalizedName": "اسفناج و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج و نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-e41e9f8f",
    "name": "روغن و نمک و فلفل به مقدار لازم",
    "normalizedName": "روغن و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و نمک و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-c6c14b19",
    "name": "آلو خورشتی مقداری",
    "normalizedName": "الو خورشتی مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو خورشتی مقداری"
    ]
  },
  {
    "id": "ing-9a233234",
    "name": "سیخ چوبی مقدار لازم",
    "normalizedName": "سیخ چوبی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیخ چوبی مقدار لازم"
    ]
  },
  {
    "id": "ing-6fd6c09d",
    "name": "آبلیمو مقداری",
    "normalizedName": "ابلیمو مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو مقداری"
    ]
  },
  {
    "id": "ing-5ec2ec5e",
    "name": "آویشن تازه مقداری",
    "normalizedName": "اویشن تازه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آویشن تازه مقداری"
    ]
  },
  {
    "id": "ing-8dd1eb51",
    "name": "کره یا روغن به مقدار لازم",
    "normalizedName": "کره یا روغن به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن به مقدار لازم"
    ]
  },
  {
    "id": "ing-7f465ac2",
    "name": "ورقه لازانيا",
    "normalizedName": "ورقه لازانیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورقه لازانيا"
    ]
  },
  {
    "id": "ing-219b7bd",
    "name": "سس قرمز ساده",
    "normalizedName": "سس قرمز ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس قرمز ساده"
    ]
  },
  {
    "id": "ing-8c26d7d5",
    "name": "پنیر پیتزا به میزان دلخواه",
    "normalizedName": "پنیر پیتزا به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا به میزان دلخواه"
    ]
  },
  {
    "id": "ing-cdd89091",
    "name": "لیموعمانی",
    "normalizedName": "لیموعمانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیموعمانی"
    ]
  },
  {
    "id": "ing-f63f9100",
    "name": "دل مرغ",
    "normalizedName": "دل مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دل مرغ"
    ]
  },
  {
    "id": "ing-296a25a8",
    "name": "گوشت سر دست",
    "normalizedName": "گوشت سر دست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت سر دست"
    ]
  },
  {
    "id": "ing-72099bc0",
    "name": "ورمیشل به مقدار لازم",
    "normalizedName": "ورمیشل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورمیشل به مقدار لازم"
    ]
  },
  {
    "id": "ing-90e18ec",
    "name": "دال عدس",
    "normalizedName": "دال عدس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دال عدس"
    ]
  },
  {
    "id": "ing-eaca43fe",
    "name": "پنیر پیتزا چند ورقه",
    "normalizedName": "پنیر پیتزا چند ورقه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا چند ورقه"
    ]
  },
  {
    "id": "ing-96b88ced",
    "name": "فلفل و روغن به مقدار لازم",
    "normalizedName": "فلفل و روغن به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل و روغن به مقدار لازم"
    ]
  },
  {
    "id": "ing-a8d7bcac",
    "name": "لوبيا چیتی ( لوبیا قرمز )",
    "normalizedName": "لوبیا چیتی ( لوبیا قرمز )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبيا چیتی ( لوبیا قرمز )"
    ]
  },
  {
    "id": "ing-3a04a56a",
    "name": "آبلیمو به مقدار لازم",
    "normalizedName": "ابلیمو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو به مقدار لازم"
    ]
  },
  {
    "id": "ing-7b8f3b3e",
    "name": "سبزي ( تره.جعفري.گشنيز.اسفناج.شنبليله )",
    "normalizedName": "سبزی ( تره.جعفری.گشنیز.اسفناج.شنبلیله )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزي ( تره.جعفري.گشنيز.اسفناج.شنبليله )"
    ]
  },
  {
    "id": "ing-8a9d8e60",
    "name": "گوجه سبز",
    "normalizedName": "گوجه سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه سبز"
    ]
  },
  {
    "id": "ing-28b942d4",
    "name": "جعفري تازه",
    "normalizedName": "جعفری تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفري تازه"
    ]
  },
  {
    "id": "ing-25900511",
    "name": "سبزی مخصوص آش ( تره.جعفري.اسفناج.گشنيز )",
    "normalizedName": "سبزی مخصوص اش ( تره.جعفری.اسفناج.گشنیز )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی مخصوص آش ( تره.جعفري.اسفناج.گشنيز )"
    ]
  },
  {
    "id": "ing-eaea997e",
    "name": "رشته آش",
    "normalizedName": "رشته اش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته آش"
    ]
  },
  {
    "id": "ing-9d474ba6",
    "name": "لوبيا چيتي",
    "normalizedName": "لوبیا چیتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبيا چيتي"
    ]
  },
  {
    "id": "ing-d94897bb",
    "name": "کشک مقدار لازم",
    "normalizedName": "کشک مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشک مقدار لازم"
    ]
  },
  {
    "id": "ing-26859111",
    "name": "نعناع خشك",
    "normalizedName": "نعناع خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع خشك"
    ]
  },
  {
    "id": "ing-c7c43b9f",
    "name": "گوجه فرنگی نگینی خرد شده",
    "normalizedName": "گوجه فرنگی نگینی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی نگینی خرد شده"
    ]
  },
  {
    "id": "ing-3cc7b115",
    "name": "ماءالشعیر تلخ",
    "normalizedName": "ماءالشعیر تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماءالشعیر تلخ"
    ]
  },
  {
    "id": "ing-a86b0236",
    "name": "آرد مقدار لازم",
    "normalizedName": "ارد مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد مقدار لازم"
    ]
  },
  {
    "id": "ing-aa411d97",
    "name": "سبزی معطر ( ریحان.ترخان.جعفری )",
    "normalizedName": "سبزی معطر ( ریحان.ترخان.جعفری )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر ( ریحان.ترخان.جعفری )"
    ]
  },
  {
    "id": "ing-4aab62ae",
    "name": "گندم پوست کنده",
    "normalizedName": "گندم پوست کنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گندم پوست کنده"
    ]
  },
  {
    "id": "ing-7b23f140",
    "name": "سبزی",
    "normalizedName": "سبزی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی"
    ]
  },
  {
    "id": "ing-2cc621f4",
    "name": "کشک به مقدار لازم",
    "normalizedName": "کشک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشک به مقدار لازم"
    ]
  },
  {
    "id": "ing-d82806d",
    "name": "ارد سفید",
    "normalizedName": "ارد سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد سفید"
    ]
  },
  {
    "id": "ing-7c37b3db",
    "name": "نمک نوک قاشق",
    "normalizedName": "نمک نوک قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نوک قاشق"
    ]
  },
  {
    "id": "ing-1780a33b",
    "name": "گوشت گوسفند يا گوساله",
    "normalizedName": "گوشت گوسفند یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفند يا گوساله"
    ]
  },
  {
    "id": "ing-8a72f275",
    "name": "گردوي چرخ شده",
    "normalizedName": "گردوی چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردوي چرخ شده"
    ]
  },
  {
    "id": "ing-6a51d3db",
    "name": "جعفری.گشنیز.مرزه.ترخون",
    "normalizedName": "جعفری.گشنیز.مرزه.ترخون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری.گشنیز.مرزه.ترخون"
    ]
  },
  {
    "id": "ing-cb498529",
    "name": "جعفری به مقدار لازم",
    "normalizedName": "جعفری به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری به مقدار لازم"
    ]
  },
  {
    "id": "ing-dc53d136",
    "name": "گوشت گوساله بدون چربی",
    "normalizedName": "گوشت گوساله بدون چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوساله بدون چربی"
    ]
  },
  {
    "id": "ing-e4771226",
    "name": "موسير",
    "normalizedName": "موسیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موسير"
    ]
  },
  {
    "id": "ing-8d908653",
    "name": "اب گوشت",
    "normalizedName": "اب گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اب گوشت"
    ]
  },
  {
    "id": "ing-e232b374",
    "name": "اویشن",
    "normalizedName": "اویشن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اویشن"
    ]
  },
  {
    "id": "ing-5dae9c9a",
    "name": "خمير مايه",
    "normalizedName": "خمیر مایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمير مايه"
    ]
  },
  {
    "id": "ing-35b40c98",
    "name": "نمک نصف قاشق چايخوري",
    "normalizedName": "نمک نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نصف قاشق چايخوري"
    ]
  },
  {
    "id": "ing-b7de27c",
    "name": "ارد",
    "normalizedName": "ارد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد"
    ]
  },
  {
    "id": "ing-8ec64c3e",
    "name": "لازانيا",
    "normalizedName": "لازانیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لازانيا"
    ]
  },
  {
    "id": "ing-7f8a5043",
    "name": "پيازچه",
    "normalizedName": "پیازچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پيازچه"
    ]
  },
  {
    "id": "ing-45cff348",
    "name": "پنير پيتزا به مقدار لازم",
    "normalizedName": "پنیر پیتزا به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنير پيتزا به مقدار لازم"
    ]
  },
  {
    "id": "ing-be70fee0",
    "name": "جعفري خرد شده",
    "normalizedName": "جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفري خرد شده"
    ]
  },
  {
    "id": "ing-35a06501",
    "name": "آرد سوخاری یا نان خشک کوبیده",
    "normalizedName": "ارد سوخاری یا نان خشک کوبیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سوخاری یا نان خشک کوبیده"
    ]
  },
  {
    "id": "ing-da873e3b",
    "name": "گوجه فرنگی و جعفری برای تزئین",
    "normalizedName": "گوجه فرنگی و جعفری برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی و جعفری برای تزئین"
    ]
  },
  {
    "id": "ing-b19af58c",
    "name": "گوشت ران گاو",
    "normalizedName": "گوشت ران گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ران گاو"
    ]
  },
  {
    "id": "ing-6d96a083",
    "name": "قلوه گاه گاو",
    "normalizedName": "قلوه گاه گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قلوه گاه گاو"
    ]
  },
  {
    "id": "ing-443dde1f",
    "name": "دنبه گوسفند",
    "normalizedName": "دنبه گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دنبه گوسفند"
    ]
  },
  {
    "id": "ing-75d1bca7",
    "name": "سس مایونز یا ماست خامه ای",
    "normalizedName": "سس مایونز یا ماست خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز یا ماست خامه ای"
    ]
  },
  {
    "id": "ing-473ff187",
    "name": "لیمو عمانی چند عدد",
    "normalizedName": "لیمو عمانی چند عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو عمانی چند عدد"
    ]
  },
  {
    "id": "ing-b75e1ec7",
    "name": "تره خرد شده هر کدام",
    "normalizedName": "تره خرد شده هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره خرد شده هر کدام"
    ]
  },
  {
    "id": "ing-b747fc11",
    "name": "پنیر پیتزای پر چرب",
    "normalizedName": "پنیر پیتزای پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزای پر چرب"
    ]
  },
  {
    "id": "ing-34501d4f",
    "name": "ماهی متوسط",
    "normalizedName": "ماهی متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی متوسط"
    ]
  },
  {
    "id": "ing-f9848212",
    "name": "سبزی پلویی",
    "normalizedName": "سبزی پلویی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی پلویی"
    ]
  },
  {
    "id": "ing-a05aff32",
    "name": "کره و زعفران دم کرده",
    "normalizedName": "کره و زعفران دم کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره و زعفران دم کرده"
    ]
  },
  {
    "id": "ing-bc35f4cf",
    "name": "شیر نصف پیمانه",
    "normalizedName": "شیر نصف پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نصف پیمانه"
    ]
  },
  {
    "id": "ing-edbf93db",
    "name": "جو پرک شده",
    "normalizedName": "جو پرک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو پرک شده"
    ]
  },
  {
    "id": "ing-fbfc95e6",
    "name": "تخم بزرک",
    "normalizedName": "تخم بزرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم بزرک"
    ]
  },
  {
    "id": "ing-749eecb7",
    "name": "تخم افتاب گردان",
    "normalizedName": "تخم افتاب گردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم افتاب گردان"
    ]
  },
  {
    "id": "ing-fc30e208",
    "name": "تخم کنجد",
    "normalizedName": "تخم کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم کنجد"
    ]
  },
  {
    "id": "ing-7c018eea",
    "name": "تخم کدو",
    "normalizedName": "تخم کدو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم کدو"
    ]
  },
  {
    "id": "ing-8d336792",
    "name": "اب ولرم",
    "normalizedName": "اب ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اب ولرم"
    ]
  },
  {
    "id": "ing-6dc9bcc2",
    "name": "کره در صورت تمایل",
    "normalizedName": "کره در صورت تمایل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره در صورت تمایل"
    ]
  },
  {
    "id": "ing-1af0b602",
    "name": "زردچوبه مقدار لازم",
    "normalizedName": "زردچوبه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه مقدار لازم"
    ]
  },
  {
    "id": "ing-7b21c175",
    "name": "سويا",
    "normalizedName": "سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سويا"
    ]
  },
  {
    "id": "ing-6c39478f",
    "name": "گشنيز )",
    "normalizedName": "گشنیز )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنيز )"
    ]
  },
  {
    "id": "ing-8e0f1637",
    "name": "مخلوط زرشك و مغز گردو",
    "normalizedName": "مخلوط زرشک و مغز گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخلوط زرشك و مغز گردو"
    ]
  },
  {
    "id": "ing-483f9c28",
    "name": "رشته سوپ",
    "normalizedName": "رشته سوپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته سوپ"
    ]
  },
  {
    "id": "ing-62814e9b",
    "name": "دوغ گازدار",
    "normalizedName": "دوغ گازدار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دوغ گازدار"
    ]
  },
  {
    "id": "ing-bc6d58ff",
    "name": "سير تازه خرد شده",
    "normalizedName": "سیر تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سير تازه خرد شده"
    ]
  },
  {
    "id": "ing-91e549e7",
    "name": "سيب زمينی بزرگ",
    "normalizedName": "سیب زمینی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سيب زمينی بزرگ"
    ]
  },
  {
    "id": "ing-bd16547a",
    "name": "کشمش نصف لیوان",
    "normalizedName": "کشمش نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش نصف لیوان"
    ]
  },
  {
    "id": "ing-d7e6aa06",
    "name": "گشنيز",
    "normalizedName": "گشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنيز"
    ]
  },
  {
    "id": "ing-116568d3",
    "name": "شويد )",
    "normalizedName": "شوید )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شويد )"
    ]
  },
  {
    "id": "ing-3bdaefa8",
    "name": "دانه انار نصف لیوان",
    "normalizedName": "دانه انار نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار نصف لیوان"
    ]
  },
  {
    "id": "ing-fcb0b80f",
    "name": "آبلیمو یا آبغوره",
    "normalizedName": "ابلیمو یا ابغوره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو یا آبغوره"
    ]
  },
  {
    "id": "ing-1b226e26",
    "name": "سویا نصف لیوان",
    "normalizedName": "سویا نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سویا نصف لیوان"
    ]
  },
  {
    "id": "ing-919a10d0",
    "name": "زردچوبه و دارچین به مقدار لازم",
    "normalizedName": "زردچوبه و دارچین به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و دارچین به مقدار لازم"
    ]
  },
  {
    "id": "ing-866b564d",
    "name": "سبزی آش ( تره.جعفری.گشنیز.نعناع )",
    "normalizedName": "سبزی اش ( تره.جعفری.گشنیز.نعناع )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی آش ( تره.جعفری.گشنیز.نعناع )"
    ]
  },
  {
    "id": "ing-ef96f28b",
    "name": "لپه نصف لیوان",
    "normalizedName": "لپه نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لپه نصف لیوان"
    ]
  },
  {
    "id": "ing-47941833",
    "name": "گوشت چرخ کرده نیم کیلو",
    "normalizedName": "گوشت چرخ کرده نیم کیلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده نیم کیلو"
    ]
  },
  {
    "id": "ing-1d8d9df6",
    "name": "گوشت چرخ کرده نصف پیمانه",
    "normalizedName": "گوشت چرخ کرده نصف پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده نصف پیمانه"
    ]
  },
  {
    "id": "ing-a618457f",
    "name": "ریحان و جعفری مقدار لازم",
    "normalizedName": "ریحان و جعفری مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان و جعفری مقدار لازم"
    ]
  },
  {
    "id": "ing-df5e8b52",
    "name": "سوسيس",
    "normalizedName": "سوسیس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسيس"
    ]
  },
  {
    "id": "ing-9ac0c829",
    "name": "بکينگ پودر",
    "normalizedName": "بکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بکينگ پودر"
    ]
  },
  {
    "id": "ing-292bdf01",
    "name": "باميه خورشتي",
    "normalizedName": "بامیه خورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باميه خورشتي"
    ]
  },
  {
    "id": "ing-e41e9f8f",
    "name": "روغن و نمك و فلفل به مقدار لازم",
    "normalizedName": "روغن و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و نمك و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-a6a3a84e",
    "name": "هويج بزرگ",
    "normalizedName": "هویج بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هويج بزرگ"
    ]
  },
  {
    "id": "ing-2689b0",
    "name": "دارچين",
    "normalizedName": "دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دارچين"
    ]
  },
  {
    "id": "ing-9c5f0327",
    "name": "زردچوبه و نمك و فلفل به مقدار لازم",
    "normalizedName": "زردچوبه و نمک و فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و نمك و فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-4d3f458f",
    "name": "لوبيا سبز خرد شده",
    "normalizedName": "لوبیا سبز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبيا سبز خرد شده"
    ]
  },
  {
    "id": "ing-86015b3e",
    "name": "نخود سبز پخته",
    "normalizedName": "نخود سبز پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود سبز پخته"
    ]
  },
  {
    "id": "ing-1d5fe637",
    "name": "زعفران دم کرده و کره به مقدار لازم",
    "normalizedName": "زعفران دم کرده و کره به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده و کره به مقدار لازم"
    ]
  },
  {
    "id": "ing-69411932",
    "name": "روغن و زعفران",
    "normalizedName": "روغن و زعفران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و زعفران"
    ]
  },
  {
    "id": "ing-7ae969a9",
    "name": "كشمش",
    "normalizedName": "کشمش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كشمش"
    ]
  },
  {
    "id": "ing-7a9f5ad",
    "name": "سبزی کوفته",
    "normalizedName": "سبزی کوفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی کوفته"
    ]
  },
  {
    "id": "ing-fbac4419",
    "name": "آرد نخود چی",
    "normalizedName": "ارد نخود چی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نخود چی"
    ]
  },
  {
    "id": "ing-61e30407",
    "name": "گل سرخ به مقدار لازم",
    "normalizedName": "گل سرخ به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل سرخ به مقدار لازم"
    ]
  },
  {
    "id": "ing-3c15fbf5",
    "name": "تره و مرزه به مقدار لازم",
    "normalizedName": "تره و مرزه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره و مرزه به مقدار لازم"
    ]
  },
  {
    "id": "ing-8ec30fce",
    "name": "تخم مرغ پخته و مغز گردو به مقدار لازم",
    "normalizedName": "تخم مرغ پخته و مغز گردو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ پخته و مغز گردو به مقدار لازم"
    ]
  },
  {
    "id": "ing-a060e17a",
    "name": "گوشت دنده گوساله یا گوسفند",
    "normalizedName": "گوشت دنده گوساله یا گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت دنده گوساله یا گوسفند"
    ]
  },
  {
    "id": "ing-a79c03ad",
    "name": "گوشت گوسفند با استخوان و چربي",
    "normalizedName": "گوشت گوسفند با استخوان و چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفند با استخوان و چربي"
    ]
  },
  {
    "id": "ing-a028121c",
    "name": "گوجه فرنگي",
    "normalizedName": "گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگي"
    ]
  },
  {
    "id": "ing-2730bd45",
    "name": "رب گوجه فرنگي",
    "normalizedName": "رب گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه فرنگي"
    ]
  },
  {
    "id": "ing-3a04a56a",
    "name": "آبليمو به مقدار لازم",
    "normalizedName": "ابلیمو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبليمو به مقدار لازم"
    ]
  },
  {
    "id": "ing-cbac4337",
    "name": "لوبيا كشاورزی",
    "normalizedName": "لوبیا کشاورزی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبيا كشاورزی"
    ]
  },
  {
    "id": "ing-7d3dc9",
    "name": "شويد خشك",
    "normalizedName": "شوید خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شويد خشك"
    ]
  },
  {
    "id": "ing-c6105740",
    "name": "گوشت ماهيچه سردست",
    "normalizedName": "گوشت ماهیچه سردست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ماهيچه سردست"
    ]
  },
  {
    "id": "ing-2fd223b8",
    "name": "سبزی آش خرد شده ( تره و اسفناج و جعفري و گشنيز )",
    "normalizedName": "سبزی اش خرد شده ( تره و اسفناج و جعفری و گشنیز )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی آش خرد شده ( تره و اسفناج و جعفري و گشنيز )"
    ]
  },
  {
    "id": "ing-b5a105bb",
    "name": "نعناع خشک مقدار لازم",
    "normalizedName": "نعناع خشک مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع خشک مقدار لازم"
    ]
  },
  {
    "id": "ing-bfd60aca",
    "name": "پنیر خامه ای یا پنیر موتزارلا (به مقدار لازم)",
    "normalizedName": "پنیر خامه ای یا پنیر موتزارلا (به مقدار لازم)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای یا پنیر موتزارلا (به مقدار لازم)"
    ]
  },
  {
    "id": "ing-256c848f",
    "name": "عدس ریز",
    "normalizedName": "عدس ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس ریز"
    ]
  },
  {
    "id": "ing-9b2c4db9",
    "name": "ساقه کرفس خرد شده ‌2 عدد",
    "normalizedName": "ساقه کرفس خرد شده 2 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه کرفس خرد شده ‌2 عدد"
    ]
  },
  {
    "id": "ing-a47e16ae",
    "name": "بادمجان رنده شده",
    "normalizedName": "بادمجان رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان رنده شده"
    ]
  },
  {
    "id": "ing-98e3312e",
    "name": "پودر پاپریکا نصف قاشق چایخوری",
    "normalizedName": "پودر پاپریکا نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پاپریکا نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-637d444f",
    "name": "گشنیز خرد شده به مقدار لازم",
    "normalizedName": "گشنیز خرد شده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز خرد شده به مقدار لازم"
    ]
  },
  {
    "id": "ing-4104771c",
    "name": "شیر ولرم یک و نیم فنجان",
    "normalizedName": "شیر ولرم یک و نیم فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر ولرم یک و نیم فنجان"
    ]
  },
  {
    "id": "ing-872ab562",
    "name": "کره نصف فنجان",
    "normalizedName": "کره نصف فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نصف فنجان"
    ]
  },
  {
    "id": "ing-6e10238f",
    "name": "کنجد برای تزئین",
    "normalizedName": "کنجد برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد برای تزئین"
    ]
  },
  {
    "id": "ing-3cc88249",
    "name": "گوشت چرخ کرده با چربی",
    "normalizedName": "گوشت چرخ کرده با چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده با چربی"
    ]
  },
  {
    "id": "ing-dc7b8611",
    "name": "ماهیچه گوسفند",
    "normalizedName": "ماهیچه گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهیچه گوسفند"
    ]
  },
  {
    "id": "ing-4e916ae2",
    "name": "باقلا سبز",
    "normalizedName": "باقلا سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقلا سبز"
    ]
  },
  {
    "id": "ing-9ada8ec8",
    "name": "زردچوبه و نمک و فلفل مقدار لازم",
    "normalizedName": "زردچوبه و نمک و فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و نمک و فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-d0ceab83",
    "name": "سيب زمينی",
    "normalizedName": "سیب زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سيب زمينی"
    ]
  },
  {
    "id": "ing-fc1b7647",
    "name": "جو پرك",
    "normalizedName": "جو پرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو پرك"
    ]
  },
  {
    "id": "ing-bfda7fec",
    "name": "جعفری خرد شده برای تزیین",
    "normalizedName": "جعفری خرد شده برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خرد شده برای تزیین"
    ]
  },
  {
    "id": "ing-b3877161",
    "name": "نمك و فلفل و خامه به مقدار لازم",
    "normalizedName": "نمک و فلفل و خامه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك و فلفل و خامه به مقدار لازم"
    ]
  },
  {
    "id": "ing-6ee2fd5f",
    "name": "زردچوبه نصف قاشق چایخوری",
    "normalizedName": "زردچوبه نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-76f14fbe",
    "name": "روغن يا کره مقدار لازم",
    "normalizedName": "روغن یا کره مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن يا کره مقدار لازم"
    ]
  },
  {
    "id": "ing-3fb73d1",
    "name": "شکر و دارچين به مقدار لازم",
    "normalizedName": "شکر و دارچین به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر و دارچين به مقدار لازم"
    ]
  },
  {
    "id": "ing-6cc6a9f7",
    "name": "ارد نخودچی یا آرد ساده",
    "normalizedName": "ارد نخودچی یا ارد ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد نخودچی یا آرد ساده"
    ]
  },
  {
    "id": "ing-83825074",
    "name": "جعفری نصف فنجان",
    "normalizedName": "جعفری نصف فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری نصف فنجان"
    ]
  },
  {
    "id": "ing-6a8f1e35",
    "name": "ماءالشعیر",
    "normalizedName": "ماءالشعیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماءالشعیر"
    ]
  },
  {
    "id": "ing-845198bd",
    "name": "پیاز سفید کوچک",
    "normalizedName": "پیاز سفید کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز سفید کوچک"
    ]
  },
  {
    "id": "ing-55741a2e",
    "name": "برگ ریحان خرد شده",
    "normalizedName": "برگ ریحان خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ریحان خرد شده"
    ]
  },
  {
    "id": "ing-57841584",
    "name": "کالباس بیکن سرخ شده خرد شده",
    "normalizedName": "کالباس بیکن سرخ شده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس بیکن سرخ شده خرد شده"
    ]
  },
  {
    "id": "ing-6b39ed0",
    "name": "پنیر بلوچیز خرد شده",
    "normalizedName": "پنیر بلوچیز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر بلوچیز خرد شده"
    ]
  },
  {
    "id": "ing-e562703c",
    "name": "پنیر بلوچیز",
    "normalizedName": "پنیر بلوچیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر بلوچیز"
    ]
  },
  {
    "id": "ing-48b22f77",
    "name": "پاستای فرمی",
    "normalizedName": "پاستای فرمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستای فرمی"
    ]
  },
  {
    "id": "ing-38879829",
    "name": "ماست چکیده ساده",
    "normalizedName": "ماست چکیده ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست چکیده ساده"
    ]
  },
  {
    "id": "ing-efa4937d",
    "name": "خیار خرد شده",
    "normalizedName": "خیار خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار خرد شده"
    ]
  },
  {
    "id": "ing-a0680f84",
    "name": "تکه‌های پنیر فتا",
    "normalizedName": "تکه های پنیر فتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه‌های پنیر فتا"
    ]
  },
  {
    "id": "ing-ce41f8d1",
    "name": "زیتون نصف شده",
    "normalizedName": "زیتون نصف شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون نصف شده"
    ]
  },
  {
    "id": "ing-719d9c07",
    "name": "پرک فلفل قرمز",
    "normalizedName": "پرک فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرک فلفل قرمز"
    ]
  },
  {
    "id": "ing-f7874e24",
    "name": "پودر نان (سوخاری)",
    "normalizedName": "پودر نان (سوخاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نان (سوخاری)"
    ]
  },
  {
    "id": "ing-bd4dcc0e",
    "name": "فلفل دلمه‌ای قرمز (خرد شده)",
    "normalizedName": "فلفل دلمه ای قرمز (خرد شده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای قرمز (خرد شده)"
    ]
  },
  {
    "id": "ing-b1fb0a2a",
    "name": "کنسرو نخود یا نخود پخته شده",
    "normalizedName": "کنسرو نخود یا نخود پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو نخود یا نخود پخته شده"
    ]
  },
  {
    "id": "ing-7d598f6a",
    "name": "مرغ پخته ریش‌ریش‌شده",
    "normalizedName": "مرغ پخته ریش ریش شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پخته ریش‌ریش‌شده"
    ]
  },
  {
    "id": "ing-17b1c429",
    "name": "سس مایونز (یا ماست یونانی)",
    "normalizedName": "سس مایونز (یا ماست یونانی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز (یا ماست یونانی)"
    ]
  },
  {
    "id": "ing-40619b6f",
    "name": "نان دلخواه",
    "normalizedName": "نان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان دلخواه"
    ]
  },
  {
    "id": "ing-75194f71",
    "name": "دانه کاج یا مغز گردو",
    "normalizedName": "دانه کاج یا مغز گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه کاج یا مغز گردو"
    ]
  },
  {
    "id": "ing-85dea8ee",
    "name": "قارچ ( با قطر تقریبا",
    "normalizedName": "قارچ ( با قطر تقریبا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ ( با قطر تقریبا"
    ]
  },
  {
    "id": "ing-cabd4891",
    "name": "کره یا مارگارین",
    "normalizedName": "کره یا مارگارین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا مارگارین"
    ]
  },
  {
    "id": "ing-1ce44b0e",
    "name": "فلفل دلمه‌ای سبز",
    "normalizedName": "فلفل دلمه ای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای سبز"
    ]
  },
  {
    "id": "ing-df5f45d6",
    "name": "برگ جعفری خرد شده",
    "normalizedName": "برگ جعفری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ جعفری خرد شده"
    ]
  },
  {
    "id": "ing-664a28ed",
    "name": "پنیر فتا و زیتون سیاه برای تزیین",
    "normalizedName": "پنیر فتا و زیتون سیاه برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر فتا و زیتون سیاه برای تزیین"
    ]
  },
  {
    "id": "ing-2b1ca39f",
    "name": "خیارشور رنده شده",
    "normalizedName": "خیارشور رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیارشور رنده شده"
    ]
  },
  {
    "id": "ing-437a1213",
    "name": "ماکارونی پاپیونی",
    "normalizedName": "ماکارونی پاپیونی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماکارونی پاپیونی"
    ]
  },
  {
    "id": "ing-cf37d0f4",
    "name": "سس رنچ",
    "normalizedName": "سس رنچ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس رنچ"
    ]
  },
  {
    "id": "ing-1ff77338",
    "name": "کالباس بیکین خرد شده",
    "normalizedName": "کالباس بیکین خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس بیکین خرد شده"
    ]
  },
  {
    "id": "ing-de211d4d",
    "name": "گوجه بزرگ",
    "normalizedName": "گوجه بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه بزرگ"
    ]
  },
  {
    "id": "ing-449ae613",
    "name": "نودل خشک",
    "normalizedName": "نودل خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل خشک"
    ]
  },
  {
    "id": "ing-1ce4402b",
    "name": "فلفل دلمه‌ای زرد",
    "normalizedName": "فلفل دلمه ای زرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه‌ای زرد"
    ]
  },
  {
    "id": "ing-bcdfb062",
    "name": "فلفل تند قرمز",
    "normalizedName": "فلفل تند قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند قرمز"
    ]
  },
  {
    "id": "ing-5b916328",
    "name": "کنسرو ذرت شیرین",
    "normalizedName": "کنسرو ذرت شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو ذرت شیرین"
    ]
  },
  {
    "id": "ing-4893b5fb",
    "name": "بادام‌زمینی شور",
    "normalizedName": "بادام زمینی شور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام‌زمینی شور"
    ]
  },
  {
    "id": "ing-17693c1",
    "name": "لیموترش کوچک",
    "normalizedName": "لیموترش کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیموترش کوچک"
    ]
  },
  {
    "id": "ing-afd058c0",
    "name": "پیاز کوچک خردشده",
    "normalizedName": "پیاز کوچک خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز کوچک خردشده"
    ]
  },
  {
    "id": "ing-8b32e785",
    "name": "پودر نان سوخاری",
    "normalizedName": "پودر نان سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نان سوخاری"
    ]
  },
  {
    "id": "ing-2c864d1",
    "name": "پنیر موزورلا یا پارمسان",
    "normalizedName": "پنیر موزورلا یا پارمسان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزورلا یا پارمسان"
    ]
  },
  {
    "id": "ing-bb35a80e",
    "name": "فلفل تند قرمز خرد شده",
    "normalizedName": "فلفل تند قرمز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند قرمز خرد شده"
    ]
  },
  {
    "id": "ing-f663d7ea",
    "name": "گوجه خرد شده نگینی",
    "normalizedName": "گوجه خرد شده نگینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه خرد شده نگینی"
    ]
  },
  {
    "id": "ing-6ebdde90",
    "name": "جعفری به مقدار دلخواه",
    "normalizedName": "جعفری به مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری به مقدار دلخواه"
    ]
  },
  {
    "id": "ing-22c9bb3a",
    "name": "زیتون سبز خردشده",
    "normalizedName": "زیتون سبز خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون سبز خردشده"
    ]
  },
  {
    "id": "ing-b967cd27",
    "name": "فلفل دلمه ای درشت",
    "normalizedName": "فلفل دلمه ای درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای درشت"
    ]
  },
  {
    "id": "ing-b4d49998",
    "name": "گوجه خرد شده تفت داده شده",
    "normalizedName": "گوجه خرد شده تفت داده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه خرد شده تفت داده شده"
    ]
  },
  {
    "id": "ing-e0a25beb",
    "name": "جامبو",
    "normalizedName": "جامبو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جامبو"
    ]
  },
  {
    "id": "ing-b34abda2",
    "name": "ادویه تاکو",
    "normalizedName": "ادویه تاکو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه تاکو"
    ]
  },
  {
    "id": "ing-9e9641c6",
    "name": "گوجه نگینی",
    "normalizedName": "گوجه نگینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه نگینی"
    ]
  },
  {
    "id": "ing-e71139d0",
    "name": "جعفری تازه یا خشک شده",
    "normalizedName": "جعفری تازه یا خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه یا خشک شده"
    ]
  },
  {
    "id": "ing-f213d751",
    "name": "بیبی اسفناج خرد شده",
    "normalizedName": "بیبی اسفناج خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیبی اسفناج خرد شده"
    ]
  },
  {
    "id": "ing-d7076c47",
    "name": "زیتون مغز دار خرد شده",
    "normalizedName": "زیتون مغز دار خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون مغز دار خرد شده"
    ]
  },
  {
    "id": "ing-60dda45",
    "name": "پاپریکا(اختیاری)",
    "normalizedName": "پاپریکا(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاپریکا(اختیاری)"
    ]
  },
  {
    "id": "ing-66af5cd4",
    "name": "مغز تخمه کدو(اختیاری)",
    "normalizedName": "مغز تخمه کدو(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز تخمه کدو(اختیاری)"
    ]
  },
  {
    "id": "ing-3a7feec3",
    "name": "لبوی کوچک",
    "normalizedName": "لبوی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبوی کوچک"
    ]
  },
  {
    "id": "ing-a6047e0b",
    "name": "سیر ورقه شده",
    "normalizedName": "سیر ورقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر ورقه شده"
    ]
  },
  {
    "id": "ing-5999b5c1",
    "name": "ژامبون خرد شده(اختیاری)",
    "normalizedName": "ژامبون خرد شده(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون خرد شده(اختیاری)"
    ]
  },
  {
    "id": "ing-569b6122",
    "name": "روغن زیتون یا آفتابگردان",
    "normalizedName": "روغن زیتون یا افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا آفتابگردان"
    ]
  },
  {
    "id": "ing-5055ff6e",
    "name": "پودر فلفل تند",
    "normalizedName": "پودر فلفل تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل تند"
    ]
  },
  {
    "id": "ing-97423ab1",
    "name": "اسفناج درشت خرد شده",
    "normalizedName": "اسفناج درشت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج درشت خرد شده"
    ]
  },
  {
    "id": "ing-e4a4cb25",
    "name": "مغز گردوی خرد شده(اختیاری)",
    "normalizedName": "مغز گردوی خرد شده(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردوی خرد شده(اختیاری)"
    ]
  },
  {
    "id": "ing-72adc58b",
    "name": "تخم گشنیز خرد شده",
    "normalizedName": "تخم گشنیز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم گشنیز خرد شده"
    ]
  },
  {
    "id": "ing-98deac87",
    "name": "میخک خرد شده",
    "normalizedName": "میخک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میخک خرد شده"
    ]
  },
  {
    "id": "ing-eddf0b8b",
    "name": "هندوانه کوچک",
    "normalizedName": "هندوانه کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه کوچک"
    ]
  },
  {
    "id": "ing-2f1f4130",
    "name": "ژامبون گوشت دودی(اختیاری)",
    "normalizedName": "ژامبون گوشت دودی(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون گوشت دودی(اختیاری)"
    ]
  },
  {
    "id": "ing-fc267dc4",
    "name": "سس مایونز یا سس سالاد",
    "normalizedName": "سس مایونز یا سس سالاد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز یا سس سالاد"
    ]
  },
  {
    "id": "ing-974faca4",
    "name": "لبو (چغندر)",
    "normalizedName": "لبو (چغندر)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو (چغندر)"
    ]
  },
  {
    "id": "ing-92986fe9",
    "name": "خیار تازه",
    "normalizedName": "خیار تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار تازه"
    ]
  },
  {
    "id": "ing-5afaa348",
    "name": "سرکه سیب یا سرکه سفید",
    "normalizedName": "سرکه سیب یا سرکه سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سیب یا سرکه سفید"
    ]
  },
  {
    "id": "ing-1a00784",
    "name": "تخم خردل( اختیاری)",
    "normalizedName": "تخم خردل( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم خردل( اختیاری)"
    ]
  },
  {
    "id": "ing-178c5f1c",
    "name": "بامیه تازه",
    "normalizedName": "بامیه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بامیه تازه"
    ]
  },
  {
    "id": "ing-23df417d",
    "name": "فلفل قرمز تازه یا خشک شده",
    "normalizedName": "فلفل قرمز تازه یا خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز تازه یا خشک شده"
    ]
  },
  {
    "id": "ing-54dd6bd5",
    "name": "شوید خشک شده",
    "normalizedName": "شوید خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید خشک شده"
    ]
  },
  {
    "id": "ing-d2d1b27f",
    "name": "نان تست کوچک",
    "normalizedName": "نان تست کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست کوچک"
    ]
  },
  {
    "id": "ing-94b3fc90",
    "name": "سس کچاپ یا سس مارینارا",
    "normalizedName": "سس کچاپ یا سس مارینارا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کچاپ یا سس مارینارا"
    ]
  },
  {
    "id": "ing-884c1221",
    "name": "سوسیس پپرونی",
    "normalizedName": "سوسیس پپرونی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس پپرونی"
    ]
  },
  {
    "id": "ing-849683b7",
    "name": "پیاز سفید بزرگ",
    "normalizedName": "پیاز سفید بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز سفید بزرگ"
    ]
  },
  {
    "id": "ing-17aa9186",
    "name": "زنجبیل تازه ریزخردشده",
    "normalizedName": "زنجبیل تازه ریزخردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل تازه ریزخردشده"
    ]
  },
  {
    "id": "ing-a6486612",
    "name": "خیار ریز خرد شده",
    "normalizedName": "خیار ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار ریز خرد شده"
    ]
  },
  {
    "id": "ing-f8a6c35d",
    "name": "تکه‌های فلفل قرمز (اختیاری)",
    "normalizedName": "تکه های فلفل قرمز (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه‌های فلفل قرمز (اختیاری)"
    ]
  },
  {
    "id": "ing-7f4c3b88",
    "name": "سیر ریز خردشده",
    "normalizedName": "سیر ریز خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر ریز خردشده"
    ]
  },
  {
    "id": "ing-fc831a30",
    "name": "پودر پونه کوهی",
    "normalizedName": "پودر پونه کوهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پونه کوهی"
    ]
  },
  {
    "id": "ing-37896c9f",
    "name": "جعفری خشک",
    "normalizedName": "جعفری خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری خشک"
    ]
  },
  {
    "id": "ing-b8a89bc4",
    "name": "روغن کانولا یا کنجد",
    "normalizedName": "روغن کانولا یا کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کانولا یا کنجد"
    ]
  },
  {
    "id": "ing-934a96a2",
    "name": "پولنتا آماده (آرد ذرت)",
    "normalizedName": "پولنتا اماده (ارد ذرت)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پولنتا آماده (آرد ذرت)"
    ]
  },
  {
    "id": "ing-fcef7300",
    "name": "ریحان خرد شده تازه",
    "normalizedName": "ریحان خرد شده تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان خرد شده تازه"
    ]
  },
  {
    "id": "ing-dfd75842",
    "name": "سس تاپناد زیتون",
    "normalizedName": "سس تاپناد زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تاپناد زیتون"
    ]
  },
  {
    "id": "ing-f46cdcf5",
    "name": "گوجه گیلاسی (ترجیحا خشک)",
    "normalizedName": "گوجه گیلاسی (ترجیحا خشک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه گیلاسی (ترجیحا خشک)"
    ]
  },
  {
    "id": "ing-58381a45",
    "name": "كنسرو ماهی تن",
    "normalizedName": "کنسرو ماهی تن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كنسرو ماهی تن"
    ]
  },
  {
    "id": "ing-31b84ac2",
    "name": "پنیر پیتزای رنده شده",
    "normalizedName": "پنیر پیتزای رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزای رنده شده"
    ]
  },
  {
    "id": "ing-7b22afe9",
    "name": "سركه",
    "normalizedName": "سرکه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سركه"
    ]
  },
  {
    "id": "ing-bac2b587",
    "name": "نمك و فلفل",
    "normalizedName": "نمک و فلفل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمك و فلفل"
    ]
  },
  {
    "id": "ing-4c3912cb",
    "name": "زیتون سیاه هسته گرفته",
    "normalizedName": "زیتون سیاه هسته گرفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون سیاه هسته گرفته"
    ]
  },
  {
    "id": "ing-ba3fcd98",
    "name": "آب لیمو ترش تازه",
    "normalizedName": "اب لیمو ترش تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو ترش تازه"
    ]
  },
  {
    "id": "ing-d0441fff",
    "name": "جعفری ریز شده",
    "normalizedName": "جعفری ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری ریز شده"
    ]
  },
  {
    "id": "ing-fad4e4ea",
    "name": "ترشی فلفل خرد شده",
    "normalizedName": "ترشی فلفل خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترشی فلفل خرد شده"
    ]
  },
  {
    "id": "ing-e37d2179",
    "name": "تن ماهی جوشانده",
    "normalizedName": "تن ماهی جوشانده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تن ماهی جوشانده"
    ]
  },
  {
    "id": "ing-9e9b6927",
    "name": "چیپس پنیری خرد شده",
    "normalizedName": "چیپس پنیری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس پنیری خرد شده"
    ]
  },
  {
    "id": "ing-616abb10",
    "name": "دانه کاج یا گردو خرد شده",
    "normalizedName": "دانه کاج یا گردو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه کاج یا گردو خرد شده"
    ]
  },
  {
    "id": "ing-e178cd32",
    "name": "شقاقل",
    "normalizedName": "شقاقل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شقاقل"
    ]
  },
  {
    "id": "ing-3e8e80b0",
    "name": "هل به میزان کافی",
    "normalizedName": "هل به میزان کافی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هل به میزان کافی"
    ]
  },
  {
    "id": "ing-b7dd08c",
    "name": "آهک",
    "normalizedName": "اهک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آهک"
    ]
  },
  {
    "id": "ing-af5943aa",
    "name": "پوست هندوانه",
    "normalizedName": "پوست هندوانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست هندوانه"
    ]
  },
  {
    "id": "ing-a7b26818",
    "name": "زرد آلو با پوست نازک",
    "normalizedName": "زرد الو با پوست نازک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرد آلو با پوست نازک"
    ]
  },
  {
    "id": "ing-8c957b44",
    "name": "ریواس پاک کرده",
    "normalizedName": "ریواس پاک کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریواس پاک کرده"
    ]
  },
  {
    "id": "ing-63f6cbfb",
    "name": "پاستا فرمی",
    "normalizedName": "پاستا فرمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا فرمی"
    ]
  },
  {
    "id": "ing-ff548b44",
    "name": "سس مایونز کم چرب",
    "normalizedName": "سس مایونز کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز کم چرب"
    ]
  },
  {
    "id": "ing-9a5495f8",
    "name": "تربچه متوسط خرد شده",
    "normalizedName": "تربچه متوسط خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تربچه متوسط خرد شده"
    ]
  },
  {
    "id": "ing-829b1cd6",
    "name": "پیاز اسلایس شده",
    "normalizedName": "پیاز اسلایس شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز اسلایس شده"
    ]
  },
  {
    "id": "ing-8771d4b1",
    "name": "پاستا صدفی بزرگ",
    "normalizedName": "پاستا صدفی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا صدفی بزرگ"
    ]
  },
  {
    "id": "ing-d2f2da10",
    "name": "چیپس ترتیلا خرد شده",
    "normalizedName": "چیپس ترتیلا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس ترتیلا خرد شده"
    ]
  },
  {
    "id": "ing-e926d61d",
    "name": "گوشت پخته شده",
    "normalizedName": "گوشت پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت پخته شده"
    ]
  },
  {
    "id": "ing-eaf854b3",
    "name": "پودر نان یا برد کرامپ",
    "normalizedName": "پودر نان یا برد کرامپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نان یا برد کرامپ"
    ]
  },
  {
    "id": "ing-2877d3b1",
    "name": "آناناس",
    "normalizedName": "اناناس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس"
    ]
  },
  {
    "id": "ing-32a79bee",
    "name": "آب و شکر",
    "normalizedName": "اب و شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب و شکر"
    ]
  },
  {
    "id": "ing-17e909bd",
    "name": "کرانبری(قره قاط) خشک",
    "normalizedName": "کرانبری(قره قاط) خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرانبری(قره قاط) خشک"
    ]
  },
  {
    "id": "ing-214b3667",
    "name": "فلفل دلمه ای زرد و قرمز",
    "normalizedName": "فلفل دلمه ای زرد و قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای زرد و قرمز"
    ]
  },
  {
    "id": "ing-4ad76f09",
    "name": "برنج آفریقایی (کوسکوس)",
    "normalizedName": "برنج افریقایی (کوسکوس)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج آفریقایی (کوسکوس)"
    ]
  },
  {
    "id": "ing-6dd77fbf",
    "name": "آب مرغ یا سبزیجات (براث)",
    "normalizedName": "اب مرغ یا سبزیجات (براث)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب مرغ یا سبزیجات (براث)"
    ]
  },
  {
    "id": "ing-e3c9dd3e",
    "name": "مغز دانه ی آفتابگردان",
    "normalizedName": "مغز دانه ی افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز دانه ی آفتابگردان"
    ]
  },
  {
    "id": "ing-a3a84d8d",
    "name": "مخلوط آروگولا (منداب)",
    "normalizedName": "مخلوط اروگولا (منداب)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخلوط آروگولا (منداب)"
    ]
  },
  {
    "id": "ing-e4fdb729",
    "name": "شاهی و اسفناج ( یا هر مخلوط سبزی دلخواه)",
    "normalizedName": "شاهی و اسفناج ( یا هر مخلوط سبزی دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شاهی و اسفناج ( یا هر مخلوط سبزی دلخواه)"
    ]
  },
  {
    "id": "ing-7173d24c",
    "name": "نان کروتان (نان سوخاری تکه تکه شده)",
    "normalizedName": "نان کروتان (نان سوخاری تکه تکه شده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان کروتان (نان سوخاری تکه تکه شده)"
    ]
  },
  {
    "id": "ing-f029bf10",
    "name": "سیب زمینی های تازه و ریز",
    "normalizedName": "سیب زمینی های تازه و ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی های تازه و ریز"
    ]
  },
  {
    "id": "ing-41dd0512",
    "name": "نوارهای ژامبون گوشت 90% (بیکن)",
    "normalizedName": "نوارهای ژامبون گوشت 90% (بیکن)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوارهای ژامبون گوشت 90% (بیکن)"
    ]
  },
  {
    "id": "ing-6e3bb3bf",
    "name": "سرکه سرخ یا سفید",
    "normalizedName": "سرکه سرخ یا سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سرخ یا سفید"
    ]
  },
  {
    "id": "ing-ffa5337b",
    "name": "پیازچه تازه",
    "normalizedName": "پیازچه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه تازه"
    ]
  },
  {
    "id": "ing-ae879fa2",
    "name": "گلوله های پنیر موزارلا بزرگ",
    "normalizedName": "گلوله های پنیر موزارلا بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلوله های پنیر موزارلا بزرگ"
    ]
  },
  {
    "id": "ing-eb4cba2d",
    "name": "نمک دریا و فلفل سیاه ساییده شده",
    "normalizedName": "نمک دریا و فلفل سیاه ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دریا و فلفل سیاه ساییده شده"
    ]
  },
  {
    "id": "ing-dd021a41",
    "name": "گشنیز خشک پودر شده",
    "normalizedName": "گشنیز خشک پودر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز خشک پودر شده"
    ]
  },
  {
    "id": "ing-1fe165bd",
    "name": "ژامبون دودی",
    "normalizedName": "ژامبون دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون دودی"
    ]
  },
  {
    "id": "ing-e79ff8aa",
    "name": "مرغ پخته شده",
    "normalizedName": "مرغ پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ پخته شده"
    ]
  },
  {
    "id": "ing-1249d1ff",
    "name": "سرکه سفید یا سرخ",
    "normalizedName": "سرکه سفید یا سرخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه سفید یا سرخ"
    ]
  },
  {
    "id": "ing-ed8fb3c4",
    "name": "دوغ آب یا ماست ساده ی کم چرب",
    "normalizedName": "دوغ اب یا ماست ساده ی کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دوغ آب یا ماست ساده ی کم چرب"
    ]
  },
  {
    "id": "ing-4aa082e5",
    "name": "پیازکوهی یا پیازچه",
    "normalizedName": "پیازکوهی یا پیازچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازکوهی یا پیازچه"
    ]
  },
  {
    "id": "ing-16bcc0f3",
    "name": "نودل برنج نازک یا ضخیم",
    "normalizedName": "نودل برنج نازک یا ضخیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل برنج نازک یا ضخیم"
    ]
  },
  {
    "id": "ing-88b9e48f",
    "name": "فلفل قرمز کوچک",
    "normalizedName": "فلفل قرمز کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز کوچک"
    ]
  },
  {
    "id": "ing-f6e669a6",
    "name": "میگوی پخته شده",
    "normalizedName": "میگوی پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگوی پخته شده"
    ]
  },
  {
    "id": "ing-fe974e8d",
    "name": "ماست یونانی ساده",
    "normalizedName": "ماست یونانی ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یونانی ساده"
    ]
  },
  {
    "id": "ing-61fa6e54",
    "name": "نان تورتیلا",
    "normalizedName": "نان تورتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تورتیلا"
    ]
  },
  {
    "id": "ing-288df621",
    "name": "لبوی خام",
    "normalizedName": "لبوی خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبوی خام"
    ]
  },
  {
    "id": "ing-66ee12ba",
    "name": "گوجه ی گیلاسی",
    "normalizedName": "گوجه ی گیلاسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه ی گیلاسی"
    ]
  },
  {
    "id": "ing-d7f28afb",
    "name": "روغن زیتون برای مالیدن روی مواد",
    "normalizedName": "روغن زیتون برای مالیدن روی مواد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون برای مالیدن روی مواد"
    ]
  },
  {
    "id": "ing-8a426c2f",
    "name": "انگور بی دانه قرمز یا سیاه",
    "normalizedName": "انگور بی دانه قرمز یا سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور بی دانه قرمز یا سیاه"
    ]
  },
  {
    "id": "ing-b4e0b2a3",
    "name": "پنیر آبی خامه ای",
    "normalizedName": "پنیر ابی خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر آبی خامه ای"
    ]
  },
  {
    "id": "ing-d7cd1ebb",
    "name": "شاهی یا هر سبزی تند دیگر",
    "normalizedName": "شاهی یا هر سبزی تند دیگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شاهی یا هر سبزی تند دیگر"
    ]
  },
  {
    "id": "ing-d1f82714",
    "name": "ماست غلیظ",
    "normalizedName": "ماست غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست غلیظ"
    ]
  },
  {
    "id": "ing-31b4746a",
    "name": "پودر فلفل سیاه به میزان دلخواه",
    "normalizedName": "پودر فلفل سیاه به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سیاه به میزان دلخواه"
    ]
  },
  {
    "id": "ing-6c8b4cce",
    "name": "فلفل سیاه (اختیاری)",
    "normalizedName": "فلفل سیاه (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه (اختیاری)"
    ]
  },
  {
    "id": "ing-69d088f",
    "name": "ملون رسیده متوسط",
    "normalizedName": "ملون رسیده متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ملون رسیده متوسط"
    ]
  },
  {
    "id": "ing-c9ecd01e",
    "name": "توت فرنگی رسیده",
    "normalizedName": "توت فرنگی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی رسیده"
    ]
  },
  {
    "id": "ing-255b57c4",
    "name": "موز تازه رسیده",
    "normalizedName": "موز تازه رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز تازه رسیده"
    ]
  },
  {
    "id": "ing-b44e0d93",
    "name": "انجیر رسیده",
    "normalizedName": "انجیر رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انجیر رسیده"
    ]
  },
  {
    "id": "ing-4807848a",
    "name": "مغز بادام درسته",
    "normalizedName": "مغز بادام درسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز بادام درسته"
    ]
  },
  {
    "id": "ing-77bb9aa2",
    "name": "نان کشمشی",
    "normalizedName": "نان کشمشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان کشمشی"
    ]
  },
  {
    "id": "ing-6265c331",
    "name": "تخم گشنیز سائیده",
    "normalizedName": "تخم گشنیز سائیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم گشنیز سائیده"
    ]
  },
  {
    "id": "ing-21d85c64",
    "name": "مایونز کم چرب",
    "normalizedName": "مایونز کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مایونز کم چرب"
    ]
  },
  {
    "id": "ing-fc32a070",
    "name": "تکه های فیله مرغ پخته",
    "normalizedName": "تکه های فیله مرغ پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های فیله مرغ پخته"
    ]
  },
  {
    "id": "ing-1456fb9",
    "name": "تکه های مغز پرتقال (بدون پوست نازک)",
    "normalizedName": "تکه های مغز پرتقال (بدون پوست نازک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های مغز پرتقال (بدون پوست نازک)"
    ]
  },
  {
    "id": "ing-7f2786fd",
    "name": "پاستا پنه",
    "normalizedName": "پاستا پنه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا پنه"
    ]
  },
  {
    "id": "ing-9d82a661",
    "name": "عدس پخته شده",
    "normalizedName": "عدس پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس پخته شده"
    ]
  },
  {
    "id": "ing-fda20de",
    "name": "نان تست سوخاری",
    "normalizedName": "نان تست سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تست سوخاری"
    ]
  },
  {
    "id": "ing-c1159dc5",
    "name": "فلفل تند (به دلخواه)",
    "normalizedName": "فلفل تند (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند (به دلخواه)"
    ]
  },
  {
    "id": "ing-2e99857d",
    "name": "زنجبیل پودر یا رنده شده",
    "normalizedName": "زنجبیل پودر یا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل پودر یا رنده شده"
    ]
  },
  {
    "id": "ing-2321f335",
    "name": "کلم پیچ خرد شده",
    "normalizedName": "کلم پیچ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم پیچ خرد شده"
    ]
  },
  {
    "id": "ing-c7b13fe4",
    "name": "خیار خلال شده",
    "normalizedName": "خیار خلال شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار خلال شده"
    ]
  },
  {
    "id": "ing-dd4195f9",
    "name": "هویج متوسط حلقه شده",
    "normalizedName": "هویج متوسط حلقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج متوسط حلقه شده"
    ]
  },
  {
    "id": "ing-53f52ffa",
    "name": "گل کلم پر پر شده",
    "normalizedName": "گل کلم پر پر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم پر پر شده"
    ]
  },
  {
    "id": "ing-9f90810f",
    "name": "فیله ماهی کاد خرد شده",
    "normalizedName": "فیله ماهی کاد خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی کاد خرد شده"
    ]
  },
  {
    "id": "ing-76b3e0c7",
    "name": "میگو خرد شده",
    "normalizedName": "میگو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو خرد شده"
    ]
  },
  {
    "id": "ing-3c95c14e",
    "name": "لبو کوچک پخته شده",
    "normalizedName": "لبو کوچک پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو کوچک پخته شده"
    ]
  },
  {
    "id": "ing-286b83ed",
    "name": "رزماری خرد شده تازه",
    "normalizedName": "رزماری خرد شده تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری خرد شده تازه"
    ]
  },
  {
    "id": "ing-3e1654cb",
    "name": "جوجه پخته شده",
    "normalizedName": "جوجه پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوجه پخته شده"
    ]
  },
  {
    "id": "ing-78a5d3c6",
    "name": "کنسرو نخود سبز",
    "normalizedName": "کنسرو نخود سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنسرو نخود سبز"
    ]
  },
  {
    "id": "ing-9cbe5be8",
    "name": "تخم مرغ پخته شده رنده شده",
    "normalizedName": "تخم مرغ پخته شده رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ پخته شده رنده شده"
    ]
  },
  {
    "id": "ing-58a81605",
    "name": "سس خردل نوک قاشق",
    "normalizedName": "سس خردل نوک قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس خردل نوک قاشق"
    ]
  },
  {
    "id": "ing-64afd2b1",
    "name": "پیاز متوسط حلقه شده",
    "normalizedName": "پیاز متوسط حلقه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز متوسط حلقه شده"
    ]
  },
  {
    "id": "ing-c6c3ed36",
    "name": "فلفل دلمه ای زرد یا نارنجی",
    "normalizedName": "فلفل دلمه ای زرد یا نارنجی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای زرد یا نارنجی"
    ]
  },
  {
    "id": "ing-7d5a94bb",
    "name": "پاستا حلزونی",
    "normalizedName": "پاستا حلزونی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستا حلزونی"
    ]
  },
  {
    "id": "ing-fc818df1",
    "name": "گوجه فرنگی کوچک رنده شده",
    "normalizedName": "گوجه فرنگی کوچک رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوجه فرنگی کوچک رنده شده"
    ]
  },
  {
    "id": "ing-aa6186e8",
    "name": "فیله مرغ پخته شده خرد شده",
    "normalizedName": "فیله مرغ پخته شده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ پخته شده خرد شده"
    ]
  },
  {
    "id": "ing-bb23e454",
    "name": "کنجد تفت داده شده",
    "normalizedName": "کنجد تفت داده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد تفت داده شده"
    ]
  },
  {
    "id": "ing-334ce845",
    "name": "گلابی بزرگ خرد شده",
    "normalizedName": "گلابی بزرگ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی بزرگ خرد شده"
    ]
  },
  {
    "id": "ing-2a2a9c5f",
    "name": "دانه انگور قرمز",
    "normalizedName": "دانه انگور قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انگور قرمز"
    ]
  },
  {
    "id": "ing-e00881c9",
    "name": "بادام هندی خام",
    "normalizedName": "بادام هندی خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام هندی خام"
    ]
  },
  {
    "id": "ing-50eefb77",
    "name": "تخم آفتابگردان",
    "normalizedName": "تخم افتابگردان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم آفتابگردان"
    ]
  },
  {
    "id": "ing-99554c8c",
    "name": "فیله ماهی کبابی خرد شده",
    "normalizedName": "فیله ماهی کبابی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله ماهی کبابی خرد شده"
    ]
  },
  {
    "id": "ing-ea7e30cc",
    "name": "چغندر قرمز بزرگ تمیزشده",
    "normalizedName": "چغندر قرمز بزرگ تمیزشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چغندر قرمز بزرگ تمیزشده"
    ]
  },
  {
    "id": "ing-68e0009d",
    "name": "هویج متوسط پوست کنده شده",
    "normalizedName": "هویج متوسط پوست کنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج متوسط پوست کنده شده"
    ]
  },
  {
    "id": "ing-dc32555f",
    "name": "لبو پخته متوسط",
    "normalizedName": "لبو پخته متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو پخته متوسط"
    ]
  },
  {
    "id": "ing-bdcb1d27",
    "name": "کاهو متوسط",
    "normalizedName": "کاهو متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو متوسط"
    ]
  },
  {
    "id": "ing-cb5ceeed",
    "name": "تخم مرغ آبپز شده سفت",
    "normalizedName": "تخم مرغ ابپز شده سفت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ آبپز شده سفت"
    ]
  },
  {
    "id": "ing-2504260c",
    "name": "پیاز قرمز کوچک کاملا خرد شده",
    "normalizedName": "پیاز قرمز کوچک کاملا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمز کوچک کاملا خرد شده"
    ]
  },
  {
    "id": "ing-592012fc",
    "name": "کاهو پیچ خرد شده",
    "normalizedName": "کاهو پیچ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو پیچ خرد شده"
    ]
  },
  {
    "id": "ing-f1772850",
    "name": "کلم سفید خرد شده",
    "normalizedName": "کلم سفید خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم سفید خرد شده"
    ]
  },
  {
    "id": "ing-355bea21",
    "name": "فلفل دلمه ای قرمز کوچک خرد شده",
    "normalizedName": "فلفل دلمه ای قرمز کوچک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز کوچک خرد شده"
    ]
  },
  {
    "id": "ing-f7709d94",
    "name": "خیار شور بزرگ خرد شده",
    "normalizedName": "خیار شور بزرگ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور بزرگ خرد شده"
    ]
  },
  {
    "id": "ing-2db4fec6",
    "name": "پنیر چدار رنده شده یا مکعبی",
    "normalizedName": "پنیر چدار رنده شده یا مکعبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار رنده شده یا مکعبی"
    ]
  },
  {
    "id": "ing-42637f4a",
    "name": "میگو پخته شده",
    "normalizedName": "میگو پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میگو پخته شده"
    ]
  },
  {
    "id": "ing-9a7ad9e",
    "name": "سیب خرد شده",
    "normalizedName": "سیب خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب خرد شده"
    ]
  },
  {
    "id": "ing-e13dd08a",
    "name": "بلغور",
    "normalizedName": "بلغور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلغور"
    ]
  },
  {
    "id": "ing-a7709b1",
    "name": "تخم مرغ آبپز سفت",
    "normalizedName": "تخم مرغ ابپز سفت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ آبپز سفت"
    ]
  },
  {
    "id": "ing-100c410a",
    "name": "کشمش بدون دم",
    "normalizedName": "کشمش بدون دم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش بدون دم"
    ]
  },
  {
    "id": "ing-a56d2281",
    "name": "پودر شوید خشک",
    "normalizedName": "پودر شوید خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر شوید خشک"
    ]
  },
  {
    "id": "ing-fb7ad825",
    "name": "پودر سوپ آماده",
    "normalizedName": "پودر سوپ اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سوپ آماده"
    ]
  },
  {
    "id": "ing-db5b016c",
    "name": "اسفناج خرد شده پخته",
    "normalizedName": "اسفناج خرد شده پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج خرد شده پخته"
    ]
  },
  {
    "id": "ing-a7c6fccc",
    "name": "ژامبون گوشت خرد شده",
    "normalizedName": "ژامبون گوشت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژامبون گوشت خرد شده"
    ]
  },
  {
    "id": "ing-42896ddc",
    "name": "لوبیا پخته شده و له شده",
    "normalizedName": "لوبیا پخته شده و له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا پخته شده و له شده"
    ]
  },
  {
    "id": "ing-b0057e04",
    "name": "فیله مرغ پخته شده",
    "normalizedName": "فیله مرغ پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله مرغ پخته شده"
    ]
  },
  {
    "id": "ing-977384cc",
    "name": "پنیر گودا رنده شده",
    "normalizedName": "پنیر گودا رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر گودا رنده شده"
    ]
  },
  {
    "id": "ing-ed8903f",
    "name": "سس سالسا یا گوجه فرنگی خرد شده",
    "normalizedName": "سس سالسا یا گوجه فرنگی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سالسا یا گوجه فرنگی خرد شده"
    ]
  },
  {
    "id": "ing-38f827a5",
    "name": "حبّه انگور قرمز",
    "normalizedName": "حبّه انگور قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حبّه انگور قرمز"
    ]
  },
  {
    "id": "ing-725700a5",
    "name": "ورمیشل",
    "normalizedName": "ورمیشل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورمیشل"
    ]
  },
  {
    "id": "ing-8b4bbc66",
    "name": "پیازقرمز",
    "normalizedName": "پیازقرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازقرمز"
    ]
  },
  {
    "id": "ing-df3eb292",
    "name": "پنیر کممبر فرانسوی یا پنیر موزارلا",
    "normalizedName": "پنیر کممبر فرانسوی یا پنیر موزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر کممبر فرانسوی یا پنیر موزارلا"
    ]
  },
  {
    "id": "ing-d0d20796",
    "name": "سس مایونز و پنیر فتا",
    "normalizedName": "سس مایونز و پنیر فتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز و پنیر فتا"
    ]
  },
  {
    "id": "ing-db9bbb8f",
    "name": "انگور بی هسته",
    "normalizedName": "انگور بی هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور بی هسته"
    ]
  },
  {
    "id": "ing-3737360f",
    "name": "پیاز یا پیازچه",
    "normalizedName": "پیاز یا پیازچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز یا پیازچه"
    ]
  },
  {
    "id": "ing-9624a6df",
    "name": "خیار شور متوسط",
    "normalizedName": "خیار شور متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور متوسط"
    ]
  },
  {
    "id": "ing-a49e1f2c",
    "name": "پنیر خرد شده",
    "normalizedName": "پنیر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خرد شده"
    ]
  },
  {
    "id": "ing-35bd3c2a",
    "name": "روغن و نمک و فلفل",
    "normalizedName": "روغن و نمک و فلفل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن و نمک و فلفل"
    ]
  },
  {
    "id": "ing-195c405e",
    "name": "سس مخصوص سالاد",
    "normalizedName": "سس مخصوص سالاد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مخصوص سالاد"
    ]
  },
  {
    "id": "ing-7cc53ddd",
    "name": "سس سالاد",
    "normalizedName": "سس سالاد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سالاد"
    ]
  },
  {
    "id": "ing-7854ebad",
    "name": "آووکادو رسیده",
    "normalizedName": "اووکادو رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آووکادو رسیده"
    ]
  },
  {
    "id": "ing-51e9a878",
    "name": "خیار شور بزرگ",
    "normalizedName": "خیار شور بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور بزرگ"
    ]
  },
  {
    "id": "ing-5651a273",
    "name": "لبوی پخته رنده شده",
    "normalizedName": "لبوی پخته رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبوی پخته رنده شده"
    ]
  },
  {
    "id": "ing-93414ed6",
    "name": "نخود فرنگی کنسروی",
    "normalizedName": "نخود فرنگی کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی کنسروی"
    ]
  },
  {
    "id": "ing-917c1412",
    "name": "سیب زمینی پخته خرد شده",
    "normalizedName": "سیب زمینی پخته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی پخته خرد شده"
    ]
  },
  {
    "id": "ing-476cf3be",
    "name": "کلم بروکلی ریز خرد شده",
    "normalizedName": "کلم بروکلی ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی ریز خرد شده"
    ]
  },
  {
    "id": "ing-7bde13",
    "name": "تربچه قرمز",
    "normalizedName": "تربچه قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تربچه قرمز"
    ]
  },
  {
    "id": "ing-8e41c2f2",
    "name": "سس مایونز به مقدار لازم",
    "normalizedName": "سس مایونز به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز به مقدار لازم"
    ]
  },
  {
    "id": "ing-6fec134f",
    "name": "جعفری ریز خرد شده",
    "normalizedName": "جعفری ریز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری ریز خرد شده"
    ]
  },
  {
    "id": "ing-af796987",
    "name": "سس خردل یا سرکه سفید",
    "normalizedName": "سس خردل یا سرکه سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس خردل یا سرکه سفید"
    ]
  },
  {
    "id": "ing-cbb539c3",
    "name": "پیازچه خرد شده برای تزیین",
    "normalizedName": "پیازچه خرد شده برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه خرد شده برای تزیین"
    ]
  },
  {
    "id": "ing-c8b5f53",
    "name": "کلم سفید یا قرمز",
    "normalizedName": "کلم سفید یا قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم سفید یا قرمز"
    ]
  },
  {
    "id": "ing-423a1beb",
    "name": "آووكادو",
    "normalizedName": "اووکادو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آووكادو"
    ]
  },
  {
    "id": "ing-b9c943bb",
    "name": "خیار مقدار لازم",
    "normalizedName": "خیار مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار مقدار لازم"
    ]
  },
  {
    "id": "ing-8a7457ef",
    "name": "فلفل مقدار لازم",
    "normalizedName": "فلفل مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل مقدار لازم"
    ]
  },
  {
    "id": "ing-ca3f1390",
    "name": "شوید مقدار لازم",
    "normalizedName": "شوید مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شوید مقدار لازم"
    ]
  },
  {
    "id": "ing-91892f2a",
    "name": "روغن مقدار لازم",
    "normalizedName": "روغن مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مقدار لازم"
    ]
  },
  {
    "id": "ing-b7c8cf24",
    "name": "برگ ریحان برای تزئین",
    "normalizedName": "برگ ریحان برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ریحان برای تزئین"
    ]
  },
  {
    "id": "ing-b96476ad",
    "name": "انگور سیاه",
    "normalizedName": "انگور سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور سیاه"
    ]
  },
  {
    "id": "ing-5313f690",
    "name": "کاهوی تازه",
    "normalizedName": "کاهوی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهوی تازه"
    ]
  },
  {
    "id": "ing-3ecac3cf",
    "name": "روغن.نمک.فلفل به مقدار لازم",
    "normalizedName": "روغن.نمک.فلفل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن.نمک.فلفل به مقدار لازم"
    ]
  },
  {
    "id": "ing-68b4b53",
    "name": "آرد سفید و آرد سوخاری",
    "normalizedName": "ارد سفید و ارد سوخاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید و آرد سوخاری"
    ]
  },
  {
    "id": "ing-c8b449a2",
    "name": "کاهو برای تزئین",
    "normalizedName": "کاهو برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو برای تزئین"
    ]
  },
  {
    "id": "ing-54f7e73b",
    "name": "قارچ خام",
    "normalizedName": "قارچ خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ خام"
    ]
  },
  {
    "id": "ing-e1e279ed",
    "name": "جعفری تازه چند برگ",
    "normalizedName": "جعفری تازه چند برگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه چند برگ"
    ]
  },
  {
    "id": "ing-bb26f99b",
    "name": "نمک و فلفل به مقدار دلخواه",
    "normalizedName": "نمک و فلفل به مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل به مقدار دلخواه"
    ]
  },
  {
    "id": "ing-a7c50c8b",
    "name": "سس مایونز به مقدار دلخواه",
    "normalizedName": "سس مایونز به مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مایونز به مقدار دلخواه"
    ]
  },
  {
    "id": "ing-2e7082c9",
    "name": "آب گازدار",
    "normalizedName": "اب گازدار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گازدار"
    ]
  },
  {
    "id": "ing-3a84da0b",
    "name": "پودر آگار یا پودر ژلاتین",
    "normalizedName": "پودر اگار یا پودر ژلاتین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر آگار یا پودر ژلاتین"
    ]
  },
  {
    "id": "ing-3a21e892",
    "name": "دانه قهوه فوری",
    "normalizedName": "دانه قهوه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه قهوه فوری"
    ]
  },
  {
    "id": "ing-fc0a71d5",
    "name": "گردو یا بادام",
    "normalizedName": "گردو یا بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو یا بادام"
    ]
  },
  {
    "id": "ing-fd525fb2",
    "name": "مغز بادام یا پسته بو داده مقدار دلخواه",
    "normalizedName": "مغز بادام یا پسته بو داده مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز بادام یا پسته بو داده مقدار دلخواه"
    ]
  },
  {
    "id": "ing-e8b4b5ec",
    "name": "توت فرنگی تازه خرد شده",
    "normalizedName": "توت فرنگی تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی تازه خرد شده"
    ]
  },
  {
    "id": "ing-613001f4",
    "name": "خامه ۳۰٪ چربی",
    "normalizedName": "خامه ۳۰٪ چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ۳۰٪ چربی"
    ]
  },
  {
    "id": "ing-c2d1926c",
    "name": "توت فرنگی و اسپری خامه",
    "normalizedName": "توت فرنگی و اسپری خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی و اسپری خامه"
    ]
  },
  {
    "id": "ing-6dbd88c4",
    "name": "نشاسته (یا نشاسته ذرت)",
    "normalizedName": "نشاسته (یا نشاسته ذرت)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته (یا نشاسته ذرت)"
    ]
  },
  {
    "id": "ing-b566f5ed",
    "name": "پودر پسته",
    "normalizedName": "پودر پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پسته"
    ]
  },
  {
    "id": "ing-5dd5aa36",
    "name": "خمیر بنیه",
    "normalizedName": "خمیر بنیه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر بنیه"
    ]
  },
  {
    "id": "ing-9ace6a9d",
    "name": "خامه پر چرب (۳۵ تا",
    "normalizedName": "خامه پر چرب (۳۵ تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پر چرب (۳۵ تا"
    ]
  },
  {
    "id": "ing-6520c2e8",
    "name": "ترافل رنگی",
    "normalizedName": "ترافل رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترافل رنگی"
    ]
  },
  {
    "id": "ing-a5f5b7a1",
    "name": "زردآلوی خشک شده",
    "normalizedName": "زردالوی خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردآلوی خشک شده"
    ]
  },
  {
    "id": "ing-139b6825",
    "name": "روغن کرمانشاهی یا روغن گیاهی",
    "normalizedName": "روغن کرمانشاهی یا روغن گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کرمانشاهی یا روغن گیاهی"
    ]
  },
  {
    "id": "ing-20827659",
    "name": "خرمای با کیفیت",
    "normalizedName": "خرمای با کیفیت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرمای با کیفیت"
    ]
  },
  {
    "id": "ing-6957b5c6",
    "name": "پودرقند",
    "normalizedName": "پودرقند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودرقند"
    ]
  },
  {
    "id": "ing-6349380a",
    "name": "زعفران دم کره",
    "normalizedName": "زعفران دم کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کره"
    ]
  },
  {
    "id": "ing-4c8d1846",
    "name": "پودر خمیرمایه فوری",
    "normalizedName": "پودر خمیرمایه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خمیرمایه فوری"
    ]
  },
  {
    "id": "ing-fe853098",
    "name": "هل یا دارچین",
    "normalizedName": "هل یا دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هل یا دارچین"
    ]
  },
  {
    "id": "ing-29a4eea9",
    "name": "ماست در دمای اتاق",
    "normalizedName": "ماست در دمای اتاق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست در دمای اتاق"
    ]
  },
  {
    "id": "ing-788049b6",
    "name": "برای شربت ساده:",
    "normalizedName": "برای شربت ساده:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای شربت ساده:"
    ]
  },
  {
    "id": "ing-173381ef",
    "name": "بیسکویت اوریو",
    "normalizedName": "بیسکویت اوریو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکویت اوریو"
    ]
  },
  {
    "id": "ing-f9cb1131",
    "name": "پودر قند و انواع توت",
    "normalizedName": "پودر قند و انواع توت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند و انواع توت"
    ]
  },
  {
    "id": "ing-e1795535",
    "name": "طالبی",
    "normalizedName": "طالبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "طالبی"
    ]
  },
  {
    "id": "ing-32d39a4b",
    "name": "آب خنک",
    "normalizedName": "اب خنک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب خنک"
    ]
  },
  {
    "id": "ing-59b972b5",
    "name": "برگ نعنا به تعداد کافی",
    "normalizedName": "برگ نعنا به تعداد کافی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ نعنا به تعداد کافی"
    ]
  },
  {
    "id": "ing-33b34aa2",
    "name": "یخ قالبی",
    "normalizedName": "یخ قالبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یخ قالبی"
    ]
  },
  {
    "id": "ing-9f474349",
    "name": "پسته خرد شده",
    "normalizedName": "پسته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته خرد شده"
    ]
  },
  {
    "id": "ing-7af24b05",
    "name": "برای تهیه شربت عسل و دارچین",
    "normalizedName": "برای تهیه شربت عسل و دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای تهیه شربت عسل و دارچین"
    ]
  },
  {
    "id": "ing-642638b7",
    "name": "خمیر فیلو منجمد",
    "normalizedName": "خمیر فیلو منجمد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر فیلو منجمد"
    ]
  },
  {
    "id": "ing-aaedd694",
    "name": "برای روکش توت فرنگی:",
    "normalizedName": "برای روکش توت فرنگی:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای روکش توت فرنگی:"
    ]
  },
  {
    "id": "ing-e5fe246",
    "name": "برای خامه:",
    "normalizedName": "برای خامه:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای خامه:"
    ]
  },
  {
    "id": "ing-2f9672b5",
    "name": "خرمای بدون هسته یا چیپس خرما",
    "normalizedName": "خرمای بدون هسته یا چیپس خرما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرمای بدون هسته یا چیپس خرما"
    ]
  },
  {
    "id": "ing-3e72179a",
    "name": "گردو بدون پوست",
    "normalizedName": "گردو بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو بدون پوست"
    ]
  },
  {
    "id": "ing-727d4b9a",
    "name": "شیر تغلیظ شده (شیر عسلی)",
    "normalizedName": "شیر تغلیظ شده (شیر عسلی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر تغلیظ شده (شیر عسلی)"
    ]
  },
  {
    "id": "ing-c800c45c",
    "name": "توت فرنگی بزرگ",
    "normalizedName": "توت فرنگی بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی بزرگ"
    ]
  },
  {
    "id": "ing-520c721f",
    "name": "شربت توت فرنگی",
    "normalizedName": "شربت توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت توت فرنگی"
    ]
  },
  {
    "id": "ing-61d1efa1",
    "name": "لیمو ترش کوچک",
    "normalizedName": "لیمو ترش کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو ترش کوچک"
    ]
  },
  {
    "id": "ing-a1d5f72c",
    "name": "شیر پرچرب یا ماست",
    "normalizedName": "شیر پرچرب یا ماست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پرچرب یا ماست"
    ]
  },
  {
    "id": "ing-a640be12",
    "name": "تخم مرغ کوچک (در دمای اتاق)",
    "normalizedName": "تخم مرغ کوچک (در دمای اتاق)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ کوچک (در دمای اتاق)"
    ]
  },
  {
    "id": "ing-ef98647",
    "name": "برای وافل:",
    "normalizedName": "برای وافل:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای وافل:"
    ]
  },
  {
    "id": "ing-83e493ed",
    "name": "برای سس:",
    "normalizedName": "برای سس:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای سس:"
    ]
  },
  {
    "id": "ing-e8d1e5e9",
    "name": "خلال لیمو",
    "normalizedName": "خلال لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال لیمو"
    ]
  },
  {
    "id": "ing-e64e25cc",
    "name": "بلوبری تازه",
    "normalizedName": "بلوبری تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلوبری تازه"
    ]
  },
  {
    "id": "ing-4cf8ef00",
    "name": "شکر دانه درشت",
    "normalizedName": "شکر دانه درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر دانه درشت"
    ]
  },
  {
    "id": "ing-2145627a",
    "name": "پوست لیمو خلال شده",
    "normalizedName": "پوست لیمو خلال شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیمو خلال شده"
    ]
  },
  {
    "id": "ing-3092f858",
    "name": "خامه پرچرب زده شده",
    "normalizedName": "خامه پرچرب زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پرچرب زده شده"
    ]
  },
  {
    "id": "ing-ff63850",
    "name": "برای مرنگ:",
    "normalizedName": "برای مرنگ:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای مرنگ:"
    ]
  },
  {
    "id": "ing-33c5bf9b",
    "name": "رنگ مایع خوراکی قرمز",
    "normalizedName": "رنگ مایع خوراکی قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ مایع خوراکی قرمز"
    ]
  },
  {
    "id": "ing-130dce59",
    "name": "برای سس شکلات:",
    "normalizedName": "برای سس شکلات:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای سس شکلات:"
    ]
  },
  {
    "id": "ing-18797f71",
    "name": "خمیر بادام",
    "normalizedName": "خمیر بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر بادام"
    ]
  },
  {
    "id": "ing-94a9ed85",
    "name": "شکر برای تزیین",
    "normalizedName": "شکر برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر برای تزیین"
    ]
  },
  {
    "id": "ing-12eb030f",
    "name": "بادام پوست کنده",
    "normalizedName": "بادام پوست کنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام پوست کنده"
    ]
  },
  {
    "id": "ing-8f17df2b",
    "name": "کره بادام‌زمینی (ساده یا مغزدار)",
    "normalizedName": "کره بادام زمینی (ساده یا مغزدار)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بادام‌زمینی (ساده یا مغزدار)"
    ]
  },
  {
    "id": "ing-777edfa1",
    "name": "شکر برای روی شیرینی",
    "normalizedName": "شکر برای روی شیرینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر برای روی شیرینی"
    ]
  },
  {
    "id": "ing-765debe6",
    "name": "شکلات کیسز دو رنگ برای تزیین",
    "normalizedName": "شکلات کیسز دو رنگ برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات کیسز دو رنگ برای تزیین"
    ]
  },
  {
    "id": "ing-d228e063",
    "name": "کره نرم شده در دمای اتاق",
    "normalizedName": "کره نرم شده در دمای اتاق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نرم شده در دمای اتاق"
    ]
  },
  {
    "id": "ing-a71ab018",
    "name": "سس دولسه دلچه",
    "normalizedName": "سس دولسه دلچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس دولسه دلچه"
    ]
  },
  {
    "id": "ing-9447a19f",
    "name": "قوطی شیر عسلی",
    "normalizedName": "قوطی شیر عسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قوطی شیر عسلی"
    ]
  },
  {
    "id": "ing-804aee3e",
    "name": "شکلات تلخ (80% به بالا)",
    "normalizedName": "شکلات تلخ (80% به بالا)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ (80% به بالا)"
    ]
  },
  {
    "id": "ing-f25e4cd4",
    "name": "شکلات رنده شده یا ترافل رنگی",
    "normalizedName": "شکلات رنده شده یا ترافل رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات رنده شده یا ترافل رنگی"
    ]
  },
  {
    "id": "ing-2a32d9da",
    "name": "پودر نارگیل بو داده",
    "normalizedName": "پودر نارگیل بو داده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل بو داده"
    ]
  },
  {
    "id": "ing-12890ba4",
    "name": "کره بادام‌زمینی ¼ پیمانه",
    "normalizedName": "کره بادام زمینی ¼ پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بادام‌زمینی ¼ پیمانه"
    ]
  },
  {
    "id": "ing-e0de3234",
    "name": "شکر ½",
    "normalizedName": "شکر ½",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر ½"
    ]
  },
  {
    "id": "ing-b47539c4",
    "name": "شکر قهوه‌ای ½ پیمانه",
    "normalizedName": "شکر قهوه ای ½ پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه‌ای ½ پیمانه"
    ]
  },
  {
    "id": "ing-d6a0edde",
    "name": "خامه قنادی پرچرب",
    "normalizedName": "خامه قنادی پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه قنادی پرچرب"
    ]
  },
  {
    "id": "ing-4af518",
    "name": "مربا (هر مربایی که دوست دارید)",
    "normalizedName": "مربا (هر مربایی که دوست دارید)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا (هر مربایی که دوست دارید)"
    ]
  },
  {
    "id": "ing-e12cc332",
    "name": "خامه ی پرچرب",
    "normalizedName": "خامه ی پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی پرچرب"
    ]
  },
  {
    "id": "ing-fb9bf88b",
    "name": "شیر کامل (بالای",
    "normalizedName": "شیر کامل (بالای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر کامل (بالای"
    ]
  },
  {
    "id": "ing-e4ed90e",
    "name": "شیرعسلی",
    "normalizedName": "شیرعسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرعسلی"
    ]
  },
  {
    "id": "ing-16cf45d1",
    "name": "شکلات تلخ یا نیمه شیرین",
    "normalizedName": "شکلات تلخ یا نیمه شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ یا نیمه شیرین"
    ]
  },
  {
    "id": "ing-64084c5d",
    "name": "شیره بادام (اختیاری)",
    "normalizedName": "شیره بادام (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره بادام (اختیاری)"
    ]
  },
  {
    "id": "ing-c5ede91a",
    "name": "مغز گردو یا پسته",
    "normalizedName": "مغز گردو یا پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو یا پسته"
    ]
  },
  {
    "id": "ing-fe4af583",
    "name": "پوست لیموترش رنده شده",
    "normalizedName": "پوست لیموترش رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیموترش رنده شده"
    ]
  },
  {
    "id": "ing-eb3b3425",
    "name": "مربا یا کمپوت آلبالو (خنک)",
    "normalizedName": "مربا یا کمپوت البالو (خنک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا یا کمپوت آلبالو (خنک)"
    ]
  },
  {
    "id": "ing-ea12a5d7",
    "name": "پودر کیک وانیلی یا ردولوت",
    "normalizedName": "پودر کیک وانیلی یا ردولوت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کیک وانیلی یا ردولوت"
    ]
  },
  {
    "id": "ing-cbd327b0",
    "name": "مواد لازم پودر کیک",
    "normalizedName": "مواد لازم پودر کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مواد لازم پودر کیک"
    ]
  },
  {
    "id": "ing-8a1265e2",
    "name": "رنگ خوراکی صورتی",
    "normalizedName": "رنگ خوراکی صورتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی صورتی"
    ]
  },
  {
    "id": "ing-237497c1",
    "name": "پودر قند (برای پاشیدن روی سطح)",
    "normalizedName": "پودر قند (برای پاشیدن روی سطح)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند (برای پاشیدن روی سطح)"
    ]
  },
  {
    "id": "ing-f69881ef",
    "name": "پودر کاکائو (دلخواه)",
    "normalizedName": "پودر کاکائو (دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو (دلخواه)"
    ]
  },
  {
    "id": "ing-b864fcf",
    "name": "***",
    "normalizedName": "***",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "***"
    ]
  },
  {
    "id": "ing-e1d67705",
    "name": "مواد لازم برای کارامل:",
    "normalizedName": "مواد لازم برای کارامل:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مواد لازم برای کارامل:"
    ]
  },
  {
    "id": "ing-6dce1521",
    "name": "مواد لازم برای گاناش:",
    "normalizedName": "مواد لازم برای گاناش:",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مواد لازم برای گاناش:"
    ]
  },
  {
    "id": "ing-42597396",
    "name": "کنجد سیاه",
    "normalizedName": "کنجد سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد سیاه"
    ]
  },
  {
    "id": "ing-9125a221",
    "name": "پودر کیک",
    "normalizedName": "پودر کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کیک"
    ]
  },
  {
    "id": "ing-800dcc18",
    "name": "مواد لازم نوشته شده روی بسته پودر کیک",
    "normalizedName": "مواد لازم نوشته شده روی بسته پودر کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مواد لازم نوشته شده روی بسته پودر کیک"
    ]
  },
  {
    "id": "ing-7c24c894",
    "name": "سس توت فرنگی (دلخواه)",
    "normalizedName": "سس توت فرنگی (دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس توت فرنگی (دلخواه)"
    ]
  },
  {
    "id": "ing-28030956",
    "name": "کره خردشده",
    "normalizedName": "کره خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره خردشده"
    ]
  },
  {
    "id": "ing-a70c629",
    "name": "شکر آسیاب شده برای کارامل",
    "normalizedName": "شکر اسیاب شده برای کارامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر آسیاب شده برای کارامل"
    ]
  },
  {
    "id": "ing-5a0b635",
    "name": "خامه پرچرب برای کارامل",
    "normalizedName": "خامه پرچرب برای کارامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پرچرب برای کارامل"
    ]
  },
  {
    "id": "ing-60c9139d",
    "name": "کره خرد شده برای کارامل",
    "normalizedName": "کره خرد شده برای کارامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره خرد شده برای کارامل"
    ]
  },
  {
    "id": "ing-516492e",
    "name": "باتر کریم سوئیسی",
    "normalizedName": "باتر کریم سوئیسی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باتر کریم سوئیسی"
    ]
  },
  {
    "id": "ing-8da9c7ed",
    "name": "بیسکویت اوریوی کوچک",
    "normalizedName": "بیسکویت اوریوی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکویت اوریوی کوچک"
    ]
  },
  {
    "id": "ing-bc713880",
    "name": "آرد سلف ریزینگ",
    "normalizedName": "ارد سلف ریزینگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سلف ریزینگ"
    ]
  },
  {
    "id": "ing-7b784b38",
    "name": "آب گرم(دمای",
    "normalizedName": "اب گرم(دمای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گرم(دمای"
    ]
  },
  {
    "id": "ing-ea7e6038",
    "name": "عرق بهار نارنج (اختیاری)",
    "normalizedName": "عرق بهار نارنج (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عرق بهار نارنج (اختیاری)"
    ]
  },
  {
    "id": "ing-eda213dc",
    "name": "موز رسیده",
    "normalizedName": "موز رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز رسیده"
    ]
  },
  {
    "id": "ing-bff200f9",
    "name": "سس تافی یا بستنی برای تزیین",
    "normalizedName": "سس تافی یا بستنی برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تافی یا بستنی برای تزیین"
    ]
  },
  {
    "id": "ing-e0f53ad8",
    "name": "پودر ژله در رنگ های مختلف",
    "normalizedName": "پودر ژله در رنگ های مختلف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله در رنگ های مختلف"
    ]
  },
  {
    "id": "ing-4244984",
    "name": "روغن کرمانشاهی",
    "normalizedName": "روغن کرمانشاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کرمانشاهی"
    ]
  },
  {
    "id": "ing-e112ccf9",
    "name": "کشمش و بادام هندی خرد شده( اختیاری)",
    "normalizedName": "کشمش و بادام هندی خرد شده( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش و بادام هندی خرد شده( اختیاری)"
    ]
  },
  {
    "id": "ing-89b9b7c4",
    "name": "مغز پسته خرد شده",
    "normalizedName": "مغز پسته خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز پسته خرد شده"
    ]
  },
  {
    "id": "ing-bdd4e7c4",
    "name": "خرمالوی پوره شده",
    "normalizedName": "خرمالوی پوره شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرمالوی پوره شده"
    ]
  },
  {
    "id": "ing-b7d8d24",
    "name": "تخم",
    "normalizedName": "تخم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم"
    ]
  },
  {
    "id": "ing-378a84d7",
    "name": "روغن نارگیل",
    "normalizedName": "روغن نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن نارگیل"
    ]
  },
  {
    "id": "ing-2c2ebee0",
    "name": "ماست یونانی(ماست چکیده)",
    "normalizedName": "ماست یونانی(ماست چکیده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یونانی(ماست چکیده)"
    ]
  },
  {
    "id": "ing-bdad4714",
    "name": "دانه انار و کرنبری برای تزیین",
    "normalizedName": "دانه انار و کرنبری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار و کرنبری برای تزیین"
    ]
  },
  {
    "id": "ing-734d6580",
    "name": "اسانس وانیل برای خامه نارگیلی",
    "normalizedName": "اسانس وانیل برای خامه نارگیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل برای خامه نارگیلی"
    ]
  },
  {
    "id": "ing-944c5e54",
    "name": "کره برای روی مافین",
    "normalizedName": "کره برای روی مافین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره برای روی مافین"
    ]
  },
  {
    "id": "ing-92c6147",
    "name": "شکر برای روی مافین",
    "normalizedName": "شکر برای روی مافین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر برای روی مافین"
    ]
  },
  {
    "id": "ing-317129b6",
    "name": "ادویه کاجون (اختیاری)",
    "normalizedName": "ادویه کاجون (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه کاجون (اختیاری)"
    ]
  },
  {
    "id": "ing-f1fd670e",
    "name": "کدو حلوایی کوچک ( حدود",
    "normalizedName": "کدو حلوایی کوچک ( حدود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی کوچک ( حدود"
    ]
  },
  {
    "id": "ing-9a8c18da",
    "name": "آرد گندم کامل (سفید نشده)",
    "normalizedName": "ارد گندم کامل (سفید نشده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم کامل (سفید نشده)"
    ]
  },
  {
    "id": "ing-c9965001",
    "name": "شکلات تلخ یا نیمه تلخ آب شده",
    "normalizedName": "شکلات تلخ یا نیمه تلخ اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ یا نیمه تلخ آب شده"
    ]
  },
  {
    "id": "ing-1c3dd515",
    "name": "مربای زردآلو",
    "normalizedName": "مربای زردالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربای زردآلو"
    ]
  },
  {
    "id": "ing-ef9e98a1",
    "name": "اسانس بادام",
    "normalizedName": "اسانس بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس بادام"
    ]
  },
  {
    "id": "ing-ed0cb2a8",
    "name": "شکلات سفید ( یا چیپس شکلات سفید)",
    "normalizedName": "شکلات سفید ( یا چیپس شکلات سفید)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید ( یا چیپس شکلات سفید)"
    ]
  },
  {
    "id": "ing-3324eb20",
    "name": "خامه فرم گرفته یا مارشمالو برای روی هات چاکلت",
    "normalizedName": "خامه فرم گرفته یا مارشمالو برای روی هات چاکلت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرم گرفته یا مارشمالو برای روی هات چاکلت"
    ]
  },
  {
    "id": "ing-788ece97",
    "name": "نبات یا عسل (اختیاری)",
    "normalizedName": "نبات یا عسل (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نبات یا عسل (اختیاری)"
    ]
  },
  {
    "id": "ing-5cb95735",
    "name": "گل گاو زبان",
    "normalizedName": "گل گاو زبان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل گاو زبان"
    ]
  },
  {
    "id": "ing-16eff32c",
    "name": "سنبل الطیب",
    "normalizedName": "سنبل الطیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سنبل الطیب"
    ]
  },
  {
    "id": "ing-926f3b3c",
    "name": "سیب کوچک",
    "normalizedName": "سیب کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب کوچک"
    ]
  },
  {
    "id": "ing-af40f0bb",
    "name": "آب لیمو(اختیاری)",
    "normalizedName": "اب لیمو(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو(اختیاری)"
    ]
  },
  {
    "id": "ing-e1b30822",
    "name": "جو دوسر پرک",
    "normalizedName": "جو دوسر پرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو دوسر پرک"
    ]
  },
  {
    "id": "ing-8270e989",
    "name": "فندق بو نداده",
    "normalizedName": "فندق بو نداده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق بو نداده"
    ]
  },
  {
    "id": "ing-32d587dd",
    "name": "آب سیب",
    "normalizedName": "اب سیب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب سیب"
    ]
  },
  {
    "id": "ing-7792391a",
    "name": "چوب دارچین خرد شده",
    "normalizedName": "چوب دارچین خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب دارچین خرد شده"
    ]
  },
  {
    "id": "ing-5a6e8716",
    "name": "شکلات نیمه شیرین خرد شده",
    "normalizedName": "شکلات نیمه شیرین خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین خرد شده"
    ]
  },
  {
    "id": "ing-32d51076",
    "name": "آب شده",
    "normalizedName": "اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب شده"
    ]
  },
  {
    "id": "ing-59fa10e2",
    "name": "نمک دریا یا نمک معمولی",
    "normalizedName": "نمک دریا یا نمک معمولی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک دریا یا نمک معمولی"
    ]
  },
  {
    "id": "ing-f4bee70f",
    "name": "گل بابونه خشک شده",
    "normalizedName": "گل بابونه خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل بابونه خشک شده"
    ]
  },
  {
    "id": "ing-68b881e2",
    "name": "بیسکوئیت شورت برد",
    "normalizedName": "بیسکوئیت شورت برد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت شورت برد"
    ]
  },
  {
    "id": "ing-60eb5cc7",
    "name": "آب نارنگی تازه",
    "normalizedName": "اب نارنگی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارنگی تازه"
    ]
  },
  {
    "id": "ing-62647fbb",
    "name": "روغن آفتابگردان یا کانولا",
    "normalizedName": "روغن افتابگردان یا کانولا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن آفتابگردان یا کانولا"
    ]
  },
  {
    "id": "ing-94c636f6",
    "name": "اسمارتیز",
    "normalizedName": "اسمارتیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسمارتیز"
    ]
  },
  {
    "id": "ing-2f2866ab",
    "name": "پودر قند (شکر قنادی)",
    "normalizedName": "پودر قند (شکر قنادی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند (شکر قنادی)"
    ]
  },
  {
    "id": "ing-e0f5c2af",
    "name": "شکر ریزدانه",
    "normalizedName": "شکر ریزدانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر ریزدانه"
    ]
  },
  {
    "id": "ing-75826d74",
    "name": "اسانس و عصاره به دلخواه",
    "normalizedName": "اسانس و عصاره به دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس و عصاره به دلخواه"
    ]
  },
  {
    "id": "ing-2f1a591d",
    "name": "چیپس شکلات نیمه شیرین",
    "normalizedName": "چیپس شکلات نیمه شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلات نیمه شیرین"
    ]
  },
  {
    "id": "ing-196ce2de",
    "name": "بیسکوئیت دایجستیو شکلاتی",
    "normalizedName": "بیسکوئیت دایجستیو شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت دایجستیو شکلاتی"
    ]
  },
  {
    "id": "ing-30ee1830",
    "name": "پنیر خامه‌ای پرچرب",
    "normalizedName": "پنیر خامه ای پرچرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه‌ای پرچرب"
    ]
  },
  {
    "id": "ing-7c5f8092",
    "name": "شکلات تلخ (70%)",
    "normalizedName": "شکلات تلخ (70%)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ (70%)"
    ]
  },
  {
    "id": "ing-d618acd1",
    "name": "آلبالو خشکه",
    "normalizedName": "البالو خشکه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلبالو خشکه"
    ]
  },
  {
    "id": "ing-4666aa2f",
    "name": "خامه معمولی یا کم چرب",
    "normalizedName": "خامه معمولی یا کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه معمولی یا کم چرب"
    ]
  },
  {
    "id": "ing-f51d643a",
    "name": "کره کمی",
    "normalizedName": "کره کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره کمی"
    ]
  },
  {
    "id": "ing-5bd8dcc",
    "name": "توت فرنگی مقداری برای تزئین",
    "normalizedName": "توت فرنگی مقداری برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی مقداری برای تزئین"
    ]
  },
  {
    "id": "ing-6b28a374",
    "name": "پودر قند برای تزئین (اختیاری)",
    "normalizedName": "پودر قند برای تزئین (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند برای تزئین (اختیاری)"
    ]
  },
  {
    "id": "ing-3ab11cd7",
    "name": "انبه پوره شده",
    "normalizedName": "انبه پوره شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه پوره شده"
    ]
  },
  {
    "id": "ing-4d22012d",
    "name": "اسانس انبه",
    "normalizedName": "اسانس انبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس انبه"
    ]
  },
  {
    "id": "ing-71a59710",
    "name": "رنگ خوراکی زرد (اختیاری)",
    "normalizedName": "رنگ خوراکی زرد (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی زرد (اختیاری)"
    ]
  },
  {
    "id": "ing-dbc1dd3",
    "name": "آرد کامل",
    "normalizedName": "ارد کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد کامل"
    ]
  },
  {
    "id": "ing-de933bb3",
    "name": "رنده‌ی پوست لیموترش",
    "normalizedName": "رنده ی پوست لیموترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنده‌ی پوست لیموترش"
    ]
  },
  {
    "id": "ing-a819f152",
    "name": "چای کیسه‌ای",
    "normalizedName": "چای کیسه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چای کیسه‌ای"
    ]
  },
  {
    "id": "ing-8b538392",
    "name": "جوز هندی رنده شده",
    "normalizedName": "جوز هندی رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوز هندی رنده شده"
    ]
  },
  {
    "id": "ing-e3de2e4a",
    "name": "عسل یا شیره افرا ( اختیاری)",
    "normalizedName": "عسل یا شیره افرا ( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل یا شیره افرا ( اختیاری)"
    ]
  },
  {
    "id": "ing-c58e0e54",
    "name": "بیسکوئیت ساندویچی شکلاتی خرد شده",
    "normalizedName": "بیسکوئیت ساندویچی شکلاتی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت ساندویچی شکلاتی خرد شده"
    ]
  },
  {
    "id": "ing-31198dc5",
    "name": "چیپس شکلاتی یا شکلات",
    "normalizedName": "چیپس شکلاتی یا شکلات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی یا شکلات"
    ]
  },
  {
    "id": "ing-da196c12",
    "name": "شکر اضافی",
    "normalizedName": "شکر اضافی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر اضافی"
    ]
  },
  {
    "id": "ing-4c047afc",
    "name": "شیره انگور",
    "normalizedName": "شیره انگور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیره انگور"
    ]
  },
  {
    "id": "ing-4e8d0a53",
    "name": "بیسکوئیت",
    "normalizedName": "بیسکوئیت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت"
    ]
  },
  {
    "id": "ing-6b31bb4a",
    "name": "ژله آلوئه ورا",
    "normalizedName": "ژله الوئه ورا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله آلوئه ورا"
    ]
  },
  {
    "id": "ing-3a14c65e",
    "name": "مربا یا میوه دلخواه",
    "normalizedName": "مربا یا میوه دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا یا میوه دلخواه"
    ]
  },
  {
    "id": "ing-fae53cb7",
    "name": "بیسکوئیت باغ وحشی خرد شده",
    "normalizedName": "بیسکوئیت باغ وحشی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت باغ وحشی خرد شده"
    ]
  },
  {
    "id": "ing-af7f8d40",
    "name": "مارشمالو ذوب شده",
    "normalizedName": "مارشمالو ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارشمالو ذوب شده"
    ]
  },
  {
    "id": "ing-f71a0d15",
    "name": "آلبالو بدون هسته",
    "normalizedName": "البالو بدون هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلبالو بدون هسته"
    ]
  },
  {
    "id": "ing-a79f2428",
    "name": "خاک قند یا فراستینگ برای تزئین",
    "normalizedName": "خاک قند یا فراستینگ برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاک قند یا فراستینگ برای تزئین"
    ]
  },
  {
    "id": "ing-808a4d5e",
    "name": "کمپوت هلو",
    "normalizedName": "کمپوت هلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کمپوت هلو"
    ]
  },
  {
    "id": "ing-b96b1596",
    "name": "انگور قرمز",
    "normalizedName": "انگور قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور قرمز"
    ]
  },
  {
    "id": "ing-b27e62f5",
    "name": "کوکی شکلاتی خرد شده",
    "normalizedName": "کوکی شکلاتی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کوکی شکلاتی خرد شده"
    ]
  },
  {
    "id": "ing-696ab867",
    "name": "چیپس شکلات سفید",
    "normalizedName": "چیپس شکلات سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلات سفید"
    ]
  },
  {
    "id": "ing-44ee324e",
    "name": "پنیرخامه ای نرم شده",
    "normalizedName": "پنیرخامه ای نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیرخامه ای نرم شده"
    ]
  },
  {
    "id": "ing-43db9bf1",
    "name": "شکلات شیرین رنده شده",
    "normalizedName": "شکلات شیرین رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیرین رنده شده"
    ]
  },
  {
    "id": "ing-5ac22d89",
    "name": "بیکینیگ پودر",
    "normalizedName": "بیکینیگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیکینیگ پودر"
    ]
  },
  {
    "id": "ing-a41ca55b",
    "name": "پودر اسپرسو یا نسکافه",
    "normalizedName": "پودر اسپرسو یا نسکافه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر اسپرسو یا نسکافه"
    ]
  },
  {
    "id": "ing-e3b2174d",
    "name": "بیسکوئیت لیدی فینگر",
    "normalizedName": "بیسکوئیت لیدی فینگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت لیدی فینگر"
    ]
  },
  {
    "id": "ing-ae3b081a",
    "name": "ترافل نقره ای یا رنگی",
    "normalizedName": "ترافل نقره ای یا رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترافل نقره ای یا رنگی"
    ]
  },
  {
    "id": "ing-512df4f3",
    "name": "شکلات تخته‌ای",
    "normalizedName": "شکلات تخته ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته‌ای"
    ]
  },
  {
    "id": "ing-e49477cf",
    "name": "آب پرتقال(با تکه های پرتقال)نصف پیمانه",
    "normalizedName": "اب پرتقال(با تکه های پرتقال)نصف پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب پرتقال(با تکه های پرتقال)نصف پیمانه"
    ]
  },
  {
    "id": "ing-8fec88f8",
    "name": "چای کیسه ای غلیظ (تی بگ)",
    "normalizedName": "چای کیسه ای غلیظ (تی بگ)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چای کیسه ای غلیظ (تی بگ)"
    ]
  },
  {
    "id": "ing-6445b70f",
    "name": "پودر یا خلال پسته",
    "normalizedName": "پودر یا خلال پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر یا خلال پسته"
    ]
  },
  {
    "id": "ing-6358018b",
    "name": "خرما خشک",
    "normalizedName": "خرما خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما خشک"
    ]
  },
  {
    "id": "ing-62a53f4b",
    "name": "گردو تست و خرد شده",
    "normalizedName": "گردو تست و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو تست و خرد شده"
    ]
  },
  {
    "id": "ing-d779cd69",
    "name": "پوست رنده شده",
    "normalizedName": "پوست رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست رنده شده"
    ]
  },
  {
    "id": "ing-95c65322",
    "name": "ژلاتین ساده",
    "normalizedName": "ژلاتین ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژلاتین ساده"
    ]
  },
  {
    "id": "ing-5fbffad2",
    "name": "ماست‏ شیرین",
    "normalizedName": "ماست‏ شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست‏ شیرین"
    ]
  },
  {
    "id": "ing-5ede2c99",
    "name": "پودر نارگیل و پودر پسته برای تزئین به مقدار لازم",
    "normalizedName": "پودر نارگیل و پودر پسته برای تزئین به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل و پودر پسته برای تزئین به مقدار لازم"
    ]
  },
  {
    "id": "ing-fb989612",
    "name": "گردو نصف شده",
    "normalizedName": "گردو نصف شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو نصف شده"
    ]
  },
  {
    "id": "ing-732665a9",
    "name": "شکلات تکه شده",
    "normalizedName": "شکلات تکه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تکه شده"
    ]
  },
  {
    "id": "ing-27d5608",
    "name": "خامه قنادی کمی زده شده",
    "normalizedName": "خامه قنادی کمی زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه قنادی کمی زده شده"
    ]
  },
  {
    "id": "ing-95be1eea",
    "name": "شورتنینگ یا مارگارین",
    "normalizedName": "شورتنینگ یا مارگارین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شورتنینگ یا مارگارین"
    ]
  },
  {
    "id": "ing-da4d45eb",
    "name": "كاكائو",
    "normalizedName": "کاکائو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كاكائو"
    ]
  },
  {
    "id": "ing-12f0c812",
    "name": "سمولینا",
    "normalizedName": "سمولینا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سمولینا"
    ]
  },
  {
    "id": "ing-65be982d",
    "name": "خلال پسته یا بادام یا آجیل",
    "normalizedName": "خلال پسته یا بادام یا اجیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته یا بادام یا آجیل"
    ]
  },
  {
    "id": "ing-8f5476a4",
    "name": "پودر کاسترد",
    "normalizedName": "پودر کاسترد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاسترد"
    ]
  },
  {
    "id": "ing-830ef82",
    "name": "شیرعسل",
    "normalizedName": "شیرعسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرعسل"
    ]
  },
  {
    "id": "ing-19708540",
    "name": "برنج سفید پخته نشده",
    "normalizedName": "برنج سفید پخته نشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج سفید پخته نشده"
    ]
  },
  {
    "id": "ing-a1ba53d8",
    "name": "شیر پرچرب یا کامل",
    "normalizedName": "شیر پرچرب یا کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پرچرب یا کامل"
    ]
  },
  {
    "id": "ing-973a0fde",
    "name": "اسانس توت فرنگی",
    "normalizedName": "اسانس توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس توت فرنگی"
    ]
  },
  {
    "id": "ing-32d3b11a",
    "name": "اب جوش",
    "normalizedName": "اب جوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اب جوش"
    ]
  },
  {
    "id": "ing-368db702",
    "name": "پسته آسیاب کرده",
    "normalizedName": "پسته اسیاب کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته آسیاب کرده"
    ]
  },
  {
    "id": "ing-38755981",
    "name": "رنگ سبز خوراکی",
    "normalizedName": "رنگ سبز خوراکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ سبز خوراکی"
    ]
  },
  {
    "id": "ing-ec1e27cf",
    "name": "میوه خرد شده",
    "normalizedName": "میوه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه خرد شده"
    ]
  },
  {
    "id": "ing-5364bf1",
    "name": "نارگیل درشت رنده شده",
    "normalizedName": "نارگیل درشت رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل درشت رنده شده"
    ]
  },
  {
    "id": "ing-5c1aecb1",
    "name": "شکلات سفید مکعبی",
    "normalizedName": "شکلات سفید مکعبی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید مکعبی"
    ]
  },
  {
    "id": "ing-2093be8",
    "name": "کره بدون نمک سرد شده",
    "normalizedName": "کره بدون نمک سرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بدون نمک سرد شده"
    ]
  },
  {
    "id": "ing-90dfbe5a",
    "name": "سفیده تخم مرغ زده شده",
    "normalizedName": "سفیده تخم مرغ زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم مرغ زده شده"
    ]
  },
  {
    "id": "ing-ae62bba",
    "name": "مربای توت",
    "normalizedName": "مربای توت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربای توت"
    ]
  },
  {
    "id": "ing-3985b0fa",
    "name": "نارگیل پودر",
    "normalizedName": "نارگیل پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل پودر"
    ]
  },
  {
    "id": "ing-51566ef6",
    "name": "موز خرد شده",
    "normalizedName": "موز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز خرد شده"
    ]
  },
  {
    "id": "ing-1e4d7dd",
    "name": "آناناس خرد شده",
    "normalizedName": "اناناس خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس خرد شده"
    ]
  },
  {
    "id": "ing-7456cff1",
    "name": "خردو خرد شده",
    "normalizedName": "خردو خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خردو خرد شده"
    ]
  },
  {
    "id": "ing-3a5b2398",
    "name": "آب لیموترش تازه",
    "normalizedName": "اب لیموترش تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیموترش تازه"
    ]
  },
  {
    "id": "ing-bf0da4e8",
    "name": "پوست رنده شده لیمو ترش نصف عدد",
    "normalizedName": "پوست رنده شده لیمو ترش نصف عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست رنده شده لیمو ترش نصف عدد"
    ]
  },
  {
    "id": "ing-74aab4cb",
    "name": "بادام خرد شده",
    "normalizedName": "بادام خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام خرد شده"
    ]
  },
  {
    "id": "ing-83315f01",
    "name": "بادام پرک",
    "normalizedName": "بادام پرک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام پرک"
    ]
  },
  {
    "id": "ing-1345aadb",
    "name": "جو پرک آماده طبخ",
    "normalizedName": "جو پرک اماده طبخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو پرک آماده طبخ"
    ]
  },
  {
    "id": "ing-266eef6e",
    "name": "مخلوط گردو و فندق",
    "normalizedName": "مخلوط گردو و فندق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخلوط گردو و فندق"
    ]
  },
  {
    "id": "ing-c74466f8",
    "name": "پودر فلفل فرنگی",
    "normalizedName": "پودر فلفل فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل فرنگی"
    ]
  },
  {
    "id": "ing-dc57c8d4",
    "name": "پودر قند برای پاشیدن روی پاستری",
    "normalizedName": "پودر قند برای پاشیدن روی پاستری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند برای پاشیدن روی پاستری"
    ]
  },
  {
    "id": "ing-a163fb72",
    "name": "خامه یا بستنی برای سرو (اختیاری)",
    "normalizedName": "خامه یا بستنی برای سرو (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا بستنی برای سرو (اختیاری)"
    ]
  },
  {
    "id": "ing-dd35de78",
    "name": "خمیر پای یا پاستری برای پای دولایه",
    "normalizedName": "خمیر پای یا پاستری برای پای دولایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پای یا پاستری برای پای دولایه"
    ]
  },
  {
    "id": "ing-ab29c93f",
    "name": "توت فرنگی ورق شده",
    "normalizedName": "توت فرنگی ورق شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی ورق شده"
    ]
  },
  {
    "id": "ing-8745c0ae",
    "name": "ریواس شیرین نشده تازه یا یخ زده که یخ آن باز شده باشد",
    "normalizedName": "ریواس شیرین نشده تازه یا یخ زده که یخ ان باز شده باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریواس شیرین نشده تازه یا یخ زده که یخ آن باز شده باشد"
    ]
  },
  {
    "id": "ing-4bd3edc8",
    "name": "خلال ریز پوست پرتقال",
    "normalizedName": "خلال ریز پوست پرتقال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال ریز پوست پرتقال"
    ]
  },
  {
    "id": "ing-9123617b",
    "name": "پودر جوز",
    "normalizedName": "پودر جوز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر جوز"
    ]
  },
  {
    "id": "ing-42af0f27",
    "name": "کره ی سرد قطعه قطعه شده",
    "normalizedName": "کره ی سرد قطعه قطعه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی سرد قطعه قطعه شده"
    ]
  },
  {
    "id": "ing-3745c2b0",
    "name": "توت فرنگی پاک شده و خرد شده",
    "normalizedName": "توت فرنگی پاک شده و خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی پاک شده و خرد شده"
    ]
  },
  {
    "id": "ing-c3e8052e",
    "name": "خامه ی غلیظ زده شده",
    "normalizedName": "خامه ی غلیظ زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ زده شده"
    ]
  },
  {
    "id": "ing-b02b790b",
    "name": "توت فرنگی نصف شده اضافی برای تزئین",
    "normalizedName": "توت فرنگی نصف شده اضافی برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی نصف شده اضافی برای تزئین"
    ]
  },
  {
    "id": "ing-d05e8575",
    "name": "کره یا شورتنینگ",
    "normalizedName": "کره یا شورتنینگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا شورتنینگ"
    ]
  },
  {
    "id": "ing-a0e7fb43",
    "name": "مربا توت فرنگی",
    "normalizedName": "مربا توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا توت فرنگی"
    ]
  },
  {
    "id": "ing-5218f173",
    "name": "فراستینگ توت فرنگی",
    "normalizedName": "فراستینگ توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فراستینگ توت فرنگی"
    ]
  },
  {
    "id": "ing-903f9b68",
    "name": "زرده و سفیده جدا شده",
    "normalizedName": "زرده و سفیده جدا شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده و سفیده جدا شده"
    ]
  },
  {
    "id": "ing-4abb7411",
    "name": "گلابی کمپوتی",
    "normalizedName": "گلابی کمپوتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی کمپوتی"
    ]
  },
  {
    "id": "ing-94738663",
    "name": "خامه ی غلیظ یا کره (اختیاری) جهت سرو",
    "normalizedName": "خامه ی غلیظ یا کره (اختیاری) جهت سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ یا کره (اختیاری) جهت سرو"
    ]
  },
  {
    "id": "ing-afb39940",
    "name": "کره یا روغن گیاهی (ترد کننده شیرینی)",
    "normalizedName": "کره یا روغن گیاهی (ترد کننده شیرینی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن گیاهی (ترد کننده شیرینی)"
    ]
  },
  {
    "id": "ing-74bbc447",
    "name": "زرده تخم مرغ کمی زده شده",
    "normalizedName": "زرده تخم مرغ کمی زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرغ کمی زده شده"
    ]
  },
  {
    "id": "ing-d7cb084",
    "name": "خامه ی زده شده",
    "normalizedName": "خامه ی زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی زده شده"
    ]
  },
  {
    "id": "ing-57d5757",
    "name": "تمشک یخ زده که یخ آن باز شده باشد",
    "normalizedName": "تمشک یخ زده که یخ ان باز شده باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک یخ زده که یخ آن باز شده باشد"
    ]
  },
  {
    "id": "ing-998ad73a",
    "name": "نشاسته ی ذرت ( آرد ذرت)",
    "normalizedName": "نشاسته ی ذرت ( ارد ذرت)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته ی ذرت ( آرد ذرت)"
    ]
  },
  {
    "id": "ing-cc5d6f74",
    "name": "ژله ی انگورفرنگی قرمز",
    "normalizedName": "ژله ی انگورفرنگی قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله ی انگورفرنگی قرمز"
    ]
  },
  {
    "id": "ing-69181d78",
    "name": "شکلات شیری خرد شده",
    "normalizedName": "شکلات شیری خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیری خرد شده"
    ]
  },
  {
    "id": "ing-9786a237",
    "name": "پودر کاکائوی خالص",
    "normalizedName": "پودر کاکائوی خالص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائوی خالص"
    ]
  },
  {
    "id": "ing-87de283d",
    "name": "مقداری نمک",
    "normalizedName": "مقداری نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مقداری نمک"
    ]
  },
  {
    "id": "ing-c734e1f1",
    "name": "خامه ی غلیظ فرمی",
    "normalizedName": "خامه ی غلیظ فرمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ فرمی"
    ]
  },
  {
    "id": "ing-5dbbf5a9",
    "name": "خمیر پفکی",
    "normalizedName": "خمیر پفکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پفکی"
    ]
  },
  {
    "id": "ing-cddfe5be",
    "name": "پنیر ریکوتا (یا پنیر خامه ای)",
    "normalizedName": "پنیر ریکوتا (یا پنیر خامه ای)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا (یا پنیر خامه ای)"
    ]
  },
  {
    "id": "ing-842a91d6",
    "name": "مربای توت خرد شده",
    "normalizedName": "مربای توت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربای توت خرد شده"
    ]
  },
  {
    "id": "ing-9aaf4d34",
    "name": "شربت ذرت رقیق",
    "normalizedName": "شربت ذرت رقیق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت ذرت رقیق"
    ]
  },
  {
    "id": "ing-c29f8f25",
    "name": "پسته ی خرد شده",
    "normalizedName": "پسته ی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته ی خرد شده"
    ]
  },
  {
    "id": "ing-751d7b12",
    "name": "شکلات نیمه شیرین (ساده) ذوب شده و سرد شده",
    "normalizedName": "شکلات نیمه شیرین (ساده) ذوب شده و سرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین (ساده) ذوب شده و سرد شده"
    ]
  },
  {
    "id": "ing-fe259df5",
    "name": "شکلات کاملا خرد شده",
    "normalizedName": "شکلات کاملا خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات کاملا خرد شده"
    ]
  },
  {
    "id": "ing-524d137d",
    "name": "خامه فرمی غلیظ",
    "normalizedName": "خامه فرمی غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرمی غلیظ"
    ]
  },
  {
    "id": "ing-6f214c56",
    "name": "نشاسته ذرت ( آرد ذرت)",
    "normalizedName": "نشاسته ذرت ( ارد ذرت)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته ذرت ( آرد ذرت)"
    ]
  },
  {
    "id": "ing-823be6c6",
    "name": "بادام درسته یا پودر بادام",
    "normalizedName": "بادام درسته یا پودر بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام درسته یا پودر بادام"
    ]
  },
  {
    "id": "ing-6fbcda02",
    "name": "دانه وانیل بریده شده از طول",
    "normalizedName": "دانه وانیل بریده شده از طول",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه وانیل بریده شده از طول"
    ]
  },
  {
    "id": "ing-8a5c81e9",
    "name": "سیب سبزِ خرد شده و بدون پوست",
    "normalizedName": "سیب سبزِ خرد شده و بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب سبزِ خرد شده و بدون پوست"
    ]
  },
  {
    "id": "ing-c9592bc3",
    "name": "انبه پوست کنده",
    "normalizedName": "انبه پوست کنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه پوست کنده"
    ]
  },
  {
    "id": "ing-6cad3232",
    "name": "توت سیاه",
    "normalizedName": "توت سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت سیاه"
    ]
  },
  {
    "id": "ing-cb2b0938",
    "name": "شکر شیرینی پزی (اختیاری) برای تزئین کیک",
    "normalizedName": "شکر شیرینی پزی (اختیاری) برای تزئین کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر شیرینی پزی (اختیاری) برای تزئین کیک"
    ]
  },
  {
    "id": "ing-be15ded8",
    "name": "کره ی نرم شده",
    "normalizedName": "کره ی نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی نرم شده"
    ]
  },
  {
    "id": "ing-a893f120",
    "name": "توت های تابستانی مخلوط",
    "normalizedName": "توت های تابستانی مخلوط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت های تابستانی مخلوط"
    ]
  },
  {
    "id": "ing-b997fab1",
    "name": "به دمای اتاق رسیده باشد",
    "normalizedName": "به دمای اتاق رسیده باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به دمای اتاق رسیده باشد"
    ]
  },
  {
    "id": "ing-d219ee7b",
    "name": "فندق پودر شده",
    "normalizedName": "فندق پودر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق پودر شده"
    ]
  },
  {
    "id": "ing-a22ec014",
    "name": "شکلات ذوب و خنک شده",
    "normalizedName": "شکلات ذوب و خنک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات ذوب و خنک شده"
    ]
  },
  {
    "id": "ing-d831560",
    "name": "ارد ساده",
    "normalizedName": "ارد ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد ساده"
    ]
  },
  {
    "id": "ing-97577602",
    "name": "کرم باواریا",
    "normalizedName": "کرم باواریا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرم باواریا"
    ]
  },
  {
    "id": "ing-712e2eda",
    "name": "میوه خرد شده (توت فرنگی",
    "normalizedName": "میوه خرد شده (توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه خرد شده (توت فرنگی"
    ]
  },
  {
    "id": "ing-2dd2f56f",
    "name": "موزف آناناس",
    "normalizedName": "موزف اناناس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موزف آناناس"
    ]
  },
  {
    "id": "ing-7b23f41b",
    "name": "سیب)",
    "normalizedName": "سیب)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب)"
    ]
  },
  {
    "id": "ing-8404105e",
    "name": "نان خرد شده به شکل مکعبی ترجیحا فرانسوی",
    "normalizedName": "نان خرد شده به شکل مکعبی ترجیحا فرانسوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان خرد شده به شکل مکعبی ترجیحا فرانسوی"
    ]
  },
  {
    "id": "ing-2c658a14",
    "name": "مکعب های",
    "normalizedName": "مکعب های",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مکعب های"
    ]
  },
  {
    "id": "ing-20f20da9",
    "name": "شکلات شیرین نشده (تلخ)",
    "normalizedName": "شکلات شیرین نشده (تلخ)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیرین نشده (تلخ)"
    ]
  },
  {
    "id": "ing-581ca8d0",
    "name": "خامه ی زده شده (اختیاری)",
    "normalizedName": "خامه ی زده شده (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی زده شده (اختیاری)"
    ]
  },
  {
    "id": "ing-2490d261",
    "name": "رنگ خوراکی سبز",
    "normalizedName": "رنگ خوراکی سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی سبز"
    ]
  },
  {
    "id": "ing-7b47e743",
    "name": "پشمک",
    "normalizedName": "پشمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پشمک"
    ]
  },
  {
    "id": "ing-190b77d0",
    "name": "کوکی ساده وانیلی",
    "normalizedName": "کوکی ساده وانیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کوکی ساده وانیلی"
    ]
  },
  {
    "id": "ing-c5f119c6",
    "name": "کمپوت گیلاس",
    "normalizedName": "کمپوت گیلاس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کمپوت گیلاس"
    ]
  },
  {
    "id": "ing-d9fbe69a",
    "name": "نشاسته ی سیب زمینی (آرد سیب زمینی)",
    "normalizedName": "نشاسته ی سیب زمینی (ارد سیب زمینی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته ی سیب زمینی (آرد سیب زمینی)"
    ]
  },
  {
    "id": "ing-26957a80",
    "name": "آرد چند منظوره (ساده) سفید نشده",
    "normalizedName": "ارد چند منظوره (ساده) سفید نشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد چند منظوره (ساده) سفید نشده"
    ]
  },
  {
    "id": "ing-dc4e1521",
    "name": "دارچین به مقدار کمی",
    "normalizedName": "دارچین به مقدار کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دارچین به مقدار کمی"
    ]
  },
  {
    "id": "ing-2078506e",
    "name": "پاستری تارت",
    "normalizedName": "پاستری تارت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستری تارت"
    ]
  },
  {
    "id": "ing-a798bb7b",
    "name": "شربت ذرت سبک",
    "normalizedName": "شربت ذرت سبک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت ذرت سبک"
    ]
  },
  {
    "id": "ing-77bf3afa",
    "name": "نشاسته ی ذرت (آرد ذرت)",
    "normalizedName": "نشاسته ی ذرت (ارد ذرت)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته ی ذرت (آرد ذرت)"
    ]
  },
  {
    "id": "ing-d64f51fc",
    "name": "خامه ی زده شده برای سرو",
    "normalizedName": "خامه ی زده شده برای سرو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی زده شده برای سرو"
    ]
  },
  {
    "id": "ing-9086a8f4",
    "name": "تراشه های شکلات برای تزئین",
    "normalizedName": "تراشه های شکلات برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تراشه های شکلات برای تزئین"
    ]
  },
  {
    "id": "ing-91005b40",
    "name": "زرده تخم مرغ بسیار درشت",
    "normalizedName": "زرده تخم مرغ بسیار درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرغ بسیار درشت"
    ]
  },
  {
    "id": "ing-89f3e76e",
    "name": "قهوه ی آماده",
    "normalizedName": "قهوه ی اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه ی آماده"
    ]
  },
  {
    "id": "ing-c0b1a7e8",
    "name": "پاستری پاف سریع یا فوری",
    "normalizedName": "پاستری پاف سریع یا فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستری پاف سریع یا فوری"
    ]
  },
  {
    "id": "ing-a6ddb871",
    "name": "خامه ی کم چرب",
    "normalizedName": "خامه ی کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی کم چرب"
    ]
  },
  {
    "id": "ing-2f52bce1",
    "name": "شکلات ساده ذوب شده",
    "normalizedName": "شکلات ساده ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات ساده ذوب شده"
    ]
  },
  {
    "id": "ing-56e2c12b",
    "name": "زرده تخم مرغ خیلی درشت",
    "normalizedName": "زرده تخم مرغ خیلی درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرغ خیلی درشت"
    ]
  },
  {
    "id": "ing-ee4e14d6",
    "name": "سفیده تخم مرغ خیلی درشت",
    "normalizedName": "سفیده تخم مرغ خیلی درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سفیده تخم مرغ خیلی درشت"
    ]
  },
  {
    "id": "ing-38fdd424",
    "name": "شکلات سفید برای تزئین یک قالب کوچک",
    "normalizedName": "شکلات سفید برای تزئین یک قالب کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید برای تزئین یک قالب کوچک"
    ]
  },
  {
    "id": "ing-4b788a88",
    "name": "تمشک درسته جهت سرو(اختیاری)",
    "normalizedName": "تمشک درسته جهت سرو(اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک درسته جهت سرو(اختیاری)"
    ]
  },
  {
    "id": "ing-33fa6469",
    "name": "کره ی بدون نمک تکه تکه شده",
    "normalizedName": "کره ی بدون نمک تکه تکه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک تکه تکه شده"
    ]
  },
  {
    "id": "ing-46d4bcb3",
    "name": "الک شده",
    "normalizedName": "الک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "الک شده"
    ]
  },
  {
    "id": "ing-eceb2d9e",
    "name": "عصاره وانیل (اسانس)",
    "normalizedName": "عصاره وانیل (اسانس)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره وانیل (اسانس)"
    ]
  },
  {
    "id": "ing-c7ae27a8",
    "name": "تمشک درسته جهت سرو (اختیاری)",
    "normalizedName": "تمشک درسته جهت سرو (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک درسته جهت سرو (اختیاری)"
    ]
  },
  {
    "id": "ing-1f943609",
    "name": "تخم مرغ متوسط",
    "normalizedName": "تخم مرغ متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ متوسط"
    ]
  },
  {
    "id": "ing-b261f003",
    "name": "زده شده",
    "normalizedName": "زده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زده شده"
    ]
  },
  {
    "id": "ing-cfeaa55a",
    "name": "شکلات نیمه شیرین (ساده) یا تلخ و شیرین (ساده)",
    "normalizedName": "شکلات نیمه شیرین (ساده) یا تلخ و شیرین (ساده)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین (ساده) یا تلخ و شیرین (ساده)"
    ]
  },
  {
    "id": "ing-be26c7a9",
    "name": "گیلاس جهت سرو (اختیاری)",
    "normalizedName": "گیلاس جهت سرو (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیلاس جهت سرو (اختیاری)"
    ]
  },
  {
    "id": "ing-10be8d39",
    "name": "شکلات شیرین آلمانی",
    "normalizedName": "شکلات شیرین المانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیرین آلمانی"
    ]
  },
  {
    "id": "ing-37f8aa0e",
    "name": "جوش شیرین ½ قاشق چایخوری",
    "normalizedName": "جوش شیرین ½ قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین ½ قاشق چایخوری"
    ]
  },
  {
    "id": "ing-54614317",
    "name": "نمک ½ قاشق چایخوری",
    "normalizedName": "نمک ½ قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک ½ قاشق چایخوری"
    ]
  },
  {
    "id": "ing-f9148ac5",
    "name": "نارگیل رنده شده یا پودر نارگیل",
    "normalizedName": "نارگیل رنده شده یا پودر نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل رنده شده یا پودر نارگیل"
    ]
  },
  {
    "id": "ing-19e528d7",
    "name": "پنیر خامه ای در دمای اتاق",
    "normalizedName": "پنیر خامه ای در دمای اتاق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای در دمای اتاق"
    ]
  },
  {
    "id": "ing-44d9c66e",
    "name": "پنیر ماسکارپونه در دمای اتاق",
    "normalizedName": "پنیر ماسکارپونه در دمای اتاق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ماسکارپونه در دمای اتاق"
    ]
  },
  {
    "id": "ing-88af1321",
    "name": "دانه ی وانیل",
    "normalizedName": "دانه ی وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی وانیل"
    ]
  },
  {
    "id": "ing-82df13a1",
    "name": "ساقه دارچین",
    "normalizedName": "ساقه دارچین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساقه دارچین"
    ]
  },
  {
    "id": "ing-b71f1e78",
    "name": "دلستر میوه ای بدون گاز",
    "normalizedName": "دلستر میوه ای بدون گاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دلستر میوه ای بدون گاز"
    ]
  },
  {
    "id": "ing-db975ba4",
    "name": "هلوی رسیده",
    "normalizedName": "هلوی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هلوی رسیده"
    ]
  },
  {
    "id": "ing-a67f9fb3",
    "name": "خامه ی غلیظ یا پنیر ماسکارپونه برای سرو ( اختیاری)",
    "normalizedName": "خامه ی غلیظ یا پنیر ماسکارپونه برای سرو ( اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی غلیظ یا پنیر ماسکارپونه برای سرو ( اختیاری)"
    ]
  },
  {
    "id": "ing-9a146f96",
    "name": "کره بسیار سرد",
    "normalizedName": "کره بسیار سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بسیار سرد"
    ]
  },
  {
    "id": "ing-f5e94d44",
    "name": "آلوی رسیده",
    "normalizedName": "الوی رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلوی رسیده"
    ]
  },
  {
    "id": "ing-8356fe47",
    "name": "بادام ساییده شده",
    "normalizedName": "بادام ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام ساییده شده"
    ]
  },
  {
    "id": "ing-3319b0dd",
    "name": "زنجبیل ساییده شده",
    "normalizedName": "زنجبیل ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل ساییده شده"
    ]
  },
  {
    "id": "ing-5fedef91",
    "name": "بادام پوست کنده یک مشت",
    "normalizedName": "بادام پوست کنده یک مشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام پوست کنده یک مشت"
    ]
  },
  {
    "id": "ing-a6d690b4",
    "name": "خامه یا بستی برای سرو (اختیاری)",
    "normalizedName": "خامه یا بستی برای سرو (اختیاری)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا بستی برای سرو (اختیاری)"
    ]
  },
  {
    "id": "ing-b2d4cccf",
    "name": "انگور فرنگی(currant) قرمز",
    "normalizedName": "انگور فرنگی(currant) قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور فرنگی(currant) قرمز"
    ]
  },
  {
    "id": "ing-360d9fb8",
    "name": "انگور فرنگی سیاه",
    "normalizedName": "انگور فرنگی سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انگور فرنگی سیاه"
    ]
  },
  {
    "id": "ing-60ba890d",
    "name": "دانه وانیل",
    "normalizedName": "دانه وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه وانیل"
    ]
  },
  {
    "id": "ing-476ca413",
    "name": "خمیر پاستری یا تارت",
    "normalizedName": "خمیر پاستری یا تارت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پاستری یا تارت"
    ]
  },
  {
    "id": "ing-ac29578",
    "name": "آب پرتقال طبیعی و تازه",
    "normalizedName": "اب پرتقال طبیعی و تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب پرتقال طبیعی و تازه"
    ]
  },
  {
    "id": "ing-3baa9371",
    "name": "نارگیل رنده شده",
    "normalizedName": "نارگیل رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نارگیل رنده شده"
    ]
  },
  {
    "id": "ing-7dcbf552",
    "name": "موز کوچک رسیده",
    "normalizedName": "موز کوچک رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز کوچک رسیده"
    ]
  },
  {
    "id": "ing-a66ae968",
    "name": "بیسکوییت شکلاتی پتی بور",
    "normalizedName": "بیسکوییت شکلاتی پتی بور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت شکلاتی پتی بور"
    ]
  },
  {
    "id": "ing-c9767d7e",
    "name": "آب آناناس یا آب کمپوت آناناس",
    "normalizedName": "اب اناناس یا اب کمپوت اناناس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب آناناس یا آب کمپوت آناناس"
    ]
  },
  {
    "id": "ing-b1bfa3ac",
    "name": "ریواس (ترجیحا نازک و صورتی)",
    "normalizedName": "ریواس (ترجیحا نازک و صورتی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریواس (ترجیحا نازک و صورتی)"
    ]
  },
  {
    "id": "ing-394ee9f6",
    "name": "توت فرنگی تازه (در دمای اتاق)",
    "normalizedName": "توت فرنگی تازه (در دمای اتاق)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی تازه (در دمای اتاق)"
    ]
  },
  {
    "id": "ing-a2e7469b",
    "name": "کره ی بدون نمک نرم شده",
    "normalizedName": "کره ی بدون نمک نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک نرم شده"
    ]
  },
  {
    "id": "ing-805bcfb7",
    "name": "آرد برنج یا برنج ساییده شده",
    "normalizedName": "ارد برنج یا برنج ساییده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد برنج یا برنج ساییده شده"
    ]
  },
  {
    "id": "ing-6a4dc7a1",
    "name": "تخم مرغ 2عدد",
    "normalizedName": "تخم مرغ 2عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ 2عدد"
    ]
  },
  {
    "id": "ing-7cb8a047",
    "name": "شیر کم چرب ولرم",
    "normalizedName": "شیر کم چرب ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر کم چرب ولرم"
    ]
  },
  {
    "id": "ing-fc513bfb",
    "name": "زعفران دم کرده 3قاشق سوپخوری",
    "normalizedName": "زعفران دم کرده 3قاشق سوپخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده 3قاشق سوپخوری"
    ]
  },
  {
    "id": "ing-56566f74",
    "name": "پودرخمیرترش",
    "normalizedName": "پودرخمیرترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودرخمیرترش"
    ]
  },
  {
    "id": "ing-b8bce572",
    "name": "آب ولرم 1پیمانه",
    "normalizedName": "اب ولرم 1پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ولرم 1پیمانه"
    ]
  },
  {
    "id": "ing-cfedfbb9",
    "name": "کره ی بدون نمک بسیار سرد",
    "normalizedName": "کره ی بدون نمک بسیار سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک بسیار سرد"
    ]
  },
  {
    "id": "ing-b6671316",
    "name": "آرد ساده الک شده",
    "normalizedName": "ارد ساده الک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد ساده الک شده"
    ]
  },
  {
    "id": "ing-abe98cb6",
    "name": "تمشک تازه یا فریز شده",
    "normalizedName": "تمشک تازه یا فریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک تازه یا فریز شده"
    ]
  },
  {
    "id": "ing-a2683929",
    "name": "خامه ی بسیار غلیظ",
    "normalizedName": "خامه ی بسیار غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی بسیار غلیظ"
    ]
  },
  {
    "id": "ing-be4e901a",
    "name": "بیسکوئیت شکلاتی ضخیم",
    "normalizedName": "بیسکوئیت شکلاتی ضخیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت شکلاتی ضخیم"
    ]
  },
  {
    "id": "ing-b01d8435",
    "name": "ترافل رنگی (اسپرینکل)",
    "normalizedName": "ترافل رنگی (اسپرینکل)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترافل رنگی (اسپرینکل)"
    ]
  },
  {
    "id": "ing-f554e33b",
    "name": "پوره میوه یخ زده مانند هلو یا تمشک یا هر میوه رنگی دلخواه دیگر",
    "normalizedName": "پوره میوه یخ زده مانند هلو یا تمشک یا هر میوه رنگی دلخواه دیگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره میوه یخ زده مانند هلو یا تمشک یا هر میوه رنگی دلخواه دیگر"
    ]
  },
  {
    "id": "ing-85351887",
    "name": "قهوه ضعیف غلیظ",
    "normalizedName": "قهوه ضعیف غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه ضعیف غلیظ"
    ]
  },
  {
    "id": "ing-fa7d0084",
    "name": "اسانس نعناع",
    "normalizedName": "اسانس نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس نعناع"
    ]
  },
  {
    "id": "ing-7486ca00",
    "name": "رنگ سبز خوراکی به میزان لازم",
    "normalizedName": "رنگ سبز خوراکی به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ سبز خوراکی به میزان لازم"
    ]
  },
  {
    "id": "ing-72415f2d",
    "name": "انجیر تازه",
    "normalizedName": "انجیر تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انجیر تازه"
    ]
  },
  {
    "id": "ing-10ac76c6",
    "name": "نان تُست تازه",
    "normalizedName": "نان تُست تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تُست تازه"
    ]
  },
  {
    "id": "ing-36290dc6",
    "name": "خیار یک نصف",
    "normalizedName": "خیار یک نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار یک نصف"
    ]
  },
  {
    "id": "ing-7b2bad80",
    "name": "حدود",
    "normalizedName": "حدود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حدود"
    ]
  },
  {
    "id": "ing-64791ee",
    "name": "فلفل دلمه ای قرمز بریان یا کباب شده",
    "normalizedName": "فلفل دلمه ای قرمز بریان یا کباب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز بریان یا کباب شده"
    ]
  },
  {
    "id": "ing-a58b5964",
    "name": "ترب سفید رنده شده",
    "normalizedName": "ترب سفید رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترب سفید رنده شده"
    ]
  },
  {
    "id": "ing-3177251b",
    "name": "شکلات نیمه شیرین (تلخ)",
    "normalizedName": "شکلات نیمه شیرین (تلخ)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نیمه شیرین (تلخ)"
    ]
  },
  {
    "id": "ing-16637f0",
    "name": "گیلاس رسیده",
    "normalizedName": "گیلاس رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیلاس رسیده"
    ]
  },
  {
    "id": "ing-c6733ce3",
    "name": "کره نرم شده ½ فنجان",
    "normalizedName": "کره نرم شده ½ فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نرم شده ½ فنجان"
    ]
  },
  {
    "id": "ing-5b31adfc",
    "name": "شکر قهوه ای ¾ فنجان",
    "normalizedName": "شکر قهوه ای ¾ فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای ¾ فنجان"
    ]
  },
  {
    "id": "ing-d70543d5",
    "name": "شیر تغلیظ شده شیرین یا شیر عسل غلیظ",
    "normalizedName": "شیر تغلیظ شده شیرین یا شیر عسل غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر تغلیظ شده شیرین یا شیر عسل غلیظ"
    ]
  },
  {
    "id": "ing-941f8f3d",
    "name": "بیکینگ پودر ½ قاشق چایخوری",
    "normalizedName": "بیکینگ پودر ½ قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیکینگ پودر ½ قاشق چایخوری"
    ]
  },
  {
    "id": "ing-4ada095f",
    "name": "پودر گردو آسیاب شده",
    "normalizedName": "پودر گردو اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گردو آسیاب شده"
    ]
  },
  {
    "id": "ing-c805b8a9",
    "name": "بادام هندی خرد شده",
    "normalizedName": "بادام هندی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام هندی خرد شده"
    ]
  },
  {
    "id": "ing-3eff0340",
    "name": "روغن نارگیل ½ فنجان",
    "normalizedName": "روغن نارگیل ½ فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن نارگیل ½ فنجان"
    ]
  },
  {
    "id": "ing-a3240bbd",
    "name": "آب ½ فنجان",
    "normalizedName": "اب ½ فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ½ فنجان"
    ]
  },
  {
    "id": "ing-bfd39ae9",
    "name": "رنگ خوراکی به میزان لازم",
    "normalizedName": "رنگ خوراکی به میزان لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی به میزان لازم"
    ]
  },
  {
    "id": "ing-90d7f890",
    "name": "شکلات تلخ 60% تخته ای",
    "normalizedName": "شکلات تلخ 60% تخته ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ 60% تخته ای"
    ]
  },
  {
    "id": "ing-b22f8c95",
    "name": "کره گیاهی",
    "normalizedName": "کره گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره گیاهی"
    ]
  },
  {
    "id": "ing-14afd369",
    "name": "روغن تصفیه شده",
    "normalizedName": "روغن تصفیه شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن تصفیه شده"
    ]
  },
  {
    "id": "ing-746a4aa1",
    "name": "کدوسبز متوسط",
    "normalizedName": "کدوسبز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدوسبز متوسط"
    ]
  },
  {
    "id": "ing-933700b0",
    "name": "گردو خردشده",
    "normalizedName": "گردو خردشده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو خردشده"
    ]
  },
  {
    "id": "ing-1dbdcfe6",
    "name": "وانیل نوک قاشق چایخوری",
    "normalizedName": "وانیل نوک قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل نوک قاشق چایخوری"
    ]
  },
  {
    "id": "ing-4d278f77",
    "name": "روغن مايع",
    "normalizedName": "روغن مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مايع"
    ]
  },
  {
    "id": "ing-7232b405",
    "name": "بيكينگ پودر",
    "normalizedName": "بیکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بيكينگ پودر"
    ]
  },
  {
    "id": "ing-7ae8a8c9",
    "name": "كنجد",
    "normalizedName": "کنجد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "كنجد"
    ]
  },
  {
    "id": "ing-693d75cb",
    "name": "انبه درشت",
    "normalizedName": "انبه درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه درشت"
    ]
  },
  {
    "id": "ing-84d6faf4",
    "name": "ماست معمولی کم چرب",
    "normalizedName": "ماست معمولی کم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست معمولی کم چرب"
    ]
  },
  {
    "id": "ing-6dfe689c",
    "name": "پنیر خامه ای ساده",
    "normalizedName": "پنیر خامه ای ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای ساده"
    ]
  },
  {
    "id": "ing-5d807bf5",
    "name": "مرنگ آماده",
    "normalizedName": "مرنگ اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرنگ آماده"
    ]
  },
  {
    "id": "ing-d17c3730",
    "name": "ماست یونانی یا غلیظ",
    "normalizedName": "ماست یونانی یا غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یونانی یا غلیظ"
    ]
  },
  {
    "id": "ing-f8edffa3",
    "name": "نوشابه مشکی",
    "normalizedName": "نوشابه مشکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوشابه مشکی"
    ]
  },
  {
    "id": "ing-dfdc29e1",
    "name": "نوشابه نارنجی",
    "normalizedName": "نوشابه نارنجی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوشابه نارنجی"
    ]
  },
  {
    "id": "ing-db81375f",
    "name": "فندق خرد شده به مقدار دلخواه",
    "normalizedName": "فندق خرد شده به مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق خرد شده به مقدار دلخواه"
    ]
  },
  {
    "id": "ing-f1c4816f",
    "name": "پودر ژله آماده رنگی",
    "normalizedName": "پودر ژله اماده رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله آماده رنگی"
    ]
  },
  {
    "id": "ing-5b581d8",
    "name": "نمک نوک انگشت",
    "normalizedName": "نمک نوک انگشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نوک انگشت"
    ]
  },
  {
    "id": "ing-de746bec",
    "name": "کرم رویال به دلخواه",
    "normalizedName": "کرم رویال به دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرم رویال به دلخواه"
    ]
  },
  {
    "id": "ing-50d2fe98",
    "name": "مارمالاد زرد آلو یا کرم پاتیسیر",
    "normalizedName": "مارمالاد زرد الو یا کرم پاتیسیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارمالاد زرد آلو یا کرم پاتیسیر"
    ]
  },
  {
    "id": "ing-a3af3595",
    "name": "شکلات بدون مغز",
    "normalizedName": "شکلات بدون مغز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات بدون مغز"
    ]
  },
  {
    "id": "ing-97539663",
    "name": "آبلیمو چندقطره",
    "normalizedName": "ابلیمو چندقطره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو چندقطره"
    ]
  },
  {
    "id": "ing-52b3898d",
    "name": "کره در دمای اتاق",
    "normalizedName": "کره در دمای اتاق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره در دمای اتاق"
    ]
  },
  {
    "id": "ing-cc64b20f",
    "name": "عصاره نارگیل",
    "normalizedName": "عصاره نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره نارگیل"
    ]
  },
  {
    "id": "ing-a896edd8",
    "name": "خامه پفکی و پودر نارگیل به دلخواه جهت تزئین کیک",
    "normalizedName": "خامه پفکی و پودر نارگیل به دلخواه جهت تزئین کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه پفکی و پودر نارگیل به دلخواه جهت تزئین کیک"
    ]
  },
  {
    "id": "ing-4486f414",
    "name": "سیب زرد بدون پوست خرد شده",
    "normalizedName": "سیب زرد بدون پوست خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زرد بدون پوست خرد شده"
    ]
  },
  {
    "id": "ing-9202d512",
    "name": "بستنی وانیلی یا بستنی کاراملی به دلخواه جهت سرو دسر",
    "normalizedName": "بستنی وانیلی یا بستنی کاراملی به دلخواه جهت سرو دسر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی وانیلی یا بستنی کاراملی به دلخواه جهت سرو دسر"
    ]
  },
  {
    "id": "ing-b8c68f3",
    "name": "پودر ژله لیمو",
    "normalizedName": "پودر ژله لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله لیمو"
    ]
  },
  {
    "id": "ing-618b42e3",
    "name": "پودر ژله آلوورا",
    "normalizedName": "پودر ژله الوورا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله آلوورا"
    ]
  },
  {
    "id": "ing-a5f1091e",
    "name": "خامه یا بستنی",
    "normalizedName": "خامه یا بستنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا بستنی"
    ]
  },
  {
    "id": "ing-bdd7d266",
    "name": "سیب اسلایس شده",
    "normalizedName": "سیب اسلایس شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب اسلایس شده"
    ]
  },
  {
    "id": "ing-b4731c88",
    "name": "گردو تازه خرد شده",
    "normalizedName": "گردو تازه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو تازه خرد شده"
    ]
  },
  {
    "id": "ing-4f90d9c3",
    "name": "خاک قند و یا گردو به دلخواه جهت تزئین",
    "normalizedName": "خاک قند و یا گردو به دلخواه جهت تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاک قند و یا گردو به دلخواه جهت تزئین"
    ]
  },
  {
    "id": "ing-2670908a",
    "name": "آجیل خرد شده",
    "normalizedName": "اجیل خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آجیل خرد شده"
    ]
  },
  {
    "id": "ing-9c366abf",
    "name": "ملاس چغندر قند",
    "normalizedName": "ملاس چغندر قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ملاس چغندر قند"
    ]
  },
  {
    "id": "ing-58512647",
    "name": "خرما خشک درشت خرد شده",
    "normalizedName": "خرما خشک درشت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما خشک درشت خرد شده"
    ]
  },
  {
    "id": "ing-8a3c5179",
    "name": "تکه های نان تست",
    "normalizedName": "تکه های نان تست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های نان تست"
    ]
  },
  {
    "id": "ing-1062910",
    "name": "پرتقال (با پوست و تازه)",
    "normalizedName": "پرتقال (با پوست و تازه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرتقال (با پوست و تازه)"
    ]
  },
  {
    "id": "ing-162dd4c2",
    "name": "لبو رنده شده",
    "normalizedName": "لبو رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو رنده شده"
    ]
  },
  {
    "id": "ing-518a0f3c",
    "name": "پوست لیمو ریز شده",
    "normalizedName": "پوست لیمو ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیمو ریز شده"
    ]
  },
  {
    "id": "ing-58b269f7",
    "name": "کشمش بی دانه خشک",
    "normalizedName": "کشمش بی دانه خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش بی دانه خشک"
    ]
  },
  {
    "id": "ing-efb4b1b0",
    "name": "موز کاملا رسیده بزرگ",
    "normalizedName": "موز کاملا رسیده بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز کاملا رسیده بزرگ"
    ]
  },
  {
    "id": "ing-f61f3b90",
    "name": "گردو بو داده خرد شده",
    "normalizedName": "گردو بو داده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو بو داده خرد شده"
    ]
  },
  {
    "id": "ing-c337ee06",
    "name": "پودر کاکائو بدون شکر",
    "normalizedName": "پودر کاکائو بدون شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو بدون شکر"
    ]
  },
  {
    "id": "ing-6759cb78",
    "name": "بیسکوئیت کراکر خرد شده",
    "normalizedName": "بیسکوئیت کراکر خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت کراکر خرد شده"
    ]
  },
  {
    "id": "ing-e6273144",
    "name": "2 قاشق",
    "normalizedName": "2 قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "2 قاشق"
    ]
  },
  {
    "id": "ing-41682e53",
    "name": "قهوه غلیظ دم شده",
    "normalizedName": "قهوه غلیظ دم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه غلیظ دم شده"
    ]
  },
  {
    "id": "ing-c5a6c9ae",
    "name": "خامه فرمی پفکی (به دلخواه)",
    "normalizedName": "خامه فرمی پفکی (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرمی پفکی (به دلخواه)"
    ]
  },
  {
    "id": "ing-49466822",
    "name": "زرده تخم مرع",
    "normalizedName": "زرده تخم مرع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرده تخم مرع"
    ]
  },
  {
    "id": "ing-8d9b76f1",
    "name": "شکلات 50%",
    "normalizedName": "شکلات 50%",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات 50%"
    ]
  },
  {
    "id": "ing-2d61625b",
    "name": "موز حلقه شده و پودر نارگیل برای تزئین",
    "normalizedName": "موز حلقه شده و پودر نارگیل برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "موز حلقه شده و پودر نارگیل برای تزئین"
    ]
  },
  {
    "id": "ing-7e509caf",
    "name": "بیسکوئیت ساده",
    "normalizedName": "بیسکوئیت ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوئیت ساده"
    ]
  },
  {
    "id": "ing-4b2379b1",
    "name": "شکلات شیری یا کاکائویی",
    "normalizedName": "شکلات شیری یا کاکائویی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیری یا کاکائویی"
    ]
  },
  {
    "id": "ing-a62f1f0f",
    "name": "خلال یا پودر پسته",
    "normalizedName": "خلال یا پودر پسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال یا پودر پسته"
    ]
  },
  {
    "id": "ing-502d7ca7",
    "name": "شیر با 2% چربی",
    "normalizedName": "شیر با 2% چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر با 2% چربی"
    ]
  },
  {
    "id": "ing-1fcb14e7",
    "name": "شیر با چربی 2%",
    "normalizedName": "شیر با چربی 2%",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر با چربی 2%"
    ]
  },
  {
    "id": "ing-b5a7ec28",
    "name": "پودر لیمو",
    "normalizedName": "پودر لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر لیمو"
    ]
  },
  {
    "id": "ing-82be620d",
    "name": "ویفر وانیلی گرد",
    "normalizedName": "ویفر وانیلی گرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ویفر وانیلی گرد"
    ]
  },
  {
    "id": "ing-9cd65c56",
    "name": "خامه به میزان دلخواه",
    "normalizedName": "خامه به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه به میزان دلخواه"
    ]
  },
  {
    "id": "ing-fca69434",
    "name": "چیپس شکلاتی کاکائویی",
    "normalizedName": "چیپس شکلاتی کاکائویی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی کاکائویی"
    ]
  },
  {
    "id": "ing-3c4c30ff",
    "name": "چیپس شکلاتی شیری",
    "normalizedName": "چیپس شکلاتی شیری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی شیری"
    ]
  },
  {
    "id": "ing-70673d4b",
    "name": "بادام بو داده خرد شده",
    "normalizedName": "بادام بو داده خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام بو داده خرد شده"
    ]
  },
  {
    "id": "ing-707c5055",
    "name": "سیب قرمز متوسط",
    "normalizedName": "سیب قرمز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب قرمز متوسط"
    ]
  },
  {
    "id": "ing-5aab24cd",
    "name": "مربا و آجیل به میزان دلخواه",
    "normalizedName": "مربا و اجیل به میزان دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا و آجیل به میزان دلخواه"
    ]
  },
  {
    "id": "ing-a96bf939",
    "name": "پودر نارگیل (به دلخواه)",
    "normalizedName": "پودر نارگیل (به دلخواه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل (به دلخواه)"
    ]
  },
  {
    "id": "ing-1108868",
    "name": "هندوانه مکعبی خرد شده بدون هسته",
    "normalizedName": "هندوانه مکعبی خرد شده بدون هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه مکعبی خرد شده بدون هسته"
    ]
  },
  {
    "id": "ing-162c2e88",
    "name": "عرق نعناع",
    "normalizedName": "عرق نعناع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عرق نعناع"
    ]
  },
  {
    "id": "ing-de51792e",
    "name": "نان میکادو یا بیسکوئیت گرد",
    "normalizedName": "نان میکادو یا بیسکوئیت گرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان میکادو یا بیسکوئیت گرد"
    ]
  },
  {
    "id": "ing-bcede75d",
    "name": "شکلات ذوب شده",
    "normalizedName": "شکلات ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات ذوب شده"
    ]
  },
  {
    "id": "ing-d0b74771",
    "name": "پودینگ کدو حلوایی",
    "normalizedName": "پودینگ کدو حلوایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودینگ کدو حلوایی"
    ]
  },
  {
    "id": "ing-787407",
    "name": "خامه زده شده شیرینی پزی",
    "normalizedName": "خامه زده شده شیرینی پزی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه زده شده شیرینی پزی"
    ]
  },
  {
    "id": "ing-bfba4108",
    "name": "هندوانه مکعبی شده",
    "normalizedName": "هندوانه مکعبی شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه مکعبی شده"
    ]
  },
  {
    "id": "ing-238b6a97",
    "name": "خامه 1و",
    "normalizedName": "خامه 1و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه 1و"
    ]
  },
  {
    "id": "ing-cb201490",
    "name": "کدو حلوایی پخته",
    "normalizedName": "کدو حلوایی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی پخته"
    ]
  },
  {
    "id": "ing-6a5904a5",
    "name": "ورق ژلاتین",
    "normalizedName": "ورق ژلاتین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورق ژلاتین"
    ]
  },
  {
    "id": "ing-f8427f46",
    "name": "مربا آلبالو یا گیلاس",
    "normalizedName": "مربا البالو یا گیلاس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا آلبالو یا گیلاس"
    ]
  },
  {
    "id": "ing-8df0919f",
    "name": "برنج قد کوتاه یا خرده برنج",
    "normalizedName": "برنج قد کوتاه یا خرده برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج قد کوتاه یا خرده برنج"
    ]
  },
  {
    "id": "ing-24e2659d",
    "name": "پسته تازه",
    "normalizedName": "پسته تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته تازه"
    ]
  },
  {
    "id": "ing-d43b6b2c",
    "name": "پودر کیک آماده",
    "normalizedName": "پودر کیک اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کیک آماده"
    ]
  },
  {
    "id": "ing-38355f06",
    "name": "پودر پودینگ نارگیل",
    "normalizedName": "پودر پودینگ نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پودینگ نارگیل"
    ]
  },
  {
    "id": "ing-80502030",
    "name": "نوشابه سون آپ گازدار",
    "normalizedName": "نوشابه سون اپ گازدار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نوشابه سون آپ گازدار"
    ]
  },
  {
    "id": "ing-5d1662ae",
    "name": "آناناس له شده",
    "normalizedName": "اناناس له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس له شده"
    ]
  },
  {
    "id": "ing-eb7df4bd",
    "name": "شکلات تلخ خرد شده",
    "normalizedName": "شکلات تلخ خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تلخ خرد شده"
    ]
  },
  {
    "id": "ing-1bec6b4a",
    "name": "پودر قهوه آماده",
    "normalizedName": "پودر قهوه اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قهوه آماده"
    ]
  },
  {
    "id": "ing-36ed427",
    "name": "دارچین نصف قاشق چایخوری",
    "normalizedName": "دارچین نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دارچین نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-b929f6c9",
    "name": "گردو پودر شده نصف قاشق",
    "normalizedName": "گردو پودر شده نصف قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو پودر شده نصف قاشق"
    ]
  },
  {
    "id": "ing-fca48ff0",
    "name": "شکر 1و",
    "normalizedName": "شکر 1و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر 1و"
    ]
  },
  {
    "id": "ing-7cb91491",
    "name": "سس شکلات",
    "normalizedName": "سس شکلات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس شکلات"
    ]
  },
  {
    "id": "ing-8f1ef49",
    "name": "شکلات اسنیکرز خرد شده",
    "normalizedName": "شکلات اسنیکرز خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات اسنیکرز خرد شده"
    ]
  },
  {
    "id": "ing-8ca1e6fd",
    "name": "پودر نسکافه آماده",
    "normalizedName": "پودر نسکافه اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نسکافه آماده"
    ]
  },
  {
    "id": "ing-1b60886b",
    "name": "خامه زده شده با شکر",
    "normalizedName": "خامه زده شده با شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه زده شده با شکر"
    ]
  },
  {
    "id": "ing-9050be3e",
    "name": "آناناس تکه ای",
    "normalizedName": "اناناس تکه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس تکه ای"
    ]
  },
  {
    "id": "ing-c7e72959",
    "name": "تکه های شکلات",
    "normalizedName": "تکه های شکلات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های شکلات"
    ]
  },
  {
    "id": "ing-e334b442",
    "name": "شیر پرچرب جوشیده غلیظ",
    "normalizedName": "شیر پرچرب جوشیده غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر پرچرب جوشیده غلیظ"
    ]
  },
  {
    "id": "ing-4f729336",
    "name": "تکه های شکلات ریز",
    "normalizedName": "تکه های شکلات ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های شکلات ریز"
    ]
  },
  {
    "id": "ing-91f54576",
    "name": "سیب بزرگ",
    "normalizedName": "سیب بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب بزرگ"
    ]
  },
  {
    "id": "ing-f4a551b3",
    "name": "استویا یا شکر رژیمی",
    "normalizedName": "استویا یا شکر رژیمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استویا یا شکر رژیمی"
    ]
  },
  {
    "id": "ing-b3a06ccc",
    "name": "شیر کم چرب نصف لیوان",
    "normalizedName": "شیر کم چرب نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر کم چرب نصف لیوان"
    ]
  },
  {
    "id": "ing-148678b3",
    "name": "کدو حلوایی پخته شده له شده",
    "normalizedName": "کدو حلوایی پخته شده له شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو حلوایی پخته شده له شده"
    ]
  },
  {
    "id": "ing-bd450e45",
    "name": "پسته ی خام",
    "normalizedName": "پسته ی خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته ی خام"
    ]
  },
  {
    "id": "ing-8d4c76ce",
    "name": "پسته آسیاب شده",
    "normalizedName": "پسته اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته آسیاب شده"
    ]
  },
  {
    "id": "ing-87004509",
    "name": "کره نصف لیوان",
    "normalizedName": "کره نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نصف لیوان"
    ]
  },
  {
    "id": "ing-d0f6c34c",
    "name": "چیپس خرما یا شکلات خرد شده",
    "normalizedName": "چیپس خرما یا شکلات خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس خرما یا شکلات خرد شده"
    ]
  },
  {
    "id": "ing-59366d",
    "name": "نخ",
    "normalizedName": "نخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخ"
    ]
  },
  {
    "id": "ing-9b0ce375",
    "name": "مقوا های رنگی",
    "normalizedName": "مقوا های رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مقوا های رنگی"
    ]
  },
  {
    "id": "ing-75b5cccf",
    "name": "چسب مایع",
    "normalizedName": "چسب مایع",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چسب مایع"
    ]
  },
  {
    "id": "ing-abc24e5a",
    "name": "ژله ی پرتقالی",
    "normalizedName": "ژله ی پرتقالی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله ی پرتقالی"
    ]
  },
  {
    "id": "ing-e56d90b3",
    "name": "کره 200گرم",
    "normalizedName": "کره 200گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره 200گرم"
    ]
  },
  {
    "id": "ing-b82898bb",
    "name": "شکر قهوه ای نصف لیوان",
    "normalizedName": "شکر قهوه ای نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای نصف لیوان"
    ]
  },
  {
    "id": "ing-35b40c98",
    "name": "نمک نصف قاشق چایخوری",
    "normalizedName": "نمک نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-9cf61901",
    "name": "جوش شیرین نصف قاشق چایخوری",
    "normalizedName": "جوش شیرین نصف قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین نصف قاشق چایخوری"
    ]
  },
  {
    "id": "ing-4066bfa",
    "name": "شکر نصف لیوان",
    "normalizedName": "شکر نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر نصف لیوان"
    ]
  },
  {
    "id": "ing-ad25b436",
    "name": "کره ی بادام زمینی نصف لیوان",
    "normalizedName": "کره ی بادام زمینی نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بادام زمینی نصف لیوان"
    ]
  },
  {
    "id": "ing-78a610df",
    "name": "شکلات های دایره ای به تعداد",
    "normalizedName": "شکلات های دایره ای به تعداد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات های دایره ای به تعداد"
    ]
  },
  {
    "id": "ing-93ba796",
    "name": "جوش شيرين",
    "normalizedName": "جوش شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شيرين"
    ]
  },
  {
    "id": "ing-f307f38c",
    "name": "عسل یا شکر",
    "normalizedName": "عسل یا شکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل یا شکر"
    ]
  },
  {
    "id": "ing-7ca4b975",
    "name": "میوه و گرانولا مقدار لازم",
    "normalizedName": "میوه و گرانولا مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه و گرانولا مقدار لازم"
    ]
  },
  {
    "id": "ing-6ce8966c",
    "name": "میوه و ترافل رنگی مقدار لازم",
    "normalizedName": "میوه و ترافل رنگی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه و ترافل رنگی مقدار لازم"
    ]
  },
  {
    "id": "ing-52401959",
    "name": "بادام خرد شده مقداری",
    "normalizedName": "بادام خرد شده مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام خرد شده مقداری"
    ]
  },
  {
    "id": "ing-3d146125",
    "name": "فالوده و پسته مقدار لازم",
    "normalizedName": "فالوده و پسته مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فالوده و پسته مقدار لازم"
    ]
  },
  {
    "id": "ing-fdde344d",
    "name": "یخ مقدار لازم",
    "normalizedName": "یخ مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یخ مقدار لازم"
    ]
  },
  {
    "id": "ing-d2cb2269",
    "name": "پودر شکر یا پودر قند",
    "normalizedName": "پودر شکر یا پودر قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر شکر یا پودر قند"
    ]
  },
  {
    "id": "ing-d61fbd7",
    "name": "رطب یا خرما مقدار لازم",
    "normalizedName": "رطب یا خرما مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رطب یا خرما مقدار لازم"
    ]
  },
  {
    "id": "ing-236aa09b",
    "name": "مغز گردو مقدار لازم",
    "normalizedName": "مغز گردو مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو مقدار لازم"
    ]
  },
  {
    "id": "ing-b3a42889",
    "name": "پودر قند یا پودر پسته برای تزیین",
    "normalizedName": "پودر قند یا پودر پسته برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند یا پودر پسته برای تزیین"
    ]
  },
  {
    "id": "ing-3d61480c",
    "name": "پودر قند مقدار لازم",
    "normalizedName": "پودر قند مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند مقدار لازم"
    ]
  },
  {
    "id": "ing-464f9960",
    "name": "تخم مرغ مقدار لازم",
    "normalizedName": "تخم مرغ مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ مقدار لازم"
    ]
  },
  {
    "id": "ing-17227a94",
    "name": "مربا مقدار لازم",
    "normalizedName": "مربا مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا مقدار لازم"
    ]
  },
  {
    "id": "ing-5d060bf8",
    "name": "نسکافه",
    "normalizedName": "نسکافه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نسکافه"
    ]
  },
  {
    "id": "ing-9a17a7db",
    "name": "بیسکوییت یا کیک به مقدار لازم",
    "normalizedName": "بیسکوییت یا کیک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت یا کیک به مقدار لازم"
    ]
  },
  {
    "id": "ing-bcfede04",
    "name": "خرمای بدون هسته",
    "normalizedName": "خرمای بدون هسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرمای بدون هسته"
    ]
  },
  {
    "id": "ing-eec6b032",
    "name": "شکلات رنده شده",
    "normalizedName": "شکلات رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات رنده شده"
    ]
  },
  {
    "id": "ing-79371a4e",
    "name": "روغن مایع یا روغن نارگیل",
    "normalizedName": "روغن مایع یا روغن نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مایع یا روغن نارگیل"
    ]
  },
  {
    "id": "ing-ab3bf6e3",
    "name": "ژله توت فرنگی",
    "normalizedName": "ژله توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله توت فرنگی"
    ]
  },
  {
    "id": "ing-19a2e6a3",
    "name": "بستنی توت فرنگی",
    "normalizedName": "بستنی توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی توت فرنگی"
    ]
  },
  {
    "id": "ing-2e410dea",
    "name": "توت فرنگی مقداری",
    "normalizedName": "توت فرنگی مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی مقداری"
    ]
  },
  {
    "id": "ing-e1b79af7",
    "name": "پسته مقداری",
    "normalizedName": "پسته مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته مقداری"
    ]
  },
  {
    "id": "ing-d155c72e",
    "name": "گردوی خرد شده مقداری",
    "normalizedName": "گردوی خرد شده مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردوی خرد شده مقداری"
    ]
  },
  {
    "id": "ing-760dcb51",
    "name": "انار متوسط",
    "normalizedName": "انار متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انار متوسط"
    ]
  },
  {
    "id": "ing-f1a60999",
    "name": "پودر گلپر و نمک مقداری",
    "normalizedName": "پودر گلپر و نمک مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گلپر و نمک مقداری"
    ]
  },
  {
    "id": "ing-29a3c015",
    "name": "کیک ساده",
    "normalizedName": "کیک ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیک ساده"
    ]
  },
  {
    "id": "ing-b72d8168",
    "name": "آب هندوانه یا آب میوه",
    "normalizedName": "اب هندوانه یا اب میوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب هندوانه یا آب میوه"
    ]
  },
  {
    "id": "ing-9ddee2c8",
    "name": "شکلات چیپسی مقداری",
    "normalizedName": "شکلات چیپسی مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات چیپسی مقداری"
    ]
  },
  {
    "id": "ing-83c629c1",
    "name": "خامه فرم گرفته یا باتر کرم مقدار لازم",
    "normalizedName": "خامه فرم گرفته یا باتر کرم مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرم گرفته یا باتر کرم مقدار لازم"
    ]
  },
  {
    "id": "ing-ce9082b",
    "name": "خمیر مارزیپان مقدار لازم",
    "normalizedName": "خمیر مارزیپان مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مارزیپان مقدار لازم"
    ]
  },
  {
    "id": "ing-c8a1dcb6",
    "name": "نشاسته سیب زمینی یا نشاسته ذرت خوراکی",
    "normalizedName": "نشاسته سیب زمینی یا نشاسته ذرت خوراکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته سیب زمینی یا نشاسته ذرت خوراکی"
    ]
  },
  {
    "id": "ing-ca0c8a55",
    "name": "پودر ژله آبی",
    "normalizedName": "پودر ژله ابی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله آبی"
    ]
  },
  {
    "id": "ing-6f5fa199",
    "name": "رنگ خوراکی آبی مقداری",
    "normalizedName": "رنگ خوراکی ابی مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی آبی مقداری"
    ]
  },
  {
    "id": "ing-231b2bd5",
    "name": "بیسکوییت خرد شده",
    "normalizedName": "بیسکوییت خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت خرد شده"
    ]
  },
  {
    "id": "ing-adb49938",
    "name": "چتر تزیینی مقداری",
    "normalizedName": "چتر تزیینی مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چتر تزیینی مقداری"
    ]
  },
  {
    "id": "ing-799ac4a5",
    "name": "پاستیل صدف یا لاک پشت مقداری",
    "normalizedName": "پاستیل صدف یا لاک پشت مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستیل صدف یا لاک پشت مقداری"
    ]
  },
  {
    "id": "ing-6d818e55",
    "name": "ژله هلو",
    "normalizedName": "ژله هلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله هلو"
    ]
  },
  {
    "id": "ing-ca0cdbbf",
    "name": "پودر ژله سبز",
    "normalizedName": "پودر ژله سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله سبز"
    ]
  },
  {
    "id": "ing-7c1796c3",
    "name": "شکر یا شیره انگور یا شیره خرما",
    "normalizedName": "شکر یا شیره انگور یا شیره خرما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر یا شیره انگور یا شیره خرما"
    ]
  },
  {
    "id": "ing-61053539",
    "name": "باتر کرم برای تزیین روی کیک",
    "normalizedName": "باتر کرم برای تزیین روی کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باتر کرم برای تزیین روی کیک"
    ]
  },
  {
    "id": "ing-bd353d8f",
    "name": "اسانس وانیل یا میوه",
    "normalizedName": "اسانس وانیل یا میوه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل یا میوه"
    ]
  },
  {
    "id": "ing-fd1dddd0",
    "name": "نان ویفر یا نان میکادو مقدار لازم",
    "normalizedName": "نان ویفر یا نان میکادو مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان ویفر یا نان میکادو مقدار لازم"
    ]
  },
  {
    "id": "ing-7540017b",
    "name": "خامه فرم گرفته و بیسکوییت مقدار لازم برای تزیین",
    "normalizedName": "خامه فرم گرفته و بیسکوییت مقدار لازم برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرم گرفته و بیسکوییت مقدار لازم برای تزیین"
    ]
  },
  {
    "id": "ing-b9b3252",
    "name": "پنیرماسکارپونه یا خامه ای",
    "normalizedName": "پنیرماسکارپونه یا خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیرماسکارپونه یا خامه ای"
    ]
  },
  {
    "id": "ing-7e4d4215",
    "name": "بیسکوییت برای تزیین",
    "normalizedName": "بیسکوییت برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت برای تزیین"
    ]
  },
  {
    "id": "ing-94c223f6",
    "name": "بیسکوییت و خامه برای تزیین",
    "normalizedName": "بیسکوییت و خامه برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت و خامه برای تزیین"
    ]
  },
  {
    "id": "ing-19724ecf",
    "name": "تمشک تازه",
    "normalizedName": "تمشک تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک تازه"
    ]
  },
  {
    "id": "ing-bc6d501b",
    "name": "بستنی به مقدار لازم",
    "normalizedName": "بستنی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی به مقدار لازم"
    ]
  },
  {
    "id": "ing-aac3fb42",
    "name": "اسانس وانیل کمی",
    "normalizedName": "اسانس وانیل کمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل کمی"
    ]
  },
  {
    "id": "ing-ddf96b98",
    "name": "عسل یا گلوکز",
    "normalizedName": "عسل یا گلوکز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل یا گلوکز"
    ]
  },
  {
    "id": "ing-613b8a2f",
    "name": "فندق بو داده",
    "normalizedName": "فندق بو داده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق بو داده"
    ]
  },
  {
    "id": "ing-29d4591e",
    "name": "خامه و شکلات تلخ برای تزیین",
    "normalizedName": "خامه و شکلات تلخ برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه و شکلات تلخ برای تزیین"
    ]
  },
  {
    "id": "ing-41500e91",
    "name": "سیب رنده شده",
    "normalizedName": "سیب رنده شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب رنده شده"
    ]
  },
  {
    "id": "ing-87ca33bd",
    "name": "بادام و پسته مقداری",
    "normalizedName": "بادام و پسته مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام و پسته مقداری"
    ]
  },
  {
    "id": "ing-a3821607",
    "name": "انبه خرد شده",
    "normalizedName": "انبه خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه خرد شده"
    ]
  },
  {
    "id": "ing-c78fd3d2",
    "name": "کمپوت زردآلو",
    "normalizedName": "کمپوت زردالو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کمپوت زردآلو"
    ]
  },
  {
    "id": "ing-6f91403e",
    "name": "خامه و شکلات برای تزیین",
    "normalizedName": "خامه و شکلات برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه و شکلات برای تزیین"
    ]
  },
  {
    "id": "ing-90d0d76a",
    "name": "خلال پسته و بادام برای تزیین",
    "normalizedName": "خلال پسته و بادام برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته و بادام برای تزیین"
    ]
  },
  {
    "id": "ing-547ec24a",
    "name": "گردو یا مربای آلبالو یا گیلاس مقداری",
    "normalizedName": "گردو یا مربای البالو یا گیلاس مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو یا مربای آلبالو یا گیلاس مقداری"
    ]
  },
  {
    "id": "ing-94f6f212",
    "name": "دوغ غلیظ",
    "normalizedName": "دوغ غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دوغ غلیظ"
    ]
  },
  {
    "id": "ing-d3046de6",
    "name": "کره یا روغن جامد آب شده",
    "normalizedName": "کره یا روغن جامد اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره یا روغن جامد آب شده"
    ]
  },
  {
    "id": "ing-3238bf40",
    "name": "آلو قیسی خشک خرد شده",
    "normalizedName": "الو قیسی خشک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو قیسی خشک خرد شده"
    ]
  },
  {
    "id": "ing-175dc708",
    "name": "دوغ یا ماست",
    "normalizedName": "دوغ یا ماست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دوغ یا ماست"
    ]
  },
  {
    "id": "ing-50200660",
    "name": "پنیر خامه ای یا خامه",
    "normalizedName": "پنیر خامه ای یا خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای یا خامه"
    ]
  },
  {
    "id": "ing-16794b8c",
    "name": "کورن فلکس",
    "normalizedName": "کورن فلکس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کورن فلکس"
    ]
  },
  {
    "id": "ing-2872b2d9",
    "name": "عسل مقداری",
    "normalizedName": "عسل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل مقداری"
    ]
  },
  {
    "id": "ing-301ef3a7",
    "name": "پودر قند یا شکر دانه ریز",
    "normalizedName": "پودر قند یا شکر دانه ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند یا شکر دانه ریز"
    ]
  },
  {
    "id": "ing-60946386",
    "name": "روغن جامد یا کره آب شده",
    "normalizedName": "روغن جامد یا کره اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن جامد یا کره آب شده"
    ]
  },
  {
    "id": "ing-ca4ccbe1",
    "name": "شکلات تخته ای مقداری",
    "normalizedName": "شکلات تخته ای مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای مقداری"
    ]
  },
  {
    "id": "ing-f37817b0",
    "name": "شیر یا آب ولرم",
    "normalizedName": "شیر یا اب ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا آب ولرم"
    ]
  },
  {
    "id": "ing-7ff7e0cd",
    "name": "پودر نسکافه یا پودر قهوه فوری",
    "normalizedName": "پودر نسکافه یا پودر قهوه فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نسکافه یا پودر قهوه فوری"
    ]
  },
  {
    "id": "ing-bbddad30",
    "name": "پودر نسکافه",
    "normalizedName": "پودر نسکافه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نسکافه"
    ]
  },
  {
    "id": "ing-b5921b26",
    "name": "پودر خامه",
    "normalizedName": "پودر خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خامه"
    ]
  },
  {
    "id": "ing-d9eb4a41",
    "name": "پودر مخمر خشک",
    "normalizedName": "پودر مخمر خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر مخمر خشک"
    ]
  },
  {
    "id": "ing-84e3e0a2",
    "name": "مربا یا مارمالاد مقدار لازم",
    "normalizedName": "مربا یا مارمالاد مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا یا مارمالاد مقدار لازم"
    ]
  },
  {
    "id": "ing-3838ac10",
    "name": "شکر قهوه ای یا شکر سیاه",
    "normalizedName": "شکر قهوه ای یا شکر سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای یا شکر سیاه"
    ]
  },
  {
    "id": "ing-abba00c0",
    "name": "بستنی مقداری برای تزیین",
    "normalizedName": "بستنی مقداری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی مقداری برای تزیین"
    ]
  },
  {
    "id": "ing-1565c414",
    "name": "بستنی یا خامه مقدار لازم",
    "normalizedName": "بستنی یا خامه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی یا خامه مقدار لازم"
    ]
  },
  {
    "id": "ing-a5bd77cc",
    "name": "زعفران خشک",
    "normalizedName": "زعفران خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران خشک"
    ]
  },
  {
    "id": "ing-469a4387",
    "name": "شکلات سفید مقداری برای تزیین روی کیک",
    "normalizedName": "شکلات سفید مقداری برای تزیین روی کیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید مقداری برای تزیین روی کیک"
    ]
  },
  {
    "id": "ing-d37a6862",
    "name": "گردو خرد شده مقداری",
    "normalizedName": "گردو خرد شده مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو خرد شده مقداری"
    ]
  },
  {
    "id": "ing-c2397b2e",
    "name": "گیلاس تازه",
    "normalizedName": "گیلاس تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیلاس تازه"
    ]
  },
  {
    "id": "ing-ba77bb4d",
    "name": "شکلات تخته ای مقداری برای تزیین",
    "normalizedName": "شکلات تخته ای مقداری برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای مقداری برای تزیین"
    ]
  },
  {
    "id": "ing-4d7febe4",
    "name": "ماست یا شیر ولرم",
    "normalizedName": "ماست یا شیر ولرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یا شیر ولرم"
    ]
  },
  {
    "id": "ing-4395109c",
    "name": "پودر هل مقداری",
    "normalizedName": "پودر هل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر هل مقداری"
    ]
  },
  {
    "id": "ing-90649ce0",
    "name": "طالبی یا گرمک خرد شده",
    "normalizedName": "طالبی یا گرمک خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "طالبی یا گرمک خرد شده"
    ]
  },
  {
    "id": "ing-93d61648",
    "name": "برگ ترخون",
    "normalizedName": "برگ ترخون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ ترخون"
    ]
  },
  {
    "id": "ing-f249f971",
    "name": "نعنا تازه مقداری",
    "normalizedName": "نعنا تازه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعنا تازه مقداری"
    ]
  },
  {
    "id": "ing-7a6c279b",
    "name": "طالبی کوچک",
    "normalizedName": "طالبی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "طالبی کوچک"
    ]
  },
  {
    "id": "ing-b5a437d2",
    "name": "پودر مخمر",
    "normalizedName": "پودر مخمر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر مخمر"
    ]
  },
  {
    "id": "ing-be5ab492",
    "name": "خرما مقدار لازم",
    "normalizedName": "خرما مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما مقدار لازم"
    ]
  },
  {
    "id": "ing-a7d57387",
    "name": "تخم مرغ برای رومال",
    "normalizedName": "تخم مرغ برای رومال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ برای رومال"
    ]
  },
  {
    "id": "ing-fb62a311",
    "name": "آلبالوی تازه",
    "normalizedName": "البالوی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلبالوی تازه"
    ]
  },
  {
    "id": "ing-6b9cde86",
    "name": "عسل یا شکر مقدار لازم",
    "normalizedName": "عسل یا شکر مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل یا شکر مقدار لازم"
    ]
  },
  {
    "id": "ing-93fa7b4d",
    "name": "نشاسته گندم",
    "normalizedName": "نشاسته گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته گندم"
    ]
  },
  {
    "id": "ing-4cd5b4",
    "name": "توت فرنگی و کیوی به مقدار لازم",
    "normalizedName": "توت فرنگی و کیوی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی و کیوی به مقدار لازم"
    ]
  },
  {
    "id": "ing-d449b73",
    "name": "شیر چرب",
    "normalizedName": "شیر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر چرب"
    ]
  },
  {
    "id": "ing-1d8c074b",
    "name": "مربای گیلاس مقدار لازم",
    "normalizedName": "مربای گیلاس مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربای گیلاس مقدار لازم"
    ]
  },
  {
    "id": "ing-c59d5ff7",
    "name": "هندوانه مقداری",
    "normalizedName": "هندوانه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هندوانه مقداری"
    ]
  },
  {
    "id": "ing-d4af2a98",
    "name": "مغز بادام یا گردوی خرد شده",
    "normalizedName": "مغز بادام یا گردوی خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز بادام یا گردوی خرد شده"
    ]
  },
  {
    "id": "ing-802f207e",
    "name": "پودر پسته مقداری برای تزیین دسر",
    "normalizedName": "پودر پسته مقداری برای تزیین دسر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پسته مقداری برای تزیین دسر"
    ]
  },
  {
    "id": "ing-e50c6cf4",
    "name": "پودینگ وانیلی",
    "normalizedName": "پودینگ وانیلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودینگ وانیلی"
    ]
  },
  {
    "id": "ing-94ac7810",
    "name": "کیک اسفنجی مقدار لازم",
    "normalizedName": "کیک اسفنجی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیک اسفنجی مقدار لازم"
    ]
  },
  {
    "id": "ing-5167fd8a",
    "name": "توت فرنگی تازه مقدار لازم",
    "normalizedName": "توت فرنگی تازه مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی تازه مقدار لازم"
    ]
  },
  {
    "id": "ing-238a48f",
    "name": "میوه های منجمد ریز مقدار لازم",
    "normalizedName": "میوه های منجمد ریز مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میوه های منجمد ریز مقدار لازم"
    ]
  },
  {
    "id": "ing-73ade368",
    "name": "پودر ژله تمشک یا ژله شاه توت",
    "normalizedName": "پودر ژله تمشک یا ژله شاه توت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله تمشک یا ژله شاه توت"
    ]
  },
  {
    "id": "ing-bc9f5578",
    "name": "تمشک یا شاه توت یخ زده",
    "normalizedName": "تمشک یا شاه توت یخ زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمشک یا شاه توت یخ زده"
    ]
  },
  {
    "id": "ing-c2750e2e",
    "name": "چوب شور",
    "normalizedName": "چوب شور",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب شور"
    ]
  },
  {
    "id": "ing-82b0c07d",
    "name": "بیکینگ پودر یا جوش شیرین",
    "normalizedName": "بیکینگ پودر یا جوش شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیکینگ پودر یا جوش شیرین"
    ]
  },
  {
    "id": "ing-3c9024a",
    "name": "شکلات و وانیل مقداری",
    "normalizedName": "شکلات و وانیل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات و وانیل مقداری"
    ]
  },
  {
    "id": "ing-eaae6c0e",
    "name": "پودر قند یا شکر ریز",
    "normalizedName": "پودر قند یا شکر ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند یا شکر ریز"
    ]
  },
  {
    "id": "ing-b1521631",
    "name": "جوش شیرین از هر کدام",
    "normalizedName": "جوش شیرین از هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین از هر کدام"
    ]
  },
  {
    "id": "ing-cb9a714",
    "name": "آب برای رقیق کردن",
    "normalizedName": "اب برای رقیق کردن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب برای رقیق کردن"
    ]
  },
  {
    "id": "ing-565a2e97",
    "name": "دانه های انار",
    "normalizedName": "دانه های انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه های انار"
    ]
  },
  {
    "id": "ing-b8d13612",
    "name": "خامه یا بستنی برای تزیین",
    "normalizedName": "خامه یا بستنی برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا بستنی برای تزیین"
    ]
  },
  {
    "id": "ing-5223e1f7",
    "name": "جوش شیرین یا نمک",
    "normalizedName": "جوش شیرین یا نمک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین یا نمک"
    ]
  },
  {
    "id": "ing-440017a2",
    "name": "عصاره بادام تلخ یا وانیل مقداری",
    "normalizedName": "عصاره بادام تلخ یا وانیل مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عصاره بادام تلخ یا وانیل مقداری"
    ]
  },
  {
    "id": "ing-8aaff90c",
    "name": "ورقه ژلاتين کوچک",
    "normalizedName": "ورقه ژلاتین کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ورقه ژلاتين کوچک"
    ]
  },
  {
    "id": "ing-16eba02",
    "name": "ژله با رنگ ها و طعم های مختلف",
    "normalizedName": "ژله با رنگ ها و طعم های مختلف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ژله با رنگ ها و طعم های مختلف"
    ]
  },
  {
    "id": "ing-a1b79a00",
    "name": "شیر یا بستنی ساده",
    "normalizedName": "شیر یا بستنی ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا بستنی ساده"
    ]
  },
  {
    "id": "ing-3025f9bf",
    "name": "شیر نصف لیوان",
    "normalizedName": "شیر نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نصف لیوان"
    ]
  },
  {
    "id": "ing-35abd64e",
    "name": "گردو مقداری",
    "normalizedName": "گردو مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو مقداری"
    ]
  },
  {
    "id": "ing-b4a9567c",
    "name": "پوست پرتقال مقداری",
    "normalizedName": "پوست پرتقال مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست پرتقال مقداری"
    ]
  },
  {
    "id": "ing-7d3c0c43",
    "name": "گردو خرد شده نصف لیوان",
    "normalizedName": "گردو خرد شده نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو خرد شده نصف لیوان"
    ]
  },
  {
    "id": "ing-af8bdb1",
    "name": "لیدی فینگر مقدار لازم",
    "normalizedName": "لیدی فینگر مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیدی فینگر مقدار لازم"
    ]
  },
  {
    "id": "ing-5c7edd5a",
    "name": "پودر کاکائو و شکلات به مقدار لازم",
    "normalizedName": "پودر کاکائو و شکلات به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو و شکلات به مقدار لازم"
    ]
  },
  {
    "id": "ing-8d806543",
    "name": "شکلات نرم",
    "normalizedName": "شکلات نرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات نرم"
    ]
  },
  {
    "id": "ing-56f636a4",
    "name": "روغن مایع نصف لیوان",
    "normalizedName": "روغن مایع نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مایع نصف لیوان"
    ]
  },
  {
    "id": "ing-7cc24e84",
    "name": "گلابی خرد شده به مقدار لازم",
    "normalizedName": "گلابی خرد شده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی خرد شده به مقدار لازم"
    ]
  },
  {
    "id": "ing-e2aa7948",
    "name": "آب یا شیر",
    "normalizedName": "اب یا شیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب یا شیر"
    ]
  },
  {
    "id": "ing-56359c8",
    "name": "نان میکادو مقدار لازم",
    "normalizedName": "نان میکادو مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان میکادو مقدار لازم"
    ]
  },
  {
    "id": "ing-ff3e7524",
    "name": "شیر یا ماست نصف فنجان",
    "normalizedName": "شیر یا ماست نصف فنجان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا ماست نصف فنجان"
    ]
  },
  {
    "id": "ing-1c2bc4f4",
    "name": "روغن یا كره",
    "normalizedName": "روغن یا کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن یا كره"
    ]
  },
  {
    "id": "ing-d78e0622",
    "name": "زرد آلو",
    "normalizedName": "زرد الو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرد آلو"
    ]
  },
  {
    "id": "ing-9e52a58",
    "name": "توت‌فرنگی",
    "normalizedName": "توت فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت‌فرنگی"
    ]
  },
  {
    "id": "ing-5e7f1d43",
    "name": "عسل یا پودر قند",
    "normalizedName": "عسل یا پودر قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل یا پودر قند"
    ]
  },
  {
    "id": "ing-f64b7186",
    "name": "چوب بستنی و ظرف بستنی به مقدار لازم",
    "normalizedName": "چوب بستنی و ظرف بستنی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب بستنی و ظرف بستنی به مقدار لازم"
    ]
  },
  {
    "id": "ing-83e3ae71",
    "name": "پودر بیسکوییت",
    "normalizedName": "پودر بیسکوییت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر بیسکوییت"
    ]
  },
  {
    "id": "ing-84f78bb3",
    "name": "پودر ژله با طعم کیوی",
    "normalizedName": "پودر ژله با طعم کیوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله با طعم کیوی"
    ]
  },
  {
    "id": "ing-6cad3200",
    "name": "پودر قند و بیسکوییت مقداری",
    "normalizedName": "پودر قند و بیسکوییت مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند و بیسکوییت مقداری"
    ]
  },
  {
    "id": "ing-d3ae9f8",
    "name": "سيب مقدار لازم",
    "normalizedName": "سیب مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سيب مقدار لازم"
    ]
  },
  {
    "id": "ing-8203470d",
    "name": "طالبی1 کیلو",
    "normalizedName": "طالبی1 کیلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "طالبی1 کیلو"
    ]
  },
  {
    "id": "ing-6b815888",
    "name": "پودر پسته به مقدار لازم",
    "normalizedName": "پودر پسته به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پسته به مقدار لازم"
    ]
  },
  {
    "id": "ing-7232b405",
    "name": "بیكینگ پودر",
    "normalizedName": "بیکینگ پودر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیكینگ پودر"
    ]
  },
  {
    "id": "ing-8f0b5323",
    "name": "پودر كاكائو",
    "normalizedName": "پودر کاکائو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر كاكائو"
    ]
  },
  {
    "id": "ing-882b9f67",
    "name": "برش های میوه به مقدار لازم",
    "normalizedName": "برش های میوه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برش های میوه به مقدار لازم"
    ]
  },
  {
    "id": "ing-ec44b0a",
    "name": "فالوده آماده",
    "normalizedName": "فالوده اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فالوده آماده"
    ]
  },
  {
    "id": "ing-888cb991",
    "name": "توت فرنگی خرد شده به مقدار لازم",
    "normalizedName": "توت فرنگی خرد شده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی خرد شده به مقدار لازم"
    ]
  },
  {
    "id": "ing-d7ecd160",
    "name": "نودل چینی",
    "normalizedName": "نودل چینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل چینی"
    ]
  },
  {
    "id": "ing-bad3e9ca",
    "name": "کیت کت خرد شده ( بیسکوئیت شکلاتی )",
    "normalizedName": "کیت کت خرد شده ( بیسکوئیت شکلاتی )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیت کت خرد شده ( بیسکوئیت شکلاتی )"
    ]
  },
  {
    "id": "ing-e344ed03",
    "name": "خمیر کیک ساده",
    "normalizedName": "خمیر کیک ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر کیک ساده"
    ]
  },
  {
    "id": "ing-65368c04",
    "name": "رنگ های خوراکی",
    "normalizedName": "رنگ های خوراکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ های خوراکی"
    ]
  },
  {
    "id": "ing-b7196e2",
    "name": "خامه یا شکلات آب شده",
    "normalizedName": "خامه یا شکلات اب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا شکلات آب شده"
    ]
  },
  {
    "id": "ing-81ab1199",
    "name": "بیسکوییت نرم مقداری",
    "normalizedName": "بیسکوییت نرم مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت نرم مقداری"
    ]
  },
  {
    "id": "ing-31231e71",
    "name": "کیک شکلاتی",
    "normalizedName": "کیک شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیک شکلاتی"
    ]
  },
  {
    "id": "ing-d7bef2de",
    "name": "ماست یا خامه",
    "normalizedName": "ماست یا خامه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یا خامه"
    ]
  },
  {
    "id": "ing-60e9bf7e",
    "name": "توت فرنگی برای تزئین",
    "normalizedName": "توت فرنگی برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی برای تزئین"
    ]
  },
  {
    "id": "ing-dfd881c4",
    "name": "شكلات تخته ای ساده یا تلخ",
    "normalizedName": "شکلات تخته ای ساده یا تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شكلات تخته ای ساده یا تلخ"
    ]
  },
  {
    "id": "ing-9f33c614",
    "name": "کیک شکلاتی به مقدار لازم",
    "normalizedName": "کیک شکلاتی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیک شکلاتی به مقدار لازم"
    ]
  },
  {
    "id": "ing-9aae31b9",
    "name": "گردوی خرد شده به مقدار لازم",
    "normalizedName": "گردوی خرد شده به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردوی خرد شده به مقدار لازم"
    ]
  },
  {
    "id": "ing-110856bd",
    "name": "آناناس و کیوی به مقدار لازم",
    "normalizedName": "اناناس و کیوی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آناناس و کیوی به مقدار لازم"
    ]
  },
  {
    "id": "ing-4d1efbcd",
    "name": "وانیل۱/۲ قاشق چایخوری",
    "normalizedName": "وانیل۱/۲ قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل۱/۲ قاشق چایخوری"
    ]
  },
  {
    "id": "ing-d1140b65",
    "name": "شیر یا آب سرد",
    "normalizedName": "شیر یا اب سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا آب سرد"
    ]
  },
  {
    "id": "ing-45290385",
    "name": "بیسکوییت لیدی فینگر یا کیک به مقدار لازم",
    "normalizedName": "بیسکوییت لیدی فینگر یا کیک به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت لیدی فینگر یا کیک به مقدار لازم"
    ]
  },
  {
    "id": "ing-6f2979fd",
    "name": "توت فرنگی به مقدار لازم",
    "normalizedName": "توت فرنگی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی به مقدار لازم"
    ]
  },
  {
    "id": "ing-846d4143",
    "name": "کیک مقدار لازم",
    "normalizedName": "کیک مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کیک مقدار لازم"
    ]
  },
  {
    "id": "ing-65428934",
    "name": "بستنی مقدار لازم",
    "normalizedName": "بستنی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بستنی مقدار لازم"
    ]
  },
  {
    "id": "ing-2f2773d2",
    "name": "توت فرنگی مقدار لازم",
    "normalizedName": "توت فرنگی مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت فرنگی مقدار لازم"
    ]
  },
  {
    "id": "ing-226e9a36",
    "name": "خامه در صورت تمایل",
    "normalizedName": "خامه در صورت تمایل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه در صورت تمایل"
    ]
  },
  {
    "id": "ing-4da9109",
    "name": "خاکه قند",
    "normalizedName": "خاکه قند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاکه قند"
    ]
  },
  {
    "id": "ing-4c0dac23",
    "name": "زعفران دم کرده برای تزئین",
    "normalizedName": "زعفران دم کرده برای تزئین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم کرده برای تزئین"
    ]
  },
  {
    "id": "ing-f5df37d5",
    "name": "گلابی سفت",
    "normalizedName": "گلابی سفت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلابی سفت"
    ]
  },
  {
    "id": "ing-e3914bc3",
    "name": "گلاب یا عرق بهار نارنج",
    "normalizedName": "گلاب یا عرق بهار نارنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلاب یا عرق بهار نارنج"
    ]
  },
  {
    "id": "ing-75d99d70",
    "name": "مقداری بستنی و سس شکلاتی برای تزیین",
    "normalizedName": "مقداری بستنی و سس شکلاتی برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مقداری بستنی و سس شکلاتی برای تزیین"
    ]
  },
  {
    "id": "ing-9c4520d8",
    "name": "انبه ريز شده",
    "normalizedName": "انبه ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه ريز شده"
    ]
  },
  {
    "id": "ing-1d7316db",
    "name": "چاي سبز کيسه‌ اي",
    "normalizedName": "چای سبز کیسه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چاي سبز کيسه‌ اي"
    ]
  },
  {
    "id": "ing-e4544f43",
    "name": "قطعات يخ به مقدار لازم",
    "normalizedName": "قطعات یخ به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قطعات يخ به مقدار لازم"
    ]
  },
  {
    "id": "ing-9a20917d",
    "name": "خامه نصف لیوان",
    "normalizedName": "خامه نصف لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه نصف لیوان"
    ]
  },
  {
    "id": "ing-3d9a681d",
    "name": "قهوه مقداری",
    "normalizedName": "قهوه مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه مقداری"
    ]
  },
  {
    "id": "ing-77df7a81",
    "name": "وانیل به مقدار لازم",
    "normalizedName": "وانیل به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل به مقدار لازم"
    ]
  },
  {
    "id": "ing-867ca9eb",
    "name": "بیسکوییت مقداری",
    "normalizedName": "بیسکوییت مقداری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت مقداری"
    ]
  },
  {
    "id": "ing-4bfb24b6",
    "name": "پودر ژلاتين",
    "normalizedName": "پودر ژلاتین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژلاتين"
    ]
  },
  {
    "id": "ing-fadc7a22",
    "name": "اسانس وانيل",
    "normalizedName": "اسانس وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانيل"
    ]
  },
  {
    "id": "ing-768aba62",
    "name": "قهوه سرد",
    "normalizedName": "قهوه سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه سرد"
    ]
  },
  {
    "id": "ing-9c1899a3",
    "name": "پودرکاکائو",
    "normalizedName": "پودرکاکائو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودرکاکائو"
    ]
  },
  {
    "id": "ing-30224b72",
    "name": "ماسکارپونه یا پنیر خامه ای",
    "normalizedName": "ماسکارپونه یا پنیر خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماسکارپونه یا پنیر خامه ای"
    ]
  },
  {
    "id": "ing-244abe2f",
    "name": "قهوه اماده سرد",
    "normalizedName": "قهوه اماده سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه اماده سرد"
    ]
  },
  {
    "id": "ing-9dc6f9c8",
    "name": "وانیل چند قطره",
    "normalizedName": "وانیل چند قطره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل چند قطره"
    ]
  },
  {
    "id": "ing-60f00d3",
    "name": "تکه های میوه در صورت تمایل",
    "normalizedName": "تکه های میوه در صورت تمایل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های میوه در صورت تمایل"
    ]
  },
  {
    "id": "ing-70602ad3",
    "name": "شکلات تخته ای تلخ",
    "normalizedName": "شکلات تخته ای تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای تلخ"
    ]
  },
  {
    "id": "ing-6d69cd05",
    "name": "تخم مرغ کامل",
    "normalizedName": "تخم مرغ کامل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ کامل"
    ]
  },
  {
    "id": "ing-f7a58709",
    "name": "انبه رسیده بزرگ",
    "normalizedName": "انبه رسیده بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انبه رسیده بزرگ"
    ]
  },
  {
    "id": "ing-f8a5353d",
    "name": "خامه یا ماست شیرین",
    "normalizedName": "خامه یا ماست شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا ماست شیرین"
    ]
  },
  {
    "id": "ing-c07ce219",
    "name": "گردو به مقدار لازم",
    "normalizedName": "گردو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو به مقدار لازم"
    ]
  },
  {
    "id": "ing-e72e32c2",
    "name": "خلال بادام برای تزیین",
    "normalizedName": "خلال بادام برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال بادام برای تزیین"
    ]
  },
  {
    "id": "ing-5f7ff549",
    "name": "زعفران سائيده",
    "normalizedName": "زعفران سائیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران سائيده"
    ]
  },
  {
    "id": "ing-e8e9d1ac",
    "name": "پودر پسته و دارچين به مقدار دلخواه",
    "normalizedName": "پودر پسته و دارچین به مقدار دلخواه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پسته و دارچين به مقدار دلخواه"
    ]
  },
  {
    "id": "ing-85e09b2d",
    "name": "سبزی قورمه (تره",
    "normalizedName": "سبزی قورمه (تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی قورمه (تره"
    ]
  },
  {
    "id": "ing-77fc9f5d",
    "name": "شنبلیله)",
    "normalizedName": "شنبلیله)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شنبلیله)"
    ]
  },
  {
    "id": "ing-d8e021fc",
    "name": "نخود و لوبیا سفید",
    "normalizedName": "نخود و لوبیا سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود و لوبیا سفید"
    ]
  },
  {
    "id": "ing-2730bd45",
    "name": "رب گوجه‌فرنگی",
    "normalizedName": "رب گوجه فرنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه‌فرنگی"
    ]
  },
  {
    "id": "ing-e3bbf417",
    "name": "گردو آسیاب شده",
    "normalizedName": "گردو اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو آسیاب شده"
    ]
  },
  {
    "id": "ing-a05ba6b5",
    "name": "گوشت قلقلی یا مرغ",
    "normalizedName": "گوشت قلقلی یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت قلقلی یا مرغ"
    ]
  },
  {
    "id": "ing-6d581c4c",
    "name": "شکر به مقدار لازم",
    "normalizedName": "شکر به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر به مقدار لازم"
    ]
  },
  {
    "id": "ing-f313ca2f",
    "name": "نمک و زردچوبه به مقدار لازم",
    "normalizedName": "نمک و زردچوبه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و زردچوبه به مقدار لازم"
    ]
  },
  {
    "id": "ing-e90b955",
    "name": "برنج نیم‌پز",
    "normalizedName": "برنج نیم پز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج نیم‌پز"
    ]
  },
  {
    "id": "ing-4f00b9f9",
    "name": "سبزی کوفته (تره",
    "normalizedName": "سبزی کوفته (تره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی کوفته (تره"
    ]
  },
  {
    "id": "ing-5db806eb",
    "name": "نعناع)",
    "normalizedName": "نعناع)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نعناع)"
    ]
  },
  {
    "id": "ing-f8511bf1",
    "name": "آلو خشک و گردو برای داخل کوفته",
    "normalizedName": "الو خشک و گردو برای داخل کوفته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو خشک و گردو برای داخل کوفته"
    ]
  },
  {
    "id": "ing-ab5dac30",
    "name": "خرما و کشمش برای تزیین",
    "normalizedName": "خرما و کشمش برای تزیین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرما و کشمش برای تزیین"
    ]
  },
  {
    "id": "ing-ad73eea9",
    "name": "نمک و ادویه به مقدار لازم",
    "normalizedName": "نمک و ادویه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و ادویه به مقدار لازم"
    ]
  },
  {
    "id": "ing-fdb41067",
    "name": "باقالی",
    "normalizedName": "باقالی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقالی"
    ]
  },
  {
    "id": "ing-7a25742d",
    "name": "ماهیچه",
    "normalizedName": "ماهیچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهیچه"
    ]
  },
  {
    "id": "ing-b38001db",
    "name": "ادویه کبسه",
    "normalizedName": "ادویه کبسه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه کبسه"
    ]
  },
  {
    "id": "ing-b3910d9f",
    "name": "ادویه منسف",
    "normalizedName": "ادویه منسف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه منسف"
    ]
  },
  {
    "id": "ing-25f81f69",
    "name": "ادویه فلافل",
    "normalizedName": "ادویه فلافل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه فلافل"
    ]
  },
  {
    "id": "ing-6e7d4506",
    "name": "ادویه شاورما",
    "normalizedName": "ادویه شاورما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه شاورما"
    ]
  },
  {
    "id": "ing-55f70eb1",
    "name": "خمیر سمبوسه",
    "normalizedName": "خمیر سمبوسه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر سمبوسه"
    ]
  },
  {
    "id": "ing-791a484c",
    "name": "ادویه سمبوسه",
    "normalizedName": "ادویه سمبوسه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه سمبوسه"
    ]
  },
  {
    "id": "ing-2249837e",
    "name": "ادویه صوانی",
    "normalizedName": "ادویه صوانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه صوانی"
    ]
  },
  {
    "id": "ing-2d034745",
    "name": "کبد مرغ",
    "normalizedName": "کبد مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کبد مرغ"
    ]
  },
  {
    "id": "ing-b3800247",
    "name": "ادویه کبده",
    "normalizedName": "ادویه کبده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه کبده"
    ]
  },
  {
    "id": "ing-bd90175b",
    "name": "ادویه شیش طاووک",
    "normalizedName": "ادویه شیش طاووک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه شیش طاووک"
    ]
  },
  {
    "id": "ing-22589b61",
    "name": "ادویه شورما",
    "normalizedName": "ادویه شورما",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه شورما"
    ]
  },
  {
    "id": "ing-dc013960",
    "name": "ادویه ملوجیه",
    "normalizedName": "ادویه ملوجیه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه ملوجیه"
    ]
  },
  {
    "id": "ing-d9a16cc4",
    "name": "کُنافه",
    "normalizedName": "کُنافه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کُنافه"
    ]
  },
  {
    "id": "ing-985fc7a0",
    "name": "ماهی خام",
    "normalizedName": "ماهی خام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی خام"
    ]
  },
  {
    "id": "ing-29bd6417",
    "name": "برگ چای سبز",
    "normalizedName": "برگ چای سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ چای سبز"
    ]
  },
  {
    "id": "ing-91e404ae",
    "name": "برگ یشم",
    "normalizedName": "برگ یشم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ یشم"
    ]
  },
  {
    "id": "ing-e2de4d0e",
    "name": "یوفکا",
    "normalizedName": "یوفکا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یوفکا"
    ]
  },
  {
    "id": "ing-5e1b4b50",
    "name": "خمیر گندم",
    "normalizedName": "خمیر گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر گندم"
    ]
  },
  {
    "id": "ing-76eb3411",
    "name": "پنیر سفید",
    "normalizedName": "پنیر سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر سفید"
    ]
  },
  {
    "id": "ing-27d0ea35",
    "name": "خمیر باقلوا",
    "normalizedName": "خمیر باقلوا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر باقلوا"
    ]
  },
  {
    "id": "ing-b7d74f8",
    "name": "دوغ",
    "normalizedName": "دوغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دوغ"
    ]
  },
  {
    "id": "ing-da804f90",
    "name": "ادویه نهاری به مقدار لازم",
    "normalizedName": "ادویه نهاری به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه نهاری به مقدار لازم"
    ]
  },
  {
    "id": "ing-90c755f",
    "name": "دال ماش",
    "normalizedName": "دال ماش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دال ماش"
    ]
  },
  {
    "id": "ing-e9cdf1e6",
    "name": "ادویه مخصوص کباب به مقدار لازم",
    "normalizedName": "ادویه مخصوص کباب به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مخصوص کباب به مقدار لازم"
    ]
  },
  {
    "id": "ing-e5d645ba",
    "name": "ادویه مخصوص پلو به مقدار لازم",
    "normalizedName": "ادویه مخصوص پلو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مخصوص پلو به مقدار لازم"
    ]
  },
  {
    "id": "ing-c55eac7c",
    "name": "ادویه مخصوص بیریانی به مقدار لازم",
    "normalizedName": "ادویه مخصوص بیریانی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مخصوص بیریانی به مقدار لازم"
    ]
  },
  {
    "id": "ing-8708640",
    "name": "پودر زردچوبه",
    "normalizedName": "پودر زردچوبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر زردچوبه"
    ]
  },
  {
    "id": "ing-b4e2eb38",
    "name": "سس سالاد به مقدار لازم",
    "normalizedName": "سس سالاد به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سالاد به مقدار لازم"
    ]
  },
  {
    "id": "ing-e468dcab",
    "name": "سس گوچوجانگ به مقدار لازم",
    "normalizedName": "سس گوچوجانگ به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوچوجانگ به مقدار لازم"
    ]
  },
  {
    "id": "ing-2019a6c7",
    "name": "گوشت گوسفندی یا گاو",
    "normalizedName": "گوشت گوسفندی یا گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گوسفندی یا گاو"
    ]
  },
  {
    "id": "ing-fc557a4d",
    "name": "کلم چینی",
    "normalizedName": "کلم چینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم چینی"
    ]
  },
  {
    "id": "ing-10c0afdc",
    "name": "توک (برنج برشته)",
    "normalizedName": "توک (برنج برشته)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توک (برنج برشته)"
    ]
  },
  {
    "id": "ing-f7072a95",
    "name": "پوره سویا",
    "normalizedName": "پوره سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره سویا"
    ]
  },
  {
    "id": "ing-7b2fef9e",
    "name": "شعره",
    "normalizedName": "شعره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شعره"
    ]
  },
  {
    "id": "ing-c2430ce4",
    "name": "سبزیجات به مقدار لازم",
    "normalizedName": "سبزیجات به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات به مقدار لازم"
    ]
  },
  {
    "id": "ing-184c21ec",
    "name": "خمیر برنجی",
    "normalizedName": "خمیر برنجی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر برنجی"
    ]
  },
  {
    "id": "ing-19595ee",
    "name": "گوچوجانگ",
    "normalizedName": "گوچوجانگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوچوجانگ"
    ]
  },
  {
    "id": "ing-b801927",
    "name": "وین",
    "normalizedName": "وین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وین"
    ]
  },
  {
    "id": "ing-2b2bd73f",
    "name": "روغن زیتون به مقدار لازم",
    "normalizedName": "روغن زیتون به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون به مقدار لازم"
    ]
  },
  {
    "id": "ing-cd15839b",
    "name": "کبد اردک",
    "normalizedName": "کبد اردک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کبد اردک"
    ]
  },
  {
    "id": "ing-b1d7173",
    "name": "نان سفید",
    "normalizedName": "نان سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان سفید"
    ]
  },
  {
    "id": "ing-7b4b26de",
    "name": "مربا",
    "normalizedName": "مربا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا"
    ]
  },
  {
    "id": "ing-44618df7",
    "name": "پودر فلفل سیاه به مقدار لازم",
    "normalizedName": "پودر فلفل سیاه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سیاه به مقدار لازم"
    ]
  },
  {
    "id": "ing-d50b9c91",
    "name": "ریحان به مقدار لازم",
    "normalizedName": "ریحان به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان به مقدار لازم"
    ]
  },
  {
    "id": "ing-86d8cce1",
    "name": "اسپاگتی",
    "normalizedName": "اسپاگتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسپاگتی"
    ]
  },
  {
    "id": "ing-f9062ddc",
    "name": "پروشوتو",
    "normalizedName": "پروشوتو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پروشوتو"
    ]
  },
  {
    "id": "ing-82351427",
    "name": "بیسکوییت لیدی‌فینگر",
    "normalizedName": "بیسکوییت لیدی فینگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکوییت لیدی‌فینگر"
    ]
  },
  {
    "id": "ing-72ee0bd6",
    "name": "پپرونی",
    "normalizedName": "پپرونی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پپرونی"
    ]
  },
  {
    "id": "ing-4998994a",
    "name": "پروتئین مرغ",
    "normalizedName": "پروتئین مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پروتئین مرغ"
    ]
  },
  {
    "id": "ing-2fcc851",
    "name": "کپرچیوزا به مقدار لازم",
    "normalizedName": "کپرچیوزا به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کپرچیوزا به مقدار لازم"
    ]
  },
  {
    "id": "ing-e4da607a",
    "name": "پارمسان",
    "normalizedName": "پارمسان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پارمسان"
    ]
  },
  {
    "id": "ing-d7c2c496",
    "name": "برنج مخصوص سوشی",
    "normalizedName": "برنج مخصوص سوشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج مخصوص سوشی"
    ]
  },
  {
    "id": "ing-7b213dd0",
    "name": "رامن",
    "normalizedName": "رامن",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رامن"
    ]
  },
  {
    "id": "ing-bf19b9ce",
    "name": "سبزیجات (پیاز",
    "normalizedName": "سبزیجات (پیاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات (پیاز"
    ]
  },
  {
    "id": "ing-882cff41",
    "name": "هویج و کرفس)",
    "normalizedName": "هویج و کرفس)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج و کرفس)"
    ]
  },
  {
    "id": "ing-6aa34fc7",
    "name": "سبزیجات (کدو",
    "normalizedName": "سبزیجات (کدو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات (کدو"
    ]
  },
  {
    "id": "ing-86c98824",
    "name": "بادمجان)",
    "normalizedName": "بادمجان)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادمجان)"
    ]
  },
  {
    "id": "ing-d3f46c87",
    "name": "سس تاکویاکی",
    "normalizedName": "سس تاکویاکی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تاکویاکی"
    ]
  },
  {
    "id": "ing-d606f92e",
    "name": "نودل اودون",
    "normalizedName": "نودل اودون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل اودون"
    ]
  },
  {
    "id": "ing-57e3e285",
    "name": "پودر بیکینگ",
    "normalizedName": "پودر بیکینگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر بیکینگ"
    ]
  },
  {
    "id": "ing-3fdbb658",
    "name": "آرد مخصوص موچی",
    "normalizedName": "ارد مخصوص موچی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد مخصوص موچی"
    ]
  },
  {
    "id": "ing-7ccb66d4",
    "name": "پروتئین سویا",
    "normalizedName": "پروتئین سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پروتئین سویا"
    ]
  },
  {
    "id": "ing-6aa34a01",
    "name": "سبزیجات (کلم",
    "normalizedName": "سبزیجات (کلم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات (کلم"
    ]
  },
  {
    "id": "ing-72f536ba",
    "name": "واسابی",
    "normalizedName": "واسابی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "واسابی"
    ]
  },
  {
    "id": "ing-ce351765",
    "name": "سس انچیلادا",
    "normalizedName": "سس انچیلادا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس انچیلادا"
    ]
  },
  {
    "id": "ing-8da63cf9",
    "name": "سالاد سبزیجات",
    "normalizedName": "سالاد سبزیجات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سالاد سبزیجات"
    ]
  },
  {
    "id": "ing-fde7fc32",
    "name": "پشکل گوشت چرخ کرده",
    "normalizedName": "پشکل گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پشکل گوشت چرخ کرده"
    ]
  },
  {
    "id": "ing-9d7a1ad5",
    "name": "لوبیا سیاه",
    "normalizedName": "لوبیا سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا سیاه"
    ]
  },
  {
    "id": "ing-e2801c9e",
    "name": "استیک",
    "normalizedName": "استیک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استیک"
    ]
  },
  {
    "id": "ing-96cfc0bf",
    "name": "فلفل سیاه به مقدار لازم",
    "normalizedName": "فلفل سیاه به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه به مقدار لازم"
    ]
  },
  {
    "id": "ing-8449a559",
    "name": "آرد عدس",
    "normalizedName": "ارد عدس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد عدس"
    ]
  },
  {
    "id": "ing-88edaca3",
    "name": "گشنیز به مقدار لازم",
    "normalizedName": "گشنیز به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز به مقدار لازم"
    ]
  },
  {
    "id": "ing-ebc2e931",
    "name": "سبزیجات مخلوط",
    "normalizedName": "سبزیجات مخلوط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات مخلوط"
    ]
  },
  {
    "id": "ing-1f7c5d13",
    "name": "ادویه پولاو",
    "normalizedName": "ادویه پولاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه پولاو"
    ]
  },
  {
    "id": "ing-e4d06e6d",
    "name": "سبزیجات خرد شده",
    "normalizedName": "سبزیجات خرد شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات خرد شده"
    ]
  },
  {
    "id": "ing-902ceb0",
    "name": "پختن این غذا نیاز به آرد",
    "normalizedName": "پختن این غذا نیاز به ارد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پختن این غذا نیاز به آرد"
    ]
  },
  {
    "id": "ing-453f030e",
    "name": "کره و کمی گلاب دارد.",
    "normalizedName": "کره و کمی گلاب دارد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره و کمی گلاب دارد."
    ]
  },
  {
    "id": "ing-ebc1aea5",
    "name": "سبزیجات مختلف",
    "normalizedName": "سبزیجات مختلف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات مختلف"
    ]
  },
  {
    "id": "ing-e0487476",
    "name": "ادویه پولاو به مقدار لازم",
    "normalizedName": "ادویه پولاو به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه پولاو به مقدار لازم"
    ]
  },
  {
    "id": "ing-d2f417df",
    "name": "عدس سیاه",
    "normalizedName": "عدس سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عدس سیاه"
    ]
  },
  {
    "id": "ing-10cf2c5",
    "name": "ادویه‌های هندی به مقدار لازم",
    "normalizedName": "ادویه های هندی به مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌های هندی به مقدار لازم"
    ]
  },
  {
    "id": "ing-5a7425fe",
    "name": "Bulgur",
    "normalizedName": "bulgur",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "Bulgur"
    ]
  },
  {
    "id": "ing-5a74276a",
    "name": "Bulgar",
    "normalizedName": "bulgar",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "Bulgar"
    ]
  },
  {
    "id": "ing-206d25c4",
    "name": "سس کنجد (تاهینی)",
    "normalizedName": "سس کنجد (تاهینی)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کنجد (تاهینی)"
    ]
  },
  {
    "id": "ing-c77eb49d",
    "name": "آب نارگیل",
    "normalizedName": "اب نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارگیل"
    ]
  },
  {
    "id": "ing-b5651d08",
    "name": "پودر پنیر",
    "normalizedName": "پودر پنیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر پنیر"
    ]
  },
  {
    "id": "ing-b7d7a58",
    "name": "حمص",
    "normalizedName": "حمص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حمص"
    ]
  },
  {
    "id": "ing-3e12dc70",
    "name": "بابا گنوش",
    "normalizedName": "بابا گنوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بابا گنوش"
    ]
  },
  {
    "id": "ing-7b80c546",
    "name": "نبات",
    "normalizedName": "نبات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نبات"
    ]
  },
  {
    "id": "ing-e6e30a",
    "name": "آرد تورتیلا",
    "normalizedName": "ارد تورتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد تورتیلا"
    ]
  },
  {
    "id": "ing-cc9ad945",
    "name": "ساردین",
    "normalizedName": "ساردین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ساردین"
    ]
  },
  {
    "id": "ing-7b47d62a",
    "name": "پستو",
    "normalizedName": "پستو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پستو"
    ]
  },
  {
    "id": "ing-c7fdbdac",
    "name": "چوریزو",
    "normalizedName": "چوریزو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوریزو"
    ]
  },
  {
    "id": "ing-753c256d",
    "name": "ادویه‌های یونانی",
    "normalizedName": "ادویه های یونانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه‌های یونانی"
    ]
  },
  {
    "id": "ing-b7d46ee",
    "name": "سکر",
    "normalizedName": "سکر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سکر"
    ]
  },
  {
    "id": "ing-1c9e641",
    "name": "ادویه یونانی",
    "normalizedName": "ادویه یونانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه یونانی"
    ]
  },
  {
    "id": "ing-758a9ff7",
    "name": "رشته نودل برنجی",
    "normalizedName": "رشته نودل برنجی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته نودل برنجی"
    ]
  },
  {
    "id": "ing-434f1676",
    "name": "انیسون ستاره‌ای",
    "normalizedName": "انیسون ستاره ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انیسون ستاره‌ای"
    ]
  },
  {
    "id": "ing-a19769d3",
    "name": "گوشت گریل شده یا مرغ",
    "normalizedName": "گوشت گریل شده یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گریل شده یا مرغ"
    ]
  },
  {
    "id": "ing-a6a2ad49",
    "name": "هویج ترشی",
    "normalizedName": "هویج ترشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج ترشی"
    ]
  },
  {
    "id": "ing-ce2e5300",
    "name": "برگ برنج",
    "normalizedName": "برگ برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ برنج"
    ]
  },
  {
    "id": "ing-681ac4d6",
    "name": "گوشت خوک یا مرغ",
    "normalizedName": "گوشت خوک یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت خوک یا مرغ"
    ]
  },
  {
    "id": "ing-8f5a772d",
    "name": "رشته ورمیشل",
    "normalizedName": "رشته ورمیشل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رشته ورمیشل"
    ]
  },
  {
    "id": "ing-c848ef54",
    "name": "زنجفیل",
    "normalizedName": "زنجفیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجفیل"
    ]
  },
  {
    "id": "ing-d6515b7f",
    "name": "نودل برنجی",
    "normalizedName": "نودل برنجی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نودل برنجی"
    ]
  },
  {
    "id": "ing-660e5259",
    "name": "مرغ یا گوشت",
    "normalizedName": "مرغ یا گوشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ یا گوشت"
    ]
  },
  {
    "id": "ing-7de39d75",
    "name": "سس سس سویا",
    "normalizedName": "سس سس سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سس سویا"
    ]
  },
  {
    "id": "ing-cf75f30a",
    "name": "پوره لوبیا",
    "normalizedName": "پوره لوبیا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره لوبیا"
    ]
  },
  {
    "id": "ing-d1a3641c",
    "name": "گوسفند یا مرغ",
    "normalizedName": "گوسفند یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوسفند یا مرغ"
    ]
  },
  {
    "id": "ing-7b81cd24",
    "name": "فیلو",
    "normalizedName": "فیلو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیلو"
    ]
  },
  {
    "id": "ing-cbf18d79",
    "name": "گوسفند",
    "normalizedName": "گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوسفند"
    ]
  },
  {
    "id": "ing-e0bdaa89",
    "name": "خرگوش",
    "normalizedName": "خرگوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرگوش"
    ]
  },
  {
    "id": "ing-5dba2429",
    "name": "خمیر پیده",
    "normalizedName": "خمیر پیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پیده"
    ]
  },
  {
    "id": "ing-860606fb",
    "name": "گوشت ریبز",
    "normalizedName": "گوشت ریبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ریبز"
    ]
  },
  {
    "id": "ing-84f3ed8f",
    "name": "نان هات داگ",
    "normalizedName": "نان هات داگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان هات داگ"
    ]
  },
  {
    "id": "ing-8e265173",
    "name": "تورتیلا",
    "normalizedName": "تورتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تورتیلا"
    ]
  },
  {
    "id": "ing-86069f8c",
    "name": "گوشت سویا",
    "normalizedName": "گوشت سویا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت سویا"
    ]
  },
  {
    "id": "ing-635a5985",
    "name": "سبزیجات مختلف (مثل فلفل دلمه‌ای",
    "normalizedName": "سبزیجات مختلف (مثل فلفل دلمه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزیجات مختلف (مثل فلفل دلمه‌ای"
    ]
  },
  {
    "id": "ing-4070cdd5",
    "name": "بیسکویت",
    "normalizedName": "بیسکویت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بیسکویت"
    ]
  },
  {
    "id": "ing-5e73f27",
    "name": "باکالو خشک شده",
    "normalizedName": "باکالو خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باکالو خشک شده"
    ]
  },
  {
    "id": "ing-cf6588b8",
    "name": "خمیر هزار لایه",
    "normalizedName": "خمیر هزار لایه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر هزار لایه"
    ]
  },
  {
    "id": "ing-e6ba4d3b",
    "name": "پنیر بوراتا",
    "normalizedName": "پنیر بوراتا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر بوراتا"
    ]
  },
  {
    "id": "ing-863cacf8",
    "name": "گوشت دودی",
    "normalizedName": "گوشت دودی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت دودی"
    ]
  },
  {
    "id": "ing-cadf1bc5",
    "name": "ماهی خال‌مخالی",
    "normalizedName": "ماهی خال مخالی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماهی خال‌مخالی"
    ]
  },
  {
    "id": "ing-98f8eb2",
    "name": "سس نارگیل",
    "normalizedName": "سس نارگیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس نارگیل"
    ]
  },
  {
    "id": "ing-a3db78f0",
    "name": "دلمه‌های خرچنگ",
    "normalizedName": "دلمه های خرچنگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دلمه‌های خرچنگ"
    ]
  },
  {
    "id": "ing-9a9f2d6b",
    "name": "گوشت گاو یا گوسفند",
    "normalizedName": "گوشت گاو یا گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت گاو یا گوسفند"
    ]
  },
  {
    "id": "ing-d420690",
    "name": "شیر اسب",
    "normalizedName": "شیر اسب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر اسب"
    ]
  },
  {
    "id": "ing-129183ba",
    "name": "آرد سفید سخت",
    "normalizedName": "ارد سفید سخت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید سخت"
    ]
  },
  {
    "id": "ing-ac940461",
    "name": "نمک بسیار ریز",
    "normalizedName": "نمک بسیار ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک بسیار ریز"
    ]
  },
  {
    "id": "ing-77020d9c",
    "name": "شیر نیم چرب",
    "normalizedName": "شیر نیم چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نیم چرب"
    ]
  },
  {
    "id": "ing-f594f28",
    "name": "دانه ی شقایق (سیاه دانه)",
    "normalizedName": "دانه ی شقایق (سیاه دانه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی شقایق (سیاه دانه)"
    ]
  },
  {
    "id": "ing-3a3cc2d5",
    "name": "لبوی تازه",
    "normalizedName": "لبوی تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبوی تازه"
    ]
  },
  {
    "id": "ing-5cf2c26e",
    "name": "کدو خورشتی",
    "normalizedName": "کدو خورشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کدو خورشتی"
    ]
  },
  {
    "id": "ing-b96c6fd3",
    "name": "فلفل دلمه ای رنگی",
    "normalizedName": "فلفل دلمه ای رنگی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای رنگی"
    ]
  },
  {
    "id": "ing-11011639",
    "name": "رزماری چند  به",
    "normalizedName": "رزماری چند به",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری چند  به"
    ]
  },
  {
    "id": "ing-814358ed",
    "name": "خامه ی ترش",
    "normalizedName": "خامه ی ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ی ترش"
    ]
  },
  {
    "id": "ing-d0efefbc",
    "name": "ترب کوهی",
    "normalizedName": "ترب کوهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترب کوهی"
    ]
  },
  {
    "id": "ing-5bd43f1",
    "name": "استیک راسته 1.5 تا",
    "normalizedName": "استیک راسته 1.5 تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استیک راسته 1.5 تا"
    ]
  },
  {
    "id": "ing-6263eff4",
    "name": "پنیر پارمزان یا هرنوع پنیر سفت دیگر",
    "normalizedName": "پنیر پارمزان یا هرنوع پنیر سفت دیگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمزان یا هرنوع پنیر سفت دیگر"
    ]
  },
  {
    "id": "ing-80c97f21",
    "name": "پلنتای زود پز",
    "normalizedName": "پلنتای زود پز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پلنتای زود پز"
    ]
  },
  {
    "id": "ing-3f0631d0",
    "name": "قارچ های دکمه ای بزرگ",
    "normalizedName": "قارچ های دکمه ای بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ های دکمه ای بزرگ"
    ]
  },
  {
    "id": "ing-bcaecbd8",
    "name": "فلفل دلمه ای 2 تا",
    "normalizedName": "فلفل دلمه ای 2 تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای 2 تا"
    ]
  },
  {
    "id": "ing-638c08fa",
    "name": "پنیر بز",
    "normalizedName": "پنیر بز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر بز"
    ]
  },
  {
    "id": "ing-cbf32f67",
    "name": "با استفاده از یک قالب دایره ای به قطر 10 سانتی متر یا یک نعلبکی تعداد  دایره از پلنتا در بیاورید",
    "normalizedName": "با استفاده از یک قالب دایره ای به قطر 10 سانتی متر یا یک نعلبکی تعداد دایره از پلنتا در بیاورید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با استفاده از یک قالب دایره ای به قطر 10 سانتی متر یا یک نعلبکی تعداد  دایره از پلنتا در بیاورید"
    ]
  },
  {
    "id": "ing-ed5f631b",
    "name": "زنجبیل فرانسوی",
    "normalizedName": "زنجبیل فرانسوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل فرانسوی"
    ]
  },
  {
    "id": "ing-8cd527cb",
    "name": "سیر  درشت",
    "normalizedName": "سیر درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر  درشت"
    ]
  },
  {
    "id": "ing-863c947d",
    "name": "گوشت دنده",
    "normalizedName": "گوشت دنده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت دنده"
    ]
  },
  {
    "id": "ing-b3b3ec2e",
    "name": "ادویه چینی",
    "normalizedName": "ادویه چینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه چینی"
    ]
  },
  {
    "id": "ing-1dd0fdfb",
    "name": "کاهو برگ کوچک     یا  بزرگ 1 عدد",
    "normalizedName": "کاهو برگ کوچک یا بزرگ 1 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کاهو برگ کوچک     یا  بزرگ 1 عدد"
    ]
  },
  {
    "id": "ing-71f0cd3e",
    "name": "این گوشت  به اندازه ی آن به 3 تا 4 ساعت پخت در فر نیاز دارد.",
    "normalizedName": "این گوشت به اندازه ی ان به 3 تا 4 ساعت پخت در فر نیاز دارد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این گوشت  به اندازه ی آن به 3 تا 4 ساعت پخت در فر نیاز دارد."
    ]
  },
  {
    "id": "ing-8f262f9a",
    "name": "تکه های مرغ با پوست : ران و بالای ران مناسب ترین بخش هستند",
    "normalizedName": "تکه های مرغ با پوست : ران و بالای ران مناسب ترین بخش هستند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های مرغ با پوست : ران و بالای ران مناسب ترین بخش هستند"
    ]
  },
  {
    "id": "ing-1edbef4a",
    "name": "پودر فلفل سیاه تازه",
    "normalizedName": "پودر فلفل سیاه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل سیاه تازه"
    ]
  },
  {
    "id": "ing-7ae60573",
    "name": "کچاپ",
    "normalizedName": "کچاپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کچاپ"
    ]
  },
  {
    "id": "ing-c9c96635",
    "name": "سس تاباسکو",
    "normalizedName": "سس تاباسکو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس تاباسکو"
    ]
  },
  {
    "id": "ing-40381ab4",
    "name": "سس ورسترشایر  (به )",
    "normalizedName": "سس ورسترشایر (به )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس ورسترشایر  (به )"
    ]
  },
  {
    "id": "ing-51ffa446",
    "name": "سیب ترد",
    "normalizedName": "سیب ترد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب ترد"
    ]
  },
  {
    "id": "ing-8e89b0fe",
    "name": "سیاه دانه  سر پر",
    "normalizedName": "سیاه دانه سر پر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیاه دانه  سر پر"
    ]
  },
  {
    "id": "ing-18cb298e",
    "name": "گوشت شانه ی گاو با استخوان و بریده شده به شکل قطعات بزرگ",
    "normalizedName": "گوشت شانه ی گاو با استخوان و بریده شده به شکل قطعات بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت شانه ی گاو با استخوان و بریده شده به شکل قطعات بزرگ"
    ]
  },
  {
    "id": "ing-e323f5de",
    "name": "پاپریکای تند",
    "normalizedName": "پاپریکای تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاپریکای تند"
    ]
  },
  {
    "id": "ing-b7114d6b",
    "name": "پونه کوهی خشک",
    "normalizedName": "پونه کوهی خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه کوهی خشک"
    ]
  },
  {
    "id": "ing-7d470851",
    "name": "رب گوجه (پوره )",
    "normalizedName": "رب گوجه (پوره )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه (پوره )"
    ]
  },
  {
    "id": "ing-4112c6c",
    "name": "لوبیای سیاه کنسروی بدون آب  ( می توانید از لوبیا چیتی یا لوبیا قرمز نیز استفاده کنید)",
    "normalizedName": "لوبیای سیاه کنسروی بدون اب ( می توانید از لوبیا چیتی یا لوبیا قرمز نیز استفاده کنید)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیای سیاه کنسروی بدون آب  ( می توانید از لوبیا چیتی یا لوبیا قرمز نیز استفاده کنید)"
    ]
  },
  {
    "id": "ing-1e2a3588",
    "name": "بوقلمون",
    "normalizedName": "بوقلمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بوقلمون"
    ]
  },
  {
    "id": "ing-51ffc25e",
    "name": "سیب زرد",
    "normalizedName": "سیب زرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زرد"
    ]
  },
  {
    "id": "ing-d1b830ae",
    "name": "آلو برغانی (آلو قرمز)",
    "normalizedName": "الو برغانی (الو قرمز)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلو برغانی (آلو قرمز)"
    ]
  },
  {
    "id": "ing-6e265226",
    "name": "طرفین بوقلمون را در این روغن سرخ کنید و  آب بریزید",
    "normalizedName": "طرفین بوقلمون را در این روغن سرخ کنید و اب بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "طرفین بوقلمون را در این روغن سرخ کنید و  آب بریزید"
    ]
  },
  {
    "id": "ing-b59541e4",
    "name": "چند  سیر",
    "normalizedName": "چند سیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چند  سیر"
    ]
  },
  {
    "id": "ing-f47ab286",
    "name": "دو  هویج  و بقیه سیب ها را داخل ظرف بوقلمون بریزید",
    "normalizedName": "دو هویج و بقیه سیب ها را داخل ظرف بوقلمون بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دو  هویج  و بقیه سیب ها را داخل ظرف بوقلمون بریزید"
    ]
  },
  {
    "id": "ing-2b103361",
    "name": "گوشت راسته یا کفل گاو  ( چربی اضافی آن گرفته شده باشد)",
    "normalizedName": "گوشت راسته یا کفل گاو ( چربی اضافی ان گرفته شده باشد)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت راسته یا کفل گاو  ( چربی اضافی آن گرفته شده باشد)"
    ]
  },
  {
    "id": "ing-193cf63d",
    "name": "روغن زیتون  به اضافه ی 1 قاشق چایخوری",
    "normalizedName": "روغن زیتون به اضافه ی 1 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون  به اضافه ی 1 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-f3314e25",
    "name": "منداب وحشی یا آراگولا",
    "normalizedName": "منداب وحشی یا اراگولا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "منداب وحشی یا آراگولا"
    ]
  },
  {
    "id": "ing-8822124a",
    "name": "برگه های آرتیشوی کباب شده",
    "normalizedName": "برگه های ارتیشوی کباب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگه های آرتیشوی کباب شده"
    ]
  },
  {
    "id": "ing-120ef407",
    "name": "شور شپله  بدون آب",
    "normalizedName": "شور شپله بدون اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شور شپله  بدون آب"
    ]
  },
  {
    "id": "ing-d656a7a3",
    "name": "تکه های مرغ",
    "normalizedName": "تکه های مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های مرغ"
    ]
  },
  {
    "id": "ing-f0f36c90",
    "name": "(بخش پایین ران",
    "normalizedName": "(بخش پایین ران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "(بخش پایین ران"
    ]
  },
  {
    "id": "ing-f192f6c7",
    "name": "بخش بالای ران",
    "normalizedName": "بخش بالای ران",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بخش بالای ران"
    ]
  },
  {
    "id": "ing-d3dd2dd2",
    "name": "سینه )",
    "normalizedName": "سینه )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه )"
    ]
  },
  {
    "id": "ing-10e1404d",
    "name": "ادویه مراکشی    برگه فلفل قرمز 1 قاشق چایخوری",
    "normalizedName": "ادویه مراکشی برگه فلفل قرمز 1 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مراکشی    برگه فلفل قرمز 1 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-f104c93e",
    "name": "روغن آفتابگردان یا روغن های گیاهی",
    "normalizedName": "روغن افتابگردان یا روغن های گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن آفتابگردان یا روغن های گیاهی"
    ]
  },
  {
    "id": "ing-d7c22a69",
    "name": "کینوآ",
    "normalizedName": "کینوا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کینوآ"
    ]
  },
  {
    "id": "ing-4d2d4079",
    "name": "روغن گردو",
    "normalizedName": "روغن گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن گردو"
    ]
  },
  {
    "id": "ing-bd2bed17",
    "name": "پسته یا گردو",
    "normalizedName": "پسته یا گردو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پسته یا گردو"
    ]
  },
  {
    "id": "ing-ba7355b0",
    "name": "تمر هندی صاف شده نصف یک  ( 1 لیوان )",
    "normalizedName": "تمر هندی صاف شده نصف یک ( 1 لیوان )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمر هندی صاف شده نصف یک  ( 1 لیوان )"
    ]
  },
  {
    "id": "ing-6c3c6253",
    "name": "رب گوجه فرنگی  غذا خوری",
    "normalizedName": "رب گوجه فرنگی غذا خوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه فرنگی  غذا خوری"
    ]
  },
  {
    "id": "ing-d73818bd",
    "name": "سیب زمینی تازه و کوچک",
    "normalizedName": "سیب زمینی تازه و کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی تازه و کوچک"
    ]
  },
  {
    "id": "ing-bb0173a",
    "name": "مارچوبه یا لوبیا سبز",
    "normalizedName": "مارچوبه یا لوبیا سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارچوبه یا لوبیا سبز"
    ]
  },
  {
    "id": "ing-dbf92f7a",
    "name": "دلستر ساده",
    "normalizedName": "دلستر ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دلستر ساده"
    ]
  },
  {
    "id": "ing-871b639",
    "name": "آب مرغ پخته",
    "normalizedName": "اب مرغ پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب مرغ پخته"
    ]
  },
  {
    "id": "ing-60b2651c",
    "name": "خرده های نان تازه (پودر نان خشک)",
    "normalizedName": "خرده های نان تازه (پودر نان خشک)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرده های نان تازه (پودر نان خشک)"
    ]
  },
  {
    "id": "ing-b4a50763",
    "name": "گوشت راسته ی گوسفند (7 تا 8 دنده داشته باشد)",
    "normalizedName": "گوشت راسته ی گوسفند (7 تا 8 دنده داشته باشد)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت راسته ی گوسفند (7 تا 8 دنده داشته باشد)"
    ]
  },
  {
    "id": "ing-be32da53",
    "name": "سس خردل  سر پُر",
    "normalizedName": "سس خردل سر پُر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس خردل  سر پُر"
    ]
  },
  {
    "id": "ing-67dc5487",
    "name": "نخود فرنگی یخ زده",
    "normalizedName": "نخود فرنگی یخ زده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی یخ زده"
    ]
  },
  {
    "id": "ing-e7fbaf2",
    "name": "آب سبزی پخته",
    "normalizedName": "اب سبزی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب سبزی پخته"
    ]
  },
  {
    "id": "ing-923df96e",
    "name": "فلفل قرمز خشک و پودر شده",
    "normalizedName": "فلفل قرمز خشک و پودر شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز خشک و پودر شده"
    ]
  },
  {
    "id": "ing-ac8974e7",
    "name": "ماست معمولی",
    "normalizedName": "ماست معمولی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست معمولی"
    ]
  },
  {
    "id": "ing-7329e699",
    "name": "نان ریز شده  یا نصف پیمانه",
    "normalizedName": "نان ریز شده یا نصف پیمانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان ریز شده  یا نصف پیمانه"
    ]
  },
  {
    "id": "ing-217d33d8",
    "name": "پنیر پارمیزان یا هر نوع پنیر سفت دیگر",
    "normalizedName": "پنیر پارمیزان یا هر نوع پنیر سفت دیگر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمیزان یا هر نوع پنیر سفت دیگر"
    ]
  },
  {
    "id": "ing-a95cfe30",
    "name": "کره ی بدون نمک و سرد",
    "normalizedName": "کره ی بدون نمک و سرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک و سرد"
    ]
  },
  {
    "id": "ing-eb366cf2",
    "name": "باقالی همراه با غلاف سبز رنگ",
    "normalizedName": "باقالی همراه با غلاف سبز رنگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باقالی همراه با غلاف سبز رنگ"
    ]
  },
  {
    "id": "ing-7f673f2c",
    "name": "فیله سر دست گوسفندی  ای  120 گرم",
    "normalizedName": "فیله سر دست گوسفندی ای 120 گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله سر دست گوسفندی  ای  120 گرم"
    ]
  },
  {
    "id": "ing-96901fe3",
    "name": "خمیر مایه 1 و",
    "normalizedName": "خمیر مایه 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مایه 1 و"
    ]
  },
  {
    "id": "ing-32dd5513",
    "name": "آب 1 و",
    "normalizedName": "اب 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب 1 و"
    ]
  },
  {
    "id": "ing-e5202722",
    "name": "آب حاصل از پخت سبزیجات تند  گرم",
    "normalizedName": "اب حاصل از پخت سبزیجات تند گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب حاصل از پخت سبزیجات تند  گرم"
    ]
  },
  {
    "id": "ing-1f971e0d",
    "name": "نخود آبگوشتی پخته",
    "normalizedName": "نخود ابگوشتی پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود آبگوشتی پخته"
    ]
  },
  {
    "id": "ing-70ac1517",
    "name": "دانه ی انار",
    "normalizedName": "دانه ی انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی انار"
    ]
  },
  {
    "id": "ing-7ed52307",
    "name": "سینه ی مرغ 3 تا",
    "normalizedName": "سینه ی مرغ 3 تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه ی مرغ 3 تا"
    ]
  },
  {
    "id": "ing-70b04288",
    "name": "دانه ی زیره",
    "normalizedName": "دانه ی زیره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ی زیره"
    ]
  },
  {
    "id": "ing-64e7ea7b",
    "name": "سس گوجه طعم دار",
    "normalizedName": "سس گوجه طعم دار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس گوجه طعم دار"
    ]
  },
  {
    "id": "ing-ede8071d",
    "name": "رب گوجه (پوره گوجه )",
    "normalizedName": "رب گوجه (پوره گوجه )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه (پوره گوجه )"
    ]
  },
  {
    "id": "ing-e74c6280",
    "name": "پنیر مزه دار سفت مانند پنیر چدار رسیده",
    "normalizedName": "پنیر مزه دار سفت مانند پنیر چدار رسیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر مزه دار سفت مانند پنیر چدار رسیده"
    ]
  },
  {
    "id": "ing-f708cd1a",
    "name": "خامه ترش 125 تا",
    "normalizedName": "خامه ترش 125 تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه ترش 125 تا"
    ]
  },
  {
    "id": "ing-bc8e8ef",
    "name": "نان تورتیلا 6 تا",
    "normalizedName": "نان تورتیلا 6 تا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان تورتیلا 6 تا"
    ]
  },
  {
    "id": "ing-6e1be1ec",
    "name": "گوشت فیله  (4 قطعه)",
    "normalizedName": "گوشت فیله (4 قطعه)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت فیله  (4 قطعه)"
    ]
  },
  {
    "id": "ing-7b82a8dd",
    "name": "قارج",
    "normalizedName": "قارج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارج"
    ]
  },
  {
    "id": "ing-542f192a",
    "name": "آب گوشت 1 و",
    "normalizedName": "اب گوشت 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوشت 1 و"
    ]
  },
  {
    "id": "ing-61fd0aca",
    "name": "آرد نان پزی سفید",
    "normalizedName": "ارد نان پزی سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد نان پزی سفید"
    ]
  },
  {
    "id": "ing-5f5c0c8a",
    "name": "مرغ درشت پخته شده",
    "normalizedName": "مرغ درشت پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ درشت پخته شده"
    ]
  },
  {
    "id": "ing-ab97afdf",
    "name": "قارچ خرد و سرخ شده",
    "normalizedName": "قارچ خرد و سرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ خرد و سرخ شده"
    ]
  },
  {
    "id": "ing-aa128509",
    "name": "فیله گوشت یا گوشت چرخ کرده",
    "normalizedName": "فیله گوشت یا گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فیله گوشت یا گوشت چرخ کرده"
    ]
  },
  {
    "id": "ing-fb3accfc",
    "name": "مرغ درشت ( بدون چربی و پارگی پوست)",
    "normalizedName": "مرغ درشت ( بدون چربی و پارگی پوست)",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ درشت ( بدون چربی و پارگی پوست)"
    ]
  },
  {
    "id": "ing-f3f72c86",
    "name": "قارچ سفید",
    "normalizedName": "قارچ سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ سفید"
    ]
  },
  {
    "id": "ing-72370c8e",
    "name": "خلال بادام بو داده",
    "normalizedName": "خلال بادام بو داده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال بادام بو داده"
    ]
  },
  {
    "id": "ing-71c3241b",
    "name": "مغز نان باگت (مغز نان در نصف  شیر خیس و نرم شود) 1 عدد",
    "normalizedName": "مغز نان باگت (مغز نان در نصف شیر خیس و نرم شود) 1 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز نان باگت (مغز نان در نصف  شیر خیس و نرم شود) 1 عدد"
    ]
  },
  {
    "id": "ing-efd45fcf",
    "name": "انار ترش دان شده",
    "normalizedName": "انار ترش دان شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انار ترش دان شده"
    ]
  },
  {
    "id": "ing-44dd70f3",
    "name": "کره ی بدون نمک و نرم شده",
    "normalizedName": "کره ی بدون نمک و نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک و نرم شده"
    ]
  },
  {
    "id": "ing-39ea61b6",
    "name": "شربت طلایی",
    "normalizedName": "شربت طلایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت طلایی"
    ]
  },
  {
    "id": "ing-81593dd0",
    "name": "برشتوک برنج",
    "normalizedName": "برشتوک برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برشتوک برنج"
    ]
  },
  {
    "id": "ing-453e5fdf",
    "name": "این کیک فنجانی ساده که نیازی به پخت ندارد سری بسیار خوبی برای آشپزهای جوان است.",
    "normalizedName": "این کیک فنجانی ساده که نیازی به پخت ندارد سری بسیار خوبی برای اشپزهای جوان است.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این کیک فنجانی ساده که نیازی به پخت ندارد سری بسیار خوبی برای آشپزهای جوان است."
    ]
  },
  {
    "id": "ing-d79a94fc",
    "name": "تا 5 روز می توانید آن را در یک ظرف در  نگه داری کنید.",
    "normalizedName": "تا 5 روز می توانید ان را در یک ظرف در نگه داری کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تا 5 روز می توانید آن را در یک ظرف در  نگه داری کنید."
    ]
  },
  {
    "id": "ing-86482512",
    "name": "گوشت فیله",
    "normalizedName": "گوشت فیله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت فیله"
    ]
  },
  {
    "id": "ing-898df8b3",
    "name": "سیر 3 یا",
    "normalizedName": "سیر 3 یا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر 3 یا"
    ]
  },
  {
    "id": "ing-f3e671da",
    "name": "مغز گردو آسیاب شده",
    "normalizedName": "مغز گردو اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو آسیاب شده"
    ]
  },
  {
    "id": "ing-7c44d8c5",
    "name": "گردو  1 و",
    "normalizedName": "گردو 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو  1 و"
    ]
  },
  {
    "id": "ing-100052d1",
    "name": "تمبر هندی",
    "normalizedName": "تمبر هندی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تمبر هندی"
    ]
  },
  {
    "id": "ing-942f3050",
    "name": "آرد کامل گندم",
    "normalizedName": "ارد کامل گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد کامل گندم"
    ]
  },
  {
    "id": "ing-5b039b37",
    "name": "آرد کیک و شیرینی",
    "normalizedName": "ارد کیک و شیرینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد کیک و شیرینی"
    ]
  },
  {
    "id": "ing-79948fc5",
    "name": "قارچ تمیز بدون دم",
    "normalizedName": "قارچ تمیز بدون دم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ تمیز بدون دم"
    ]
  },
  {
    "id": "ing-1aa83792",
    "name": "روغن زیتون یا کانولا",
    "normalizedName": "روغن زیتون یا کانولا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا کانولا"
    ]
  },
  {
    "id": "ing-2075ca40",
    "name": "نمک و فلفل نوک",
    "normalizedName": "نمک و فلفل نوک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل نوک"
    ]
  },
  {
    "id": "ing-eed430c9",
    "name": "تکه های فلفل قرمز",
    "normalizedName": "تکه های فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تکه های فلفل قرمز"
    ]
  },
  {
    "id": "ing-b0f7826",
    "name": "ادویه غذاهای ایتالیایی",
    "normalizedName": "ادویه غذاهای ایتالیایی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه غذاهای ایتالیایی"
    ]
  },
  {
    "id": "ing-a83c2628",
    "name": "فلفل سیاه نصف",
    "normalizedName": "فلفل سیاه نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه نصف"
    ]
  },
  {
    "id": "ing-b5619802",
    "name": "گل کلم بزرگ",
    "normalizedName": "گل کلم بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم بزرگ"
    ]
  },
  {
    "id": "ing-fc93f6a",
    "name": "پونه تازه",
    "normalizedName": "پونه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه تازه"
    ]
  },
  {
    "id": "ing-3a584526",
    "name": "فلفل تند",
    "normalizedName": "فلفل تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل تند"
    ]
  },
  {
    "id": "ing-75c52ddb",
    "name": "نخود سبز پخته شده  1 و",
    "normalizedName": "نخود سبز پخته شده 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود سبز پخته شده  1 و"
    ]
  },
  {
    "id": "ing-ec6df854",
    "name": "گوشت راسته گاو",
    "normalizedName": "گوشت راسته گاو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت راسته گاو"
    ]
  },
  {
    "id": "ing-b15ea4dd",
    "name": "گل کلم کاملا ریز شده",
    "normalizedName": "گل کلم کاملا ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم کاملا ریز شده"
    ]
  },
  {
    "id": "ing-7ab6c977",
    "name": "شکر رژیمی نصف",
    "normalizedName": "شکر رژیمی نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر رژیمی نصف"
    ]
  },
  {
    "id": "ing-77c6ade4",
    "name": "آرد  و 1 لیوان",
    "normalizedName": "ارد و 1 لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد  و 1 لیوان"
    ]
  },
  {
    "id": "ing-edbecc35",
    "name": "جو پرک نصف",
    "normalizedName": "جو پرک نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جو پرک نصف"
    ]
  },
  {
    "id": "ing-a942cc7b",
    "name": "کره آب شده نصف",
    "normalizedName": "کره اب شده نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره آب شده نصف"
    ]
  },
  {
    "id": "ing-8a0dc9d4",
    "name": "آب گوجه نصف",
    "normalizedName": "اب گوجه نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوجه نصف"
    ]
  },
  {
    "id": "ing-6cbdfe3d",
    "name": "پونه خشک شده",
    "normalizedName": "پونه خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه خشک شده"
    ]
  },
  {
    "id": "ing-3235b3b1",
    "name": "سینه مرغ بزرگ",
    "normalizedName": "سینه مرغ بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه مرغ بزرگ"
    ]
  },
  {
    "id": "ing-c29d28a8",
    "name": "روغن زیتون نصف",
    "normalizedName": "روغن زیتون نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون نصف"
    ]
  },
  {
    "id": "ing-34972f90",
    "name": "آب نارنج",
    "normalizedName": "اب نارنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب نارنج"
    ]
  },
  {
    "id": "ing-52f75a76",
    "name": "نمک 1و",
    "normalizedName": "نمک 1و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک 1و"
    ]
  },
  {
    "id": "ing-fbecf4f7",
    "name": "خیار بدون پوست",
    "normalizedName": "خیار بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار بدون پوست"
    ]
  },
  {
    "id": "ing-86549295",
    "name": "گوشت ماهی",
    "normalizedName": "گوشت ماهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ماهی"
    ]
  },
  {
    "id": "ing-71994ace",
    "name": "جلبکها را روی سینی فر بیچینید و به مدت 1 تا 2 دقیقه  کنید.",
    "normalizedName": "جلبکها را روی سینی فر بیچینید و به مدت 1 تا 2 دقیقه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جلبکها را روی سینی فر بیچینید و به مدت 1 تا 2 دقیقه  کنید."
    ]
  },
  {
    "id": "ing-bb974d8",
    "name": "استفاده از مواد درون سوشی و ادویه جات  به سلیقه هر فرد می تواند متفاوت باشد.",
    "normalizedName": "استفاده از مواد درون سوشی و ادویه جات به سلیقه هر فرد می تواند متفاوت باشد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "استفاده از مواد درون سوشی و ادویه جات  به سلیقه هر فرد می تواند متفاوت باشد."
    ]
  },
  {
    "id": "ing-22903d92",
    "name": "فلفل قرمز ریز شده",
    "normalizedName": "فلفل قرمز ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز ریز شده"
    ]
  },
  {
    "id": "ing-c0f64d9c",
    "name": "کرفس ریز شده",
    "normalizedName": "کرفس ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرفس ریز شده"
    ]
  },
  {
    "id": "ing-9df3ac67",
    "name": "شنبلیله خشک",
    "normalizedName": "شنبلیله خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شنبلیله خشک"
    ]
  },
  {
    "id": "ing-96db8351",
    "name": "نخود پخته بدون آب",
    "normalizedName": "نخود پخته بدون اب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود پخته بدون آب"
    ]
  },
  {
    "id": "ing-1194bf68",
    "name": "پیاز قرمزکوچک",
    "normalizedName": "پیاز قرمزکوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز قرمزکوچک"
    ]
  },
  {
    "id": "ing-378ba63e",
    "name": "جعفری  نصف",
    "normalizedName": "جعفری نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری  نصف"
    ]
  },
  {
    "id": "ing-ff207fdc",
    "name": "ماست کم چرب یا بدون چربی",
    "normalizedName": "ماست کم چرب یا بدون چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست کم چرب یا بدون چربی"
    ]
  },
  {
    "id": "ing-8e885a48",
    "name": "شیر 1 و ½",
    "normalizedName": "شیر 1 و ½",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر 1 و ½"
    ]
  },
  {
    "id": "ing-d1dfbc61",
    "name": "وانیل عصاره نعناع یا پودر نعناع ¾ قاشق چایخوری",
    "normalizedName": "وانیل عصاره نعناع یا پودر نعناع ¾ قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل عصاره نعناع یا پودر نعناع ¾ قاشق چایخوری"
    ]
  },
  {
    "id": "ing-a3fbf7",
    "name": "چیپس شکلات ½ رنگ خوراکی سبز رنگ",
    "normalizedName": "چیپس شکلات ½ رنگ خوراکی سبز رنگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلات ½ رنگ خوراکی سبز رنگ"
    ]
  },
  {
    "id": "ing-353c6c38",
    "name": "چوب بستنی",
    "normalizedName": "چوب بستنی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب بستنی"
    ]
  },
  {
    "id": "ing-8adab2bb",
    "name": "کره بادام زمینی نصف",
    "normalizedName": "کره بادام زمینی نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره بادام زمینی نصف"
    ]
  },
  {
    "id": "ing-d438bde",
    "name": "شیر نصف",
    "normalizedName": "شیر نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر نصف"
    ]
  },
  {
    "id": "ing-3cb429ed",
    "name": "شکر قهوه ای یا عسل",
    "normalizedName": "شکر قهوه ای یا عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای یا عسل"
    ]
  },
  {
    "id": "ing-de1c8774",
    "name": "اسفناج  و پخته شده",
    "normalizedName": "اسفناج و پخته شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج  و پخته شده"
    ]
  },
  {
    "id": "ing-62432d25",
    "name": "سبزی سوپ",
    "normalizedName": "سبزی سوپ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی سوپ"
    ]
  },
  {
    "id": "ing-94eed31c",
    "name": "خامه نصف",
    "normalizedName": "خامه نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه نصف"
    ]
  },
  {
    "id": "ing-523e6b29",
    "name": "پودر فلفل قرمز  مربا خوری",
    "normalizedName": "پودر فلفل قرمز مربا خوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل قرمز  مربا خوری"
    ]
  },
  {
    "id": "ing-ca47e73d",
    "name": "زنجبیل  مربا خوری",
    "normalizedName": "زنجبیل مربا خوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زنجبیل  مربا خوری"
    ]
  },
  {
    "id": "ing-65551d44",
    "name": "قارچ ریز شده",
    "normalizedName": "قارچ ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ ریز شده"
    ]
  },
  {
    "id": "ing-d438bde",
    "name": "شیر  نصف",
    "normalizedName": "شیر نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر  نصف"
    ]
  },
  {
    "id": "ing-9420255a",
    "name": "گوشت چرخ کرده  نیم",
    "normalizedName": "گوشت چرخ کرده نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ کرده  نیم"
    ]
  },
  {
    "id": "ing-4624d2e1",
    "name": "پیاز    متوسط",
    "normalizedName": "پیاز متوسط",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز    متوسط"
    ]
  },
  {
    "id": "ing-b88beee9",
    "name": "برنج سفید آبکش شده",
    "normalizedName": "برنج سفید ابکش شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برنج سفید آبکش شده"
    ]
  },
  {
    "id": "ing-80f81d4a",
    "name": "رب گوجه فرنگی   پر",
    "normalizedName": "رب گوجه فرنگی پر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه فرنگی   پر"
    ]
  },
  {
    "id": "ing-fc5743ef",
    "name": "لمون یا لیمو ترش بزرگ",
    "normalizedName": "لمون یا لیمو ترش بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لمون یا لیمو ترش بزرگ"
    ]
  },
  {
    "id": "ing-86239ab9",
    "name": "نمک  چایخوری",
    "normalizedName": "نمک چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک  چایخوری"
    ]
  },
  {
    "id": "ing-6b8fc6ab",
    "name": "ی فیله ها را به مدت 2 تا 4 ساعت در یخچال قرار دهید.",
    "normalizedName": "ی فیله ها را به مدت 2 تا 4 ساعت در یخچال قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ی فیله ها را به مدت 2 تا 4 ساعت در یخچال قرار دهید."
    ]
  },
  {
    "id": "ing-1bea302e",
    "name": "اسفناج  پخته شده  نصف",
    "normalizedName": "اسفناج پخته شده نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسفناج  پخته شده  نصف"
    ]
  },
  {
    "id": "ing-a3f24af7",
    "name": "آب  را به آرامی به خمیر اضافه کنید و خوب آن را ورز دهید تا سفت شود.",
    "normalizedName": "اب را به ارامی به خمیر اضافه کنید و خوب ان را ورز دهید تا سفت شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب  را به آرامی به خمیر اضافه کنید و خوب آن را ورز دهید تا سفت شود."
    ]
  },
  {
    "id": "ing-fc702d80",
    "name": "ضخامت خمیر باید در حد 2 یا  متر باشد",
    "normalizedName": "ضخامت خمیر باید در حد 2 یا متر باشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ضخامت خمیر باید در حد 2 یا  متر باشد"
    ]
  },
  {
    "id": "ing-9831069e",
    "name": "به کمک یک  از مخلوط گوشت بردارید و روی خمیر ها قرار دهید.",
    "normalizedName": "به کمک یک از مخلوط گوشت بردارید و روی خمیر ها قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به کمک یک  از مخلوط گوشت بردارید و روی خمیر ها قرار دهید."
    ]
  },
  {
    "id": "ing-36cfdf27",
    "name": "روغن گیاهی  و 3 قاشق",
    "normalizedName": "روغن گیاهی و 3 قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن گیاهی  و 3 قاشق"
    ]
  },
  {
    "id": "ing-27095116",
    "name": "شیر بدون چربی",
    "normalizedName": "شیر بدون چربی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر بدون چربی"
    ]
  },
  {
    "id": "ing-77d45a4",
    "name": "جوش شیرین نصف",
    "normalizedName": "جوش شیرین نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوش شیرین نصف"
    ]
  },
  {
    "id": "ing-4772985f",
    "name": "روغن باقی مانده را در قالب آهنی کیک پزی بریزید و درون آن پخش کنید",
    "normalizedName": "روغن باقی مانده را در قالب اهنی کیک پزی بریزید و درون ان پخش کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن باقی مانده را در قالب آهنی کیک پزی بریزید و درون آن پخش کنید"
    ]
  },
  {
    "id": "ing-4c075d36",
    "name": "رب آلوچه",
    "normalizedName": "رب الوچه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب آلوچه"
    ]
  },
  {
    "id": "ing-5d9b3d46",
    "name": "آب لیمو ترش یا آب نارنج تازه",
    "normalizedName": "اب لیمو ترش یا اب نارنج تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب لیمو ترش یا آب نارنج تازه"
    ]
  },
  {
    "id": "ing-9e544650",
    "name": "رب آلوچه و  آب به پیاز اضافه و خوب مخلوط کنید تا یکدست شود.",
    "normalizedName": "رب الوچه و اب به پیاز اضافه و خوب مخلوط کنید تا یکدست شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب آلوچه و  آب به پیاز اضافه و خوب مخلوط کنید تا یکدست شود."
    ]
  },
  {
    "id": "ing-2adb949d",
    "name": "مغز گردوی",
    "normalizedName": "مغز گردوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردوی"
    ]
  },
  {
    "id": "ing-f29e681a",
    "name": "آب ولرم را اضافه کنید و با  یا دست مواد را مخلوط کنید تا خمیر خوبی بدست بیاید ( این خمیر بافتی خشک تر از خمیرهای دیگر دارد ).",
    "normalizedName": "اب ولرم را اضافه کنید و با یا دست مواد را مخلوط کنید تا خمیر خوبی بدست بیاید ( این خمیر بافتی خشک تر از خمیرهای دیگر دارد ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ولرم را اضافه کنید و با  یا دست مواد را مخلوط کنید تا خمیر خوبی بدست بیاید ( این خمیر بافتی خشک تر از خمیرهای دیگر دارد )."
    ]
  },
  {
    "id": "ing-65358d8e",
    "name": "شیر بادام",
    "normalizedName": "شیر بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر بادام"
    ]
  },
  {
    "id": "ing-2e8481bc",
    "name": "داخل این شکاف را با پنیر چدار و کالباس پر کنید ( برای هر سینه مرغ  کالباس و 50 گرم پنیر لازم است",
    "normalizedName": "داخل این شکاف را با پنیر چدار و کالباس پر کنید ( برای هر سینه مرغ کالباس و 50 گرم پنیر لازم است",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "داخل این شکاف را با پنیر چدار و کالباس پر کنید ( برای هر سینه مرغ  کالباس و 50 گرم پنیر لازم است"
    ]
  },
  {
    "id": "ing-ab51d539",
    "name": "پودر لیمو عمانی",
    "normalizedName": "پودر لیمو عمانی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر لیمو عمانی"
    ]
  },
  {
    "id": "ing-5a4b1561",
    "name": "سبوس جو",
    "normalizedName": "سبوس جو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبوس جو"
    ]
  },
  {
    "id": "ing-8b6bd8c3",
    "name": "روی کاسه را بپوشانید و 1 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود ( این خمیر بدلیل وجود سبوس نسبت به خمیر نان های دیگر پف کمتری خواهد داشت ).",
    "normalizedName": "روی کاسه را بپوشانید و 1 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود ( این خمیر بدلیل وجود سبوس نسبت به خمیر نان های دیگر پف کمتری خواهد داشت ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روی کاسه را بپوشانید و 1 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود ( این خمیر بدلیل وجود سبوس نسبت به خمیر نان های دیگر پف کمتری خواهد داشت )."
    ]
  },
  {
    "id": "ing-a2d708",
    "name": "خمیر مایه و  شکر داخل کاسه ای بریزید و مخلوط کنید و 5 - 10 دقیقه کناری قرار دهید تا عمل بیاید.",
    "normalizedName": "خمیر مایه و شکر داخل کاسه ای بریزید و مخلوط کنید و 5 - 10 دقیقه کناری قرار دهید تا عمل بیاید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مایه و  شکر داخل کاسه ای بریزید و مخلوط کنید و 5 - 10 دقیقه کناری قرار دهید تا عمل بیاید."
    ]
  },
  {
    "id": "ing-b97b4457",
    "name": "آرد را تا اندازه ای اضافه کنید که خمیر به دست نچسبد ( به دلیل تفاوت کیفیت آردها اغلب  آرد  است )",
    "normalizedName": "ارد را تا اندازه ای اضافه کنید که خمیر به دست نچسبد ( به دلیل تفاوت کیفیت اردها اغلب ارد است )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد را تا اندازه ای اضافه کنید که خمیر به دست نچسبد ( به دلیل تفاوت کیفیت آردها اغلب  آرد  است )"
    ]
  },
  {
    "id": "ing-f33104ef",
    "name": "پس از استراحت و افزایش حجم خمیر روی آن را زرده تخم مرغ یا مقداری زعفران دم کرده بزنید و داخل فری که روشن کرده اید و  شده است قرار دهید تا نان بپزد.",
    "normalizedName": "پس از استراحت و افزایش حجم خمیر روی ان را زرده تخم مرغ یا مقداری زعفران دم کرده بزنید و داخل فری که روشن کرده اید و شده است قرار دهید تا نان بپزد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از استراحت و افزایش حجم خمیر روی آن را زرده تخم مرغ یا مقداری زعفران دم کرده بزنید و داخل فری که روشن کرده اید و  شده است قرار دهید تا نان بپزد."
    ]
  },
  {
    "id": "ing-81901a00",
    "name": "ادویه مرغ",
    "normalizedName": "ادویه مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مرغ"
    ]
  },
  {
    "id": "ing-b5ef5659",
    "name": "بافت و ماندگاری خوبی دارد و میتوانید تا چند روز در یخچال و داخل کیسه فریزر  بندی و نگهداری اش کنید.",
    "normalizedName": "بافت و ماندگاری خوبی دارد و میتوانید تا چند روز در یخچال و داخل کیسه فریزر بندی و نگهداری اش کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بافت و ماندگاری خوبی دارد و میتوانید تا چند روز در یخچال و داخل کیسه فریزر  بندی و نگهداری اش کنید."
    ]
  },
  {
    "id": "ing-d9ac4798",
    "name": "آب  1 و 1/4 لیوان",
    "normalizedName": "اب 1 و 1/4 لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب  1 و 1/4 لیوان"
    ]
  },
  {
    "id": "ing-d0d9d96c",
    "name": "شکر و  آب گرم را داخل کاسه ای بریزید و مخلوط کنید و 5 دقیقه کناری قرار دهید.",
    "normalizedName": "شکر و اب گرم را داخل کاسه ای بریزید و مخلوط کنید و 5 دقیقه کناری قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر و  آب گرم را داخل کاسه ای بریزید و مخلوط کنید و 5 دقیقه کناری قرار دهید."
    ]
  },
  {
    "id": "ing-b56332e1",
    "name": "پخت در پلوپز :  برنج را با 3 لیوان آب و 1/2 قاشق چایخوری نمک داخل پلوپز بریزید",
    "normalizedName": "پخت در پلوپز : برنج را با 3 لیوان اب و 1/2 قاشق چایخوری نمک داخل پلوپز بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پخت در پلوپز :  برنج را با 3 لیوان آب و 1/2 قاشق چایخوری نمک داخل پلوپز بریزید"
    ]
  },
  {
    "id": "ing-29523e84",
    "name": "پنیر  ای 6 عدد",
    "normalizedName": "پنیر ای 6 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر  ای 6 عدد"
    ]
  },
  {
    "id": "ing-679bc414",
    "name": "سس سفید را روی  های پنیر بریزید و خوب پخش کنید",
    "normalizedName": "سس سفید را روی های پنیر بریزید و خوب پخش کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس سفید را روی  های پنیر بریزید و خوب پخش کنید"
    ]
  },
  {
    "id": "ing-41cf5564",
    "name": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است 30 - 40 دقیقه قرار دهید",
    "normalizedName": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است 30 - 40 دقیقه قرار دهید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است 30 - 40 دقیقه قرار دهید"
    ]
  },
  {
    "id": "ing-53acd115",
    "name": "نکته ها : میتوانید به جای پنیر  ای از پنیر موزارلا یا پنیر گودا استفاده کنید",
    "normalizedName": "نکته ها : میتوانید به جای پنیر ای از پنیر موزارلا یا پنیر گودا استفاده کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : میتوانید به جای پنیر  ای از پنیر موزارلا یا پنیر گودا استفاده کنید"
    ]
  },
  {
    "id": "ing-13c0b349",
    "name": "آرد و نمک را مخلوط کنید و کم کم روی مواد الک کنید و با  مخلوط کنید تا خمیر نرمی بدست بیاید که به دست نچسبد",
    "normalizedName": "ارد و نمک را مخلوط کنید و کم کم روی مواد الک کنید و با مخلوط کنید تا خمیر نرمی بدست بیاید که به دست نچسبد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد و نمک را مخلوط کنید و کم کم روی مواد الک کنید و با  مخلوط کنید تا خمیر نرمی بدست بیاید که به دست نچسبد"
    ]
  },
  {
    "id": "ing-634e7123",
    "name": "روی ظرف را بپوشانید و 2 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود.",
    "normalizedName": "روی ظرف را بپوشانید و 2 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روی ظرف را بپوشانید و 2 ساعت در جای ی استراحت دهید تا حجم خمیر بیشتر شود."
    ]
  },
  {
    "id": "ing-16d0eb65",
    "name": "نمک و شکر را اضافه کنید و پس از اینکه مواد مخلوط شدند  باقی مانده آرد را اضافه کنید.",
    "normalizedName": "نمک و شکر را اضافه کنید و پس از اینکه مواد مخلوط شدند باقی مانده ارد را اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و شکر را اضافه کنید و پس از اینکه مواد مخلوط شدند  باقی مانده آرد را اضافه کنید."
    ]
  },
  {
    "id": "ing-6efccce0",
    "name": "نخود فرنگی پخته یا کنسروی",
    "normalizedName": "نخود فرنگی پخته یا کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود فرنگی پخته یا کنسروی"
    ]
  },
  {
    "id": "ing-e9fd5735",
    "name": "نکته ها : اگر میخواهید سالاد را چند ساعت بعد مصرف کنید مواد را داخل ظرف در در یخچال بگذارید و در زمان سرو سس مایونز را اضافه نمایید",
    "normalizedName": "نکته ها : اگر میخواهید سالاد را چند ساعت بعد مصرف کنید مواد را داخل ظرف در در یخچال بگذارید و در زمان سرو سس مایونز را اضافه نمایید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : اگر میخواهید سالاد را چند ساعت بعد مصرف کنید مواد را داخل ظرف در در یخچال بگذارید و در زمان سرو سس مایونز را اضافه نمایید"
    ]
  },
  {
    "id": "ing-5cbe2e31",
    "name": "گوشت قرمز چرخ کرده",
    "normalizedName": "گوشت قرمز چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت قرمز چرخ کرده"
    ]
  },
  {
    "id": "ing-fa07ddbb",
    "name": "گوشت مرغ چرخ کرده",
    "normalizedName": "گوشت مرغ چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ چرخ کرده"
    ]
  },
  {
    "id": "ing-64aa9d17",
    "name": "پوره را در ظرف بریزید و همراه با نان سبوسدار سرو کنید ( میتوانید این پوره را در ظرف در و در یخچال تا چند روز نگهداری کنید ).",
    "normalizedName": "پوره را در ظرف بریزید و همراه با نان سبوسدار سرو کنید ( میتوانید این پوره را در ظرف در و در یخچال تا چند روز نگهداری کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوره را در ظرف بریزید و همراه با نان سبوسدار سرو کنید ( میتوانید این پوره را در ظرف در و در یخچال تا چند روز نگهداری کنید )."
    ]
  },
  {
    "id": "ing-e4da5fbb",
    "name": "پارمزان",
    "normalizedName": "پارمزان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پارمزان"
    ]
  },
  {
    "id": "ing-ef15812e",
    "name": "مراحل کار به همان صورت است و تنها پیش از قرار دادن در فر چند  پنیر موزارلا روی مرغ های سوخاری قرار میگیرد.",
    "normalizedName": "مراحل کار به همان صورت است و تنها پیش از قرار دادن در فر چند پنیر موزارلا روی مرغ های سوخاری قرار میگیرد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مراحل کار به همان صورت است و تنها پیش از قرار دادن در فر چند  پنیر موزارلا روی مرغ های سوخاری قرار میگیرد."
    ]
  },
  {
    "id": "ing-cf291262",
    "name": "روغن زیتون یا کره ذوب شده",
    "normalizedName": "روغن زیتون یا کره ذوب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن زیتون یا کره ذوب شده"
    ]
  },
  {
    "id": "ing-ffa28671",
    "name": "سبزی ریحان",
    "normalizedName": "سبزی ریحان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی ریحان"
    ]
  },
  {
    "id": "ing-d85c60a9",
    "name": "سبزی خشک معطر",
    "normalizedName": "سبزی خشک معطر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی خشک معطر"
    ]
  },
  {
    "id": "ing-3c1b63bc",
    "name": "حرارت را ملایم کنید و پس از اینکه تخم مرغ  شد پنیر را روی کوکو بپاشید و از روی حرارت بردارید",
    "normalizedName": "حرارت را ملایم کنید و پس از اینکه تخم مرغ شد پنیر را روی کوکو بپاشید و از روی حرارت بردارید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حرارت را ملایم کنید و پس از اینکه تخم مرغ  شد پنیر را روی کوکو بپاشید و از روی حرارت بردارید"
    ]
  },
  {
    "id": "ing-46eee94b",
    "name": "برگ اسفناج",
    "normalizedName": "برگ اسفناج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ اسفناج"
    ]
  },
  {
    "id": "ing-fd37a6a",
    "name": "پیاز یا موسیر",
    "normalizedName": "پیاز یا موسیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز یا موسیر"
    ]
  },
  {
    "id": "ing-a94024fd",
    "name": "گوشت فیله گوسفند یا راسته گوساله",
    "normalizedName": "گوشت فیله گوسفند یا راسته گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت فیله گوسفند یا راسته گوساله"
    ]
  },
  {
    "id": "ing-3e4f099f",
    "name": "جوانه عدس یا ماش",
    "normalizedName": "جوانه عدس یا ماش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوانه عدس یا ماش"
    ]
  },
  {
    "id": "ing-9d514537",
    "name": "لوبیا پخته",
    "normalizedName": "لوبیا پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لوبیا پخته"
    ]
  },
  {
    "id": "ing-7530fbe9",
    "name": "میتوانید به جای بکینگ پودر از  بهبود دهنده استفاده کنید.",
    "normalizedName": "میتوانید به جای بکینگ پودر از بهبود دهنده استفاده کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید به جای بکینگ پودر از  بهبود دهنده استفاده کنید."
    ]
  },
  {
    "id": "ing-1d44008d",
    "name": "خمیر ترتیلا",
    "normalizedName": "خمیر ترتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر ترتیلا"
    ]
  },
  {
    "id": "ing-b6153e60",
    "name": "سس پنیر",
    "normalizedName": "سس پنیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس پنیر"
    ]
  },
  {
    "id": "ing-fb5aa912",
    "name": "نان ها را به نوبت داخل ماهیتابه بگذارید تا  شود ( میتوانید از ماکروفر هم برای گرم کردن نان ها استفاده کنید ).",
    "normalizedName": "نان ها را به نوبت داخل ماهیتابه بگذارید تا شود ( میتوانید از ماکروفر هم برای گرم کردن نان ها استفاده کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان ها را به نوبت داخل ماهیتابه بگذارید تا  شود ( میتوانید از ماکروفر هم برای گرم کردن نان ها استفاده کنید )."
    ]
  },
  {
    "id": "ing-60831dda",
    "name": "آب  1 لیوان",
    "normalizedName": "اب 1 لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب  1 لیوان"
    ]
  },
  {
    "id": "ing-52963a5a",
    "name": "پنیر ریکوتا یا خامه ای",
    "normalizedName": "پنیر ریکوتا یا خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا یا خامه ای"
    ]
  },
  {
    "id": "ing-2462ebb9",
    "name": "پودر سوخاری یا خرده نان",
    "normalizedName": "پودر سوخاری یا خرده نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر سوخاری یا خرده نان"
    ]
  },
  {
    "id": "ing-ce733900",
    "name": "برگ کاری",
    "normalizedName": "برگ کاری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ کاری"
    ]
  },
  {
    "id": "ing-717a62d",
    "name": "دانه زیره سبز",
    "normalizedName": "دانه زیره سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه زیره سبز"
    ]
  },
  {
    "id": "ing-5282bbf5",
    "name": "زیره سابیده",
    "normalizedName": "زیره سابیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره سابیده"
    ]
  },
  {
    "id": "ing-df94291e",
    "name": "سرو کنید ( میتوانید به جای ادویه های گفته شده از  ادویه گرام ماسالا استفاده کنید ).",
    "normalizedName": "سرو کنید ( میتوانید به جای ادویه های گفته شده از ادویه گرام ماسالا استفاده کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرو کنید ( میتوانید به جای ادویه های گفته شده از  ادویه گرام ماسالا استفاده کنید )."
    ]
  },
  {
    "id": "ing-37d4414b",
    "name": "خمیر را پهن کنید و به 5 قسمت مساوی تقسیم کنید ( میتوانید با کمک  قالب بزنید ).",
    "normalizedName": "خمیر را پهن کنید و به 5 قسمت مساوی تقسیم کنید ( میتوانید با کمک قالب بزنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر را پهن کنید و به 5 قسمت مساوی تقسیم کنید ( میتوانید با کمک  قالب بزنید )."
    ]
  },
  {
    "id": "ing-8970e25d",
    "name": "داخل کاسه ای دیگر  آرد سوخاری را با 3 قاشق غذاخوری آرد سفید مخلوط کنید ( در صورت تمایل میتوانید مقداری سبزی معطر هم به آرد اضافه کنید ).",
    "normalizedName": "داخل کاسه ای دیگر ارد سوخاری را با 3 قاشق غذاخوری ارد سفید مخلوط کنید ( در صورت تمایل میتوانید مقداری سبزی معطر هم به ارد اضافه کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "داخل کاسه ای دیگر  آرد سوخاری را با 3 قاشق غذاخوری آرد سفید مخلوط کنید ( در صورت تمایل میتوانید مقداری سبزی معطر هم به آرد اضافه کنید )."
    ]
  },
  {
    "id": "ing-44202c86",
    "name": "سس فلفل تند",
    "normalizedName": "سس فلفل تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس فلفل تند"
    ]
  },
  {
    "id": "ing-4dbe5a96",
    "name": "خمیر را با کمک دست ها داخل قالب قرار دهید و روی قالب را بپوشانید و 1 - 2 ساعت در جای ی قرار دهید تا استراحت کند و حجم خمیر 2 برابر شود ( برای جلوگیری از چسبیدن نان به قالب اطراف خمیر را به مقداری آرد آغشته کنید ).",
    "normalizedName": "خمیر را با کمک دست ها داخل قالب قرار دهید و روی قالب را بپوشانید و 1 - 2 ساعت در جای ی قرار دهید تا استراحت کند و حجم خمیر 2 برابر شود ( برای جلوگیری از چسبیدن نان به قالب اطراف خمیر را به مقداری ارد اغشته کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر را با کمک دست ها داخل قالب قرار دهید و روی قالب را بپوشانید و 1 - 2 ساعت در جای ی قرار دهید تا استراحت کند و حجم خمیر 2 برابر شود ( برای جلوگیری از چسبیدن نان به قالب اطراف خمیر را به مقداری آرد آغشته کنید )."
    ]
  },
  {
    "id": "ing-371447c8",
    "name": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 دقیقه قرار دهید تا نان بپزد و آماده شود ( از بوی خوب نان و رنگ طلایی نان میتوانید متوجه پخت آن شوید ).",
    "normalizedName": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 30 دقیقه قرار دهید تا نان بپزد و اماده شود ( از بوی خوب نان و رنگ طلایی نان میتوانید متوجه پخت ان شوید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 دقیقه قرار دهید تا نان بپزد و آماده شود ( از بوی خوب نان و رنگ طلایی نان میتوانید متوجه پخت آن شوید )."
    ]
  },
  {
    "id": "ing-3ae8acd1",
    "name": "ذرت پخته یا کنسروی",
    "normalizedName": "ذرت پخته یا کنسروی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ذرت پخته یا کنسروی"
    ]
  },
  {
    "id": "ing-de68458f",
    "name": "کالباس یا سوسیس",
    "normalizedName": "کالباس یا سوسیس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس یا سوسیس"
    ]
  },
  {
    "id": "ing-d5e70715",
    "name": "سبزی تازه را تمیز کنید و بشویید ( برگ های سبزی را از  جدا کنید )",
    "normalizedName": "سبزی تازه را تمیز کنید و بشویید ( برگ های سبزی را از جدا کنید )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی تازه را تمیز کنید و بشویید ( برگ های سبزی را از  جدا کنید )"
    ]
  },
  {
    "id": "ing-cff17a82",
    "name": "نکته : همچنین میتوانید  های سبزی را جداگانه و با همین روش در ماکروفر خشک کنید اما توجه کنید که بدلیل ضخامت ساقه زمان بیشتری برای خشک شدن لازم است.",
    "normalizedName": "نکته : همچنین میتوانید های سبزی را جداگانه و با همین روش در ماکروفر خشک کنید اما توجه کنید که بدلیل ضخامت ساقه زمان بیشتری برای خشک شدن لازم است.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته : همچنین میتوانید  های سبزی را جداگانه و با همین روش در ماکروفر خشک کنید اما توجه کنید که بدلیل ضخامت ساقه زمان بیشتری برای خشک شدن لازم است."
    ]
  },
  {
    "id": "ing-be500b4",
    "name": "گوشت سر دست گوسفند",
    "normalizedName": "گوشت سر دست گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت سر دست گوسفند"
    ]
  },
  {
    "id": "ing-7b2bb0e3",
    "name": "دنبه",
    "normalizedName": "دنبه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دنبه"
    ]
  },
  {
    "id": "ing-ba75b5da",
    "name": "جگر سفید گوسفند",
    "normalizedName": "جگر سفید گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جگر سفید گوسفند"
    ]
  },
  {
    "id": "ing-60d43ca0",
    "name": "پاستای مدادی",
    "normalizedName": "پاستای مدادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پاستای مدادی"
    ]
  },
  {
    "id": "ing-36e905d6",
    "name": "سینه بوقلمون",
    "normalizedName": "سینه بوقلمون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینه بوقلمون"
    ]
  },
  {
    "id": "ing-360a876a",
    "name": "رب گوجه فرنگی یا سس قرمز",
    "normalizedName": "رب گوجه فرنگی یا سس قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب گوجه فرنگی یا سس قرمز"
    ]
  },
  {
    "id": "ing-d00e2b51",
    "name": "پس از این مدت زمان ظرف را از فر خارج کنید و پوشش المینیومی را بردارید و مجدد به مدت 30 - 40 دقیقه داخل فر قرار دهید تا گوشت بوقلمون طلایی شود ( در این مرحله  اب داخل ظرف بریزید تا رطوبت در ته ظرف موجب سوختن سبزیجات نشود ).",
    "normalizedName": "پس از این مدت زمان ظرف را از فر خارج کنید و پوشش المینیومی را بردارید و مجدد به مدت 30 - 40 دقیقه داخل فر قرار دهید تا گوشت بوقلمون طلایی شود ( در این مرحله اب داخل ظرف بریزید تا رطوبت در ته ظرف موجب سوختن سبزیجات نشود ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از این مدت زمان ظرف را از فر خارج کنید و پوشش المینیومی را بردارید و مجدد به مدت 30 - 40 دقیقه داخل فر قرار دهید تا گوشت بوقلمون طلایی شود ( در این مرحله  اب داخل ظرف بریزید تا رطوبت در ته ظرف موجب سوختن سبزیجات نشود )."
    ]
  },
  {
    "id": "ing-34252938",
    "name": "قارچ دکمه ای",
    "normalizedName": "قارچ دکمه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قارچ دکمه ای"
    ]
  },
  {
    "id": "ing-b30a8260",
    "name": "جعفری و گشنیز  از هر کدام",
    "normalizedName": "جعفری و گشنیز از هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری و گشنیز  از هر کدام"
    ]
  },
  {
    "id": "ing-318f6be7",
    "name": "گشنیز و جعفری",
    "normalizedName": "گشنیز و جعفری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گشنیز و جعفری"
    ]
  },
  {
    "id": "ing-31a3a3ab",
    "name": "گوشت ران گوسفند یا گوساله",
    "normalizedName": "گوشت ران گوسفند یا گوساله",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت ران گوسفند یا گوساله"
    ]
  },
  {
    "id": "ing-4c291344",
    "name": "نکته : میتوانید در صورت تمایل به جای عصاره انار از  آب انار غلیظ استفاده کنید ؛ همچنین اگر گیاهخوار نیستید میتوانید تکه های مرغ پخته را مانند سیب زمینی خرد کنید و به خوراک اضافه نمایید.",
    "normalizedName": "نکته : میتوانید در صورت تمایل به جای عصاره انار از اب انار غلیظ استفاده کنید ؛ همچنین اگر گیاهخوار نیستید میتوانید تکه های مرغ پخته را مانند سیب زمینی خرد کنید و به خوراک اضافه نمایید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته : میتوانید در صورت تمایل به جای عصاره انار از  آب انار غلیظ استفاده کنید ؛ همچنین اگر گیاهخوار نیستید میتوانید تکه های مرغ پخته را مانند سیب زمینی خرد کنید و به خوراک اضافه نمایید."
    ]
  },
  {
    "id": "ing-b5518957",
    "name": "گل کلم سفید",
    "normalizedName": "گل کلم سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل کلم سفید"
    ]
  },
  {
    "id": "ing-487f0409",
    "name": "آرد گندم 1 و نیم",
    "normalizedName": "ارد گندم 1 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم 1 و نیم"
    ]
  },
  {
    "id": "ing-5a550a93",
    "name": "روی ظرف حوله ای مرطوب قرار دهید و به مدت 1 - 2 ساعت در جای ی بگذارید تا حجم خمیر 2 برابر شود ( خمیر در ابتدا کمی چسبنده است اما پس از مدت زمان و افزایش حجم نرم خواهد شد ).",
    "normalizedName": "روی ظرف حوله ای مرطوب قرار دهید و به مدت 1 - 2 ساعت در جای ی بگذارید تا حجم خمیر 2 برابر شود ( خمیر در ابتدا کمی چسبنده است اما پس از مدت زمان و افزایش حجم نرم خواهد شد ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روی ظرف حوله ای مرطوب قرار دهید و به مدت 1 - 2 ساعت در جای ی بگذارید تا حجم خمیر 2 برابر شود ( خمیر در ابتدا کمی چسبنده است اما پس از مدت زمان و افزایش حجم نرم خواهد شد )."
    ]
  },
  {
    "id": "ing-de9d9eba",
    "name": "سبزی معطر ( جعفری یا گشنیز )",
    "normalizedName": "سبزی معطر ( جعفری یا گشنیز )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر ( جعفری یا گشنیز )"
    ]
  },
  {
    "id": "ing-61090128",
    "name": "آرد  3 و نیم",
    "normalizedName": "ارد 3 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد  3 و نیم"
    ]
  },
  {
    "id": "ing-a366bef1",
    "name": "پس از اینکه تکه های کره کمی با آرد مخلوط شد چند  آب سرد اضافه و مخلوط کنید تا مواد ترکیب شوند و حالت خرده نان به خود بگیرند.",
    "normalizedName": "پس از اینکه تکه های کره کمی با ارد مخلوط شد چند اب سرد اضافه و مخلوط کنید تا مواد ترکیب شوند و حالت خرده نان به خود بگیرند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از اینکه تکه های کره کمی با آرد مخلوط شد چند  آب سرد اضافه و مخلوط کنید تا مواد ترکیب شوند و حالت خرده نان به خود بگیرند."
    ]
  },
  {
    "id": "ing-a2b24dde",
    "name": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 - 45 دقیقه ( بسته به نوع فر ) قرار دهید تا نان بپزد.",
    "normalizedName": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 30 - 45 دقیقه ( بسته به نوع فر ) قرار دهید تا نان بپزد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 - 45 دقیقه ( بسته به نوع فر ) قرار دهید تا نان بپزد."
    ]
  },
  {
    "id": "ing-a6bf86d7",
    "name": "هویج پخته",
    "normalizedName": "هویج پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج پخته"
    ]
  },
  {
    "id": "ing-39e067b2",
    "name": "سرکه بالزامیک و روغن زیتون هر کدام",
    "normalizedName": "سرکه بالزامیک و روغن زیتون هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه بالزامیک و روغن زیتون هر کدام"
    ]
  },
  {
    "id": "ing-f7b2f152",
    "name": "خمیر نان باگت یا نان",
    "normalizedName": "خمیر نان باگت یا نان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر نان باگت یا نان"
    ]
  },
  {
    "id": "ing-585002bf",
    "name": "شکر 1 و نیم",
    "normalizedName": "شکر 1 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر 1 و نیم"
    ]
  },
  {
    "id": "ing-dabbde85",
    "name": "شکر رژیمی",
    "normalizedName": "شکر رژیمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر رژیمی"
    ]
  },
  {
    "id": "ing-7a5b4abf",
    "name": "بکینگ پودر 1 و نیم",
    "normalizedName": "بکینگ پودر 1 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بکینگ پودر 1 و نیم"
    ]
  },
  {
    "id": "ing-663b4f20",
    "name": "قالب را چرب کنید و مایه کیک شکلاتی را در قالب بریزید و داخل فری که از قبل با دمای 170 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید.",
    "normalizedName": "قالب را چرب کنید و مایه کیک شکلاتی را در قالب بریزید و داخل فری که از قبل با دمای 170 درجه سانتیگراد روشن کرده اید و شده است به مدت 15 - 20 دقیقه قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را چرب کنید و مایه کیک شکلاتی را در قالب بریزید و داخل فری که از قبل با دمای 170 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید."
    ]
  },
  {
    "id": "ing-e14d4744",
    "name": "نخود خیس خورده",
    "normalizedName": "نخود خیس خورده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخود خیس خورده"
    ]
  },
  {
    "id": "ing-8fe9568f",
    "name": "پیازچه یا پیاز",
    "normalizedName": "پیازچه یا پیاز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه یا پیاز"
    ]
  },
  {
    "id": "ing-eb62f1f1",
    "name": "نکته ها : در صورتی که مایه کوفته کمی شل است میتوانید  آرد گندم یا آرد سوخاری به آن اضافه کنید",
    "normalizedName": "نکته ها : در صورتی که مایه کوفته کمی شل است میتوانید ارد گندم یا ارد سوخاری به ان اضافه کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : در صورتی که مایه کوفته کمی شل است میتوانید  آرد گندم یا آرد سوخاری به آن اضافه کنید"
    ]
  },
  {
    "id": "ing-9fbcb14c",
    "name": "خمیر مایه 1 و نیم",
    "normalizedName": "خمیر مایه 1 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر مایه 1 و نیم"
    ]
  },
  {
    "id": "ing-e1309cb8",
    "name": "با  به صورت گرد خمیر را قالب بزنید ( برای هر عروسک 2 عدد خمیر گرد نیاز است ).",
    "normalizedName": "با به صورت گرد خمیر را قالب بزنید ( برای هر عروسک 2 عدد خمیر گرد نیاز است ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با  به صورت گرد خمیر را قالب بزنید ( برای هر عروسک 2 عدد خمیر گرد نیاز است )."
    ]
  },
  {
    "id": "ing-ce5a53ab",
    "name": "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و  شده است قرار دهید تا روی نان ها طلایی شود.",
    "normalizedName": "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و شده است قرار دهید تا روی نان ها طلایی شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و  شده است قرار دهید تا روی نان ها طلایی شود."
    ]
  },
  {
    "id": "ing-d4b95d5",
    "name": "شیر 1 و",
    "normalizedName": "شیر 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر 1 و"
    ]
  },
  {
    "id": "ing-b433be7f",
    "name": "خامه مخلوط با عسل",
    "normalizedName": "خامه مخلوط با عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه مخلوط با عسل"
    ]
  },
  {
    "id": "ing-e02e6441",
    "name": "پودر یا اسانس وانیل",
    "normalizedName": "پودر یا اسانس وانیل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر یا اسانس وانیل"
    ]
  },
  {
    "id": "ing-ee9cbe2",
    "name": "وانیل و  ارد نیز اضافه نمایید و خوب مخلوط کنید.",
    "normalizedName": "وانیل و ارد نیز اضافه نمایید و خوب مخلوط کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل و  ارد نیز اضافه نمایید و خوب مخلوط کنید."
    ]
  },
  {
    "id": "ing-7b69dc2b",
    "name": "پس از این مدت سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 دقیقه قرار دهید",
    "normalizedName": "پس از این مدت سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 30 دقیقه قرار دهید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از این مدت سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 30 دقیقه قرار دهید"
    ]
  },
  {
    "id": "ing-aa067750",
    "name": "نکته ها : به جای خرده نان میتوانید از نصف  آرد سوخاری استفاده کنید و شیر را نیز حذف کنید.",
    "normalizedName": "نکته ها : به جای خرده نان میتوانید از نصف ارد سوخاری استفاده کنید و شیر را نیز حذف کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : به جای خرده نان میتوانید از نصف  آرد سوخاری استفاده کنید و شیر را نیز حذف کنید."
    ]
  },
  {
    "id": "ing-fef91376",
    "name": "آب گوشت یا مرغ",
    "normalizedName": "اب گوشت یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوشت یا مرغ"
    ]
  },
  {
    "id": "ing-60dccc2d",
    "name": "خورشت قیمه آماده",
    "normalizedName": "خورشت قیمه اماده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خورشت قیمه آماده"
    ]
  },
  {
    "id": "ing-ffc36b76",
    "name": "زیتون سبز",
    "normalizedName": "زیتون سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیتون سبز"
    ]
  },
  {
    "id": "ing-61e7b6c",
    "name": "سرکه و روغن زیتون هر کدام",
    "normalizedName": "سرکه و روغن زیتون هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه و روغن زیتون هر کدام"
    ]
  },
  {
    "id": "ing-1ca66a46",
    "name": "گوشت آبگوشتی",
    "normalizedName": "گوشت ابگوشتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت آبگوشتی"
    ]
  },
  {
    "id": "ing-51c9033e",
    "name": "در صورت تمایل میتوانید  سیب زمینی در زمان پخت به این آبگوشت اضافه کنید همچنین میتوانید بادمجان ها را سرخ کنید و پس از کوبیدن اضافه نمایید.",
    "normalizedName": "در صورت تمایل میتوانید سیب زمینی در زمان پخت به این ابگوشت اضافه کنید همچنین میتوانید بادمجان ها را سرخ کنید و پس از کوبیدن اضافه نمایید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در صورت تمایل میتوانید  سیب زمینی در زمان پخت به این آبگوشت اضافه کنید همچنین میتوانید بادمجان ها را سرخ کنید و پس از کوبیدن اضافه نمایید."
    ]
  },
  {
    "id": "ing-8b438fd5",
    "name": "تخم مرغ 2-",
    "normalizedName": "تخم مرغ 2-",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ 2-"
    ]
  },
  {
    "id": "ing-b30672d5",
    "name": "حدود 1- از مایه قارچ در میان مایه کتلت بریزید و از اطراف با دست مایه کتلت را جمع کنید ( دقت کنید مایه قارچ به بیرون نفوذ نکند )",
    "normalizedName": "حدود 1- از مایه قارچ در میان مایه کتلت بریزید و از اطراف با دست مایه کتلت را جمع کنید ( دقت کنید مایه قارچ به بیرون نفوذ نکند )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حدود 1- از مایه قارچ در میان مایه کتلت بریزید و از اطراف با دست مایه کتلت را جمع کنید ( دقت کنید مایه قارچ به بیرون نفوذ نکند )"
    ]
  },
  {
    "id": "ing-532a7ee",
    "name": "در مدت زمانی که خمیرها سرخ میشوند با  در جهت های مختلف برگردانید تا تمام سطح خمیرها یکدست سرخ و برشته شود.",
    "normalizedName": "در مدت زمانی که خمیرها سرخ میشوند با در جهت های مختلف برگردانید تا تمام سطح خمیرها یکدست سرخ و برشته شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در مدت زمانی که خمیرها سرخ میشوند با  در جهت های مختلف برگردانید تا تمام سطح خمیرها یکدست سرخ و برشته شود."
    ]
  },
  {
    "id": "ing-cd7442c2",
    "name": "آرد را  قاشق به این مخلوط اضافه کنید و هم بزنید",
    "normalizedName": "ارد را قاشق به این مخلوط اضافه کنید و هم بزنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد را  قاشق به این مخلوط اضافه کنید و هم بزنید"
    ]
  },
  {
    "id": "ing-aea9bd93",
    "name": "کلم بروکلی کوچک",
    "normalizedName": "کلم بروکلی کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم بروکلی کوچک"
    ]
  },
  {
    "id": "ing-10fcb243",
    "name": "پنیر ریکوتا نصف",
    "normalizedName": "پنیر ریکوتا نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر ریکوتا نصف"
    ]
  },
  {
    "id": "ing-fcb0f397",
    "name": "کلم قمری",
    "normalizedName": "کلم قمری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم قمری"
    ]
  },
  {
    "id": "ing-77f47029",
    "name": "سبزی ( شوید.تره.ترخان.ریحان )",
    "normalizedName": "سبزی ( شوید.تره.ترخان.ریحان )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی ( شوید.تره.ترخان.ریحان )"
    ]
  },
  {
    "id": "ing-97a94cc4",
    "name": "زردچوبه و 1- آب بپزید تا نرم شوند ( آب کلم باید تمام شود ).",
    "normalizedName": "زردچوبه و 1- اب بپزید تا نرم شوند ( اب کلم باید تمام شود ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زردچوبه و 1- آب بپزید تا نرم شوند ( آب کلم باید تمام شود )."
    ]
  },
  {
    "id": "ing-410cc4a0",
    "name": "آب ولرم نصف",
    "normalizedName": "اب ولرم نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ولرم نصف"
    ]
  },
  {
    "id": "ing-9fd33e1e",
    "name": "خلال پسته نصف",
    "normalizedName": "خلال پسته نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خلال پسته نصف"
    ]
  },
  {
    "id": "ing-16872589",
    "name": "پنیر پیتزا  ای 6 عدد",
    "normalizedName": "پنیر پیتزا ای 6 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا  ای 6 عدد"
    ]
  },
  {
    "id": "ing-6c070529",
    "name": "فلفل دلمه ای سبز یا زرد",
    "normalizedName": "فلفل دلمه ای سبز یا زرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای سبز یا زرد"
    ]
  },
  {
    "id": "ing-59e2026c",
    "name": "دلیل استفاده از چوب دارچین بجای پودر دارچین به این علت است که رنگ خورش تیره نشود ؛ در صورت تمایل میتوانید چند  لیمو عمانی همراه با اضافه کردن خلال بادام اضافه کنید.",
    "normalizedName": "دلیل استفاده از چوب دارچین بجای پودر دارچین به این علت است که رنگ خورش تیره نشود ؛ در صورت تمایل میتوانید چند لیمو عمانی همراه با اضافه کردن خلال بادام اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دلیل استفاده از چوب دارچین بجای پودر دارچین به این علت است که رنگ خورش تیره نشود ؛ در صورت تمایل میتوانید چند  لیمو عمانی همراه با اضافه کردن خلال بادام اضافه کنید."
    ]
  },
  {
    "id": "ing-7070edfc",
    "name": "آرد گندم  سرخالی",
    "normalizedName": "ارد گندم سرخالی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم  سرخالی"
    ]
  },
  {
    "id": "ing-7073aa84",
    "name": "کردن شیر و غذا توسط فرهای مایکروویو این مزیت را دارد که به قند و پروتئین موجود آنها آسیب نمیرسد و همچنین ویتامین‌ها نیز کمتر از‌بین می‌روند؛ در عین حال مدت زمان طبخ غذا در فرهای مایکروویو کوتاه است.",
    "normalizedName": "کردن شیر و غذا توسط فرهای مایکروویو این مزیت را دارد که به قند و پروتئین موجود انها اسیب نمیرسد و همچنین ویتامین ها نیز کمتر از بین می روند؛ در عین حال مدت زمان طبخ غذا در فرهای مایکروویو کوتاه است.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کردن شیر و غذا توسط فرهای مایکروویو این مزیت را دارد که به قند و پروتئین موجود آنها آسیب نمیرسد و همچنین ویتامین‌ها نیز کمتر از‌بین می‌روند؛ در عین حال مدت زمان طبخ غذا در فرهای مایکروویو کوتاه است."
    ]
  },
  {
    "id": "ing-f276f5aa",
    "name": "» امواج مایکروویو قادرند در بافت‌های بدن انسان نیز مانند مواد غذایی تولید ا کنند که در این صورت باعث سوختگی میشوند.",
    "normalizedName": "» امواج مایکروویو قادرند در بافت های بدن انسان نیز مانند مواد غذایی تولید ا کنند که در این صورت باعث سوختگی میشوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "» امواج مایکروویو قادرند در بافت‌های بدن انسان نیز مانند مواد غذایی تولید ا کنند که در این صورت باعث سوختگی میشوند."
    ]
  },
  {
    "id": "ing-abc489da",
    "name": "» عدسی چشم‌ها به ا حساسند و پرتوگیری دائم از مایکروویو میتوانند سبب آب مروارید گردد.",
    "normalizedName": "» عدسی چشم ها به ا حساسند و پرتوگیری دائم از مایکروویو میتوانند سبب اب مروارید گردد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "» عدسی چشم‌ها به ا حساسند و پرتوگیری دائم از مایکروویو میتوانند سبب آب مروارید گردد."
    ]
  },
  {
    "id": "ing-727ce9bf",
    "name": "خمیر یوفکا را از  بندی خارج کنید و روی سطح خمیر کره اب شده بزنید",
    "normalizedName": "خمیر یوفکا را از بندی خارج کنید و روی سطح خمیر کره اب شده بزنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر یوفکا را از  بندی خارج کنید و روی سطح خمیر کره اب شده بزنید"
    ]
  },
  {
    "id": "ing-c62a3833",
    "name": "خمیر آماده را درون کاسه ای که چرب کرده اید به مدت 1 ساعت در جای ی استراحت دهید تا حجم خمیر 2 برابر شود.",
    "normalizedName": "خمیر اماده را درون کاسه ای که چرب کرده اید به مدت 1 ساعت در جای ی استراحت دهید تا حجم خمیر 2 برابر شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر آماده را درون کاسه ای که چرب کرده اید به مدت 1 ساعت در جای ی استراحت دهید تا حجم خمیر 2 برابر شود."
    ]
  },
  {
    "id": "ing-53652bf7",
    "name": "سرکه قرمز یا سفید",
    "normalizedName": "سرکه قرمز یا سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سرکه قرمز یا سفید"
    ]
  },
  {
    "id": "ing-9312804b",
    "name": "خیار چمبر",
    "normalizedName": "خیار چمبر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار چمبر"
    ]
  },
  {
    "id": "ing-1f5deb31",
    "name": "نان خشک",
    "normalizedName": "نان خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان خشک"
    ]
  },
  {
    "id": "ing-3a56b224",
    "name": "پیاز و سیرها را خرد کنید و در روغن با مقداری نمک و فلفل تفت دهید تا طلایی شوند",
    "normalizedName": "پیاز و سیرها را خرد کنید و در روغن با مقداری نمک و فلفل تفت دهید تا طلایی شوند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز و سیرها را خرد کنید و در روغن با مقداری نمک و فلفل تفت دهید تا طلایی شوند"
    ]
  },
  {
    "id": "ing-1f833298",
    "name": "پیاز و 4 حبه سیر را خرد کنید",
    "normalizedName": "پیاز و 4 حبه سیر را خرد کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز و 4 حبه سیر را خرد کنید"
    ]
  },
  {
    "id": "ing-fdbb85ab",
    "name": "برای مصارف دیگری به غیر از نان تافتون مقدار روغنی که به خمیر اضافه میکنید باید 3 برابر باشد ( برای این مقدار مواد  لازم است ).",
    "normalizedName": "برای مصارف دیگری به غیر از نان تافتون مقدار روغنی که به خمیر اضافه میکنید باید 3 برابر باشد ( برای این مقدار مواد لازم است ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای مصارف دیگری به غیر از نان تافتون مقدار روغنی که به خمیر اضافه میکنید باید 3 برابر باشد ( برای این مقدار مواد  لازم است )."
    ]
  },
  {
    "id": "ing-207e9552",
    "name": "پس از به جوش آمدن حرارت را کم کنید و چند  سرکه سفید به آب در حال جوشیدن اضافه کنید.",
    "normalizedName": "پس از به جوش امدن حرارت را کم کنید و چند سرکه سفید به اب در حال جوشیدن اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از به جوش آمدن حرارت را کم کنید و چند  سرکه سفید به آب در حال جوشیدن اضافه کنید."
    ]
  },
  {
    "id": "ing-42c686b0",
    "name": "نکته ها : در این اش میتواند از انواع سبزی های مخصوص اش استفاده کنید اما سبزی هایی که در شمال برای این اش استفاده میشود عبارتند از : ( اسفناج  + تره 100 گرم + گشنیز 100 گرم + جعفری 100 گرم ).",
    "normalizedName": "نکته ها : در این اش میتواند از انواع سبزی های مخصوص اش استفاده کنید اما سبزی هایی که در شمال برای این اش استفاده میشود عبارتند از : ( اسفناج + تره 100 گرم + گشنیز 100 گرم + جعفری 100 گرم ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : در این اش میتواند از انواع سبزی های مخصوص اش استفاده کنید اما سبزی هایی که در شمال برای این اش استفاده میشود عبارتند از : ( اسفناج  + تره 100 گرم + گشنیز 100 گرم + جعفری 100 گرم )."
    ]
  },
  {
    "id": "ing-ff5145a9",
    "name": "سبزی خورشت",
    "normalizedName": "سبزی خورشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی خورشت"
    ]
  },
  {
    "id": "ing-8cb6793d",
    "name": "سماق و نمک اضافه کنید و با حرارت ملایم به مدت 10-15 دقیقه تفت دهید تا رنگ مرغ ها تغییر کند.",
    "normalizedName": "سماق و نمک اضافه کنید و با حرارت ملایم به مدت 10-15 دقیقه تفت دهید تا رنگ مرغ ها تغییر کند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سماق و نمک اضافه کنید و با حرارت ملایم به مدت 10-15 دقیقه تفت دهید تا رنگ مرغ ها تغییر کند."
    ]
  },
  {
    "id": "ing-154647f2",
    "name": "پس از تغییر رنگ مرغ ها میتوانید لوبیاها را بهمراه  اب اضافه کنید",
    "normalizedName": "پس از تغییر رنگ مرغ ها میتوانید لوبیاها را بهمراه اب اضافه کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از تغییر رنگ مرغ ها میتوانید لوبیاها را بهمراه  اب اضافه کنید"
    ]
  },
  {
    "id": "ing-ac4612bf",
    "name": "پس از 2 ساعت و زمانی که لوبیاها نرم شدند میتوانید سبزی ها تفت خورده را بهمراه ابغوره و غوره ها و  باقی مانده سماق را اضافه کنید",
    "normalizedName": "پس از 2 ساعت و زمانی که لوبیاها نرم شدند میتوانید سبزی ها تفت خورده را بهمراه ابغوره و غوره ها و باقی مانده سماق را اضافه کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از 2 ساعت و زمانی که لوبیاها نرم شدند میتوانید سبزی ها تفت خورده را بهمراه ابغوره و غوره ها و  باقی مانده سماق را اضافه کنید"
    ]
  },
  {
    "id": "ing-d3560ef5",
    "name": "خمیر آماده را داخل کاسه ای که چرب کرده اید قرار دهید و مجدد روی ظرف را بپوشانید و به مدت 2 ساعت در جای ی قرار دهید.",
    "normalizedName": "خمیر اماده را داخل کاسه ای که چرب کرده اید قرار دهید و مجدد روی ظرف را بپوشانید و به مدت 2 ساعت در جای ی قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر آماده را داخل کاسه ای که چرب کرده اید قرار دهید و مجدد روی ظرف را بپوشانید و به مدت 2 ساعت در جای ی قرار دهید."
    ]
  },
  {
    "id": "ing-6141bdde",
    "name": "پنیر چدار یا موزارلا",
    "normalizedName": "پنیر چدار یا موزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار یا موزارلا"
    ]
  },
  {
    "id": "ing-3e0bea91",
    "name": "گوشت کوبیده",
    "normalizedName": "گوشت کوبیده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت کوبیده"
    ]
  },
  {
    "id": "ing-91a7f8c3",
    "name": "پس از داغ شدن روغن  از مایه کوکو بردارید و درون تابه بریزید و به همین صورت تمام تابه را از تکه های کوکو پر کنید و با حرارت ملایم بگذارید سرخ شود.",
    "normalizedName": "پس از داغ شدن روغن از مایه کوکو بردارید و درون تابه بریزید و به همین صورت تمام تابه را از تکه های کوکو پر کنید و با حرارت ملایم بگذارید سرخ شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از داغ شدن روغن  از مایه کوکو بردارید و درون تابه بریزید و به همین صورت تمام تابه را از تکه های کوکو پر کنید و با حرارت ملایم بگذارید سرخ شود."
    ]
  },
  {
    "id": "ing-752977c2",
    "name": "مقدار تخم مرغی که اضافه میکند باید به اندازه باشد ( نه زیاد شل و نه زیاد سفت ) ؛ همینکه با  بتوانید راحت از مایه بردارید یعنی مقدار تخم مرغ  میباشد",
    "normalizedName": "مقدار تخم مرغی که اضافه میکند باید به اندازه باشد ( نه زیاد شل و نه زیاد سفت ) ؛ همینکه با بتوانید راحت از مایه بردارید یعنی مقدار تخم مرغ میباشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مقدار تخم مرغی که اضافه میکند باید به اندازه باشد ( نه زیاد شل و نه زیاد سفت ) ؛ همینکه با  بتوانید راحت از مایه بردارید یعنی مقدار تخم مرغ  میباشد"
    ]
  },
  {
    "id": "ing-86247e81",
    "name": "گوشت پخته",
    "normalizedName": "گوشت پخته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت پخته"
    ]
  },
  {
    "id": "ing-a2e7469b",
    "name": "کره ی بدون نمک نرم شده",
    "normalizedName": "کره ی بدون نمک نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ی بدون نمک نرم شده"
    ]
  },
  {
    "id": "ing-f0225652",
    "name": "پنیر پارمیزان",
    "normalizedName": "پنیر پارمیزان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پارمیزان"
    ]
  },
  {
    "id": "ing-920a53b9",
    "name": "پودر فلفل قرمز یا پاپریکای تند",
    "normalizedName": "پودر فلفل قرمز یا پاپریکای تند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فلفل قرمز یا پاپریکای تند"
    ]
  },
  {
    "id": "ing-7b306a2a",
    "name": "بلال",
    "normalizedName": "بلال",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بلال"
    ]
  },
  {
    "id": "ing-fecd1bbb",
    "name": "ماست یونانی غلیظ",
    "normalizedName": "ماست یونانی غلیظ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست یونانی غلیظ"
    ]
  },
  {
    "id": "ing-20025547",
    "name": "فندق  و بوداده",
    "normalizedName": "فندق و بوداده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فندق  و بوداده"
    ]
  },
  {
    "id": "ing-aa582aa7",
    "name": "ادویه گرام ماسالا",
    "normalizedName": "ادویه گرام ماسالا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه گرام ماسالا"
    ]
  },
  {
    "id": "ing-65554c04",
    "name": "با  گوشت بادمجان ها را در آورده و در کاسه ی غذا ساز بریزید.",
    "normalizedName": "با گوشت بادمجان ها را در اورده و در کاسه ی غذا ساز بریزید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با  گوشت بادمجان ها را در آورده و در کاسه ی غذا ساز بریزید."
    ]
  },
  {
    "id": "ing-377e299d",
    "name": "گلبرگ درشت گل محمدی",
    "normalizedName": "گلبرگ درشت گل محمدی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلبرگ درشت گل محمدی"
    ]
  },
  {
    "id": "ing-9cf19e4e",
    "name": "آرد سفید  سرخالی",
    "normalizedName": "ارد سفید سرخالی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید  سرخالی"
    ]
  },
  {
    "id": "ing-2c7a65cd",
    "name": "قرص مرغ",
    "normalizedName": "قرص مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قرص مرغ"
    ]
  },
  {
    "id": "ing-8a0fdb6d",
    "name": "پیاز ریز",
    "normalizedName": "پیاز ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز ریز"
    ]
  },
  {
    "id": "ing-7acf86d6",
    "name": "گوشت مرغ پخته شده چرخ شده",
    "normalizedName": "گوشت مرغ پخته شده چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ پخته شده چرخ شده"
    ]
  },
  {
    "id": "ing-9bad9be3",
    "name": "آب  و 2 قاشق",
    "normalizedName": "اب و 2 قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب  و 2 قاشق"
    ]
  },
  {
    "id": "ing-88bc302d",
    "name": "آب روی آن بریزید و آن را مداوم هم بزنید تا شکر ذوب شده و کاراملی رنگ شود.",
    "normalizedName": "اب روی ان بریزید و ان را مداوم هم بزنید تا شکر ذوب شده و کاراملی رنگ شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب روی آن بریزید و آن را مداوم هم بزنید تا شکر ذوب شده و کاراملی رنگ شود."
    ]
  },
  {
    "id": "ing-57cb5330",
    "name": "با  سس مایونز باقی مانده کیک را بپوشانید و با مواد  آن را کنید.",
    "normalizedName": "با سس مایونز باقی مانده کیک را بپوشانید و با مواد ان را کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با  سس مایونز باقی مانده کیک را بپوشانید و با مواد  آن را کنید."
    ]
  },
  {
    "id": "ing-1d06c8e0",
    "name": "پوست لیمو ترش",
    "normalizedName": "پوست لیمو ترش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پوست لیمو ترش"
    ]
  },
  {
    "id": "ing-30e19673",
    "name": "رازیانه تازه",
    "normalizedName": "رازیانه تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رازیانه تازه"
    ]
  },
  {
    "id": "ing-3882867b",
    "name": "گیاه رازیانه از گیاهان مفید در مناطق سیر است که خاصیت ضد تشنج و ضد التهاب دارد و برای دوران شیر دهی زنان بسیار مفید است.",
    "normalizedName": "گیاه رازیانه از گیاهان مفید در مناطق سیر است که خاصیت ضد تشنج و ضد التهاب دارد و برای دوران شیر دهی زنان بسیار مفید است.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیاه رازیانه از گیاهان مفید در مناطق سیر است که خاصیت ضد تشنج و ضد التهاب دارد و برای دوران شیر دهی زنان بسیار مفید است."
    ]
  },
  {
    "id": "ing-da5379fe",
    "name": "نان خشک ریز یا آسیاب شده",
    "normalizedName": "نان خشک ریز یا اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان خشک ریز یا آسیاب شده"
    ]
  },
  {
    "id": "ing-cc4fd14c",
    "name": "پیاز  کوچک",
    "normalizedName": "پیاز کوچک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیاز  کوچک"
    ]
  },
  {
    "id": "ing-82766f59",
    "name": "پونه تازه ریز شده",
    "normalizedName": "پونه تازه ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پونه تازه ریز شده"
    ]
  },
  {
    "id": "ing-37c946a7",
    "name": "جعفری تازه ریز شده",
    "normalizedName": "جعفری تازه ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جعفری تازه ریز شده"
    ]
  },
  {
    "id": "ing-83806adf",
    "name": "ریحان تازه ریز شده",
    "normalizedName": "ریحان تازه ریز شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریحان تازه ریز شده"
    ]
  },
  {
    "id": "ing-21a04323",
    "name": "پودر خردل 2 و",
    "normalizedName": "پودر خردل 2 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر خردل 2 و"
    ]
  },
  {
    "id": "ing-24077648",
    "name": "فلفل دلمه ای خشک شده",
    "normalizedName": "فلفل دلمه ای خشک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای خشک شده"
    ]
  },
  {
    "id": "ing-a8530463",
    "name": "فلفل سیاه 1 و",
    "normalizedName": "فلفل سیاه 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه 1 و"
    ]
  },
  {
    "id": "ing-6747610d",
    "name": "فلفل سفید 1 و",
    "normalizedName": "فلفل سفید 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سفید 1 و"
    ]
  },
  {
    "id": "ing-a212cc85",
    "name": "پودر برگ بو 1 و  چایخوی",
    "normalizedName": "پودر برگ بو 1 و چایخوی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر برگ بو 1 و  چایخوی"
    ]
  },
  {
    "id": "ing-b5f73d05",
    "name": "سس کچاب",
    "normalizedName": "سس کچاب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس کچاب"
    ]
  },
  {
    "id": "ing-489093ad",
    "name": "سس قرمز فلفلی",
    "normalizedName": "سس قرمز فلفلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس قرمز فلفلی"
    ]
  },
  {
    "id": "ing-721e2347",
    "name": "فلفل دلمه ای قرمز بزرگ",
    "normalizedName": "فلفل دلمه ای قرمز بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای قرمز بزرگ"
    ]
  },
  {
    "id": "ing-e2324eca",
    "name": "فلفل دلمه ای سبز بزرگ",
    "normalizedName": "فلفل دلمه ای سبز بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل دلمه ای سبز بزرگ"
    ]
  },
  {
    "id": "ing-898df8b3",
    "name": "سیر  3 یا",
    "normalizedName": "سیر 3 یا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیر  3 یا"
    ]
  },
  {
    "id": "ing-5307e89a",
    "name": "کلم پیچ سفید نصف",
    "normalizedName": "کلم پیچ سفید نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کلم پیچ سفید نصف"
    ]
  },
  {
    "id": "ing-7b4b1864",
    "name": "مرزه",
    "normalizedName": "مرزه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرزه"
    ]
  },
  {
    "id": "ing-d5452f8a",
    "name": "گیشنیز",
    "normalizedName": "گیشنیز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیشنیز"
    ]
  },
  {
    "id": "ing-abd5246a",
    "name": "رزماری خشک",
    "normalizedName": "رزماری خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رزماری خشک"
    ]
  },
  {
    "id": "ing-5ebfa4e6",
    "name": "نان سوخاری آسیاب شده",
    "normalizedName": "نان سوخاری اسیاب شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان سوخاری آسیاب شده"
    ]
  },
  {
    "id": "ing-e04be9f",
    "name": "پنیر پیتزا نصف",
    "normalizedName": "پنیر پیتزا نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پیتزا نصف"
    ]
  },
  {
    "id": "ing-e74e46d9",
    "name": "نان باگت گرد",
    "normalizedName": "نان باگت گرد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان باگت گرد"
    ]
  },
  {
    "id": "ing-3583e04d",
    "name": "نان باگت گرد یا نان همبرگر را از وسط برش بزنید و بخش قهوه ای رنگ نان ها را جدا کنید ( میتوانید از نان تست هم استفاده کنید و با  روی نان قالب بزنید و جدا کنید ).",
    "normalizedName": "نان باگت گرد یا نان همبرگر را از وسط برش بزنید و بخش قهوه ای رنگ نان ها را جدا کنید ( میتوانید از نان تست هم استفاده کنید و با روی نان قالب بزنید و جدا کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان باگت گرد یا نان همبرگر را از وسط برش بزنید و بخش قهوه ای رنگ نان ها را جدا کنید ( میتوانید از نان تست هم استفاده کنید و با  روی نان قالب بزنید و جدا کنید )."
    ]
  },
  {
    "id": "ing-aa7b9541",
    "name": "در طول پخت کف روی مربا را با  بردارید ).",
    "normalizedName": "در طول پخت کف روی مربا را با بردارید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در طول پخت کف روی مربا را با  بردارید )."
    ]
  },
  {
    "id": "ing-fb428f5f",
    "name": "در اواسط پخت  پودر ژلاتین که در آب جوش حل کرده اید و کمی اسانس وانیل به آن اضافه کنید.",
    "normalizedName": "در اواسط پخت پودر ژلاتین که در اب جوش حل کرده اید و کمی اسانس وانیل به ان اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در اواسط پخت  پودر ژلاتین که در آب جوش حل کرده اید و کمی اسانس وانیل به آن اضافه کنید."
    ]
  },
  {
    "id": "ing-6cacf41c",
    "name": "توت سفید",
    "normalizedName": "توت سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "توت سفید"
    ]
  },
  {
    "id": "ing-8541d28",
    "name": "در اواسط پخت نیز  پودر ژلاتین که در آب جوش حل کرده اید به آن اضافه کنید.",
    "normalizedName": "در اواسط پخت نیز پودر ژلاتین که در اب جوش حل کرده اید به ان اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در اواسط پخت نیز  پودر ژلاتین که در آب جوش حل کرده اید به آن اضافه کنید."
    ]
  },
  {
    "id": "ing-eb997054",
    "name": "هوموس",
    "normalizedName": "هوموس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هوموس"
    ]
  },
  {
    "id": "ing-369e1eef",
    "name": "نان ترتیلا یا نان لواش",
    "normalizedName": "نان ترتیلا یا نان لواش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان ترتیلا یا نان لواش"
    ]
  },
  {
    "id": "ing-ac898afc",
    "name": "به همین صورت تمام نان ها را آماده کنید و هر رول را به صورت جداگانه داخل نایلون  بندی کنید و 1 ساعت داخل یخچال استراحت دهید ( میتوانید بگذارید 1 شب داخل یخچال بماند ).",
    "normalizedName": "به همین صورت تمام نان ها را اماده کنید و هر رول را به صورت جداگانه داخل نایلون بندی کنید و 1 ساعت داخل یخچال استراحت دهید ( میتوانید بگذارید 1 شب داخل یخچال بماند ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به همین صورت تمام نان ها را آماده کنید و هر رول را به صورت جداگانه داخل نایلون  بندی کنید و 1 ساعت داخل یخچال استراحت دهید ( میتوانید بگذارید 1 شب داخل یخچال بماند )."
    ]
  },
  {
    "id": "ing-d6e66c67",
    "name": "دقت کنید که  به اندازه فلفل ها مقدار مواد میتواند کمتر یا بیشتر شود.",
    "normalizedName": "دقت کنید که به اندازه فلفل ها مقدار مواد میتواند کمتر یا بیشتر شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دقت کنید که  به اندازه فلفل ها مقدار مواد میتواند کمتر یا بیشتر شود."
    ]
  },
  {
    "id": "ing-5e7de283",
    "name": "هویج )",
    "normalizedName": "هویج )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "هویج )"
    ]
  },
  {
    "id": "ing-1a9b23dc",
    "name": "پنیر چدار یا پنیر پیتزا",
    "normalizedName": "پنیر چدار یا پنیر پیتزا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر چدار یا پنیر پیتزا"
    ]
  },
  {
    "id": "ing-f40168e8",
    "name": "خمیر پفکی را آماده کنید و با  به شکل گرد قالب بزنید",
    "normalizedName": "خمیر پفکی را اماده کنید و با به شکل گرد قالب بزنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر پفکی را آماده کنید و با  به شکل گرد قالب بزنید"
    ]
  },
  {
    "id": "ing-257d8d24",
    "name": "گردو یا بادام زمینی",
    "normalizedName": "گردو یا بادام زمینی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو یا بادام زمینی"
    ]
  },
  {
    "id": "ing-b7ffd01",
    "name": "لبو",
    "normalizedName": "لبو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو"
    ]
  },
  {
    "id": "ing-21c7dfc0",
    "name": "سینی تارت ها را داخل فری که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید",
    "normalizedName": "سینی تارت ها را داخل فری که از قبل روشن کرده اید و شده است به مدت 15 - 20 دقیقه قرار دهید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی تارت ها را داخل فری که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید"
    ]
  },
  {
    "id": "ing-ec31070b",
    "name": "پس از اینکه خمیر تارت طلایی شد از فر خارج کنید و  سرو نمایید.",
    "normalizedName": "پس از اینکه خمیر تارت طلایی شد از فر خارج کنید و سرو نمایید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از اینکه خمیر تارت طلایی شد از فر خارج کنید و  سرو نمایید."
    ]
  },
  {
    "id": "ing-8bb07776",
    "name": "برای تنوری شدن سیب زمینی ها 1 ساعت زمان لازم است (  به اندازه سیب زمینی ها و نوع فر این زمان ممکن است کمی بیشتر شود )",
    "normalizedName": "برای تنوری شدن سیب زمینی ها 1 ساعت زمان لازم است ( به اندازه سیب زمینی ها و نوع فر این زمان ممکن است کمی بیشتر شود )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای تنوری شدن سیب زمینی ها 1 ساعت زمان لازم است (  به اندازه سیب زمینی ها و نوع فر این زمان ممکن است کمی بیشتر شود )"
    ]
  },
  {
    "id": "ing-36b2d75f",
    "name": "نکته ها : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند",
    "normalizedName": "نکته ها : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : هیچگاه از ی که خوب تمیز نشده برای هم زدن مربا استفاده نکنید چون موجب میشود مربا زود کپک بزند"
    ]
  },
  {
    "id": "ing-cd0b8470",
    "name": "برای اطلاع از قوام آمدن مربا مقداری از شربت را در ی بریزید",
    "normalizedName": "برای اطلاع از قوام امدن مربا مقداری از شربت را در ی بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای اطلاع از قوام آمدن مربا مقداری از شربت را در ی بریزید"
    ]
  },
  {
    "id": "ing-5064c724",
    "name": "پنیر خامه ای یا گودا",
    "normalizedName": "پنیر خامه ای یا گودا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر خامه ای یا گودا"
    ]
  },
  {
    "id": "ing-ca7a59b5",
    "name": "روغن جامد یا کره",
    "normalizedName": "روغن جامد یا کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن جامد یا کره"
    ]
  },
  {
    "id": "ing-90bee9ea",
    "name": "پودر گل سرخ",
    "normalizedName": "پودر گل سرخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گل سرخ"
    ]
  },
  {
    "id": "ing-32a619a9",
    "name": "آرتیشو",
    "normalizedName": "ارتیشو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرتیشو"
    ]
  },
  {
    "id": "ing-e1053f50",
    "name": "تره )",
    "normalizedName": "تره )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تره )"
    ]
  },
  {
    "id": "ing-d9a80493",
    "name": "رب آلوچه یا رب انار",
    "normalizedName": "رب الوچه یا رب انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رب آلوچه یا رب انار"
    ]
  },
  {
    "id": "ing-9190d9cb",
    "name": "نکته ها : دقت کنید که ظرف ترشی و پیازها پیش از آماده سازی کاملا خشک باشند چون رطوبت موجب کپک زدن ترشی میشود ؛ هرگونه ا یا نور خورشید موجب خراب شدن ترشی شما خواهد شد",
    "normalizedName": "نکته ها : دقت کنید که ظرف ترشی و پیازها پیش از اماده سازی کاملا خشک باشند چون رطوبت موجب کپک زدن ترشی میشود ؛ هرگونه ا یا نور خورشید موجب خراب شدن ترشی شما خواهد شد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : دقت کنید که ظرف ترشی و پیازها پیش از آماده سازی کاملا خشک باشند چون رطوبت موجب کپک زدن ترشی میشود ؛ هرگونه ا یا نور خورشید موجب خراب شدن ترشی شما خواهد شد"
    ]
  },
  {
    "id": "ing-26c762a3",
    "name": "فلفل سبز یا فلفل قرمز",
    "normalizedName": "فلفل سبز یا فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سبز یا فلفل قرمز"
    ]
  },
  {
    "id": "ing-171c9f86",
    "name": "پودر مخمر فوری",
    "normalizedName": "پودر مخمر فوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر مخمر فوری"
    ]
  },
  {
    "id": "ing-ebf3f0e4",
    "name": "نصف آرد را با پودر مخمر مخلوط و به شیر  اضافه کنید و با همزن دستی چند دقیقه بزنید تا مواد خوب ترکیب شوند و خمیر نرم و کشداری بدست بیاید.",
    "normalizedName": "نصف ارد را با پودر مخمر مخلوط و به شیر اضافه کنید و با همزن دستی چند دقیقه بزنید تا مواد خوب ترکیب شوند و خمیر نرم و کشداری بدست بیاید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نصف آرد را با پودر مخمر مخلوط و به شیر  اضافه کنید و با همزن دستی چند دقیقه بزنید تا مواد خوب ترکیب شوند و خمیر نرم و کشداری بدست بیاید."
    ]
  },
  {
    "id": "ing-a5c475ff",
    "name": "نصف دیگر آرد را کم کم به مواد اضافه کنید تا خمیر خوبی بدست بیاید که به دست تان نچسبد ( ممکن است چند  بیشتر آرد لازم باشد ).",
    "normalizedName": "نصف دیگر ارد را کم کم به مواد اضافه کنید تا خمیر خوبی بدست بیاید که به دست تان نچسبد ( ممکن است چند بیشتر ارد لازم باشد ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نصف دیگر آرد را کم کم به مواد اضافه کنید تا خمیر خوبی بدست بیاید که به دست تان نچسبد ( ممکن است چند  بیشتر آرد لازم باشد )."
    ]
  },
  {
    "id": "ing-fe61f68e",
    "name": "ماست چکیده یا پر چرب",
    "normalizedName": "ماست چکیده یا پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست چکیده یا پر چرب"
    ]
  },
  {
    "id": "ing-f28a2914",
    "name": "قالب های تارت را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 – 10 دقیقه قرار دهید تا لبه های تارت طلایی و پنیر آب شود",
    "normalizedName": "قالب های تارت را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 15 – 10 دقیقه قرار دهید تا لبه های تارت طلایی و پنیر اب شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب های تارت را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 – 10 دقیقه قرار دهید تا لبه های تارت طلایی و پنیر آب شود"
    ]
  },
  {
    "id": "ing-4b9b1be5",
    "name": "سوسیس یا ژامبون",
    "normalizedName": "سوسیس یا ژامبون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سوسیس یا ژامبون"
    ]
  },
  {
    "id": "ing-90279645",
    "name": "پنیر موزارلا یا پنیر پیتزای",
    "normalizedName": "پنیر موزارلا یا پنیر پیتزای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر موزارلا یا پنیر پیتزای"
    ]
  },
  {
    "id": "ing-673439ea",
    "name": "های قارچ را از کلاه آن جدا و خرد کنید.",
    "normalizedName": "های قارچ را از کلاه ان جدا و خرد کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "های قارچ را از کلاه آن جدا و خرد کنید."
    ]
  },
  {
    "id": "ing-563a3f66",
    "name": "گیلاس قرمز یا سیاه",
    "normalizedName": "گیلاس قرمز یا سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گیلاس قرمز یا سیاه"
    ]
  },
  {
    "id": "ing-92f90936",
    "name": "داخل پارچ آب جوش بریزید و چند  نمک اضافه کنید و هم بزنید تا خوب مخلوط شود",
    "normalizedName": "داخل پارچ اب جوش بریزید و چند نمک اضافه کنید و هم بزنید تا خوب مخلوط شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "داخل پارچ آب جوش بریزید و چند  نمک اضافه کنید و هم بزنید تا خوب مخلوط شود"
    ]
  },
  {
    "id": "ing-c8e06126",
    "name": "بهار نارنج",
    "normalizedName": "بهار نارنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بهار نارنج"
    ]
  },
  {
    "id": "ing-d6c51f5f",
    "name": "برگ های تازه اسفناج",
    "normalizedName": "برگ های تازه اسفناج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ های تازه اسفناج"
    ]
  },
  {
    "id": "ing-7d706997",
    "name": "گلبرگ گل محمدی صورتی",
    "normalizedName": "گلبرگ گل محمدی صورتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلبرگ گل محمدی صورتی"
    ]
  },
  {
    "id": "ing-d4abe355",
    "name": "پنیر پرورده یا خامه ای",
    "normalizedName": "پنیر پرورده یا خامه ای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پنیر پرورده یا خامه ای"
    ]
  },
  {
    "id": "ing-4ca1e7f8",
    "name": "پرتقال زینتی کامکوات",
    "normalizedName": "پرتقال زینتی کامکوات",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پرتقال زینتی کامکوات"
    ]
  },
  {
    "id": "ing-27fcc0d5",
    "name": "مربای پوست پرتقال آماده را در ظرف در بریزید و دخل یخچال قرار دهید تا خنک شود",
    "normalizedName": "مربای پوست پرتقال اماده را در ظرف در بریزید و دخل یخچال قرار دهید تا خنک شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربای پوست پرتقال آماده را در ظرف در بریزید و دخل یخچال قرار دهید تا خنک شود"
    ]
  },
  {
    "id": "ing-9d6e0ec3",
    "name": "لیمو شیرین",
    "normalizedName": "لیمو شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لیمو شیرین"
    ]
  },
  {
    "id": "ing-6e668aae",
    "name": "داخل کاسه ای چند  آب بریزید و لیموهای  را داخل آب بریزید و تا روز بعد داخل یخچال قرار دهید ( خیساندن لیمو برای از بین بردن تلخی پوست ان میباشد ).",
    "normalizedName": "داخل کاسه ای چند اب بریزید و لیموهای را داخل اب بریزید و تا روز بعد داخل یخچال قرار دهید ( خیساندن لیمو برای از بین بردن تلخی پوست ان میباشد ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "داخل کاسه ای چند  آب بریزید و لیموهای  را داخل آب بریزید و تا روز بعد داخل یخچال قرار دهید ( خیساندن لیمو برای از بین بردن تلخی پوست ان میباشد )."
    ]
  },
  {
    "id": "ing-aa7ed69a",
    "name": "سبزی معطر",
    "normalizedName": "سبزی معطر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر"
    ]
  },
  {
    "id": "ing-3ae94225",
    "name": "لبو  بزرگ",
    "normalizedName": "لبو بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لبو  بزرگ"
    ]
  },
  {
    "id": "ing-ecf0e503",
    "name": "ترب سفید  بزرگ",
    "normalizedName": "ترب سفید بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ترب سفید  بزرگ"
    ]
  },
  {
    "id": "ing-3a582e56",
    "name": "فلفل خشک",
    "normalizedName": "فلفل خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل خشک"
    ]
  },
  {
    "id": "ing-6f5d7dc6",
    "name": "به سلیقه تان میتوانید حلقه های نازک یا ضخیم از گوجه فرنگی ببرید.",
    "normalizedName": "به سلیقه تان میتوانید حلقه های نازک یا ضخیم از گوجه فرنگی ببرید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به سلیقه تان میتوانید حلقه های نازک یا ضخیم از گوجه فرنگی ببرید."
    ]
  },
  {
    "id": "ing-b5f6232f",
    "name": "نان لواش یا نان ترتیلا",
    "normalizedName": "نان لواش یا نان ترتیلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نان لواش یا نان ترتیلا"
    ]
  },
  {
    "id": "ing-4b53ca00",
    "name": "کالباس یا ژامبون  بزرگ",
    "normalizedName": "کالباس یا ژامبون بزرگ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کالباس یا ژامبون  بزرگ"
    ]
  },
  {
    "id": "ing-e516d44f",
    "name": "پیازچه   .پنیر پیتزا مقدار لازم",
    "normalizedName": "پیازچه .پنیر پیتزا مقدار لازم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پیازچه   .پنیر پیتزا مقدار لازم"
    ]
  },
  {
    "id": "ing-fd198fa0",
    "name": "مواد تارت را داخل قالب ها بریزید و روی مواد را با پنیر  ای یا پنیر  خوب پوشش دهید ( میتوانید از انواع پنیر استفاده کنید ).",
    "normalizedName": "مواد تارت را داخل قالب ها بریزید و روی مواد را با پنیر ای یا پنیر خوب پوشش دهید ( میتوانید از انواع پنیر استفاده کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مواد تارت را داخل قالب ها بریزید و روی مواد را با پنیر  ای یا پنیر  خوب پوشش دهید ( میتوانید از انواع پنیر استفاده کنید )."
    ]
  },
  {
    "id": "ing-3b518505",
    "name": "تارت ها را درون فری که از قبل با حرارت 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 - 10 دقیقه قرار دهید تا بپزند",
    "normalizedName": "تارت ها را درون فری که از قبل با حرارت 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 15 - 10 دقیقه قرار دهید تا بپزند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تارت ها را درون فری که از قبل با حرارت 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 15 - 10 دقیقه قرار دهید تا بپزند"
    ]
  },
  {
    "id": "ing-4887f321",
    "name": "قالب را در فر با درجه حرارت 180 درجه سانتیگراد به مدت 10 - 15 دقیقه قرار دهید تا نان ها طلایی و تخم مرغ ها  شوند",
    "normalizedName": "قالب را در فر با درجه حرارت 180 درجه سانتیگراد به مدت 10 - 15 دقیقه قرار دهید تا نان ها طلایی و تخم مرغ ها شوند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را در فر با درجه حرارت 180 درجه سانتیگراد به مدت 10 - 15 دقیقه قرار دهید تا نان ها طلایی و تخم مرغ ها  شوند"
    ]
  },
  {
    "id": "ing-e2325655",
    "name": "انجیر",
    "normalizedName": "انجیر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "انجیر"
    ]
  },
  {
    "id": "ing-9135bad0",
    "name": "شکر 1 و",
    "normalizedName": "شکر 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر 1 و"
    ]
  },
  {
    "id": "ing-ed0b87",
    "name": "بالنگ درشت",
    "normalizedName": "بالنگ درشت",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بالنگ درشت"
    ]
  },
  {
    "id": "ing-3885afe3",
    "name": "زرشک تازه",
    "normalizedName": "زرشک تازه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرشک تازه"
    ]
  },
  {
    "id": "ing-11089609",
    "name": "شکر  و 300 گرم",
    "normalizedName": "شکر و 300 گرم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر  و 300 گرم"
    ]
  },
  {
    "id": "ing-8660e35d",
    "name": "زرشک های تمیز و ابکشی شده را درون ظرفی بریزید و حدود  از شکرها را لابلای زرشک ها بپاشید و به مدت 5 ساعت درون یخچال قرار دهید تا زرشک ها اب بیندازد.",
    "normalizedName": "زرشک های تمیز و ابکشی شده را درون ظرفی بریزید و حدود از شکرها را لابلای زرشک ها بپاشید و به مدت 5 ساعت درون یخچال قرار دهید تا زرشک ها اب بیندازد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زرشک های تمیز و ابکشی شده را درون ظرفی بریزید و حدود  از شکرها را لابلای زرشک ها بپاشید و به مدت 5 ساعت درون یخچال قرار دهید تا زرشک ها اب بیندازد."
    ]
  },
  {
    "id": "ing-deecd565",
    "name": "از مقدار شکر گفته شده میتوانید  را حذف کنید و تنها 1 کیلوگرم شکر استفاده کنید که این بستگی به سلیقه شما دارد",
    "normalizedName": "از مقدار شکر گفته شده میتوانید را حذف کنید و تنها 1 کیلوگرم شکر استفاده کنید که این بستگی به سلیقه شما دارد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "از مقدار شکر گفته شده میتوانید  را حذف کنید و تنها 1 کیلوگرم شکر استفاده کنید که این بستگی به سلیقه شما دارد"
    ]
  },
  {
    "id": "ing-86a33173",
    "name": "نشانه قوام آمدن مربا : مقداری از شربت را در ی بریزید",
    "normalizedName": "نشانه قوام امدن مربا : مقداری از شربت را در ی بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشانه قوام آمدن مربا : مقداری از شربت را در ی بریزید"
    ]
  },
  {
    "id": "ing-f7a70e2c",
    "name": "میتوانید در صورت تمایل  نمک همزمان با ماست اضافه کنید.",
    "normalizedName": "میتوانید در صورت تمایل نمک همزمان با ماست اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید در صورت تمایل  نمک همزمان با ماست اضافه کنید."
    ]
  },
  {
    "id": "ing-75b0ac38",
    "name": "سبزی معطر ( ترخان.مزره.نعناع.شوید )",
    "normalizedName": "سبزی معطر ( ترخان.مزره.نعناع.شوید )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر ( ترخان.مزره.نعناع.شوید )"
    ]
  },
  {
    "id": "ing-c4a01231",
    "name": "سبزی مخصوص دلمه ( نعنا.مرزه.ترخون.پیازچه.شوید.جعفری )",
    "normalizedName": "سبزی مخصوص دلمه ( نعنا.مرزه.ترخون.پیازچه.شوید.جعفری )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی مخصوص دلمه ( نعنا.مرزه.ترخون.پیازچه.شوید.جعفری )"
    ]
  },
  {
    "id": "ing-4baacdf6",
    "name": "لپه باقلا",
    "normalizedName": "لپه باقلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "لپه باقلا"
    ]
  },
  {
    "id": "ing-a8794399",
    "name": "گوشت چرخ شده",
    "normalizedName": "گوشت چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ شده"
    ]
  },
  {
    "id": "ing-8ea76b4d",
    "name": "برگ موها را بشوئید ؛ برگ مو را به پشت کف دست تان قرار دهید ( مواد داخل قسمت پشت برگ ریخته میشود ) درون هر برگ مو را یک  یا بیشتر از مخلوط مواد بریزید و ارام بپیچید تا مواد خوب مخفی شوند",
    "normalizedName": "برگ موها را بشوئید ؛ برگ مو را به پشت کف دست تان قرار دهید ( مواد داخل قسمت پشت برگ ریخته میشود ) درون هر برگ مو را یک یا بیشتر از مخلوط مواد بریزید و ارام بپیچید تا مواد خوب مخفی شوند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برگ موها را بشوئید ؛ برگ مو را به پشت کف دست تان قرار دهید ( مواد داخل قسمت پشت برگ ریخته میشود ) درون هر برگ مو را یک  یا بیشتر از مخلوط مواد بریزید و ارام بپیچید تا مواد خوب مخفی شوند"
    ]
  },
  {
    "id": "ing-b5d8ef49",
    "name": "پودر گلپر",
    "normalizedName": "پودر گلپر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر گلپر"
    ]
  },
  {
    "id": "ing-b8b49d83",
    "name": "پودر رازیانه",
    "normalizedName": "پودر رازیانه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر رازیانه"
    ]
  },
  {
    "id": "ing-fdc9aceb",
    "name": "سبزی معطر ( مرزه.ترخون.گشنیز.نعناع )",
    "normalizedName": "سبزی معطر ( مرزه.ترخون.گشنیز.نعناع )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی معطر ( مرزه.ترخون.گشنیز.نعناع )"
    ]
  },
  {
    "id": "ing-a0d4bdeb",
    "name": "جوز هندی  + اَنیسون یا بادیان 3 عدد + فلفل سیاه 2 قاشق چایخوری",
    "normalizedName": "جوز هندی + اَنیسون یا بادیان 3 عدد + فلفل سیاه 2 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "جوز هندی  + اَنیسون یا بادیان 3 عدد + فلفل سیاه 2 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-7859304a",
    "name": "زیره سبز  + زردچوبه 3 قاشق چایخوری + هل 3 قاشق چایخوری",
    "normalizedName": "زیره سبز + زردچوبه 3 قاشق چایخوری + هل 3 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیره سبز  + زردچوبه 3 قاشق چایخوری + هل 3 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-556b40bd",
    "name": "فلفل قرمز یا پاپریکا   + رازیانه 2 قاشق چایخوری + برگ بو 5 عدد",
    "normalizedName": "فلفل قرمز یا پاپریکا + رازیانه 2 قاشق چایخوری + برگ بو 5 عدد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل قرمز یا پاپریکا   + رازیانه 2 قاشق چایخوری + برگ بو 5 عدد"
    ]
  },
  {
    "id": "ing-5c2e42a8",
    "name": "میخک  + دارچین 3 قاشق چایخوری + زیره سیاه 2 قاشق چایخوری",
    "normalizedName": "میخک + دارچین 3 قاشق چایخوری + زیره سیاه 2 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میخک  + دارچین 3 قاشق چایخوری + زیره سیاه 2 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-b99d461a",
    "name": "گل سرخ  + زنجبیل 1 قاشق چایخوری + تخم گشنیز 3 قاشق چایخوری",
    "normalizedName": "گل سرخ + زنجبیل 1 قاشق چایخوری + تخم گشنیز 3 قاشق چایخوری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گل سرخ  + زنجبیل 1 قاشق چایخوری + تخم گشنیز 3 قاشق چایخوری"
    ]
  },
  {
    "id": "ing-9f9bfccf",
    "name": "کرفس 1 دسته",
    "normalizedName": "کرفس 1 دسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرفس 1 دسته"
    ]
  },
  {
    "id": "ing-91e44560",
    "name": "سیب زمینی ترشی",
    "normalizedName": "سیب زمینی ترشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی ترشی"
    ]
  },
  {
    "id": "ing-2b3b9298",
    "name": "خیار سبز",
    "normalizedName": "خیار سبز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار سبز"
    ]
  },
  {
    "id": "ing-e3739e93",
    "name": "خیار شور ریز",
    "normalizedName": "خیار شور ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار شور ریز"
    ]
  },
  {
    "id": "ing-cb4e1c0f",
    "name": "سیب زمینی ترشی نیم",
    "normalizedName": "سیب زمینی ترشی نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب زمینی ترشی نیم"
    ]
  },
  {
    "id": "ing-77e9e36e",
    "name": "ادویه مخصوص ترشی",
    "normalizedName": "ادویه مخصوص ترشی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ادویه مخصوص ترشی"
    ]
  },
  {
    "id": "ing-79562d05",
    "name": "آب گوجه فرنگی غلیظ شده",
    "normalizedName": "اب گوجه فرنگی غلیظ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب گوجه فرنگی غلیظ شده"
    ]
  },
  {
    "id": "ing-2eda7e87",
    "name": "سبزی ریز  ( نعنا.گشنیز.مرزه.ترخون )",
    "normalizedName": "سبزی ریز ( نعنا.گشنیز.مرزه.ترخون )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سبزی ریز  ( نعنا.گشنیز.مرزه.ترخون )"
    ]
  },
  {
    "id": "ing-8b287f67",
    "name": "میتوانید به جای اب گوجه فرنگی غلیظ از مخلوط  رب و 1 لیوان اب ( جوشیده شود ) استفاده کنید.",
    "normalizedName": "میتوانید به جای اب گوجه فرنگی غلیظ از مخلوط رب و 1 لیوان اب ( جوشیده شود ) استفاده کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید به جای اب گوجه فرنگی غلیظ از مخلوط  رب و 1 لیوان اب ( جوشیده شود ) استفاده کنید."
    ]
  },
  {
    "id": "ing-92b726be",
    "name": "خیار قلمی",
    "normalizedName": "خیار قلمی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خیار قلمی"
    ]
  },
  {
    "id": "ing-f36a4db4",
    "name": "این آب باید  باشد یعنی وقتی انگشت خود را درون اب نمک میزنید گرمای ان را احساس کنید ؛ بهتر است از سنگ نمک بجای نمک معمولی استفاده کنید.",
    "normalizedName": "این اب باید باشد یعنی وقتی انگشت خود را درون اب نمک میزنید گرمای ان را احساس کنید ؛ بهتر است از سنگ نمک بجای نمک معمولی استفاده کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این آب باید  باشد یعنی وقتی انگشت خود را درون اب نمک میزنید گرمای ان را احساس کنید ؛ بهتر است از سنگ نمک بجای نمک معمولی استفاده کنید."
    ]
  },
  {
    "id": "ing-5ea329da",
    "name": "مقدار نمک بستگی به خودتان دارد اما به طور معمول برای هر  آب 1 لیوان نمک مناسب میباشد",
    "normalizedName": "مقدار نمک بستگی به خودتان دارد اما به طور معمول برای هر اب 1 لیوان نمک مناسب میباشد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مقدار نمک بستگی به خودتان دارد اما به طور معمول برای هر  آب 1 لیوان نمک مناسب میباشد"
    ]
  },
  {
    "id": "ing-9a7be48a",
    "name": "پس از قوام آمدن مربا باید  های ژلاتین را در کمی آب جوش حل کرده و به مایه اضافه کرده و مخلوط کنید",
    "normalizedName": "پس از قوام امدن مربا باید های ژلاتین را در کمی اب جوش حل کرده و به مایه اضافه کرده و مخلوط کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از قوام آمدن مربا باید  های ژلاتین را در کمی آب جوش حل کرده و به مایه اضافه کرده و مخلوط کنید"
    ]
  },
  {
    "id": "ing-2e372fb9",
    "name": "گردو چرخ شده",
    "normalizedName": "گردو چرخ شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو چرخ شده"
    ]
  },
  {
    "id": "ing-50446a2b",
    "name": "دانه انار و روغن زیتون از هر کدام",
    "normalizedName": "دانه انار و روغن زیتون از هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار و روغن زیتون از هر کدام"
    ]
  },
  {
    "id": "ing-12893894",
    "name": "آرد سفید 1 و",
    "normalizedName": "ارد سفید 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد سفید 1 و"
    ]
  },
  {
    "id": "ing-7fea160",
    "name": "شکر قهوه ای 1/4 فنجان  و",
    "normalizedName": "شکر قهوه ای 1/4 فنجان و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای 1/4 فنجان  و"
    ]
  },
  {
    "id": "ing-d26bf21f",
    "name": "شیر تغلیظ شده شیرین یا شیر عسل",
    "normalizedName": "شیر تغلیظ شده شیرین یا شیر عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر تغلیظ شده شیرین یا شیر عسل"
    ]
  },
  {
    "id": "ing-f28aa952",
    "name": "شکلات شیرین",
    "normalizedName": "شکلات شیرین",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات شیرین"
    ]
  },
  {
    "id": "ing-2ca661a",
    "name": "کره نرم شده مرغوب",
    "normalizedName": "کره نرم شده مرغوب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره نرم شده مرغوب"
    ]
  },
  {
    "id": "ing-db7c4f98",
    "name": "حالا کرم را با  در وسط شیرینی ها بمالید و پخش کنید",
    "normalizedName": "حالا کرم را با در وسط شیرینی ها بمالید و پخش کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "حالا کرم را با  در وسط شیرینی ها بمالید و پخش کنید"
    ]
  },
  {
    "id": "ing-70cbc4b",
    "name": "کره ذوب شده خنک شده",
    "normalizedName": "کره ذوب شده خنک شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ذوب شده خنک شده"
    ]
  },
  {
    "id": "ing-d67971c9",
    "name": "در حین پخت ماکارون مایه مغزی را با چند  پودر کاکائو مخلوط کنید و روی شیرینی ها بریزید و آنها را ساندویچی کنید.",
    "normalizedName": "در حین پخت ماکارون مایه مغزی را با چند پودر کاکائو مخلوط کنید و روی شیرینی ها بریزید و انها را ساندویچی کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در حین پخت ماکارون مایه مغزی را با چند  پودر کاکائو مخلوط کنید و روی شیرینی ها بریزید و آنها را ساندویچی کنید."
    ]
  },
  {
    "id": "ing-20a9c6d8",
    "name": "کرم تار تار",
    "normalizedName": "کرم تار تار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کرم تار تار"
    ]
  },
  {
    "id": "ing-dfab703",
    "name": "پشمک شکری",
    "normalizedName": "پشمک شکری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پشمک شکری"
    ]
  },
  {
    "id": "ing-c25c002f",
    "name": "چیپس شکلات تلخ 1 و",
    "normalizedName": "چیپس شکلات تلخ 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلات تلخ 1 و"
    ]
  },
  {
    "id": "ing-344f595d",
    "name": "وانیل 1 و",
    "normalizedName": "وانیل 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل 1 و"
    ]
  },
  {
    "id": "ing-4ba4862a",
    "name": "آب   3 قاشق",
    "normalizedName": "اب 3 قاشق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب   3 قاشق"
    ]
  },
  {
    "id": "ing-d2324483",
    "name": "ماست رقیق",
    "normalizedName": "ماست رقیق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست رقیق"
    ]
  },
  {
    "id": "ing-fd087ada",
    "name": "پودر کاکائو 1 و",
    "normalizedName": "پودر کاکائو 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر کاکائو 1 و"
    ]
  },
  {
    "id": "ing-1f711832",
    "name": "عسل 1 و",
    "normalizedName": "عسل 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل 1 و"
    ]
  },
  {
    "id": "ing-9135bad0",
    "name": "شکر  1 و",
    "normalizedName": "شکر 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر  1 و"
    ]
  },
  {
    "id": "ing-e4ae4e8b",
    "name": "مخمّر",
    "normalizedName": "مخمّر",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخمّر"
    ]
  },
  {
    "id": "ing-44bc5d3e",
    "name": "مارگارین یا کره گیاهی",
    "normalizedName": "مارگارین یا کره گیاهی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارگارین یا کره گیاهی"
    ]
  },
  {
    "id": "ing-5ebd4f42",
    "name": "دارچین  نصف",
    "normalizedName": "دارچین نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دارچین  نصف"
    ]
  },
  {
    "id": "ing-1f87b017",
    "name": "خاک قند 1 و",
    "normalizedName": "خاک قند 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خاک قند 1 و"
    ]
  },
  {
    "id": "ing-3469e356",
    "name": "وانیل نصف",
    "normalizedName": "وانیل نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل نصف"
    ]
  },
  {
    "id": "ing-42077fd2",
    "name": "باید  از آرد را در چند مرحله  به مایع اضافه کنید.",
    "normalizedName": "باید از ارد را در چند مرحله به مایع اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "باید  از آرد را در چند مرحله  به مایع اضافه کنید."
    ]
  },
  {
    "id": "ing-1276ba4e",
    "name": "یک  روغن ته یک کاسه ی بزرگ بریزید و خمیر را درون آن بگذارید و در روغن بچرخانید.",
    "normalizedName": "یک روغن ته یک کاسه ی بزرگ بریزید و خمیر را درون ان بگذارید و در روغن بچرخانید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یک  روغن ته یک کاسه ی بزرگ بریزید و خمیر را درون آن بگذارید و در روغن بچرخانید."
    ]
  },
  {
    "id": "ing-b9af7865",
    "name": "نصف  از کره ی باقی مانده را روی شعله آب کنید و با قلم آشپزی روی خمیر بمالید.",
    "normalizedName": "نصف از کره ی باقی مانده را روی شعله اب کنید و با قلم اشپزی روی خمیر بمالید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نصف  از کره ی باقی مانده را روی شعله آب کنید و با قلم آشپزی روی خمیر بمالید."
    ]
  },
  {
    "id": "ing-7ecb9953",
    "name": "خمیر هزارلا",
    "normalizedName": "خمیر هزارلا",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر هزارلا"
    ]
  },
  {
    "id": "ing-773eb89",
    "name": "خامه فرم گرفته یا خامه قنادی",
    "normalizedName": "خامه فرم گرفته یا خامه قنادی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه فرم گرفته یا خامه قنادی"
    ]
  },
  {
    "id": "ing-91deb8b6",
    "name": "سیب قرمز",
    "normalizedName": "سیب قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سیب قرمز"
    ]
  },
  {
    "id": "ing-4ac691b",
    "name": "مربا یا عسل",
    "normalizedName": "مربا یا عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مربا یا عسل"
    ]
  },
  {
    "id": "ing-a6c854a3",
    "name": "عسل را اضافه کنید و خوب مخلوط کنید تا مواد به خوبی باهم ترکیب شوند ( اگر مخلوط کردن با  مشکل بود از دست هایتان کمک بگیرید ).",
    "normalizedName": "عسل را اضافه کنید و خوب مخلوط کنید تا مواد به خوبی باهم ترکیب شوند ( اگر مخلوط کردن با مشکل بود از دست هایتان کمک بگیرید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "عسل را اضافه کنید و خوب مخلوط کنید تا مواد به خوبی باهم ترکیب شوند ( اگر مخلوط کردن با  مشکل بود از دست هایتان کمک بگیرید )."
    ]
  },
  {
    "id": "ing-383a79fe",
    "name": "شکر قهوه ای یا شکر سفید",
    "normalizedName": "شکر قهوه ای یا شکر سفید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای یا شکر سفید"
    ]
  },
  {
    "id": "ing-b3c9a8e9",
    "name": "پس از اینکه به جوش آمد حرارت را ملایم کنید و 20 - 30 دقیقه مداوم هم بزنید تا مایه تافی غلیظ شود ( پس از 20 دقیقه 1 قطره از مایه تافی داخل ی آب سرد بریزید",
    "normalizedName": "پس از اینکه به جوش امد حرارت را ملایم کنید و 20 - 30 دقیقه مداوم هم بزنید تا مایه تافی غلیظ شود ( پس از 20 دقیقه 1 قطره از مایه تافی داخل ی اب سرد بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از اینکه به جوش آمد حرارت را ملایم کنید و 20 - 30 دقیقه مداوم هم بزنید تا مایه تافی غلیظ شود ( پس از 20 دقیقه 1 قطره از مایه تافی داخل ی آب سرد بریزید"
    ]
  },
  {
    "id": "ing-cc9b7c7c",
    "name": "تافی ها را داخل سلفون یا کاغذ شکلات  بندی کنید و در یخچال نگهداری نمایید.",
    "normalizedName": "تافی ها را داخل سلفون یا کاغذ شکلات بندی کنید و در یخچال نگهداری نمایید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تافی ها را داخل سلفون یا کاغذ شکلات  بندی کنید و در یخچال نگهداری نمایید."
    ]
  },
  {
    "id": "ing-425fbcd4",
    "name": "دانه ذرت خشک",
    "normalizedName": "دانه ذرت خشک",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه ذرت خشک"
    ]
  },
  {
    "id": "ing-c2726963",
    "name": "روغن مایع یا روغن زیتون",
    "normalizedName": "روغن مایع یا روغن زیتون",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن مایع یا روغن زیتون"
    ]
  },
  {
    "id": "ing-acc957a9",
    "name": "برای درمان جذام از روغن آن بر پوست بمالند و حدود نیم  از گرد کاملاً ساییده شده آن همراه نشاسته یا صمغ‌ عربی میل‌ کنند",
    "normalizedName": "برای درمان جذام از روغن ان بر پوست بمالند و حدود نیم از گرد کاملاً ساییده شده ان همراه نشاسته یا صمغ عربی میل کنند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای درمان جذام از روغن آن بر پوست بمالند و حدود نیم  از گرد کاملاً ساییده شده آن همراه نشاسته یا صمغ‌ عربی میل‌ کنند"
    ]
  },
  {
    "id": "ing-67e34058",
    "name": "ریشه هندوانه ابوجهل پادزهر سم مار و عقرب است بصورت دمکرده حدود  الی 8 گرم میل کنند.",
    "normalizedName": "ریشه هندوانه ابوجهل پادزهر سم مار و عقرب است بصورت دمکرده حدود الی 8 گرم میل کنند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ریشه هندوانه ابوجهل پادزهر سم مار و عقرب است بصورت دمکرده حدود  الی 8 گرم میل کنند."
    ]
  },
  {
    "id": "ing-866e54e",
    "name": "کسانی که سکته مغزی کرده‌اند نیم  همراه نشاسته با غذا 4 روز در ماه میل کنند",
    "normalizedName": "کسانی که سکته مغزی کرده اند نیم همراه نشاسته با غذا 4 روز در ماه میل کنند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کسانی که سکته مغزی کرده‌اند نیم  همراه نشاسته با غذا 4 روز در ماه میل کنند"
    ]
  },
  {
    "id": "ing-8b58e9f0",
    "name": "برای بیماری قند نیم  همراه نشاسته با غذا 7 روز در ماه میل کنند.",
    "normalizedName": "برای بیماری قند نیم همراه نشاسته با غذا 7 روز در ماه میل کنند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای بیماری قند نیم  همراه نشاسته با غذا 7 روز در ماه میل کنند."
    ]
  },
  {
    "id": "ing-4de37660",
    "name": "روغن کنجد یا زیتون را با حرارت غیر مستقیم یا با حرارت ملایم می‌جوشانیم تا آب تبخیر شود.",
    "normalizedName": "روغن کنجد یا زیتون را با حرارت غیر مستقیم یا با حرارت ملایم می جوشانیم تا اب تبخیر شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن کنجد یا زیتون را با حرارت غیر مستقیم یا با حرارت ملایم می‌جوشانیم تا آب تبخیر شود."
    ]
  },
  {
    "id": "ing-4d696726",
    "name": "اسانس لیمو",
    "normalizedName": "اسانس لیمو",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس لیمو"
    ]
  },
  {
    "id": "ing-b50c436b",
    "name": "رنگ خوراکی و اسانس لیمو را اضافه کنید و با استفاده از  یا کاردک مدام هم بزنید ( ورز دهید ) تا حالت شلی و چسبندگی ابنبات از بین برود و ابنبات جمع شود.",
    "normalizedName": "رنگ خوراکی و اسانس لیمو را اضافه کنید و با استفاده از یا کاردک مدام هم بزنید ( ورز دهید ) تا حالت شلی و چسبندگی ابنبات از بین برود و ابنبات جمع شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "رنگ خوراکی و اسانس لیمو را اضافه کنید و با استفاده از  یا کاردک مدام هم بزنید ( ورز دهید ) تا حالت شلی و چسبندگی ابنبات از بین برود و ابنبات جمع شود."
    ]
  },
  {
    "id": "ing-fb17ed19",
    "name": "خرماهای سرخ شده را روی  آلمینیومی بریزید و پهن کنید",
    "normalizedName": "خرماهای سرخ شده را روی المینیومی بریزید و پهن کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خرماهای سرخ شده را روی  آلمینیومی بریزید و پهن کنید"
    ]
  },
  {
    "id": "ing-c4675ba0",
    "name": "میتوانید این شکلات خرمایی را با سلفون یا آلمینیوم  بندی و تا 1 - 2 ماه داخل فریزر نگهداری کنید و در زمانی که میخواهید از فریزر خارج کنید و برش بزنید و سرو کنید.",
    "normalizedName": "میتوانید این شکلات خرمایی را با سلفون یا المینیوم بندی و تا 1 - 2 ماه داخل فریزر نگهداری کنید و در زمانی که میخواهید از فریزر خارج کنید و برش بزنید و سرو کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید این شکلات خرمایی را با سلفون یا آلمینیوم  بندی و تا 1 - 2 ماه داخل فریزر نگهداری کنید و در زمانی که میخواهید از فریزر خارج کنید و برش بزنید و سرو کنید."
    ]
  },
  {
    "id": "ing-a1a84117",
    "name": "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و  شده است 15 - 20 دقیقه قرار دهید تا نان ها طلایی شوند.",
    "normalizedName": "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و شده است 15 - 20 دقیقه قرار دهید تا نان ها طلایی شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را داخل فری که از قبل با دمای 200 درجه سانتیگراد روشن کرده اید و  شده است 15 - 20 دقیقه قرار دهید تا نان ها طلایی شوند."
    ]
  },
  {
    "id": "ing-fb7371ab",
    "name": "اسانس وانیل یا بادام تلخ",
    "normalizedName": "اسانس وانیل یا بادام تلخ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس وانیل یا بادام تلخ"
    ]
  },
  {
    "id": "ing-f7d0cbd9",
    "name": "آرد و نمک را مخلوط کنید و کم کم روی مواد دیگر الک و با  مخلوط کنید تا خمیر نرمی بدست بیاد.",
    "normalizedName": "ارد و نمک را مخلوط کنید و کم کم روی مواد دیگر الک و با مخلوط کنید تا خمیر نرمی بدست بیاد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد و نمک را مخلوط کنید و کم کم روی مواد دیگر الک و با  مخلوط کنید تا خمیر نرمی بدست بیاد."
    ]
  },
  {
    "id": "ing-ec28b256",
    "name": "آرد برنج 1 و",
    "normalizedName": "ارد برنج 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد برنج 1 و"
    ]
  },
  {
    "id": "ing-3c92f07f",
    "name": "روغن جامد یا روغن کرمانشاهی یا کره",
    "normalizedName": "روغن جامد یا روغن کرمانشاهی یا کره",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن جامد یا روغن کرمانشاهی یا کره"
    ]
  },
  {
    "id": "ing-fe991933",
    "name": "سینی را در فر با حرارت 180 درجه سانتیگراد که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها آماده شوند.",
    "normalizedName": "سینی را در فر با حرارت 180 درجه سانتیگراد که از قبل روشن کرده اید و شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها اماده شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را در فر با حرارت 180 درجه سانتیگراد که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها آماده شوند."
    ]
  },
  {
    "id": "ing-7a1e3efe",
    "name": "این شیرینی ها تا 1 هفته در دمای اتاق و ظرف در قابل نگهداری میباشند.",
    "normalizedName": "این شیرینی ها تا 1 هفته در دمای اتاق و ظرف در قابل نگهداری میباشند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این شیرینی ها تا 1 هفته در دمای اتاق و ظرف در قابل نگهداری میباشند."
    ]
  },
  {
    "id": "ing-dca401d",
    "name": "قالب را داخل فری که  شده است 20 - 30 دقیقه قرار دهید تا کیک رولت بپزد.",
    "normalizedName": "قالب را داخل فری که شده است 20 - 30 دقیقه قرار دهید تا کیک رولت بپزد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را داخل فری که  شده است 20 - 30 دقیقه قرار دهید تا کیک رولت بپزد."
    ]
  },
  {
    "id": "ing-e2800283",
    "name": "اسانس",
    "normalizedName": "اسانس",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اسانس"
    ]
  },
  {
    "id": "ing-8c7d249e",
    "name": "پس از  شدن ابنبات را با ضربه های پشت قاشق خرد کنید",
    "normalizedName": "پس از شدن ابنبات را با ضربه های پشت قاشق خرد کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از  شدن ابنبات را با ضربه های پشت قاشق خرد کنید"
    ]
  },
  {
    "id": "ing-3ea47973",
    "name": "پس از آماده شدن آبنبات های دریا را داخل ظرف در یا کیسه فریزر بسته بندی کنید و در جای خشک و خنک نگهداری نمایید",
    "normalizedName": "پس از اماده شدن ابنبات های دریا را داخل ظرف در یا کیسه فریزر بسته بندی کنید و در جای خشک و خنک نگهداری نمایید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از آماده شدن آبنبات های دریا را داخل ظرف در یا کیسه فریزر بسته بندی کنید و در جای خشک و خنک نگهداری نمایید"
    ]
  },
  {
    "id": "ing-160ef7d8",
    "name": "از مایه شیرینی با  بردارید و به شکل گرد و با فاصله روی سینی فر قرار دهید ( بدلیل اینکه شیرینی در زمان پخت وا میرود با فاصله مناسب روی سینی قرار دهید ).",
    "normalizedName": "از مایه شیرینی با بردارید و به شکل گرد و با فاصله روی سینی فر قرار دهید ( بدلیل اینکه شیرینی در زمان پخت وا میرود با فاصله مناسب روی سینی قرار دهید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "از مایه شیرینی با  بردارید و به شکل گرد و با فاصله روی سینی فر قرار دهید ( بدلیل اینکه شیرینی در زمان پخت وا میرود با فاصله مناسب روی سینی قرار دهید )."
    ]
  },
  {
    "id": "ing-602a6e55",
    "name": "سینی را داخل فری که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها طلایی شوند",
    "normalizedName": "سینی را داخل فری که از قبل روشن کرده اید و شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها طلایی شوند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را داخل فری که از قبل روشن کرده اید و  شده است به مدت 15 - 20 دقیقه قرار دهید تا شیرینی ها طلایی شوند"
    ]
  },
  {
    "id": "ing-4f07b472",
    "name": "با  مدام حرکت دهید تا تمام سطح شیرینی یکدست سرخ شود.",
    "normalizedName": "با مدام حرکت دهید تا تمام سطح شیرینی یکدست سرخ شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با  مدام حرکت دهید تا تمام سطح شیرینی یکدست سرخ شود."
    ]
  },
  {
    "id": "ing-a7780b5f",
    "name": "میتوانید به جای 3 تخم مرغ از  آب استفاده کنید !",
    "normalizedName": "میتوانید به جای 3 تخم مرغ از اب استفاده کنید !",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید به جای 3 تخم مرغ از  آب استفاده کنید !"
    ]
  },
  {
    "id": "ing-7624cdfc",
    "name": "پودر ژله را داخل کاسه ای بریزید و  اب جوش اضافه کنید",
    "normalizedName": "پودر ژله را داخل کاسه ای بریزید و اب جوش اضافه کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله را داخل کاسه ای بریزید و  اب جوش اضافه کنید"
    ]
  },
  {
    "id": "ing-bcdbba16",
    "name": "بودن ژله مارشمالو را ذوب میکند ).",
    "normalizedName": "بودن ژله مارشمالو را ذوب میکند ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بودن ژله مارشمالو را ذوب میکند )."
    ]
  },
  {
    "id": "ing-1c590b40",
    "name": "مارشمالو یا بستنی ساده",
    "normalizedName": "مارشمالو یا بستنی ساده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مارشمالو یا بستنی ساده"
    ]
  },
  {
    "id": "ing-7adc480d",
    "name": "زیاد هم نزنید و اجازه دهید بستنی با ای ژله ذوب شده و در سطح کار پخش شود ( بستنی حتما سرد باشد ).",
    "normalizedName": "زیاد هم نزنید و اجازه دهید بستنی با ای ژله ذوب شده و در سطح کار پخش شود ( بستنی حتما سرد باشد ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زیاد هم نزنید و اجازه دهید بستنی با ای ژله ذوب شده و در سطح کار پخش شود ( بستنی حتما سرد باشد )."
    ]
  },
  {
    "id": "ing-291da2c3",
    "name": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 20 دقیقه قرار دهید",
    "normalizedName": "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 20 دقیقه قرار دهید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 20 دقیقه قرار دهید"
    ]
  },
  {
    "id": "ing-85cefcc3",
    "name": "چیپس شکلاتی 1 و",
    "normalizedName": "چیپس شکلاتی 1 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چیپس شکلاتی 1 و"
    ]
  },
  {
    "id": "ing-562f6430",
    "name": "نکته ها : برای نگهداری ترافل ها آنها را داخل  های کاغذی یا نایلونی قرار دهید و در یخچال بگذارید تا سرد بمانند ( گرما موجب شل شدن ترافل میشود ).",
    "normalizedName": "نکته ها : برای نگهداری ترافل ها انها را داخل های کاغذی یا نایلونی قرار دهید و در یخچال بگذارید تا سرد بمانند ( گرما موجب شل شدن ترافل میشود ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نکته ها : برای نگهداری ترافل ها آنها را داخل  های کاغذی یا نایلونی قرار دهید و در یخچال بگذارید تا سرد بمانند ( گرما موجب شل شدن ترافل میشود )."
    ]
  },
  {
    "id": "ing-5333844c",
    "name": "شیر عسلی یا خامه عسلی",
    "normalizedName": "شیر عسلی یا خامه عسلی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر عسلی یا خامه عسلی"
    ]
  },
  {
    "id": "ing-2f4a4a8e",
    "name": "قالب را چرب کنید و فاج شکلاتی را داخل قالب بریزید و 2-3 ساعت درون یخچال قرار دهید تا  شود",
    "normalizedName": "قالب را چرب کنید و فاج شکلاتی را داخل قالب بریزید و 2-3 ساعت درون یخچال قرار دهید تا شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را چرب کنید و فاج شکلاتی را داخل قالب بریزید و 2-3 ساعت درون یخچال قرار دهید تا  شود"
    ]
  },
  {
    "id": "ing-c2e2e3e0",
    "name": "چوب ابنبات چند",
    "normalizedName": "چوب ابنبات چند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "چوب ابنبات چند"
    ]
  },
  {
    "id": "ing-d0c0f09b",
    "name": "برای نگهداری ابنبات را داخل  های نایلونی بسته بندی کنید و در دمای اتاق قرار دهید.",
    "normalizedName": "برای نگهداری ابنبات را داخل های نایلونی بسته بندی کنید و در دمای اتاق قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای نگهداری ابنبات را داخل  های نایلونی بسته بندی کنید و در دمای اتاق قرار دهید."
    ]
  },
  {
    "id": "ing-8b1704e6",
    "name": "قالب را حداقل به مدت 2 ساعت داخل فریزر قرار دهید تا تافی ها  شوند.",
    "normalizedName": "قالب را حداقل به مدت 2 ساعت داخل فریزر قرار دهید تا تافی ها شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قالب را حداقل به مدت 2 ساعت داخل فریزر قرار دهید تا تافی ها  شوند."
    ]
  },
  {
    "id": "ing-d57c1e31",
    "name": "برای نگهداری تافی را داخل  های کوچک نایلونی قرار دهید.",
    "normalizedName": "برای نگهداری تافی را داخل های کوچک نایلونی قرار دهید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای نگهداری تافی را داخل  های کوچک نایلونی قرار دهید."
    ]
  },
  {
    "id": "ing-e6674739",
    "name": "کره ذوب شده یا روغن جامد",
    "normalizedName": "کره ذوب شده یا روغن جامد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کره ذوب شده یا روغن جامد"
    ]
  },
  {
    "id": "ing-bff61a91",
    "name": "شیرینی ها را داخل ظرف در نگهداری کنید.",
    "normalizedName": "شیرینی ها را داخل ظرف در نگهداری کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرینی ها را داخل ظرف در نگهداری کنید."
    ]
  },
  {
    "id": "ing-548fe045",
    "name": "اگر  شد یعنی شیره آماده است و باید از روی حرارت بردارید ).",
    "normalizedName": "اگر شد یعنی شیره اماده است و باید از روی حرارت بردارید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اگر  شد یعنی شیره آماده است و باید از روی حرارت بردارید )."
    ]
  },
  {
    "id": "ing-6d0236ad",
    "name": "میتوانید با  هم از سوهان برداشته و روی سینی بریزید",
    "normalizedName": "میتوانید با هم از سوهان برداشته و روی سینی بریزید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید با  هم از سوهان برداشته و روی سینی بریزید"
    ]
  },
  {
    "id": "ing-5b6e362c",
    "name": "همچنین میتوانید پس از ریختن یا پهن کردن سوهان روی آن پودر پسته یا خلال بادام بریزید ؛ سوهان را در ظرف در و خارج از یخچال نگهداری کنید.",
    "normalizedName": "همچنین میتوانید پس از ریختن یا پهن کردن سوهان روی ان پودر پسته یا خلال بادام بریزید ؛ سوهان را در ظرف در و خارج از یخچال نگهداری کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "همچنین میتوانید پس از ریختن یا پهن کردن سوهان روی آن پودر پسته یا خلال بادام بریزید ؛ سوهان را در ظرف در و خارج از یخچال نگهداری کنید."
    ]
  },
  {
    "id": "ing-ae0c3956",
    "name": "فلفل سیاه و فلفل قرمز",
    "normalizedName": "فلفل سیاه و فلفل قرمز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "فلفل سیاه و فلفل قرمز"
    ]
  },
  {
    "id": "ing-13dba07d",
    "name": "سس شکلاتی",
    "normalizedName": "سس شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس شکلاتی"
    ]
  },
  {
    "id": "ing-e92b6fe0",
    "name": "آب جوش 2 و",
    "normalizedName": "اب جوش 2 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب جوش 2 و"
    ]
  },
  {
    "id": "ing-a139181b",
    "name": "میتوانید علاوه بر کاکائو  پودر قهوه فوری اضافه کنید و شیرینی شکلاتی با طعم موکا داشته باشید.",
    "normalizedName": "میتوانید علاوه بر کاکائو پودر قهوه فوری اضافه کنید و شیرینی شکلاتی با طعم موکا داشته باشید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "میتوانید علاوه بر کاکائو  پودر قهوه فوری اضافه کنید و شیرینی شکلاتی با طعم موکا داشته باشید."
    ]
  },
  {
    "id": "ing-bec8be8",
    "name": "دانه انار یا آب انار",
    "normalizedName": "دانه انار یا اب انار",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دانه انار یا آب انار"
    ]
  },
  {
    "id": "ing-8c732e8f",
    "name": "با  از مایه شیرینی بردارید و با فاصله داخل سینی فر قرار دهید ( اگر از روش رول کردن استفاده کرده اید شیرینی را با فاصله در کنار هم قرار دهید ).",
    "normalizedName": "با از مایه شیرینی بردارید و با فاصله داخل سینی فر قرار دهید ( اگر از روش رول کردن استفاده کرده اید شیرینی را با فاصله در کنار هم قرار دهید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "با  از مایه شیرینی بردارید و با فاصله داخل سینی فر قرار دهید ( اگر از روش رول کردن استفاده کرده اید شیرینی را با فاصله در کنار هم قرار دهید )."
    ]
  },
  {
    "id": "ing-e484f003",
    "name": "B و C است اما استفاده از  و شیره آنها به صورت کرم ممکن است با عوارض ناخواسته ای مانند تحریکات پوست و حساسیت پوستی و تیره شدن پوست همراه باشد.",
    "normalizedName": "b و c است اما استفاده از و شیره انها به صورت کرم ممکن است با عوارض ناخواسته ای مانند تحریکات پوست و حساسیت پوستی و تیره شدن پوست همراه باشد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "B و C است اما استفاده از  و شیره آنها به صورت کرم ممکن است با عوارض ناخواسته ای مانند تحریکات پوست و حساسیت پوستی و تیره شدن پوست همراه باشد."
    ]
  },
  {
    "id": "ing-4b8ce9fd",
    "name": "یک گیاه می تواند ترکیبات متی داشته باشد که ممکن است تعدادی از آن ها برای پوست مفید باشد و بقیه به پوست آسیب برسانند",
    "normalizedName": "یک گیاه می تواند ترکیبات متی داشته باشد که ممکن است تعدادی از ان ها برای پوست مفید باشد و بقیه به پوست اسیب برسانند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "یک گیاه می تواند ترکیبات متی داشته باشد که ممکن است تعدادی از آن ها برای پوست مفید باشد و بقیه به پوست آسیب برسانند"
    ]
  },
  {
    "id": "ing-2a11c10",
    "name": "کشمش ها را به مایه شیرینی اضافه کنید و در ادامه آرد را کم کم روی مواد الک کنید و با لیسک مخلوط نمایید ؛ داخل سینی فر کاغذ روغنی بگذارید و با  از مایه شیرینی بردارید و با فاصله مناسب داخل سینی قرار دهید ( شیرینی ها در زمان پخت پهن و نازک میشوند ).",
    "normalizedName": "کشمش ها را به مایه شیرینی اضافه کنید و در ادامه ارد را کم کم روی مواد الک کنید و با لیسک مخلوط نمایید ؛ داخل سینی فر کاغذ روغنی بگذارید و با از مایه شیرینی بردارید و با فاصله مناسب داخل سینی قرار دهید ( شیرینی ها در زمان پخت پهن و نازک میشوند ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کشمش ها را به مایه شیرینی اضافه کنید و در ادامه آرد را کم کم روی مواد الک کنید و با لیسک مخلوط نمایید ؛ داخل سینی فر کاغذ روغنی بگذارید و با  از مایه شیرینی بردارید و با فاصله مناسب داخل سینی قرار دهید ( شیرینی ها در زمان پخت پهن و نازک میشوند )."
    ]
  },
  {
    "id": "ing-86c2bc78",
    "name": "مغز گردو یا بادام",
    "normalizedName": "مغز گردو یا بادام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو یا بادام"
    ]
  },
  {
    "id": "ing-c61d57d0",
    "name": "مغز گردو یا فندق",
    "normalizedName": "مغز گردو یا فندق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مغز گردو یا فندق"
    ]
  },
  {
    "id": "ing-9b36de0e",
    "name": "بذر کتان",
    "normalizedName": "بذر کتان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بذر کتان"
    ]
  },
  {
    "id": "ing-f33d959c",
    "name": "پودر ژله ها را بصورت جداگانه در آب جوش حل کنید ( برای هر  ژله 1 لیوان آب جوش لازم است )",
    "normalizedName": "پودر ژله ها را بصورت جداگانه در اب جوش حل کنید ( برای هر ژله 1 لیوان اب جوش لازم است )",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر ژله ها را بصورت جداگانه در آب جوش حل کنید ( برای هر  ژله 1 لیوان آب جوش لازم است )"
    ]
  },
  {
    "id": "ing-3026e9a3",
    "name": "شیر  2/3 لیوان",
    "normalizedName": "شیر 2/3 لیوان",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر  2/3 لیوان"
    ]
  },
  {
    "id": "ing-bcd65fa6",
    "name": "پودر نشاسته",
    "normalizedName": "پودر نشاسته",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نشاسته"
    ]
  },
  {
    "id": "ing-ab0d1f4d",
    "name": "قهوه فوری یا نسکافه",
    "normalizedName": "قهوه فوری یا نسکافه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "قهوه فوری یا نسکافه"
    ]
  },
  {
    "id": "ing-6f6d6756",
    "name": "شکلات تخته ای سفید یا سیاه",
    "normalizedName": "شکلات تخته ای سفید یا سیاه",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات تخته ای سفید یا سیاه"
    ]
  },
  {
    "id": "ing-96d75d69",
    "name": "پودر نارگیل یا نارگیل ریز",
    "normalizedName": "پودر نارگیل یا نارگیل ریز",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل یا نارگیل ریز"
    ]
  },
  {
    "id": "ing-682330b0",
    "name": "بادام زمینی بدون پوست",
    "normalizedName": "بادام زمینی بدون پوست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام زمینی بدون پوست"
    ]
  },
  {
    "id": "ing-b80c0d0",
    "name": "این شیرینی ها در دمای محیط در ظرف در  تا چند روز قابل مصرف میباشند ( میتوانید بجای پسته از گردو یا بادام  نیز استفاده کنید ).",
    "normalizedName": "این شیرینی ها در دمای محیط در ظرف در تا چند روز قابل مصرف میباشند ( میتوانید بجای پسته از گردو یا بادام نیز استفاده کنید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این شیرینی ها در دمای محیط در ظرف در  تا چند روز قابل مصرف میباشند ( میتوانید بجای پسته از گردو یا بادام  نیز استفاده کنید )."
    ]
  },
  {
    "id": "ing-b1acfbb5",
    "name": "نمک و فلفل هر کدام",
    "normalizedName": "نمک و فلفل هر کدام",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نمک و فلفل هر کدام"
    ]
  },
  {
    "id": "ing-c476ed08",
    "name": "سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 10 دقیقه قرار دهید تا بادام ها برشته شوند.",
    "normalizedName": "سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و شده است به مدت 10 دقیقه قرار دهید تا بادام ها برشته شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را داخل فری که از قبل با دمای 180 درجه سانتیگراد روشن کرده اید و  شده است به مدت 10 دقیقه قرار دهید تا بادام ها برشته شوند."
    ]
  },
  {
    "id": "ing-38d89535",
    "name": "آب جوش یا گلاب",
    "normalizedName": "اب جوش یا گلاب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب جوش یا گلاب"
    ]
  },
  {
    "id": "ing-c7b17f8d",
    "name": "بقیه سوهان را باید داخل ظرف در  و در یخچال نگهداری کنید تا خیس و چسبنده نشود.",
    "normalizedName": "بقیه سوهان را باید داخل ظرف در و در یخچال نگهداری کنید تا خیس و چسبنده نشود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بقیه سوهان را باید داخل ظرف در  و در یخچال نگهداری کنید تا خیس و چسبنده نشود."
    ]
  },
  {
    "id": "ing-c17677c4",
    "name": "وانیل شکری",
    "normalizedName": "وانیل شکری",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "وانیل شکری"
    ]
  },
  {
    "id": "ing-7fdc41f1",
    "name": "های شکلاتی",
    "normalizedName": "های شکلاتی",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "های شکلاتی"
    ]
  },
  {
    "id": "ing-b045cc26",
    "name": "شکلات سفید + شکلات سیاه + نقل یا قند سفید +  های یکبار مصرف",
    "normalizedName": "شکلات سفید + شکلات سیاه + نقل یا قند سفید + های یکبار مصرف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکلات سفید + شکلات سیاه + نقل یا قند سفید +  های یکبار مصرف"
    ]
  },
  {
    "id": "ing-fc079087",
    "name": "های یکبار مصرف را داخل کاسه های شکلات کنید تا کاملا به شکلات آغشته شوند",
    "normalizedName": "های یکبار مصرف را داخل کاسه های شکلات کنید تا کاملا به شکلات اغشته شوند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "های یکبار مصرف را داخل کاسه های شکلات کنید تا کاملا به شکلات آغشته شوند"
    ]
  },
  {
    "id": "ing-ff91402c",
    "name": "آلبالوهای شسته شده را نمک بزنید و روی پارچه ای در مقابل نور افتاب قرار دهید تا خشک شود (  به مقدار نرمی یا خشکی ای که دوست دارید 1-3 روز در افتاب قرار دهید ).",
    "normalizedName": "البالوهای شسته شده را نمک بزنید و روی پارچه ای در مقابل نور افتاب قرار دهید تا خشک شود ( به مقدار نرمی یا خشکی ای که دوست دارید 1-3 روز در افتاب قرار دهید ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آلبالوهای شسته شده را نمک بزنید و روی پارچه ای در مقابل نور افتاب قرار دهید تا خشک شود (  به مقدار نرمی یا خشکی ای که دوست دارید 1-3 روز در افتاب قرار دهید )."
    ]
  },
  {
    "id": "ing-c492a2fa",
    "name": "نخ ها را در نور آفتاب یا در محیطی  آویزان کنید تا انجیرها خشک شوند.",
    "normalizedName": "نخ ها را در نور افتاب یا در محیطی اویزان کنید تا انجیرها خشک شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نخ ها را در نور آفتاب یا در محیطی  آویزان کنید تا انجیرها خشک شوند."
    ]
  },
  {
    "id": "ing-83b8285",
    "name": "سینی را در آفتاب یا روی شوفاژ قرار دهید تا ا باعث خشک شدن مواد شود ( بسته به نوع حرارت از 1-2 روز زمان برای خشک شدن لواشک زمان لازم است ) پس از اینکه لواشک اماده شد به اندازه های  برش بزنید و مصرف کنید.",
    "normalizedName": "سینی را در افتاب یا روی شوفاژ قرار دهید تا ا باعث خشک شدن مواد شود ( بسته به نوع حرارت از 1-2 روز زمان برای خشک شدن لواشک زمان لازم است ) پس از اینکه لواشک اماده شد به اندازه های برش بزنید و مصرف کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را در آفتاب یا روی شوفاژ قرار دهید تا ا باعث خشک شدن مواد شود ( بسته به نوع حرارت از 1-2 روز زمان برای خشک شدن لواشک زمان لازم است ) پس از اینکه لواشک اماده شد به اندازه های  برش بزنید و مصرف کنید."
    ]
  },
  {
    "id": "ing-648a1b87",
    "name": "- خاکشیر از نظر طب قدیم ایران  و تر است و التیام دهنده زخم و جراحات میباشد.",
    "normalizedName": "- خاکشیر از نظر طب قدیم ایران و تر است و التیام دهنده زخم و جراحات میباشد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "- خاکشیر از نظر طب قدیم ایران  و تر است و التیام دهنده زخم و جراحات میباشد."
    ]
  },
  {
    "id": "ing-1a094d0c",
    "name": "- خاکشیر خنک کننده است و برای رفع ازدگی با آب سرد مصرف میشود.",
    "normalizedName": "- خاکشیر خنک کننده است و برای رفع ازدگی با اب سرد مصرف میشود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "- خاکشیر خنک کننده است و برای رفع ازدگی با آب سرد مصرف میشود."
    ]
  },
  {
    "id": "ing-7b05e901",
    "name": "- برای باز شدن رنگ چهره خاکشیر را با 2 برابر ان شکر مخلوط کنید و تا 10 روز هر روز  بخورید.",
    "normalizedName": "- برای باز شدن رنگ چهره خاکشیر را با 2 برابر ان شکر مخلوط کنید و تا 10 روز هر روز بخورید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "- برای باز شدن رنگ چهره خاکشیر را با 2 برابر ان شکر مخلوط کنید و تا 10 روز هر روز  بخورید."
    ]
  },
  {
    "id": "ing-38b629e1",
    "name": "- برای برطرف کردن جوشهای صورت که بدلیل مصرف چربی و شیرینی ایجاد می‌شود باید جوشانده  ترنجبین را با 2 قاشق غذاخوری خاکشیر مخلوط کرد و هر روز صبح ناشتا بمدت 2 هفته آن را میل کند تا جوش ها از بین برود.",
    "normalizedName": "- برای برطرف کردن جوشهای صورت که بدلیل مصرف چربی و شیرینی ایجاد می شود باید جوشانده ترنجبین را با 2 قاشق غذاخوری خاکشیر مخلوط کرد و هر روز صبح ناشتا بمدت 2 هفته ان را میل کند تا جوش ها از بین برود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "- برای برطرف کردن جوشهای صورت که بدلیل مصرف چربی و شیرینی ایجاد می‌شود باید جوشانده  ترنجبین را با 2 قاشق غذاخوری خاکشیر مخلوط کرد و هر روز صبح ناشتا بمدت 2 هفته آن را میل کند تا جوش ها از بین برود."
    ]
  },
  {
    "id": "ing-a09acfde",
    "name": "گلاب از تقطیر گل محمدی به دست می آید و از نظر عطر در میان گل ها ممتاز است و خواص درمانی فراوانی دارد ؛ در طب سنتی گلاب به عنوان ی شناخته می شود که خون را قلیایی می کند.",
    "normalizedName": "گلاب از تقطیر گل محمدی به دست می اید و از نظر عطر در میان گل ها ممتاز است و خواص درمانی فراوانی دارد ؛ در طب سنتی گلاب به عنوان ی شناخته می شود که خون را قلیایی می کند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلاب از تقطیر گل محمدی به دست می آید و از نظر عطر در میان گل ها ممتاز است و خواص درمانی فراوانی دارد ؛ در طب سنتی گلاب به عنوان ی شناخته می شود که خون را قلیایی می کند."
    ]
  },
  {
    "id": "ing-6b1dfd5",
    "name": "- براى معالجه ازدگی بهترین راه خوردن گلاب همراه با مقداری یخ است",
    "normalizedName": "- براى معالجه ازدگی بهترین راه خوردن گلاب همراه با مقداری یخ است",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "- براى معالجه ازدگی بهترین راه خوردن گلاب همراه با مقداری یخ است"
    ]
  },
  {
    "id": "ing-c1657aa1",
    "name": "در ازدگی شدید این روش تولید تهوع نموده و صفرا را خارج میکند و شخص بهبود میابد.",
    "normalizedName": "در ازدگی شدید این روش تولید تهوع نموده و صفرا را خارج میکند و شخص بهبود میابد.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "در ازدگی شدید این روش تولید تهوع نموده و صفرا را خارج میکند و شخص بهبود میابد."
    ]
  },
  {
    "id": "ing-6d307c1c",
    "name": "ی درون را از بین مى برد و بدن را تقویت میکند.",
    "normalizedName": "ی درون را از بین مى برد و بدن را تقویت میکند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ی درون را از بین مى برد و بدن را تقویت میکند."
    ]
  },
  {
    "id": "ing-db8c8aec",
    "name": "پس از اینکه تمام چوب شورها را شکلاتی کردید میتوانید برای تزئین روی ان مقداری شکلات  را درون نایلون فریزر بریزید و نوک ان را بکنید تا حالت قیف شود",
    "normalizedName": "پس از اینکه تمام چوب شورها را شکلاتی کردید میتوانید برای تزئین روی ان مقداری شکلات را درون نایلون فریزر بریزید و نوک ان را بکنید تا حالت قیف شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از اینکه تمام چوب شورها را شکلاتی کردید میتوانید برای تزئین روی ان مقداری شکلات  را درون نایلون فریزر بریزید و نوک ان را بکنید تا حالت قیف شود"
    ]
  },
  {
    "id": "ing-56c7192",
    "name": "بادام شیرین ۱۲۵",
    "normalizedName": "بادام شیرین ۱۲۵",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "بادام شیرین ۱۲۵"
    ]
  },
  {
    "id": "ing-861c20b2",
    "name": "پودر قند ۱۵۰",
    "normalizedName": "پودر قند ۱۵۰",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر قند ۱۵۰"
    ]
  },
  {
    "id": "ing-ad44409",
    "name": "آرد گندم  ۱۲۵",
    "normalizedName": "ارد گندم ۱۲۵",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد گندم  ۱۲۵"
    ]
  },
  {
    "id": "ing-db87d9f",
    "name": "ارد گندم",
    "normalizedName": "ارد گندم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد گندم"
    ]
  },
  {
    "id": "ing-d85a4af",
    "name": "ارد برنج",
    "normalizedName": "ارد برنج",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ارد برنج"
    ]
  },
  {
    "id": "ing-b5a885e7",
    "name": "پودر فندق",
    "normalizedName": "پودر فندق",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر فندق"
    ]
  },
  {
    "id": "ing-ce7c381c",
    "name": "خمیر را درون سینی باز کنید تا به ضخامت متر ( نیم سانتیمتر ) برسد",
    "normalizedName": "خمیر را درون سینی باز کنید تا به ضخامت متر ( نیم سانتیمتر ) برسد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خمیر را درون سینی باز کنید تا به ضخامت متر ( نیم سانتیمتر ) برسد"
    ]
  },
  {
    "id": "ing-69e65842",
    "name": "سینی را درون یخچال به مدت 30 دقیقه قرار دهید تا کره  شده و خمیر سفت شود.",
    "normalizedName": "سینی را درون یخچال به مدت 30 دقیقه قرار دهید تا کره شده و خمیر سفت شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سینی را درون یخچال به مدت 30 دقیقه قرار دهید تا کره  شده و خمیر سفت شود."
    ]
  },
  {
    "id": "ing-59e2ba01",
    "name": "شیرینی های قالب زده شده را در سینی بچینید و درون فری که از قبل  کرده اید به مدت 10-15 دقیقه قرار دهید تا شیرینی ها بپزند و زیرشان کمی طلایی شود",
    "normalizedName": "شیرینی های قالب زده شده را در سینی بچینید و درون فری که از قبل کرده اید به مدت 10-15 دقیقه قرار دهید تا شیرینی ها بپزند و زیرشان کمی طلایی شود",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرینی های قالب زده شده را در سینی بچینید و درون فری که از قبل  کرده اید به مدت 10-15 دقیقه قرار دهید تا شیرینی ها بپزند و زیرشان کمی طلایی شود"
    ]
  },
  {
    "id": "ing-3303eed9",
    "name": "اگر میخواهید مدت زمان طولانی تری شیرینی را نگهداری نمائید ان را بصورت خشک در ظرف در  ای نگهداری کنید و در زمان سرو شکلات را رویش بریزید.",
    "normalizedName": "اگر میخواهید مدت زمان طولانی تری شیرینی را نگهداری نمائید ان را بصورت خشک در ظرف در ای نگهداری کنید و در زمان سرو شکلات را رویش بریزید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اگر میخواهید مدت زمان طولانی تری شیرینی را نگهداری نمائید ان را بصورت خشک در ظرف در  ای نگهداری کنید و در زمان سرو شکلات را رویش بریزید."
    ]
  },
  {
    "id": "ing-d43b5e2",
    "name": "شیر عسل",
    "normalizedName": "شیر عسل",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر عسل"
    ]
  },
  {
    "id": "ing-ee23a469",
    "name": "آرد 2 و نیم",
    "normalizedName": "ارد 2 و نیم",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد 2 و نیم"
    ]
  },
  {
    "id": "ing-15d869fc",
    "name": "خامه یا شیر پر چرب",
    "normalizedName": "خامه یا شیر پر چرب",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "خامه یا شیر پر چرب"
    ]
  },
  {
    "id": "ing-1da40fcc",
    "name": "ماست نصف",
    "normalizedName": "ماست نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ماست نصف"
    ]
  },
  {
    "id": "ing-7c4ee2ce",
    "name": "گردو  نصف",
    "normalizedName": "گردو نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو  نصف"
    ]
  },
  {
    "id": "ing-9082f728",
    "name": "پودر نارگیل نصف",
    "normalizedName": "پودر نارگیل نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر نارگیل نصف"
    ]
  },
  {
    "id": "ing-1a26d8da",
    "name": "شکر قهوه ای نصف",
    "normalizedName": "شکر قهوه ای نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شکر قهوه ای نصف"
    ]
  },
  {
    "id": "ing-7c4ee2ce",
    "name": "گردو   نصف",
    "normalizedName": "گردو نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گردو   نصف"
    ]
  },
  {
    "id": "ing-84517a86",
    "name": "آرد  2 و",
    "normalizedName": "ارد 2 و",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آرد  2 و"
    ]
  },
  {
    "id": "ing-3109908d",
    "name": "به یک قسمت  ارد و 1 قاشق پودر قند بزنید و به یک قسمت دیگر 5 قاشق پودر کاکائو و 1 قاشق پودر قند بزنید و جداگانه هر تکه را کمی وزر دهید تا مواد ترکیب شوند.",
    "normalizedName": "به یک قسمت ارد و 1 قاشق پودر قند بزنید و به یک قسمت دیگر 5 قاشق پودر کاکائو و 1 قاشق پودر قند بزنید و جداگانه هر تکه را کمی وزر دهید تا مواد ترکیب شوند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "به یک قسمت  ارد و 1 قاشق پودر قند بزنید و به یک قسمت دیگر 5 قاشق پودر کاکائو و 1 قاشق پودر قند بزنید و جداگانه هر تکه را کمی وزر دهید تا مواد ترکیب شوند."
    ]
  },
  {
    "id": "ing-1c9516b0",
    "name": "پس از اینکه 5 طبقه از  های خمیر روی هم  قرار دادید مغز گردوهای",
    "normalizedName": "پس از اینکه 5 طبقه از های خمیر روی هم قرار دادید مغز گردوهای",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پس از اینکه 5 طبقه از  های خمیر روی هم  قرار دادید مغز گردوهای"
    ]
  },
  {
    "id": "ing-421a077d",
    "name": "پودر دارچین و پودر هل را مخلوط کنید و روی تمام سطح خمیر بپاشید و با  کمی فشار دهید تا  خمیرهای لایه پایینی کمی بهم بچسبند و فضای خالی میان خمیر و گردوها نیز پر شود.",
    "normalizedName": "پودر دارچین و پودر هل را مخلوط کنید و روی تمام سطح خمیر بپاشید و با کمی فشار دهید تا خمیرهای لایه پایینی کمی بهم بچسبند و فضای خالی میان خمیر و گردوها نیز پر شود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "پودر دارچین و پودر هل را مخلوط کنید و روی تمام سطح خمیر بپاشید و با  کمی فشار دهید تا  خمیرهای لایه پایینی کمی بهم بچسبند و فضای خالی میان خمیر و گردوها نیز پر شود."
    ]
  },
  {
    "id": "ing-d6b12c20",
    "name": "ظرف کورن فلکس را به مدت 10 تا 20 دقیقه با درجه حرارت 180 درجه سانتیگراد درون فری که از قبل  کرده اید قرار دهید",
    "normalizedName": "ظرف کورن فلکس را به مدت 10 تا 20 دقیقه با درجه حرارت 180 درجه سانتیگراد درون فری که از قبل کرده اید قرار دهید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "ظرف کورن فلکس را به مدت 10 تا 20 دقیقه با درجه حرارت 180 درجه سانتیگراد درون فری که از قبل  کرده اید قرار دهید"
    ]
  },
  {
    "id": "ing-73fb6e65",
    "name": "برای استفاده از گلایل در تقویت موها روش کار به این صورت است که  گلایل را با 100 گرم برگ هیدروکوتیل و 50 گرم گزنه در 1 لیوان آب به مدت 10 دقیقه دم کنید و بعد از صاف کردن انرا پس از غذا 3 وعده در روز به مدت 1 ماه بنوشید.",
    "normalizedName": "برای استفاده از گلایل در تقویت موها روش کار به این صورت است که گلایل را با 100 گرم برگ هیدروکوتیل و 50 گرم گزنه در 1 لیوان اب به مدت 10 دقیقه دم کنید و بعد از صاف کردن انرا پس از غذا 3 وعده در روز به مدت 1 ماه بنوشید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای استفاده از گلایل در تقویت موها روش کار به این صورت است که  گلایل را با 100 گرم برگ هیدروکوتیل و 50 گرم گزنه در 1 لیوان آب به مدت 10 دقیقه دم کنید و بعد از صاف کردن انرا پس از غذا 3 وعده در روز به مدت 1 ماه بنوشید."
    ]
  },
  {
    "id": "ing-7d7271b1",
    "name": "می توانید  چای خوری از برگ های تازه گیاه را در 500 میلی لیتر آب جوش بریزید و برای 15 دقیقه آن را دم کنید",
    "normalizedName": "می توانید چای خوری از برگ های تازه گیاه را در 500 میلی لیتر اب جوش بریزید و برای 15 دقیقه ان را دم کنید",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "می توانید  چای خوری از برگ های تازه گیاه را در 500 میلی لیتر آب جوش بریزید و برای 15 دقیقه آن را دم کنید"
    ]
  },
  {
    "id": "ing-951dfb06",
    "name": "شیرینی آماده را از فر خارج کنید و پس اینکه خنک شد با پودر قند تزئین و سرو کنید ( این شیرینی در ظرف در تا چند روز قابل نگهداری است ).",
    "normalizedName": "شیرینی اماده را از فر خارج کنید و پس اینکه خنک شد با پودر قند تزئین و سرو کنید ( این شیرینی در ظرف در تا چند روز قابل نگهداری است ).",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیرینی آماده را از فر خارج کنید و پس اینکه خنک شد با پودر قند تزئین و سرو کنید ( این شیرینی در ظرف در تا چند روز قابل نگهداری است )."
    ]
  },
  {
    "id": "ing-fc47aa93",
    "name": "گلاب نصف",
    "normalizedName": "گلاب نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلاب نصف"
    ]
  },
  {
    "id": "ing-5cf1cc33",
    "name": "دیگر آب و شکر را به نشاسته اضافه کنید.",
    "normalizedName": "دیگر اب و شکر را به نشاسته اضافه کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "دیگر آب و شکر را به نشاسته اضافه کنید."
    ]
  },
  {
    "id": "ing-bec56826",
    "name": "کنجد و &#8230; نیز استفاده کنید ؛ دقت کنید که نشاسته باید  باشد چون نشاسته سرد شده فرم  را نخواهد داد",
    "normalizedName": "کنجد و &#8230; نیز استفاده کنید ؛ دقت کنید که نشاسته باید باشد چون نشاسته سرد شده فرم را نخواهد داد",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "کنجد و &#8230; نیز استفاده کنید ؛ دقت کنید که نشاسته باید  باشد چون نشاسته سرد شده فرم  را نخواهد داد"
    ]
  },
  {
    "id": "ing-a4767758",
    "name": "برای کشدار شدن باسلوق به جای گلاب از  گلوکز مایع استفاده کنید.",
    "normalizedName": "برای کشدار شدن باسلوق به جای گلاب از گلوکز مایع استفاده کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "برای کشدار شدن باسلوق به جای گلاب از  گلوکز مایع استفاده کنید."
    ]
  },
  {
    "id": "ing-a2b5309b",
    "name": "روغن جامد یا کره نرم شده",
    "normalizedName": "روغن جامد یا کره نرم شده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "روغن جامد یا کره نرم شده"
    ]
  },
  {
    "id": "ing-7895763e",
    "name": "تخم مرغ ۴",
    "normalizedName": "تخم مرغ ۴",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "تخم مرغ ۴"
    ]
  },
  {
    "id": "ing-8098629c",
    "name": "نشاسته نصف",
    "normalizedName": "نشاسته نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "نشاسته نصف"
    ]
  },
  {
    "id": "ing-df053d64",
    "name": "مخلوط گلاب و آب نصف",
    "normalizedName": "مخلوط گلاب و اب نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخلوط گلاب و آب نصف"
    ]
  },
  {
    "id": "ing-5cb393ed",
    "name": "مخلوط آرد برنج و آرد سفید نصف",
    "normalizedName": "مخلوط ارد برنج و ارد سفید نصف",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مخلوط آرد برنج و آرد سفید نصف"
    ]
  },
  {
    "id": "ing-a6127d69",
    "name": "اگر مخلوط خیلی شل بود میتوانید از حداکثر  آرد سفید و اگر خیلی سفت بود از نصف استکان شیر سرد معمولی استفاده کنید.",
    "normalizedName": "اگر مخلوط خیلی شل بود میتوانید از حداکثر ارد سفید و اگر خیلی سفت بود از نصف استکان شیر سرد معمولی استفاده کنید.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "اگر مخلوط خیلی شل بود میتوانید از حداکثر  آرد سفید و اگر خیلی سفت بود از نصف استکان شیر سرد معمولی استفاده کنید."
    ]
  },
  {
    "id": "ing-facca2c",
    "name": "آنها را  بندی و وارد بازار می‌کنند.",
    "normalizedName": "انها را بندی و وارد بازار می کنند.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آنها را  بندی و وارد بازار می‌کنند."
    ]
  },
  {
    "id": "ing-df85bcb0",
    "name": "این موضوع بستگی به نوع دمنوش دارد ؛ برخی از دمنوش‌ها مانند زیره و رازیانه را هر روز روزی 5 تا  می‌توانیم مصرف کنیم اما گل گاوزبان را نمی‌توان هر روز مصرف کرد چون باعث بالا یا پایین رفتن فشارخون یا دیگر فاکتورهای خونی میشود.",
    "normalizedName": "این موضوع بستگی به نوع دمنوش دارد ؛ برخی از دمنوش ها مانند زیره و رازیانه را هر روز روزی 5 تا می توانیم مصرف کنیم اما گل گاوزبان را نمی توان هر روز مصرف کرد چون باعث بالا یا پایین رفتن فشارخون یا دیگر فاکتورهای خونی میشود.",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "این موضوع بستگی به نوع دمنوش دارد ؛ برخی از دمنوش‌ها مانند زیره و رازیانه را هر روز روزی 5 تا  می‌توانیم مصرف کنیم اما گل گاوزبان را نمی‌توان هر روز مصرف کرد چون باعث بالا یا پایین رفتن فشارخون یا دیگر فاکتورهای خونی میشود."
    ]
  },
  {
    "id": "ing-531c625c",
    "name": "شیر یا ماست",
    "normalizedName": "شیر یا ماست",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شیر یا ماست"
    ]
  },
  {
    "id": "ing-15860f67",
    "name": "شربت گوش فیل  شکر ۳",
    "normalizedName": "شربت گوش فیل شکر ۳",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "شربت گوش فیل  شکر ۳"
    ]
  },
  {
    "id": "ing-7b3a42bb",
    "name": "آب ۱",
    "normalizedName": "اب ۱",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آب ۱"
    ]
  },
  {
    "id": "ing-fc467bcb",
    "name": "گلاب ۱/۴",
    "normalizedName": "گلاب ۱/۴",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گلاب ۱/۴"
    ]
  },
  {
    "id": "ing-65ea4ddb",
    "name": "زعفران دم شده ۲",
    "normalizedName": "زعفران دم شده ۲",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "زعفران دم شده ۲"
    ]
  },
  {
    "id": "ing-ccd870a3",
    "name": "آبلیمو ۱/۲",
    "normalizedName": "ابلیمو ۱/۲",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "آبلیمو ۱/۲"
    ]
  },
  {
    "id": "ing-2ece9c25",
    "name": "مرغ یا گوشت گوسفند",
    "normalizedName": "مرغ یا گوشت گوسفند",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "مرغ یا گوشت گوسفند"
    ]
  },
  {
    "id": "ing-74777f66",
    "name": "سس مخصوص",
    "normalizedName": "سس مخصوص",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "سس مخصوص"
    ]
  },
  {
    "id": "ing-7e12a499",
    "name": "گوشت یا مرغ",
    "normalizedName": "گوشت یا مرغ",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت یا مرغ"
    ]
  },
  {
    "id": "ing-b7e75875",
    "name": "گوشت چرخ‌کرده",
    "normalizedName": "گوشت چرخ کرده",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت چرخ‌کرده"
    ]
  },
  {
    "id": "ing-eeb2495",
    "name": "گوشت مرغ یا خرگوش",
    "normalizedName": "گوشت مرغ یا خرگوش",
    "category": "عمومی",
    "popularity": 10,
    "aliases": [
      "گوشت مرغ یا خرگوش"
    ]
  }
];

export const PERSIAN_INGREDIENTS: Ingredient[] = RAW_INGREDIENTS.map((item) => {
  const extra = EXTRA_ALIASES[item.name] ?? [];
  return {
    ...item,
    aliases: [...new Set([item.name, item.normalizedName, ...extra])],
  };
});
