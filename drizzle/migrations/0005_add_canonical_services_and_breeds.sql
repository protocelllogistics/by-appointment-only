ALTER TABLE public.services ADD COLUMN IF NOT EXISTS service_id text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS standard_min integer;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS client_about text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS species text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS rule text;
ALTER TABLE public.services ADD CONSTRAINT services_service_id_key UNIQUE (service_id);

CREATE TABLE public.service_sop (
  service_id text NOT NULL,
  step integer NOT NULL,
  instruction text NOT NULL,
  PRIMARY KEY (service_id, step),
  CONSTRAINT service_sop_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_sop TO authenticated;
GRANT ALL ON public.service_sop TO service_role;
ALTER TABLE public.service_sop ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read service SOP" ON public.service_sop FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'stylist'::public.app_role) OR public.has_role(auth.uid(), 'front_desk'::public.app_role));
CREATE POLICY "Admins manage service SOP" ON public.service_sop FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.service_inventory (
  service_id text NOT NULL,
  item text NOT NULL,
  qty_per_visit text NOT NULL,
  PRIMARY KEY (service_id, item),
  CONSTRAINT service_inventory_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_inventory TO authenticated;
GRANT ALL ON public.service_inventory TO service_role;
ALTER TABLE public.service_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read service inventory" ON public.service_inventory FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'stylist'::public.app_role) OR public.has_role(auth.uid(), 'front_desk'::public.app_role));
CREATE POLICY "Admins manage service inventory" ON public.service_inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.service_staff (
  service_id text NOT NULL,
  staff_id text NOT NULL,
  qualified text NOT NULL,
  PRIMARY KEY (service_id, staff_id),
  CONSTRAINT service_staff_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id),
  CONSTRAINT service_staff_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_staff TO authenticated;
GRANT ALL ON public.service_staff TO service_role;
ALTER TABLE public.service_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read service qualifications" ON public.service_staff FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'stylist'::public.app_role) OR public.has_role(auth.uid(), 'front_desk'::public.app_role));
CREATE POLICY "Admins manage service qualifications" ON public.service_staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.breeds (
  breed_id text PRIMARY KEY,
  name text NOT NULL,
  species text NOT NULL,
  size text NOT NULL,
  prior_full_style_min integer NOT NULL,
  prior_risk text NOT NULL,
  "adj_S1" integer,
  "adj_S2" integer,
  "adj_S3" integer,
  "adj_S4" integer
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeds TO authenticated;
GRANT ALL ON public.breeds TO service_role;
ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read breeds" ON public.breeds FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'stylist'::public.app_role) OR public.has_role(auth.uid(), 'front_desk'::public.app_role));
CREATE POLICY "Admins manage breeds" ON public.breeds FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));