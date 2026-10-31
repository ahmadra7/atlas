import { normalizePersian } from "@atlas/shared";

export type StepDraft = {
  order: number;
  instruction: string;
  tip?: string | null;
  timerSeconds?: number | null;
};

type RecipeLike = {
  title: string;
  category?: string | null;
  cookingMethod?: string | null;
  cookMinutes?: number | null;
  ingredients: Array<{ name?: string | null }>;
};

const GENERIC_MARKERS = [
  "مواد اولیه «",
  "پیاز و مواد اصلی را تفت دهید",
  "مواد را در روغن داغ سرخ کنید تا طلایی شوند",
  "مواد را مزه‌دار کرده و روی سیخ یا گریل",
];

export function isGenericInstructionText(texts: string[]): boolean {
  const blob = texts.join(" ");
  return GENERIC_MARKERS.some((m) => blob.includes(m));
}

function faJoin(items: string[]): string {
  const unique = [...new Set(items.map((x) => x.trim()).filter(Boolean))];
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0]!;
  if (unique.length === 2) return `${unique[0]} و ${unique[1]}`;
  return `${unique.slice(0, -1).join("، ")} و ${unique[unique.length - 1]}`;
}

function take(items: string[], n: number): string[] {
  return items.slice(0, n);
}

function hasAny(name: string, needles: string[]): boolean {
  const n = normalizePersian(name);
  return needles.some((x) => n.includes(normalizePersian(x)));
}

function classify(names: string[]) {
  const spices: string[] = [];
  const aromatics: string[] = [];
  const proteins: string[] = [];
  const legumes: string[] = [];
  const veg: string[] = [];
  const dairy: string[] = [];
  const dry: string[] = [];
  const wet: string[] = [];
  const other: string[] = [];

  for (const name of names) {
    if (
      hasAny(name, [
        "نمک",
        "فلفل",
        "زردچوبه",
        "زعفران",
        "دارچین",
        "ادویه",
        "وانیل",
        "بکینگ",
        "سیاه دانه",
        "گلپر",
        "سماق",
      ])
    ) {
      spices.push(name);
    } else if (hasAny(name, ["پیاز", "سیر", "زنجبیل"])) {
      aromatics.push(name);
    } else if (
      hasAny(name, ["مرغ", "گوشت", "ماهی", "میگو", "تخم مرغ", "تخم‌مرغ", "جگر"])
    ) {
      proteins.push(name);
    } else if (
      hasAny(name, ["لوبیا", "لپه", "عدس", "نخود", "ماش", "باقلا"])
    ) {
      legumes.push(name);
    } else if (
      hasAny(name, ["آرد", "شکر", "پودر کاکائو", "پودر کاکایو", "بکینگ پودر"])
    ) {
      dry.push(name);
    } else if (
      hasAny(name, ["شیر", "روغن", "کره", "خامه", "ماست", "تخم"])
    ) {
      wet.push(name);
    } else if (hasAny(name, ["ماست", "کشک", "پنیر", "خامه"])) {
      dairy.push(name);
    } else if (
      hasAny(name, [
        "گوجه",
        "بادمجان",
        "سیب زمینی",
        "هویج",
        "کلم",
        "کدو",
        "فلفل",
        "سبزی",
        "جعفری",
        "تره",
        "گشنیز",
        "کنگر",
        "قارچ",
        "خیار",
      ])
    ) {
      veg.push(name);
    } else {
      other.push(name);
    }
  }

  return { spices, aromatics, proteins, legumes, veg, dairy, dry, wet, other };
}

function cookTimer(minutes?: number | null): number | null {
  if (!minutes || minutes < 3) return null;
  return Math.min(minutes, 90) * 60;
}

