create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user',
  currency text not null default 'PHP',
  timezone text not null default 'Asia/Manila',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  destination text not null,
  itinerary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_links (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  trip_id text references trips(id) on delete set null,
  category text not null,
  title text not null,
  source text not null,
  url text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_providers (
  id text primary key,
  owner_user_id text references users(id) on delete cascade,
  provider_name text not null,
  base_url text not null,
  model_name text not null,
  encrypted_api_key text,
  headers_json jsonb not null default '{}'::jsonb,
  temperature numeric not null default 0.6,
  max_tokens integer not null default 2000,
  active boolean not null default true,
  fallback_priority integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists webhook_endpoints (
  id text primary key,
  owner_user_id text references users(id) on delete cascade,
  name text not null,
  event_name text not null,
  target_url text not null,
  secret_ref text,
  custom_headers jsonb not null default '{}'::jsonb,
  retry_policy text not null default '3 retries with exponential backoff',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists webhook_logs (
  id text primary key,
  webhook_id text references webhook_endpoints(id) on delete cascade,
  event_name text not null,
  payload_preview jsonb not null default '{}'::jsonb,
  response_status integer,
  success boolean not null default false,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_saved_links_user_id on saved_links(user_id);
create index if not exists idx_webhook_logs_webhook_id on webhook_logs(webhook_id);
