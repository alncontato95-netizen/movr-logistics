-- Add carrier habilitation fields
ALTER TABLE "User" ADD COLUMN "licenseUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "licenseExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "carrierVerified" BOOLEAN NOT NULL DEFAULT false;
