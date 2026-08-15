"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isAtlasNativeApp,
  postToNative,
  subscribeNativeVoice,
  type NativeVoiceMode,
} from "@/lib/voiceBridgeClient";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    length: number;
    [index: number]: { transcript: string; confidence: number };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoicePhase = "idle" | "listening" | "processing" | "error";

const DEFAULT_CONTEXT = [
  "گوجه",
  "گوجه فرنگی",
  "پیاز",
  "تخم مرغ",
  "سیب زمینی",
  "برنج",
  "مرغ",
  "عدس",
  "نان",
  "ماست",
  "سیر",
  "خیار",
  "روغن",
  "نمک",
  "فلفل",
  "کره",
];

function composeTranscript(text: string, alts: string[] = []): string {
  const unique = [
    ...new Set([text, ...alts].map((t) => t.trim()).filter(Boolean)),
  ];
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0]!;
  return `${unique[0]} | ${unique.slice(1).join(" | ")}`;
}

/**
 * Voice capture for ingredients.
 * Stays on the page — user must press Send; no auto-cut / Google overlay.
 */
export function useIngredientVoiceInput(options: {
  onTranscript: (transcript: string) => void | Promise<void>;
  contextualStrings?: string[];
}) {
  const onTranscriptRef = useRef(options.onTranscript);
  onTranscriptRef.current = options.onTranscript;
  const contextualStrings = options.contextualStrings ?? DEFAULT_CONTEXT;

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalsRef = useRef<string[]>([]);
  const alternativesRef = useRef<string[]>([]);
  const interimRef = useRef("");
  const requestIdRef = useRef<string | null>(null);
  const engineRef = useRef<"native" | "web" | null>(null);
  const nativeModeRef = useRef<NativeVoiceMode | null>(null);
  const submittingRef = useRef(false);
  const userStoppingRef = useRef(false);
  const listeningRef = useRef(false);

  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [interim, setInterim] = useState("");
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [engineMode, setEngineMode] = useState<NativeVoiceMode | "web" | null>(
    null,
  );

  const syncDraft = useCallback((finals: string[], interimText: string) => {
    const text = [...finals, interimText].map((t) => t.trim()).filter(Boolean).join(" ");
    setDraft(text);
    setInterim(interimText);
    interimRef.current = interimText;
  }, []);

  const cleanupWebRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    recognitionRef.current = null;
  }, []);

  const submitTranscript = useCallback(async (text: string, alts: string[] = []) => {
    const composed = composeTranscript(text, alts);
    if (!composed) {
      setPhase("idle");
      setVolume(0);
      setInterim("");
      setDraft("");
      listeningRef.current = false;
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase("processing");
    setErrorMessage(null);
    setInterim("");
    interimRef.current = "";
    try {
      await Promise.resolve(onTranscriptRef.current(composed));
    } catch {
      /* silent */
    } finally {
      setPhase("idle");
      setVolume(0);
      setDraft("");
      submittingRef.current = false;
      userStoppingRef.current = false;
      listeningRef.current = false;
      requestIdRef.current = null;
      engineRef.current = null;
      finalsRef.current = [];
      alternativesRef.current = [];
    }
  }, []);

  useEffect(() => {
    if (!isAtlasNativeApp()) return;
    const unsub = subscribeNativeVoice((msg) => {
      if (msg.type === "atlas-voice/ready") {
        nativeModeRef.current = msg.mode;
        setEngineMode(msg.mode);
        return;
      }

      const active = requestIdRef.current;
      if ("requestId" in msg && active && msg.requestId !== active) return;

      if (msg.type === "atlas-voice/started") {
        nativeModeRef.current = msg.mode;
        setEngineMode(msg.mode);
        setPhase("listening");
        listeningRef.current = true;
        setErrorMessage(null);
        setVolume(0.25);
        return;
      }

      if (msg.type === "atlas-voice/volume") {
        setVolume(msg.value);
        return;
      }

      if (msg.type === "atlas-voice/partial") {
        syncDraft(finalsRef.current, msg.transcript);
        setPhase("listening");
        listeningRef.current = true;
        return;
      }

      if (msg.type === "atlas-voice/final") {
        // Intent (Expo Go): one-shot result — submit immediately.
        if (nativeModeRef.current === "intent") {
          void submitTranscript(msg.transcript, msg.alternatives ?? []);
          return;
        }
        // Native continuous: accumulate until user presses Send.
        if (msg.transcript.trim()) {
          finalsRef.current = [...finalsRef.current, msg.transcript.trim()];
        }
        if (msg.alternatives?.length) {
          alternativesRef.current = [
            ...alternativesRef.current,
            ...msg.alternatives,
          ];
        }
        syncDraft(finalsRef.current, "");
        setPhase("listening");
        listeningRef.current = true;
        return;
      }

      if (msg.type === "atlas-voice/error") {
        setPhase("idle");
        setVolume(0);
        setInterim("");
        setDraft("");
        setErrorMessage(null);
        listeningRef.current = false;
        requestIdRef.current = null;
        engineRef.current = null;
        return;
      }

      if (msg.type === "atlas-voice/ended") {
        if (submittingRef.current) return;
        if (nativeModeRef.current === "intent") {
          setPhase("idle");
          setVolume(0);
          setInterim("");
          setDraft("");
          listeningRef.current = false;
          requestIdRef.current = null;
          engineRef.current = null;
          return;
        }
        // Native bridge auto-restarts; only finalize when user pressed Send.
        if (!userStoppingRef.current) {
          if (listeningRef.current) {
            setPhase("listening");
            return;
          }
          setPhase("idle");
          setVolume(0);
          return;
        }
        const text =
          finalsRef.current.join(" ").trim() || interimRef.current.trim();
        if (text) {
          void submitTranscript(text, alternativesRef.current);
        } else {
          setPhase("idle");
          setVolume(0);
          setInterim("");
          setDraft("");
          listeningRef.current = false;
          requestIdRef.current = null;
          engineRef.current = null;
          userStoppingRef.current = false;
        }
      }
    });

    postToNative({ type: "atlas-voice/ping" });
    return unsub;
  }, [submitTranscript, syncDraft]);

  const startWeb = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setPhase("idle");
      listeningRef.current = false;
      return;
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    cleanupWebRecognition();

    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    setInterim("");
    setDraft("");
    setErrorMessage(null);
    setPhase("listening");
    listeningRef.current = true;
    userStoppingRef.current = false;
    setEngineMode("web");
    setVolume(0.35);
    engineRef.current = "web";

    const recognition = new Ctor();
    recognition.lang = "fa-IR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const best = result[0]?.transcript?.trim() ?? "";
        if (result.isFinal) {
          if (best) finalsRef.current.push(best);
          for (let a = 0; a < result.length; a += 1) {
            const alt = result[a]?.transcript?.trim();
            if (alt) alternativesRef.current.push(alt);
          }
        } else if (best) {
          interimChunk += (interimChunk ? " " : "") + best;
        }
      }
      syncDraft(finalsRef.current, interimChunk);
      setVolume(interimChunk || finalsRef.current.length ? 0.7 : 0.3);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech" && listeningRef.current && !userStoppingRef.current) {
        // Keep session; onend will restart.
        return;
      }
      if (!userStoppingRef.current) {
        setPhase("idle");
        listeningRef.current = false;
        setVolume(0);
        setErrorMessage(null);
        engineRef.current = null;
      }
    };

    recognition.onend = () => {
      cleanupWebRecognition();
      if (engineRef.current !== "web") return;

      if (userStoppingRef.current) {
        engineRef.current = null;
        if (submittingRef.current) return;
        const primary = finalsRef.current.join(" ").trim();
        const trailing = interimRef.current.trim();
        void submitTranscript(primary || trailing, alternativesRef.current);
        return;
      }

      // Keep listening until user presses Send.
      if (listeningRef.current) {
        try {
          const next = new Ctor();
          next.lang = "fa-IR";
          next.continuous = true;
          next.interimResults = true;
          next.maxAlternatives = 5;
          next.onresult = recognition.onresult;
          next.onerror = recognition.onerror;
          next.onend = recognition.onend;
          recognitionRef.current = next;
          next.start();
          setPhase("listening");
          return;
        } catch {
          /* fall through */
        }
      }

      engineRef.current = null;
      listeningRef.current = false;
      setPhase("idle");
      setVolume(0);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setPhase("idle");
      listeningRef.current = false;
      setVolume(0);
      cleanupWebRecognition();
      engineRef.current = null;
    }
  }, [cleanupWebRecognition, submitTranscript, syncDraft]);

  const start = useCallback(() => {
    if (phase === "listening" || phase === "processing") return;

    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    setInterim("");
    setDraft("");
    setErrorMessage(null);
    userStoppingRef.current = false;

    if (isAtlasNativeApp()) {
      const requestId = `v-${Date.now()}`;
      requestIdRef.current = requestId;
      engineRef.current = "native";
      setPhase("listening");
      listeningRef.current = true;
      const ok = postToNative({
        type: "atlas-voice/start",
        requestId,
        lang: "fa-IR",
        contextualStrings,
      });
      if (!ok) startWeb();
      return;
    }

    startWeb();
  }, [contextualStrings, phase, startWeb]);

  const cancel = useCallback(() => {
    userStoppingRef.current = false;
    listeningRef.current = false;
    if (engineRef.current === "native") {
      postToNative({
        type: "atlas-voice/abort",
        requestId: requestIdRef.current ?? "",
      });
    }
    if (engineRef.current === "web") {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      cleanupWebRecognition();
    }
    requestIdRef.current = null;
    engineRef.current = null;
    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    setInterim("");
    setDraft("");
    setVolume(0);
    setErrorMessage(null);
    setPhase("idle");
  }, [cleanupWebRecognition]);

  /** User pressed Send — stop capture and add ingredients. */
  const stop = useCallback(() => {
    if (phase !== "listening") return;
    userStoppingRef.current = true;
    const text =
      finalsRef.current.join(" ").trim() || interimRef.current.trim();

    if (engineRef.current === "native") {
      postToNative({
        type: "atlas-voice/stop",
        requestId: requestIdRef.current ?? "",
      });
      if (text) void submitTranscript(text, alternativesRef.current);
      else {
        setPhase("idle");
        setVolume(0);
        setDraft("");
        listeningRef.current = false;
        requestIdRef.current = null;
        engineRef.current = null;
        userStoppingRef.current = false;
      }
      return;
    }
    if (engineRef.current === "web") {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    if (text) void submitTranscript(text, alternativesRef.current);
    else cancel();
  }, [cancel, phase, submitTranscript]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      cleanupWebRecognition();
      if (engineRef.current === "native") {
        postToNative({
          type: "atlas-voice/abort",
          requestId: requestIdRef.current ?? "",
        });
      }
    };
  }, [cleanupWebRecognition]);

  useEffect(() => {
    if (phase !== "listening") return;
    if (engineMode === "native") return;
    const id = window.setInterval(() => {
      setVolume((v) => {
        const next = 0.25 + Math.random() * 0.55;
        return Math.abs(next - v) < 0.08 ? next + 0.15 : next;
      });
    }, 140);
    return () => window.clearInterval(id);
  }, [engineMode, phase]);

  return {
    phase,
    interim,
    draft,
    volume,
    engineMode,
    errorMessage,
    listening: phase === "listening",
    processing: phase === "processing",
    /** True when recognition stays inside our UI (no Google popup). */
    inAppRecording: engineMode === "native" || engineMode === "web",
    canSend:
      phase === "listening" &&
      engineMode !== "intent" &&
      draft.trim().length > 0,
    start,
    stop,
    cancel,
    clearError: () => {
      setErrorMessage(null);
      setPhase("idle");
    },
  };
}
