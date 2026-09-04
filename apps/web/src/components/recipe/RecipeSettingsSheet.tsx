"use client";

import type { ReactNode } from "react";
import type { DietMode, Difficulty, DishType, MealType } from "@atlas/contracts";
import {
  dietModeLabelFa,
  difficultyLabelFa,
  dishTypeLabelFa,
  mealLabelFa,
  toPersianDigits,
} from "@atlas/shared";
import {
  Category,
  Chart,
  Coffee,
  Global,
  Heart,
  Like1,
  TickCircle,
  Timer1,
  Trash,
} from "iconsax-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

export const mealOptions: MealType[] = [
  "any",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];
export const timeOptions = [15, 30, 45, 60, 90, 120, 180];
export const dietModes: DietMode[] = ["any", "diet", "regular"];
export const dishTypes: DishType[] = [
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
export const difficulties: Array<Difficulty | "any"> = [
  "any",
  "easy",
  "medium",
  "hard",
];
export const cuisineOptions = [
  "any",
  "ایرانی",
  "ایتالیایی",
  "آسیایی",
  "مدیترانه‌ای",
  "مکزیکی",
];
export const preferenceOptions = ["گیاهی", "وگان", "بدون گلوتن", "کم‌کالری"];

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
}: {
  options: T[];
  value: T;
  onChange: (next: T) => void;
  labelOf: (option: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-1.5 text-caption transition ${
            value === option
              ? "bg-atlas-chip-active font-bold text-atlas-chip-active-text"
              : "bg-zinc-50 font-medium text-atlas-ink-muted ring-1 ring-zinc-200/90 dark:bg-atlas-surface-muted/40 dark:ring-atlas-border"
          }`}
        >
          {labelOf(option)}
        </button>
      ))}
    </div>
  );
}

export type RecipeFilterDraft = {
  meal: MealType;
  maxMinutes: number;
  dietMode: DietMode;
  dishType: DishType;
  difficulty: Difficulty | "any";
  cuisine: string;
  budgetFriendly: boolean;
  preferences: string[];
};

export function RecipeSettingsSheet({
  open,
  onClose,
  draft,
  onChange,
  onApply,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  draft: RecipeFilterDraft;
  onChange: (next: RecipeFilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      title="تنظیمات"
      titleClassName="text-[15px] font-medium"
      tall
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button
            className="flex-[1.4]"
            onClick={onApply}
            icon={<TickCircle size={18} color="currentColor" variant="Bold" />}
          >
            تایید
          </Button>
          <Button
            variant="tertiary"
            className="flex-1"
            onClick={onReset}
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
            value={draft.meal}
            onChange={(meal) => onChange({ ...draft, meal })}
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
                onClick={() => onChange({ ...draft, maxMinutes: mins })}
                className={`rounded-lg px-3 py-1.5 text-caption transition ${
                  draft.maxMinutes === mins
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
            value={draft.dietMode}
            onChange={(dietMode) => onChange({ ...draft, dietMode })}
            labelOf={(m) => dietModeLabelFa[m]}
          />
        </div>

        <div className="space-y-2">
          <SettingsHeading icon={Category}>نوع غذا</SettingsHeading>
          <OptionChips
            options={dishTypes}
            value={draft.dishType}
            onChange={(dishType) => onChange({ ...draft, dishType })}
            labelOf={(t) => dishTypeLabelFa[t]}
          />
        </div>

        <div className="space-y-2">
          <SettingsHeading icon={Chart}>سختی پخت</SettingsHeading>
          <OptionChips
            options={difficulties}
            value={draft.difficulty}
            onChange={(difficulty) => onChange({ ...draft, difficulty })}
            labelOf={(d) => (d === "any" ? "همه" : difficultyLabelFa[d])}
          />
        </div>

        <div className="space-y-2">
          <SettingsHeading icon={Global}>سبک آشپزی</SettingsHeading>
          <OptionChips
            options={cuisineOptions}
            value={draft.cuisine}
            onChange={(cuisine) => onChange({ ...draft, cuisine })}
            labelOf={(c) => (c === "any" ? "همه" : c)}
          />
        </div>

        <div className="space-y-2">
          <SettingsHeading icon={Like1}>ترجیحات</SettingsHeading>
          <div className="flex flex-wrap gap-2">
            {preferenceOptions.map((tag) => {
              const active = draft.preferences.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      preferences: active
                        ? draft.preferences.filter((t) => t !== tag)
                        : [...draft.preferences, tag],
                    })
                  }
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
              onClick={() =>
                onChange({ ...draft, budgetFriendly: !draft.budgetFriendly })
              }
              className={`rounded-lg px-3 py-1.5 text-caption transition ${
                draft.budgetFriendly
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
  );
}
