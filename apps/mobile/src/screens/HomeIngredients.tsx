import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Ingredient, InventoryItem } from "@atlas/contracts";
import { toPersianDigits } from "@atlas/shared";
import { Button, Chip, LoadingCard, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { theme } from "../theme";

type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export function IngredientsScreen({ navigation }: TabProps<"Ingredients">) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInventory(await atlasClient.getInventory());
    } catch {
      setError("بارگذاری مواد ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const results = await atlasClient.searchIngredients(query);
      if (!cancelled) setSuggestions(results);
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const selectedIds = useMemo(
    () => new Set(inventory.map((i) => i.ingredientId)),
    [inventory],
  );

  async function addIngredient(id: string) {
    await atlasClient.addInventoryItem(id);
    await loadInventory();
    setQuery("");
  }

  async function removeItem(id: string) {
    await atlasClient.removeInventoryItem(id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <Screen
      title="مواد من"
      subtitle="تکمیل خودکار فارسی، چیپ‌های قابل ویرایش، نرمال‌سازی ی/ک."
      action={
        <Button
          label="پیشنهادها"
          variant="secondary"
          disabled={inventory.length === 0}
          onPress={() => navigation.navigate("Recommendations")}
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 16 }}>
        <View style={styles.card}>
          <Text style={styles.label}>جستجو و افزودن</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="مثلاً گوجه، تخم مرغ…"
            placeholderTextColor={theme.colors.inkFaint}
            style={styles.input}
            textAlign="right"
          />
          <View style={styles.chips}>
            {suggestions.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <Chip
                  key={item.id}
                  label={item.name}
                  active={selected}
                  onPress={() => {
                    if (!selected) void addIngredient(item.id);
                  }}
                />
              );
            })}
          </View>
        </View>

        {error ? (
          <StateCard
            title="خطا"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void loadInventory()}
          />
        ) : null}

        {loading ? (
          <LoadingCard label="در حال بارگذاری مواد…" />
        ) : inventory.length === 0 ? (
          <StateCard
            title="هنوز ماده‌ای ندارید"
            description="چند ماده پرتکرار را انتخاب کنید."
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>
              انتخاب‌شده‌ها ({toPersianDigits(inventory.length)})
            </Text>
            <View style={styles.chips}>
              {inventory.map((item) => (
                <Chip
                  key={item.id}
                  label={item.ingredient.name}
                  onRemove={() => void removeItem(item.id)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

export function HomeScreen({ navigation }: TabProps<"Home">) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <Text style={styles.brand}>ATLAS</Text>
          <Text style={styles.heroTitle}>
            با مواد موجود بفهمید چه بپزید و مرحله‌به‌مرحله جلو بروید.
          </Text>
          <Text style={styles.heroBody}>
            مسیر اصلی: مواد → فیلتر → پیشنهاد دقیق → دستور → پخت آرام.
          </Text>
          <View style={{ gap: 10, marginTop: 16 }}>
            <Button
              label="شروع با مواد من"
              onPress={() => navigation.navigate("Ingredients")}
            />
            <Button
              label="دیدن پیشنهادها"
              variant="secondary"
              onPress={() => navigation.navigate("Recommendations")}
            />
          </View>
        </View>

        {[
          "اولویت با تطبیق دقیق مواد",
          "حالت پخت با دکمه بزرگ و تایمر",
          "کمک فوری و خروج اختیاری",
        ].map((item) => (
          <View key={item} style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.point}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.ink,
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
  },
  brand: {
    color: theme.colors.primary,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
    lineHeight: 34,
  },
  heroBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 24,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  point: {
    textAlign: "right",
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 24,
  },
});
