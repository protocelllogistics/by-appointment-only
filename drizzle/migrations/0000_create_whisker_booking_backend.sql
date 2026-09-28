CREATE TYPE public.app_role AS ENUM ('admin', 'stylist', 'front_desk');
CREATE TYPE public.booking_status AS ENUM ('booked', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'rescheduled');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  role_title text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  bay_label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.staff TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active staff" ON public.staff FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  visit_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active services" ON public.services FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.rota_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  break_starts_at time,
  break_minutes integer NOT NULL DEFAULT 45,
  published boolean NOT NULL DEFAULT true,
  UNIQUE (staff_id, weekday)
);
GRANT SELECT ON public.rota_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rota_entries TO authenticated;
GRANT ALL ON public.rota_entries TO service_role;
ALTER TABLE public.rota_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published rota" ON public.rota_entries FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage rota" ON public.rota_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.capacity_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  value_minutes integer,
  value_number integer,
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.capacity_rules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.capacity_rules TO authenticated;
GRANT ALL ON public.capacity_rules TO service_role;
ALTER TABLE public.capacity_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read rules" ON public.capacity_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk'));
CREATE POLICY "Admins manage rules" ON public.capacity_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.client_pet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  pet_name text NOT NULL,
  breed text NOT NULL,
  reliability text NOT NULL,
  risk text NOT NULL,
  extra_minutes integer NOT NULL DEFAULT 0,
  visits integer NOT NULL DEFAULT 0,
  on_time_percent integer NOT NULL DEFAULT 100,
  no_shows integer NOT NULL DEFAULT 0,
  late_cancels integer NOT NULL DEFAULT 0,
  behaviour jsonb NOT NULL DEFAULT '[]'::jsonb,
  service_failures jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_pet_profiles TO authenticated;
GRANT ALL ON public.client_pet_profiles TO service_role;
ALTER TABLE public.client_pet_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage client profiles" ON public.client_pet_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk'));

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id),
  staff_id uuid NOT NULL REFERENCES public.staff(id),
  booking_date date NOT NULL,
  starts_at time NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  status public.booking_status NOT NULL DEFAULT 'booked',
  client_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  pet_name text NOT NULL,
  breed text NOT NULL,
  notes text NOT NULL DEFAULT '',
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk'));
CREATE INDEX bookings_staff_date_idx ON public.bookings(staff_id, booking_date, starts_at);

CREATE TABLE public.booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_events TO authenticated;
GRANT ALL ON public.booking_events TO service_role;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage booking events" ON public.booking_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk'));

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  minutes integer NOT NULL CHECK (minutes > 0),
  note text NOT NULL DEFAULT '',
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage tasks" ON public.tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'stylist') OR public.has_role(auth.uid(), 'front_desk'));

CREATE OR REPLACE FUNCTION public.list_public_slots(_from date, _days integer DEFAULT 18, _service text DEFAULT 'Full style', _stylist text DEFAULT NULL)
RETURNS TABLE(slot_date date, starts_at time, staff_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH wanted_service AS (
    SELECT duration_minutes FROM public.services WHERE name = _service AND active LIMIT 1
  ), dates AS (
    SELECT d::date AS day FROM generate_series(_from, _from + greatest(1, least(_days, 30)) - 1, interval '1 day') d WHERE extract(isodow from d) < 7
  ), candidates AS (
    SELECT dates.day, r.staff_id, s.name, gs::time AS slot_time, ws.duration_minutes
    FROM dates
    JOIN public.rota_entries r ON r.weekday = extract(isodow from dates.day) AND r.published
    JOIN public.staff s ON s.id = r.staff_id AND s.active
    CROSS JOIN wanted_service ws
    CROSS JOIN LATERAL generate_series(dates.day + r.starts_at, dates.day + r.ends_at - make_interval(mins => ws.duration_minutes), interval '15 minutes') gs
    WHERE (_stylist IS NULL OR _stylist = 'Any available' OR s.name = _stylist)
      AND (r.break_starts_at IS NULL OR gs::time + make_interval(mins => ws.duration_minutes) <= r.break_starts_at OR gs::time >= r.break_starts_at + make_interval(mins => r.break_minutes))
  )
  SELECT c.day, c.slot_time, c.name FROM candidates c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.staff_id = c.staff_id AND b.booking_date = c.day
      AND b.status IN ('booked','checked_in')
      AND b.starts_at < c.slot_time + make_interval(mins => c.duration_minutes)
      AND b.starts_at + make_interval(mins => b.duration_minutes) > c.slot_time
  )
  ORDER BY c.day, c.slot_time, c.name
$$;
GRANT EXECUTE ON FUNCTION public.list_public_slots(date, integer, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_public_booking(_service text, _staff text, _date date, _starts time, _client_name text, _mobile text, _email text, _pet_name text, _breed text, _notes text DEFAULT '')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_service public.services%ROWTYPE; v_staff public.staff%ROWTYPE; v_id uuid;
BEGIN
  IF coalesce(length(trim(_client_name)),0)=0 OR coalesce(length(trim(_mobile)),0)=0 OR coalesce(length(trim(_email)),0)=0 OR coalesce(length(trim(_pet_name)),0)=0 THEN RAISE EXCEPTION 'Missing booking details'; END IF;
  SELECT * INTO v_service FROM public.services WHERE name=_service AND active;
  SELECT * INTO v_staff FROM public.staff WHERE name=_staff AND active;
  IF v_service.id IS NULL OR v_staff.id IS NULL THEN RAISE EXCEPTION 'Invalid service or stylist'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_staff.id::text || _date::text, 0));
  IF NOT EXISTS (SELECT 1 FROM public.list_public_slots(_date, 1, _service, _staff) s WHERE s.slot_date=_date AND s.starts_at=_starts AND s.staff_name=_staff) THEN RAISE EXCEPTION 'SLOT_TAKEN'; END IF;
  INSERT INTO public.bookings(service_id,staff_id,booking_date,starts_at,duration_minutes,client_name,mobile,email,pet_name,breed,notes)
  VALUES(v_service.id,v_staff.id,_date,_starts,v_service.duration_minutes,trim(_client_name),trim(_mobile),trim(_email),trim(_pet_name),_breed,coalesce(_notes,'')) RETURNING id INTO v_id;
  INSERT INTO public.booking_events(booking_id,event_type,note) VALUES(v_id,'booked_online',_service || ', ' || v_service.duration_minutes || ' min');
  RETURN v_id;
END $$;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text,text,date,time,text,text,text,text,text,text) TO anon, authenticated;