import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import env from '../config';

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

export default function TripMonitoring({ tripId }: { tripId: string }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let sub: any;
    (async () => {
      const { data: initial } = await supabase.from('trip_events').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }).limit(50);
      setEvents(initial || []);
      sub = supabase
        .channel('public:trip_events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_events', filter: `trip_id=eq.${tripId}` }, (payload) => {
          setEvents((s) => [payload.new, ...s].slice(0, 200));
        })
        .subscribe();
    })();
    return () => {
      if (sub) supabase.removeChannel(sub);
    };
  }, [tripId]);

  return (
    <div>
      <h3>Live Events for {tripId}</h3>
      <ul>
        {events.map((e, i) => (
          <li key={i}>{JSON.stringify(e)}</li>
        ))}
      </ul>
    </div>
  );
}
