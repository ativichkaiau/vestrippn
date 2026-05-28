-- Local credentials auth: optional password hash for email/password users.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
