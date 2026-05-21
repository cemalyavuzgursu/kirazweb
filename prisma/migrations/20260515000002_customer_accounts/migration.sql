-- Add passwordHash to Customer for account-based login
ALTER TABLE "Customer" ADD COLUMN "passwordHash" TEXT;
