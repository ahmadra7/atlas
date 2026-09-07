"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collapseRepeatedSpeech,
  mergeSpeechSegment,
  namesFromSpeech,
  unrecognizedSpeechTokens,
} from "@/lib/spokenIngredients";
import { ingredientsLooselyMatch, normalizePersian } from "@atlas/shared";
import {
  isAtlasNativeApp,
  postToNative,
  subscribeNativeVoice,
  type NativeVoiceMode,
} from "@/lib/voiceBridgeClient";

const NO_NEW_FOOD_MS = 5000;

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
  onspeechstart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechend: (() => void) | null;
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
  return collapseRepeatedSpeech(text.replace(/\s*\|\s*/g, " "));
}

/**
 * Voice capture for ingredients.
 * Each recognized food is added immediately. Capture closes when no new food
 * has been recognized for five seconds.
 */
export function useIngredientVoiceInput(options: {
  onHeard: (transcript: string) => void | Promise<void>;
  onRejected?: (token: string) => void;
  contextualStrings?: string[];
}) {
  const onHeardRef = useRef(options.onHeard);
  onHeardRef.current = options.onHeard;
  const onRejectedRef = useRef(options.onRejected);
  onRejectedRef.current = options.onRejected;
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
  const noNewFoodTimerRef = useRef<number | null>(null);
  const openedAtRef = useRef(0);
  const emittedNamesRef = useRef<Set<string>>(new Set());
  const rejectedTokensRef = useRef<Set<string>>(new Set());

  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [interim, setInterim] = useState("");
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [engineMode, setEngineMode] = useState<NativeVoiceMode | "web" | null>(
    null,
  );

  const cleanupWebRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    rec.onspeechstart = null;
    rec.onsoundstart = null;
    rec.onspeechend = null;
    recognitionRef.current = null;
  }, []);

  const resetIdle = useCallback((error?: string | null) => {
    if (noNewFoodTimerRef.current != null) {
      window.clearTimeout(noNewFoodTimerRef.current);
      noNewFoodTimerRef.current = null;
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
    emittedNamesRef.current = new Set();
    rejectedTokensRef.current = new Set();
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
    onHeardRef.current(composed);
  }, []);

  const flushNewIngredients = useCallback(
    (text: string, holdLast = false) => {
      const composed = primaryTranscript(text);
      if (!composed) return false;
      let emittedNewFood = false;
      const names = namesFromSpeech(composed);
      for (const name of names) {
        const key = normalizePersian(name);
        if (!key) continue;
        let matchedPrev: string | null = null;
        for (const prev of emittedNamesRef.current) {
          if (prev === key || ingredientsLooselyMatch(name, prev)) {
            matchedPrev = prev;
            break;
          }
        }
        if (matchedPrev) {
          if (key.length > matchedPrev.length) {
            emittedNamesRef.current.delete(matchedPrev);
            emittedNamesRef.current.add(key);
            emitHeard(name);
            emittedNewFood = true;
          }
          continue;
        }
        emittedNamesRef.current.add(key);
        emitHeard(name);
        emittedNewFood = true;
      }

      let rejected = unrecognizedSpeechTokens(composed);
      if (holdLast && rejected.length > 0) {
        const lastToken = normalizePersian(composed).split(/\s+/).filter(Boolean).pop();
        rejected = rejected.filter((token) => normalizePersian(token) !== lastToken);
      }
      for (const token of rejected) {
        const key = normalizePersian(token);
        if (!key || rejectedTokensRef.current.has(key)) continue;
        rejectedTokensRef.current.add(key);
        onRejectedRef.current?.(token);
      }
      return emittedNewFood;
    },
    [emitHeard],
  );

  const closeMic = useCallback(() => {
    if (heardTimerRef.current != null) {
      window.clearTimeout(heardTimerRef.current);
      heardTimerRef.current = null;
    }
    clearFlushTimer();
    if (noNewFoodTimerRef.current != null) {
      window.clearTimeout(noNewFoodTimerRef.current);
      noNewFoodTimerRef.current = null;
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
    emittedNamesRef.current = new Set();
    rejectedTokensRef.current = new Set();
    setInterim("");
    setDraft("");
    setVolume(0);
    setErrorMessage(null);
    setPhase("idle");
  }, [cleanupWebRecognition, clearFlushTimer]);

  const armNoNewFoodTimer = useCallback(() => {
    if (noNewFoodTimerRef.current != null) {
      window.clearTimeout(noNewFoodTimerRef.current);
    }
    noNewFoodTimerRef.current = window.setTimeout(() => {
      noNewFoodTimerRef.current = null;
      if (!listeningRef.current) return;
      flushNewIngredients(capturedText(), false);
      closeMic();
    }, NO_NEW_FOOD_MS);
  }, [capturedText, closeMic, flushNewIngredients]);

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
        armNoNewFoodTimer();
        return;
      }

      if (msg.type === "atlas-voice/volume") {
        return;
      }

      if (msg.type === "atlas-voice/partial") {
        if (msg.transcript.trim()) {
          const hasNewFood = flushNewIngredients(
            mergeSpeechSegment(finalsRef.current.join(" "), msg.transcript),
            true,
          );
          if (hasNewFood) armNoNewFoodTimer();
        }
        return;
      }

      if (msg.type === "atlas-voice/final") {
        if (msg.transcript.trim()) {
          const incoming = msg.transcript.trim();
          const merged = mergeSpeechSegment(
            finalsRef.current.join(" "),
            incoming,
          );
          finalsRef.current = merged ? [merged] : [];
          if (flushNewIngredients(merged, false)) armNoNewFoodTimer();
        }
        if (msg.alternatives?.length) {
          alternativesRef.current = [
            ...alternativesRef.current,
            ...msg.alternatives,
          ];
        }
        if (nativeModeRef.current === "intent") return;
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
          flushNewIngredients(capturedText(), false);
          setPhase("idle");
          setVolume(0);
          setInterim("");
          setDraft("");
          listeningRef.current = false;
          requestIdRef.current = null;
          engineRef.current = null;
          return;
        }
        if (!userStoppingRef.current) {
          if (listeningRef.current) {
            setPhase("listening");
            return;
          }
          setPhase("idle");
          setVolume(0);
          return;
        }
        flushNewIngredients(capturedText(), false);
        closeMic();
      }
    });

    postToNative({ type: "atlas-voice/ping" });
    return unsub;
  }, [
    armNoNewFoodTimer,
    capturedText,
    closeMic,
    emitHeard,
    flushNewIngredients,
    resetIdle,
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
    emittedNamesRef.current = new Set();
    rejectedTokensRef.current = new Set();
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
    recognition.maxAlternatives = 1;

    recognition.onspeechend = () => {
      flushNewIngredients(capturedText(), false);
    };

    recognition.onresult = (event) => {
      const finals: string[] = [];
      let interimChunk = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const best = result[0]?.transcript?.trim() ?? "";
        if (!best) continue;
        if (result.isFinal) finals.push(best);
        else interimChunk = best;
      }
      finalsRef.current = finals;
      interimRef.current = interimChunk;
      const spoken = mergeSpeechSegment(finals.join(" "), interimChunk);
      if (spoken) {
        if (flushNewIngredients(spoken, Boolean(interimChunk))) {
          armNoNewFoodTimer();
        }
      }
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
      armNoNewFoodTimer();
    } catch {
      setPhase("idle");
      listeningRef.current = false;
      setVolume(0);
      cleanupWebRecognition();
      engineRef.current = null;
    }
  }, [
    armNoNewFoodTimer,
    capturedText,
    cleanupWebRecognition,
    flushNewIngredients,
  ]);

  const start = useCallback(() => {
    if (listeningRef.current || phase === "listening" || phase === "processing") {
      return;
    }

    finalsRef.current = [];
    alternativesRef.current = [];
    interimRef.current = "";
    emittedNamesRef.current = new Set();
    rejectedTokensRef.current = new Set();
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
      return;
    }

    startWeb();
  }, [armNoNewFoodTimer, contextualStrings, phase, startWeb]);

  const cancel = useCallback(() => {
    if (Date.now() - openedAtRef.current < 900) return;
    clearFlushTimer();
    if (noNewFoodTimerRef.current != null) {
      window.clearTimeout(noNewFoodTimerRef.current);
      noNewFoodTimerRef.current = null;
    }
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
    emittedNamesRef.current = new Set();
    rejectedTokensRef.current = new Set();
    setInterim("");
    setDraft("");
    setVolume(0);
    setErrorMessage(null);
    setPhase("idle");
  }, [cleanupWebRecognition, clearFlushTimer]);

  /** User pressed Send — stop capture and add chips now. */
  const stop = useCallback(() => {
    if (phase !== "listening" && !listeningRef.current) return;
    userStoppingRef.current = true;
    listeningRef.current = false;
    setPhase("processing");
    if (noNewFoodTimerRef.current != null) {
      window.clearTimeout(noNewFoodTimerRef.current);
      noNewFoodTimerRef.current = null;
    }

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
    flushNewIngredients(text, false);
    closeMic();
  }, [
    capturedText,
    cleanupWebRecognition,
    closeMic,
    flushNewIngredients,
    phase,
  ]);

  useEffect(() => {
    return () => {
      if (noNewFoodTimerRef.current != null) {
        window.clearTimeout(noNewFoodTimerRef.current);
        noNewFoodTimerRef.current = null;
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
