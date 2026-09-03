import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/dal";
import { unreadCount } from "@/lib/notify";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unread = await unreadCount(user.id);
  return (
    <AppShell user={{ role: user.role, name: user.name }} unread={unread}>
      {children}
    </AppShell>
  );
}
