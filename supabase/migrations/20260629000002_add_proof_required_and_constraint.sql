ALTER TABLE resources
  ADD COLUMN proof_required boolean NOT NULL DEFAULT false;

ALTER TABLE resources
  ADD CONSTRAINT no_proof_when_everyone
  CHECK (
    NOT (
      'everyone' = ANY(benefits)
      AND proof_required
    )
  );
