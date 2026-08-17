import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

// Normalize status to the two values the backend accepts
const normalizeStatus = (value: string): "To'lagan" | "To'lamagan" => {
  const v = (value || '')
    .toLowerCase()
    .replace(/[`'ʻ`´]/g, "'")
    .replace(/\s+/g, '');
  if (v.includes("to'lamagan") || v.includes('tolamagan') || v.includes('unpaid') || v === '0') {
    return "To'lamagan";
  }
  if (v.includes("to'lagan") || v.includes('tolagan') || v.includes('paid') || v === '1') {
    return "To'lagan";
  }
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
      if (!data || !Array.isArray((data as CollectionDetailApi).rooms)) {
        throw new Error("Yig'im tafsiloti topilmadi");
      }
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
      let changesCount = 0;
      const promises = [];

      // Find all changed records
      for (const room of collection.rooms) {
        for (const student of room.students) {
          // Get current status from UI state
          const currentStatus = student.status;
          // Get original status
          // Note: originalStatusById keys are student record IDs
          const originalStatus = originalStatusById[student.id];
          
          // Normalize both to compare
          const normalizedCurrent = normalizeStatus(currentStatus);
          const normalizedOriginal = normalizeStatus(originalStatus);
          
          if (normalizedCurrent !== normalizedOriginal) {
            changesCount++;
            
            // Call API for each changed record
            // The API expects: status, collection (ID), student (ID)
            promises.push(apiService.updateCollectionRecords(student.id, {
              status: normalizedCurrent,
              collection: collection.id,
              student: student.student.id
            }));
          }
        }
      }

      if (changesCount > 0) {
        const settled = await Promise.allSettled(promises);
        const failed = settled.filter((r) => r.status === 'rejected').length;
        const ok = settled.length - failed;
        if (failed > 0) {
          toast.error(`${ok} ta saqlandi, ${failed} tasi xato`);
        } else {
          toast.success(`${ok} ta o'zgarish saqlandi`);
        }
        await fetchDetails();
      } else {
        toast.info('O\'zgarishlar yo\'q');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi';
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
          <div className="w-8 h-8 border-2 border-surface-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-4">
        <Card className="text-center py-12 border-dashed border-2 border-surface-100 bg-transparent shadow-none">
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-4">Yig'im topilmadi</p>
          <Button 
            onClick={() => navigate('/collections')} 
            className="bg-surface-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2"
          >
            Orqaga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/collections')}
            className="p-2 bg-surface-100 text-surface-700 rounded-[5px] hover:bg-surface-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-surface-900 uppercase tracking-tighter">{collection.title}</h1>
            {collection.description && (
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">{collection.description}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-100 rounded-[5px]">
          <p className="text-[10px] font-bold text-danger-600 uppercase text-center">{error}</p>
        </div>
      )}

      {/* Collection Info */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center p-4 border border-surface-100 bg-white shadow-sm">
          <p className="text-xl font-black text-surface-900">{(collection.amount ?? 0).toLocaleString()}</p>
          <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mt-1">Miqdor (so'm)</p>
        </Card>
        <Card className="text-center p-4 border border-surface-100 bg-white shadow-sm">
          <p className="text-sm font-black text-surface-900 uppercase tracking-tight">
            {collection.deadline ? formatDate(collection.deadline) : '—'}
          </p>
          <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mt-1">Muddat</p>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-50 rounded-[5px] p-3 text-center border border-surface-100">
          <p className="text-lg font-black text-surface-900">{stats.paid}</p>
          <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">To'langan</p>
        </div>
        <div className="bg-surface-50 rounded-[5px] p-3 text-center border border-surface-100">
          <p className="text-lg font-black text-surface-900">{stats.unpaid}</p>
          <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">Qoldi</p>
        </div>
        <div className="bg-surface-50 rounded-[5px] p-3 text-center border border-surface-100">
          <p className="text-lg font-black text-surface-900">{stats.total}</p>
          <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">Jami</p>
        </div>
      </div>

      {/* Rooms & Students */}
      <div className="space-y-4">
        {collection.rooms.map(room => (
          <div key={room.room_id} className="space-y-3">
            <div 
              className="flex items-center justify-between px-1"
              onClick={() => toggleRoom(room.room_id)}
            >
              <h3 className="text-xs font-black text-surface-900 uppercase tracking-widest">{room.room_name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-surface-400 uppercase">{room.students.length} ta talaba</span>
                {expandedRooms.has(room.room_id) ? (
                  <ChevronUp className="w-3 h-3 text-surface-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-surface-400" />
                )}
              </div>
            </div>

            {expandedRooms.has(room.room_id) && (
              <div className="space-y-3">
                {room.students.map(student => (
                  <Card key={student.id} className="p-4 border border-surface-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-surface-900 uppercase tracking-tight truncate">
                          {student.student.last_name} {student.student.name}
                        </p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">
                          ID: #{student.id}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (normalizeStatus(student.status) !== "To'lagan") togglePayment(student.id);
                          }}
                          className={clsx(
                            "w-10 h-10 rounded-[5px] flex items-center justify-center transition-all duration-200",
                            normalizeStatus(student.status) === "To'lagan"
                              ? "bg-surface-900 text-white shadow-sm"
                              : "bg-surface-50 text-surface-400 border border-surface-100 hover:bg-surface-100"
                          )}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (normalizeStatus(student.status) !== "To'lamagan") togglePayment(student.id);
                          }}
                          className={clsx(
                            "w-10 h-10 rounded-[5px] flex items-center justify-center transition-all duration-200",
                            normalizeStatus(student.status) === "To'lamagan"
                              ? "bg-surface-400 text-white shadow-sm"
                              : "bg-surface-50 text-surface-400 border border-surface-100 hover:bg-surface-100"
                          )}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <motion.div 
        className="fixed bottom-20 left-4 right-4 z-30"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <Button 
          onClick={savePayments} 
          disabled={isSaving} 
          className="w-full bg-surface-900 hover:bg-black text-white py-4 rounded-[5px] shadow-xl uppercase tracking-widest font-black text-xs"
        >
          {isSaving ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saqlanmoqda...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              O'zgarishlarni saqlash
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default CollectionDetails;
