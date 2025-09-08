import React, { useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const MyAttendance: React.FC = () => {
  const { state } = useApp();
  
  const myAttendance = useMemo(() => {
    if (!state.currentStudentId) return [];
    return state.attendance
      .filter(record => record.studentId === state.currentStudentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.attendance, state.currentStudentId]);

  const stats = useMemo(() => {
    const total = myAttendance.length;
    const present = myAttendance.filter(a => a.status === 'present').length;
    const late = myAttendance.filter(a => a.status === 'late').length;
    const absent = myAttendance.filter(a => a.status === 'absent').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, late, absent, attendanceRate };
  }, [myAttendance]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-emerald-600 bg-emerald-50';
      case 'late':
        return 'text-orange-600 bg-orange-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Attendance</h2>
        <p className="text-sm text-gray-600">View your attendance history</p>
      </div>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Days</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
        </div>
      </Card>

      {/* Attendance History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
        <div className="space-y-3">
          {myAttendance.length > 0 ? (
            myAttendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(record.status)}
                  <span className="font-medium text-gray-900">
                    {formatDate(record.date)}
                  </span>
                </div>
                
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                >
                  {record.status.toUpperCase()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your attendance will appear here once marked
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyAttendance;