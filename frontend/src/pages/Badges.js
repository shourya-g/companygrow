import React, { useEffect, useState } from 'react';
import { fetchBadges, createBadge, deleteBadge } from '../services/api';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadge, setNewBadge] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    loadBadges();
  }, [authUser]);

  const loadBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBadges();
      let filtered = Array.isArray(res.data.data) ? res.data.data : [];
      if (authUser && authUser.id) {
        filtered = filtered.filter(b => b.user_id === authUser.id);
      }
      setBadges(filtered);
    } catch (err) {
      setError('Failed to load badges');
      setBadges([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setNewBadge({ ...newBadge, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createBadge({ ...newBadge, user_id: authUser?.id });
      setNewBadge({ name: '', description: '' });
      loadBadges();
    } catch (err) {
      setError('Failed to create badge');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this badge?')) return;
    setError(null);
    try {
      await deleteBadge(id);
      setBadges(badges.filter(b => b.id !== id));
    } catch (err) {
      setError('Failed to delete badge');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Badges Report', 14, 16);
    doc.autoTable({
      startY: 22,
      head: [['ID', 'Name', 'Description']],
      body: badges.map(b => [b.id, b.name, b.description]),
    });
    doc.save('badges_report.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Badges</h1>
        <p className="text-gray-600 mt-2">Browse and manage badges below.</p>
        <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
          Download PDF Report
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700">Name</label>
            <input name="name" value={newBadge.name} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Description</label>
            <input name="description" value={newBadge.description} onChange={handleInputChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? 'Creating...' : 'Add Badge'}
          </button>
        </form>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {badges.length === 0 ? (
            <p className="text-gray-500">No badges found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {badges.map(badge => (
                <li key={badge.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{badge.name}</div>
                    <div className="text-gray-600">{badge.description}</div>
                  </div>
                  <button onClick={() => handleDelete(badge.id)} className="text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Badges;
