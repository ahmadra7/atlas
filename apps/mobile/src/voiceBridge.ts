import { Platform } from "react-native";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import type { WebView } from "react-native-webview";
import type { RefObject } from "react";

export type VoiceMode = "native" | "intent" | "none";

type WebToNativeMessage =
  | {
      type: "atlas-voice/start";
      requestId: string;
      lang?: string;
      contextualStrings?: string[];
    }
  | { type: "atlas-voice/stop"; requestId: string }
  | { type: "atlas-voice/abort"; requestId: string }
  | { type: "atlas-voice/ping" };

const isExpoGo = Constants.appOwnership === "expo";

let speechModule: typeof import("expo-speech-recognition") | null = null;
if (!isExpoGo) {
  try {
    // Optional: only present in development/production builds, not Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    speechModule = require("expo-speech-recognition");
  } catch {
    speechModule = null;
  }
}

export function detectVoiceMode(): VoiceMode {
  if (speechModule?.ExpoSpeechRecognitionModule?.isRecognitionAvailable?.()) {
    return "native";
  }
  if (Platform.OS === "android") return "intent";
  return "none";
}

function inject(webRef: RefObject<WebView | null>, payload: unknown) {
  const json = JSON.stringify(payload);
  webRef.current?.injectJavaScript(`
    (function(){
      try {
        var data = ${json};
        if (typeof window.__atlasVoiceReceive === 'function') {
          window.__atlasVoiceReceive(data);
        }
        window.dispatchEvent(new CustomEvent('atlas-voice', { detail: data }));
      } catch (e) {}
      true;
    })();
  `);
}

function extractIntentTranscript(extra: Record<string, unknown> | undefined): {
  transcript: string;
  alternatives: string[];
} {
  if (!extra) return { transcript: "", alternatives: [] };
  const results =
    (extra["android.speech.extra.RESULTS"] as string[] | undefined) ??
    (extra.RESULTS as string[] | undefined) ??
    [];
  const list = Array.isArray(results)
    ? results.map((r) => String(r).trim()).filter(Boolean)
    : [];
  return {
    transcript: list[0] ?? "",
    alternatives: list.slice(1),
  };
}

