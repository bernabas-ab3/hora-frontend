import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiCall } from '../services/api';

export default function BarberDashboard() {
  const user = useSelector((state) => state.auth.user);

  const [services, setServices] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [servicesRes, summaryRes] = await Promise.all([
        apiCall('/services'),
        apiCall('/barber/today'),
      ]);

      setServices(servicesRes.data);
      setTodaySummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, []);

  const handleStartService = async (serviceId) => {
    try {
      const response = await apiCall('/transactions/start', {
        method: 'POST',
        body: JSON.stringify({
          service_id: serviceId,
        }),
      });

      setActiveTransaction(response.data);
    } catch (error) {
      alert('Error starting service: ' + error.message);
    }
  };

  const handleCompleteService = async () => {
    if (!activeTransaction) return;

    try {
      await apiCall(
        `/transactions/${activeTransaction.transaction_id}/complete`,
        {
          method: 'POST',
        }
      );

      setActiveTransaction(null);
      await loadData();

      alert('Service marked complete. Customer ready for payment.');
    } catch (error) {
      alert('Error completing service: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.full_name}
          </h1>

          <p className="text-gray-600 mt-1">
            Barber Dashboard
          </p>
        </div>

        {todaySummary && (
          <div className="grid grid-cols-3 gap-4 mb-6">

            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">
                Services Completed
              </p>

              <p className="text-3xl font-bold text-blue-600">
                {todaySummary.services_completed}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">
                Expected Revenue
              </p>

              <p className="text-3xl font-bold text-green-600">
                ETB {todaySummary.expected_total_revenue_etb.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">
                Pending Payment
              </p>

              <p className="text-3xl font-bold text-orange-600">
                {todaySummary.services_awaiting_payment}
              </p>
            </div>

          </div>
        )}

        {activeTransaction ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-green-500">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔄 Service In Progress
            </h2>

            <div className="bg-green-50 p-4 rounded mb-4">
              <p className="text-gray-700">
                <strong>Service:</strong>{' '}
                {activeTransaction.service_name}
              </p>

              <p className="text-gray-700">
                <strong>Price:</strong>{' '}
                ETB {activeTransaction.expected_price_etb.toFixed(2)}
              </p>

              <p className="text-gray-700 mt-2">
                <strong>Started:</strong>{' '}
                {new Date(
                  activeTransaction.service_start_time
                ).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={handleCompleteService}
              className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg text-lg"
            >
              ✓ Service Complete
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Select Service
            </h2>

            {loading ? (
              <p className="text-gray-600">
                Loading services...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {services.map((service) => (
                  <button
                    key={service.service_id}
                    onClick={() =>
                      handleStartService(service.service_id)
                    }
                    className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-left"
                  >
                    <h3 className="font-bold text-lg text-blue-900">
                      {service.name}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {service.description}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ETB {service.base_price_etb}
                      </span>

                      <span className="text-sm text-gray-600">
                        ~{service.duration_minutes} min
                      </span>
                    </div>
                  </button>
                ))}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}