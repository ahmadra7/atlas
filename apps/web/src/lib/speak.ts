const VOICE_STEPS_KEY = "atlas_voice_steps";

export function getVoiceStepsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(VOICE_STEPS_KEY) === "1";
}

export function setVoiceStepsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOICE_STEPS_KEY, enabled ? "1" : "0");
}

type SpeakHandle = { cancel: () => void };

let active: SpeakHandle | null = null;
let voicesCache: SpeechSynthesisVoice[] | null = null;
let unlocked = false;
let speakToken = 0;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function buildStepSpeech(
  instruction: string,
  tip?: string | null,
): string {
  const parts = [instruction.trim()].filter(Boolean);
  if (tip?.trim()) parts.push(`نکته: ${tip.trim()}`);
  return parts.join(" . ");
}

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) voicesCache = list;
  return voicesCache ?? list;
}

export function preloadSpeechVoices() {
  if (!isSpeechSupported()) return;
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    refreshVoices();
  });
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase();
  const blob = `${lang} ${voice.name}`.toLowerCase();
  let score = 0;
  if (lang.startsWith("fa")) score += 100;
  if (/persian|farsi|iran|فارسی|dilara|farid/.test(blob)) score += 80;
  if (voice.localService) score += 5;
  return score;
}

function pickPersianVoice(): SpeechSynthesisVoice | null {
  const voices = refreshVoices();
  if (voices.length === 0) return null;
  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const best = ranked[0];
  return best && scoreVoice(best) >= 80 ? best : null;
}

export function hasPersianVoice(): boolean {
  return pickPersianVoice() != null;
}

/** Must run inside a click/tap handler to unlock autoplay policies. */
export function unlockSpeech(): void {
  if (!isSpeechSupported() || unlocked) return;
  try {
    window.speechSynthesis.cancel();
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    warm.rate = 2;
    warm.lang = "fa-IR";
    window.speechSynthesis.speak(warm);
    window.speechSynthesis.cancel();
    unlocked = true;
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  speakToken += 1;
  active?.cancel();
  active = null;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= 160) return [normalized];

  const parts = normalized
    .split(/(?<=[.!؟?\n،؛])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const part of parts) {
    if (!buf) {
      buf = part;
      continue;
    }
    if (`${buf} ${part}`.length <= 160) buf = `${buf} ${part}`;
    else {
      chunks.push(buf);
      buf = part;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length > 0 ? chunks : [normalized];
}

function speakOne(
  text: string,
  voice: SpeechSynthesisVoice | null,
  token: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (token !== speakToken) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fa-IR";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Only bind an explicit Persian voice — mismatched voices cause hiss/noise.
    if (voice) utterance.voice = voice;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;

    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
    window.speechSynthesis.speak(utterance);

    window.setTimeout(
      () => {
        if (!done && !window.speechSynthesis.speaking) finish();
      },
      Math.max(6_000, text.length * 100),
    );
  });
}

/**
 * Read cooking text aloud.
 * Call from a click handler when possible so mobile browsers allow audio.
 */
export async function speakPersian(text: string): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return;

  const token = ++speakToken;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }

  // Tiny yield so cancel flushes without breaking a click-gesture chain.
  await new Promise<void>((r) => {
    window.setTimeout(r, 40);
  });
  if (token !== speakToken) return;

  const voice = pickPersianVoice();
  const chunks = chunkText(text);
  if (chunks.length === 0) return;

  let cancelled = false;
  const handle: SpeakHandle = {
    cancel: () => {
      cancelled = true;
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    },
  };
  active = handle;

  try {
    for (const chunk of chunks) {
      if (cancelled || token !== speakToken) return;
      await speakOne(chunk, voice, token);
    }
  } finally {
    if (active === handle) active = null;
  }
}
