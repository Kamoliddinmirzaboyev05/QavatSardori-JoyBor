import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, Save, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

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

  // Save attendance changes with correct status format
  const saveAttendance = async () => {
    if (!attendanceSession) return;

    setIsSaving(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token topilmadi');
      }

      // Prepare records array for API with correct status format
      const records: any[] = [];

      attendanceSession.rooms.forEach(room => {
        room.students.forEach(student => {
          // Convert status to API format - ONLY lowercase "in" and "out"
          let apiStatus = '';
          if (student.status === 'Hozir' || student.status === 'Bor' || student.status === 'In' || student.status === 'in') {
            apiStatus = 'in'; // Always lowercase
          } else if (student.status === 'Yo\'q' || student.status === 'Out' || student.status === 'out') {
            apiStatus = 'out'; // Always lowercase
          }
          // Skip any other statuses (like "Kech")

          // Only add record if we have a valid status
          if (apiStatus) {
            records.push({
              id: student.id, // This is the attendance record ID
              student_id: student.student.id, // This is the actual student ID
              status: apiStatus // Always lowercase: "in" or "out"
            });
          }
        });
      });

      console.log('=== ATTENDANCE SAVE DEBUG ===');
      console.log('Session ID:', attendanceSession.id);
      console.log('Total records to send:', records.length);
      console.log('Records array:', records);
      console.log('API endpoint:', `https://joyboryangi.pythonanywhere.com/attendance-records/${attendanceSession.id}/bulk-update/`);
      
      // Log each record individually
      records.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          student_id: record.student_id,
          status: record.status,
          id_type: typeof record.id,
          student_id_type: typeof record.student_id,
          status_type: typeof record.status
        });
      });

      const requestBody = { records };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Use the correct API format as shown in Swagger documentation
      const response = await fetch(`https://joyboryangi.pythonanywhere.com/attendance-records/${attendanceSession.id}/bulk-update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Attendance updated successfully:', responseData);
        
        // Show success message
        setError(null);
        setSuccessMessage('Davomat o\'zgarishlari muvaffaqiyatli saqlandi!');
        
        // Clear unsaved changes
        setHasUnsavedChanges(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const errorText = await response.text();
        console.log('❌ API request failed:', response.status, errorText);
        
        let errorMessage = `API xatoligi: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          console.log('Error data:', errorData);
          
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else if (errorData.records) {
            errorMessage = `Records validation error: ${JSON.stringify(errorData.records)}`;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch (e) {
          console.log('Could not parse error response:', e);
          errorMessage = `Raw error: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err instanceof Error ? err.message : 'Davomat o\'zgarishlari saqlanmadi. Iltimos, qaytadan urinib ko\'ring.');
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
      console.log('Attendance session created:', result);

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
      console.log('Fetched attendance session:', result);
      setAttendanceSession(result);

      // Auto-expand all rooms
      const allRoomIds = new Set(result.rooms.map(room => room.room_id));
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
    console.log('AttendanceDetail mounted with id:', id);
    if (id === 'new') {
      createAttendanceSession();
    } else {
      fetchAttendanceSession();
    }
  }, [id]);

  // Get status statistics for session (updated for 2 statuses only)
  const getSessionStats = (session: AttendanceSession) => {
    let present = 0, absent = 0;

    session.rooms.forEach(room => {
      room.students.forEach(student => {
        if (student.status === 'Hozir' || student.status === 'Bor' || student.status === 'in' || student.status === 'In') {
          present++;
        } else if (student.status === 'Yo\'q' || student.status === 'out' || student.status === 'Out') {
          absent++;
        }
        // Skip "Kech" and other statuses
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

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-600">{successMessage}</p>
        </div>
      )}

      {/* Statistics - Updated for 2 statuses only */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
          <p className="text-sm text-emerald-700">Bor (in)</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-red-700">Yo'q (out)</p>
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
                                Bor (in)
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
                                Yo'q (out)
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

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center text-orange-600 bg-orange-50 rounded-lg p-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Saqlanmagan o'zgarishlar mavjud</span>
              </div>
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
          </Card>
        </div>
      )}
    </div>
  );
};

export default AttendanceDetail;
