-- Load order step 1 (System specification §4.3). Columns copied from the seed CSV headers.
CREATE TABLE public.rota (
  staff_id text NOT NULL,
  weekday text NOT NULL,
  working text NOT NULL CHECK (working IN ('Y','N')),
  start time,
  "end" time,
  break_start time,
  break_min integer,
  PRIMARY KEY (staff_id, weekday)
);
CREATE TABLE public.rota_exceptions (
  date date NOT NULL,
  staff_id text NOT NULL,
  type text NOT NULL,
  start time,
  "end" time,
  note text,
  PRIMARY KEY (date, staff_id)
);
CREATE TABLE public.staff_shifts (
  date date NOT NULL,
  staff_id text NOT NULL,
  rota_start time,
  rota_end time,
  clock_in time,
  late_min integer,
  status text NOT NULL,
  reason text,
  PRIMARY KEY (date, staff_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rota, public.rota_exceptions, public.staff_shifts TO authenticated;
GRANT ALL ON public.rota, public.rota_exceptions, public.staff_shifts TO service_role;
ALTER TABLE public.rota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read rota" ON public.rota FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'stylist') OR public.has_role(auth.uid(),'front_desk'));
CREATE POLICY "Admins write rota" ON public.rota FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff read rota exceptions" ON public.rota_exceptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'stylist') OR public.has_role(auth.uid(),'front_desk'));
CREATE POLICY "Admins write rota exceptions" ON public.rota_exceptions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff read shifts" ON public.staff_shifts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'stylist') OR public.has_role(auth.uid(),'front_desk'));
CREATE POLICY "Admins write shifts" ON public.staff_shifts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));