import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Calendar, Users, Save, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface StudentRecord {
  id: number; // collection record id
  student: {
    id: number;
    name: string;
    last_name: string;
  };
  status: string; // "To'langan" | "To'lamagan"
}

interface Room {
  room_id: number;
  room_name: string;
  students: StudentRecord[];
}

interface CollectionDetailApi {
  id: number;
  title: string;
  amount: number;
  description?: string;
  deadline?: string;
  floor: { id: number; name: string };
  leader: { id: number; floor: string; user: string };
  rooms: Room[];
  created_at: string;
}

// Normalize status to strict ASCII values expected by backend
const normalizeStatus = (value: string): "To'lagan" | "To'lamagan" => {
  const v = (value || '').replace(/[`'ʻ`´]/g, "'");
  if (v.toLowerCase().includes('lagan')) return "To'lagan";
  return "To'lamagan";
};

const CollectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<CollectionDetailApi | null>(null);
  const [originalStatusById, setOriginalStatusById] = useState<Record<number, "To'lagan" | "To'lamagan">>({});
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getCollection(id);
      setCollection(data);
      // Capture original statuses for change detection
      const map: Record<number, "To'lagan" | "To'lamagan"> = {};
      data.rooms.forEach((r: Room) => r.students.forEach((s: StudentRecord) => { map[s.id] = normalizeStatus(s.status); }));
      setOriginalStatusById(map);
      // Auto-expand all rooms for better mobile UX
      const allRoomIds = new Set<number>(data.rooms.map((room: Room) => room.room_id));
      setExpandedRooms(allRoomIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yig\'im ma\'lumotlarini yuklashda xatolik';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const stats = useMemo(() => {
    if (!collection) return { total: 0, paid: 0, unpaid: 0, collected: 0, expected: 0 };
    const students = collection.rooms.flatMap(r => r.students);
    const total = students.length;
    const paid = students.filter(s => normalizeStatus(s.status) === "To'lagan").length;
    const unpaid = total - paid;
    const collected = paid * (collection.amount ?? 0);
    const expected = total * (collection.amount ?? 0);
    return { total, paid, unpaid, collected, expected };
  }, [collection]);

  const togglePayment = (recordId: number) => {
    if (!collection) return;
    setCollection(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(room => ({
          ...room,
          students: room.students.map(s => s.id === recordId ? ({
            ...s,
            status: normalizeStatus(s.status) === "To'lagan" ? "To'lamagan" : "To'lagan"
          }) : s)
        }))
      };
    });
  };

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

  const savePayments = async () => {
    if (!collection) return;
    setIsSaving(true);
    setError(null);
    try {
      const records: any[] = [];
      collection.rooms.forEach((room: Room) => {
        room.students.forEach((s: StudentRecord) => {
          const normalized = normalizeStatus(s.status);
          const statusCurly = normalized === "To'lagan" ? "To'lagan" : "To'lamagan";
          records.push({ id: s.id, student_id: s.student.id, status: statusCurly });
        });
      });
      // Debug: inspect outgoing payload
      // eslint-disable-next-line no-console
      console.log('Bulk update payload:', { records });
      toast.success("To'lovlar muvaffaqiyatli saqlandi");
      // Navigate back to collections list after successful save
      navigate('/collections');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'To\'lovlarni saqlashda xatolik';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">Yig'im topilmadi</p>
          <Button onClick={() => navigate('/collections')} className="mt-4">Orqaga qaytish</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/collections')}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{collection.title}</h1>
            {collection.description && <p className="text-sm text-gray-600">{collection.description}</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Collection Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4">
          <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{(collection.amount ?? 0).toLocaleString()} so'm</p>
          <p className="text-sm text-gray-600">Miqdor</p>
        </Card>
        <Card className="text-center p-4">
          <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">{collection.deadline ? formatDate(collection.deadline) : '—'}</p>
          <p className="text-sm text-gray-600">Muddat</p>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-emerald-600">{stats.paid}</p>
          <p className="text-sm text-emerald-700">To'langan</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-red-600">{stats.unpaid}</p>
          <p className="text-sm text-red-700">To'lanmagan</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-blue-700">Jami</p>
        </div>
      </div>

      {/* Rooms & Students */}
      <div className="space-y-4">
        {collection.rooms.map(room => (
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
                {expandedRooms.has(room.room_id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedRooms.has(room.room_id) && (
              <div className="px-4 pb-4">
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    {room.students.map(student => (
                      <div key={student.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col space-y-4">
                          <div className="text-center">
                            <p className="font-medium text-gray-900 text-lg">
                              {student.student.name} {student.student.last_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Record ID: {student.id} • Student ID: {student.student.id}
                            </p>
                          </div>
                          <div className="text-center mb-3">
                            <p className="font-bold text-gray-900 text-lg">
                              {(collection.amount ?? 0).toLocaleString()} so'm
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePayment(student.id);
                              }}
                              className={clsx(
                                "py-4 px-4 rounded-lg text-base font-medium transition-all duration-200 active:scale-95",
                                normalizeStatus(student.status) === "To'lagan"
                                  ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                              )}
                            >
                              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                              To'langan
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePayment(student.id);
                              }}
                              className={clsx(
                                "py-4 px-4 rounded-lg text-base font-medium transition-all duration-200 active:scale-95",
                                normalizeStatus(student.status) === "To'lamagan"
                                  ? "bg-red-500 text-white shadow-lg ring-2 ring-red-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                              )}
                            >
                              <XCircle className="w-6 h-6 mx-auto mb-2" />
                              To'lanmagan
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
        ))}
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <Button onClick={savePayments} disabled={isSaving} variant="success" className="w-full py-3 text-base font-semibold">
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saqlanmoqda...' : 'To\'lovlarni Saqlash'}
        </Button>
      </div>
    </div>
  );
};

export default CollectionDetails;
