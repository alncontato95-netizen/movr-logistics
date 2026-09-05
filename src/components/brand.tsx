export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="MOVR"
    >
      <rect width="48" height="48" rx="12" fill="#0a0a0b" />
      <g aria-hidden>
        {/* M */}
        <path d="M10 32L14.5 16L19.5 25L24.5 16L29 32" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* O */}
        <rect x="30.5" y="15.5" width="8" height="8" rx="2.5" stroke="white" strokeWidth="2" fill="none" />
        {/* V - green cut representing movement/route */}
        <path d="M10 32L19.5 46L29 32" fill="#3AAF42" />
        <path d="M19.5 46L29 32L27 28L19.5 38L13 28L11 32L19.5 46Z" fill="#2e8c35" opacity="0.9" />
        {/* R */}
        <path d="M34 32V16H38.5C40.5 16 42 17.3 42 19.5C42 21.7 40.5 23 38.5 23H34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M37.5 23L42 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function LogoWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className={`inline-flex items-baseline gap-0 font-extrabold tracking-tight ${scale}`} aria-label="MOVR Logistics Network">
      <span className="text-ink">MO</span>
      <span className="text-brand relative inline-block">
        V
        <span className="absolute -right-0.5 top-1/2 h-0.5 w-1.5 -rotate-12 bg-brand-dark opacity-60" aria-hidden />
      </span>
      <span className="text-ink">R</span>
    </span>
  );
}

export function LogoLockup({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <LogoMark size={size === "sm" ? 28 : 32} />
        <LogoWordmark size={size} />
      </div>
      <div className="mt-1 flex w-full items-center gap-2">
        <span className="h-px flex-1 bg-brand/40" aria-hidden />
        <span className="text-[9px] font-semibold tracking-[0.3em] text-muted">LOGISTICS NETWORK</span>
        <span className="h-px flex-1 bg-brand/40" aria-hidden />
      </div>
    </div>
  );
}
