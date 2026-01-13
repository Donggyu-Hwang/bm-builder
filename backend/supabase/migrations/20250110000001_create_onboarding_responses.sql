-- Create onboarding_responses table
create table onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  step_number integer not null check (step_number in (1, 2, 3)),
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, step_number)
);

-- Enable RLS
alter table onboarding_responses enable row level security;

-- RLS Policies
create policy "Users can manage their own onboarding responses"
  on onboarding_responses for all using (auth.uid() = user_id);

-- Indexes
create index onboarding_responses_user_id_idx on onboarding_responses(user_id);
create index onboarding_responses_step_number_idx on onboarding_responses(step_number);
