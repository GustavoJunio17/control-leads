CREATE TABLE public.professional_schedules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Seg, ..., 6=Sáb
  start_time time NOT NULL,
  end_time time NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(professional_id, day_of_week)
);

ALTER TABLE public.professional_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_users_manage_schedules" ON public.professional_schedules
  USING (
    professional_id IN (
      SELECT id FROM public.professionals
      WHERE clinic_id IN (SELECT clinic_id FROM public.clinic_users WHERE user_id = auth.uid())
    )
  );
