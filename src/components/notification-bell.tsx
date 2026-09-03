"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NotificationBell({
  unread,
  href,
  label,
}: {
  unread: number;
  href: string;
  label: string;
}) {
  const router = useRouter();
  const visibleRef = useRef(true);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const id = setInterval(() => {
      if (visibleRef.current) router.refresh();
    }, 15000);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return (
    <Link
      href={href}
      aria-label={label}
      className="relative inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-black/5 hover:text-ink"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
