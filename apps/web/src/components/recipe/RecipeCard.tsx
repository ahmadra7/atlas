import Link from "next/link";
import type { RecommendationCard } from "@atlas/contracts";
import {
  difficultyLabelFa,
  formatMinutesFa,
  mealLabelFa,
  toPersianDigits,
} from "@atlas/shared";
import { SoftTag, TagRow } from "@/components/ui/SoftTag";
import { RecipeImage } from "./RecipeImage";
import { Timer1 } from "iconsax-react";

export function RecipeCard({ card }: { card: RecommendationCard }) {
  return (
    <Link
      href={`/recipes/${card.slug}`}
      className="atlas-surface block overflow-hidden transition active:scale-[0.99]"
    >
      <RecipeImage
        src={card.imageUrl}
        alt={card.title}
        className="h-40 w-full"
      />
      <div className="space-y-3 p-4">
        <TagRow>
          <SoftTag label={mealLabelFa[card.meal]} tone="red" />
          <SoftTag label={card.cuisine} tone="amber" />
          <SoftTag label={difficultyLabelFa[card.difficulty]} tone="gray" />
        </TagRow>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-atlas-ink">{card.title}</h3>
          <SoftTag
            label={`${toPersianDigits(card.matchScore)}٪`}
            tone="black"
          />
        </div>
        <p className="text-caption text-atlas-ink-muted">{card.explanation}</p>
        <div className="flex flex-wrap gap-2">
          <SoftTag
            label={formatMinutesFa(card.totalMinutes)}
            tone="soft"
            icon={<Timer1 size={14} color="currentColor" />}
          />
          {card.missingCount > 0 ? (
            <SoftTag
              label={`${toPersianDigits(card.missingCount)} ماده کم`}
              tone="violet"
            />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
