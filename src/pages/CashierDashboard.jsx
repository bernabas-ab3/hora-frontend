import { useEffect, useState } from 'react';
import { apiCall } from '../services/api';

export default function CashierDashboard() {
  const [pendingServices, setPendingServices] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'cash',
    payment_amount_etb: '',
    payment_reference: ''
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pendingRes, summaryRes] = await Promise.all([
        apiCall('/cashier/pending'),
        apiCall('/cashier/daily-summary')
      ]);
      setPendingServices(pendingRes.data);
      setDailySummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    try {
      const response = await apiCall(
        `/transactions/${selectedTransaction.transaction_id}/payment`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...paymentForm,
            payment_amount_etb: parseFloat(paymentForm.payment_amount_etb)
          })
        }
      );

      // Check if flagged
      if (response.flagged) {
        alert(`⚠️ PRICE MISMATCH!\nExpected: ETB ${response.data.expected_price_etb}\nReceived: ETB ${response.data.payment_amount_etb}`);
      } else {
        alert('Payment recorded successfully!');
      }

      setSelectedTransaction(null);
      setPaymentForm({ payment_method: 'cash', payment_amount_etb: '', payment_reference: '' });
      await loadData();
    } catch (error) {
      alert('Error recording payment: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Cashier Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Process customer payments</p>
        </div>

        {/* Daily Summary */}
        {dailySummary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Services Today</p>
              <p className="text-3xl font-bold text-blue-600">
                {dailySummary.total_services}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Cash Collected</p>
              <p className="text-3xl font-bold text-green-600">
                ETB {dailySummary.cash.actual_collected_etb.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Bank Transfers</p>
              <p className="text-3xl font-bold text-purple-600">
                ETB {dailySummary.bank_transfers.actual_total_etb.toFixed(2)}
              </p>
            </div>
            <div className={`rounded-lg shadow p-4 ${dailySummary.can_settle ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm ${dailySummary.can_settle ? 'text-green-600' : 'text-red-600'}`}>
                Settlement Status
              </p>
              <p className={`text-2xl font-bold ${dailySummary.can_settle ? 'text-green-700' : 'text-red-700'}`}>
                {dailySummary.can_settle ? '✓ Ready' : '✗ Blocked'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Pending Services List */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Payments
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : pendingServices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending payments
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingServices.map(service => (
                  <button
                    key={service.transaction_id}
                    onClick={() => {
                      setSelectedTransaction(service);
                      setPaymentForm({
                        ...paymentForm,
                        payment_amount_etb: service.expected_price_etb.toString()
                      });
                    }}
                    className={`w-full p-4 rounded-lg text-left transition border-2 ${
                      selectedTransaction?.transaction_id === service.transaction_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{service.service_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(service.service_end_time).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ETB {service.expected_price_etb}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Form */}
          {selectedTransaction && (
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Record Payment
              </h2>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Service Info */}
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-bold text-lg">
                    {selectedTransaction.service_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Expected Price</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ETB {selectedTransaction.expected_price_etb}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      payment_method: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Received (ETB)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.payment_amount_etb}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      payment_amount_etb: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                {/* Reference (for bank transfer) */}
                {paymentForm.payment_method === 'bank_transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference
                    </label>
                    <input
                      type="text"
                      value={paymentForm.payment_reference}
                      onChange={(e) => setPaymentForm({
                        ...paymentForm,
                        payment_reference: e.target.value
                      })}
                      placeholder="Telebirr/Bank reference number"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  Record Payment
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}