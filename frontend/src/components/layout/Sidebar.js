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
  UserCheck,
  Plus
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useSelector(state => state.auth);
  
  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/courses', icon: BookOpen, label: 'Courses' },
      { to: '/my-enrollments', icon: Award, label: 'My Learning' },
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
    <>
      {/* Modern Hover Sidebar */}
      <div className="nav__cont">
        {/* Brand Section */}
        <div className="nav__brand">
          <div className="nav__brand-icon">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="nav__brand-text">
            <h1 className="text-xl font-bold text-white">CompanyGrow</h1>
            {user && (
              <div className="text-sm text-gray-300 mt-1">
                {user.first_name} ({user.role})
              </div>
            )}
          </div>
        </div>

                 {/* Navigation */}
         <ul className="nav">
           {navItems.map((item, index) => (
             <li key={item.to} className="nav__items" data-tooltip={item.label}>
               <NavLink
                 to={item.to}
                 className={({ isActive }) =>
                   `nav__link ${isActive ? 'nav__link--active' : ''}`
                 }
               >
                 <item.icon className="nav__icon" />
                 <span className="nav__text">{item.label}</span>
               </NavLink>
             </li>
           ))}
          
                     {/* Quick Actions for Course Management */}
           {user && ['admin', 'manager'].includes(user.role) && (
             <li className="nav__items nav__items--separator" data-tooltip="Create Course">
               <NavLink
                 to="/courses/create"
                 className="nav__link nav__link--action"
               >
                 <Plus className="nav__icon" />
                 <span className="nav__text">Create Course</span>
               </NavLink>
             </li>
           )}
        </ul>
             </div>
    </>
  );
};

export default Sidebar;