-- Reviews are now edited from the admin panel, so they need an
-- updatedAt stamp: the public content bundle re-keys whenever any row
-- changes, and review edits must invalidate it immediately.
ALTER TABLE "Review" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
