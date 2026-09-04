"use client";

export function IosSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative box-border h-[31px] w-[51px] shrink-0 overflow-hidden rounded-full border-0 p-0 transition-colors duration-200 ease-out ${
        checked ? "bg-[#34C759]" : "bg-[#E5E5EA] dark:bg-[#3A3A3C]"
      }`}
      style={{ appearance: "none" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-[left] duration-200 ease-out"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
