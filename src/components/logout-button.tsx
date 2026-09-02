import { logout } from "@/app/actions/auth";

export function LogoutButton({ label = "Log out" }: { label?: string }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-xl px-3.5 py-2 text-sm font-semibold text-muted hover:bg-black/5 hover:text-ink"
      >
        {label}
      </button>
    </form>
  );
}
