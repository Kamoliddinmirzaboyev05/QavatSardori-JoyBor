import React, { useState } from 'react';
import { Shield, User, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const toggleRole = () => {
    const newRole = state.role === 'qavat_sardori' ? 'talaba' : 'qavat_sardori';
    dispatch({ type: 'SET_ROLE', payload: newRole });
    
    if (newRole === 'talaba' && state.students.length > 0) {
      const activeStudents = state.students.filter(s => !s.isDeleted);
      if (activeStudents.length > 0) {
        dispatch({ type: 'SET_CURRENT_STUDENT', payload: activeStudents[0].id });
      }
    }
  };

  const selectStudent = (studentId: string) => {
    dispatch({ type: 'SET_CURRENT_STUDENT', payload: studentId });
    setShowStudentSelector(false);
  };

  const currentStudent = state.students.find(s => s.id === state.currentStudentId);
  const activeStudents = state.students.filter(s => !s.isDeleted);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/logoicon.svg" 
            alt="Qavat Sardori Logo" 
            className="w-8 h-8"
          />
          <div className="flex items-center space-x-2">
            {state.role === 'qavat_sardori' ? (
              <Shield className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-emerald-600" />
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {state.role === 'qavat_sardori' ? 'Qavat Sardori' : 'Talaba Paneli'}
              </h1>
              {state.role === 'talaba' && currentStudent && (
                <p className="text-sm text-gray-600">{currentStudent.name} - {currentStudent.room}-xona</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {state.role === 'talaba' && activeStudents.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowStudentSelector(!showStudentSelector)}
                className="flex items-center space-x-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <span className="text-sm font-medium">Talaba</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showStudentSelector && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Talaba tanlang:</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {activeStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => selectStudent(student.id)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                          student.id === state.currentStudentId ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.room}-xona</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={toggleRole}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm font-medium">
              {state.role === 'qavat_sardori' ? 'Sardor' : 'Talaba'}
            </span>
            <div className="w-2 h-2 rounded-full bg-current" />
          </button>
        </div>
      </div>
      
      {/* Overlay to close student selector */}
      {showStudentSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowStudentSelector(false)}
        />
      )}
    </header>
  );
};

export default Header;