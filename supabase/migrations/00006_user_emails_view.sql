-- View to join clinic_users with auth.users to expose emails safely to Super Admins
-- This view runs as SECURITY DEFINER to bypass schema permissions on 'auth'
CREATE OR REPLACE VIEW public.user_clinic_details AS
SELECT 
    cu.id AS association_id,
    cu.user_id,
    cu.clinic_id,
    cu.role,
    cu.created_at,
    u.email AS user_email,
    c.name AS clinic_name
FROM public.clinic_users cu
LEFT JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN public.clinics c ON cu.clinic_id = c.id;

-- Ensure only super_admins can see this data (even if security definer)
-- Actually, if we only query this via supabaseAdmin (service role), it's safe.
-- But for extra security, we can add a policy if the view is not automatically under RLS.
-- Views in Supabase are NOT RLS-enabled by default.
REVOKE ALL ON public.user_clinic_details FROM public;
REVOKE ALL ON public.user_clinic_details FROM anon;
REVOKE ALL ON public.user_clinic_details FROM authenticated;
GRANT SELECT ON public.user_clinic_details TO service_role;
