"use client";

import { Login, ProfileTick } from "iconsax-react";
import { BottomSheet } from "@/components/ui/BottomSheet";

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
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#F5C400]/20 text-[#C9A000]">
          <ProfileTick size={34} color="currentColor" variant="Bold" />
        </span>
        <p className="mt-4 text-[17px] font-semibold text-atlas-ink">
          شما وارد نشده‌اید
        </p>
        <p className="mt-2 max-w-[16.5rem] text-[13px] font-normal leading-6 text-atlas-ink-muted">
          برای دیدن دستور پخت و ذخیره غذاها، اول وارد حساب شوید یا ثبت‌نام کنید.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-atlas bg-[#F5C400] text-[15px] font-semibold text-[#111111] shadow-[0_8px_20px_rgba(245,196,0,0.35)] transition hover:bg-[#e6b800] active:scale-[0.99]"
        >
          <Login size={20} color="currentColor" variant="Linear" />
          ورود / ثبت‌نام
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 h-11 w-full text-[13px] font-normal text-atlas-ink-muted"
        >
          بعداً
        </button>
      </div>
    </BottomSheet>
  );
}
