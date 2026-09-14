export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Terms & Algemene Voorwaarden (Pilot)</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-GB")} — MOVR LOAD pilot</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-semibold">1. Service</h2>
          <p className="mt-1 text-muted">MOVR LOAD intermediates loads between Company and Carrier. No guarantee of match. Company verifies manually via Prisma Studio; no admin panel, no CNPJ integration.</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Bookings</h2>
          <p className="mt-1 text-muted">OPEN → SELECTED → CONFIRMED → PICKED_UP → DELIVERED → COMPLETED. Contact revealed only after SELECTED. Company may cancel only OPEN|SELECTED; completed loads require POD.</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Liability</h2>
          <p className="mt-1 text-muted">Pilot SQLite DB, no SLA. Prices are offers; negotiable flag indicates. POD is URL/file upload validated (image/pdf, 5MB). Use at own risk for high-value loads — verify carrier habilitação.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Conduct</h2>
          <p className="mt-1 text-muted">No spam, no fake CNPJ (14 digits). Rate-limit per IP/email applies. Misuse leads to manual revocation via Studio.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Termination</h2>
          <p className="mt-1 text-muted">Account deletable on request. Loads in progress remain until COMPLETED/CANCELLED.</p>
        </section>
      </div>
    </div>
  );
}
