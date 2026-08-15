import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import {
  createVoiceBridge,
  voiceBridgeBootstrap,
} from "./src/voiceBridge";
import { WEB_APP_URL } from "./src/webUrl";

const RETRY_MS = 3500;
/** Never leave the blocking overlay up longer than this. */
const LOAD_TIMEOUT_MS = 2500;

function isExternalShopUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "okala.com" ||
      host.endsWith(".okala.com") ||
      host === "snapp.market" ||
      host.endsWith(".snapp.market") ||
      host.includes("snapp.market")
    );
  } catch {
    return /okala\.com|snapp\.market/i.test(url);
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [url, setUrl] = useState(WEB_APP_URL);
  const [nav, setNav] = useState<{ url: string; canGoBack: boolean }>({
    url: WEB_APP_URL,
    canGoBack: false,
  });
  const autoRetries = useRef(0);
  const webRef = useRef<WebView>(null);
  const voiceBridgeRef = useRef<ReturnType<typeof createVoiceBridge> | null>(
    null,
  );
  /** After first paint, in-app navigations must not freeze the UI. */
  const hasLoadedOnce = useRef(false);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showShopBack = isExternalShopUrl(nav.url);

  const clearLoadTimer = () => {
    if (loadTimer.current) {
      clearTimeout(loadTimer.current);
      loadTimer.current = null;
    }
  };

  const finishLoading = () => {
    clearLoadTimer();
    setLoading(false);
    hasLoadedOnce.current = true;
    autoRetries.current = 0;
    voiceBridgeRef.current?.announceReady();
  };

  const beginLoading = (force = false) => {
    // Subsequent page changes: keep WebView interactive (no full-screen freeze).
    if (hasLoadedOnce.current && !force) return;
    setLoading(true);
    clearLoadTimer();
    loadTimer.current = setTimeout(() => {
      setLoading(false);
      hasLoadedOnce.current = true;
    }, LOAD_TIMEOUT_MS);
  };

  const returnToApp = () => {
    if (nav.canGoBack) {
      webRef.current?.goBack();
      return;
    }
    webRef.current?.injectJavaScript(
      `window.location.replace(${JSON.stringify(WEB_APP_URL)}); true;`,
    );
  };

  const onNavChange = (state: WebViewNavigation) => {
    setNav({ url: state.url, canGoBack: state.canGoBack });
  };

  useEffect(() => {
    voiceBridgeRef.current = createVoiceBridge(webRef);
    return () => {
      voiceBridgeRef.current?.dispose();
      voiceBridgeRef.current = null;
      clearLoadTimer();
    };
  }, []);

  // Pick up HMR updates when keep-web-tunnel rewrites webUrl.ts
  useEffect(() => {
    setUrl(WEB_APP_URL);
    setNav({ url: WEB_APP_URL, canGoBack: false });
    setError(null);
    hasLoadedOnce.current = false;
    beginLoading(true);
    setKey((k) => k + 1);
    autoRetries.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WEB_APP_URL]);

  useEffect(() => {
    if (!error) return;
    const timer = setInterval(() => {
      autoRetries.current += 1;
      setError(null);
      hasLoadedOnce.current = false;
      beginLoading(true);
      setKey((k) => k + 1);
    }, RETRY_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const source = useMemo(() => ({ uri: url }), [url]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <SafeAreaView style={styles.flex} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>در حال وصل شدن دوباره…</Text>
                <Text style={styles.errorBody}>{error}</Text>
                <Text style={styles.errorHint}>
                  تونل اینترنت به‌صورت خودکار دوباره وصل می‌شود. کمی صبر کن یا
                  «تلاش دوباره» را بزن.
                </Text>
                <Pressable
                  style={styles.retry}
                  onPress={() => {
                    setError(null);
                    hasLoadedOnce.current = false;
                    beginLoading(true);
                    setKey((k) => k + 1);
                  }}
                >
                  <Text style={styles.retryText}>تلاش دوباره</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.flex}>
                {showShopBack ? (
                  <View style={styles.shopBar}>
                    <Pressable
                      style={styles.shopBackBtn}
                      onPress={returnToApp}
                      accessibilityRole="button"
                      accessibilityLabel="بازگشت به اپ"
                    >
                      <Text style={styles.shopBackChevron}>‹</Text>
                      <Text style={styles.shopBackText}>بازگشت به اپ</Text>
                    </Pressable>
                    <Text style={styles.shopBarTitle} numberOfLines={1}>
                      فروشگاه
                    </Text>
                    <View style={styles.shopBarSpacer} />
                  </View>
                ) : null}
                <WebView
                  ref={webRef}
                  key={key}
                  source={source}
                  style={styles.flex}
                  onLoadStart={() => beginLoading(false)}
                  onLoadProgress={({ nativeEvent }) => {
                    if (nativeEvent.progress >= 0.85) finishLoading();
                  }}
                  onLoadEnd={finishLoading}
                  onNavigationStateChange={onNavChange}
                  onError={(e) => {
                    clearLoadTimer();
                    setLoading(false);
                    setError(e.nativeEvent.description || "خطای شبکه");
                  }}
                  onHttpError={(e) => {
                    if (e.nativeEvent.statusCode >= 400) {
                      clearLoadTimer();
                      setLoading(false);
                      setError(`خطای HTTP ${e.nativeEvent.statusCode}`);
                    }
                  }}
                  onMessage={(e) => {
                    void voiceBridgeRef.current?.handleMessage(
                      e.nativeEvent.data,
                    );
                  }}
                  injectedJavaScriptBeforeContentLoaded={voiceBridgeBootstrap}
                  allowsBackForwardNavigationGestures
                  startInLoadingState={false}
                  javaScriptEnabled
                  domStorageEnabled
                  sharedCookiesEnabled
                  mediaPlaybackRequiresUserAction={false}
                  mediaCapturePermissionGrantType="grant"
                  setSupportMultipleWindows={false}
                  originWhitelist={["*"]}
                  applicationNameForUserAgent={`AtlasMobile/${Platform.OS}`}
                />
                {loading ? (
                  <View style={styles.loader} pointerEvents="none">
                    <ActivityIndicator size="large" color="#FF3737" />
                    <Text style={styles.loaderText}>در حال بارگذاری…</Text>
                  </View>
                ) : null}
              </View>
            )}
          </SafeAreaView>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FAFAFA" },
  shopBar: {
    height: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
  },
  shopBackBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minWidth: 110,
  },
  shopBackChevron: {
    fontSize: 28,
    lineHeight: 28,
    color: "#FF3737",
    fontWeight: "300",
  },
  shopBackText: {
    color: "#FF3737",
    fontSize: 14,
    fontWeight: "700",
  },
  shopBarTitle: {
    flex: 1,
    textAlign: "center",
    color: "#18181B",
    fontSize: 14,
    fontWeight: "700",
  },
  shopBarSpacer: { minWidth: 110 },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,250,250,0.92)",
    gap: 12,
  },
  loaderText: { color: "#52525B", fontSize: 14 },
  errorBox: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#B91C1C",
    textAlign: "right",
  },
  errorBody: {
    fontSize: 14,
    color: "#7F1D1D",
    textAlign: "right",
  },
  errorHint: {
    fontSize: 13,
    lineHeight: 22,
    color: "#52525B",
    textAlign: "right",
  },
  retry: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FF3737",
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
