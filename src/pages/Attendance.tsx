import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';

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

const Attendance: React.FC = () => {
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Set<number>>(new Set());

  // Update student status in session (only local state)
  const updateStudentStatus = (sessionId: number, studentId: number, status: string) => {
    // Update local state immediately for better UX
    setAttendanceSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
            ...session,
            rooms: session.rooms.map(room => ({
              ...room,
              students: room.students.map(student =>
                student.id === studentId
                  ? { ...student, status }
                  : student
              )
            }))
          }
          : session
      )
    );

    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Mark session as having unsaved changes
    setHasUnsavedChanges(prev => new Set(prev).add(sessionId));
  };

  // Bulk update attendance records
  const bulkUpdateAttendance = async (sessionId: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token topilmadi');
      }

      // Find the session to get current data
      const session = attendanceSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Sessiya topilmadi');
      }

      // Prepare records array for API
      const records: any[] = [];

      session.rooms.forEach(room => {
        room.students.forEach(student => {
          records.push({
            id: student.id,
            student_id: student.student.id,
            status: student.status
          });
        });
      });

      const response = await fetch(`https://joyboryangi.pythonanywhere.com/attendance-records/${sessionId}/bulk-update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: records
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`Davomat yangilashda xatolik: ${response.status}`);
      }

      const result = await response.json();
      console.log('Attendance updated successfully:', result);

      // Show success message
      setError(null);
      setSuccessMessage('Davomat muvaffaqiyatli saqlandi!');
      
      // Clear unsaved changes for this session
      setHasUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Error bulk updating attendance:', err);
      setError(err instanceof Error ? err.message : 'Davomat yangilashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  // Create attendance session
  const createAttendanceSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token topilmadi');
      }

      const response = await fetch('https://joyboryangi.pythonanywhere.com/attendance-sessions/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {}
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`Davomat sessiyasini yaratishda xatolik: ${response.status}`);
      }

      const result = await response.json();
      console.log('Attendance session created:', result);

      // Refresh attendance sessions
      await fetchAttendanceSessions();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance sessions
  const fetchAttendanceSessions = async () => {
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
      setAttendanceSessions(Array.isArray(result) ? result : []);

    } catch (err) {
      console.error('Error fetching attendance sessions:', err);
      setAttendanceSessions([]);
    }
  };

  // Load attendance sessions on component mount
  useEffect(() => {
    fetchAttendanceSessions();
  }, []);

  // Get status statistics for selected session
  const getSessionStats = (session: AttendanceSession) => {
    let present = 0, absent = 0, late = 0;

    session.rooms.forEach(room => {
      room.students.forEach(student => {
        if (student.status === 'Hozir') present++;
        else if (student.status === 'Yo\'q') absent++;
        else if (student.status === 'Kech') late++;
      });
    });

    const total = session.rooms.reduce((sum, room) => sum + room.students.length, 0);
    return { present, absent, late, total };
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Davomat</h2>
          <p className="text-sm text-gray-600">Kunlik davomatni belgilash</p>
        </div>
        <Button
          onClick={createAttendanceSession}
          disabled={isLoading}
        >
          {isLoading ? 'Yaratilmoqda...' : 'Davomat Olish'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-600">{successMessage}</p>
        </div>
      )}

      {/* Attendance Sessions List */}
      <div className="space-y-4">
        {attendanceSessions.length > 0 ? (
          attendanceSessions.map((session) => {
            const stats = getSessionStats(session);
            const isSelected = selectedSession?.id === session.id;

            return (
              <Card key={session.id}>
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedSession(isSelected ? null : session)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Davomat Sessiyasi #{session.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(session.date)} • {session.floor.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {stats.present}/{stats.total}
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% hozir
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{stats.present}</p>
                      <p className="text-xs text-gray-600">Hozir</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-lg font-bold text-orange-600">{stats.late}</p>
                      <p className="text-xs text-gray-600">Kech</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                      <p className="text-xs text-gray-600">Yo'q</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Room Details */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Xonalar bo'yicha davomat</h4>
                    <div className="space-y-4">
                      {session.rooms.map((room) => (
                        <div key={room.room_id} className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-2">{room.room_name}</h5>
                          <div className="space-y-2">
                            {room.students.map((student) => (
                              <div key={student.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {student.student.name} {student.student.last_name}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => updateStudentStatus(session.id, student.id, 'Hozir')}
                                    className={clsx(
                                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                                      student.status === 'Hozir'
                                        ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                                    )}
                                  >
                                    Hozir
                                  </button>
                                  <button
                                    onClick={() => updateStudentStatus(session.id, student.id, 'Kech')}
                                    className={clsx(
                                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                                      student.status === 'Kech'
                                        ? "bg-orange-100 text-orange-800 ring-2 ring-orange-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                                    )}
                                  >
                                    Kech
                                  </button>
                                  <button
                                    onClick={() => updateStudentStatus(session.id, student.id, 'Yo\'q')}
                                    className={clsx(
                                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                                      student.status === 'Yo\'q'
                                        ? "bg-red-100 text-red-800 ring-2 ring-red-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-red-50"
                                    )}
                                  >
                                    Yo'q
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Save Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        {hasUnsavedChanges.has(session.id) && (
                          <div className="flex items-center text-orange-600">
                            <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                            <span className="text-sm">Saqlanmagan o'zgarishlar</span>
                          </div>
                        )}
                        <div className="flex-1"></div>
                        <Button
                          onClick={() => bulkUpdateAttendance(session.id)}
                          disabled={isSaving || !hasUnsavedChanges.has(session.id)}
                          variant="success"
                        >
                          {isSaving ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Davomat sessiyalari yo'q</p>
            <p className="text-sm text-gray-400 mt-1">
              Davomat olish tugmasini bosib yangi sessiya yarating
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Attendance;