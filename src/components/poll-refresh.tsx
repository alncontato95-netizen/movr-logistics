"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function PollRefresh({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();
  const visibleRef = useRef(true);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const id = setInterval(() => {
      if (visibleRef.current) router.refresh();
    }, intervalMs);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return null;
}
