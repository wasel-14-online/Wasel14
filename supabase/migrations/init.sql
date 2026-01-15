-- Supabase schema migrations for Wasel

-- push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  token text NOT NULL,
  platform text,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz
);

-- emergency_alerts
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  user_id uuid,
  level text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- trip_events (for live monitoring)
CREATE TABLE IF NOT EXISTS public.trip_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL,
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- incoming_sms
CREATE TABLE IF NOT EXISTS public.incoming_sms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from text,
  to text,
  body text,
  created_at timestamptz DEFAULT now()
);
