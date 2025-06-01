import React, { useEffect, useState } from 'react';
import { fetchBadges, fetchPayments, createPayout } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';

const Rewards = () => {
  const [badges, setBadges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [allUsers, setAllUsers] = useState([]); // For admin
  const [selectedUserId, setSelectedUserId] = useState(null); // For admin

  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (authUser && authUser.id) {
      if (authUser.role === 'admin') {
        fetchAllUsers();
      }
      loadRewards(authUser.role === 'admin' && selectedUserId ? selectedUserId : authUser.id);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [authUser, selectedUserId]);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      setAllUsers(res.ok ? (await res.json()).data : []);
    } catch {
      setAllUsers([]);
    }
  };

  const loadRewards = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const badgesRes = await fetchBadges();
      setBadges(Array.isArray(badgesRes.data.data) ? badgesRes.data.data.filter(b => b.user_id === userId) : []);
      const paymentsRes = await fetchPayments();
      setPayments(Array.isArray(paymentsRes.data.data) ? paymentsRes.data.data.filter(p => p.user_id === userId) : []);
    } catch (err) {
      setError('Failed to load rewards');
    }
    setLoading(false);
  };

  // Filtering logic
  const filteredBadges = badges.filter(b => {
    const matchesName = badgeFilter ? b.name === badgeFilter : true;
    const matchesSearch = searchTerm ? b.name.toLowerCase().includes(searchTerm.toLowerCase()) || (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    return matchesName && matchesSearch;
  });
  const filteredPayments = payments.filter(p => {
    const matchesStatus = paymentStatusFilter ? p.status === paymentStatusFilter : true;
    const matchesSearch = searchTerm ? (p.amount + '').includes(searchTerm) || (p.status && p.status.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    const matchesDate = (!dateFrom || new Date(p.created_at) >= new Date(dateFrom)) && (!dateTo || new Date(p.created_at) <= new Date(dateTo));
    return matchesStatus && matchesSearch && matchesDate;
  });
  // Calculate total bonus (demo: sum of payment amounts)
  const totalBonus = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

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

  const handlePayout = async () => {
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutSuccess(null);
    try {
      if (!authUser || !authUser.id || !authUser.stripe_account_id) throw new Error('User or Stripe account not found');
      const user_id = authUser.id;
      const amount = totalBonus;
      const stripe_account_id = authUser.stripe_account_id;
      const res = await createPayout({ user_id, amount, stripe_account_id });
      setPayoutSuccess('Payout initiated! Stripe payout ID: ' + res.data.data.id);
    } catch (err) {
      setPayoutError('Failed to initiate payout: ' + (err.response?.data?.error?.message || err.message));
    }
    setPayoutLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Bonuses</h1>
        <p className="text-gray-600 mt-2">{authUser?.role === 'admin' ? 'View rewards for any user' : 'Your badge-based rewards and Stripe bonuses'}</p>
        <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-4 py-2 rounded mt-4">Download PDF Report</button>
      </div>
      {/* Admin user selector */}
      {authUser?.role === 'admin' && (
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select User:</label>
          <select value={selectedUserId || ''} onChange={e => setSelectedUserId(e.target.value)} className="border rounded px-2 py-1">
            <option value="">-- Select --</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name || u.email}</option>
            ))}
          </select>
        </div>
      )}
      {/* Search and filter controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" placeholder="Search badges/payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border px-2 py-1 rounded w-48" />
        <select value={badgeFilter} onChange={e => setBadgeFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All Badges</option>
          {[...new Set(badges.map(b => b.name))].map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All Statuses</option>
          {[...new Set(payments.map(p => p.status))].map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border px-2 py-1 rounded" />
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Earned Badges</h2>
            <ul className="flex flex-wrap gap-2 mb-4">
              {filteredBadges.length === 0 ? <li>No badges earned yet.</li> : filteredBadges.map(badge => (
                <li key={badge.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{badge.name}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Performance Bonuses (Stripe)</h2>
            <div className="text-2xl font-bold text-green-700 mb-2">${totalBonus.toFixed(2)}</div>
            <ul className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? <li>No bonuses yet.</li> : filteredPayments.map(payment => (
                <li key={payment.id} className="py-2 flex items-center justify-between">
                  <span>Bonus: ${payment.amount}</span>
                  <span className="text-gray-500 text-sm">{payment.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Stripe Payouts</h2>
            <p className="text-gray-500">(Connect your Stripe account to receive payouts.)</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" onClick={handlePayout} disabled={payoutLoading}>
              {payoutLoading ? 'Processing...' : 'Request Payout'}
            </button>
            {payoutError && <div className="text-red-600 mt-2">{payoutError}</div>}
            {payoutSuccess && <div className="text-green-600 mt-2">{payoutSuccess}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
