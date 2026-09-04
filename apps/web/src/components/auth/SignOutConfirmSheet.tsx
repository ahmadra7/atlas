"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

export function SignOutConfirmSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      tall={false}
      title="خروج از حساب"
      onClose={onClose}
    >
      <div className="pb-2 pt-1 text-center">
        <p className="text-[13px] font-normal leading-6 text-atlas-ink-muted">
          آیا از خروج مطمئن هستید؟
        </p>
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" onClick={onConfirm}>
            تأیید
          </Button>
          <Button
            variant="tertiary"
            className="flex-1 border border-atlas-primary text-atlas-primary"
            onClick={onClose}
          >
            انصراف
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
