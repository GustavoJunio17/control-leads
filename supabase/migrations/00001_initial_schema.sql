-- Supabase Initial Schema & Multi-Tenant RLS setup
-- OdontoAI SaaS Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base Plan Setup
CREATE TABLE public.plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  max_users int DEFAULT 3,
  max_leads int DEFAULT 1000,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clinics (Tenants)
CREATE TABLE public.clinics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  document text,
  phone text,
  active boolean DEFAULT true,
  plan_id uuid REFERENCES public.plans(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users to Clinics binding
CREATE TABLE public.clinic_users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id uuid, -- Relies on auth.users in standard Supabase environment
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'dentist', 'receptionist')),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(clinic_id, user_id)
);

-- AI Configuration and Agent settings
CREATE TABLE public.ai_settings (
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE PRIMARY KEY,
  assistant_name text DEFAULT 'Sofia',
  base_prompt text,
  tone text DEFAULT 'Professional and Empathetic',
  active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WAHA Multi-instances Sessions
CREATE TABLE public.whatsapp_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  session_name text NOT NULL,
  phone_number text,
  status text DEFAULT 'DISCONNECTED',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lead CRM
CREATE TABLE public.leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  funnel_stage text DEFAULT 'Novo',
  score int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  status text DEFAULT 'bot_handling' CHECK (status IN ('bot_handling', 'human_waiting', 'human_handled', 'closed')),
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  sent_by text, -- e.g. 'lead', 'bot', 'user_uuid'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clinic Offerings and Grid
CREATE TABLE public.professionals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.procedures (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes int DEFAULT 30,
  price numeric(10,2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments Engine
CREATE TABLE public.appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE,
  procedure_id uuid REFERENCES public.procedures(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Configuration (Multi-Tenant Isolation) --
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Auth Helper Function
CREATE OR REPLACE FUNCTION get_user_climics()
RETURNS setof uuid AS $$
  SELECT clinic_id FROM public.clinic_users WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Apply common Tenant RLS policy to a table dynamically via wrapper or explicitly:
-- We explicitly set the Leads policies as an example for the baseline
CREATE POLICY "Tenant view leads" 
ON public.leads FOR SELECT 
USING (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "Tenant insert leads" 
ON public.leads FOR INSERT 
WITH CHECK (clinic_id IN (SELECT get_user_climics()));

CREATE POLICY "Tenant update leads" 
ON public.leads FOR UPDATE 
USING (clinic_id IN (SELECT get_user_climics()));
