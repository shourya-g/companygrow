import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers();
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError('Failed to load users');
      setUsers([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createUser(newUser);
      setNewUser({ name: '', email: '' });
      loadUsers();
    } catch (err) {
      setError('Failed to create user');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError(null);
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Browse and manage users below.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-700">Name</label>
            <input name="name" value={newUser.name} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Email</label>
            <input name="email" value={newUser.email} onChange={handleInputChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={creating}>
            {creating ? 'Creating...' : 'Add User'}
          </button>
        </form>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{user.name || user.username || user.email}</div>
                    <div className="text-gray-600">{user.email}</div>
                  </div>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
