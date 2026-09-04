"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { namesFromSpeech } from "@/lib/spokenIngredients";
import {
  isAtlasNativeApp,
  postToNative,
  subscribeNativeVoice,
  type NativeVoiceMode,
} from "@/lib/voiceBridgeClient";

const SILENCE_MS = 8000;

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

function primaryTranscript(text: string): string {
  return text.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Voice capture for ingredients.
 * First recognized item is emitted and the mic closes — tap again for the next.
 */
export function useIngredientVoiceInput(options: {
  onHeard: (transcript: string) => void | Promise<void>;
  contextualStrings?: string[];
}) {
  const onHeardRef = useRef(options.onHeard);
  onHeardRef.current = options.onHeard;
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
  const flushTimerRef = useRef<number | null>(null);
  const heardTimerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const openedAtRef = useRef(0);

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

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current != null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetIdle = useCallback((error?: string | null) => {
    if (silenceTimerRef.current != null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setPhase("idle");
    setVolume(0);
    setInterim("");
    setDraft("");
    setErrorMessage(error ?? null);
    listeningRef.current = false;
    userStoppingRef.current = false;
    requestIdRef.current = null;
    engineRef.current = null;
    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
  }, []);

  const draftRef = useRef("");
  draftRef.current = draft;

  const capturedText = useCallback(() => {
    const fromRefs = primaryTranscript(
      [...finalsRef.current, interimRef.current].filter(Boolean).join(" "),
    );
    const fromDraft = primaryTranscript(draftRef.current);
    const primary = fromRefs.length >= fromDraft.length ? fromRefs : fromDraft;
    const candidates = [primary, ...alternativesRef.current]
      .map((t) => primaryTranscript(t))
      .filter(Boolean);
    let best = primary;
    let bestCount = namesFromSpeech(primary).length;
    for (const candidate of candidates) {
      const count = namesFromSpeech(candidate).length;
      if (count > bestCount) {
        best = candidate;
        bestCount = count;
      }
    }
    return best;
  }, []);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current != null) {
      window.clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const emitHeard = useCallback((text: string) => {
    const composed = primaryTranscript(text);
    if (!composed) return;
    void Promise.resolve(onHeardRef.current(composed));
  }, []);

  const closeMic = useCallback(() => {
    if (heardTimerRef.current != null) {
      window.clearTimeout(heardTimerRef.current);
      heardTimerRef.current = null;
    }
    clearFlushTimer();
    clearSilenceTimer();
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
  }, [cleanupWebRecognition, clearFlushTimer, clearSilenceTimer]);

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      silenceTimerRef.current = null;
      if (!listeningRef.current) return;
      closeMic();
    }, SILENCE_MS);
  }, [clearSilenceTimer, closeMic]);

  const emitIfIngredient = useCallback(
    (text: string) => {
      const composed = primaryTranscript(text);
      if (!composed) return false;
      if (namesFromSpeech(composed).length === 0) return false;
      closeMic();
      emitHeard(composed);
      return true;
    },
    [closeMic, emitHeard],
  );

  const submitTranscript = useCallback(async (text: string) => {
    const composed = primaryTranscript(text);
    if (!composed) return;
    emitHeard(composed);
  }, [emitHeard]);

  const flushAndSubmit = useCallback(() => {
    clearFlushTimer();
    if (submittingRef.current) return;
    const text = capturedText();
    if (text) void submitTranscript(text);
    else resetIdle("چیزی نشنیدم. دوباره بگو.");
  }, [capturedText, clearFlushTimer, resetIdle, submitTranscript]);

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
        armSilenceTimer();
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
        if (msg.transcript.trim()) armSilenceTimer();
        return;
      }

      if (msg.type === "atlas-voice/final") {
        if (msg.transcript.trim()) {
          finalsRef.current = [...finalsRef.current, msg.transcript.trim()];
          if (emitIfIngredient(msg.transcript)) return;
          armSilenceTimer();
        }
        if (msg.alternatives?.length) {
          alternativesRef.current = [
            ...alternativesRef.current,
            ...msg.alternatives,
          ];
        }
        syncDraft(finalsRef.current, "");
        if (nativeModeRef.current === "intent") return;
        setPhase("listening");
        listeningRef.current = true;
        return;
      }

      if (msg.type === "atlas-voice/error") {
        clearSilenceTimer();
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
          const spoken = capturedText();
          if (spoken) emitHeard(spoken);
          clearSilenceTimer();
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
        const text = capturedText();
        if (text) {
          void submitTranscript(text);
        } else {
          resetIdle();
        }
      }
    });

    postToNative({ type: "atlas-voice/ping" });
    return unsub;
  }, [
    armSilenceTimer,
    capturedText,
    clearSilenceTimer,
    emitHeard,
    emitIfIngredient,
    resetIdle,
    submitTranscript,
    syncDraft,
  ]);

  const startWeb = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setPhase("idle");
      listeningRef.current = false;
      return;
    }

    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    setInterim("");
    setDraft("");
    setErrorMessage(null);
    setPhase("listening");
    listeningRef.current = true;
    userStoppingRef.current = false;
    openedAtRef.current = Date.now();
    setEngineMode("web");
    setVolume(0.35);
    engineRef.current = "web";

    const recognition = new Ctor();
    recognition.lang = "fa-IR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    const armCommit = () => {
      if (heardTimerRef.current != null) {
        window.clearTimeout(heardTimerRef.current);
      }
      heardTimerRef.current = window.setTimeout(() => {
        const text = capturedText();
        if (!text) return;
        if (emitIfIngredient(text)) return;
        emitHeard(text);
        closeMic();
      }, 450);
    };

    recognition.onresult = (event) => {
      const finals: string[] = [];
      let interimChunk = "";
      const alts: string[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        for (let a = 0; a < result.length; a += 1) {
          const t = result[a]?.transcript?.trim();
          if (t) alts.push(t);
        }
        const best = result[0]?.transcript?.trim() ?? "";
        if (!best) continue;
        if (result.isFinal) finals.push(best);
        else interimChunk += (interimChunk ? " " : "") + best;
      }
      finalsRef.current = finals;
      alternativesRef.current = alts;
      syncDraft(finals, interimChunk);
      setVolume(interimChunk || finals.length ? 0.85 : 0.4);
      if (interimChunk || finals.length) armSilenceTimer();
      armCommit();
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        window.setTimeout(() => {
          if (!listeningRef.current || recognitionRef.current !== recognition) {
            return;
          }
          try {
            recognition.start();
          } catch {
            /* already started */
          }
        }, 160);
        return;
      }
    };

    recognition.onend = () => {
      if (submittingRef.current || userStoppingRef.current) {
        cleanupWebRecognition();
        engineRef.current = null;
        if (userStoppingRef.current) flushAndSubmit();
        return;
      }

      const leftover = capturedText();
      if (leftover) {
        if (emitIfIngredient(leftover)) return;
        emitHeard(leftover);
        closeMic();
        return;
      }

      if (engineRef.current !== "web" || !listeningRef.current) {
        cleanupWebRecognition();
        engineRef.current = null;
        listeningRef.current = false;
        setPhase("idle");
        setVolume(0);
        return;
      }

      window.setTimeout(() => {
        if (!listeningRef.current || userStoppingRef.current) return;
        if (recognitionRef.current !== recognition) return;
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }, 220);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      armSilenceTimer();
    } catch {
      setPhase("idle");
      listeningRef.current = false;
      setVolume(0);
      cleanupWebRecognition();
      engineRef.current = null;
    }
  }, [
    armSilenceTimer,
    capturedText,
    cleanupWebRecognition,
    closeMic,
    emitHeard,
    emitIfIngredient,
    flushAndSubmit,
    syncDraft,
  ]);

  const start = useCallback(() => {
    if (listeningRef.current || phase === "listening" || phase === "processing") {
      return;
    }

    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    setInterim("");
    setDraft("");
    setErrorMessage(null);
    userStoppingRef.current = false;
    openedAtRef.current = Date.now();

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
      else armSilenceTimer();
      return;
    }

    startWeb();
  }, [armSilenceTimer, contextualStrings, phase, startWeb]);

  const cancel = useCallback(() => {
    if (Date.now() - openedAtRef.current < 900) return;
    clearFlushTimer();
    clearSilenceTimer();
    if (heardTimerRef.current != null) {
      window.clearTimeout(heardTimerRef.current);
      heardTimerRef.current = null;
    }
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
  }, [cleanupWebRecognition, clearFlushTimer, clearSilenceTimer]);

  /** User pressed Send — stop capture and add chips now. */
  const stop = useCallback(() => {
    if (phase !== "listening" && !listeningRef.current) return;
    userStoppingRef.current = true;
    listeningRef.current = false;
    setPhase("processing");
    clearSilenceTimer();

    if (engineRef.current === "native") {
      postToNative({
        type: "atlas-voice/stop",
        requestId: requestIdRef.current ?? "",
      });
    }
    if (engineRef.current === "web") {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      cleanupWebRecognition();
      engineRef.current = null;
    }

    const text = capturedText();
    if (text) {
      void submitTranscript(text);
      return;
    }

    clearFlushTimer();
    flushTimerRef.current = window.setTimeout(() => {
      flushAndSubmit();
    }, 420);
  }, [
    capturedText,
    cleanupWebRecognition,
    clearFlushTimer,
    clearSilenceTimer,
    flushAndSubmit,
    phase,
    submitTranscript,
  ]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current != null) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
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
    canSend: phase === "listening" && engineMode !== "intent",
    start,
    stop,
    cancel,
    clearError: () => {
      setErrorMessage(null);
      setPhase("idle");
    },
  };
}