export function createVoiceBridge(webRef: RefObject<WebView | null>) {
  const mode = detectVoiceMode();
  let activeRequestId: string | null = null;
  let nativeStarted = false;
  const subscriptions: Array<{ remove: () => void }> = [];

  const post = (payload: unknown) => inject(webRef, payload);

  const attachNativeListeners = () => {
    if (!speechModule || subscriptions.length > 0) return;
    const mod = speechModule.ExpoSpeechRecognitionModule;

    subscriptions.push(
      mod.addListener("result", (event) => {
        if (!activeRequestId) return;
        const top = event.results?.[0];
        const transcript = top?.transcript?.trim() ?? "";
        const alternatives = (event.results ?? [])
          .slice(1)
          .map((r) => r.transcript?.trim())
          .filter(Boolean) as string[];

        if (event.isFinal) {
          post({
            type: "atlas-voice/final",
            requestId: activeRequestId,
            transcript,
            alternatives,
          });
        } else {
          post({
            type: "atlas-voice/partial",
            requestId: activeRequestId,
            transcript,
          });
        }
      }),
    );

    subscriptions.push(
      mod.addListener("error", (event) => {
        if (!activeRequestId) return;
        if (event.error === "aborted" || event.error === "no-speech") {
          post({ type: "atlas-voice/ended", requestId: activeRequestId });
          activeRequestId = null;
          nativeStarted = false;
          return;
        }
        post({ type: "atlas-voice/ended", requestId: activeRequestId });
        activeRequestId = null;
        nativeStarted = false;
      }),
    );

    subscriptions.push(
      mod.addListener("end", () => {
        if (!activeRequestId) return;
        post({ type: "atlas-voice/ended", requestId: activeRequestId });
        activeRequestId = null;
        nativeStarted = false;
      }),
    );

    subscriptions.push(
      mod.addListener("volumechange", (event) => {
        if (!activeRequestId) return;
        // Native range is roughly -2..10 — normalize to 0..1 for UI.
        const raw = typeof event.value === "number" ? event.value : 0;
        const value = Math.max(0, Math.min(1, (raw + 2) / 12));
        post({
          type: "atlas-voice/volume",
          requestId: activeRequestId,
          value,
        });
      }),
    );
  };

  const startNative = async (
    requestId: string,
    lang: string,
    contextualStrings: string[],
  ) => {
    if (!speechModule) throw new Error("NATIVE_UNAVAILABLE");
    attachNativeListeners();
    const mod = speechModule.ExpoSpeechRecognitionModule;
    const mic = await mod.requestMicrophonePermissionsAsync();
    if (!mic.granted) throw new Error("MIC_DENIED");
    const speech = await mod.requestSpeechRecognizerPermissionsAsync();
    if (!speech.granted) throw new Error("SPEECH_DENIED");

    activeRequestId = requestId;
    nativeStarted = true;
    // In-app recognition (no Google popup UI).
    mod.start({
      lang,
      interimResults: true,
      continuous: true,
      maxAlternatives: 5,
      contextualStrings: contextualStrings.slice(0, 40),
      iosTaskHint: "dictation",
      androidIntentOptions: {
        EXTRA_LANGUAGE_MODEL: "web_search",
      },
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 80,
      },
    });
    post({ type: "atlas-voice/started", requestId, mode: "native" });
  };

  const startIntent = async (requestId: string, lang: string) => {
    activeRequestId = requestId;
    post({ type: "atlas-voice/started", requestId, mode: "intent" });
    try {
      const result = await IntentLauncher.startActivityAsync(
        "android.speech.action.RECOGNIZE_SPEECH",
        {
          extra: {
            "android.speech.extra.LANGUAGE_MODEL": "web_search",
            "android.speech.extra.LANGUAGE": lang,
            "android.speech.extra.PROMPT": "مواد یخچالت را بگو…",
            "android.speech.extra.MAX_RESULTS": 5,
            "android.speech.extra.PARTIAL_RESULTS": true,
          },
        },
      );

      if (activeRequestId !== requestId) return;

      if (result.resultCode !== IntentLauncher.ResultCode.Success) {
        post({ type: "atlas-voice/ended", requestId });
        activeRequestId = null;
        return;
      }

      const { transcript, alternatives } = extractIntentTranscript(
        result.extra as Record<string, unknown> | undefined,
      );

      if (!transcript) {
        post({ type: "atlas-voice/ended", requestId });
        activeRequestId = null;
        return;
      }

      post({
        type: "atlas-voice/final",
        requestId,
        transcript,
        alternatives,
      });
      post({ type: "atlas-voice/ended", requestId });
      activeRequestId = null;
    } catch {
      if (activeRequestId !== requestId) return;
      post({ type: "atlas-voice/ended", requestId });
      activeRequestId = null;
    }
  };

  return {
    mode,
    announceReady() {
      post({ type: "atlas-voice/ready", mode });
    },
    async handleMessage(raw: string) {
      let msg: WebToNativeMessage;
      try {
        msg = JSON.parse(raw) as WebToNativeMessage;
      } catch {
        return false;
      }
      if (!msg || typeof msg !== "object" || !("type" in msg)) return false;
      if (!String(msg.type).startsWith("atlas-voice/")) return false;

      if (msg.type === "atlas-voice/ping") {
        post({ type: "atlas-voice/ready", mode });
        return true;
      }

      if (msg.type === "atlas-voice/abort" || msg.type === "atlas-voice/stop") {
        if (nativeStarted && speechModule) {
          try {
            if (msg.type === "atlas-voice/abort") {
              speechModule.ExpoSpeechRecognitionModule.abort();
            } else {
              speechModule.ExpoSpeechRecognitionModule.stop();
            }
          } catch {
            /* ignore */
          }
          nativeStarted = false;
        }
        if (msg.type === "atlas-voice/abort") {
          activeRequestId = null;
        }
        return true;
      }

      if (msg.type === "atlas-voice/start") {
        const lang = msg.lang ?? "fa-IR";
        const contextualStrings = msg.contextualStrings ?? [];
        try {
          if (mode === "native") {
            await startNative(msg.requestId, lang, contextualStrings);
          } else if (mode === "intent") {
            await startIntent(msg.requestId, lang);
          } else {
            post({ type: "atlas-voice/ended", requestId: msg.requestId });
          }
        } catch {
          post({ type: "atlas-voice/ended", requestId: msg.requestId });
          activeRequestId = null;
          nativeStarted = false;
        }
        return true;
      }

      return false;
    },
    dispose() {
      subscriptions.forEach((s) => s.remove());
      subscriptions.length = 0;
      if (nativeStarted && speechModule) {
        try {
          speechModule.ExpoSpeechRecognitionModule.abort();
        } catch {
          /* ignore */
        }
      }
      activeRequestId = null;
      nativeStarted = false;
    },
  };
}

export const voiceBridgeBootstrap = `
(function(){
  window.__ATLAS_NATIVE__ = true;
  window.AtlasVoice = { available: true };
  true;
})();
`;
