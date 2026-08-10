import type { ReactNode } from "react";

export function BottomBar({
  children,
  raised = false,
}: {
  children: ReactNode;
  /** When main floating tab bar is visible — sits above it, no white box */
  raised?: boolean;
}) {
  return (
    <div
      className={`fixed left-1/2 z-40 w-full max-w-md -translate-x-1/2 space-y-2 px-4 ${
        raised ? "bottom-24" : "bottom-0 border-t border-atlas-border/80 bg-atlas-surface/95 pb-4 pt-3 backdrop-blur"
      }`}
    >
      {children}
    </div>
  );
}
