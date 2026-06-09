-- ============================================================
-- MEMBERSHIP AGREEMENT SIGNING SYSTEM
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add signed_agreement_at column to members table
-- NULL means the member has not yet signed the agreement
ALTER TABLE members
ADD COLUMN IF NOT EXISTS signed_agreement_at timestamptz DEFAULT NULL;

-- 2. Add signature_url column to store the signature image path
ALTER TABLE members
ADD COLUMN IF NOT EXISTS signature_url text DEFAULT NULL;

-- 3. Create storage bucket for member signatures and signed PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-signatures', 'member-signatures', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies: members can upload their own signature
CREATE POLICY "Members upload own signature"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'member-signatures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Members can read their own signature
CREATE POLICY "Members read own signature"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'member-signatures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Admin can read all signatures (for record keeping)
CREATE POLICY "Admin reads all signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'member-signatures'
  AND EXISTS (
    SELECT 1 FROM members
    WHERE members.id = auth.uid()
    AND members.role = 'admin'
  )
);

-- 7. Allow members to update their own signed_agreement_at and signature_url
-- (The existing members UPDATE policy should cover this, but adding
-- specific column access if needed)

-- Verify: show current state
SELECT id, full_name, signed_agreement_at, signature_url
FROM members
ORDER BY full_name;
