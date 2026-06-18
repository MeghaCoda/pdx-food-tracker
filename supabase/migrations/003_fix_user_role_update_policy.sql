-- ============================================================
-- 003_fix_user_role_update_policy.sql
-- Prevents users from escalating their own role via self-update.
-- The WITH CHECK ensures role cannot change unless an admin acts
-- (admins have no row-level restriction and use the service key).
-- ============================================================

drop policy "Users can update their own profile" on public.users;

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (role = (select role from public.users where id = auth.uid()));
