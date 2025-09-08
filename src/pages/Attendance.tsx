import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { getCurrentDate, formatDate } from '../utils/storage';
import { clsx } from 'clsx';

const Attendance: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  const todayAttendance = useMemo(() => {
    return state.attendance.filter(record => record.date === selectedDate);
  }, [state.attendance, selectedDate]);

  const getStudentAttendance = (studentId: string) => {
    return todayAttendance.find(record => record.studentId === studentId);
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const existingRecord = getStudentAttendance(studentId);
    
    if (existingRecord) {
      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: { ...existingRecord, status }
      });
    } else {
      dispatch({
        type: 'ADD_ATTENDANCE',
        payload: {
          studentId,
          date: selectedDate,
          status
        }
      });
    }
  };

  const getStatusStats = () => {
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const total = activeStudents.length;
    const unmarked = total - present - absent - late;
    
    return { present, absent, late, unmarked, total };
  };

  const stats = getStatusStats();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-600">Mark daily attendance</p>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getCurrentDate()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </Card>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statistics for {formatDate(selectedDate)}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-xl font-bold text-orange-600">{stats.late}</p>
            <p className="text-sm text-gray-600">Late</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-600">{stats.unmarked}</p>
            <p className="text-sm text-gray-600">Unmarked</p>
          </div>
        </div>
        
        {stats.total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((stats.present / stats.total) * 100)}%
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Student List */}
      <div className="space-y-3">
        {activeStudents.length > 0 ? (
          activeStudents.map((student) => {
            const attendance = getStudentAttendance(student.id);
            
            return (
              <Card key={student.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">Room {student.room}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={attendance?.status === 'present' ? 'success' : 'secondary'}
                    className={clsx(
                      "flex-1",
                      attendance?.status === 'present' && "ring-2 ring-emerald-200"
                    )}
                    onClick={() => markAttendance(student.id, 'present')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Present
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={attendance?.status === 'late' ? 'warning' : 'secondary'}
                    className={clsx(
                      "flex-1",
                      attendance?.status === 'late' && "ring-2 ring-orange-200"
                    )}
                    onClick={() => markAttendance(student.id, 'late')}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Late
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={attendance?.status === 'absent' ? 'danger' : 'secondary'}
                    className={clsx(
                      "flex-1",
                      attendance?.status === 'absent' && "ring-2 ring-red-200"
                    )}
                    onClick={() => markAttendance(student.id, 'absent')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Absent
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-500">No students available for attendance</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Attendance;