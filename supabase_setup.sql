create table if not exists site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  category text not null default 'others',
  file_url text not null,
  file_path text not null,
  file_type text,
  created_at timestamptz default now()
);

create table if not exists donation_records (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  amount text,
  note text,
  created_at timestamptz default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_data jsonb,
  created_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

alter table site_content enable row level security;
alter table media_items enable row level security;
alter table donation_records enable row level security;
alter table analytics_events enable row level security;

drop policy if exists "Public can read site content" on site_content;
create policy "Public can read site content"
on site_content for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage site content" on site_content;
create policy "Admins can manage site content"
on site_content for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read media items" on media_items;
create policy "Public can read media items"
on media_items for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage media items" on media_items;
create policy "Admins can manage media items"
on media_items for all
to authenticated
using (true)
with check (true);

drop policy if exists "Visitors can record donation intent" on donation_records;
create policy "Visitors can record donation intent"
on donation_records for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read donation records" on donation_records;
create policy "Admins can read donation records"
on donation_records for select
to authenticated
using (true);

drop policy if exists "Visitors can create analytics events" on analytics_events;
create policy "Visitors can create analytics events"
on analytics_events for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read analytics events" on analytics_events;
create policy "Admins can read analytics events"
on analytics_events for select
to authenticated
using (true);

drop policy if exists "Public can view media files" on storage.objects;
create policy "Public can view media files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "Admins can upload media files" on storage.objects;
create policy "Admins can upload media files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media');

drop policy if exists "Admins can update media files" on storage.objects;
create policy "Admins can update media files"
on storage.objects for update
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "Admins can delete media files" on storage.objects;
create policy "Admins can delete media files"
on storage.objects for delete
to authenticated
using (bucket_id = 'media');
