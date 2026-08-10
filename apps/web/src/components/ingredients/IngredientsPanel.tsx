"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ingredient, InventoryItem } from "@atlas/contracts";
import { normalizePersian } from "@atlas/shared";
import { Add, SearchNormal1, TickCircle } from "iconsax-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export function IngredientsPanel({
  onInventoryChange,
}: {
  onInventoryChange?: (items: InventoryItem[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInventory() {
    setLoading(true);
    setError(null);
    try {
      const items = await atlasClient.getInventory();
      setInventory(items);
      onInventoryChange?.(items);
    } catch {
      setError("بارگذاری مواد ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory();
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
  const exactSuggestion = useMemo(() => {
    if (!trimmed) return null;
    const q = normalizePersian(trimmed);
    return suggestions.find(
      (s) =>
        normalizePersian(s.name) === q ||
        normalizePersian(s.normalizedName) === q,
    );
  }, [suggestions, trimmed]);

  const canAddCustom =
    Boolean(trimmed) &&
    !selectedNames.has(normalizePersian(trimmed)) &&
    !exactSuggestion;

  async function addSuggestion(item: Ingredient) {
    if (selectedIds.has(item.id)) return;
    setAdding(true);
    try {
      await atlasClient.addInventoryItem(item.id);
      await loadInventory();
      setQuery("");
    } catch {
      setError("افزودن ماده انجام نشد.");
    } finally {
      setAdding(false);
    }
  }

  async function addTyped() {
    if (!trimmed) return;
    setAdding(true);
    try {
      await atlasClient.addIngredientByName(trimmed);
      await loadInventory();
      setQuery("");
    } catch {
      setError("افزودن ماده انجام نشد.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body text-atlas-ink-muted">
        بنویسید تا پیشنهادها بیاید؛ پیشنهاد را انتخاب کنید یا همان متن را
        اضافه کنید.
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchNormal1
            size={18}
            color="#A1A1AA"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addTyped();
              }
            }}
            placeholder="مثلاً گوجه، عدس، قارچ…"
            className="h-12 w-full rounded-atlas border border-atlas-border bg-atlas-surface py-2 pr-10 pl-3 text-body outline-none focus:border-atlas-primary"
          />
        </div>
        <Button
          size="lg"
          disabled={
            !trimmed || adding || selectedNames.has(normalizePersian(trimmed))
          }
          onClick={() => void addTyped()}
          icon={<Add size={18} color="currentColor" />}
          className="shrink-0 px-4"
        >
          افزودن
        </Button>
      </div>

      {trimmed ? (
        <section className="atlas-surface overflow-hidden">
          <div className="border-b border-atlas-border px-4 py-2">
            <p className="text-caption text-atlas-ink-muted">
              {searching ? "در حال پیشنهاد…" : "پیشنهادها"}
            </p>
          </div>
          <ul className="divide-y divide-atlas-border">
            {suggestions.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={selected || adding}
                    onClick={() => void addSuggestion(item)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right disabled:opacity-50"
                  >
                    <div>
                      <p className="text-body font-medium text-atlas-ink">
                        {item.name}
                      </p>
                      <p className="text-caption text-atlas-ink-faint">
                        {item.category}
                      </p>
                    </div>
                    {selected ? (
                      <TickCircle size={20} color="#16A34A" variant="Bold" />
                    ) : (
                      <Add size={20} color="#71717A" />
                    )}
                  </button>
                </li>
              );
            })}
            {canAddCustom ? (
              <li>
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => void addTyped()}
                  className="flex w-full items-center justify-between gap-3 bg-zinc-50 px-4 py-3 text-right"
                >
                  <div>
                    <p className="text-body font-semibold text-atlas-ink">
                      افزودن «{trimmed}»
                    </p>
                    <p className="text-caption text-atlas-ink-muted">
                      همین عبارت را به‌عنوان ماده جدید ثبت کن
                    </p>
                  </div>
                  <Add size={20} color="#FF3737" variant="Bold" />
                </button>
              </li>
            ) : null}
            {!searching && suggestions.length === 0 && !canAddCustom ? (
              <li className="px-4 py-3 text-caption text-atlas-ink-muted">
                پیشنهادی نیست. با دکمه افزودن همان متن را ثبت کنید.
              </li>
            ) : null}
          </ul>
        </section>
      ) : loading ? (
        <LoadingBlock />
      ) : inventory.length === 0 ? (
        <StateView
          tone="empty"
          title="ماده‌ای انتخاب نشده"
          description="جستجو کنید و از پیشنهادها انتخاب کنید، یا خودتان اضافه کنید."
        />
      ) : (
        <section className="space-y-3">
          <h3 className="text-caption font-semibold text-atlas-ink-muted">
            مواد اضافه‌شده
          </h3>
          <div className="flex flex-wrap gap-2">
            {inventory.map((item) => (
              <Chip
                key={item.id}
                label={item.ingredient.name}
                onRemove={() =>
                  void atlasClient
                    .removeInventoryItem(item.id)
                    .then(loadInventory)
                }
              />
            ))}
          </div>
        </section>
      )}

      {error ? (
        <StateView
          tone="danger"
          title="خطا"
          description={error}
          actionLabel="تلاش دوباره"
          onAction={() => void loadInventory()}
        />
      ) : null}
    </div>
  );
}
