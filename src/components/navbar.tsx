"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sticky header that fades out while scrolling down and fades back in
 * when the user scrolls up (or reaches the top again).
 */
export function Navbar({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (y > 64 && delta > 4) {
          setHidden(true);
        } else if (delta < -4 || y <= 8) {
          setHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[70] ${
        hidden
          ? "-translate-y-full opacity-0 transition-all duration-300 ease-out"
          : "translate-y-0 opacity-100"
      }`}
    >
      {children}
    </header>
  );
}