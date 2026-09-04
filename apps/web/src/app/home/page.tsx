"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode, type TransitionEvent } from "react";
import type {
  DietMode,
  Difficulty,
  DishType,
  Ingredient,
  InventoryItem,
  MealType,
  RecommendationCard,
} from "@atlas/contracts";
import {
  dietModeLabelFa,
  difficultyLabelFa,
  dishTypeLabelFa,
  formatMinutesFa,
  ingredientsLooselyMatch,
  isLikelyFoodIngredient,
  isUnusualIngredient,
  mealLabelFa,
  normalizePersian,
  toPersianDigits,
  FOOD_NAMES,
} from "@atlas/shared";
import {
  Add,
  ArrowLeft,
  ArrowLeft2,
  Category,
  Chart,
  CloseCircle,
  Coffee,
  Global,
  Heart,
  Like1,
  Microphone2,
  People,
  SearchNormal1,
  Setting4,
  TickCircle,
  Timer1,
  Trash,
} from "iconsax-react";
import { AppShell, homeAppTitle } from "@/components/layout/AppShell";
// import { BrandMark } from "@/components/brand/BrandMark";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SoftTag } from "@/components/ui/SoftTag";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { BottomToast } from "@/components/ui/Toast";
import { instantPush } from "@/components/navigation/InstantNav";
import { AuthLink } from "@/components/auth/AuthLink";
import { useIngredientVoiceInput } from "@/hooks/useIngredientVoiceInput";
import { atlasClient, withApiSession } from "@/lib/client";
import { partitionSpokenNames } from "@/lib/spokenIngredients";
import { pageCache } from "@/lib/page-cache";
import { rememberLoadedImage } from "@/lib/image-cache";

const mealOptions: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];
const timeOptions = [15, 30, 45, 60, 90, 120, 180];
const dietModes: DietMode[] = ["any", "diet", "regular"];
const dishTypes: DishType[] = [
  "any",
  "main",
  "appetizer",
  "soup",
  "salad",
  "dessert",
  "sweet",
  "drink",
  "side",
  "fast",
];
const difficulties: Array<Difficulty | "any"> = ["any", "easy", "medium", "hard"];
const cuisineOptions = [
  "any",
  "ایرانی",
  "ایتالیایی",
  "آسیایی",
  "مدیترانه‌ای",
  "مکزیکی",
];
const preferenceOptions = ["گیاهی", "وگان", "بدون گلوتن", "کم‌کالری"];

function SettingsHeading({
  icon: Icon,
  children,
}: {
  icon: typeof Coffee;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-caption font-normal text-atlas-ink-faint">
      <Icon size={16} color="currentColor" variant="Linear" />
      {children}
    </p>
  );
}

