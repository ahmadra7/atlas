import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type {
  MealType,
  RecommendationCard,
  RecommendationFilters,
  RecommendationResult,
} from "@atlas/contracts";
import {
  difficultyLabelFa,
  formatMinutesFa,
  mealLabelFa,
  matchTierLabelFa,
  toPersianDigits,
} from "@atlas/shared";
import { Button, Chip, LoadingCard, RecipeHero, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";
import { Pressable } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Recommendations">;

const meals: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];
const times = [15, 30, 45, 60];

export function RecommendationsScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<RecommendationFilters>({
    meal: "any",
    maxMinutes: 60,
    difficulty: "any",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (next = filters) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await atlasClient.getRecommendations(next));
    } catch {
      setError("دریافت پیشنهادها ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exact = result?.exact ?? [];
  const near = result?.near ?? [];
  const discovery = result?.discovery ?? [];
  const total = exact.length + near.length + discovery.length;

  return (
    <Screen
      title="پیشنهادها"
      subtitle="اول دقیق، بعد یک ماده کم، بعد کشف. رتبه‌بندی سمت سرویس."
      action={
        <Button
          label="مواد"
          variant="ghost"
          onPress={() => navigation.navigate("Tabs")}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 16 }}>
        <View style={styles.card}>
          <Text style={styles.label}>وعده</Text>
          <View style={styles.chips}>
            {meals.map((meal) => (
              <Chip
                key={meal}
                label={mealLabelFa[meal]}
                active={filters.meal === meal}
                onPress={() => setFilters((f) => ({ ...f, meal }))}
              />
            ))}
          </View>
          <Text style={[styles.label, { marginTop: 12 }]}>حداکثر زمان</Text>
          <View style={styles.chips}>
            {times.map((maxMinutes) => (
              <Chip
                key={maxMinutes}
                label={`${toPersianDigits(maxMinutes)} دقیقه`}
                active={filters.maxMinutes === maxMinutes}
                onPress={() => setFilters((f) => ({ ...f, maxMinutes }))}
              />
            ))}
          </View>
          <Text style={[styles.label, { marginTop: 12 }]}>سختی</Text>
          <View style={styles.chips}>
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
                onPress={() => setFilters((f) => ({ ...f, difficulty: value }))}
              />
            ))}
          </View>
          <View style={{ marginTop: 14 }}>
            <Button label="اعمال فیلتر" onPress={() => void load(filters)} />
          </View>
        </View>

        {error ? (
          <StateCard
            title="خطا"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void load()}
          />
        ) : null}
        {loading ? <LoadingCard label="در حال رتبه‌بندی…" /> : null}
        {!loading && !error && total === 0 ? (
          <StateCard
            title="پیشنهادی نیست"
            description="مواد را بیشتر کنید یا فیلتر را بازتر بگیرید."
          />
        ) : null}
        {!loading && exact.length === 0 && total > 0 ? (
          <StateCard
            title="تطبیق دقیق پیدا نشد"
            description="پیشنهادهای نزدیک و کشف را ببینید."
          />
        ) : null}

        {!loading && exact.length > 0 ? (
          <Section
            title="دقیقاً با مواد من"
            items={exact}
            onOpen={(slug) => navigation.navigate("Recipe", { slug })}
          />
        ) : null}
        {!loading && near.length > 0 ? (
          <Section
            title="یک ماده کم"
            items={near}
            onOpen={(slug) => navigation.navigate("Recipe", { slug })}
          />
        ) : null}
        {!loading && discovery.length > 0 ? (
          <Section
            title="چند ماده کم / کشف"
            items={discovery}
            onOpen={(slug) => navigation.navigate("Recipe", { slug })}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Section({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: RecommendationCard[];
  onOpen: (slug: string) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((card) => (
        <Pressable
          key={card.recipeId}
          onPress={() => onOpen(card.slug)}
          style={styles.card}
        >
          <RecipeHero title={card.title} height={120} />
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.meta}>{card.explanation}</Text>
          <Text style={styles.meta}>
            {formatMinutesFa(card.totalMinutes)} ·{" "}
            {difficultyLabelFa[card.difficulty]} ·{" "}
            {matchTierLabelFa[card.matchTier]}
            {card.missingCount > 0
              ? ` · ${toPersianDigits(card.missingCount)} ماده کم`
              : ""}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.ink,
    textAlign: "right",
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  meta: {
    fontSize: 12,
    lineHeight: 20,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
});
