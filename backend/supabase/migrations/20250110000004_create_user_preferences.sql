-- Create user_preferences table
create table user_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  show_tooltips boolean default true,
  node_ui_tour_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table user_preferences enable row level security;

-- RLS Policies
create policy "Users can manage their own preferences"
  on user_preferences for all using (auth.uid() = user_id);
