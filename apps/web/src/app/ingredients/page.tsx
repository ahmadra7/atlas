"use client";

import Link from "next/link";
import { useState } from "react";
import type { InventoryItem } from "@atlas/contracts";
import { DocumentText } from "iconsax-react";
import { IngredientsPanel } from "@/components/ingredients/IngredientsPanel";
import { AppShell } from "@/components/layout/AppShell";
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";

export default function IngredientsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  return (
    <AppShell title="افزودن مواد">
      <div className="space-y-4 pb-36">
        <IngredientsPanel onInventoryChange={setInventory} />

        <BottomBar raised>
          <Link href="/recommendations" className="block">
            <Button
              size="lg"
              className="w-full"
              disabled={inventory.length === 0}
              icon={<DocumentText size={20} color="currentColor" />}
            >
              دریافت دستورها
            </Button>
          </Link>
        </BottomBar>
      </div>
    </AppShell>
  );
}
