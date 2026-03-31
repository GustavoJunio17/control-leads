ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS registered boolean DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS registration_step int DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS birth_date text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS country text DEFAULT 'Brasil';
