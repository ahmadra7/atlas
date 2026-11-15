const VOICE_STEPS_KEY = "atlas_voice_steps";

export function getVoiceStepsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(VOICE_STEPS_KEY) === "1";
}

export function setVoiceStepsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOICE_STEPS_KEY, enabled ? "1" : "0");
}

function pickPersianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /^fa(-|$)/i.test(v.lang)) ??
    voices.find((v) => /persian|farsi|iran/i.test(`${v.lang} ${v.name}`)) ??
    null
  );
}

/** Read step text aloud in Persian when browser TTS is available. */
export function speakPersian(text: string) {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis || !text.trim()) return;

  window.speechSynthesis.cancel();

  const speakNow = () => {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = "fa-IR";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const voice = pickPersianVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  // Some browsers load voices asynchronously.
  if (window.speechSynthesis.getVoices().length === 0) {
    const onVoices = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      speakNow();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    window.setTimeout(speakNow, 250);
    return;
  }
  speakNow();
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
