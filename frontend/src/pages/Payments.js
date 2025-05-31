import React, { useEffect, useState } from 'react';
import { fetchPayments } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPayments();
      setPayments(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load payments');
      setPayments([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">All payment transactions are listed below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <li key={payment.id} className="py-4">
                    <div className="font-semibold text-lg">Payment ID: {payment.id}</div>
                    <div className="text-gray-600">Amount: {payment.amount} | Status: {payment.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
