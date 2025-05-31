import React, { useEffect, useState } from 'react';
import { fetchBadges, fetchPayments } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Rewards = () => {
  const [badges, setBadges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const badgesRes = await fetchBadges();
      setBadges(Array.isArray(badgesRes.data.data) ? badgesRes.data.data : []);
      const paymentsRes = await fetchPayments();
      setPayments(Array.isArray(paymentsRes.data.data) ? paymentsRes.data.data : []);
    } catch (err) {
      setError('Failed to load rewards');
    }
    setLoading(false);
  };

  // Calculate total bonus (demo: sum of payment amounts)
  const totalBonus = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Rewards & Bonuses Report', 14, 16);
    doc.autoTable({
      startY: 22,
      head: [['Badge Name', 'Description']],
      body: badges.map(b => [b.name, b.description]),
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Bonus Amount', 'Status', 'Date']],
      body: payments.map(p => [p.amount, p.status, p.created_at]),
    });
    doc.save('rewards_report.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Bonuses</h1>
        <p className="text-gray-600 mt-2">Your badge-based rewards and Stripe bonuses</p>
        <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-4 py-2 rounded mt-4">Download PDF Report</button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Earned Badges</h2>
            <ul className="flex flex-wrap gap-2 mb-4">
              {badges.length === 0 ? <li>No badges earned yet.</li> : badges.map(badge => (
                <li key={badge.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{badge.name}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Performance Bonuses (Stripe)</h2>
            <div className="text-2xl font-bold text-green-700 mb-2">${totalBonus.toFixed(2)}</div>
            <ul className="divide-y divide-gray-200">
              {payments.length === 0 ? <li>No bonuses yet.</li> : payments.map(payment => (
                <li key={payment.id} className="py-2 flex items-center justify-between">
                  <span>Bonus: ${payment.amount}</span>
                  <span className="text-gray-500 text-sm">{payment.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Stripe Payouts</h2>
            <p className="text-gray-500">(Stripe payout integration goes here. Connect to backend for real payouts.)</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled>Request Payout (Demo)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
