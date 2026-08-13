export type NativeVoiceMode = "native" | "intent" | "none";

type NativeIncoming =
  | { type: "atlas-voice/ready"; mode: NativeVoiceMode }
  | { type: "atlas-voice/started"; requestId: string; mode: NativeVoiceMode }
  | { type: "atlas-voice/partial"; requestId: string; transcript: string }
  | {
      type: "atlas-voice/final";
      requestId: string;
      transcript: string;
      alternatives?: string[];
    }
  | { type: "atlas-voice/volume"; requestId: string; value: number }
  | { type: "atlas-voice/error"; requestId: string; message: string }
  | { type: "atlas-voice/ended"; requestId: string };

function getReactNativeBridge(): { postMessage: (msg: string) => void } | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    __ATLAS_NATIVE__?: boolean;
  };
  return w.ReactNativeWebView ?? null;
}

export function isAtlasNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & {
    ReactNativeWebView?: unknown;
    __ATLAS_NATIVE__?: boolean;
    navigator: Navigator;
  };
  if (w.__ATLAS_NATIVE__ || w.ReactNativeWebView) return true;
  return /AtlasMobile/i.test(w.navigator.userAgent);
}

export function postToNative(payload: unknown): boolean {
  const bridge = getReactNativeBridge();
  if (!bridge) return false;
  bridge.postMessage(JSON.stringify(payload));
  return true;
}

export function subscribeNativeVoice(
  handler: (msg: NativeIncoming) => void,
): () => void {
  const deliver = (data: unknown) => {
    let parsed: NativeIncoming | null = null;
    try {
      parsed = typeof data === "string" ? JSON.parse(data) : (data as NativeIncoming);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return;
    if (!String(parsed.type).startsWith("atlas-voice/")) return;
    handler(parsed);
  };

  const onMessage = (event: Event) => {
    deliver((event as MessageEvent).data);
  };
  const onCustom = (event: Event) => {
    deliver((event as CustomEvent).detail);
  };

  const w = window as Window & {
    __atlasVoiceReceive?: (data: unknown) => void;
  };
  w.__atlasVoiceReceive = deliver;

  window.addEventListener("message", onMessage);
  window.addEventListener("atlas-voice", onCustom as EventListener);
  document.addEventListener("message", onMessage as EventListener);

  return () => {
    if (w.__atlasVoiceReceive === deliver) delete w.__atlasVoiceReceive;
    window.removeEventListener("message", onMessage);
    window.removeEventListener("atlas-voice", onCustom as EventListener);
    document.removeEventListener("message", onMessage as EventListener);
  };
}
