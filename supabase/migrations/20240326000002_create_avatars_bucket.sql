-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Allow authenticated users to upload avatars
create policy "Allow authenticated users to upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Allow authenticated users to update their own avatars
create policy "Allow users to update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Allow authenticated users to delete their own avatars
create policy "Allow users to delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Allow public access to read avatars
create policy "Allow public to read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars'); 