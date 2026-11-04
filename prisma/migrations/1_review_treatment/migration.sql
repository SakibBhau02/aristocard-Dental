-- Patient reviews now carry the treatment the patient received as free
-- text ("Smile Makeover", "Root Canal Treatment"), separate from the
-- optional serviceSlug link used for filtering.
ALTER TABLE "Review" ADD COLUMN "treatment" TEXT;
