ALTER TABLE public.rota_exceptions
  ADD CONSTRAINT rota_exceptions_date_staff_type_key UNIQUE (date, staff_id, type);

ALTER TABLE public.staff_shifts
  ADD CONSTRAINT staff_shifts_date_staff_key UNIQUE (date, staff_id);

COMMENT ON CONSTRAINT rota_exceptions_date_staff_type_key ON public.rota_exceptions IS 'Canonical CSV record key for idempotent imports.';
COMMENT ON CONSTRAINT staff_shifts_date_staff_key ON public.staff_shifts IS 'Canonical CSV record key for idempotent imports.';