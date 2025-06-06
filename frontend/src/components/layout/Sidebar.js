import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderOpen, 
  User, 
  BarChart3,
  Award,
  Users,
  Settings,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector(state => state.auth);
  
  const getNavItems = () => {
    const baseItems = [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/courses', icon: BookOpen, label: 'Courses' },
      { to: '/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];

    // Add admin/manager specific items
    if (user && ['admin', 'manager'].includes(user.role)) {
      baseItems.splice(4, 0, 
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/project-assignments', icon: UserCheck, label: 'Assignments' }
      );
    }

    // Add admin-only items
    if (user && user.role === 'admin') {
      baseItems.push(
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/settings', icon: Settings, label: 'Settings' }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <Award className="w-8 h-8 text-primary-500" />
          <h1 className="text-xl font-bold">CompanyGrow</h1>
        </div>
        {user && (
          <div className="mt-4 text-sm text-gray-300">
            Welcome, {user.first_name}
          </div>
        )}
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Actions for Course Management */}
      {user && ['admin', 'manager'].includes(user.role) && (
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <NavLink
              to="/courses/create"
              className="flex items-center space-x-2 p-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create Course</span>
            </NavLink>
            <NavLink
              to="/analytics"
              className="flex items-center space-x-2 p-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Course Progress Summary for Students */}
      {user && !['admin', 'manager'].includes(user.role) && (
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">
            Learning Progress
          </h3>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">Courses</span>
              <span className="text-white font-medium">0/0</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              0% Complete
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;