import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import env from '../config';

type Trip = {
  id: string;
  status: string;
  rider?: any;
  driver?: any;
  route?: any;
};

export default function TripDetails() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    fetch(`/api/trips/${encodeURIComponent(tripId)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch trip');
        return r.json();
      })
      .then((data) => setTrip(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <div>Loading trip...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!trip) return <div>Trip not found</div>;

  return (
    <div>
      <h2>Trip {trip.id}</h2>
      <p>Status: {trip.status}</p>
      <pre>{JSON.stringify(trip, null, 2)}</pre>
    </div>
  );
}
