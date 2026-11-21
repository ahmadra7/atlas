/**
 * Netlify Function: neural Persian TTS for cooking steps.
 * Prefers Microsoft Edge fa-IR-DilaraNeural, falls back to Google (ar).
 */
import { EdgeTTS } from "@andresaya/edge-tts";

const PERSIAN_VOICE = "fa-IR-DilaraNeural";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const params = event.queryStringParameters ?? {};
  const text = String(params.q ?? "").trim();
  const lang = String(params.tl ?? "fa").trim() || "fa";

  if (!text) return json(400, { error: "q is required" });
  if (text.length > 400) return json(400, { error: "q must be <= 400 characters" });

  try {
    const tts = new EdgeTTS();
    const voice = lang.startsWith("fa") ? PERSIAN_VOICE : "en-US-JennyNeural";
    await tts.synthesize(text, voice);
    const raw = tts.toBuffer();
    const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    if (buf.length >= 64) {
      return audio(buf);
    }
  } catch {
    /* fall through */
  }

  try {
    const tl = lang.startsWith("fa") ? "ar" : lang;
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", tl);
    url.searchParams.set("q", text.slice(0, 180));
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: "https://translate.google.com/",
      },
    });
    if (!upstream.ok) throw new Error(`google ${upstream.status}`);
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length < 64) throw new Error("empty");
    return audio(buf);
  } catch {
    return json(503, { error: "TTS unavailable" });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function audio(buf) {
  return {
    statusCode: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=600",
    },
    body: buf.toString("base64"),
    isBase64Encoded: true,
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
