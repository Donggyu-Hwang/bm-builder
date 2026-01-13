-- Create glossary table
create table glossary (
  id uuid primary key default gen_random_uuid(),
  term text unique not null,
  definition text not null,
  examples text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table glossary enable row level security;

-- RLS Policies - Everyone can view
create policy "Everyone can view glossary"
  on glossary for select using (true);

-- Indexes for full-text search
create index glossary_term_idx on glossary using gin(to_tsvector('korean', term));
create index glossary_definition_idx on glossary using gin(to_tsvector('korean', definition));
create index glossary_category_idx on glossary(category);
