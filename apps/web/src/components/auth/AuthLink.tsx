"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function AuthLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { isAuthenticated, requestLogin } = useAuth();

  if (isAuthenticated) {
    return (
      <Link href={href} prefetch className={className}>
        {children}
      </Link>
    );
  }

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    requestLogin(href);
  }

  return (
    <button
      type="button"
      className={`block w-full appearance-none border-0 bg-transparent p-0 text-inherit ${className ?? ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
