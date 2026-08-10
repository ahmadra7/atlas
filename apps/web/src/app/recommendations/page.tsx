"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  MealType,
  RecommendationFilters,
  RecommendationResult,
} from "@atlas/contracts";
import { mealLabelFa } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const meals: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];
const times = [15, 30, 45, 60];

export default function RecommendationsPage() {
  const [filters, setFilters] = useState<RecommendationFilters>({
    meal: "any",
    maxMinutes: 60,
    difficulty: "any",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(next = filters) {
    setLoading(true);
    setError(null);
    try {
      const data = await atlasClient.getRecommendations(next);
      setResult(data);
    } catch {
      setError("دریافت پیشنهادها ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exact = result?.exact ?? [];
  const near = result?.near ?? [];
  const discovery = result?.discovery ?? [];
  const total = exact.length + near.length + discovery.length;

  return (
    <AppShell>
      <div className="atlas-container space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-atlas-ink">پیشنهادها</h1>
            <p className="mt-2 text-sm leading-7 text-atlas-ink-muted">
              اول دقیقاً با مواد شما، بعد یک ماده کم، بعد کشف. رتبه‌بندی از سمت
              سرویس می‌آید — نه از کلاینت.
            </p>
          </div>
          <Link href="/ingredients">
            <Button variant="secondary">ویرایش مواد</Button>
          </Link>
        </div>

        <section className="atlas-surface space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-atlas-ink">وعده</p>
            <div className="flex flex-wrap gap-2">
              {meals.map((meal) => (
                <Chip
                  key={meal}
                  label={mealLabelFa[meal]}
                  active={filters.meal === meal}
                  onClick={() => setFilters((f) => ({ ...f, meal }))}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-atlas-ink">حداکثر زمان</p>
            <div className="flex flex-wrap gap-2">
              {times.map((maxMinutes) => (
                <Chip
                  key={maxMinutes}
                  label={`${maxMinutes} دقیقه`}
                  active={filters.maxMinutes === maxMinutes}
                  onClick={() => setFilters((f) => ({ ...f, maxMinutes }))}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-atlas-ink">سختی</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["any", "همه"],
                  ["easy", "آسان"],
                  ["medium", "متوسط"],
                  ["hard", "سخت"],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  active={filters.difficulty === value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, difficulty: value }))
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="اقتصادی"
              active={Boolean(filters.budgetFriendly)}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  budgetFriendly: !f.budgetFriendly,
                }))
              }
            />
            <Button onClick={() => void load(filters)}>اعمال فیلتر</Button>
          </div>
        </section>

        {error ? (
          <StateView
            tone="danger"
            title="خطا در پیشنهادها"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void load()}
          />
        ) : null}

        {loading ? <LoadingBlock label="در حال رتبه‌بندی پیشنهادها…" /> : null}

        {!loading && !error && total === 0 ? (
          <StateView
            title="پیشنهادی با این فیلترها نیست"
            description="مواد را بیشتر کنید یا فیلتر زمان/وعده را بازتر بگیرید."
            actionLabel="رفتن به مواد"
            onAction={() => {
              window.location.href = "/ingredients";
            }}
          />
        ) : null}

        {!loading && exact.length === 0 && total > 0 ? (
          <StateView
            tone="warning"
            title="تطبیق دقیق پیدا نشد"
            description="پیشنهادهای نزدیک و کشف را ببینید؛ یا یک ماده دیگر اضافه کنید."
          />
        ) : null}

        {!loading && exact.length > 0 ? (
          <Section title="دقیقاً با مواد من" items={exact} />
        ) : null}
        {!loading && near.length > 0 ? (
          <Section title="یک ماده کم" items={near} />
        ) : null}
        {!loading && discovery.length > 0 ? (
          <Section title="چند ماده کم / کشف" items={discovery} />
        ) : null}
      </div>
    </AppShell>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: RecommendationResult["exact"];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-atlas-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((card) => (
          <RecipeCard key={card.recipeId} card={card} />
        ))}
      </div>
    </section>
  );
}
