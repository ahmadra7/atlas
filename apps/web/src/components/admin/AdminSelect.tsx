"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown2, SearchNormal1, TickCircle } from "iconsax-react";

export type AdminSelectOption = {
  value: string;
  label: string;
};

type MenuPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

export function AdminSelect({
  value,
  options,
  onChange,
  placeholder = "انتخاب کنید",
  disabled = false,
  searchable = true,
}: {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const listId = useId();

  const selected =
    options.find((option) => option.value === value) ??
    (value
      ? { value, label: value }
      : { value: "", label: placeholder });

  const filtered = options.filter((option) => {
    if (!query.trim()) return true;
    return (
      option.label.includes(query.trim()) || option.value.includes(query.trim())
    );
  });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  function updatePosition() {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      160,
      Math.min(280, openUp ? spaceAbove : spaceBelow),
    );
    setPos({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      maxHeight,
      openUp,
    });
  }

  function openMenu() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setClosing(false);
    setVisible(true);
    setOpen(true);
    setQuery("");
  }

  function closeMenu() {
    if (!open && !visible) return;
    setOpen(false);
    setClosing(true);
    setQuery("");
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      closeTimer.current = null;
    }, 140);
  }

  useLayoutEffect(() => {
    if (!visible || closing) return;
    updatePosition();
    function onScrollOrResize() {
      updatePosition();
    }
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [visible, closing]);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    visible && mounted && pos
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            data-state={closing || !open ? "closed" : "open"}
            data-open-up={pos.openUp ? "true" : "false"}
            className="admin-select-menu overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
            style={{
              position: "fixed",
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp
                ? window.innerHeight - pos.top
                : undefined,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: 220,
            }}
          >
            {searchable && options.length > 6 ? (
              <div className="border-b border-slate-100 bg-slate-50/90 p-2">
                <div className="relative">
                  <SearchNormal1
                    size={15}
                    color="currentColor"
                    variant="Linear"
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto text-slate-400"
                  />
                  <input
                    className="admin-field !rounded-xl !py-2 !ps-9 !text-[13px]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجو در گزینه‌ها…"
                    autoFocus={!closing}
                  />
                </div>
              </div>
            ) : null}
            <ul
              className="admin-scroll overflow-y-auto p-1.5"
              style={{
                maxHeight:
                  searchable && options.length > 6
                    ? pos.maxHeight - 56
                    : pos.maxHeight,
              }}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-[13px] text-slate-500">
                  موردی پیدا نشد
                </li>
              ) : (
                filtered.map((option) => {
                  const active = option.value === value;
                  return (
                    <li key={`${option.value}-${option.label}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-right text-[13px] transition ${
                          active
                            ? "bg-[rgba(212,2,47,0.08)] font-bold text-[var(--admin-accent)]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          onChange(option.value);
                          closeMenu();
                        }}
                      >
                        <span className="truncate">{option.label}</span>
                        {active ? (
                          <TickCircle
                            size={16}
                            color="currentColor"
                            variant="Bold"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          if (open) closeMenu();
          else openMenu();
        }}
        className={`admin-field flex items-center justify-between gap-2 text-right transition-shadow duration-150 ${
          open
            ? "border-[rgba(212,2,47,0.45)] shadow-[0_0_0_3px_var(--admin-accent-soft)]"
            : ""
        } ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
      >
        <span
          className={`truncate ${
            selected.value ? "text-[var(--admin-ink)]" : "text-slate-400"
          }`}
        >
          {selected.label}
        </span>
        <ArrowDown2
          size={16}
          color="currentColor"
          variant="Linear"
          className={`shrink-0 text-slate-500 transition-transform duration-200 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {menu}
    </div>
  );
}
