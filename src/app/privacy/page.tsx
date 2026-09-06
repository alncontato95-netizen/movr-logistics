export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Privacy Policy (AVG / GDPR)</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-GB")} — Pilot Venlo/Limburg</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-semibold">1. Data we collect</h2>
          <p className="mt-1 text-muted">Email, name, phone, vehicle/region preferences (Carrier), KVK, address, phone (Company), loads and applications you create. Cookies: <code>movr_session</code> (auth, 30d, httpOnly) and <code>movr_locale</code> (language).</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Purpose</h2>
          <p className="mt-1 text-muted">Match return loads between Companies and Carriers in Venlo region, manage bookings (OPEN→COMPLETED), and contact only after SELECTED.</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Legal basis</h2>
          <p className="mt-1 text-muted">Contract (matching loads) and legitimate interest (pilot operation). No KVK API or profiling.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Retention & deletion</h2>
          <p className="mt-1 text-muted">Data kept while account active. Request deletion via email to founder — we delete User/Company/Loads via Prisma Studio within 30 days. DB is SQLite file, backups are manual.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Your rights (AVG)</h2>
          <p className="mt-1 text-muted">Access, rectification, erasure, restriction, objection. Contact founder. No automated decisions.</p>
        </section>
        <section>
          <h2 className="font-semibold">6. Cookies</h2>
          <p className="mt-1 text-muted">Only essential cookies above. No analytics. Consent banner stores <code>movr_cookie_consent</code> in localStorage.</p>
        </section>
        <section>
          <h2 className="font-semibold">7. Contact</h2>
          <p className="mt-1 text-muted">MOVR Logistics — Venlo, Limburg, NL (pilot). For privacy requests, use the contact email on your Company profile.</p>
        </section>
      </div>
    </div>
  );
}