function OptionChips<T extends string>({
  options,
  value,
  onChange,
  labelOf,
  singleLine = false,
  primaryActive = false,
}: {
  options: T[];
  value: T;
  onChange: (next: T) => void;
  labelOf: (option: T) => string;
  singleLine?: boolean;
  primaryActive?: boolean;
}) {
  return (
    <div
      className={
        singleLine
          ? "flex flex-nowrap gap-1"
          : "flex flex-wrap gap-2"
      }
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg transition ${
            singleLine
              ? "min-w-0 flex-1 truncate px-2 py-[0.45rem] text-[11px] leading-4"
              : "px-3 py-1.5 text-caption"
          } ${
            value === option
              ? primaryActive
                ? "bg-atlas-primary font-bold text-white shadow-sm"
                : "bg-atlas-chip-active font-bold text-atlas-chip-active-text"
              : "bg-zinc-50 font-medium text-atlas-ink-muted ring-1 ring-zinc-200/90 dark:bg-atlas-surface-muted/40 dark:ring-atlas-border"
          }`}
        >
          {labelOf(option)}
        </button>
      ))}
    </div>
  );
}

function orderInventoryChips(items: InventoryItem[]): InventoryItem[] {
  return [...items].sort((a, b) => {
    const ta = Date.parse(a.createdAt) || 0;
    const tb = Date.parse(b.createdAt) || 0;
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
}

function EarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.562 5.272A4.438 4.438 0 1 1 10.148 8.4c-.445.448-.702 1.07-.774 1.698c-.19 1.662-1.619 3.069-3.394 3.069a3.42 3.42 0 0 1-3.418-3.419"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.724 5.25a1.724 1.724 0 1 0-3.449 0v1.915m0 0h.471A1.5 1.5 0 0 1 7.222 8.4l.009.047"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicListenRing() {
  const ringMask = {
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as const;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0 overflow-hidden rounded-[calc(1.6rem+4px)]"
        style={{ ...ringMask, padding: "4px" }}
      >
        <div
          className="absolute inset-[-55%] animate-[micOrbit_1.2s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, var(--atlas-primary) 0%, transparent 45%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}

const HOME_BANNERS = [
  {
    src: "/banners/home-appliances.png",
    alt: "لوازم خانگی برقی به انتخاب حرفه‌ای‌ها",
  },
  {
    src: "/banners/home-coffee.png",
    alt: "لوازم خانگی برقی به انتخاب حرفه‌ای‌ها",
  },
] as const;

function HomeBannerSlider() {
  const loopSlides = [...HOME_BANNERS, HOME_BANNERS[0]];
  const realCount = HOME_BANNERS.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i >= realCount ? i : i + 1));
    }, 4500);
    return () => window.clearInterval(id);
  }, [realCount]);

  function onTrackTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (index < realCount) return;
    setAnimate(false);
    setIndex(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
  }

  const active = index % realCount;

  return (
    <div className="relative mb-4 overflow-hidden rounded-atlas">
      <div
        dir="ltr"
        className={`flex h-[8.75rem] w-full ${
          animate
            ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : ""
        }`}
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        onTransitionEnd={onTrackTransitionEnd}
      >
        {loopSlides.map((banner, i) => (
          <img
            key={`${banner.src}-${i}`}
            src={banner.src}
            alt={banner.alt}
            className="h-full w-full min-w-full shrink-0 basis-full object-cover object-center"
            draggable={false}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-white/25 p-[2px]">
          {HOME_BANNERS.map((banner, i) => (
            <button
              key={banner.src}
              type="button"
              aria-label={`اسلاید ${i + 1}`}
              aria-current={i === active}
              onClick={() => {
                if (i === active) return;
                if (index === realCount - 1 && i === 0) {
                  setIndex(realCount);
                  return;
                }
                setIndex(i);
              }}
              className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition ${
                i === active ? "bg-white" : "bg-white/45"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(() => pageCache.inventory === null);
  const [popular, setPopular] = useState<RecommendationCard[]>(
    () => pageCache.popular ?? [],
  );
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(
    () => orderInventoryChips(pageCache.inventory ?? []),
  );
  const [adding, setAdding] = useState(false);
  const [searching, setSearching] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [meal, setMeal] = useState<MealType>("any");
  const [maxMinutes, setMaxMinutes] = useState(180);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dietMode, setDietMode] = useState<DietMode>("any");
  const [dishType, setDishType] = useState<DishType>("any");
  const [difficulty, setDifficulty] = useState<Difficulty | "any">("any");
  const [cuisine, setCuisine] = useState("any");
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [draftMeal, setDraftMeal] = useState<MealType>("any");
  const [draftMaxMinutes, setDraftMaxMinutes] = useState(180);
  const [draftDietMode, setDraftDietMode] = useState<DietMode>("any");
  const [draftDishType, setDraftDishType] = useState<DishType>("any");
  const [draftDifficulty, setDraftDifficulty] = useState<Difficulty | "any">(
    "any",
  );
  const [draftCuisine, setDraftCuisine] = useState("any");
  const [draftBudgetFriendly, setDraftBudgetFriendly] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState<string[]>([]);

  useEffect(() => {
    router.prefetch("/recommendations");
  }, [router]);

  useEffect(() => {
    rememberLoadedImage("/avatars/chef-character.png?v=2");
    rememberLoadedImage("/banners/home-appliances.png");
    rememberLoadedImage("/banners/home-coffee.png");
    for (const card of popular) {
      const src = card.imageUrl?.trim();
      if (!src) continue;
      const img = new window.Image();
      img.onload = () => rememberLoadedImage(src);
      img.src = src;
    }
  }, [popular]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (pageCache.inventory !== null) {
          setLoading(false);
        }

        const inv = await withApiSession(() => atlasClient.getInventory());
        if (cancelled) return;
        pageCache.inventory = orderInventoryChips(inv);
        setInventory(pageCache.inventory);
        setLoading(false);

        if (pageCache.popular !== null) return;

        const rec = await withApiSession(() =>
          atlasClient.getRecommendations({
            meal: "any",
            maxMinutes: 60,
          }),
        );
        if (cancelled) return;
        const cards = [...rec.exact, ...rec.near, ...rec.discovery].slice(
          0,
          4,
        );
        pageCache.popular = cards;
        setPopular(cards);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await atlasClient.searchIngredients(query);
        if (!cancelled) setSuggestions(results);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const selectedIds = useMemo(
    () => new Set(inventory.map((i) => i.ingredientId)),
    [inventory],
  );
  const selectedNames = useMemo(
    () => new Set(inventory.map((i) => normalizePersian(i.ingredient.name))),
    [inventory],
  );
  const trimmed = query.trim();
  const inCatalog = Boolean(
    trimmed &&
      (isLikelyFoodIngredient(trimmed) ||
        suggestions.some((item) => ingredientsLooselyMatch(trimmed, item.name))),
  );
  const canAdd =
    Boolean(trimmed) &&
    !selectedNames.has(normalizePersian(trimmed)) &&
    inCatalog;

  const advancedCount = useMemo(() => {
    let n = 0;
    if (meal !== "any") n += 1;
    if (maxMinutes !== 180) n += 1;
    if (dietMode !== "any") n += 1;
    if (dishType !== "any") n += 1;
    if (difficulty !== "any") n += 1;
    if (cuisine !== "any") n += 1;
    if (budgetFriendly) n += 1;
    n += preferences.length;
    return n;
  }, [
    budgetFriendly,
    cuisine,
    dietMode,
    difficulty,
    dishType,
    maxMinutes,
    meal,
    preferences.length,
  ]);

  async function reloadInventory() {
    const inv = await withApiSession(() => atlasClient.getInventory());
    pageCache.inventory = orderInventoryChips(inv);
    setInventory(pageCache.inventory);
  }

  const showInvalidToast = useCallback(() => {
    setToast({
      title: "مواد غذایی اشتباه",
      message:
        "این مورد تو فهرست مواد اولیه ما نیست. فقط مواد غذایی مجاز را بگو.",
    });
  }, []);

  const addSpokenChips = useCallback(async (names: string[]) => {
    if (names.length === 0) return;

    setAddError(null);
    setInventory((prev) => {
      const seen = new Set(
        prev.map((item) => normalizePersian(item.ingredient.name)),
      );
      const extra = names
        .filter((name) => !seen.has(normalizePersian(name)))
        .map((name, index) => ({
          id: `local-${Date.now()}-${index}`,
          ingredientId: `local-${normalizePersian(name)}`,
          ingredient: {
            id: `local-${normalizePersian(name)}`,
            name,
            normalizedName: normalizePersian(name),
            aliases: [],
            category: "عمومی",
            popularity: 0,
          },
          createdAt: new Date().toISOString(),
        }));
      if (extra.length === 0) return prev;
      const next = [...prev, ...extra];
      pageCache.inventory = next;
      return next;
    });

    setAdding(true);
    try {
      await withApiSession(async () => {
        for (const name of names) {
          await atlasClient.addIngredientByName(name);
        }
      });
      const inv = await withApiSession(() => atlasClient.getInventory());
      if (inv.length > 0) {
        pageCache.inventory = orderInventoryChips(inv);
        setInventory(pageCache.inventory);
      }
      setQuery("");
    } catch {
      /* chips already sit under the input */
    } finally {
      setAdding(false);
    }
  }, []);

  const voice = useIngredientVoiceInput({
    contextualStrings: FOOD_NAMES.slice(0, 80),
    onHeard: async (transcript) => {
      const { valid, invalid } = partitionSpokenNames(transcript);
      if (valid.length === 0) {
        showInvalidToast();
        return;
      }
      if (invalid.length > 0) showInvalidToast();
      await addSpokenChips(valid);
    },
  });

  async function addTyped() {
    if (!trimmed) return;
    if (!inCatalog) {
      setAddError("مواد اولیه اشتباه است");
      return;
    }
    if (!canAdd) return;
    setAdding(true);
    setAddError(null);
    try {
      const match = suggestions.find(
        (item) =>
          normalizePersian(item.name) === normalizePersian(trimmed) ||
          ingredientsLooselyMatch(trimmed, item.name),
      );
      if (match) {
        await withApiSession(() => atlasClient.addInventoryItem(match.id));
      } else {
        await withApiSession(() => atlasClient.addIngredientByName(trimmed));
      }
      await reloadInventory();
      setQuery("");
    } catch {
      setAddError("مواد اولیه اشتباه است");
    } finally {
      setAdding(false);
    }
  }

  async function addSuggestion(item: Ingredient) {
    if (selectedIds.has(item.id)) return;
    setAdding(true);
    setAddError(null);
    try {
      await withApiSession(() => atlasClient.addInventoryItem(item.id));
      await reloadInventory();
      setQuery("");
    } catch {
      setAddError("افزودن از لیست انجام نشد. اتصال به سرور را چک کنید.");
    } finally {
      setAdding(false);
    }
  }

  function openMoreSettings() {
    setDraftMeal(meal);
    setDraftMaxMinutes(maxMinutes);
    setDraftDietMode(dietMode);
    setDraftDishType(dishType);
    setDraftDifficulty(difficulty);
    setDraftCuisine(cuisine);
    setDraftBudgetFriendly(budgetFriendly);
    setDraftPreferences(preferences);
    setMoreOpen(true);
  }

  function applyMoreSettings() {
    setMeal(draftMeal);
    setMaxMinutes(draftMaxMinutes);
    setDietMode(draftDietMode);
    setDishType(draftDishType);
    setDifficulty(draftDifficulty);
    setCuisine(draftCuisine);
    setBudgetFriendly(draftBudgetFriendly);
    setPreferences(draftPreferences);
    setMoreOpen(false);
  }

  function resetMoreSettings() {
    setDraftMeal("any");
    setDraftMaxMinutes(180);
    setDraftDietMode("any");
    setDraftDishType("any");
    setDraftDifficulty("any");
    setDraftCuisine("any");
    setDraftBudgetFriendly(false);
    setDraftPreferences([]);
  }

  function togglePreference(tag: string) {
    setDraftPreferences((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function clearAllIngredients() {
    if (inventory.length === 0) return;
    const ids = inventory.map((item) => item.id);
    pageCache.inventory = [];
    setInventory([]);
    setAddError(null);
    setAdding(true);
    try {
      await withApiSession(async () => {
        await Promise.all(
          ids.map((id) => atlasClient.removeInventoryItem(id)),
        );
      });
    } catch {
      void reloadInventory();
    } finally {
      setAdding(false);
    }
  }

  function goToFoodList() {
    if (inventory.length === 0) return;
    const params = new URLSearchParams({
      meal,
      maxMinutes: String(maxMinutes),
    });
    if (dietMode !== "any") params.set("dietMode", dietMode);
    if (dishType !== "any") params.set("dishType", dishType);
    if (difficulty !== "any") params.set("difficulty", difficulty);
    if (cuisine !== "any") params.set("cuisine", cuisine);
    if (budgetFriendly) params.set("budgetFriendly", "1");
    if (preferences.length > 0) params.set("tags", preferences.join(","));
    const href = `/recommendations?${params.toString()}`;
    instantPush(router, href);
  }

  return (
    <AppShell title={homeAppTitle} splitTitle>
      {loading ? (
        <HomeSkeleton />
      ) : (
      <div className="overflow-visible pb-8">
        <section className="relative z-10 mb-4 overflow-visible">
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-atlas-xl bg-atlas-surface px-5 pb-5 pt-6 shadow-[0_12px_32px_rgba(20,40,80,0.09),0_3px_10px_rgba(20,40,80,0.05)] dark:shadow-[0_14px_32px_rgba(8,16,40,0.32)]">
            <div className="flex items-center justify-center gap-4">
              {/* <div className="pointer-events-none -mt-[1.8rem] mb-2">
                <BrandMark size={76} />
              </div> */}
              <img
                src="/avatars/chef-character.png?v=2"
                alt=""
                className="h-[4.25rem] w-auto object-contain"
              />
              <div className="text-right">
                <h3 className="text-[1.45rem] font-extrabold leading-8 text-atlas-ink sm:text-[1.55rem]">
                  چیا تو یخچال داری ؟!
                </h3>
                <p
                  className="mt-1 max-w-[20rem] text-[13px] font-normal leading-5 text-atlas-ink"
                  style={{ opacity: 0.6 }}
                >
                  هر موادی داری بگو تا بگم چی درست کنی!
                </p>
              </div>
            </div>

                <div className="relative flex flex-col items-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    {voice.listening ? (
                      <div className="pointer-events-none absolute inset-[-4px]">
                        <MicListenRing />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (voice.processing) return;
                        if (voice.listening) {
                          voice.stop();
                          return;
                        }
                        voice.start();
                      }}
                      aria-label={
                        voice.listening ? "لغو ضبط" : "افزودن مواد با صدا"
                      }
                      className={`relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-atlas-primary text-white transition active:scale-95 disabled:opacity-50 ${
                        voice.listening
                          ? "shadow-[0_12px_32px_rgba(212,2,47,0.45)]"
                          : "shadow-[0_10px_28px_rgba(212,2,47,0.35)]"
                      }`}
                    >
                      <span className="relative z-10">
                        {voice.listening ? (
                          <Add
                            size={28}
                            color="#ffffff"
                            variant="Linear"
                            className="rotate-45"
                          />
                        ) : (
                          <Microphone2
                            size={28}
                            color="currentColor"
                            variant="Bold"
                          />
                        )}
                      </span>
                    </button>
                  </div>
                  <div
                    className={`grid w-full transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      voice.listening ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={`flex justify-center pt-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          voice.listening
                            ? "translate-y-0 opacity-100"
                            : "translate-y-1 opacity-0"
                        }`}
                      >
                        <div className="inline-flex max-w-[17rem] items-center justify-center gap-1.5 rounded-xl bg-zinc-400/[0.07] px-3.5 py-2 dark:bg-white/[0.06]">
                          <span className="shrink-0 text-atlas-ink-faint opacity-45">
                            <EarIcon size={16} />
                          </span>
                          <p className="text-[12px] leading-5 text-atlas-ink-muted">
                            {voice.draft || voice.interim
                              ? voice.draft || voice.interim
                              : "دارم گوش می‌دم… بگو"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="relative min-w-0 flex-1">
                    <span className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-atlas-ink-faint">
                      <SearchNormal1 size={18} color="currentColor" />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        if (addError) setAddError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void addTyped();
                        }
                      }}
                      placeholder="مثلا گوجه، تخم‌مرغ، عدس…"
                      className={`h-12 w-full border border-atlas-border bg-atlas-surface py-2 pr-10 pl-3 text-body text-atlas-ink outline-none focus:border-atlas-primary ${
                        trimmed
                          ? "rounded-t-atlas rounded-b-none border-b-transparent"
                          : "rounded-atlas"
                      }`}
                    />
                    {trimmed ? (
                      <div className="absolute inset-x-0 top-full z-30 -mt-px overflow-hidden rounded-b-atlas border border-t-0 border-atlas-border bg-atlas-surface shadow-[0_14px_30px_rgba(17,17,17,0.14),0_4px_10px_rgba(17,17,17,0.06)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.55)]">
                        <ul className="max-h-44 divide-y divide-atlas-border overflow-y-auto">
                          {suggestions.map((item) => {
                            const selected = selectedIds.has(item.id);
                            return (
                              <li key={item.id}>
                                <button
                                  type="button"
                                  disabled={selected || adding}
                                  onClick={() => void addSuggestion(item)}
                                  className="flex w-full items-center justify-between px-3 py-2.5 text-right hover:bg-atlas-surface-muted disabled:opacity-45"
                                >
                                  <span className="text-body text-atlas-ink">
                                    {item.name}
                                  </span>
                                  <span className="text-caption text-atlas-primary">
                                    {selected ? "✓" : "+"}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                          {canAdd &&
                          !suggestions.some(
                            (s) =>
                              normalizePersian(s.name) ===
                              normalizePersian(trimmed),
                          ) ? (
                            <li>
                              <button
                                type="button"
                                disabled={adding}
                                onClick={() => void addTyped()}
                                className="flex w-full items-center justify-between bg-atlas-primary-soft/70 px-3 py-2.5 text-right hover:bg-atlas-primary-soft"
                              >
                                <span className="text-body font-semibold text-atlas-ink">
                                  افزودن «{trimmed}»
                                </span>
                                <Add size={18} color="#D4022F" variant="Bold" />
                              </button>
                            </li>
                          ) : null}
                          {!searching &&
                          suggestions.length === 0 &&
                          trimmed &&
                          !inCatalog ? (
                            <li className="px-3 py-3 text-caption font-medium text-atlas-danger">
                              مواد اولیه اشتباه است
                            </li>
                          ) : null}
                          {!searching &&
                          suggestions.length === 0 &&
                          !canAdd &&
                          inCatalog ? (
                            <li className="px-3 py-3 text-caption text-atlas-ink-faint">
                              موردی پیدا نشد
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={openMoreSettings}
                    aria-label="تنظیمات"
                    className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-atlas border border-atlas-border bg-atlas-surface text-atlas-ink-muted transition hover:border-atlas-border-strong hover:bg-atlas-surface-muted hover:text-atlas-ink"
                  >
                    <Setting4 size={22} color="currentColor" variant="Outline" />
                    {advancedCount > 0 ? (
                      <span className="absolute -left-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-atlas-primary px-0.5 text-[11px] font-medium leading-none text-white">
                        {toPersianDigits(advancedCount)}
                      </span>
                    ) : null}
                  </button>
                </div>

                {addError ? (
                  <p className="text-caption text-atlas-danger">{addError}</p>
                ) : null}

              {inventory.length > 0 ? (
                <div
                  dir="rtl"
                  className="flex w-full flex-wrap items-center justify-start gap-2"
                >
                    {inventory.map((item) => (
                      <Chip
                        key={item.id}
                        ink
                        label={item.ingredient.name}
                        unusual={isUnusualIngredient(item.ingredient)}
                        onRemove={() => {
                          setInventory((prev) => {
                            const next = prev.filter((row) => row.id !== item.id);
                            pageCache.inventory = next;
                            return next;
                          });
                          if (item.id.startsWith("local-")) return;
                          void withApiSession(() =>
                            atlasClient.removeInventoryItem(item.id),
                          ).then(reloadInventory);
                        }}
                      />
                    ))}
                    {inventory.length > 1 ? (
                      <button
                        type="button"
                        aria-label="حذف همه مواد"
                        disabled={adding}
                        onClick={() => void clearAllIngredients()}
                        className="inline-flex flex-row items-center gap-1 rounded-xl px-2.5 py-2 text-caption font-semibold text-atlas-danger transition hover:bg-atlas-danger-soft disabled:opacity-50"
                        dir="ltr"
                      >
                        <CloseCircle
                          size={16}
                          color="currentColor"
                          variant="Bold"
                        />
                        <span dir="rtl">حذف همه</span>
                      </button>
                    ) : null}
                </div>
              ) : null}

              {inventory.length > 0 ? (
                <Button
                  size="lg"
                  className="w-full text-[14px] font-medium"
                  icon={<ArrowLeft size={18} color="currentColor" />}
                  onClick={goToFoodList}
                >
                  بزن بریم
                </Button>
              ) : null}
              {/* disabled بزن بریم — hidden until ingredients exist
              <Button
                size="lg"
                className="w-full text-[14px] font-medium"
                disabled={inventory.length === 0}
                icon={<ArrowLeft size={18} color="currentColor" />}
                onClick={goToFoodList}
              >
                بزن بریم
              </Button>
              */}
          </div>
        </section>

        <HomeBannerSlider />

        <div className="space-y-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[16px] font-medium text-atlas-ink">دستورهای محبوب</h3>
              <Heart size={11} color="#D4022F" variant="Bold" />
            </div>
            <Link
              href="/recommendations"
              dir="ltr"
              className="inline-flex items-center gap-1 text-caption text-atlas-primary"
            >
              <ArrowLeft2 size={14} color="currentColor" />
              <span dir="rtl">همه</span>
            </Link>
          </div>
          <div className="space-y-3">
            {popular.map((card) => (
              <AuthLink
                key={card.recipeId}
                href={`/recipes/${card.slug}`}
                className="block w-full text-right"
              >
                <div
                  className="flex w-full items-center gap-3 overflow-hidden rounded-atlas-lg p-2 shadow-[0_12px_32px_rgba(20,40,80,0.09),0_3px_10px_rgba(20,40,80,0.05)] dark:shadow-[0_14px_32px_rgba(8,16,40,0.32)]"
                  style={{ backgroundColor: "var(--atlas-surface)" }}
                >
                <RecipeImage
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-20 w-20 shrink-0 rounded-atlas"
                  width={160}
                />
                <div className="min-w-0 flex-1 py-0.5 pl-1">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <p className="line-clamp-2 min-w-0 flex-1 text-[15px] font-semibold leading-5 text-atlas-ink">
                      {card.title}
                    </p>
                    <span className="mt-0.5 shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25">
                      {card.cuisine}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <SoftTag
                      tone="white"
                      size="sm"
                      rounded="md"
                      iconEnd
                      icon={<Timer1 size={11} color="currentColor" />}
                      label={formatMinutesFa(card.totalMinutes)}
                    />
                    <SoftTag
                      tone="white"
                      size="sm"
                      rounded="md"
                      iconEnd
                      icon={<People size={11} color="currentColor" />}
                      label={`${toPersianDigits(card.servings)} نفر`}
                    />
                  </div>
                </div>
                </div>
              </AuthLink>
            ))}
          </div>
        </section>
        </div>
      </div>
      )}

      <BottomSheet
        open={moreOpen}
        title="تنظیمات"
        titleClassName="text-[15px] font-medium"
        tall
        onClose={() => setMoreOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button
              className="flex-[1.4]"
              onClick={applyMoreSettings}
              icon={<TickCircle size={18} color="currentColor" variant="Bold" />}
            >
              تایید
            </Button>
            <Button
              variant="tertiary"
              className="flex-1"
              onClick={resetMoreSettings}
              icon={<Trash size={18} color="currentColor" variant="Bold" />}
            >
              پاک کردن
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pb-2">
          <div className="space-y-2">
            <SettingsHeading icon={Coffee}>وعده</SettingsHeading>
            <OptionChips
              options={mealOptions}
              value={draftMeal}
              onChange={setDraftMeal}
              labelOf={(m) => mealLabelFa[m]}
            />
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Timer1}>زمان در دسترس (دقیقه)</SettingsHeading>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDraftMaxMinutes(mins)}
                  className={`rounded-lg px-3 py-1.5 text-caption transition ${
                    draftMaxMinutes === mins
                      ? "bg-atlas-chip-active font-bold text-atlas-chip-active-text"
                      : "bg-zinc-50 font-medium text-atlas-ink-muted ring-1 ring-zinc-200/90 dark:bg-atlas-surface-muted/40 dark:ring-atlas-border"
                  }`}
                >
                  {toPersianDigits(mins)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Heart}>رژیم غذایی</SettingsHeading>
            <OptionChips
              options={dietModes}
              value={draftDietMode}
              onChange={setDraftDietMode}
              labelOf={(m) => dietModeLabelFa[m]}
            />
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Category}>نوع غذا</SettingsHeading>
            <OptionChips
              options={dishTypes}
              value={draftDishType}
              onChange={setDraftDishType}
              labelOf={(t) => dishTypeLabelFa[t]}
            />
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Chart}>سختی پخت</SettingsHeading>
            <OptionChips
              options={difficulties}
              value={draftDifficulty}
              onChange={setDraftDifficulty}
              labelOf={(d) => (d === "any" ? "همه" : difficultyLabelFa[d])}
            />
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Global}>سبک آشپزی</SettingsHeading>
            <OptionChips
              options={cuisineOptions}
              value={draftCuisine}
              onChange={setDraftCuisine}
              labelOf={(c) => (c === "any" ? "همه" : c)}
            />
          </div>

          <div className="space-y-2">
            <SettingsHeading icon={Like1}>ترجیحات</SettingsHeading>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map((tag) => {
                const active = draftPreferences.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePreference(tag)}
                    className={`rounded-lg px-3 py-1.5 text-caption transition ${
                      active
                        ? "bg-atlas-primary font-bold text-white shadow-sm"
                        : "bg-zinc-50 font-medium text-atlas-ink-muted ring-1 ring-zinc-200/90 dark:bg-atlas-surface-muted/40 dark:ring-atlas-border"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setDraftBudgetFriendly((v) => !v)}
                className={`rounded-lg px-3 py-1.5 text-caption transition ${
                  draftBudgetFriendly
                    ? "bg-atlas-primary font-bold text-white shadow-sm"
                    : "bg-zinc-50 font-medium text-atlas-ink-muted ring-1 ring-zinc-200/90 dark:bg-atlas-surface-muted/40 dark:ring-atlas-border"
                }`}
              >
                اقتصادی
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>
      <BottomToast
        open={Boolean(toast)}
        title={toast?.title ?? ""}
        message={toast?.message ?? ""}
        onClose={() => setToast(null)}
      />
    </AppShell>
  );
}
