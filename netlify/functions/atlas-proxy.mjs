/**
 * Optional same-origin proxy: Netlify /api/* → ATLAS_API_ORIGIN/api/*
 * Set ATLAS_API_ORIGIN in Netlify env when a tunnel URL is available.
 * /api/tts stays on the dedicated TTS function (higher-priority redirect).
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-secret",
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const origin = String(process.env.ATLAS_API_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
  if (!origin) {
    return {
      statusCode: 503,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          "Live API offline. Run npm run tunnel:api on the office PC (or set ATLAS_API_ORIGIN).",
      }),
    };
  }

  let path = event.path || "";
  path = path
    .replace(/^\/\.netlify\/functions\/atlas-proxy/, "")
    .replace(/^\/api/, "");
  if (!path.startsWith("/")) path = `/${path}`;

  const qs = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `${origin}/api${path}${qs}`;

  const headers = { Accept: "application/json" };
  if (event.headers?.authorization) {
    headers.Authorization = event.headers.authorization;
  }
  if (event.headers?.["x-admin-secret"]) {
    headers["x-admin-secret"] = event.headers["x-admin-secret"];
  }
  if (event.headers?.["content-type"]) {
    headers["Content-Type"] = event.headers["content-type"];
  }

  try {
    const upstream = await fetch(url, {
      method: event.httpMethod,
      headers,
      body:
        event.httpMethod === "GET" || event.httpMethod === "HEAD"
          ? undefined
          : event.body,
      redirect: "follow",
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    const contentType =
      upstream.headers.get("content-type") || "application/json";
    return {
      statusCode: upstream.status,
      headers: {
        ...CORS,
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
      body: buf.toString(contentType.includes("json") || contentType.includes("text") ? "utf8" : "base64"),
      isBase64Encoded: !(
        contentType.includes("json") || contentType.includes("text")
      ),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Upstream API unreachable",
        detail: String(err?.message || err),
      }),
    };
  }
}
