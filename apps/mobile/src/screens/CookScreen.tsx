import { useEffect, useMemo, useState } from "react";
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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CookingSession } from "@atlas/contracts";
import { formatDurationClock, toPersianDigits } from "@atlas/shared";
import { Button, LoadingCard, Screen, StateCard } from "../components/ui";
import { atlasClient } from "../lib/client";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Cook">;

const sosIssues = [
  { code: "burning", label: "داره می‌سوزه" },
  { code: "too_salty", label: "شور شده" },
  { code: "undercooked", label: "خام مونده" },
  { code: "missing_tool", label: "ابزار ندارم" },
  { code: "other", label: "مشکل دیگر" },
];

export function CookScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [askText, setAskText] = useState("");
  const [helpReply, setHelpReply] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await atlasClient.getCookingSession(sessionId);
        if (!cancelled) {
          setSession(data);
          if (!data) setError("نشست پخت پیدا نشد.");
        }
      } catch {
        if (!cancelled) setError("بارگذاری نشست ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const step = useMemo(() => {
    if (!session) return null;
    return (
      session.steps.find((s) => s.order === session.currentStepOrder) ??
      session.steps[session.steps.length - 1]
    );
  }, [session]);

  useEffect(() => {
    if (!timerRunning || timerLeft === null) return;
    if (timerLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    const id = setInterval(() => {
      setTimerLeft((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerLeft]);

  useEffect(() => {
    if (step?.timerSeconds) {
      setTimerLeft(step.timerSeconds);
      setTimerRunning(false);
    } else {
      setTimerLeft(null);
      setTimerRunning(false);
    }
    setHelpReply(null);
  }, [step?.id, step?.timerSeconds]);

  async function goNext() {
    if (!session || !step) return;
    if (step.order >= session.totalSteps) {
      setSession(await atlasClient.completeSession(session.id));
      return;
    }
    setSession(await atlasClient.completeStep(session.id, step.order));
  }

  async function goPrev() {
    if (!session || !step || step.order <= 1) return;
    setSession({ ...session, currentStepOrder: step.order - 1 });
  }

  if (loading) {
    return (
      <Screen>
        <LoadingCard label="آماده‌سازی حالت پخت…" />
      </Screen>
    );
  }

  if (error || !session || !step) {
    return (
      <Screen>
        <StateCard
          title="نشست پخت در دسترس نیست"
          description={error ?? undefined}
          actionLabel="بازگشت"
          onAction={() => navigation.navigate("Recommendations")}
        />
      </Screen>
    );
  }

  if (session.status === "completed") {
    return (
      <Screen>
        <StateCard
          title="پخت تمام شد!"
          description={`«${session.recipeTitle}» آماده است.`}
          actionLabel="بازگشت به خانه"
          onAction={() => navigation.navigate("Tabs")}
        />
      </Screen>
    );
  }

  const displaySeconds = timerLeft ?? step.timerSeconds ?? null;

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.topRow}>
          <Text style={styles.stepLabel}>
            مرحله {toPersianDigits(step.order)} از{" "}
            {toPersianDigits(session.totalSteps)}
          </Text>
          <Pressable onPress={() => setShowAbandon(true)} hitSlop={10}>
            <Text style={styles.exit}>خروج</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step.order / session.totalSteps) * 100}%` },
            ]}
          />
        </View>

        {step.imageUrl ? (
          <Image source={{ uri: step.imageUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
        )}

        <View style={styles.centerBlock}>
          <Text style={styles.instruction}>{step.instruction}</Text>
          {step.tip ? (
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          ) : null}
        </View>

        {displaySeconds !== null ? (
          <Pressable
            style={styles.timerWrap}
            onPress={() => {
              if (timerLeft === null) setTimerLeft(step.timerSeconds ?? 300);
              setTimerRunning((v) => !v);
            }}
          >
            <Image
              source={require("../../assets/alarm-clock-3d.png")}
              style={styles.clock}
            />
            <Text
              style={[
                styles.timerValue,
                timerRunning && { color: theme.colors.primary },
              ]}
            >
              {formatDurationClock(timerLeft ?? displaySeconds)}
            </Text>
            <Text style={styles.timerHint}>
              {timerRunning ? "برای توقف بزنید" : "برای شروع بزنید"}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.navRow}>
          <Button
            label="قبلی"
            variant="secondary"
            disabled={step.order <= 1}
            onPress={() => void goPrev()}
            style={{ flex: 1 }}
          />
          <Button
            label={step.order >= session.totalSteps ? "اتمام پخت" : "مرحله بعد"}
            onPress={() => void goNext()}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <Pressable style={styles.fab} onPress={() => setShowAsk(true)}>
        <Image
          source={require("../../assets/brand-chef.png")}
          style={styles.fabImg}
        />
        <Text style={styles.fabStars}>✦</Text>
      </Pressable>

      <Modal visible={showAsk} animationType="slide" transparent>
        <Pressable style={styles.backdrop} onPress={() => setShowAsk(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>دستیار هوشمند</Text>
            <Pressable onPress={() => setShowAsk(false)}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          {helpReply ? (
            <Text style={styles.reply}>{helpReply}</Text>
          ) : (
            <Text style={styles.sheetHint}>
              سؤال بپرسید یا برای مشکل فوری یکی از گزینه‌های SOS را بزنید.
            </Text>
          )}
          <Text style={styles.sosLabel}>کمک فوری (SOS)</Text>
          <View style={styles.sosChips}>
            {sosIssues.map((issue) => (
              <Pressable
                key={issue.code}
                style={styles.sosChip}
                onPress={async () => {
                  const res = await atlasClient.sendSos(session.id, issue.code);
                  setHelpReply(res.reply);
                }}
              >
                <Text style={styles.sosChipText}>{issue.label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={askText}
            onChangeText={setAskText}
            placeholder="سؤال خود را بپرسید…"
            placeholderTextColor={theme.colors.inkFaint}
            style={styles.askInput}
            textAlign="right"
            multiline
          />
          <Button
            label="ارسال"
            disabled={!askText.trim()}
            onPress={async () => {
              const res = await atlasClient.askAssistant(
                session.id,
                askText.trim(),
              );
              setHelpReply(res.reply);
              setAskText("");
            }}
          />
        </View>
      </Modal>

      <Modal visible={showAbandon} animationType="fade" transparent>
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowAbandon(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>خروج از پخت</Text>
          <Text style={styles.sheetHint}>
            می‌توانید بدون توضیح خارج شوید.
          </Text>
          <View style={styles.navRow}>
            <Button
              label="ادامه پخت"
              variant="ghost"
              onPress={() => setShowAbandon(false)}
              style={{ flex: 1 }}
            />
            <Button
              label="خروج"
              variant="danger"
              onPress={async () => {
                await atlasClient.abandonSession(session.id);
                navigation.navigate("Tabs");
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingBottom: 90 },
  topRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
  },
  exit: { color: theme.colors.inkMuted, fontSize: 14, fontWeight: "600" },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  photo: {
    marginTop: 14,
    height: 170,
    width: "100%",
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceMuted,
  },
  photoFallback: { alignItems: "center", justifyContent: "center" },
  centerBlock: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 28,
    paddingBottom: 8,
  },
  instruction: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    lineHeight: 40,
  },
  tipRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 14,
    alignItems: "flex-start",
  },
  tipIcon: { fontSize: 16 },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  timerWrap: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  clock: { width: 80, height: 80, resizeMode: "contain" },
  timerValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.ink,
  },
  timerHint: { fontSize: 11, color: theme.colors.inkFaint, marginTop: 2 },
  navRow: { flexDirection: "row-reverse", gap: 10, marginTop: 8 },
  fab: {
    position: "absolute",
    left: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  fabImg: { width: 40, height: 40, resizeMode: "contain" },
  fabStars: {
    position: "absolute",
    top: 2,
    right: 4,
    color: theme.colors.primary,
    fontSize: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    marginTop: "auto",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  sheetHead: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.ink },
  close: { fontSize: 22, color: theme.colors.inkMuted },
  sheetHint: {
    fontSize: 13,
    color: theme.colors.inkMuted,
    textAlign: "right",
    lineHeight: 22,
  },
  reply: {
    backgroundColor: "#FAFAFA",
    borderRadius: theme.radius.md,
    padding: 12,
    fontSize: 14,
    lineHeight: 24,
    color: theme.colors.ink,
    textAlign: "right",
  },
  sosLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.danger,
    textAlign: "right",
  },
  sosChips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  sosChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  sosChipText: { fontSize: 12, color: theme.colors.ink },
  askInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.ink,
    textAlignVertical: "top",
  },
});
