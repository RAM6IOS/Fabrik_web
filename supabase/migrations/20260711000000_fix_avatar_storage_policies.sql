-- Fix avatar storage RLS policies: foldername()[1] → foldername()[0]
-- storage.foldername() returns only directory parts, not the filename.
-- For path "user-id/file.ext", result is ['user-id'], so [0] is correct.

DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

CREATE POLICY "avatars_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );

CREATE POLICY "avatars_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );

CREATE POLICY "avatars_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );
