import React from 'react';
import { Shield, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();

  const toggleRole = () => {
    const newRole = state.role === 'warden' ? 'student' : 'warden';
    dispatch({ type: 'SET_ROLE', payload: newRole });
    
    if (newRole === 'student' && state.students.length > 0) {
      dispatch({ type: 'SET_CURRENT_STUDENT', payload: state.students[0].id });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          {state.role === 'warden' ? (
            <Shield className="w-6 h-6 text-blue-600" />
          ) : (
            <User className="w-6 h-6 text-emerald-600" />
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {state.role === 'warden' ? 'Qavat Sardori' : 'Talaba'}
          </h1>
        </div>
        
        <button
          onClick={toggleRole}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="text-sm font-medium">
            {state.role === 'warden' ? 'Warden' : 'Student'}
          </span>
          <div className="w-2 h-2 rounded-full bg-current" />
        </button>
      </div>
    </header>
  );
};

export default Header;