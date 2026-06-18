-- Assign a RANDOM existing department to each new user on signup.
--
-- Redefines handle_new_user() (from 20260611120000_profiles.sql) so the profile
-- it creates also gets a department_id picked at random from public.departments.
-- The trigger on auth.users already points at this function, so replacing the
-- body is enough — no trigger change needed.
--
-- Requires public.departments + profiles.department_id (added in
-- 20260617140000_kudos.sql), so this migration must run after both.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, department_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    -- Random department (null if the table is empty).
    (select id from public.departments order by random() limit 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
