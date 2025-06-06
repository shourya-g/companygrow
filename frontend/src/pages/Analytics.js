import React, { useEffect, useState } from 'react';
import { fetchCourses, fetchSkills, fetchBadges, fetchProjects, analyticsAPI } from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { TrainingPerformanceChart, ProjectPerformanceChart, BadgePerformanceChart } from '../components/analytics/PerformanceCharts';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement);

const Analytics = () => {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [badges, setBadges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
    analyticsAPI.getMonthlyPerformance().then(res => {
      if (res.data.success) setMonthlyPerformance(res.data.data);
    });
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesRes = await fetchCourses();
      setCourses(coursesRes.data.data || []);
      const skillsRes = await fetchSkills();
      setSkills(skillsRes.data.data || []);
      const badgesRes = await fetchBadges();
      setBadges(badgesRes.data.data || []);
      const projectsRes = await fetchProjects();
      setProjects(projectsRes.data.data || []);
    } catch (err) {
      setError('Failed to load analytics');
    }
    setLoading(false);
  };

  // Demo chart data
  const courseData = {
    labels: courses.map(c => c.title),
    datasets: [{
      label: 'Course Duration (hrs)',
      data: courses.map(c => c.duration_hours || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    }],
  };
  const skillData = {
    labels: skills.map(s => s.name),
    datasets: [{
      label: 'Skills',
      data: skills.map(() => 1),
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
    }],
  };
  const badgeData = {
    labels: badges.map(b => b.name),
    datasets: [{
      label: 'Badges',
      data: badges.map(() => 1),
      backgroundColor: 'rgba(253, 224, 71, 0.5)',
    }],
  };
  const projectData = {
    labels: projects.map(p => p.name),
    datasets: [{
      label: 'Projects',
      data: projects.map(() => 1),
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
    }],
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Live analytics and performance visualizations</p>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Course Durations</h2>
            <Bar data={courseData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Skill Distribution</h2>
            <Pie data={skillData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Badges</h2>
            <Pie data={badgeData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Projects</h2>
            <Bar data={projectData} />
          </div>
        </div>
      )}
      {monthlyPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Training (Courses) - Last 6 Months</h2>
            <TrainingPerformanceChart data={monthlyPerformance.trainingStats} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Projects - Last 6 Months</h2>
            <ProjectPerformanceChart data={monthlyPerformance.projectStats} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-md mb-2">Badges Earned - Last 6 Months</h2>
            <BadgePerformanceChart data={monthlyPerformance.badgeStats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
