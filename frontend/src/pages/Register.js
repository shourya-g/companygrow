import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { fetchRegister } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRegister(form);
      dispatch(loginSuccess(res.data));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      <div className="mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
      </div>
    </div>
  );
};

export default Register;
