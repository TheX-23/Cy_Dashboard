create table if not exists users (
  id uuid primary key,
  email text unique not null,
  role text not null check (role in ('admin', 'analyst', 'viewer'))
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('admin', 'analyst', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  ip inet not null,
  timestamp timestamptz not null,
  type text not null,
  raw_data jsonb not null default '{}',
  parsed_data jsonb not null default '{}',
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

create index if not exists idx_logs_timestamp on logs(timestamp desc);
create index if not exists idx_logs_ip on logs(ip);
create index if not exists idx_logs_severity on logs(severity);
create index if not exists idx_logs_org_timestamp on logs(organization_id, timestamp desc);

create table if not exists threats (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  score int not null check (score between 0 and 100),
  source_ip inet not null,
  location text not null,
  vector text not null,
  detected_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  threat_id uuid not null references threats(id) on delete cascade,
  status text not null check (status in ('open', 'investigating', 'resolved')),
  assigned_to uuid references users(id),
  dedup_key text,
  group_key text,
  created_at timestamptz not null default now()
);

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  title text not null,
  description text not null,
  status text not null check (status in ('new', 'active', 'contained', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists incident_logs (
  incident_id uuid not null references incidents(id) on delete cascade,
  log_id uuid not null references logs(id) on delete cascade,
  primary key (incident_id, log_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  actor_user_id uuid references users(id) on delete set null,
  actor_type text not null default 'system' check (actor_type in ('user', 'system')),
  action text not null,
  resource_type text not null,
  resource_id text,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_org_created_at on audit_logs(organization_id, created_at desc);

create table if not exists detection_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  enabled boolean not null default true,
  rule_type text not null,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  key_hash text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
