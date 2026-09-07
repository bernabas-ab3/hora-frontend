import { useEffect, useState } from 'react';
import { apiCall } from '../services/api';

const emptyReport = {
  total_services: 0,
  total_revenue_etb: 0,
  cash_total_etb: 0,
  bank_transfer_total_etb: 0,
  active_barbers: 0,
};

export default function OwnerDashboard() {
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiCall('/owner/dashboard')
      .then((response) => setReport({ ...emptyReport, ...response.data }))
      .catch((requestError) => setError(requestError.message || 'Unable to load report'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    ['Services today', report.total_services],
    ['Revenue today', `ETB ${Number(report.total_revenue_etb).toFixed(2)}`],
    ['Cash collected', `ETB ${Number(report.cash_total_etb).toFixed(2)}`],
    ['Bank transfers', `ETB ${Number(report.bank_transfer_total_etb).toFixed(2)}`],
    ['Active barbers', report.active_barbers],
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-lg bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="mt-1 text-gray-600">Today&apos;s salon performance</p>
        </header>

        {error && <p className="mb-6 rounded bg-red-50 p-4 text-red-700">{error}</p>}
        {loading ? (
          <p className="text-gray-600">Loading report...</p>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map(([label, value]) => (
              <article key={label} className="rounded-lg bg-white p-4 shadow">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="mt-2 text-2xl font-bold text-blue-700">{value}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}