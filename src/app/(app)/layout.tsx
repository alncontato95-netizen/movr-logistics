import { AppShell } from "@/components/app-shell";
import { verifySession } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  return <AppShell user={{ role: session.role, name: session.name }}>{children}</AppShell>;
}
