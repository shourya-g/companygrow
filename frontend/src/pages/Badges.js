import React, { useEffect, useState } from 'react';
import { fetchBadges, createBadge, deleteBadge } from '../services/api';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadge, setNewBadge] = useState({ 
    name: '', 
    description: '', 
    badge_type: 'course',
    token_reward: 0,
    rarity: 'common'
  });
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState('earned'); // 'earned' or 'all'
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    loadBadges();
  }, [authUser]);

  const loadBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBadges();
      const badgeData = Array.isArray(res.data.data) ? res.data.data : [];
      
      // For now, show all badges since we don't have the user_badges endpoint
      // In a real implementation, you'd fetch user_badges for earned badges
      setAllBadges(badgeData);
      
      // Filter earned badges (this would need a proper user_badges endpoint)
      // For demo purposes, show all badges
      setBadges(badgeData);
    } catch (err) {
      setError('Failed to load badges');
      setBadges([]);
      setAllBadges([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBadge({ 
      ...newBadge, 
      [name]: name === 'token_reward' ? parseInt(value) || 0 : value 
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createBadge(newBadge);
      setNewBadge({ 
        name: '', 
        description: '', 
        badge_type: 'course',
        token_reward: 0,
        rarity: 'common'
      });
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
      setAllBadges(allBadges.filter(b => b.id !== id));
    } catch (err) {
      setError('Failed to delete badge');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Badges Report', 14, 16);
    
    const badgesToShow = viewMode === 'earned' ? badges : allBadges;
    
    doc.autoTable({
      startY: 22,
      head: [['Name', 'Type', 'Rarity', 'Token Reward']],
      body: badgesToShow.map(b => [
        b.name, 
        b.badge_type || 'N/A', 
        b.rarity || 'common',
        b.token_reward || 0
      ]),
    });
    doc.save(`${viewMode}_badges_report.pdf`);
  };

  // Only admins can create/delete badges
  const canManageBadges = authUser && authUser.role === 'admin';

  const displayBadges = viewMode === 'earned' ? badges : allBadges;

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'skill': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Badges</h1>
        <p className="text-gray-600 mt-2">
          {viewMode === 'earned' ? 'Your earned badges and achievements' : 'All available badges in the system'}
        </p>
        
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setViewMode('earned')}
            className={`px-4 py-2 rounded ${
              viewMode === 'earned' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            My Badges
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Badges
          </button>
          <button 
            onClick={handleDownloadPDF} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Only show badge creation form to admins */}
      {canManageBadges && viewMode === 'all' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Badge</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-gray-700">Name</label>
              <input 
                name="name" 
                value={newBadge.name} 
                onChange={handleInputChange} 
                required 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Badge name"
              />
            </div>
            <div>
              <label className="block text-gray-700">Type</label>
              <select 
                name="badge_type" 
                value={newBadge.badge_type} 
                onChange={handleInputChange} 
                className="border rounded px-3 py-2 w-full"
              >
                <option value="course">Course</option>
                <option value="project">Project</option>
                <option value="skill">Skill</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Rarity</label>
              <select 
                name="rarity" 
                value={newBadge.rarity} 
                onChange={handleInputChange} 
                className="border rounded px-3 py-2 w-full"
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Token Reward</label>
              <input 
                name="token_reward" 
                type="number" 
                value={newBadge.token_reward} 
                onChange={handleInputChange} 
                min="0"
                className="border rounded px-3 py-2 w-full" 
                placeholder="0"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" 
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Add Badge'}
            </button>
          </form>
          <div className="mt-4">
            <label className="block text-gray-700">Description</label>
            <textarea 
              name="description" 
              value={newBadge.description} 
              onChange={handleInputChange} 
              className="border rounded px-3 py-2 w-full" 
              rows="2"
              placeholder="Badge description and criteria"
            />
          </div>
        </div>
      )}

      {error && <div className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {displayBadges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {viewMode === 'earned' ? 'No badges earned yet.' : 'No badges available yet.'}
              </p>
              {canManageBadges && viewMode === 'all' && (
                <p className="text-gray-400">Create the first badge using the form above.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayBadges.map(badge => (
                <div key={badge.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {badge.badge_type && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(badge.badge_type)}`}>
                          {badge.badge_type}
                        </span>
                      )}
                      {badge.rarity && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                      )}
                      {badge.token_reward > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          {badge.token_reward} tokens
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {viewMode === 'earned' ? (
                      <span className="text-green-600 font-medium text-sm">✓ Earned</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Available</span>
                    )}
                    
                    {canManageBadges && viewMode === 'all' && (
                      <button 
                        onClick={() => handleDelete(badge.id)} 
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Badges;