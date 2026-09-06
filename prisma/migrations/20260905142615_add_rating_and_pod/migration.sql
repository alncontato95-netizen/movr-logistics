-- Add Rating table and POD fields to Load
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_loadId_key" UNIQUE ("loadId"),
    CONSTRAINT "Rating_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Rating_carrierId_idx" ON "Rating"("carrierId");
CREATE INDEX "Rating_companyId_idx" ON "Rating"("companyId");
ALTER TABLE "Load" ADD COLUMN "podUrl" TEXT;
ALTER TABLE "Load" ADD COLUMN "podNote" TEXT;
