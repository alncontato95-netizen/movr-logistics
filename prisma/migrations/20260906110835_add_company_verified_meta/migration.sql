-- Add Company verification metadata
ALTER TABLE "Company" ADD COLUMN "verifiedAt" DATETIME;
ALTER TABLE "Company" ADD COLUMN "verifiedBy" TEXT;
ALTER TABLE "Company" ADD COLUMN "verificationNote" TEXT;
