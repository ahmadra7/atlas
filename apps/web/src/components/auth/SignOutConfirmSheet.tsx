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
        <p className="text-[16px] font-semibold text-atlas-ink">
          آیا مطمئن هستید؟
        </p>
        <p className="mt-2 text-[13px] font-normal leading-6 text-atlas-ink-muted">
          با خروج، به‌صورت مهمان ادامه می‌دهید و برای پخت باید دوباره وارد شوید.
        </p>
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" onClick={onConfirm}>
            تأیید
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
