import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications();
      setNotifications(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load notifications');
      setNotifications([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Your notifications are listed below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <li key={notification.id} className="py-4">
                    <div className="font-semibold text-lg">{notification.title || notification.type}</div>
                    <div className="text-gray-600">{notification.message}</div>
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

export default Notifications;
