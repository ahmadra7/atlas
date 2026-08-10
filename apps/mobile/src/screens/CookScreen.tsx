import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
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
import { Button, LoadingCard, RecipeHero, Screen, StateCard } from "../components/ui";
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
  const [showSos, setShowSos] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [askText, setAskText] = useState("");
  const [abandonReason, setAbandonReason] = useState("");
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
    setSession(await atlasClient.completeStep(session.id, step.id));
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
          title="پخت تمام شد"
          description={`«${session.recipeTitle}» کامل شد. بازخورد اجباری نیست.`}
          actionLabel="بازگشت به پیشنهادها"
          onAction={() => navigation.navigate("Recommendations")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 14 }}>
        <View style={styles.topRow}>
          <Pressable onPress={() => setShowAbandon(true)}>
            <Text style={styles.exit}>خروج</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>{session.recipeTitle}</Text>
            <Text style={styles.progress}>
              مرحله {toPersianDigits(step.order)} از{" "}
              {toPersianDigits(session.totalSteps)}
            </Text>
          </View>
        </View>

        <RecipeHero title={session.recipeTitle} height={170} />

        <View style={styles.card}>
          <Text style={styles.instruction}>{step.instruction}</Text>
          {step.tip ? (
            <View style={styles.tip}>
              <Text style={styles.tipText}>نکته مهم: {step.tip}</Text>
            </View>
          ) : null}

          {timerLeft !== null ? (
            <View style={styles.timerBox}>
              <View>
                <Text style={styles.timerLabel}>تایمر مرحله</Text>
                <Text style={styles.timerValue}>
                  {formatDurationClock(timerLeft)}
                </Text>
              </View>
              <View style={{ gap: 8, minWidth: 120 }}>
                <Button
                  label={timerRunning ? "توقف" : "شروع تایمر"}
                  variant="secondary"
                  onPress={() => setTimerRunning((v) => !v)}
                />
                <Button
                  label="ریست"
                  variant="ghost"
                  onPress={() => {
                    setTimerLeft(step.timerSeconds ?? 0);
                    setTimerRunning(false);
                  }}
                />
              </View>
            </View>
          ) : null}

          {helpReply ? (
            <View style={styles.help}>
              <Text style={styles.helpText}>{helpReply}</Text>
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            <Button
              label="بپرس از ما"
              variant="secondary"
              onPress={() => setShowAsk(true)}
            />
            <Button
              label="کمک فوری (SOS)"
              variant="danger"
              onPress={() => setShowSos(true)}
            />
            <Button
              label={
                step.order >= session.totalSteps ? "پایان پخت" : "مرحله بعد"
              }
              onPress={() => void goNext()}
            />
          </View>
          <Text style={styles.footnote}>
            کنترل صوتی مکمل است؛ دکمه‌های لمسی همیشه در دسترس‌اند.
          </Text>
        </View>
      </ScrollView>

      <SimpleModal visible={showSos} title="کمک فوری" onClose={() => setShowSos(false)}>
        <View style={{ gap: 8 }}>
          {sosIssues.map((issue) => (
            <Button
              key={issue.code}
              label={issue.label}
              variant="secondary"
              onPress={async () => {
                const res = await atlasClient.sendSos(session.id, issue.code);
                setHelpReply(res.reply);
                setShowSos(false);
              }}
            />
          ))}
        </View>
      </SimpleModal>

      <SimpleModal
        visible={showAsk}
        title="سؤال درباره همین مرحله"
        onClose={() => setShowAsk(false)}
      >
        <TextInput
          value={askText}
          onChangeText={setAskText}
          multiline
          textAlign="right"
          placeholder="مثلاً حرارت زیاد است؟"
          placeholderTextColor={theme.colors.inkFaint}
          style={styles.input}
        />
        <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 12 }}>
          <Button label="ارسال" onPress={async () => {
            if (!askText.trim()) return;
            const res = await atlasClient.askAssistant(session.id, askText.trim());
            setHelpReply(res.reply);
            setAskText("");
            setShowAsk(false);
          }} />
          <Button label="انصراف" variant="ghost" onPress={() => setShowAsk(false)} />
        </View>
      </SimpleModal>

      <SimpleModal
        visible={showAbandon}
        title="خروج از پخت"
        onClose={() => setShowAbandon(false)}
      >
        <Text style={styles.helpText}>
          بازخورد اختیاری است. می‌توانید بدون توضیح خارج شوید.
        </Text>
        <TextInput
          value={abandonReason}
          onChangeText={setAbandonReason}
          multiline
          textAlign="right"
          placeholder="دلیل (اختیاری)"
          placeholderTextColor={theme.colors.inkFaint}
          style={[styles.input, { marginTop: 12 }]}
        />
        <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 12 }}>
          <Button
            label="خروج"
            variant="danger"
            onPress={async () => {
              await atlasClient.abandonSession(
                session.id,
                abandonReason || undefined,
              );
              navigation.navigate("Recommendations");
            }}
          />
          <Button
            label="ادامه پخت"
            variant="ghost"
            onPress={() => setShowAbandon(false)}
          />
        </View>
      </SimpleModal>
    </Screen>
  );
}

function SimpleModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.exit}>بستن</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  exit: {
    color: theme.colors.inkMuted,
    fontSize: 14,
  },
  kicker: {
    color: theme.colors.inkFaint,
    textAlign: "right",
    fontSize: 12,
  },
  progress: {
    color: theme.colors.ink,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "right",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 14,
  },
  instruction: {
    fontSize: 18,
    lineHeight: 32,
    fontWeight: "600",
    color: theme.colors.ink,
    textAlign: "right",
  },
  tip: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#edd7b3",
  },
  tipText: {
    color: theme.colors.ink,
    textAlign: "right",
    lineHeight: 22,
    fontSize: 13,
  },
  timerBox: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  timerLabel: {
    color: theme.colors.inkFaint,
    textAlign: "right",
    fontSize: 12,
  },
  timerValue: {
    color: theme.colors.ink,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  help: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  helpText: {
    color: theme.colors.ink,
    textAlign: "right",
    lineHeight: 22,
    fontSize: 13,
  },
  footnote: {
    color: theme.colors.inkFaint,
    textAlign: "center",
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontWeight: "700",
    color: theme.colors.ink,
    fontSize: 16,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.ink,
  },
});
