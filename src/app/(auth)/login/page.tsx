import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.auth.welcomeBack}</h1>
        <p className="mt-1 text-sm text-muted">{t.auth.loginSubtitle}</p>
      </div>
      <LoginForm t={t.auth} />
      <p className="text-center text-sm text-muted">
        {t.auth.newToMovr}{" "}
        <Link href="/register" className="font-semibold text-brand-dark hover:underline">
          {t.auth.createAccount}
        </Link>
      </p>
    </div>
  );
}
