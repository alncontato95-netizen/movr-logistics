/*
  Warnings:

  - You are about to drop the column `kvk` on the `Company` table. All the data in the column will be lost.
  - Added the required column `cnpj` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "verificationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Company" ("address", "createdAt", "id", "name", "phone", "userId", "verificationNote", "verified", "verifiedAt", "verifiedBy") SELECT "address", "createdAt", "id", "name", "phone", "userId", "verificationNote", "verified", "verifiedAt", "verifiedBy" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_loadId_idx" ON "Notification"("loadId");

-- CreateIndex
CREATE INDEX "Application_loadId_idx" ON "Application"("loadId");

-- CreateIndex
CREATE INDEX "Application_loadId_status_idx" ON "Application"("loadId", "status");

-- CreateIndex
CREATE INDEX "Load_status_pickupDate_idx" ON "Load"("status", "pickupDate");

-- CreateIndex
CREATE INDEX "Load_companyId_idx" ON "Load"("companyId");

-- CreateIndex
CREATE INDEX "Load_companyId_status_idx" ON "Load"("companyId", "status");

-- CreateIndex
CREATE INDEX "Load_publishedBy_idx" ON "Load"("publishedBy");

-- CreateIndex
CREATE INDEX "Load_createdAt_idx" ON "Load"("createdAt");
