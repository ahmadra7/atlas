"use client";

import { Login, ProfileTick } from "iconsax-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

export function LoginGateSheet({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      tall={false}
      title="ورود به حساب"
      onClose={onClose}
    >
      <div className="flex flex-col items-center pb-5 pt-2 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-atlas-success-soft text-atlas-success">
          <ProfileTick size={34} color="currentColor" variant="Bold" />
        </span>
        <p className="mt-4 text-[17px] font-semibold text-atlas-ink">
          شما وارد نشده‌اید
        </p>
        <p className="mt-2 max-w-[16.5rem] text-[13px] font-normal leading-6 text-atlas-ink-muted">
          برای دیدن دستور پخت و ذخیره غذاها، اول وارد حساب شوید یا ثبت‌نام کنید.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={onLogin}
          icon={<Login size={20} color="currentColor" variant="Linear" />}
        >
          ورود / ثبت‌نام
        </Button>
        <Button
          variant="tertiary"
          className="mt-3 w-full font-medium"
          onClick={onClose}
        >
          بعداً
        </Button>
      </div>
    </BottomSheet>
  );
}
