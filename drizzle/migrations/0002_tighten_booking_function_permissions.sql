REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.list_public_slots(date, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_slots(date, integer, text, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_public_booking(text, text, date, time, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text, text, date, time, text, text, text, text, text, text) TO anon, authenticated, service_role;