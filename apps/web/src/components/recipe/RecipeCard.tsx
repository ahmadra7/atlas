import Link from "next/link";
import type { RecommendationCard } from "@atlas/contracts";
import {
  difficultyLabelFa,
  formatMinutesFa,
  matchTierLabelFa,
  toPersianDigits,
} from "@atlas/shared";

export function RecipeCard({ card }: { card: RecommendationCard }) {
  return (
    <Link
      href={`/recipes/${card.slug}`}
      className="group atlas-surface block overflow-hidden transition hover:-translate-y-0.5 hover:border-atlas-border-strong"
    >
      <div
        className="h-40 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(28,36,33,0.05), rgba(28,36,33,0.35)), url(${card.imageUrl})`,
          backgroundColor: "#d9e5df",
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-atlas-ink group-hover:text-atlas-primary">
            {card.title}
          </h3>
          <span className="rounded-full bg-atlas-primary-soft px-2 py-1 text-xs text-atlas-primary">
            {toPersianDigits(card.matchScore)}٪
          </span>
        </div>
        <p className="text-sm text-atlas-ink-muted">{card.explanation}</p>
        <div className="flex flex-wrap gap-2 text-xs text-atlas-ink-faint">
          <span>{formatMinutesFa(card.totalMinutes)}</span>
          <span>•</span>
          <span>{difficultyLabelFa[card.difficulty]}</span>
          <span>•</span>
          <span>{matchTierLabelFa[card.matchTier]}</span>
          {card.missingCount > 0 ? (
            <>
              <span>•</span>
              <span className="text-atlas-warning">
                {toPersianDigits(card.missingCount)} ماده کم
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
