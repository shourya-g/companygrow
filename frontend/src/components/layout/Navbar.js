import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          {user ? (
            <>
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.first_name} {user.last_name}</span>
              </button>
              <button onClick={handleLogout} className="ml-2 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
