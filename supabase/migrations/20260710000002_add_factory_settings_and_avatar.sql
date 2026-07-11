-- 20260710000002_add_factory_settings_and_avatar.sql
-- Extend factories with contact/settings fields, add avatar to users

ALTER TABLE factories
  ADD COLUMN industry_type TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN contact_info TEXT;

ALTER TABLE users
  ADD COLUMN avatar_url TEXT;

-- Profile avatars storage bucket (public for read, restricted for write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read avatars (public bucket)
CREATE POLICY "avatars_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload only to their own folder
CREATE POLICY "avatars_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );

-- Authenticated users can update only their own files
CREATE POLICY "avatars_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );

-- Authenticated users can delete only their own files
CREATE POLICY "avatars_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[0] = auth.uid()::text
  );

-- Factory settings: allow any authenticated user from the factory to update
-- The RLS check prevents changing the factory id to escape multi-tenant boundary
CREATE POLICY factories_update_policy ON factories
  FOR UPDATE
  USING (id = get_user_factory_id())
  WITH CHECK (id = get_user_factory_id());
