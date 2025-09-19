import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, Save, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'sonner';

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

const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update student status in session (only local state)
  const updateStudentStatus = (studentId: number, status: string) => {
    if (!attendanceSession) return;

    // Update local state immediately for better UX
    setAttendanceSession(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        rooms: prev.rooms.map(room => ({
          ...room,
          students: room.students.map(student =>
            student.id === studentId
              ? { ...student, status }
              : student
          )
        }))
      };
    });

    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Mark session as having unsaved changes
    setHasUnsavedChanges(true);
  };

  // Save attendance changes using the correct PATCH API
  const saveAttendance = async () => {
    if (!attendanceSession) return;

    setIsSaving(true);
    setError(null);

    try {
      // Prepare records array for API according to the Swagger documentation
      const records: any[] = [];

      attendanceSession.rooms.forEach(room => {
        room.students.forEach(student => {
          let apiStatus = '';
          if (
            student.status === 'Hozir' ||
            student.status === 'Bor' ||
            student.status === 'In' ||
            student.status === 'in'
          ) {
            apiStatus = 'in';
          } else if (
            student.status === "Yo'q" ||
            student.status === 'Out' ||
            student.status === 'out'
          ) {
            apiStatus = 'out';
          }

          if (apiStatus) {
            records.push({
              id: student.id,
              student_id: student.student.id,
              status: apiStatus
            });
          }
        });
      });

      // console.debug('Sending attendance data to API:', { records });
      // console.debug('API endpoint:', `/attendance-records/${attendanceSession.id}/bulk-update/`);

      // Use the API service with the correct PATCH endpoint
      await apiService.updateAttendanceRecords(attendanceSession.id.toString(), records);
      
      // Show success toast
      setError(null);
      toast.success("Davomat muvaffaqiyatli saqlandi");
      // Navigate back to attendance list after successful save
      navigate('/attendance');
      
      // Clear unsaved changes
      setHasUnsavedChanges(false);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Davomat o\'zgarishlari saqlanmadi. Iltimos, qaytadan urinib ko\'ring.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new attendance session
  const createAttendanceSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.createAttendanceSession();
      // console.debug('Attendance session created:', result);

      // Navigate to the new session
      if (result && result.id) {
        navigate(`/attendance/${result.id}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance session
  const fetchAttendanceSession = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const result = await apiService.getAttendanceSession(id);
      // console.debug('Fetched attendance session:', result);
      setAttendanceSession(result);

      // Auto-expand all rooms
      const allRoomIds = new Set<number>(result.rooms.map((room: { room_id: number }) => room.room_id));
      setExpandedRooms(allRoomIds);

    } catch (err) {
      console.error('Error fetching attendance session:', err);
      setError('Davomat sessiyasini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Load attendance session on component mount
  useEffect(() => {
    // console.debug('AttendanceDetail mounted with id:', id);
    if (id === 'new') {
      createAttendanceSession();
    } else {
      fetchAttendanceSession();
    }
  }, [id]);

  // Get status statistics for session
  const getSessionStats = (session: AttendanceSession) => {
    let present = 0, absent = 0;

    session.rooms.forEach(room => {
      room.students.forEach(student => {
        if (student.status === 'Hozir' || student.status === 'Bor' || student.status === 'in' || student.status === 'In') present++;
        else if (student.status === "Yo'q" || student.status === 'out' || student.status === 'Out') absent++;
      });
    });

    const total = session.rooms.reduce((sum, room) => sum + room.students.length, 0);
    return { present, absent, total };
  };

  // Toggle room expansion
  const toggleRoom = (roomId: number) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Davomat yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error && !attendanceSession) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/attendance')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  if (!attendanceSession) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Davomat topilmadi</p>
          <Button onClick={() => navigate('/attendance')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const stats = getSessionStats(attendanceSession);

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/attendance')}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {formatDate(attendanceSession.date)}
            </h2>
            <p className="text-sm text-gray-600">{attendanceSession.floor.name}</p>
          </div>
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}


      {/* Statistics - Updated for 2 statuses only */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
          <p className="text-sm text-emerald-700">Bor</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-red-700">Yo'q</p>
        </div>
      </div>

      {/* Rooms - All expanded by default */}
      <div className="space-y-4">
        {attendanceSession.rooms.map((room) => {
          const isExpanded = expandedRooms.has(room.room_id);
          
          return (
            <Card key={room.room_id} className="overflow-hidden">
              <div
                className="cursor-pointer p-4"
                onClick={() => toggleRoom(room.room_id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{room.room_name}</h3>
                    <p className="text-sm text-gray-600">{room.students.length} ta talaba</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Students - Always visible when room is expanded */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      {room.students.map((student) => (
                        <div key={student.id} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex flex-col space-y-4">
                            <div className="text-center">
                              <p className="font-medium text-gray-900 text-lg">
                                {student.student.name} {student.student.last_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Record ID: {student.id} | Student ID: {student.student.id} | Status: {student.status}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStudentStatus(student.id, 'Hozir');
                                }}
                                className={clsx(
                                  "py-4 px-4 rounded-lg text-base font-medium transition-all duration-200 active:scale-95",
                                  student.status === 'Hozir' || student.status === 'Bor' || student.status === 'in' || student.status === 'In'
                                    ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                                )}
                              >
                                <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                                Bor
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStudentStatus(student.id, 'Yo\'q');
                                }}
                                className={clsx(
                                  "py-4 px-4 rounded-lg text-base font-medium transition-all duration-200 active:scale-95",
                                  student.status === 'Yo\'q' || student.status === 'out' || student.status === 'Out'
                                    ? "bg-red-500 text-white shadow-lg ring-2 ring-red-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                                )}
                              >
                                <XCircle className="w-6 h-6 mx-auto mb-2" />
                                Yo'q
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Save Button at the end (non-fixed) */}
      <div className="pt-2">
        <Button
          onClick={saveAttendance}
          disabled={isSaving}
          variant="success"
          className="w-full py-3 text-base font-semibold"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceDetail;
