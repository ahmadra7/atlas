"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type {
  AdminRecipeDetail,
  AdminRecipeHeader,
  AdminRecipeIngredient,
  Difficulty,
  MealType,
  RecipeStep,
} from "@atlas/contracts";
import {
  createAdminRecipe,
  deleteAdminRecipe,
  getAdminRecipe,
  getAdminSecret,
  listAdminRecipes,
  searchAdminIngredients,
  setAdminSecret,
  updateAdminRecipe,
} from "@/lib/admin-api";

type EditorTab = "overview" | "ingredients" | "steps";
type StatusFilter = "all" | "published" | "draft";

const MEALS: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "صبحانه" },
  { value: "lunch", label: "ناهار" },
  { value: "dinner", label: "شام" },
  { value: "snack", label: "میان‌وعده" },
  { value: "any", label: "همه" },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: "easy", label: "آسان" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "سخت" },
];

function emptyRecipe(): AdminRecipeDetail {
  return {
    id: "",
    slug: "",
    title: "",
    description: "",
    category: "غذای اصلی",
    subcategory: "",
    meal: "lunch",
    cuisine: "ایرانی",
    region: "",
    difficulty: "medium",
    prepMinutes: 15,
    cookMinutes: 30,
    totalMinutes: 45,
    servings: 4,
    imageUrl: "",
    caloriesPerServing: null,
    cookingMethod: "",
    dietaryTags: [],
    budgetFriendly: false,
    verified: false,
    published: true,
    versionId: "",
    versionNumber: 0,
    ingredients: [
      { ingredientId: "", name: "", quantity: "", unit: "", optional: false },
    ],
    steps: [
      {
        id: "new-1",
        order: 1,
        instruction: "",
        tip: null,
        timerSeconds: null,
        imageUrl: null,
      },
    ],
    createdAt: "",
    updatedAt: "",
  };
}

function toPayload(draft: AdminRecipeDetail) {
  const ingredients = draft.ingredients
    .map((line) => ({
      ingredientId: line.ingredientId || undefined,
      name: line.name.trim(),
      quantity: line.quantity?.trim() || undefined,
      unit: line.unit?.trim() || undefined,
      optional: Boolean(line.optional),
    }))
    .filter((line) => line.name.length > 0);

  const steps = draft.steps
    .map((step) => ({
      instruction: step.instruction.trim(),
      tip: step.tip?.trim() || undefined,
      timerSeconds: step.timerSeconds ?? undefined,
      imageUrl: step.imageUrl?.trim() || undefined,
    }))
    .filter((step) => step.instruction.length > 0);

  return {
    title: draft.title.trim(),
    slug: draft.slug.trim() || undefined,
    description: draft.description.trim(),
    category: draft.category.trim(),
    subcategory: draft.subcategory?.trim() || undefined,
    meal: draft.meal,
    cuisine: draft.cuisine.trim(),
    region: draft.region?.trim() || undefined,
    difficulty: draft.difficulty,
    prepMinutes: Number(draft.prepMinutes) || 0,
    cookMinutes: Number(draft.cookMinutes) || 0,
    totalMinutes:
      Number(draft.totalMinutes) ||
      Number(draft.prepMinutes) + Number(draft.cookMinutes),
    servings: Number(draft.servings) || 1,
    imageUrl: draft.imageUrl.trim(),
    caloriesPerServing: draft.caloriesPerServing ?? undefined,
    cookingMethod: draft.cookingMethod?.trim() || undefined,
    dietaryTags: draft.dietaryTags.map((t) => t.trim()).filter(Boolean),
    budgetFriendly: draft.budgetFriendly,
    verified: draft.verified,
    published: draft.published,
    ingredients,
    steps,
  };
}

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

