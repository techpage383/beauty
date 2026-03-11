-- doctors photo bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctors', 'doctors', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "doctors_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctors');

-- Authenticated users (admins) can upload/update/delete
-- App-level admin guard is enforced in the UI
CREATE POLICY "doctors_photos_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctors');

CREATE POLICY "doctors_photos_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'doctors');

CREATE POLICY "doctors_photos_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'doctors');
