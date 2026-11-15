const VOICE_STEPS_KEY = "atlas_voice_steps";

export function getVoiceStepsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(VOICE_STEPS_KEY) === "1";
}

export function setVoiceStepsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOICE_STEPS_KEY, enabled ? "1" : "0");
}

type SpeakHandle = {
  cancel: () => void;
};

let active: SpeakHandle | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let chromeKeepAlive: number | null = null;

function clearChromeKeepAlive() {
  if (chromeKeepAlive != null) {
    window.clearInterval(chromeKeepAlive);
    chromeKeepAlive = null;
  }
}

/** Chrome often freezes mid-utterance unless resume() is poked. */
function startChromeKeepAlive() {
  clearChromeKeepAlive();
  chromeKeepAlive = window.setInterval(() => {
    if (!window.speechSynthesis?.speaking) {
      clearChromeKeepAlive();
      return;
    }
    try {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }, 8_000);
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        resolve(window.speechSynthesis.getVoices());
      };
      const onVoices = () => finish();
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
      // Nudge engines that only populate after getVoices().
      window.speechSynthesis.getVoices();
      window.setTimeout(finish, 700);
    });
  }
  return voicesReady;
}

function scorePersianVoice(voice: SpeechSynthesisVoice): number {
  const blob = `${voice.lang} ${voice.name}`.toLowerCase();
  let score = 0;
  if (/^fa\b|fa-ir|fa_ir/.test(voice.lang.toLowerCase())) score += 100;
  if (/persian|farsi|iran|فارسی/.test(blob)) score += 80;
  if (/dilara|farid|microsoft.*fa/.test(blob)) score += 40;
  if (voice.localService) score += 10;
  // Arabic can approximate Persian script better than English/robot default.
  if (/^ar\b/.test(voice.lang.toLowerCase())) score += 25;
  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const ranked = [...voices].sort(
    (a, b) => scorePersianVoice(b) - scorePersianVoice(a),
  );
  const best = ranked[0];
  return best && scorePersianVoice(best) > 0 ? best : null;
}

/** Split long instructions so engines don't garble / hiss on huge payloads. */
function chunkText(text: string): string[] {
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/\u200c+/g, "\u200c")
    .trim();
  if (!normalized) return [];
  if (normalized.length <= 180) return [normalized];

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
    if (`${buf} ${part}`.length <= 180) {
      buf = `${buf} ${part}`;
    } else {
      chunks.push(buf);
      buf = part;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length > 0 ? chunks : [normalized];
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  active?.cancel();
  active = null;
  clearChromeKeepAlive();
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

export function buildStepSpeech(instruction: string, tip?: string | null): string {
  const parts = [instruction.trim()].filter(Boolean);
  if (tip?.trim()) parts.push(`نکته: ${tip.trim()}`);
  return parts.join(" . ");
}

/**
 * Read Persian cooking text aloud.
 * Returns a promise that settles when playback finishes or is cancelled.
 */
export async function speakPersian(text: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis || !text.trim()) return;

  stopSpeaking();

  // Brief pause after cancel so the audio device can reset (avoids hiss/static).
  await new Promise((r) => window.setTimeout(r, 120));

  const voices = await loadVoices();
  const voice = pickVoice(voices);
  const chunks = chunkText(text);
  if (chunks.length === 0) return;

  let cancelled = false;
  const handle: SpeakHandle = {
    cancel: () => {
      cancelled = true;
      clearChromeKeepAlive();
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    },
  };
  active = handle;
  startChromeKeepAlive();

  try {
    for (const chunk of chunks) {
      if (cancelled) return;
      await speakChunk(chunk, voice);
    }
  } finally {
    if (active === handle) {
      active = null;
      clearChromeKeepAlive();
    }
  }
}

function speakChunk(
  text: string,
  voice: SpeechSynthesisVoice | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Unstick Chrome if a previous utterance left the engine paused.
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang?.toLowerCase().startsWith("fa")
        ? voice.lang
        : "fa-IR";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = () => finish();

      window.speechSynthesis.speak(utterance);

      // Safety: if engine silently dies, don't hang the queue forever.
      window.setTimeout(() => {
        if (!done && !window.speechSynthesis.speaking) finish();
      }, Math.max(8_000, text.length * 120));
    } catch (err) {
      reject(err);
    }
  });
}

/** Warm the voice list early (call from cook page mount). */
export function preloadSpeechVoices() {
  if (typeof window === "undefined") return;
  void loadVoices();
}
