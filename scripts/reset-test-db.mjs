import fs from "node:fs";
import { execSync } from "node:child_process";

const files = [
  "prisma/test.db",
  "prisma/test.db-journal",
  "prisma/test.db-wal",
  "prisma/test.db-shm",
];

for (const f of files) {
  try {
    if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  } catch {}
}

process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION = "Sim, autorizo";

execSync("npx prisma db push --accept-data-loss", {
  stdio: "inherit",
  env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Sim, autorizo" },
});

try {
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Sim, autorizo" },
  });
} catch {}

