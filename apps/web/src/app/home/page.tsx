"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  greetingFa,
  mealLabelFa,
  normalizePersian,
  toPersianDigits,
} from "@atlas/shared";
import {
  Add,
  ArrowLeft,
  ArrowLeft2,
  Microphone2,
  People,
  Stop,
  SearchNormal1,
  Setting4,
  TickCircle,
  Timer1,
  Trash,
} from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SoftTag } from "@/components/ui/SoftTag";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { useIngredientVoiceInput } from "@/hooks/useIngredientVoiceInput";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";

const mealOptions: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];
const timeOptions = [15, 30, 45, 60, 90];
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

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(() => pageCache.inventory === null);
  const [popular, setPopular] = useState<RecommendationCard[]>(
    () => pageCache.popular ?? [],
  );
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(
    () => pageCache.inventory ?? [],
  );
  const [adding, setAdding] = useState(false);
  const [searching, setSearching] = useState(false);
  const [meal, setMeal] = useState<MealType>("any");
  const [maxMinutes, setMaxMinutes] = useState(45);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dietMode, setDietMode] = useState<DietMode>("any");
  const [dishType, setDishType] = useState<DishType>("any");
  const [difficulty, setDifficulty] = useState<Difficulty | "any">("any");
  const [cuisine, setCuisine] = useState("any");
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [draftMeal, setDraftMeal] = useState<MealType>("any");
  const [draftMaxMinutes, setDraftMaxMinutes] = useState(45);
  const [draftDietMode, setDraftDietMode] = useState<DietMode>("any");
  const [draftDishType, setDraftDishType] = useState<DishType>("any");
  const [draftDifficulty, setDraftDifficulty] = useState<Difficulty | "any">(
    "any",
  );
  const [draftCuisine, setDraftCuisine] = useState("any");
  const [draftBudgetFriendly, setDraftBudgetFriendly] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const inv = await atlasClient.getInventory();
        if (!cancelled) {
          pageCache.inventory = inv;
          setInventory(inv);
          setLoading(false);
        }
        const rec = await atlasClient.getRecommendations({
          meal: "any",
          maxMinutes: 60,
        });
        if (!cancelled) {
          const cards = [...rec.exact, ...rec.near, ...rec.discovery].slice(
            0,
            4,
          );
          pageCache.popular = cards;
          setPopular(cards);
        }
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
  const canAdd =
    Boolean(trimmed) && !selectedNames.has(normalizePersian(trimmed));

  const advancedCount = useMemo(() => {
    let n = 0;
    if (meal !== "any") n += 1;
    if (maxMinutes !== 45) n += 1;
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
    const inv = await atlasClient.getInventory();
    pageCache.inventory = inv;
    setInventory(inv);
  }

  const voice = useIngredientVoiceInput({
    onTranscript: async (transcript) => {
      setAdding(true);
      try {
        await atlasClient.addIngredientsFromSpeech(transcript);
        await reloadInventory();
        setQuery("");
      } finally {
        setAdding(false);
      }
    },
  });

  async function addTyped() {
    if (!canAdd) return;
    setAdding(true);
    try {
      await atlasClient.addIngredientByName(trimmed);
      await reloadInventory();
      setQuery("");
    } finally {
      setAdding(false);
    }
  }

  async function addSuggestion(item: Ingredient) {
    if (selectedIds.has(item.id)) return;
    setAdding(true);
    try {
      await atlasClient.addInventoryItem(item.id);
      await reloadInventory();
      setQuery("");
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
    setDraftMaxMinutes(45);
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
    router.push(`/recommendations?${params.toString()}`);
  }

  return (
    <AppShell
      brandAside={
        <div className="min-w-0 leading-tight">
          <p className="text-[11px] text-atlas-ink-muted">سلام احمد!</p>
          <p className="truncate text-[13px] font-bold text-atlas-ink">
            {greetingFa()} 👋
          </p>
        </div>
      }
    >
      {loading ? (
        <HomeSkeleton />
      ) : (
      <div className="pb-8 pt-1">
        <section className="relative z-10 mb-5">
          <div className="rounded-atlas-xl bg-atlas-surface px-5 pb-6 pt-6 shadow-[0_18px_40px_rgba(17,17,17,0.14),0_6px_14px_rgba(17,17,17,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div className="relative z-10 flex items-center gap-2.5">
              <img
                src="/icons/fridge-mascot.png"
                alt=""
                width={88}
                height={88}
                className="h-[4.6rem] w-[4.6rem] shrink-0 object-contain"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-right">
                <h3 className="text-[1.45rem] font-extrabold leading-8 tracking-tight text-atlas-ink sm:text-[1.55rem]">
                  چیا تو یخچال داری ؟!
                </h3>
                <p className="truncate text-[12px] leading-4 text-atlas-ink-muted">
                  هر موادی داری بگو یا تایپ کن تا من بگم چی درست کن
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative flex h-[5.75rem] w-[5.75rem] items-center justify-center">
                    {voice.listening ? (
                      <>
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full border-2 border-atlas-primary/35"
                          style={{ animation: "micRing 1.4s ease-out infinite" }}
                        />
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full border border-atlas-primary/25"
                          style={{
                            animation: "micRing 1.4s ease-out infinite 0.35s",
                          }}
                        />
                      </>
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
                      disabled={adding && !voice.listening}
                      aria-label={
                        voice.listening
                          ? "پایان ضبط"
                          : "افزودن مواد با صدا"
                      }
                      className={`relative z-10 inline-flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-white transition active:scale-95 disabled:opacity-50 ${
                        voice.listening
                          ? "scale-110 bg-[#E11D2E] shadow-[0_12px_32px_rgba(225,29,46,0.45)]"
                          : "bg-atlas-primary shadow-[0_10px_28px_rgba(255,55,55,0.35)]"
                      }`}
                    >
                      <span className="relative z-10">
                        {voice.listening ? (
                          <Stop size={28} color="currentColor" variant="Bold" />
                        ) : (
                          <Microphone2
                            size={30}
                            color="currentColor"
                            variant="Bold"
                          />
                        )}
                      </span>
                    </button>
                    {voice.listening ? (
                      <div className="pointer-events-none absolute -bottom-0.5 flex h-5 items-end gap-[3px]">
                        {[0, 1, 2, 3, 4].map((i) => {
                          const wave =
                            0.25 +
                            voice.volume *
                              (0.55 + 0.35 * Math.sin(i * 1.4 + voice.volume * 8));
                          return (
                            <span
                              key={i}
                              className="w-[3px] origin-bottom rounded-full bg-atlas-primary"
                              style={{
                                height: `${6 + wave * 14}px`,
                                opacity: 0.55 + wave * 0.45,
                                animation:
                                  voice.engineMode === "native"
                                    ? undefined
                                    : `micBar 0.7s ease-in-out ${i * 0.08}s infinite`,
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <p className="text-center text-[12px] font-medium text-atlas-ink-faint">
                  {voice.listening && voice.interim
                    ? voice.interim
                    : voice.processing
                      ? "…"
                      : "یا"}
                </p>

                <div className="flex items-start gap-2">
                  <div className="relative min-w-0 flex-1">
                    <span className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-atlas-ink-faint">
                      <SearchNormal1 size={18} color="currentColor" />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void addTyped();
                        }
                      }}
                      placeholder="مثلا گوجه، تخم‌مرغ، عدس…"
                      className={`h-11 w-full border border-atlas-border bg-atlas-surface py-2 pr-10 pl-3 text-body text-atlas-ink outline-none focus:border-atlas-primary ${
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
                                <Add size={18} color="#FF3737" variant="Bold" />
                              </button>
                            </li>
                          ) : null}
                          {!searching &&
                          suggestions.length === 0 &&
                          !canAdd ? (
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
                    className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-atlas border border-atlas-border bg-atlas-surface text-atlas-ink-muted transition hover:border-atlas-border-strong hover:bg-atlas-surface-muted hover:text-atlas-ink"
                  >
                    <Setting4 size={20} color="currentColor" variant="Outline" />
                    {advancedCount > 0 ? (
                      <span className="absolute -left-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-atlas-primary px-1 text-[10px] font-bold leading-none text-white">
                        {toPersianDigits(advancedCount)}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              {inventory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inventory.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.ingredient.name}
                      onRemove={() =>
                        void atlasClient
                          .removeInventoryItem(item.id)
                          .then(reloadInventory)
                      }
                    />
                  ))}
                </div>
              ) : null}

              <Button
                size="lg"
                className="w-full"
                disabled={inventory.length === 0}
                icon={<ArrowLeft size={20} color="currentColor" />}
                onClick={goToFoodList}
              >
                بزن بریم
              </Button>
            </div>
          </div>
        </section>

        <div className="space-y-5">
        <Link
          href="/search"
          prefetch
          className="flex h-11 items-center gap-2 rounded-atlas border border-atlas-border bg-atlas-surface px-4 text-[13px] text-atlas-ink-faint"
        >
          <SearchNormal1 size={18} color="currentColor" />
          جستجوی غذا
        </Link>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[1.05rem] font-bold text-atlas-ink">دستورهای محبوب</h3>
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
              <Link
                key={card.recipeId}
                href={`/recipes/${card.slug}`}
                className="flex items-center gap-3 overflow-hidden rounded-atlas-lg bg-atlas-surface p-2 shadow-[0_2px_8px_rgba(17,17,17,0.06)]"
              >
                <RecipeImage
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-20 w-20 shrink-0 rounded-atlas"
                  width={160}
                />
                <div className="min-w-0 flex-1 py-0.5 pl-1">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <p className="line-clamp-2 min-w-0 flex-1 text-[13px] font-semibold leading-5 text-atlas-ink">
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
                      iconEnd
                      icon={<Timer1 size={11} color="currentColor" />}
                      label={formatMinutesFa(card.totalMinutes)}
                    />
                    <SoftTag
                      tone="white"
                      size="sm"
                      iconEnd
                      icon={<People size={11} color="currentColor" />}
                      label={`${toPersianDigits(card.servings)} نفر`}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        </div>
      </div>
      )}

      <BottomSheet
        open={moreOpen}
        title="تنظیمات"
        tall
        onClose={() => setMoreOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button
              className="flex-[1.4]"
              onClick={applyMoreSettings}
              icon={<TickCircle size={18} color="currentColor" variant="Bold" />}
            >
              اعمال تنظیمات
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
            <p className="text-caption font-semibold text-atlas-ink-faint">وعده</p>
            <OptionChips
              options={mealOptions}
              value={draftMeal}
              onChange={setDraftMeal}
              labelOf={(m) => mealLabelFa[m]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-caption font-semibold text-atlas-ink-faint">
              زمان در دسترس (دقیقه)
            </p>
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
            <p className="text-caption font-semibold text-atlas-ink-faint">رژیم غذایی</p>
            <OptionChips
              options={dietModes}
              value={draftDietMode}
              onChange={setDraftDietMode}
              labelOf={(m) => dietModeLabelFa[m]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-caption font-semibold text-atlas-ink-faint">نوع غذا</p>
            <OptionChips
              options={dishTypes}
              value={draftDishType}
              onChange={setDraftDishType}
              labelOf={(t) => dishTypeLabelFa[t]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-caption font-semibold text-atlas-ink-faint">سختی پخت</p>
            <OptionChips
              options={difficulties}
              value={draftDifficulty}
              onChange={setDraftDifficulty}
              labelOf={(d) => (d === "any" ? "همه" : difficultyLabelFa[d])}
            />
          </div>

          <div className="space-y-2">
            <p className="text-caption font-semibold text-atlas-ink-faint">سبک آشپزی</p>
            <OptionChips
              options={cuisineOptions}
              value={draftCuisine}
              onChange={setDraftCuisine}
              labelOf={(c) => (c === "any" ? "همه" : c)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-caption font-semibold text-atlas-ink-faint">ترجیحات</p>
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
    </AppShell>
  );
}
