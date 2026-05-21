-- CreateTable: Role
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- Seed system roles with their default permissions
INSERT INTO "Role" ("id", "name", "permissions", "isSystem", "updatedAt") VALUES
(
  'role_admin_sys',
  'ADMIN',
  '["products:read","products:write","products:delete","orders:read","orders:write","customers:read","content:write","content:delete","media:upload","coupons:manage","users:manage","roles:manage","settings:manage","seo:manage"]'::jsonb,
  true,
  NOW()
),
(
  'role_editor_sys',
  'EDITOR',
  '["products:read","products:write","orders:read","orders:write","customers:read","content:write","media:upload","coupons:manage","seo:manage"]'::jsonb,
  true,
  NOW()
);

-- Add roleId column to User (nullable during migration)
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Migrate existing role values to FK references
UPDATE "User" SET "roleId" = 'role_admin_sys'  WHERE "role" = 'ADMIN'::"UserRole";
UPDATE "User" SET "roleId" = 'role_editor_sys' WHERE "role" = 'EDITOR'::"UserRole";

-- Fallback: any unmatched row gets EDITOR
UPDATE "User" SET "roleId" = 'role_editor_sys' WHERE "roleId" IS NULL;

-- Make roleId NOT NULL
ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old role column and enum
ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "UserRole";
