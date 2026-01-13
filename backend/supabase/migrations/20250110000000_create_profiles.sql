-- Create profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Trigger: auth.users 생성 시 자동으로 profiles 레코드 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index profiles_email_idx on profiles(email);
create index profiles_onboarding_completed_idx on profiles(onboarding_completed);
