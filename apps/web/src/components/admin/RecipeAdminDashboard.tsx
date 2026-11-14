"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  clearAdminSecret,
  createAdminRecipe,
  deleteAdminRecipe,
  getAdminRecipe,
  getAdminSecret,
  getAdminTaxonomy,
  listAdminRecipes,
  restoreAdminRecipe,
  searchAdminIngredients,
  setAdminSecret,
  updateAdminRecipe,
  uploadAdminImage,
} from "@/lib/admin-api";
import {
  Add,
  AddCircle,
  ArrowLeft2,
  ArrowRight2,
  CloseCircle,
  DocumentText,
  Edit2,
  Timer1,
  ExportSquare,
  Eye,
  EyeSlash,
  Gallery,
  Login,
  Logout,
  RefreshCircle,
  Save2,
  SearchNormal1,
  TickCircle,
  Trash,
} from "iconsax-react";
import { AdminSelect } from "@/components/admin/AdminSelect";

type EditorTab = "overview" | "ingredients" | "steps";
type StatusFilter = "all" | "published" | "draft" | "deleted";

type ConfirmTone = "primary" | "danger" | "success";

type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  tone: ConfirmTone;
  run: () => void | Promise<void>;
};

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

const UNIT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "گرم", label: "گرم" },
  { value: "کیلوگرم", label: "کیلوگرم" },
  { value: "میلی‌لیتر", label: "میلی‌لیتر" },
  { value: "لیتر", label: "لیتر" },
  { value: "عدد", label: "عدد" },
  { value: "قاشق غذاخوری", label: "قاشق غذاخوری" },
  { value: "قاشق چای‌خوری", label: "قاشق چای‌خوری" },
  { value: "پیمانه", label: "پیمانه" },
  { value: "فنجان", label: "فنجان" },
  { value: "بسته", label: "بسته" },
  { value: "قوطی", label: "قوطی" },
  { value: "حبه", label: "حبه" },
  { value: "شاخه", label: "شاخه" },
  { value: "برگ", label: "برگ" },
  { value: "سیخ", label: "سیخ" },
  { value: "به میزان لازم", label: "به میزان لازم" },
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
    deletedAt: null,
    versionId: "",
    versionNumber: 0,
    ingredients: [],
    steps: [],
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
      (Number(draft.prepMinutes) || 0) + (Number(draft.cookMinutes) || 0),
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
  deleted,
}: {
  published: boolean;
  verified?: boolean;
  deleted?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {deleted ? (
        <span className="inline-flex items-center rounded-md bg-stone-200 px-1.5 py-0.5 text-[12px] font-bold tracking-wide text-stone-700 ring-1 ring-stone-500/20">
          حذف‌شده
        </span>
      ) : (
        <span
          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-bold tracking-wide ${
            published
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-600/15"
          }`}
        >
          {published ? "منتشر" : "پیش‌نویس"}
        </span>
      )}
      {!deleted && verified ? (
        <span className="inline-flex items-center rounded-md bg-stone-100 px-1.5 py-0.5 text-[12px] font-bold text-stone-600 ring-1 ring-stone-500/10">
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

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone: ConfirmTone;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const toneClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : tone === "success"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-[var(--admin-accent)] hover:brightness-95";
  const icon =
    tone === "danger" ? (
      <EyeSlash size={22} color="currentColor" variant="Bold" />
    ) : tone === "success" ? (
      <RefreshCircle size={22} color="currentColor" variant="Bold" />
    ) : (
      <Save2 size={22} color="currentColor" variant="Bold" />
    );

  return (
    <div
      className="admin-modal-backdrop"
      style={{ zIndex: 140 }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        className="admin-modal-panel !max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
      >
        <div className="px-5 py-5 text-center">
          <span
            className={`mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-white ${
              tone === "danger"
                ? "bg-red-600"
                : tone === "success"
                  ? "bg-emerald-600"
                  : "bg-[var(--admin-accent)]"
            }`}
          >
            {icon}
          </span>
          <h3
            id="admin-confirm-title"
            className="mt-3 text-base font-extrabold text-stone-900"
          >
            {title}
          </h3>
          <p className="mt-2 text-[13px] leading-7 text-stone-600">
            {message}
          </p>
        </div>
        <div className="admin-modal-actions">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="admin-btn admin-btn-ghost"
          >
            <CloseCircle size={16} color="currentColor" variant="Linear" />
            انصراف
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`admin-btn text-white disabled:opacity-50 ${toneClass}`}
          >
            {busy ? (
              <RefreshCircle size={16} color="currentColor" variant="Bold" />
            ) : null}
            {busy ? "در حال انجام…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  action,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-visible rounded-2xl border border-[var(--admin-line)] bg-white shadow-[0_1px_0_rgba(20,17,15,0.04)]">
      <header className="flex items-start justify-between gap-3 rounded-t-2xl border-b border-[var(--admin-line)] bg-stone-50/70 px-5 py-3.5">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--admin-accent)] ring-1 ring-slate-200">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-[15px] font-extrabold text-stone-900">{title}</h3>
            {hint ? (
              <p className="mt-1 text-[13px] leading-6 text-stone-600">{hint}</p>
            ) : null}
          </div>
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminRecipeDetail | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tab, setTab] = useState<EditorTab>("overview");
  const [ingHits, setIngHits] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);
  const [ingModal, setIngModal] = useState<"create" | number | null>(null);
  const [ingForm, setIngForm] = useState({
    name: "",
    ingredientId: "",
    quantity: "",
    unit: "",
    optional: false,
  });
  const [ingFormError, setIngFormError] = useState<string | null>(null);
  const [stepModal, setStepModal] = useState<"create" | number | null>(null);
  const [stepForm, setStepForm] = useState({
    instruction: "",
    tip: "",
    timerSeconds: "",
    imageUrl: "",
  });
  const [stepFormError, setStepFormError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([
    "ایرانی",
    "فرنگی",
    "عربی",
    "ترکی",
    "هندی",
    "چینی",
    "ایتالیایی",
    "مکزیکی",
    "آسیایی",
    "مدیترانه‌ای",
    "تلفیقی",
    "سایر",
  ]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<
    Record<string, string[]>
  >({});

  const pages = Math.max(1, Math.ceil(total / limit));
  const mealLabel = useMemo(
    () => Object.fromEntries(MEALS.map((m) => [m.value, m.label])),
    [],
  );

  const categoryOptions = useMemo(() => {
    const names = [...categories];
    if (draft?.category && !names.includes(draft.category)) {
      names.unshift(draft.category);
    }
    return names.map((name) => ({ value: name, label: name }));
  }, [categories, draft?.category]);

  const subcategoryOptions = useMemo(() => {
    const current = draft?.category ?? "";
    const list = subcategoriesByCategory[current] ?? [];
    const withEmpty = [
      { value: "", label: "بدون زیردسته" },
      ...list.map((name) => ({ value: name, label: name })),
    ];
    const currentSub = draft?.subcategory ?? "";
    if (currentSub && !list.includes(currentSub)) {
      withEmpty.splice(1, 0, { value: currentSub, label: currentSub });
    }
    return withEmpty;
  }, [draft?.category, draft?.subcategory, subcategoriesByCategory]);

  const cuisineOptions = useMemo(() => {
    const names = [...cuisines];
    if (draft?.cuisine && !names.includes(draft.cuisine)) {
      names.unshift(draft.cuisine);
    }
    return names.map((name) => ({ value: name, label: name }));
  }, [cuisines, draft?.cuisine]);

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
    if (!unlocked) return;
    void getAdminTaxonomy()
      .then((data) => {
        setCategories(data.categories);
        setSubcategoriesByCategory(data.subcategoriesByCategory);
        if (data.cuisines?.length) setCuisines(data.cuisines);
      })
      .catch(() => {
        setCategories([]);
        setSubcategoriesByCategory({});
      });
  }, [unlocked]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQ(searchInput);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (ingModal === null || !ingForm.name.trim()) {
      setIngHits([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchAdminIngredients(ingForm.name)
        .then(setIngHits)
        .catch(() => setIngHits([]));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [ingForm.name, ingModal]);

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

  function doLogout() {
    clearAdminSecret();
    setUnlocked(false);
    setDraft(null);
    setSelectedId(null);
    setBaseline(null);
    setList([]);
    setError(null);
    setNotice(null);
    setStepModal(null);
    setConfirm(null);
  }

  function logout() {
    if (!dirty) {
      doLogout();
      return;
    }
    setConfirm({
      title: "خروج از کنسول",
      message: "تغییرات ذخیره‌نشده دارید. بدون ذخیره خارج می‌شوید؟",
      confirmLabel: "خروج بدون ذخیره",
      tone: "danger",
      run: doLogout,
    });
  }

  function askConfirm(request: ConfirmRequest) {
    setConfirm(request);
  }

  async function runConfirm() {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      await confirm.run();
    } catch {
      /* error surface via setError in action */
    } finally {
      setConfirmBusy(false);
      setConfirm(null);
    }
  }

  function adoptDraft(detail: AdminRecipeDetail, id: string) {
    setDraft(detail);
    setSelectedId(id);
    setTagInput("");
    setBaseline(JSON.stringify(toPayload(detail)));
    setTab("overview");
  }

  function addDietaryTag() {
    if (!draft) return;
    const next = tagInput.trim().replace(/[،,]+$/g, "");
    if (!next) return;
    if (draft.dietaryTags.includes(next)) {
      setTagInput("");
      return;
    }
    patch({ dietaryTags: [...draft.dietaryTags, next] });
    setTagInput("");
  }

  function removeDietaryTag(tag: string) {
    if (!draft) return;
    patch({
      dietaryTags: draft.dietaryTags.filter((item) => item !== tag),
    });
  }

  async function loadRecipeDetail(id: string) {
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

  async function openRecipe(id: string) {
    if (!dirty) {
      await loadRecipeDetail(id);
      return;
    }
    askConfirm({
      title: "تغییرات ذخیره‌نشده",
      message: "با باز کردن غذای دیگر، تغییرات فعلی از بین می‌رود. ادامه می‌دهید؟",
      confirmLabel: "ادامه بدون ذخیره",
      tone: "danger",
      run: () => loadRecipeDetail(id),
    });
  }

  function startCreate() {
    if (!dirty) {
      const next = emptyRecipe();
      adoptDraft(next, "new");
      return;
    }
    askConfirm({
      title: "تغییرات ذخیره‌نشده",
      message: "با ساخت غذای جدید، تغییرات فعلی از بین می‌رود. ادامه می‌دهید؟",
      confirmLabel: "ادامه بدون ذخیره",
      tone: "danger",
      run: () => {
        const next = emptyRecipe();
        adoptDraft(next, "new");
      },
    });
  }

  function patch(partial: Partial<AdminRecipeDetail>) {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
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

    const isUpdate = Boolean(draft.id && selectedId !== "new");
    askConfirm({
      title: isUpdate ? "ذخیره تغییرات در دیتابیس" : "ایجاد غذا در دیتابیس",
      message: isUpdate
        ? `تغییرات «${draft.title || "این غذا"}» روی دیتابیس اصلی ذخیره و نسخه جدید ساخته شود؟`
        : `غذای «${draft.title || "جدید"}» در دیتابیس اصلی ایجاد شود؟`,
      confirmLabel: isUpdate ? "بله، ذخیره شود" : "بله، ایجاد شود",
      tone: "primary",
      run: async () => {
        setSaving(true);
        setError(null);
        setNotice(null);
        try {
          const saved = isUpdate
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
      },
    });
  }

  async function remove() {
    if (!draft?.id || selectedId === "new") return;
    const title = draft.title || "این غذا";
    askConfirm({
      title: "مخفی‌سازی از اپ",
      message: `«${title}» از اپ مخفی شود؟ داده در دیتابیس می‌ماند و بعداً قابل بازگردانی است.`,
      confirmLabel: "بله، مخفی شود",
      tone: "danger",
      run: async () => {
        setSaving(true);
        setError(null);
        try {
          const softDeleted = await deleteAdminRecipe(draft.id);
          adoptDraft(softDeleted, softDeleted.id);
          setNotice("از اپ مخفی شد (soft delete) — داده حفظ شده است.");
          setStatus("deleted");
          setPage(1);
          await loadList();
        } catch (err) {
          setError(err instanceof Error ? err.message : "حذف نشد");
        } finally {
          setSaving(false);
        }
      },
    });
  }

  async function restore() {
    if (!draft?.id || selectedId === "new") return;
    const title = draft.title || "این غذا";
    askConfirm({
      title: "بازگردانی به اپ",
      message: `«${title}» دوباره منتشر و در اپ قابل مشاهده شود؟`,
      confirmLabel: "بله، بازگردانی شود",
      tone: "success",
      run: async () => {
        setSaving(true);
        setError(null);
        try {
          const restored = await restoreAdminRecipe(draft.id);
          adoptDraft(restored, restored.id);
          setNotice("غذا بازگردانی و دوباره در اپ منتشر شد.");
          setStatus("all");
          setPage(1);
          await loadList();
        } catch (err) {
          setError(err instanceof Error ? err.message : "بازگردانی نشد");
        } finally {
          setSaving(false);
        }
      },
    });
  }

  async function handleRecipeImageUpload(file: File | null | undefined) {
    if (!file || !draft) return;
    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویر مجاز است.");
      return;
    }
    setUploadingImage(true);
    setError(null);
    try {
      const { url } = await uploadAdminImage(file);
      patch({ imageUrl: url });
      setNotice("تصویر غذا بارگذاری شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری تصویر ناموفق بود.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function openAddIngredientModal() {
    setIngForm({
      name: "",
      ingredientId: "",
      quantity: "",
      unit: "",
      optional: false,
    });
    setIngFormError(null);
    setIngHits([]);
    setIngModal("create");
  }

  function openEditIngredientModal(index: number) {
    if (!draft) return;
    const line = draft.ingredients[index];
    if (!line) return;
    setIngForm({
      name: line.name,
      ingredientId: line.ingredientId,
      quantity: line.quantity ?? "",
      unit: line.unit ?? "",
      optional: Boolean(line.optional),
    });
    setIngFormError(null);
    setIngHits([]);
    setIngModal(index);
  }

  function submitIngredientModal() {
    if (!draft || ingModal === null) return;
    const name = ingForm.name.trim();
    if (!name) {
      setIngFormError("نام ماده لازم است.");
      return;
    }
    if (!ingForm.unit.trim()) {
      setIngFormError("واحد را از لیست انتخاب کنید.");
      return;
    }
    const nextLine: AdminRecipeIngredient = {
      ingredientId: ingForm.ingredientId,
      name,
      quantity: ingForm.quantity.trim() || "",
      unit: ingForm.unit.trim(),
      optional: ingForm.optional,
    };
    if (ingModal === "create") {
      patch({ ingredients: [...draft.ingredients, nextLine] });
    } else {
      const ingredients = draft.ingredients.map((line, i) =>
        i === ingModal ? { ...line, ...nextLine } : line,
      );
      patch({ ingredients });
    }
    setIngModal(null);
    setIngFormError(null);
    setIngHits([]);
  }

  function openAddStepModal() {
    setStepForm({
      instruction: "",
      tip: "",
      timerSeconds: "",
      imageUrl: "",
    });
    setStepFormError(null);
    setStepModal("create");
  }

  function openEditStepModal(index: number) {
    if (!draft) return;
    const step = draft.steps[index];
    if (!step) return;
    setStepForm({
      instruction: step.instruction,
      tip: step.tip ?? "",
      timerSeconds:
        step.timerSeconds === null || step.timerSeconds === undefined
          ? ""
          : String(step.timerSeconds),
      imageUrl: step.imageUrl ?? "",
    });
    setStepFormError(null);
    setStepModal(index);
  }

  function submitStepModal() {
    if (!draft || stepModal === null) return;
    const instruction = stepForm.instruction.trim();
    if (!instruction) {
      setStepFormError("متن مرحله لازم است.");
      return;
    }
    const editingIndex = typeof stepModal === "number" ? stepModal : null;
    const nextStep: RecipeStep = {
      id:
        editingIndex === null
          ? `new-${Date.now()}`
          : (draft.steps[editingIndex]?.id ?? `new-${Date.now()}`),
      order:
        editingIndex === null
          ? draft.steps.length + 1
          : (draft.steps[editingIndex]?.order ?? editingIndex + 1),
      instruction,
      tip: stepForm.tip.trim() || null,
      timerSeconds: stepForm.timerSeconds
        ? Number(stepForm.timerSeconds)
        : null,
      imageUrl: stepForm.imageUrl.trim() || null,
    };
    if (editingIndex === null) {
      patch({ steps: [...draft.steps, nextStep] });
    } else {
      const steps = draft.steps.map((step, i) =>
        i === editingIndex ? nextStep : step,
      );
      patch({ steps });
    }
    setStepModal(null);
    setStepFormError(null);
  }

  if (!unlocked) {
    return (
      <div className="admin-login-grid">
        <section className="admin-login-hero hidden min-h-[38svh] flex-col justify-between p-8 lg:flex lg:min-h-svh lg:p-12">
          <div className="relative z-[1]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[13px] font-semibold tracking-[0.14em] text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              LOCAL · NO HOST
            </div>
            <h1 className="mt-8 max-w-md text-4xl font-black leading-[1.15] tracking-tight">
              کنسول کاتالوگ
              <span className="mt-2 block text-white/90">سرآشپز هوشمند</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-8 text-white/90">
              مدیریت دستورها، مواد و مراحل روی همان دیتابیس اپ — بدون هزینه هاست و
              دامنه.
            </p>
          </div>
          <div className="relative z-[1] grid max-w-md gap-3 sm:grid-cols-3">
            {[
              { t: "۶۹۸۰+", d: "دستور" },
              { t: "CRUD", d: "زنده" },
              { t: "Postgres", d: "محلی" },
            ].map((item) => (
              <div
                key={item.d}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
              >
                <p className="text-lg font-extrabold">{item.t}</p>
                <p className="text-[13px] text-white/80">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-login-panel">
          <div className="admin-slide-up w-full max-w-[26rem]">
            <div className="mb-8 lg:hidden">
              <p className="text-[13px] font-bold tracking-[0.16em] text-stone-600">
                ATLAS LOCAL
              </p>
              <h1 className="mt-2 text-2xl font-black text-stone-900">
                ورود به کنسول کاتالوگ
              </h1>
            </div>
            <div className="overflow-hidden rounded-[1.4rem] border border-[var(--admin-line)] bg-white shadow-[0_24px_60px_rgba(20,17,15,0.1)]">
              <div className="border-b border-[var(--admin-line)] px-6 py-5">
                <p className="text-[13px] font-bold tracking-[0.14em] text-stone-600">
                  SIGN IN
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-stone-900">
                  دسترسی مدیریت
                </h2>
                <p className="mt-1.5 text-[13px] leading-6 text-stone-600">
                  کلید محلی را وارد کنید تا به داشبورد وصل شوید.
                </p>
              </div>
              <form onSubmit={unlock} className="space-y-4 px-6 py-6">
                {error ? (
                  <p className="rounded-xl bg-red-50 px-3.5 py-3 text-[13px] leading-6 text-red-700 ring-1 ring-red-600/10">
                    {error}
                  </p>
                ) : null}
                <Field label="کلید مدیریت محلی">
                  <div className="relative">
                    <input
                      className="admin-field !pe-16"
                      type={showSecret ? "text" : "password"}
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      placeholder="atlas-local-admin"
                      autoFocus
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="absolute inset-y-0 end-2 my-auto inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-stone-600 hover:bg-stone-100"
                    >
                      {showSecret ? (
                        <EyeSlash size={15} color="currentColor" variant="Linear" />
                      ) : (
                        <Eye size={15} color="currentColor" variant="Linear" />
                      )}
                      {showSecret ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                </Field>
                <div className="rounded-xl bg-stone-50 px-3.5 py-3 text-[13px] leading-6 text-stone-600">
                  مقدار پیش‌فرض در{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-[12px] text-stone-700 ring-1 ring-stone-200">
                    apps/api/.env
                  </code>{" "}
                  با نام{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 text-[12px] text-stone-700 ring-1 ring-stone-200">
                    ADMIN_SECRET
                  </code>
                </div>
                <button
                  type="submit"
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-stone-950 py-3.5 text-sm font-bold text-white transition hover:bg-stone-800"
                >
                  <span className="absolute inset-y-0 start-0 w-1 bg-[var(--admin-accent)] transition group-hover:w-1.5" />
                  <Login size={18} color="currentColor" variant="Bold" />
                  ورود به داشبورد
                </button>
              </form>
            </div>
            <p className="mt-5 text-center text-[13px] text-stone-600">
              فقط روی سیستم شما · بدون هاست عمومی
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="z-20 shrink-0 border-b border-[var(--admin-line)] bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-[13px] font-black tracking-wide text-white">
              AT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-extrabold">
                  کنسول کاتالوگ
                </h1>
                <span className="hidden rounded-md bg-stone-100 px-1.5 py-0.5 text-[12px] font-bold text-stone-600 sm:inline">
                  LOCAL
                </span>
              </div>
              <p className="truncate text-[13px] text-stone-600">
                سرآشپز هوشمند · همگام با دیتابیس اپ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/home"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-ghost hidden sm:inline-flex"
            >
              <ExportSquare size={16} color="currentColor" variant="Linear" />
              مشاهده اپ
            </a>
            <button
              type="button"
              onClick={startCreate}
              className="admin-btn admin-btn-primary"
            >
              <AddCircle size={17} color="currentColor" variant="Bold" />
              غذای جدید
            </button>
            <button
              type="button"
              onClick={logout}
              className="admin-btn admin-btn-ghost"
            >
              <Logout size={16} color="currentColor" variant="Linear" />
              خروج
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
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-stone-600">
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
              <SearchNormal1
                size={16}
                color="currentColor"
                variant="Linear"
                className="pointer-events-none absolute inset-y-0 start-3 my-auto text-slate-500"
              />
              <input
                className="admin-field !ps-9"
                placeholder="جستجو در عنوان، دسته، اسلاگ…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-stone-100 p-1">
              {(
                [
                  ["all", "فعال"],
                  ["published", "منتشر"],
                  ["draft", "پیش‌نویس"],
                  ["deleted", "حذف‌شده"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatus(value);
                  }}
                  className={`rounded-lg py-1.5 text-[13px] font-bold transition ${
                    status === value
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-800"
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
                <p className="mt-1 text-xs text-stone-600">
                  فیلتر یا عبارت جستجو را عوض کنید.
                </p>
              </div>
            ) : (
              <ul className="space-y-1 px-2 py-2">
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
                        className={`group flex w-full gap-3 rounded-xl px-3 py-3 text-right transition ${
                          active
                            ? "border border-[rgba(212,2,47,0.35)] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.12)]"
                            : "border border-transparent hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center ring-1 ring-inset ring-slate-900/5"
                          style={{
                            backgroundImage: item.imageUrl
                              ? `url(${item.imageUrl})`
                              : undefined,
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate text-[14px] font-bold text-stone-900">
                              {item.title}
                            </span>
                            <StatusBadge
                              published={item.published}
                              verified={item.verified}
                              deleted={Boolean(item.deletedAt)}
                            />
                          </span>
                          <span className="mt-1 block truncate text-[13px] text-stone-600">
                            {item.category}
                            {item.subcategory ? ` / ${item.subcategory}` : ""} ·{" "}
                            {mealLabel[item.meal]}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-1.5 text-[12px] font-semibold text-stone-600">
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
            <p className="text-[13px] font-medium text-stone-600">
              {faNum(total)} غذا
            </p>
            <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-line)] bg-white px-2.5 py-1.5 text-[13px] font-bold disabled:opacity-35"
            >
              <ArrowRight2 size={14} color="currentColor" variant="Linear" />
              قبلی
            </button>
            <span className="min-w-14 text-center text-[13px] font-bold text-stone-600">
              {faNum(page)}/{faNum(pages)}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-line)] bg-white px-2.5 py-1.5 text-[13px] font-bold disabled:opacity-35"
            >
              بعدی
              <ArrowLeft2 size={14} color="currentColor" variant="Linear" />
            </button>
            </div>
          </div>
        </aside>

        <main className="admin-scroll relative min-h-0 overflow-y-auto">
          {!draft && !loadingDetail ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="admin-slide-up max-w-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  <DocumentText size={28} color="currentColor" variant="Bold" />
                </div>
                <h2 className="mt-5 text-lg font-extrabold">
                  جزئیات دستور را باز کنید
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  از فهرست سمت راست یک غذا انتخاب کنید، یا با «غذای جدید» مورد تازه
                  بسازید. هر ذخیره مستقیم روی دیتابیس اصلی می‌نشیند.
                </p>
                <button
                  type="button"
                  onClick={startCreate}
                  className="admin-btn admin-btn-dark mt-5"
                >
                  <AddCircle size={17} color="currentColor" variant="Bold" />
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
                      <p className="text-[13px] font-semibold text-stone-600">
                        {selectedId === "new"
                          ? "ایجاد"
                          : `نسخه ${faNum(draft.versionNumber)}`}
                      </p>
                      {dirty ? (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[12px] font-bold text-amber-800 ring-1 ring-amber-600/15">
                          ویرایش‌شده
                        </span>
                      ) : null}
                      <StatusBadge
                        published={draft.published}
                        verified={draft.verified}
                        deleted={Boolean(draft.deletedAt)}
                      />
                    </div>
                    <h2 className="mt-1 truncate text-xl font-extrabold tracking-tight">
                      {selectedId === "new"
                        ? "غذای جدید"
                        : draft.title || "بدون عنوان"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.id && selectedId !== "new" && draft.deletedAt ? (
                      <button
                        type="button"
                        onClick={() => void restore()}
                        disabled={saving}
                        className="admin-btn admin-btn-success"
                      >
                        <RefreshCircle size={16} color="currentColor" variant="Bold" />
                        بازگردانی به اپ
                      </button>
                    ) : null}
                    {draft.id && selectedId !== "new" && !draft.deletedAt ? (
                      <button
                        type="button"
                        onClick={() => void remove()}
                        className="admin-btn admin-btn-danger"
                      >
                        <EyeSlash size={16} color="currentColor" variant="Linear" />
                        مخفی از اپ
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      disabled={saving || !dirty || Boolean(draft.deletedAt)}
                      className="admin-btn admin-btn-primary"
                    >
                      {saving ? (
                        <RefreshCircle size={16} color="currentColor" variant="Bold" />
                      ) : (
                        <Save2 size={16} color="currentColor" variant="Bold" />
                      )}
                      {saving ? "در حال ذخیره…" : "ذخیره در دیتابیس"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-1 rounded-xl bg-stone-100 p-1">
                  {(
                    [
                      ["overview", "مشخصات"],
                      ["ingredients", `مواد اولیه (${faNum(draft.ingredients.length)})`],
                      ["steps", `مراحل (${faNum(draft.steps.length)})`],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value)}
                      className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold transition ${
                        tab === value
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-700 hover:text-stone-900"
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
                        icon={
                          <DocumentText
                            size={18}
                            color="currentColor"
                            variant="Bold"
                          />
                        }
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
                            <AdminSelect
                              value={draft.category}
                              options={categoryOptions}
                              searchable
                              onChange={(next) => {
                                const allowed =
                                  subcategoriesByCategory[next] ?? [];
                                const currentSub = draft.subcategory ?? "";
                                patch({
                                  category: next,
                                  subcategory: allowed.includes(currentSub)
                                    ? currentSub
                                    : "",
                                });
                              }}
                              placeholder="انتخاب دسته‌بندی"
                            />
                          </Field>
                          <Field label="زیردسته">
                            <AdminSelect
                              value={draft.subcategory ?? ""}
                              options={subcategoryOptions}
                              searchable
                              onChange={(next) =>
                                patch({ subcategory: next })
                              }
                              placeholder="انتخاب زیردسته"
                            />
                          </Field>
                          <Field label="نوع آشپزی">
                            <AdminSelect
                              value={draft.cuisine}
                              options={cuisineOptions}
                              searchable
                              onChange={(next) => patch({ cuisine: next })}
                              placeholder="انتخاب نوع آشپزی"
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

                      <SectionCard
                        title="زمان، وعده و پخت"
                        icon={
                          <Timer1
                            size={18}
                            color="currentColor"
                            variant="Bold"
                          />
                        }
                      >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label="وعده">
                            <AdminSelect
                              value={draft.meal}
                              options={MEALS.map((m) => ({
                                value: m.value,
                                label: m.label,
                              }))}
                              searchable={false}
                              onChange={(next) =>
                                patch({ meal: next as MealType })
                              }
                            />
                          </Field>
                          <Field label="سختی">
                            <AdminSelect
                              value={draft.difficulty}
                              options={DIFFICULTIES.map((d) => ({
                                value: d.value,
                                label: d.label,
                              }))}
                              searchable={false}
                              onChange={(next) =>
                                patch({ difficulty: next as Difficulty })
                              }
                            />
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
                              min={0}
                              className="admin-field"
                              value={draft.prepMinutes}
                              onChange={(e) => {
                                const prepMinutes = Number(e.target.value) || 0;
                                patch({
                                  prepMinutes,
                                  totalMinutes:
                                    prepMinutes + (Number(draft.cookMinutes) || 0),
                                });
                              }}
                            />
                          </Field>
                          <Field label="پخت (دقیقه)">
                            <input
                              type="number"
                              min={0}
                              className="admin-field"
                              value={draft.cookMinutes}
                              onChange={(e) => {
                                const cookMinutes = Number(e.target.value) || 0;
                                patch({
                                  cookMinutes,
                                  totalMinutes:
                                    (Number(draft.prepMinutes) || 0) + cookMinutes,
                                });
                              }}
                            />
                          </Field>
                          <Field label="کل زمان (محاسباتی)">
                            <div className="admin-field flex items-center justify-between bg-slate-50 text-slate-700">
                              <span className="font-bold text-slate-900">
                                {faNum(
                                  (Number(draft.prepMinutes) || 0) +
                                    (Number(draft.cookMinutes) || 0),
                                )}{" "}
                                دقیقه
                              </span>
                              <span className="text-[12px] text-slate-500">
                                آماده‌سازی + پخت
                              </span>
                            </div>
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
                            <div className="space-y-3">
                              {draft.dietaryTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {draft.dietaryTags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 rounded-full border border-[rgba(212,2,47,0.2)] bg-[rgba(212,2,47,0.06)] px-2.5 py-1 text-[12px] font-bold text-[var(--admin-accent)]"
                                    >
                                      {tag}
                                      <button
                                        type="button"
                                        onClick={() => removeDietaryTag(tag)}
                                        className="inline-flex rounded-full p-0.5 transition hover:bg-[rgba(212,2,47,0.12)]"
                                        aria-label={`حذف ${tag}`}
                                      >
                                        <CloseCircle
                                          size={15}
                                          color="currentColor"
                                          variant="Bold"
                                        />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[12px] text-slate-500">
                                  هنوز برچسبی اضافه نشده است.
                                </p>
                              )}
                              <div className="flex gap-2">
                                <input
                                  className="admin-field flex-1"
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addDietaryTag();
                                    }
                                  }}
                                  placeholder="مثلاً گیاهی، وگان، کم‌چرب"
                                />
                                <button
                                  type="button"
                                  onClick={addDietaryTag}
                                  className="admin-btn admin-btn-dark shrink-0"
                                >
                                  <Add size={15} color="currentColor" variant="Bold" />
                                  افزودن تگ
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {["گیاهی", "وگان", "بدون گلوتن", "کم‌کالری", "رژیمی"].map(
                                  (hint) => (
                                    <button
                                      key={hint}
                                      type="button"
                                      disabled={draft.dietaryTags.includes(hint)}
                                      onClick={() => {
                                        if (draft.dietaryTags.includes(hint)) return;
                                        patch({
                                          dietaryTags: [
                                            ...draft.dietaryTags,
                                            hint,
                                          ],
                                        });
                                      }}
                                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                                    >
                                      + {hint}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          </Field>
                        </div>
                      </SectionCard>
                    </div>

                    <div className="space-y-5">
                      <SectionCard
                        title="تصویر غذا"
                        hint="از دستگاه بارگذاری کنید"
                      >
                        <div
                          className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 bg-cover bg-center ring-1 ring-inset ring-black/5"
                          style={{
                            backgroundImage: draft.imageUrl
                              ? `url(${draft.imageUrl})`
                              : undefined,
                          }}
                        >
                          {!draft.imageUrl ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-500">
                              <Gallery
                                size={36}
                                color="currentColor"
                                variant="Bulk"
                              />
                              <p className="text-[12px] font-semibold">
                                هنوز تصویری انتخاب نشده
                              </p>
                            </div>
                          ) : null}
                          {uploadingImage ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[13px] font-bold text-stone-700">
                              در حال بارگذاری…
                            </div>
                          ) : null}
                        </div>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          onChange={(e) =>
                            void handleRecipeImageUpload(e.target.files?.[0])
                          }
                        />
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={uploadingImage}
                            onClick={() => imageInputRef.current?.click()}
                            className="admin-btn admin-btn-dark flex-1 sm:flex-none"
                          >
                            <Gallery
                              size={16}
                              color="currentColor"
                              variant="Bold"
                            />
                            {draft.imageUrl
                              ? "جایگزینی تصویر"
                              : "بارگذاری تصویر"}
                          </button>
                          {draft.imageUrl ? (
                            <button
                              type="button"
                              disabled={uploadingImage}
                              onClick={() => patch({ imageUrl: "" })}
                              className="admin-btn admin-btn-danger"
                            >
                              <Trash
                                size={16}
                                color="currentColor"
                                variant="Linear"
                              />
                              حذف
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-stone-500">
                          JPG، PNG، WEBP یا GIF · حداکثر ۵ مگابایت
                        </p>
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
                      title="مواد اولیه"
                      hint="افزودن از پاپ‌آپ · واحد را از دراپ‌داون انتخاب کنید"
                      action={
                        <button
                          type="button"
                          className="admin-btn admin-btn-dark"
                          onClick={openAddIngredientModal}
                        >
                          <Add size={14} color="currentColor" variant="Bold" />
                          افزودن مواد اولیه
                        </button>
                      }
                    >
                      {draft.ingredients.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
                          <p className="text-sm font-bold text-stone-700">
                            هنوز ماده اولیه‌ای ثبت نشده
                          </p>
                          <p className="mt-1 text-xs text-stone-600">
                            روی «افزودن مواد اولیه» بزنید؛ بعد از ثبت در همین صفحه می‌نشیند.
                          </p>
                          <button
                            type="button"
                            onClick={openAddIngredientModal}
                            className="admin-btn admin-btn-primary mt-4"
                          >
                            <AddCircle size={16} color="currentColor" variant="Bold" />
                            افزودن مواد اولیه
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {draft.ingredients.map((line, index) => (
                            <li
                              key={`${line.ingredientId}-${line.name}-${index}`}
                              className="rounded-2xl border border-[var(--admin-line)] bg-white p-4 transition hover:border-stone-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-950 text-[12px] font-black text-white">
                                  {faNum(index + 1)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[14px] font-semibold text-stone-900">
                                    {line.name || "بدون نام"}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold text-stone-600">
                                    {line.quantity ? (
                                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                                        {line.quantity}
                                        {line.unit ? ` ${line.unit}` : ""}
                                      </span>
                                    ) : line.unit ? (
                                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                                        {line.unit}
                                      </span>
                                    ) : null}
                                    {line.optional ? (
                                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-800 ring-1 ring-amber-600/10">
                                        اختیاری
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditIngredientModal(index)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-stone-700 hover:bg-stone-100"
                                  >
                                    <Edit2 size={14} color="currentColor" variant="Linear" />
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50"
                                    onClick={() =>
                                      patch({
                                        ingredients: draft.ingredients.filter(
                                          (_, i) => i !== index,
                                        ),
                                      })
                                    }
                                  >
                                    <Trash size={14} color="currentColor" variant="Linear" />
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </SectionCard>
                  </div>
                ) : null}

                {tab === "steps" ? (
                  <div className="admin-slide-up">
                    <SectionCard
                      title="مراحل پخت"
                      hint="با افزودن مرحله، فرم در پاپ‌آپ باز می‌شود؛ بعد از ثبت در لیست می‌نشیند"
                      action={
                        <button
                          type="button"
                          className="admin-btn admin-btn-dark"
                          onClick={openAddStepModal}
                        >
                          <Add size={14} color="currentColor" variant="Bold" />
                          افزودن مرحله
                        </button>
                      }
                    >
                      {draft.steps.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
                          <p className="text-sm font-bold text-stone-700">
                            هنوز مرحله‌ای ثبت نشده
                          </p>
                          <p className="mt-1 text-xs text-stone-600">
                            روی «افزودن مرحله» بزنید و جزئیات را در پاپ‌آپ وارد کنید.
                          </p>
                          <button
                            type="button"
                            onClick={openAddStepModal}
                            className="admin-btn admin-btn-primary mt-4"
                          >
                            <AddCircle size={16} color="currentColor" variant="Bold" />
                            افزودن اولین مرحله
                          </button>
                        </div>
                      ) : (
                        <ol className="space-y-3">
                          {draft.steps.map((step, index) => (
                            <li
                              key={step.id}
                              className="group rounded-2xl border border-[var(--admin-line)] bg-white p-4 transition hover:border-stone-300 hover:shadow-[0_8px_24px_rgba(20,17,15,0.06)]"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-950 text-[12px] font-black text-white">
                                  {faNum(index + 1)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[14px] font-semibold leading-7 text-stone-900">
                                    {step.instruction || (
                                      <span className="text-stone-600">
                                        بدون متن
                                      </span>
                                    )}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold text-stone-600">
                                    {step.tip ? (
                                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-800 ring-1 ring-amber-600/10">
                                        نکته دارد
                                      </span>
                                    ) : null}
                                    {step.timerSeconds ? (
                                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                                        تایمر {faNum(step.timerSeconds)}ث
                                      </span>
                                    ) : null}
                                    {step.imageUrl ? (
                                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5">
                                        تصویر
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditStepModal(index)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-stone-700 hover:bg-stone-100"
                                  >
                                    <Edit2 size={14} color="currentColor" variant="Linear" />
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50"
                                    onClick={() =>
                                      patch({
                                        steps: draft.steps.filter(
                                          (_, i) => i !== index,
                                        ),
                                      })
                                    }
                                  >
                                    <Trash size={14} color="currentColor" variant="Linear" />
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </SectionCard>
                  </div>
                ) : null}
              </div>
            </form>
          ) : null}

          <ConfirmDialog
            open={Boolean(confirm)}
            title={confirm?.title ?? ""}
            message={confirm?.message ?? ""}
            confirmLabel={confirm?.confirmLabel ?? "تأیید"}
            tone={confirm?.tone ?? "primary"}
            busy={confirmBusy}
            onCancel={() => {
              if (!confirmBusy) setConfirm(null);
            }}
            onConfirm={() => {
              void runConfirm();
            }}
          />

          {ingModal !== null ? (
            <div
              className="admin-modal-backdrop"
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIngModal(null);
                  setIngHits([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIngModal(null);
                  setIngHits([]);
                }
              }}
            >
              <div
                className="admin-modal-panel admin-modal-panel--lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ing-modal-title"
              >
                <div className="admin-modal-header">
                  <p className="admin-modal-kicker">INGREDIENT</p>
                  <h3 id="ing-modal-title">
                    {ingModal === "create"
                      ? `مواد اولیه جدید · ${faNum((draft?.ingredients.length ?? 0) + 1)}`
                      : `ویرایش مواد اولیه · ${faNum(ingModal + 1)}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIngModal(null);
                      setIngHits([]);
                    }}
                    className="admin-modal-close admin-btn admin-btn-ghost !min-w-0 !px-2.5"
                    aria-label="بستن"
                  >
                    <CloseCircle size={18} color="currentColor" variant="Linear" />
                  </button>
                </div>
                <div className="space-y-4 px-5 py-5">
                  {ingFormError ? (
                    <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
                      {ingFormError}
                    </p>
                  ) : null}
                  <Field label="نام ماده">
                    <div className="relative">
                      <input
                        className="admin-field"
                        value={ingForm.name}
                        onChange={(e) =>
                          setIngForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                            ingredientId: "",
                          }))
                        }
                        placeholder="مثلاً: برنج ایرانی"
                        autoFocus
                      />
                      {ingHits.length > 0 ? (
                        <ul className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 max-h-48 overflow-y-auto rounded-xl border border-[var(--admin-line)] bg-white shadow-[0_16px_40px_rgba(20,17,15,0.14)]">
                          {ingHits.map((hit) => (
                            <li key={hit.id}>
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-2.5 text-right text-sm hover:bg-stone-50"
                                onClick={() => {
                                  setIngForm((prev) => ({
                                    ...prev,
                                    name: hit.name,
                                    ingredientId: hit.id,
                                  }));
                                  setIngHits([]);
                                }}
                              >
                                <span className="font-semibold">{hit.name}</span>
                                <span className="text-[13px] text-stone-600">
                                  {hit.category}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="مقدار">
                      <input
                        className="admin-field"
                        value={ingForm.quantity}
                        onChange={(e) =>
                          setIngForm((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        placeholder="مثلاً ۲۰۰"
                      />
                    </Field>
                    <Field label="واحد">
                      <AdminSelect
                        value={ingForm.unit}
                        options={
                          ingForm.unit &&
                          !UNIT_OPTIONS.some((u) => u.value === ingForm.unit)
                            ? [
                                { value: ingForm.unit, label: ingForm.unit },
                                ...UNIT_OPTIONS,
                              ]
                            : UNIT_OPTIONS
                        }
                        placeholder="انتخاب واحد از لیست"
                        searchable
                        onChange={(unit) => {
                          setIngForm((prev) => ({ ...prev, unit }));
                          setIngFormError(null);
                        }}
                      />
                    </Field>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--admin-line)] bg-stone-50/80 px-3.5 py-3 text-sm font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      className="accent-[var(--admin-accent)]"
                      checked={ingForm.optional}
                      onChange={(e) =>
                        setIngForm((prev) => ({
                          ...prev,
                          optional: e.target.checked,
                        }))
                      }
                    />
                    ماده اختیاری است
                  </label>
                </div>
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIngModal(null);
                      setIngHits([]);
                    }}
                    className="admin-btn admin-btn-ghost"
                  >
                    <CloseCircle size={16} color="currentColor" variant="Linear" />
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={submitIngredientModal}
                    className="admin-btn admin-btn-primary"
                  >
                    {ingModal === "create" ? (
                      <Add size={16} color="currentColor" variant="Bold" />
                    ) : (
                      <TickCircle size={16} color="currentColor" variant="Bold" />
                    )}
                    {ingModal === "create"
                      ? "ثبت در لیست مواد اولیه"
                      : "ذخیره تغییرات"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {stepModal !== null ? (
            <div
              className="admin-modal-backdrop"
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget) setStepModal(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setStepModal(null);
              }}
            >
              <div
                className="admin-modal-panel admin-modal-panel--lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="step-modal-title"
              >
                <div className="admin-modal-header">
                  <p className="admin-modal-kicker">STEP</p>
                  <h3 id="step-modal-title">
                    {stepModal === "create"
                      ? `مرحله جدید · ${faNum((draft?.steps.length ?? 0) + 1)}`
                      : `ویرایش مرحله · ${faNum(stepModal + 1)}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStepModal(null)}
                    className="admin-modal-close admin-btn admin-btn-ghost !min-w-0 !px-2.5"
                    aria-label="بستن"
                  >
                    <CloseCircle size={18} color="currentColor" variant="Linear" />
                  </button>
                </div>
                <div className="space-y-4 px-5 py-5">
                  {stepFormError ? (
                    <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
                      {stepFormError}
                    </p>
                  ) : null}
                  <Field label="دستور مرحله">
                    <textarea
                      className="admin-field min-h-32"
                      value={stepForm.instruction}
                      onChange={(e) =>
                        setStepForm((prev) => ({
                          ...prev,
                          instruction: e.target.value,
                        }))
                      }
                      placeholder="مثلاً: پیاز را خرد کنید و تفت دهید…"
                      autoFocus
                    />
                  </Field>
                  <Field label="نکته (اختیاری)">
                    <input
                      className="admin-field"
                      value={stepForm.tip}
                      onChange={(e) =>
                        setStepForm((prev) => ({
                          ...prev,
                          tip: e.target.value,
                        }))
                      }
                      placeholder="نکته کمکی برای کاربر"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="تایمر (ثانیه)">
                      <input
                        type="number"
                        className="admin-field"
                        value={stepForm.timerSeconds}
                        onChange={(e) =>
                          setStepForm((prev) => ({
                            ...prev,
                            timerSeconds: e.target.value,
                          }))
                        }
                        placeholder="مثلاً 300"
                      />
                    </Field>
                    <Field label="آدرس تصویر مرحله">
                      <input
                        className="admin-field"
                        value={stepForm.imageUrl}
                        onChange={(e) =>
                          setStepForm((prev) => ({
                            ...prev,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </Field>
                  </div>
                </div>
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={() => setStepModal(null)}
                    className="admin-btn admin-btn-ghost"
                  >
                    <CloseCircle size={16} color="currentColor" variant="Linear" />
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={submitStepModal}
                    className="admin-btn admin-btn-primary"
                  >
                    {stepModal === "create" ? (
                      <Add size={16} color="currentColor" variant="Bold" />
                    ) : (
                      <TickCircle size={16} color="currentColor" variant="Bold" />
                    )}
                    {stepModal === "create"
                      ? "ثبت در لیست مراحل"
                      : "ذخیره تغییرات مرحله"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
