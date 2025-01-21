-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profiles', 'profiles', false),
  ('missions', 'missions', false),
  ('equipment', 'equipment', false);

-- Set up RLS policies for profiles bucket
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up RLS policies for missions bucket
CREATE POLICY "Mission files are viewable by users with sufficient clearance"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'missions'
  AND EXISTS (
    SELECT 1 FROM missions m
    WHERE (storage.foldername(name))[1] = m.id::text
    AND (auth.jwt()->>'clearance_level')::int >= m.threat_level
  )
);

CREATE POLICY "Mission files can be uploaded by assigned heroes and support staff"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'missions'
  AND (
    EXISTS (
      SELECT 1 FROM mission_assignments ma
      WHERE (storage.foldername(name))[1] = ma.mission_id::text
      AND ma.hero_id = auth.uid()::uuid
    )
    OR (auth.jwt()->>'role' = 'support_staff')
  )
);

-- Set up RLS policies for equipment bucket
CREATE POLICY "Equipment files are viewable by authenticated users"
ON storage.objects FOR SELECT
USING (bucket_id = 'equipment');

CREATE POLICY "Equipment files can be uploaded by assigned hero or support staff"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'equipment'
  AND (
    EXISTS (
      SELECT 1 FROM equipment e
      WHERE (storage.foldername(name))[1] = e.id::text
      AND e.assigned_to = auth.uid()::uuid
    )
    OR (auth.jwt()->>'role' = 'support_staff')
  )
); 