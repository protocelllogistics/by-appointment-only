ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS demo_key text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS demo_key text;

INSERT INTO public.staff(name,role_title,specialties,bay_label,display_order,demo_key) VALUES
('Maya','Senior pet stylist',ARRAY['large breeds'],'Bay 1',1,'maya'),
('Tom','Pet stylist',ARRAY[]::text[],'Bay 2',2,'tom'),
('Priya','Pet stylist',ARRAY['cats too'],'Bay 3',3,'priya'),
('Sam','Collection and drop-off',ARRAY[]::text[],'Bay 4 · van',4,'sam')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.services(name,duration_minutes,visit_count,display_order,demo_key) VALUES
('Full style',120,1204,1,'full-style'),
('Bath & tidy',60,862,2,'bath-tidy'),
('Nail trim',30,1477,3,'nail-trim'),
('Puppy intro',45,213,4,'puppy-intro')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.rota_entries(staff_id,weekday,starts_at,ends_at,break_starts_at,break_minutes)
SELECT s.id, v.weekday, v.starts_at::time, v.ends_at::time, '12:00'::time, 45 FROM public.staff s JOIN (VALUES
('Maya',1,'08:30','17:30'),('Maya',2,'08:30','17:30'),('Maya',4,'08:30','17:30'),('Maya',5,'08:30','17:30'),('Maya',6,'09:00','14:00'),
('Tom',1,'09:00','17:30'),('Tom',2,'09:00','17:30'),('Tom',3,'09:00','17:30'),('Tom',5,'09:00','17:30'),('Tom',6,'09:00','14:00'),
('Priya',2,'08:30','16:00'),('Priya',3,'08:30','16:00'),('Priya',4,'08:30','16:00'),('Priya',5,'08:30','16:00'),('Priya',6,'08:30','16:00'),
('Sam',1,'08:30','17:30'),('Sam',2,'08:30','17:30'),('Sam',3,'08:30','17:30'),('Sam',4,'08:30','17:30')) v(name,weekday,starts_at,ends_at) ON s.name=v.name
ON CONFLICT (staff_id,weekday) DO NOTHING;

INSERT INTO public.capacity_rules(rule_key,value_minutes,value_number,note) VALUES
('bays',NULL,4,'A booking needs a stylist and a free bay.'),
('fixed_buffer',10,NULL,'before and after every booking'),
('overrun_buffer',20,NULL,'applied on still going'),
('travel_buffer',25,NULL,'collection and drop-off')
ON CONFLICT (rule_key) DO NOTHING;

INSERT INTO public.tasks(category,name,minutes,note) VALUES
('Health and style log','Finish Kobe’s log',5,'Pre-filled from last visit'),
('Equipment','Clean and oil clipper blades',10,'Bay 4 set'),
('Inventory','Count shampoo and conditioner',10,'Oatmeal shampoo running low'),
('Equipment','Descale the hydrobath',20,'Due this week'),
('Grooming skills','Hand scissoring practice',25,'On Sam’s plan');

INSERT INTO public.client_pet_profiles(client_name,pet_name,breed,reliability,risk,extra_minutes,visits,on_time_percent,no_shows,late_cancels,behaviour,service_failures) VALUES
('Jo Adeyemi','Luna','Cockapoo','Reliable','Medium',10,14,93,0,1,'[{"note":"Nervous of the dryer","source":"Client, at booking","adjustment":"+10 min"},{"note":"Settles after five minutes","source":"Maya, check-out","adjustment":""}]','[{"date":"12 Sep","what":"Booking clash","detail":"Rebooked 13:30 with Maya, £5 off"},{"date":"3 Jul","what":"Overran by 20 minutes","detail":"Stylist running late, client waited"}]'),
('Marcus Webb','Kobe','Mastiff','Reliable','High',15,9,100,0,0,'[{"note":"Two people needed in the bay","source":"Sam, check-out","adjustment":"+15 min"},{"note":"Pulls on the lead at drop-off","source":"Sam, check-in","adjustment":""}]','[]'),
('Ellie Grant','Pip','Poodle','Mostly reliable','Medium',5,22,81,1,2,'[{"note":"Dislikes paws being handled","source":"Tom, check-out","adjustment":"+5 min"}]','[{"date":"Today","what":"Reassigned to Priya","detail":"Luna overran on Maya’s bay"}]'),
('Dev Patel','Nova','Siberian Husky','Unreliable','High',20,6,50,2,1,'[{"note":"Heavy undercoat in spring","source":"Maya, check-out","adjustment":"+20 min"},{"note":"Vocal but gentle","source":"Priya, check-out","adjustment":""}]','[{"date":"28 Aug","what":"Booking clash","detail":"Offered 10:30 with Tom, did not rebook"}]'),
('Hana Sato','Miso','Shih Tzu','Reliable','Low',0,18,100,0,0,'[{"note":"Calm, sleeps under the dryer","source":"Priya, check-out","adjustment":""}]','[]'),
('Rosa Lind','Biscuit','Chihuahua','Mostly reliable','Low',5,11,82,0,2,'[{"note":"Snaps at nail clippers","source":"Tom, check-out","adjustment":"+5 min"}]','[{"date":"14 Jun","what":"Calendar sync gap","detail":"Clash sent on WhatsApp, rebooked next day"}]');

INSERT INTO public.bookings(service_id,staff_id,booking_date,starts_at,duration_minutes,status,client_name,mobile,email,pet_name,breed,notes,checked_in_at,checked_out_at)
SELECT sv.id, st.id, DATE '2026-09-25', v.starts_at::time, v.duration, v.status::public.booking_status, v.client, '07700 900000', 'demo@example.com', v.pet, v.breed, '',
CASE WHEN v.in_at IS NULL THEN NULL ELSE timestamptz '2026-09-25 00:00:00+01' + v.in_at::time END,
CASE WHEN v.out_at IS NULL THEN NULL ELSE timestamptz '2026-09-25 00:00:00+01' + v.out_at::time END
FROM (VALUES
('Nail trim','Tom','09:00',45,'checked_out','Rosa Lind','Biscuit','Chihuahua','08:58','09:40'),
('Full style','Priya','09:15',60,'checked_out','Hana Sato','Miso','Shih Tzu','09:12','10:14'),
('Full style','Sam','09:30',120,'checked_out','Marcus Webb','Kobe','Mastiff','09:31','11:44'),
('Full style','Maya','11:00',75,'checked_in','Jo Adeyemi','Luna','Cockapoo','11:02',NULL),
('Full style','Priya','11:15',105,'checked_in','Dev Patel','Nova','Siberian Husky','11:21',NULL),
('Bath & tidy','Sam','11:50',60,'booked','Tara Quinn','Rex','Spaniel',NULL,NULL),
('Full style','Tom','12:10',90,'booked','Ellie Grant','Pip','Poodle',NULL,NULL),
('Full style','Maya','13:30',90,'booked','Chris Moreno','Pepper','Poodle',NULL,NULL),
('Bath & tidy','Tom','14:15',60,'booked','Amir Haddad','Bella','Spaniel',NULL,NULL),
('Full style','Priya','15:00',75,'booked','Lena Brooks','Otis','Cockapoo',NULL,NULL)
) v(service,staff,starts_at,duration,status,client,pet,breed,in_at,out_at)
JOIN public.services sv ON sv.name=v.service JOIN public.staff st ON st.name=v.staff;