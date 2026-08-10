import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Recipe } from "@atlas/contracts";
import {
  difficultyLabelFa,
  formatMinutesFa,
  mealLabelFa,
  toPersianDigits,
} from "@atlas/shared";
import { Button, LoadingCard, RecipeHero, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Recipe">;

export function RecipeScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await atlasClient.getRecipeBySlug(slug);
        if (cancelled) return;
        setRecipe(data);
        if (!data) setError("دستور پیدا نشد.");
        const favorites = await atlasClient.getFavorites();
        if (!cancelled && data) {
          setFavorited(favorites.some((f) => f.recipeId === data.id));
        }
      } catch {
        if (!cancelled) setError("بارگذاری دستور ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function startCooking() {
    if (!recipe) return;
    setStarting(true);
    try {
      const session = await atlasClient.startCookingSession(recipe.id);
      navigation.replace("Cook", { sessionId: session.id });
    } catch {
      setError("شروع پخت ممکن نشد.");
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <Screen title="دستور">
        <LoadingCard label="در حال بارگذاری دستور…" />
      </Screen>
    );
  }

  if (!recipe) {
    return (
      <Screen title="دستور">
        <StateCard
          title="خطا"
          description={error ?? "دستور در دسترس نیست."}
          actionLabel="بازگشت"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 14 }}>
        <RecipeHero title={recipe.title} height={180} />
        <Text style={styles.kicker}>
          {mealLabelFa[recipe.meal]} · {recipe.cuisine}
        </Text>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.body}>{recipe.description}</Text>
        <Text style={styles.meta}>
          {formatMinutesFa(recipe.totalMinutes)} ·{" "}
          {difficultyLabelFa[recipe.difficulty]} ·{" "}
          {toPersianDigits(recipe.servings)} نفر
        </Text>

        <View style={styles.actions}>
          <Button
            label={favorited ? "حذف از علاقه‌مندی" : "ذخیره"}
            variant="secondary"
            onPress={async () => {
              const next = await atlasClient.toggleFavorite(recipe.id);
              setFavorited(next);
            }}
          />
          <Button
            label={starting ? "در حال شروع…" : "شروع پخت"}
            loading={starting}
            onPress={() => void startCooking()}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>مواد لازم</Text>
          {recipe.ingredients.map((ing) => (
            <View key={`${ing.ingredientId}-${ing.name}`} style={styles.row}>
              <Text style={styles.rowMain}>
                {ing.name}
                {ing.optional ? " (اختیاری)" : ""}
              </Text>
              <Text style={styles.rowSide}>
                {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>مراحل</Text>
          {recipe.steps.map((step) => (
            <Text key={step.id} style={styles.step}>
              مرحله {toPersianDigits(step.order)}: {step.instruction}
            </Text>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: theme.colors.primary,
    textAlign: "right",
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  body: {
    fontSize: 14,
    lineHeight: 24,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  meta: {
    fontSize: 13,
    color: theme.colors.inkFaint,
    textAlign: "right",
  },
  actions: {
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 14,
    gap: 8,
  },
  section: {
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingVertical: 8,
  },
  rowMain: {
    color: theme.colors.ink,
    textAlign: "right",
    flex: 1,
  },
  rowSide: {
    color: theme.colors.inkFaint,
  },
  step: {
    color: theme.colors.inkMuted,
    textAlign: "right",
    lineHeight: 24,
    fontSize: 13,
  },
});
