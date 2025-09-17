import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, Calendar, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: number;
  student: {
    id: number;
    name: string;
    last_name: string;
  };
  status: string;
}

interface Room {
  room_id: number;
  room_name: string;
  students: Student[];
}

interface AttendanceSession {
  id: number;
  date: string;
  floor: {
    id: number;
    name: string;
  };
  leader: {
    id: number;
    floor: string;
    user: string;
  };
  rooms: Room[];
}

const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance sessions
  const fetchAttendanceSessions = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        return;
      }

      const response = await fetch('https://joyboryangi.pythonanywhere.com/attendance-sessions/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`Davomat sessiyalarini olishda xatolik: ${response.status}`);
      }

      const result = await response.json();
      const sessions = Array.isArray(result) ? result : [];
      
      // Sort by date (most recent first)
      const sortedSessions = sessions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setAttendanceSessions(sortedSessions);

    } catch (err) {
      console.error('Error fetching attendance sessions:', err);
      setAttendanceSessions([]);
      setError('Davomat sessiyalarini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Load attendance sessions on component mount
  useEffect(() => {
    fetchAttendanceSessions();
  }, []);

  // Get status statistics for session (updated for 2 statuses only)
  const getSessionStats = (session: AttendanceSession) => {
    let present = 0, absent = 0;

    session.rooms.forEach(room => {
      room.students.forEach(student => {
        if (student.status === 'Hozir' || student.status === 'in') {
          present++;
        } else if (student.status === 'Yo\'q' || student.status === 'out') {
          absent++;
        }
        // Remove 'Kech' status completely
      });
    });

    const total = session.rooms.reduce((sum, room) => sum + room.students.length, 0);
    return { present, absent, total };
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Bugun';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Kecha';
    } else {
      return formatDate(dateString);
    }
  };

  const handleSessionClick = (session: AttendanceSession) => {
    console.log('Session clicked:', session.id);
    navigate(`/attendance/${session.id}`);
  };

  const handleCreateNew = () => {
    navigate('/attendance/new');
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Davomat Tarixi</h2>
          <p className="text-sm text-gray-600">Olingan davomatlar ro'yxati</p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="w-full sm:w-auto"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Yangi Davomat
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Davomatlar yuklanmoqda...</p>
        </div>
      )}

      {/* Attendance Sessions List */}
      {!isLoading && (
        <div className="space-y-3">
          {attendanceSessions.length > 0 ? (
            attendanceSessions.map((session) => {
              const stats = getSessionStats(session);
              const displayDate = formatDisplayDate(session.date);

              return (
                <Card 
                  key={session.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {displayDate}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {session.floor.name} • {formatDate(session.date)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {stats.present}/{stats.total}
                          </p>
                          <p className="text-xs text-gray-600">
                            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Statistics - Updated for 2 statuses only */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-emerald-600">{stats.present}</p>
                        <p className="text-xs text-emerald-700">Bor (In)</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                        <p className="text-xs text-red-700">Yo'q (Out)</p>
                      </div>
                    </div>

                    {/* Quick room summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        {session.rooms.length} ta xona • {session.rooms.reduce((sum, room) => sum + room.students.length, 0)} ta talaba
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="text-center py-12">
              <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Davomatlar yo'q</h3>
              <p className="text-gray-600 mb-6">
                Hali hech qanday davomat olinmagan
              </p>
              <Button
                onClick={handleCreateNew}
                className="mx-auto"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Birinchi Davomatni Boshlash
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
