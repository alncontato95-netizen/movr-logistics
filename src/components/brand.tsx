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
      <rect width="48" height="48" rx="12" fill="#3AAF42" />
      <path
        d="M34 28c0 3-2.2 5-5 5H16c-2.8 0-5-2-5-5V17c0-3 2.2-5 5-5h13c2.8 0 5 2 5 5v11z"
        fill="#fff"
      />
      <path
        d="M11 20h5M20 20h9M11 26h5M20 26h9"
        stroke="#3AAF42"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
