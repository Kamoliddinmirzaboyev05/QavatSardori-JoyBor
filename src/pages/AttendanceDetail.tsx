import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Save, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
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

/** Backend turlicha shakl qaytaradi: rooms-bilan tayyor session, records ro'yxati yoki sahifalangan natija */
interface RawAttendanceRecord {
  id: number;
  session?: number | string;
  student: number;
  student_name?: string;
  name?: string;
  student_last_name?: string;
  last_name?: string;
  room?: number;
  room_name?: string;
  floor_name?: string;
  status: string;
  session_date?: string;
  date?: string;
}

interface RawSessionResult {
  id?: number;
  date?: string;
  floor?: number;
  floor_name?: string;
  leader?: number;
  leader_name?: string;
  records?: RawAttendanceRecord[];
  rooms?: Room[];
  results?: RawAttendanceRecord[];
}

const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const records: { id: number; student_id: number; status: 'in' | 'out' }[] = [];

      if (attendanceSession.rooms && Array.isArray(attendanceSession.rooms)) {
        attendanceSession.rooms.forEach(room => {
          if (room.students && Array.isArray(room.students)) {
            room.students.forEach(student => {
              let apiStatus: '' | 'in' | 'out' = '';
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
          }
        });
      }
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

  // Create new attendance session — yangi full-create oqimi AttendanceNew sahifasida
  const createAttendanceSession = async () => {
    navigate('/attendance/new');
  };

  // Fetch attendance session
  const fetchAttendanceSession = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const raw = await apiService.getAttendanceSession(id);

      // Session detail: records array → rooms guruhlash
      const buildFromRecords = (
        records: RawAttendanceRecord[],
        sessionMeta: RawSessionResult = {}
      ): AttendanceSession => {
        const byRoom = new Map<string, Room>();
        records.forEach((r, idx) => {
          const roomName = r.room_name || r.floor_name || 'Xona';
          const key = roomName;
          if (!byRoom.has(key)) {
            byRoom.set(key, {
              room_id: r.room || idx + 1,
              room_name: roomName,
              students: [],
            });
          }
          byRoom.get(key)!.students.push({
            id: r.id,
            student: {
              id: r.student,
              name: r.student_name || r.name || '',
              last_name: r.student_last_name || r.last_name || '',
            },
            status: r.status,
          });
        });
        return {
          id: sessionMeta.id ?? Number(records[0]?.session ?? id),
          date: sessionMeta.date || records[0]?.session_date || records[0]?.date || '',
          floor: {
            id: sessionMeta.floor || 0,
            name: sessionMeta.floor_name || records[0]?.floor_name || '',
          },
          leader: {
            id: sessionMeta.leader || 0,
            floor: sessionMeta.floor_name || '',
            user: sessionMeta.leader_name || '',
          },
          rooms: Array.from(byRoom.values()),
        };
      };

      // Backend uch xil shaklda qaytarishi mumkin: tayyor {rooms}, {records}/{results} bilan meta, yoki xom massiv
      let session: AttendanceSession | null = null;
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const obj = raw as RawSessionResult & { rooms?: Room[] };
        if (obj.rooms) {
          session = obj as AttendanceSession;
        } else if (Array.isArray(obj.records)) {
          session = buildFromRecords(obj.records, obj);
        } else if (Array.isArray(obj.results) && obj.results.length > 0) {
          session = buildFromRecords(obj.results);
        }
      } else if (Array.isArray(raw) && raw.length > 0) {
        session = buildFromRecords(raw as RawAttendanceRecord[]);
      }

      if (session) {
        setAttendanceSession(session);
        setExpandedRooms(new Set(session.rooms.map((room) => room.room_id)));
      } else {
        const allRecordsRes = (await apiService.getAttendanceRecords({
          session: Number(id),
        })) as RawAttendanceRecord[] | { results?: RawAttendanceRecord[] };
        const allRecords = Array.isArray(allRecordsRes)
          ? allRecordsRes
          : allRecordsRes.results || [];

        const sessionRecords = allRecords.filter((r) => String(r.session) === String(id));
        if (sessionRecords.length > 0) {
          const sessionData = buildFromRecords(sessionRecords);
          setAttendanceSession(sessionData);
          setExpandedRooms(new Set(sessionData.rooms.map((r) => r.room_id)));
        } else {
          setError("Davomat sessiyasi ma'lumotlari topilmadi");
        }
      }
    } catch {
      setError('Davomat sessiyasini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Load attendance session on component mount
  useEffect(() => {
    if (id === 'new') {
      createAttendanceSession();
    } else {
      fetchAttendanceSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Get status statistics for session
  const getSessionStats = (session: AttendanceSession) => {
    let present = 0, absent = 0;

    if (session && session.rooms && Array.isArray(session.rooms)) {
      session.rooms.forEach(room => {
        if (room.students && Array.isArray(room.students)) {
          room.students.forEach(student => {
            const status = student.status?.toLowerCase();
            if (status === 'hozir' || status === 'bor' || status === 'in') present++;
            else if (status === "yo'q" || status === 'out') absent++;
          });
        }
      });
    }

    const total = session?.rooms?.reduce((sum, room) => sum + (room?.students?.length || 0), 0) || 0;
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
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-surface-600">Davomat yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error && !attendanceSession) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-danger-600 mb-4">{error}</p>
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
          <p className="text-surface-600">Davomat topilmadi</p>
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
            <h2 className="text-xl font-bold text-surface-900">
              {formatDate(attendanceSession.date)}
            </h2>
            <p className="text-sm text-surface-600">{attendanceSession.floor.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-surface-900">
            {stats.present}/{stats.total}
          </p>
          <p className="text-sm text-surface-600">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% hozir
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-[5px]">
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}


      {/* Statistics - Updated for 2 statuses only */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success-50 rounded-[5px] p-4 text-center">
          <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-success-600">{stats.present}</p>
          <p className="text-sm text-success-700">Bor</p>
        </div>
        <div className="bg-danger-50 rounded-[5px] p-4 text-center">
          <XCircle className="w-8 h-8 text-danger-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-danger-600">{stats.absent}</p>
          <p className="text-sm text-danger-700">Yo'q</p>
        </div>
      </div>

      {/* Rooms - All expanded by default */}
      <div className="space-y-4">
        {attendanceSession.rooms && Array.isArray(attendanceSession.rooms) && attendanceSession.rooms.map((room) => {
          const isExpanded = expandedRooms.has(room.room_id);
          const roomStats = room.students ? {
            present: room.students.filter(s => s.status?.toLowerCase() === 'hozir' || s.status?.toLowerCase() === 'bor' || s.status?.toLowerCase() === 'in').length,
            absent: room.students.filter(s => s.status?.toLowerCase() === "yo'q" || s.status?.toLowerCase() === 'out').length,
            total: room.students.length
          } : { present: 0, absent: 0, total: 0 };
          
          return (
            <Card key={room.room_id} className="overflow-hidden">
              <div
                className="cursor-pointer p-4"
                onClick={() => toggleRoom(room.room_id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 text-lg">{room.room_name}</h3>
                    <p className="text-sm text-surface-600">
                      {room.students.length} ta talaba
                      {roomStats.total > 0 && (
                        <span className="ml-2 text-xs">
                          <span className="text-success-600 font-medium">{roomStats.present} bor</span>
                          {roomStats.absent > 0 && (
                            <span className="text-danger-600 font-medium"> · {roomStats.absent} yo'q</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-surface-400" />
                  )}
                </div>
              </div>

              {/* Students - Always visible when room is expanded */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="border-t border-surface-200 pt-4">
                    <div className="space-y-3">
                      {room.students.map((student) => (
                        <div key={student.id} className="bg-white rounded-[5px] p-4 shadow-sm">
                          <div className="flex flex-col space-y-4">
                            <div className="text-center">
                              <p className="font-medium text-surface-900 text-lg">
                                {student.student.name} {student.student.last_name}
                              </p>
                              <p className="text-xs text-surface-500 mt-1">{student.status}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStudentStatus(student.id, 'Hozir');
                                }}
                                className={clsx(
                                  "py-4 px-4 rounded-[5px] text-base font-medium transition-all duration-200 active:scale-95",
                                  student.status === 'Hozir' || student.status === 'Bor' || student.status === 'in' || student.status === 'In'
                                    ? "bg-success-500 text-white shadow-lg ring-2 ring-success-200"
                                    : "bg-surface-100 text-surface-600 hover:bg-success-50 hover:text-success-700"
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
                                  "py-4 px-4 rounded-[5px] text-base font-medium transition-all duration-200 active:scale-95",
                                  student.status === 'Yo\'q' || student.status === 'out' || student.status === 'Out'
                                    ? "bg-danger-500 text-white shadow-lg ring-2 ring-danger-200"
                                    : "bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-700"
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
      <div className="pt-2 space-y-2">
        {hasUnsavedChanges && !isSaving && (
          <p className="text-xs text-warning-600 text-center font-medium">Saqlanmagan o'zgarishlar bor</p>
        )}
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
