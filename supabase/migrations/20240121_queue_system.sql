-- Create enum for ticket priorities if not exists
do $$ begin
    create type ticket_priority as enum ('OMEGA', 'ALPHA', 'BETA', 'GAMMA');
exception
    when duplicate_object then null;
end $$;

-- Create enum for ticket statuses if not exists
do $$ begin
    create type ticket_status as enum ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
exception
    when duplicate_object then null;
end $$;

-- Create tickets table if not exists
create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  priority ticket_priority not null default 'GAMMA',
  status ticket_status not null default 'NEW',
  created_by uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  last_escalated_at timestamptz,
  response_time interval, -- Time between creation and first response
  resolution_time interval, -- Time between creation and resolution
  tags text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb
);

-- Create ticket history table if not exists
create table if not exists ticket_history (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now(),
  field_name text not null,
  old_value text,
  new_value text,
  change_type text not null -- e.g., 'UPDATE', 'ESCALATION', 'ASSIGNMENT'
);

-- Create ticket metrics table if not exists
create table if not exists ticket_metrics (
  id uuid default gen_random_uuid() primary key,
  calculated_at timestamptz not null default now(),
  avg_response_time interval,
  avg_resolution_time interval,
  queue_length integer,
  resolution_rate numeric,
  priority_distribution jsonb,
  workload_distribution jsonb
);

-- Create hero workload table if not exists
create table if not exists hero_workload (
  hero_id uuid references auth.users(id) on delete cascade primary key,
  current_tasks integer not null default 0,
  total_tasks_today integer not null default 0,
  last_assignment_at timestamptz,
  specialties text[] default array[]::text[],
  availability_status text not null default 'AVAILABLE',
  updated_at timestamptz not null default now()
);

-- Enable row level security (idempotent)
alter table if exists tickets enable row level security;
alter table if exists ticket_history enable row level security;
alter table if exists ticket_metrics enable row level security;
alter table if exists hero_workload enable row level security;

-- Drop existing policies if they exist
do $$ begin
    drop policy if exists "Anyone can create tickets" on tickets;
    drop policy if exists "Support staff can view all tickets" on tickets;
    drop policy if exists "Assigned heroes can view their tickets" on tickets;
    drop policy if exists "Support staff can update tickets" on tickets;
    drop policy if exists "Support staff can view ticket history" on ticket_history;
    drop policy if exists "Support staff can view metrics" on ticket_metrics;
    drop policy if exists "Support staff can view hero workload" on hero_workload;
    drop policy if exists "Heroes can view their own workload" on hero_workload;
exception
    when undefined_object then null;
end $$;

-- Create policies
create policy "Anyone can create tickets"
  on tickets for insert
  with check (true);

create policy "Support staff can view all tickets"
  on tickets for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data->>'clearance_level')::int >= 5
    )
  );

create policy "Assigned heroes can view their tickets"
  on tickets for select
  using (assigned_to = auth.uid());

create policy "Support staff can update tickets"
  on tickets for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data->>'clearance_level')::int >= 5
    )
  );

create policy "Support staff can view ticket history"
  on ticket_history for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data->>'clearance_level')::int >= 5
    )
  );

create policy "Support staff can view metrics"
  on ticket_metrics for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data->>'clearance_level')::int >= 5
    )
  );

create policy "Support staff can view hero workload"
  on hero_workload for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data->>'clearance_level')::int >= 5
    )
  );

create policy "Heroes can view their own workload"
  on hero_workload for select
  using (hero_id = auth.uid());

-- Create or replace functions and triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if they exist
drop trigger if exists update_tickets_updated_at on tickets;
drop trigger if exists update_hero_workload_updated_at on hero_workload;
drop trigger if exists handle_ticket_escalation on tickets;
drop trigger if exists update_hero_workload on tickets;

-- Create triggers
create trigger update_tickets_updated_at
  before update on tickets
  for each row
  execute function update_updated_at_column();

create trigger update_hero_workload_updated_at
  before update on hero_workload
  for each row
  execute function update_updated_at_column();

create or replace function handle_ticket_escalation()
returns trigger as $$
declare
  escalation_threshold interval;
  new_priority ticket_priority;
begin
  -- Set escalation threshold based on current priority
  case new.priority
    when 'GAMMA' then escalation_threshold := interval '4 hours';
    when 'BETA' then escalation_threshold := interval '2 hours';
    when 'ALPHA' then escalation_threshold := interval '1 hour';
    else escalation_threshold := null;
  end case;

  -- Check if ticket should be escalated
  if escalation_threshold is not null
     and new.status = 'NEW'
     and (new.last_escalated_at is null or 
          now() - new.last_escalated_at > escalation_threshold) then
    
    -- Determine new priority
    case new.priority
      when 'GAMMA' then new_priority := 'BETA';
      when 'BETA' then new_priority := 'ALPHA';
      when 'ALPHA' then new_priority := 'OMEGA';
      else new_priority := new.priority;
    end case;

    -- Update ticket if priority changed
    if new_priority != new.priority then
      new.priority := new_priority;
      new.last_escalated_at := now();
      
      -- Record escalation in history
      insert into ticket_history (
        ticket_id,
        field_name,
        old_value,
        new_value,
        change_type
      ) values (
        new.id,
        'priority',
        new.priority::text,
        new_priority::text,
        'ESCALATION'
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger handle_ticket_escalation
  before update on tickets
  for each row
  execute function handle_ticket_escalation();

create or replace function update_hero_workload()
returns trigger as $$
begin
  if tg_op = 'UPDATE' and old.assigned_to is distinct from new.assigned_to then
    -- Decrease old hero's workload
    if old.assigned_to is not null then
      update hero_workload
      set current_tasks = greatest(0, current_tasks - 1)
      where hero_id = old.assigned_to;
    end if;
    
    -- Increase new hero's workload
    if new.assigned_to is not null then
      insert into hero_workload (hero_id, current_tasks, total_tasks_today, last_assignment_at)
      values (new.assigned_to, 1, 1, now())
      on conflict (hero_id) do update
      set current_tasks = hero_workload.current_tasks + 1,
          total_tasks_today = hero_workload.total_tasks_today + 1,
          last_assignment_at = now();
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger update_hero_workload
  after update on tickets
  for each row
  execute function update_hero_workload();

-- Drop existing publication if exists
drop publication if exists ticket_changes;

-- Create realtime publication
create publication ticket_changes
  for table tickets
  with (publish = 'insert,update,delete');

-- Drop existing indexes if they exist
drop index if exists tickets_priority_status_idx;
drop index if exists tickets_assigned_to_idx;
drop index if exists tickets_created_at_idx;
drop index if exists ticket_history_ticket_id_idx;
drop index if exists hero_workload_current_tasks_idx;

-- Create indexes for performance
create index if not exists tickets_priority_status_idx on tickets(priority, status);
create index if not exists tickets_assigned_to_idx on tickets(assigned_to);
create index if not exists tickets_created_at_idx on tickets(created_at);
create index if not exists ticket_history_ticket_id_idx on ticket_history(ticket_id);
create index if not exists hero_workload_current_tasks_idx on hero_workload(current_tasks); 