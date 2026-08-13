import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type {
  Ingredient,
  InventoryItem,
  RecommendationCard,
} from "@atlas/contracts";
import { formatMinutesFa, normalizePersian, toPersianDigits } from "@atlas/shared";
import { Button, Chip, LoadingCard, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { theme } from "../theme";

type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: TabProps<"Home">) {
  const [popular, setPopular] = useState<RecommendationCard[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetCount, setSheetCount] = useState(0);

  useEffect(() => {
    void (async () => {
      const rec = await atlasClient.getRecommendations({
        meal: "any",
        maxMinutes: 60,
      });
      setPopular([...rec.exact, ...rec.near, ...rec.discovery].slice(0, 4));
    })();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 100, gap: 18 }}>
        <View>
          <Text style={styles.hello}>سلام احمد!</Text>
          <Text style={styles.greeting}>صبح بخیر 👋</Text>
        </View>

        <View style={styles.heroWrap}>
          <Image
            source={require("../../assets/hero-serve.png")}
            style={styles.heroIcon}
          />
          <View style={styles.heroCard}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>چیا تو یخچال داری ؟!</Text>
              <Text style={styles.heroBody}>
                هر موادی داری بگو تا من بگم چی درست کن
              </Text>
            </View>
            <Pressable
              style={styles.heroBtn}
              onPress={() => setSheetOpen(true)}
            >
              <Text style={styles.heroBtnText}>🥕  افزودن مواد</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.searchBar}
          onPress={() => navigation.navigate("Search")}
        >
          <Text style={styles.searchPlaceholder}>جستجوی دستور یا ماده…</Text>
        </Pressable>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>دستورهای محبوب</Text>
          <Pressable onPress={() => navigation.navigate("Recommendations")}>
            <Text style={styles.linkAll}>همه ←</Text>
          </Pressable>
        </View>

        <View style={{ gap: 10 }}>
          {popular.map((card) => (
            <Pressable
              key={card.recipeId}
              style={styles.recipeRow}
              onPress={() =>
                navigation.navigate("Recipe", { slug: card.slug })
              }
            >
              <View style={styles.recipeThumb}>
                <Text style={styles.thumbEmoji}>🍽</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.cuisine}>{card.cuisine}</Text>
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {card.title}
                </Text>
                <Text style={styles.meta}>
                  {formatMinutesFa(card.totalMinutes)} ·{" "}
                  {toPersianDigits(card.servings)} نفر
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={sheetOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>افزودن مواد</Text>
            <Pressable onPress={() => setSheetOpen(false)}>
              <Text style={styles.sheetClose}>✕</Text>
            </Pressable>
          </View>
          <IngredientsPanel onCountChange={setSheetCount} />
          <View style={styles.sheetFooter}>
            <Button
              label="دریافت دستورها"
              disabled={sheetCount === 0}
              onPress={() => {
                setSheetOpen(false);
                navigation.navigate("Recommendations");
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function IngredientsPanel({
  onCountChange,
}: {
  onCountChange?: (n: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const items = await atlasClient.getInventory();
      setInventory(items);
      onCountChange?.(items.length);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const results = await atlasClient.searchIngredients(query);
      if (!cancelled) setSuggestions(results);
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

  async function addTyped() {
    if (!trimmed || selectedNames.has(normalizePersian(trimmed))) return;
    setAdding(true);
    try {
      await atlasClient.addIngredientByName(trimmed);
      await loadInventory();
      setQuery("");
    } finally {
      setAdding(false);
    }
  }

  async function addSuggestion(item: Ingredient) {
    if (selectedIds.has(item.id)) return;
    setAdding(true);
    try {
      await atlasClient.addInventoryItem(item.id);
      await loadInventory();
      setQuery("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}
    >
      <Text style={styles.sheetHint}>
        بنویسید تا پیشنهادها بیاید؛ پیشنهاد را انتخاب کنید یا همان متن را اضافه
        کنید.
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="مثلاً گوجه، عدس، قارچ…"
          placeholderTextColor={theme.colors.inkFaint}
          style={styles.input}
          textAlign="right"
          onSubmitEditing={() => void addTyped()}
        />
        <Button
          label="افزودن"
          disabled={!trimmed || adding}
          onPress={() => void addTyped()}
          style={{ minWidth: 88 }}
        />
      </View>

      {trimmed ? (
        <View style={styles.card}>
          {suggestions.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <Pressable
                key={item.id}
                disabled={selected || adding}
                onPress={() => void addSuggestion(item)}
                style={styles.suggestRow}
              >
                <Text style={styles.suggestName}>{item.name}</Text>
                <Text style={styles.suggestMeta}>
                  {selected ? "✓" : "+"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : loading ? (
        <LoadingCard />
      ) : inventory.length === 0 ? (
        <StateCard
          title="ماده‌ای انتخاب نشده"
          description="جستجو کنید و اضافه کنید."
        />
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionMuted}>مواد اضافه‌شده</Text>
          <View style={styles.chips}>
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
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export function IngredientsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Ingredients">) {
  const [count, setCount] = useState(0);
  return (
    <Screen title="افزودن مواد">
      <IngredientsPanel onCountChange={setCount} />
      <View style={{ paddingBottom: 24 }}>
        <Button
          label="دریافت دستورها"
          disabled={count === 0}
          onPress={() => navigation.navigate("Recommendations")}
        />
      </View>
    </Screen>
  );
}

export function SearchScreen({ navigation }: TabProps<"Search">) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecommendationCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const rec = await atlasClient.getRecommendations({
          meal: "any",
          maxMinutes: 90,
        });
        const all = [...rec.exact, ...rec.near, ...rec.discovery];
        const q = normalizePersian(query);
        if (!cancelled) {
          setResults(
            all.filter((c) => normalizePersian(c.title).includes(q)).slice(0, 12),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <Screen title="جستجو">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="جستجوی دستور…"
        placeholderTextColor={theme.colors.inkFaint}
        style={[styles.input, { marginBottom: 14 }]}
        textAlign="right"
        autoFocus
      />
      {loading ? <LoadingCard /> : null}
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 40 }}>
        {results.map((card) => (
          <Pressable
            key={card.recipeId}
            style={styles.recipeRow}
            onPress={() => navigation.navigate("Recipe", { slug: card.slug })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeTitle}>{card.title}</Text>
              <Text style={styles.meta}>
                {formatMinutesFa(card.totalMinutes)} · {card.cuisine}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: {
    fontSize: 13,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.ink,
    textAlign: "right",
    marginTop: 2,
  },
  heroWrap: {
    marginTop: 8,
    position: "relative",
    paddingTop: 18,
  },
  heroIcon: {
    position: "absolute",
    left: -6,
    top: 0,
    width: 108,
    height: 108,
    zIndex: 2,
    resizeMode: "contain",
  },
  heroCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  heroTextBlock: {
    paddingLeft: 96,
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    textAlign: "right",
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#52525B",
    textAlign: "right",
  },
  heroBtn: {
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  searchBar: {
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  searchPlaceholder: {
    color: theme.colors.inkFaint,
    textAlign: "right",
    fontSize: 14,
  },
  sectionHead: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.ink,
  },
  linkAll: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  recipeRow: {
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 10,
  },
  recipeThumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 22 },
  cuisine: {
    fontSize: 11,
    color: "#52525B",
    textAlign: "right",
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  meta: {
    fontSize: 12,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  sheet: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D4D4D8",
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.ink,
  },
  sheetClose: {
    fontSize: 22,
    color: theme.colors.inkMuted,
    padding: 4,
  },
  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16,
    paddingBottom: 28,
  },
  sheetHint: {
    fontSize: 13,
    lineHeight: 22,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  suggestRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestName: {
    fontSize: 15,
    color: theme.colors.ink,
    fontWeight: "600",
  },
  suggestMeta: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  sectionMuted: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
});
