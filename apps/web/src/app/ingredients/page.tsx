"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Ingredient, InventoryItem } from "@atlas/contracts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export default function IngredientsPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadInventory() {
    setLoading(true);
    setError(null);
    try {
      const items = await atlasClient.getInventory();
      setInventory(items);
    } catch {
      setError("بارگذاری مواد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await atlasClient.searchIngredients(query);
        if (!cancelled) setSuggestions(results);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const selectedIds = useMemo(
    () => new Set(inventory.map((i) => i.ingredientId)),
    [inventory],
  );

  async function addIngredient(ingredientId: string) {
    setBusyId(ingredientId);
    try {
      await atlasClient.addInventoryItem(ingredientId);
      await loadInventory();
      setQuery("");
    } catch {
      setError("افزودن ماده انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(id: string) {
    setBusyId(id);
    try {
      await atlasClient.removeInventoryItem(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("حذف ماده انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <div className="atlas-container space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-atlas-ink">مواد من</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-atlas-ink-muted">
              با تکمیل خودکار فارسی مواد را اضافه کنید. نرمال‌سازی ی/ک و فاصله
              اعمال می‌شود؛ انتخاب‌ها به‌صورت چیپ قابل ویرایش هستند.
            </p>
          </div>
          <Link href="/recommendations">
            <Button disabled={inventory.length === 0}>دیدن پیشنهادها</Button>
          </Link>
        </div>

        <section className="atlas-surface p-5">
          <label className="mb-2 block text-sm font-medium text-atlas-ink">
            جستجو و افزودن ماده
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً گوجه، تخم مرغ، عدس…"
            className="h-12 w-full rounded-atlas border border-atlas-border bg-atlas-surface-muted px-4 text-sm outline-none transition focus:border-atlas-primary focus:bg-white"
          />
          <div className="mt-3 min-h-12">
            {searching ? (
              <p className="text-xs text-atlas-ink-faint">در حال جستجو…</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => {
                  const selected = selectedIds.has(item.id);
                  return (
                    <Chip
                      key={item.id}
                      label={item.name}
                      active={selected}
                      onClick={() => {
                        if (!selected) void addIngredient(item.id);
                      }}
                    />
                  );
                })}
                {!suggestions.length ? (
                  <p className="text-sm text-atlas-ink-faint">نتیجه‌ای پیدا نشد.</p>
                ) : null}
              </div>
            )}
          </div>
          {busyId ? (
            <p className="mt-3 text-xs text-atlas-ink-faint">در حال به‌روزرسانی…</p>
          ) : null}
        </section>

        {error ? (
          <StateView
            tone="danger"
            title="خطا"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void loadInventory()}
          />
        ) : null}

        {loading ? (
          <LoadingBlock label="در حال بارگذاری مواد…" />
        ) : inventory.length === 0 ? (
          <StateView
            title="هنوز ماده‌ای ندارید"
            description="چند ماده پرتکرار را از پیشنهادها انتخاب کنید تا مسیر آشپزی شروع شود."
          />
        ) : (
          <section className="atlas-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-atlas-ink">مواد انتخاب‌شده</h2>
              <span className="text-xs text-atlas-ink-faint">
                {inventory.length} مورد
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {inventory.map((item) => (
                <Chip
                  key={item.id}
                  label={item.ingredient.name}
                  onRemove={() => void removeItem(item.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
