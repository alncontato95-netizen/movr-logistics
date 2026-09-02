import Link from "next/link";
import { LogoMark } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-extrabold tracking-tight text-ink">MOVR</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-12">{children}</main>
    </div>
  );
}
