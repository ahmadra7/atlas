import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { FavoriteItem, HistoryItem, UserProfile } from "@atlas/contracts";
import { difficultyLabelFa, formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { Button, LoadingCard, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import { theme } from "../theme";

type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

const statusFa: Record<HistoryItem["status"], string> = {
  active: "در حال پخت",
  completed: "تمام‌شده",
  abandoned: "نیمه‌کاره",
  paused: "متوقف",
};

export function FavoritesScreen({ navigation }: TabProps<"Favorites">) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await atlasClient.getFavorites());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      void load();
    });
    return unsub;
  }, [navigation, load]);

  return (
    <Screen title="علاقه‌مندی‌ها" subtitle="دستورهای ذخیره‌شده برای پخت بعدی.">
      {loading ? <LoadingCard /> : null}
      {!loading && items.length === 0 ? (
        <StateCard
          title="هنوز چیزی ذخیره نشده"
          description="از صفحه دستور، ذخیره را بزنید."
          actionLabel="پیشنهادها"
          onAction={() => navigation.navigate("Recommendations")}
        />
      ) : null}
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 32 }}>
        {items.map((item) => (
          <View key={item.recipeId} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {formatMinutesFa(item.totalMinutes)} ·{" "}
              {difficultyLabelFa[item.difficulty]}
            </Text>
            <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 10 }}>
              <Button
                label="مشاهده"
                onPress={() => navigation.navigate("Recipe", { slug: item.slug })}
              />
              <Button
                label="حذف"
                variant="ghost"
                onPress={async () => {
                  await atlasClient.toggleFavorite(item.recipeId);
                  await load();
                }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function HistoryScreen({
  navigation,
}: {
  navigation: TabProps<"Favorites">["navigation"];
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      void (async () => {
        setLoading(true);
        try {
          setItems(await atlasClient.getHistory());
        } finally {
          setLoading(false);
        }
      })();
    });
    return unsub;
  }, [navigation]);

  return (
    <Screen title="تاریخچه پخت" subtitle="نشست‌های کامل و رهاشده.">
      {loading ? <LoadingCard /> : null}
      {!loading && items.length === 0 ? (
        <StateCard title="تاریخچه‌ای نیست" description="با شروع پخت اینجا می‌آید." />
      ) : null}
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 32 }}>
        {items.map((item) => (
          <Pressable
            key={item.sessionId}
            style={styles.card}
            onPress={() => navigation.navigate("Recipe", { slug: item.slug })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {statusFa[item.status]} ·{" "}
              {toPersianDigits(
                new Date(item.startedAt).toLocaleDateString("fa-IR"),
              )}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function ProfileScreen(_props: TabProps<"Profile">) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setProfile(await atlasClient.getProfile());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Screen title="پروفایل" subtitle="پروفایل سبک MVP.">
      {loading ? <LoadingCard /> : null}
      {profile ? (
        <View style={styles.card}>
          <Text style={styles.meta}>نام نمایشی</Text>
          <Text style={styles.title}>{profile.displayName}</Text>
          <Text style={[styles.meta, { marginTop: 12 }]}>زبان</Text>
          <Text style={styles.value}>فارسی (fa)</Text>
          <Text style={[styles.meta, { marginTop: 12 }]}>حداکثر زمان پیش‌فرض</Text>
          <Text style={styles.value}>
            {profile.defaultMaxMinutes
              ? `${toPersianDigits(profile.defaultMaxMinutes)} دقیقه`
              : "تعیین نشده"}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  value: {
    fontSize: 14,
    color: theme.colors.ink,
    textAlign: "right",
  },
});