export function synthesizeSteps(recipe: RecipeLike): StepDraft[] {
  const title = recipe.title.trim();
  const category = normalizePersian(recipe.category ?? "");
  const method = normalizePersian(recipe.cookingMethod ?? "");
  const names = recipe.ingredients
    .map((i) => (i.name ?? "").trim())
    .filter((n) => n.length >= 2);
  const bag = classify(names);
  const mainBits = take(
    [...bag.proteins, ...bag.legumes, ...bag.veg, ...bag.other],
    4,
  );
  const main = faJoin(mainBits) || "مواد اصلی";
  const aromatics = faJoin(take(bag.aromatics, 3));
  const spices = faJoin(take(bag.spices, 4));
  const cookMin = recipe.cookMinutes && recipe.cookMinutes > 0 ? recipe.cookMinutes : null;
  const cookFa = cookMin ? `حدود ${cookMin} دقیقه` : "تا جا بیفتد";
  const timer = cookTimer(cookMin);

  const isCake =
    category.includes("کیک") ||
    category.includes("شیرینی") ||
    category.includes("دسر") ||
    title.includes("کیک") ||
    category.includes("دسر");
  const isPickle =
    category.includes("ترشی") ||
    title.includes("ترشی") ||
    title.includes("شور");
  const isSalad = category.includes("سالاد") || title.includes("سالاد");
  const isDrink =
    category.includes("نوشیدنی") ||
    title.includes("شربت") ||
    title.includes("اسموتی");
  const isKebab =
    method.includes("کباب") ||
    method.includes("گریل") ||
    method.includes("باربیکیو") ||
    title.includes("کباب");
  const isFry =
    method.includes("سرخ") || title.includes("کتلت") || title.includes("کوکو");
  const isSoup =
    title.includes("سوپ") ||
    title.includes("آش") ||
    title.includes("آبگوشت");
  const isCold = method.includes("خوراک سرد") || method.includes("ترکیب کردن");

  if (isCake) {
    const dry = faJoin(take(bag.dry.length ? bag.dry : names.slice(0, 3), 4)) || "مواد خشک";
    const wet =
      faJoin(take(bag.wet.length ? bag.wet : names.slice(3, 6), 4)) || "مواد تر";
    return [
      {
        order: 1,
        instruction: `${dry} را در یک کاسه مخلوط و یکدست کنید.`,
      },
      {
        order: 2,
        instruction: `${wet} را جداگانه هم بزنید، سپس به مواد خشک اضافه کنید تا خمیر یا مایه یکدست شود.`,
      },
      {
        order: 3,
        instruction: `مایه «${title}» را در قالب یا تابه چرب‌شده بریزید و ${cookFa} بپزید.`,
        timerSeconds: timer,
      },
      {
        order: 4,
        instruction: `بعد از پخت کمی خنک کنید و سرو کنید.`,
        tip: spices ? `در صورت تمایل با ${spices} عطر بدهید.` : null,
      },
    ];
  }

  if (isPickle) {
    const veg = faJoin(take([...bag.veg, ...bag.other], 5)) || main;
    return [
      {
        order: 1,
        instruction: `${veg} را بشویید، خرد کنید و آب اضافه را بگیرید.`,
      },
      {
        order: 2,
        instruction: `سرکه، نمک${spices ? ` و ${spices}` : ""} را مخلوط کنید و روی مواد بریزید.`,
      },
      {
        order: 3,
        instruction: `در ظرف تمیز بریزید، هواگیری کنید و بگذارید برسد. سپس «${title}» را سرو کنید.`,
      },
    ];
  }

  if (isSalad || (isCold && !isSoup)) {
    return [
      {
        order: 1,
        instruction: `${main} را بشویید و خرد کنید.`,
      },
      {
        order: 2,
        instruction: `سس یا چاشنی${spices ? ` با ${spices}` : ""} را جدا آماده کنید.`,
      },
      {
        order: 3,
        instruction: `مواد را با سس مخلوط کنید و «${title}» را فوری سرو کنید.`,
      },
    ];
  }

  if (isDrink) {
    return [
      {
        order: 1,
        instruction: `${main} را بشویید و خرد یا آماده کنید.`,
      },
      {
        order: 2,
        instruction: `با بقیه مواد مخلوط یا بلندر کنید تا یکدست شود.`,
      },
      {
        order: 3,
        instruction: `طعم را تنظیم کنید و خنک سرو کنید.`,
      },
    ];
  }

  if (isKebab) {
    return [
      {
        order: 1,
        instruction: `${main} را به قطعات مناسب خرد کنید.`,
      },
      {
        order: 2,
        instruction: `${aromatics ? `${aromatics}، ` : ""}ماست یا روغن و ${spices || "ادویه"} را مخلوط کنید و مواد را حداقل ۱ ساعت مزه‌دار کنید.`,
        tip: "هرچه بیشتر در یخچال بماند، نتیجه بهتر است.",
      },
      {
        order: 3,
        instruction: `به سیخ بکشید یا روی گریل با حرارت متوسط بپزید و مرتب بچرخانید تا خشک نشود.`,
        timerSeconds: timer,
      },
      {
        order: 4,
        instruction: `«${title}» را با نان، برنج یا سالاد سرو کنید.`,
      },
    ];
  }

  if (isFry) {
    return [
      {
        order: 1,
        instruction: `${main}${aromatics ? ` و ${aromatics}` : ""} را خرد و مخلوط کنید.`,
      },
      {
        order: 2,
        instruction: `روغن را داغ کنید و مواد را سرخ کنید تا طلایی شوند.`,
        timerSeconds: timer,
      },
      {
        order: 3,
        instruction: `${spices || "نمک و فلفل"} را اضافه کنید و چند دقیقه دیگر تفت دهید.`,
      },
      {
        order: 4,
        instruction: `روغن اضافه را بگیرید و «${title}» را داغ سرو کنید.`,
      },
    ];
  }

  if (isSoup) {
    return [
      {
        order: 1,
        instruction: bag.legumes.length
          ? `${faJoin(bag.legumes)} را از قبل خیس کنید و آب آن را چند بار عوض کنید.`
          : `${main} را خرد و آماده کنید.`,
      },
      {
        order: 2,
        instruction: `${aromatics || "پیاز"} را در قابلمه تفت دهید، سپس ${main} را اضافه کنید.`,
      },
      {
        order: 3,
        instruction: `آب جوش${spices ? ` و ${spices}` : ""} را اضافه کنید و ${cookFa} آرام بپزید.`,
        timerSeconds: timer,
      },
      {
        order: 4,
        instruction: `غلظت و نمک را تنظیم کنید و «${title}» را داغ سرو کنید.`,
      },
    ];
  }

  const intro = [
    bag.legumes.length
      ? `${faJoin(bag.legumes)} را خیس کنید.`
      : null,
    `${main}${aromatics ? ` و ${aromatics}` : ""} را خرد کنید.`,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    {
      order: 1,
      instruction: intro,
    },
    {
      order: 2,
      instruction: `${aromatics || "پیاز"} را با کمی روغن تفت دهید تا طلایی شود${
        bag.proteins.length ? `، سپس ${faJoin(take(bag.proteins, 2))} را اضافه کنید و رنگ بیندازید.` : "."
      }`,
    },
    {
      order: 3,
      instruction: `${take([...bag.veg, ...bag.other], 3).length ? `${faJoin(take([...bag.veg, ...bag.other], 3))} را اضافه کنید. ` : ""}آب${spices ? `، ${spices}` : ""} را بریزید و با حرارت ملایم ${cookFa} بپزید.`,
      timerSeconds: timer,
      tip: cookMin && cookMin >= 60 ? "درب قابلمه را بگذارید تا غذا جا بیفتد." : null,
    },
    {
      order: 4,
      instruction: `نمک و طعم را تنظیم کنید و «${title}» را سرو کنید.`,
    },
  ];
}
