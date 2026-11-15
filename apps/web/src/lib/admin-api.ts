import type {
  AdminRecipeDetail,
  AdminRecipeList,
  Ingredient,
} from "@atlas/contracts";
import { getRuntimeConfigSync } from "@/lib/runtime-config";

const SECRET_KEY = "atlas_admin_secret";

export function getAdminSecret(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SECRET_KEY) ?? "";
}

export function setAdminSecret(secret: string) {
  if (typeof window === "undefined") return;
  if (!secret) localStorage.removeItem(SECRET_KEY);
  else localStorage.setItem(SECRET_KEY, secret);
}

export function clearAdminSecret() {
  setAdminSecret("");
}

function adminBaseUrl(): string {
  const runtime = getRuntimeConfigSync();
  if (runtime.apiUrl) return runtime.apiUrl.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_ATLAS_API_URL) {
    return process.env.NEXT_PUBLIC_ATLAS_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://127.0.0.1:4000";
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${adminBaseUrl()}/api/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": getAdminSecret(),
      ...(init?.headers ?? {}),
    },
    });
  } catch {
    throw new Error(
      "سرویس API در دسترس نیست. Postgres محلی و npm run dev:api را اجرا کنید.",
    );
  }
  if (res.status === 401) {
    throw new Error("کلید مدیریت نادرست است.");
  }
  if (!res.ok) {
    let message = `خطای سرور (${res.status})`;
    try {
      const body = (await res.json()) as {
        message?: string | string[];
        error?: { message?: string };
      };
      const raw = body.error?.message ?? body.message;
      if (typeof raw === "string") message = raw;
      else if (Array.isArray(raw)) message = raw.join("، ");
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listAdminRecipes(params: {
  q?: string;
  page?: number;
  limit?: number;
  status?: "all" | "published" | "draft" | "deleted";
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return adminRequest<AdminRecipeList>(`/recipes${suffix}`);
}

export function getAdminRecipe(id: string) {
  return adminRequest<AdminRecipeDetail>(`/recipes/${encodeURIComponent(id)}`);
}

export function createAdminRecipe(body: unknown) {
  return adminRequest<AdminRecipeDetail>("/recipes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminRecipe(id: string, body: unknown) {
  return adminRequest<AdminRecipeDetail>(`/recipes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteAdminRecipe(id: string) {
  return adminRequest<AdminRecipeDetail>(`/recipes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function restoreAdminRecipe(id: string) {
  return adminRequest<AdminRecipeDetail>(
    `/recipes/${encodeURIComponent(id)}/restore`,
    { method: "POST" },
  );
}

export function searchAdminIngredients(q: string) {
  const query = new URLSearchParams({ q });
  return adminRequest<Array<Pick<Ingredient, "id" | "name" | "category">>>(
    `/ingredients?${query.toString()}`,
  );
}

export function getAdminTaxonomy() {
  return adminRequest<{
    categories: string[];
    subcategoriesByCategory: Record<string, string[]>;
    cuisines: string[];
  }>("/taxonomy");
}

export async function uploadAdminImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${adminBaseUrl()}/api/admin/uploads/image`, {
      method: "POST",
      headers: {
        "x-admin-secret": getAdminSecret(),
      },
      body,
    });
  } catch {
    throw new Error(
      "سرویس API در دسترس نیست. Postgres محلی و npm run dev:api را اجرا کنید.",
    );
  }
  if (res.status === 401) {
    throw new Error("کلید مدیریت نادرست است.");
  }
  if (!res.ok) {
    let message = `خطای سرور (${res.status})`;
    try {
      const payload = (await res.json()) as {
        message?: string | string[];
        error?: { message?: string };
      };
      const raw = payload.error?.message ?? payload.message;
      if (typeof raw === "string") message = raw;
      else if (Array.isArray(raw)) message = raw.join("، ");
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return (await res.json()) as { url: string };
}
