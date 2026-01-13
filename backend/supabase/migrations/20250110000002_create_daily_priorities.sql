-- Create daily_priorities table
create table daily_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  priorities jsonb not null default '[]'::jsonb,
  source text default 'ai_suggestion' check (source in ('ai_suggestion', 'manual')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table daily_priorities enable row level security;

-- RLS Policies
create policy "Users can manage their own priorities"
  on daily_priorities for all using (auth.uid() = user_id);

-- Indexes
create index daily_priorities_user_id_idx on daily_priorities(user_id);
create index daily_priorities_created_at_idx on daily_priorities(created_at desc);
