"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeSkeleton } from "@/components/ui/Skeleton";
import RecipeDetailClient from "./RecipeDetailClient";

export default function RecipeViewPage() {
  return (
    <Suspense
      fallback={
        <AppShell hideNav showBack title="دستور" lockScroll>
          <RecipeSkeleton />
        </AppShell>
      }
    >
      <RecipeDetailClient />
    </Suspense>
  );
}
