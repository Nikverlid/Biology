create table biology.game_rosters (
 class text primary key check (class in ('5А','5Б')),
 names jsonb not null default '[]'::jsonb check(jsonb_typeof(names)='array' and jsonb_array_length(names)<=20),
 updated_by uuid references biology.accounts(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table biology.game_rosters enable row level security;
revoke all on biology.game_rosters from public,anon,authenticated;