function StatusBadge({
  published,
  verified,
}: {
  published: boolean;
  verified?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
          published
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15"
            : "bg-amber-50 text-amber-800 ring-1 ring-amber-600/15"
        }`}
      >
        {published ? "منتشر" : "پیش‌نویس"}
      </span>
      {verified ? (
        <span className="inline-flex items-center rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600 ring-1 ring-stone-500/10">
          تأیید
        </span>
      ) : null}
    </span>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}

function SectionCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--admin-line)] bg-white shadow-[0_1px_0_rgba(20,17,15,0.04)]">
      <header className="flex items-start justify-between gap-3 border-b border-[var(--admin-line)] bg-stone-50/70 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-extrabold text-stone-900">{title}</h3>
          {hint ? <p className="mt-0.5 text-[11px] text-stone-500">{hint}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function RecipeAdminDashboard() {
  const [secretInput, setSecretInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [list, setList] = useState<AdminRecipeHeader[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(40);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminRecipeDetail | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tab, setTab] = useState<EditorTab>("overview");
  const [ingQuery, setIngQuery] = useState("");
  const [ingIndex, setIngIndex] = useState<number | null>(null);
  const [ingHits, setIngHits] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const mealLabel = useMemo(
    () => Object.fromEntries(MEALS.map((m) => [m.value, m.label])),
    [],
  );

  const dirty = useMemo(() => {
    if (!draft || baseline === null) return false;
    return JSON.stringify(toPayload(draft)) !== baseline;
  }, [draft, baseline]);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await listAdminRecipes({ q, page, limit, status });
      setList(data.items);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطا در خواندن لیست";
      setError(message);
      if (message.includes("کلید مدیریت")) setUnlocked(false);
    } finally {
      setLoadingList(false);
    }
  }, [q, page, limit, status]);

  useEffect(() => {
    const stored = getAdminSecret();
    if (stored) {
      setSecretInput(stored);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    void loadList();
  }, [unlocked, loadList]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQ(searchInput);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!ingQuery.trim() || ingIndex === null) {
      setIngHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchAdminIngredients(ingQuery)
        .then(setIngHits)
        .catch(() => setIngHits([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [ingQuery, ingIndex]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(t);
  }, [notice]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setAdminSecret(secretInput.trim() || "atlas-local-admin");
    setUnlocked(true);
  }

  function adoptDraft(detail: AdminRecipeDetail, id: string) {
    setDraft(detail);
    setSelectedId(id);
    setTagInput(detail.dietaryTags.join("، "));
    setBaseline(JSON.stringify(toPayload(detail)));
    setTab("overview");
  }

  async function openRecipe(id: string) {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده دارید. ادامه می‌دهید؟")) {
      return;
    }
    setSelectedId(id);
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await getAdminRecipe(id);
      adoptDraft(detail, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در خواندن غذا");
    } finally {
      setLoadingDetail(false);
    }
  }

  function startCreate() {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده دارید. ادامه می‌دهید؟")) {
      return;
    }
    const next = emptyRecipe();
    adoptDraft(next, "new");
  }

  function patch(partial: Partial<AdminRecipeDetail>) {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  function patchIngredient(
    index: number,
    partial: Partial<AdminRecipeIngredient>,
  ) {
    setDraft((prev) => {
      if (!prev) return prev;
      const ingredients = prev.ingredients.map((line, i) =>
        i === index ? { ...line, ...partial } : line,
      );
      return { ...prev, ingredients };
    });
  }

  function patchStep(index: number, partial: Partial<RecipeStep>) {
    setDraft((prev) => {
      if (!prev) return prev;
      const steps = prev.steps.map((step, i) =>
        i === index ? { ...step, ...partial } : step,
      );
      return { ...prev, steps };
    });
  }

  async function save() {
    if (!draft) return;
    const payload = toPayload(draft);
    if (!payload.title) {
      setError("عنوان غذا لازم است.");
      setTab("overview");
      return;
    }
    if (payload.ingredients.length < 1) {
      setError("حداقل یک ماده لازم است.");
      setTab("ingredients");
      return;
    }
    if (payload.steps.length < 1) {
      setError("حداقل یک مرحله لازم است.");
      setTab("steps");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved =
        draft.id && selectedId !== "new"
          ? await updateAdminRecipe(draft.id, payload)
          : await createAdminRecipe(payload);
      adoptDraft(saved, saved.id);
      setNotice("در دیتابیس اصلی ذخیره شد — در اپ محلی قابل مشاهده است.");
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره نشد");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft?.id || selectedId === "new") return;
    if (
      !window.confirm(
        `«${draft.title}» برای همیشه از دیتابیس اصلی حذف شود؟`,
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteAdminRecipe(draft.id);
      setDraft(null);
      setSelectedId(null);
      setBaseline(null);
      setNotice("غذا حذف شد.");
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف نشد");
    } finally {
      setSaving(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-svh items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -start-24 top-16 h-72 w-72 rounded-full bg-[var(--admin-accent)]/10 blur-3xl" />
          <div className="absolute -end-16 bottom-10 h-80 w-80 rounded-full bg-stone-900/10 blur-3xl" />
        </div>
        <div className="admin-slide-up relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--admin-line)] bg-white shadow-[0_24px_80px_rgba(20,17,15,0.12)]">
          <div className="border-b border-[var(--admin-line)] bg-stone-950 px-7 py-6 text-white">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55">
              ATLAS LOCAL
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight">
              کنسول کاتالوگ غذا
            </h1>
            <p className="mt-2 text-sm leading-7 text-white/65">
              مدیریت کامل دستورها روی Postgres محلی — بدون هاست و دامنه.
            </p>
          </div>
          <form onSubmit={unlock} className="space-y-4 px-7 py-6">
            {error ? (
              <p className="rounded-xl bg-red-50 px-3.5 py-3 text-[13px] leading-6 text-red-700 ring-1 ring-red-600/10">
                {error}
              </p>
            ) : null}
            <Field label="کلید مدیریت محلی">
              <input
                className="admin-field"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="atlas-local-admin"
                autoFocus
              />
            </Field>
            <p className="text-[11px] leading-5 text-stone-500">
              از{" "}
              <code className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px]">
                apps/api/.env → ADMIN_SECRET
              </code>
            </p>
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--admin-accent)] py-3 text-sm font-bold text-white transition hover:brightness-95 active:scale-[0.99]"
            >
              ورود به کنسول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="z-20 shrink-0 border-b border-[var(--admin-line)] bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-[11px] font-black tracking-wide text-white">
              AT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[15px] font-extrabold">
                  کنسول کاتالوگ
                </h1>
                <span className="hidden rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500 sm:inline">
                  LOCAL
                </span>
              </div>
              <p className="truncate text-[11px] text-stone-500">
                سرآشپز هوشمند · همگام با دیتابیس اپ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/home"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-[var(--admin-line)] px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 sm:inline-flex"
            >
              مشاهده اپ
            </a>
            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-[var(--admin-accent)] px-3.5 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(212,2,47,0.22)] transition hover:brightness-95"
            >
              غذای جدید
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-[var(--admin-line)] bg-[var(--admin-line)] sm:grid-cols-4">
          {[
            { label: "کل کاتالوگ", value: faNum(total) },
            {
              label: "صفحه جاری",
              value: `${faNum(page)} / ${faNum(pages)}`,
            },
            {
              label: "در این صفحه",
              value: faNum(list.length),
            },
            {
              label: "وضعیت ویرایش",
              value: dirty ? "تغییر ذخیره‌نشده" : "همگام",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white px-4 py-2.5 sm:px-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                {stat.label}
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-stone-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      {(error || notice) && (
        <div className="admin-fade-in shrink-0 px-5 pt-3 lg:px-7">
          {error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-600/10">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800 ring-1 ring-emerald-600/10">
              {notice}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-l border-[var(--admin-line)] bg-white">
          <div className="space-y-3 border-b border-[var(--admin-line)] p-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-stone-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="admin-field !ps-9"
                placeholder="جستجو در عنوان، دسته، اسلاگ…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1">
              {(
                [
                  ["all", "همه"],
                  ["published", "منتشر"],
                  ["draft", "پیش‌نویس"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(value);
                  }}
                  className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                    status === value
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-scroll min-h-0 flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="admin-skeleton h-14 w-14 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="admin-skeleton h-3 w-3/4" />
                      <div className="admin-skeleton h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-bold text-stone-700">نتیجه‌ای نیست</p>
                <p className="mt-1 text-xs text-stone-500">
                  فیلتر یا عبارت جستجو را عوض کنید.
                </p>
              </div>
            ) : (
              <ul>
                {list.map((item, index) => {
                  const active = selectedId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="admin-row-enter"
                      style={{ animationDelay: `${Math.min(index, 12) * 18}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => void openRecipe(item.id)}
                        className={`group flex w-full gap-3 border-b border-[var(--admin-line)] px-4 py-3 text-right transition ${
                          active
                            ? "bg-[var(--admin-accent-soft)]"
                            : "hover:bg-stone-50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100 bg-cover bg-center ring-1 ring-inset ring-black/5 ${
                            active ? "ring-[var(--admin-accent)]/30" : ""
                          }`}
                          style={{
                            backgroundImage: item.imageUrl
                              ? `url(${item.imageUrl})`
                              : undefined,
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate text-[13px] font-bold text-stone-900">
                              {item.title}
                            </span>
                            <StatusBadge
                              published={item.published}
                              verified={item.verified}
                            />
                          </span>
                          <span className="mt-1 block truncate text-[11px] text-stone-500">
                            {item.category}
                            {item.subcategory ? ` / ${item.subcategory}` : ""} ·{" "}
                            {mealLabel[item.meal]}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] font-semibold text-stone-400">
                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                              {item.totalMinutes} دقیقه
                            </span>
                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                              {item.ingredientCount} ماده
                            </span>
                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                              {item.stepCount} مرحله
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--admin-line)] bg-stone-50/80 px-4 py-3">
            <p className="text-[11px] font-medium text-stone-500">
              {faNum(total)} غذا
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[var(--admin-line)] bg-white px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-35"
              >
                قبلی
              </button>
              <span className="min-w-14 text-center text-[11px] font-bold text-stone-600">
                {faNum(page)}/{faNum(pages)}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--admin-line)] bg-white px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-35"
              >
                بعدی
              </button>
            </div>
          </div>
        </aside>

        <main className="admin-scroll relative min-h-0 overflow-y-auto">
          {!draft && !loadingDetail ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="admin-slide-up max-w-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16M4 12h10M4 17h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2 className="mt-5 text-lg font-extrabold">
                  جزئیات دستور را باز کنید
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-500">
                  از فهرست سمت راست یک غذا انتخاب کنید، یا با «غذای جدید» مورد تازه
                  بسازید. هر ذخیره مستقیم روی دیتابیس اصلی می‌نشیند.
                </p>
                <button
                  type="button"
                  onClick={startCreate}
                  className="mt-5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white"
                >
                  شروع با غذای جدید
                </button>
              </div>
            </div>
          ) : null}

          {loadingDetail ? (
            <div className="space-y-4 p-6 lg:p-8">
              <div className="admin-skeleton h-10 w-1/2" />
              <div className="admin-skeleton h-40 w-full" />
              <div className="admin-skeleton h-64 w-full" />
            </div>
          ) : null}

          {draft ? (
            <form
              className="admin-fade-in flex min-h-full flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <div className="sticky top-0 z-10 border-b border-[var(--admin-line)] bg-white/95 px-5 py-4 backdrop-blur-md lg:px-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-semibold text-stone-400">
                        {selectedId === "new"
                          ? "ایجاد"
                          : `نسخه ${faNum(draft.versionNumber)}`}
                      </p>
                      {dirty ? (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-600/15">
                          ویرایش‌شده
                        </span>
                      ) : null}
                      <StatusBadge
                        published={draft.published}
                        verified={draft.verified}
                      />
                    </div>
                    <h2 className="mt-1 truncate text-xl font-extrabold tracking-tight">
                      {selectedId === "new"
                        ? "غذای جدید"
                        : draft.title || "بدون عنوان"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.id && selectedId !== "new" ? (
                      <button
                        type="button"
                        onClick={() => void remove()}
                        className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        حذف
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      disabled={saving || !dirty}
                      className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(212,2,47,0.2)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {saving ? "در حال ذخیره…" : "ذخیره در دیتابیس"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-1 rounded-xl bg-stone-100 p-1">
                  {(
                    [
                      ["overview", "مشخصات"],
                      ["ingredients", `مواد (${faNum(draft.ingredients.length)})`],
                      ["steps", `مراحل (${faNum(draft.steps.length)})`],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value)}
                      className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition ${
                        tab === value
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-5 px-5 py-5 pb-28 lg:px-8 lg:py-7">
                {tab === "overview" ? (
                  <div className="admin-slide-up grid gap-5 xl:grid-cols-[1fr_280px]">
                    <div className="space-y-5">
                      <SectionCard
                        title="هویت دستور"
                        hint="عنوان، اسلاگ و توضیح برای اپ و جستجو"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="عنوان" className="md:col-span-2">
                            <input
                              className="admin-field"
                              value={draft.title}
                              onChange={(e) => patch({ title: e.target.value })}
                            />
                          </Field>
                          <Field label="اسلاگ">
                            <input
                              className="admin-field"
                              value={draft.slug}
                              onChange={(e) => patch({ slug: e.target.value })}
                              placeholder="خودکار از عنوان"
                              dir="ltr"
                            />
                          </Field>
                          <Field label="دسته‌بندی">
                            <input
                              className="admin-field"
                              value={draft.category}
                              onChange={(e) =>
                                patch({ category: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="زیردسته">
                            <input
                              className="admin-field"
                              value={draft.subcategory ?? ""}
                              onChange={(e) =>
                                patch({ subcategory: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="آشپزی">
                            <input
                              className="admin-field"
                              value={draft.cuisine}
                              onChange={(e) =>
                                patch({ cuisine: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="توضیح" className="md:col-span-2">
                            <textarea
                              className="admin-field min-h-28"
                              value={draft.description}
                              onChange={(e) =>
                                patch({ description: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                      </SectionCard>

                      <SectionCard title="زمان، وعده و پخت">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label="وعده">
                            <select
                              className="admin-field"
                              value={draft.meal}
                              onChange={(e) =>
                                patch({ meal: e.target.value as MealType })
                              }
                            >
                              {MEALS.map((m) => (
                                <option key={m.value} value={m.value}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="سختی">
                            <select
                              className="admin-field"
                              value={draft.difficulty}
                              onChange={(e) =>
                                patch({
                                  difficulty: e.target.value as Difficulty,
                                })
                              }
                            >
                              {DIFFICULTIES.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="منطقه">
                            <input
                              className="admin-field"
                              value={draft.region ?? ""}
                              onChange={(e) =>
                                patch({ region: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="آماده‌سازی (دقیقه)">
                            <input
                              type="number"
                              className="admin-field"
                              value={draft.prepMinutes}
                              onChange={(e) =>
                                patch({ prepMinutes: Number(e.target.value) })
                              }
                            />
                          </Field>
                          <Field label="پخت (دقیقه)">
                            <input
                              type="number"
                              className="admin-field"
                              value={draft.cookMinutes}
                              onChange={(e) =>
                                patch({ cookMinutes: Number(e.target.value) })
                              }
                            />
                          </Field>
                          <Field label="کل زمان">
                            <input
                              type="number"
                              className="admin-field"
                              value={draft.totalMinutes}
                              onChange={(e) =>
                                patch({ totalMinutes: Number(e.target.value) })
                              }
                            />
                          </Field>
                          <Field label="نفرات">
                            <input
                              type="number"
                              className="admin-field"
                              value={draft.servings}
                              onChange={(e) =>
                                patch({ servings: Number(e.target.value) })
                              }
                            />
                          </Field>
                          <Field label="کالری هر پرس">
                            <input
                              type="number"
                              className="admin-field"
                              value={draft.caloriesPerServing ?? ""}
                              onChange={(e) =>
                                patch({
                                  caloriesPerServing: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                            />
                          </Field>
                          <Field label="روش پخت">
                            <input
                              className="admin-field"
                              value={draft.cookingMethod ?? ""}
                              onChange={(e) =>
                                patch({ cookingMethod: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="برچسب‌های رژیمی" className="sm:col-span-2 lg:col-span-3">
                            <input
                              className="admin-field"
                              value={tagInput}
                              onChange={(e) => {
                                setTagInput(e.target.value);
                                patch({
                                  dietaryTags: e.target.value
                                    .split(/[،,]/)
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                                });
                              }}
                              placeholder="مثلاً: گیاهی، کم‌چرب"
                            />
                          </Field>
                        </div>
                      </SectionCard>
                    </div>

                    <div className="space-y-5">
                      <SectionCard title="پیش‌نمایش تصویر">
                        <div
                          className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 bg-cover bg-center ring-1 ring-inset ring-black/5"
                          style={{
                            backgroundImage: draft.imageUrl
                              ? `url(${draft.imageUrl})`
                              : undefined,
                          }}
                        />
                        <Field label="آدرس تصویر" className="mt-4">
                          <input
                            className="admin-field"
                            value={draft.imageUrl}
                            onChange={(e) =>
                              patch({ imageUrl: e.target.value })
                            }
                            dir="ltr"
                          />
                        </Field>
                      </SectionCard>

                      <SectionCard
                        title="انتشار"
                        hint="وضعیت نمایش در اپ"
                      >
                        <div className="space-y-3">
                          {(
                            [
                              ["published", "منتشر در اپ", draft.published],
                              ["verified", "تأییدشده", draft.verified],
                              [
                                "budgetFriendly",
                                "اقتصادی",
                                draft.budgetFriendly,
                              ],
                            ] as const
                          ).map(([key, label, checked]) => (
                            <label
                              key={key}
                              className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--admin-line)] px-3.5 py-3 transition hover:bg-stone-50"
                            >
                              <span className="text-sm font-semibold">
                                {label}
                              </span>
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-[var(--admin-accent)]"
                                checked={checked}
                                onChange={(e) =>
                                  patch({ [key]: e.target.checked })
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </SectionCard>
                    </div>
                  </div>
                ) : null}

                {tab === "ingredients" ? (
                  <div className="admin-slide-up">
                    <SectionCard
                      title="مواد لازم"
                      hint="جستجوی کاتالوگ مواد هنگام تایپ نام"
                      action={
                        <button
                          type="button"
                          className="rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white"
                          onClick={() =>
                            patch({
                              ingredients: [
                                ...draft.ingredients,
                                {
                                  ingredientId: "",
                                  name: "",
                                  quantity: "",
                                  unit: "",
                                  optional: false,
                                },
                              ],
                            })
                          }
                        >
                          افزودن ماده
                        </button>
                      }
                    >
                      <div className="overflow-hidden rounded-xl border border-[var(--admin-line)]">
                        <div className="hidden grid-cols-[minmax(0,1.4fr)_7rem_7rem_5.5rem_3rem] gap-2 bg-stone-50 px-3 py-2 text-[10px] font-bold text-stone-500 md:grid">
                          <span>نام</span>
                          <span>مقدار</span>
                          <span>واحد</span>
                          <span>اختیاری</span>
                          <span />
                        </div>
                        <div className="divide-y divide-[var(--admin-line)]">
                          {draft.ingredients.map((line, index) => (
                            <div
                              key={`${line.ingredientId}-${index}`}
                              className="relative grid gap-2 p-3 md:grid-cols-[minmax(0,1.4fr)_7rem_7rem_5.5rem_3rem] md:items-center"
                            >
                              <input
                                className="admin-field"
                                placeholder="نام ماده"
                                value={line.name}
                                onChange={(e) => {
                                  patchIngredient(index, {
                                    name: e.target.value,
                                    ingredientId: "",
                                  });
                                  setIngIndex(index);
                                  setIngQuery(e.target.value);
                                }}
                                onFocus={() => {
                                  setIngIndex(index);
                                  setIngQuery(line.name);
                                }}
                              />
                              <input
                                className="admin-field"
                                placeholder="مقدار"
                                value={line.quantity ?? ""}
                                onChange={(e) =>
                                  patchIngredient(index, {
                                    quantity: e.target.value,
                                  })
                                }
                              />
                              <input
                                className="admin-field"
                                placeholder="واحد"
                                value={line.unit ?? ""}
                                onChange={(e) =>
                                  patchIngredient(index, {
                                    unit: e.target.value,
                                  })
                                }
                              />
                              <label className="flex items-center justify-center gap-2 text-xs text-stone-600">
                                <input
                                  type="checkbox"
                                  className="accent-[var(--admin-accent)]"
                                  checked={Boolean(line.optional)}
                                  onChange={(e) =>
                                    patchIngredient(index, {
                                      optional: e.target.checked,
                                    })
                                  }
                                />
                                <span className="md:hidden">اختیاری</span>
                              </label>
                              <button
                                type="button"
                                className="justify-self-end text-xs font-bold text-red-500"
                                onClick={() =>
                                  patch({
                                    ingredients: draft.ingredients.filter(
                                      (_, i) => i !== index,
                                    ),
                                  })
                                }
                              >
                                حذف
                              </button>
                              {ingIndex === index && ingHits.length > 0 ? (
                                <ul className="absolute start-3 top-[3.6rem] z-20 max-h-44 w-[min(100%,20rem)] overflow-y-auto rounded-xl border border-[var(--admin-line)] bg-white shadow-[0_16px_40px_rgba(20,17,15,0.14)]">
                                  {ingHits.map((hit) => (
                                    <li key={hit.id}>
                                      <button
                                        type="button"
                                        className="flex w-full items-center justify-between px-3 py-2.5 text-right text-sm hover:bg-stone-50"
                                        onClick={() => {
                                          patchIngredient(index, {
                                            name: hit.name,
                                            ingredientId: hit.id,
                                          });
                                          setIngHits([]);
                                          setIngIndex(null);
                                        }}
                                      >
                                        <span className="font-semibold">
                                          {hit.name}
                                        </span>
                                        <span className="text-[11px] text-stone-400">
                                          {hit.category}
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </SectionCard>
                  </div>
                ) : null}

                {tab === "steps" ? (
                  <div className="admin-slide-up">
                    <SectionCard
                      title="مراحل پخت"
                      hint="ترتیب ذخیره همان ترتیب نمایش در اپ است"
                      action={
                        <button
                          type="button"
                          className="rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white"
                          onClick={() =>
                            patch({
                              steps: [
                                ...draft.steps,
                                {
                                  id: `new-${draft.steps.length + 1}`,
                                  order: draft.steps.length + 1,
                                  instruction: "",
                                  tip: null,
                                  timerSeconds: null,
                                  imageUrl: null,
                                },
                              ],
                            })
                          }
                        >
                          افزودن مرحله
                        </button>
                      }
                    >
                      <div className="space-y-4">
                        {draft.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="rounded-2xl border border-[var(--admin-line)] bg-stone-50/40 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-[11px] font-black text-white">
                                  {faNum(index + 1)}
                                </span>
                                <span className="text-xs font-bold text-stone-600">
                                  مرحله {faNum(index + 1)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="text-xs font-bold text-red-500"
                                onClick={() =>
                                  patch({
                                    steps: draft.steps.filter(
                                      (_, i) => i !== index,
                                    ),
                                  })
                                }
                              >
                                حذف
                              </button>
                            </div>
                            <textarea
                              className="admin-field min-h-24"
                              placeholder="دستور این مرحله…"
                              value={step.instruction}
                              onChange={(e) =>
                                patchStep(index, {
                                  instruction: e.target.value,
                                })
                              }
                            />
                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_8rem]">
                              <input
                                className="admin-field"
                                placeholder="نکته (اختیاری)"
                                value={step.tip ?? ""}
                                onChange={(e) =>
                                  patchStep(index, { tip: e.target.value })
                                }
                              />
                              <input
                                type="number"
                                className="admin-field"
                                placeholder="تایمر ثانیه"
                                value={step.timerSeconds ?? ""}
                                onChange={(e) =>
                                  patchStep(index, {
                                    timerSeconds: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  })
                                }
                              />
                            </div>
                            <input
                              className="admin-field mt-3"
                              placeholder="آدرس تصویر مرحله"
                              value={step.imageUrl ?? ""}
                              onChange={(e) =>
                                patchStep(index, { imageUrl: e.target.value })
                              }
                              dir="ltr"
                            />
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                ) : null}
              </div>
            </form>
          ) : null}
        </main>
      </div>
    </div>
  );
}
