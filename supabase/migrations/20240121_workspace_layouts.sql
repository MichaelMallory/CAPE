-- Create workspace layouts table
create table workspace_layouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  layout jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable row level security
alter table workspace_layouts enable row level security;

-- Create policy for users to manage their own layouts
create policy "Users can manage their own layouts"
  on workspace_layouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create function to update updated_at on changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_workspace_layouts_updated_at
  before update on workspace_layouts
  for each row
  execute function update_updated_at_column();

-- Create realtime publication for workspace layouts
create publication workspace_layouts_changes
  for table workspace_layouts
  with (publish = 'insert,update,delete');

-- Create index for user_id for faster lookups
create index workspace_layouts_user_id_idx on workspace_layouts(user_id);

-- Create function to handle layout versioning
create or replace function handle_layout_version()
returns trigger as $$
begin
  -- Increment version on update
  if tg_op = 'UPDATE' then
    new.version = old.version + 1;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger for version handling
create trigger handle_workspace_layouts_version
  before update on workspace_layouts
  for each row
  execute function handle_layout_version(); 