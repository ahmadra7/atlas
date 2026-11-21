import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import { EdgeTTS } from "@andresaya/edge-tts";

const PERSIAN_VOICE = "fa-IR-DilaraNeural";

/**
 * Proxies neural TTS for cooking-step narration.
 * Prefers Microsoft Edge neural Persian voices (no API key).
 * Falls back to Google Translate TTS (Arabic) if Edge is unreachable.
 */
@Controller("tts")
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  @Get()
  @Header("Cache-Control", "public, max-age=600")
  async speak(
    @Query("q") q: string | undefined,
    @Query("tl") tl: string | undefined,
    @Res() res: Response,
  ) {
    const text = (q ?? "").trim();
    if (!text) throw new BadRequestException("q is required");
    if (text.length > 400) {
      throw new BadRequestException("q must be <= 400 characters");
    }
    const lang = (tl ?? "fa").trim() || "fa";

    try {
      const mp3 = await this.synthesizeEdge(text, lang);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", String(mp3.length));
      res.setHeader("X-Atlas-TTS", "edge");
      res.send(mp3);
      return;
    } catch (err) {
      this.logger.warn(
        `Edge TTS failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    try {
      const mp3 = await this.synthesizeGoogleFallback(text, lang);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", String(mp3.length));
      res.setHeader("X-Atlas-TTS", "google-fallback");
      res.send(mp3);
      return;
    } catch (err) {
      this.logger.warn(
        `Google TTS fallback failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    throw new ServiceUnavailableException("TTS unavailable");
  }

  private async synthesizeEdge(text: string, lang: string): Promise<Buffer> {
    const voice = lang.startsWith("fa")
      ? PERSIAN_VOICE
      : lang.startsWith("en")
        ? "en-US-JennyNeural"
        : PERSIAN_VOICE;
    const tts = new EdgeTTS();
    await tts.synthesize(text, voice);
    const raw = tts.toBuffer();
    if (!raw || raw.length < 64) {
      throw new Error("empty edge audio");
    }
    return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  }

  /** Google Translate TTS — Persian `tl=fa` is blocked in some regions; use `ar` for Persian script. */
  private async synthesizeGoogleFallback(
    text: string,
    lang: string,
  ): Promise<Buffer> {
    const tl = lang.startsWith("fa") ? "ar" : lang || "en";
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
    if (!upstream.ok) {
      throw new Error(`google ${upstream.status}`);
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length < 64) throw new Error("empty google audio");
    return buf;
  }
}
