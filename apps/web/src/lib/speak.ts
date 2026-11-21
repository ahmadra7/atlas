import { getRuntimeConfigSync } from "@/lib/runtime-config";

const VOICE_STEPS_KEY = "atlas_voice_steps";

export function getVoiceStepsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(VOICE_STEPS_KEY) === "1";
}

export function setVoiceStepsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOICE_STEPS_KEY, enabled ? "1" : "0");
}

export function buildStepSpeech(
  instruction: string,
  tip?: string | null,
): string {
  const parts = [instruction.trim()].filter(Boolean);
  if (tip?.trim()) parts.push(`نکته: ${tip.trim()}`);
  return parts.join(". ");
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

export function preloadSpeechVoices() {
  // Google TTS needs no voice list; keep for call-site compatibility.
}

let speakToken = 0;
let currentAudio: HTMLAudioElement | null = null;
let unlocked = false;

/** Call from a click/tap so autoplay policies allow subsequent clips. */
export function unlockSpeech(): void {
  if (typeof window === "undefined" || unlocked) return;
  try {
    const silent = new Audio(
      "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuMTAwBEgAAAAAAAAAABUgJAUHQQAB9gAAAnFPN5zWAAAAAAAAAAAAAAAAAAAA",
    );
    silent.volume = 0.01;
    void silent.play().then(() => {
      silent.pause();
      unlocked = true;
    }).catch(() => {
      unlocked = true;
    });
  } catch {
    unlocked = true;
  }
}

export function stopSpeaking() {
  speakToken += 1;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
      currentAudio.load();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

/** Edge/neural TTS handles longer phrases; keep chunks conversational. */
function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= 220) return [normalized];

  const parts = normalized
    .split(/(?<=[.!؟?\n،؛])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const part of parts.length > 0 ? parts : [normalized]) {
    const pieces =
      part.length <= 220
        ? [part]
        : part.match(/.{1,220}(\s|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [
            part.slice(0, 220),
          ];
    for (const piece of pieces) {
      if (!buf) {
        buf = piece;
        continue;
      }
      if (`${buf} ${piece}`.length <= 220) buf = `${buf} ${piece}`;
      else {
        chunks.push(buf);
        buf = piece;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function resolveTtsEndpoint(chunk: string, lang = "fa"): string {
  const q = encodeURIComponent(chunk);
  const tl = encodeURIComponent(lang);
  const cfg = getRuntimeConfigSync();

  if (cfg.apiMode === "http" && cfg.apiUrl) {
    return `${cfg.apiUrl.replace(/\/$/, "")}/api/tts?q=${q}&tl=${tl}`;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Local Next has no TTS route — hit Nest directly.
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://127.0.0.1:4000/api/tts?q=${q}&tl=${tl}`;
    }
    // Netlify: rewrite /api/tts → function (see netlify.toml).
    return `${window.location.origin}/api/tts?q=${q}&tl=${tl}`;
  }

  return `http://127.0.0.1:4000/api/tts?q=${q}&tl=${tl}`;
}

function playAudioUrl(url: string, token: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (token !== speakToken) {
      resolve();
      return;
    }
    const audio = new Audio();
    currentAudio = audio;
    audio.preload = "auto";
    // Do NOT set crossOrigin — Google/proxy returns no CORS ACAO for media decode path.
    audio.src = url;

    let settled = false;
    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      if (currentAudio === audio) currentAudio = null;
      if (err) reject(err);
      else resolve();
    };

    audio.onended = () => finish();
    audio.onerror = () => finish(new Error("audio_error"));
    void audio.play().catch((err) => finish(err));
  });
}

async function speakViaGoogle(text: string, token: number): Promise<void> {
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    if (token !== speakToken) return;
    const url = resolveTtsEndpoint(chunk, "fa");
    await playAudioUrl(url, token);
    // Small gap between chunks so speech doesn't feel glued.
    if (token === speakToken) {
      await new Promise((r) => window.setTimeout(r, 120));
    }
  }
}

async function speakViaBrowser(text: string, token: number): Promise<void> {
  if (!window.speechSynthesis) throw new Error("no_speech_synthesis");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fa-IR";
  utterance.rate = 0.92;
  await new Promise<void>((resolve, reject) => {
    if (token !== speakToken) {
      resolve();
      return;
    }
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("utterance_error"));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Read cooking step text aloud using Google TTS (proxied),
 * with Web Speech as a last-resort fallback.
 */
export async function speakPersian(text: string): Promise<void> {
  if (typeof window === "undefined") return;
  const trimmed = text.trim();
  if (!trimmed) return;

  const token = ++speakToken;
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }

  try {
    await speakViaGoogle(trimmed, token);
  } catch {
    if (token !== speakToken) return;
    try {
      await speakViaBrowser(trimmed, token);
    } catch {
      /* give up quietly */
    }
  }
}
