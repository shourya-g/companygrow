import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchSkills, fetchCourses, fetchBadges } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetchUsers();
      setUser(usersRes.data.data[0] || null);
      const skillsRes = await fetchSkills();
      setSkills(skillsRes.data.data || []);
      const coursesRes = await fetchCourses();
      setCourses(coursesRes.data.data || []);
      const badgesRes = await fetchBadges();
      setBadges(badgesRes.data.data || []);
    } catch (err) {
      setError('Failed to load profile');
    }
    setLoading(false);
  };

  const courseProgress = courses.length ? Math.round((courses.filter(c => c.completed).length / courses.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Your skills, training, and achievements</p>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            <div className="font-semibold text-lg">{user.name || user.username || user.email}</div>
            <div className="text-gray-600">{user.email}</div>
            <div className="text-gray-500">Experience: {user.experience || 'N/A'}</div>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Skills</h2>
            <ul className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <li key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill.name}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Training Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${courseProgress}%` }}></div>
            </div>
            <div className="text-sm text-gray-600">{courseProgress}% of courses completed</div>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-md mb-2">Badges</h2>
            <ul className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <li key={badge.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{badge.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>No user found.</div>
      )}
    </div>
  );
};

export default Profile;
