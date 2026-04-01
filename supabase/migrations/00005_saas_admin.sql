-- 0. Security Definer helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Update the role check constraint on clinic_users
ALTER TABLE public.clinic_users DROP CONSTRAINT IF EXISTS clinic_users_role_check;
ALTER TABLE public.clinic_users ADD CONSTRAINT clinic_users_role_check 
CHECK (role IN ('admin', 'dentist', 'receptionist', 'super_admin', 'user'));

-- 2. Update clinics RLS to allow super_admin to see everything
DROP POLICY IF EXISTS "SuperAdmin or User can read clinic" ON public.clinics;
CREATE POLICY "SuperAdmin or User can read clinic" 
ON public.clinics FOR SELECT 
USING (
  id IN (SELECT get_user_climics()) OR is_super_admin()
);

-- 3. Update clinic_users RLS
DROP POLICY IF EXISTS "User can read own clinic user binding" ON public.clinic_users;
DROP POLICY IF EXISTS "SuperAdmin or User can read clinic_users" ON public.clinic_users;
CREATE POLICY "SuperAdmin or User can read clinic_users" 
ON public.clinic_users FOR SELECT 
USING (
  user_id = auth.uid() OR is_super_admin()
);

-- 4. Allow SuperAdmin to INSERT into clinics
DROP POLICY IF EXISTS "SuperAdmin can insert clinics" ON public.clinics;
CREATE POLICY "SuperAdmin can insert clinics" 
ON public.clinics FOR INSERT 
WITH CHECK (is_super_admin());

-- 5. Allow SuperAdmin to manage associations
DROP POLICY IF EXISTS "SuperAdmin can manage clinic_users" ON public.clinic_users;
CREATE POLICY "SuperAdmin can manage clinic_users" 
ON public.clinic_users FOR ALL 
USING (is_super_admin());
