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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import {
  createVoiceBridge,
  voiceBridgeBootstrap,
} from "./src/voiceBridge";
import { WEB_APP_URL } from "./src/webUrl";

const RETRY_MS = 3500;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [url, setUrl] = useState(WEB_APP_URL);
  const autoRetries = useRef(0);
  const webRef = useRef<WebView>(null);
  const voiceBridgeRef = useRef<ReturnType<typeof createVoiceBridge> | null>(
    null,
  );

  useEffect(() => {
    voiceBridgeRef.current = createVoiceBridge(webRef);
    return () => {
      voiceBridgeRef.current?.dispose();
      voiceBridgeRef.current = null;
    };
  }, []);

  // Pick up HMR updates when keep-web-tunnel rewrites webUrl.ts
  useEffect(() => {
    setUrl(WEB_APP_URL);
    setError(null);
    setLoading(true);
    setKey((k) => k + 1);
    autoRetries.current = 0;
  }, [WEB_APP_URL]);

  useEffect(() => {
    if (!error) return;
    const timer = setInterval(() => {
      autoRetries.current += 1;
      setError(null);
      setLoading(true);
      setKey((k) => k + 1);
    }, RETRY_MS);
    return () => clearInterval(timer);
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
                    setLoading(true);
                    setKey((k) => k + 1);
                  }}
                >
                  <Text style={styles.retryText}>تلاش دوباره</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.flex}>
                <WebView
                  ref={webRef}
                  key={key}
                  source={source}
                  style={styles.flex}
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => {
                    setLoading(false);
                    autoRetries.current = 0;
                    voiceBridgeRef.current?.announceReady();
                  }}
                  onError={(e) => {
                    setLoading(false);
                    setError(e.nativeEvent.description || "خطای شبکه");
                  }}
                  onHttpError={(e) => {
                    if (e.nativeEvent.statusCode >= 400) {
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
                  startInLoadingState
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
                  <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF3737" />
                    <Text style={styles.loaderText}>در حال همگام‌سازی با IDE…</Text>
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
