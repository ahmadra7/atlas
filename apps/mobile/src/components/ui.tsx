import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";

const variantStyles: Record<
  Variant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: theme.colors.primary, text: theme.colors.white },
  secondary: { bg: theme.colors.primarySoft, text: theme.colors.primary },
  ghost: { bg: "transparent", text: theme.colors.inkMuted },
  danger: { bg: theme.colors.dangerSoft, text: theme.colors.danger },
  accent: { bg: theme.colors.accent, text: theme.colors.white },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress?: PressableProps["onPress"];
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: PressableProps["style"];
}) {
  const colors = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        {
          backgroundColor: colors.bg,
          opacity: disabled || loading ? 0.55 : state.pressed ? 0.88 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  onRemove,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}) {
  return (
    <View
      style={[
        styles.chip,
        active
          ? {
              backgroundColor: theme.colors.chipActive,
              borderColor: theme.colors.chipActive,
            }
          : {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
      ]}
    >
      <Pressable onPress={onPress} disabled={!onPress}>
        <Text
          style={{
            color: active ? theme.colors.white : theme.colors.ink,
            fontSize: 13,
          }}
        >
          {label}
        </Text>
      </Pressable>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text
            style={{
              color: active ? theme.colors.white : theme.colors.inkMuted,
              marginRight: 4,
              fontSize: 14,
            }}
          >
            ×
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Screen({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

export function StateCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      {description ? <Text style={styles.stateDesc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: 16 }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function LoadingCard({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={[styles.stateDesc, { marginTop: 12 }]}>{label}</Text>
    </View>
  );
}

export function RecipeHero({ title, height = 160 }: { title: string; height?: number }) {
  return (
    <View style={[styles.hero, { height }]}>
      <Text style={styles.heroText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  chip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "right",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 22,
    color: theme.colors.inkMuted,
    textAlign: "right",
  },
  stateCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: 20,
    alignItems: "center",
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.ink,
    textAlign: "center",
  },
  stateDesc: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 22,
    color: theme.colors.inkMuted,
    textAlign: "center",
  },
  hero: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  heroText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
  },
});
