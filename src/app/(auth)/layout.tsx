import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "COMPANY" ? "/company/loads" : "/loads");
  }
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-ink">
          MO<span className="text-brand">V</span>R
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-12">{children}</main>
    </div>
  );
}
