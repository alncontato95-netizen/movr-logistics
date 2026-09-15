/*
  Normalize Rating.loadId unique constraint:
  - The original migration created it as an INLINE UNIQUE table constraint,
    which SQLite implements as an auto-index (sqlite_autoindex_Rating_2).
    Prisma's diff engine cannot match that auto-index to the schema, so it
    repeatedly generated `DROP INDEX "sqlite_autoindex_Rating_2"` + recreate
    on unrelated migrations, and that DROP INDEX is refused by SQLite (P3018).
  - Recreate the table WITHOUT the inline UNIQUE and create a real named unique
    index (`Rating_loadId_key`, matching the @unique(map:) in the schema).
    This is the only way to remove an auto-index in SQLite.
*/

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("id", "loadId", "companyId", "carrierId", "score", "comment", "createdAt") SELECT "id", "loadId", "companyId", "carrierId", "score", "comment", "createdAt" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
CREATE UNIQUE INDEX "Rating_loadId_key" ON "Rating"("loadId");
CREATE INDEX "Rating_carrierId_idx" ON "Rating"("carrierId");
CREATE INDEX "Rating_companyId_idx" ON "Rating"("companyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;