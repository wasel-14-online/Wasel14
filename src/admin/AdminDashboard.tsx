import React, { useEffect, useState } from 'react';

type Alert = { id: string; trip_id?: string; level: string; message: string; created_at: string };

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    fetch('/api/admin/alerts')
      .then((r) => r.json())
      .then(setAlerts)
      .catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Emergency Alerts</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Level</th>
              <th>Trip</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>{a.level}</td>
                <td>{a.trip_id}</td>
                <td>{a.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
