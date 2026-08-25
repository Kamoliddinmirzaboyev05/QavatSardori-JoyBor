import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';
import apiService from '../services/api';
import { toast } from 'sonner';

interface DutyAssignment {
  id: string;
  room: string;
  roomId?: number;
  floorId?: number;
  date: string;
  status: 'tayinlangan' | 'bajarilgan' | 'bajarilmagan';
  createdAt: string;
}

interface ApiRoom {
  id: number;
  name: string;
  floor?: number;
}

const DutySchedule: React.FC = () => {
  const { state } = useApp();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [dutyAssignments, setDutyAssignments] = useState<DutyAssignment[]>([]);
  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);

  const activeStudents = useMemo(() => {
    return state.students.filter((student) => !student.isDeleted);
  }, [state.students]);

  const rooms = useMemo(() => {
    if (apiRooms.length > 0) {
      return apiRooms.map((r) => r.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    const roomSet = new Set(activeStudents.map((student) => student.room));
    return Array.from(roomSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [activeStudents, apiRooms]);

  const loadDuties = useCallback(async () => {
    try {
      const data = await apiService.getDutySchedules();
      const list = Array.isArray(data)
        ? data
        : ((data as { results?: Array<{
            id: number;
            date: string;
            room: number;
            room_name?: string;
            floor: number;
            created_at?: string;
          }> })?.results || []);

      setDutyAssignments(
        (list as Array<{
          id: number;
          date: string;
          room: number;
          room_name?: string;
          floor: number;
          created_at?: string;
        }>).map((d) => ({
          id: String(d.id),
          room: d.room_name || String(d.room),
          roomId: d.room,
          floorId: d.floor,
          date: d.date,
          status: 'tayinlangan' as const,
          createdAt: d.created_at || d.date,
        }))
      );
    } catch {
      // keep local if API fails
    }
  }, []);

  useEffect(() => {
    loadDuties();
    const floorId = state.user?.floor;
    apiService
      .getRooms(floorId)
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : ((data as { results?: ApiRoom[] })?.results || []);
        setApiRooms(list as ApiRoom[]);
      })
      .catch(() => setApiRooms([]));
  }, [loadDuties, state.user?.floor]);

  const currentDuty = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dutyAssignments.find((duty) => duty.date === today);
  }, [dutyAssignments]);

  const getNextRoom = () => {
    if (rooms.length === 0) return null;
    const lastAssignment = [...dutyAssignments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    if (!lastAssignment) return rooms[0];
    const lastRoomIndex = rooms.findIndex((room) => room === lastAssignment.room);
    const nextIndex = (lastRoomIndex + 1) % rooms.length;
    return rooms[nextIndex];
  };

  const assignDuty = async () => {
    if (!selectedRoom) return;
    const today = new Date().toISOString().split('T')[0];
    const roomObj = apiRooms.find((r) => r.name === selectedRoom || String(r.id) === selectedRoom);
    const floorId = roomObj?.floor ?? state.user?.floor;

    if (roomObj && floorId != null) {
      try {
        await apiService.createDutySchedule({
          date: today,
          floor: Number(floorId),
          room: roomObj.id,
        });
        toast.success('Navbatchilik tayinlandi');
        await loadDuties();
        setShowAssignModal(false);
        setSelectedRoom('');
        return;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'API xatolik — lokal saqlandi');
      }
    }

    const newAssignment: DutyAssignment = {
      id: Date.now().toString(),
      room: selectedRoom,
      date: today,
      status: 'tayinlangan',
      createdAt: new Date().toISOString(),
    };
    setDutyAssignments((prev) => [...prev, newAssignment]);
    setShowAssignModal(false);
    setSelectedRoom('');
  };

  const persistDutyStatus = async (dutyId: string, status: 'bajarilgan' | 'bajarilmagan') => {
    const previous = dutyAssignments.find((d) => d.id === dutyId);
    setDutyAssignments((prev) =>
      prev.map((duty) => (duty.id === dutyId ? { ...duty, status } : duty))
    );
    try {
      await apiService.updateDutySchedule(dutyId, {
        status: status === 'bajarilgan' ? 'completed' : 'not_completed',
        is_completed: status === 'bajarilgan',
      });
    } catch (e) {
      if (previous) {
        setDutyAssignments((prev) =>
          prev.map((duty) => (duty.id === dutyId ? previous : duty))
        );
      }
      toast.error(e instanceof Error ? e.message : 'Holat saqlanmadi');
    }
  };

  const markDutyCompleted = (dutyId: string) => {
    void persistDutyStatus(dutyId, 'bajarilgan');
  };

  const markDutyNotCompleted = (dutyId: string) => {
    void persistDutyStatus(dutyId, 'bajarilmagan');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bajarilgan':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'bajarilmagan':
        return <AlertCircle className="w-5 h-5 text-danger-600" />;
      default:
        return <Clock className="w-5 h-5 text-warning-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bajarilgan':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'bajarilmagan':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-warning-600 bg-warning-50 border-warning-200';
    }
  };

  const nextRoom = getNextRoom();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="p-4 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div>
          <h2 className="text-xl font-bold text-surface-900">Navbatchilik</h2>
          <p className="text-sm text-surface-600">Kunlik navbatchilik tayinlash va kuzatish</p>
        </div>
      </motion.div>

      {/* Current Duty */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Bugungi navbatchi</h3>
          {currentDuty ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">
                    {currentDuty.room}-xona
                  </h4>
                  <p className="text-sm text-surface-600">
                    Bugungi navbatchi xona
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={clsx(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(currentDuty.status)
                  )}
                >
                  {currentDuty.status === 'tayinlangan' ? 'TAYINLANGAN' :
                    currentDuty.status === 'bajarilgan' ? 'BAJARILGAN' : 'BAJARILMAGAN'}
                </div>
                {currentDuty.status === 'tayinlangan' && (
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => markDutyCompleted(currentDuty.id)}
                      className="text-xs px-2 py-1 whitespace-nowrap"
                    >
                      Bajarildi
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => markDutyNotCompleted(currentDuty.id)}
                      className="text-xs px-2 py-1 whitespace-nowrap"
                    >
                      Bajarilmadi
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-surface-400 mx-auto mb-4" />
              <p className="text-surface-500">Bugun navbatchi tayinlanmagan</p>
              {nextRoom && (
                <p className="text-sm text-surface-400 mt-2">
                  Keyingi navbat: {nextRoom}-xona
                </p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Duty History */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Navbatchilik tarixi</h3>
          <div className="space-y-3">
            {dutyAssignments.length > 0 ? (
              dutyAssignments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((duty) => {
                  return (
                    <div key={duty.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-[5px]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(duty.status)}
                        <div>
                          <p className="font-medium text-surface-900">{duty.room}-xona</p>
                          <p className="text-sm text-surface-600">
                            {formatDate(duty.date)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={clsx(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(duty.status)
                        )}
                      >
                        {duty.status === 'tayinlangan' ? 'TAYINLANGAN' :
                          duty.status === 'bajarilgan' ? 'BAJARILGAN' : 'BAJARILMAGAN'}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-500">Navbatchilik tarixi yo'q</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Assign Duty Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[5px] w-full max-w-md mx-4">
            <div className="p-4 border-b border-surface-200">
              <h3 className="text-lg font-semibold text-surface-900">Navbatchi xona tayinlash</h3>
              <p className="text-sm text-surface-600 mt-1">Bugun uchun navbatchi xonani tanlang</p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {rooms.map((room) => (
                  <label
                    key={room}
                    className={clsx(
                      "flex items-center p-3 border rounded-[5px] cursor-pointer transition-colors",
                      selectedRoom === room
                        ? "border-brand-500 bg-brand-50"
                        : "border-surface-200 hover:bg-surface-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="room"
                      value={room}
                      checked={selectedRoom === room}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-surface-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{room}-xona</p>
                        <p className="text-sm text-surface-600">Navbatchilik uchun</p>
                      </div>
                    </div>
                    {selectedRoom === room && (
                      <CheckCircle className="w-5 h-5 text-brand-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-surface-200 flex space-x-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRoom('');
                }}
              >
                Bekor qilish
              </Button>
              <Button
                className="flex-1"
                onClick={assignDuty}
                disabled={!selectedRoom}
              >
                Tayinlash
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button */}
      <motion.div 
        className="fixed bottom-20 left-4 right-4 z-30"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={() => setShowAssignModal(true)}
          className="w-full py-4 text-lg font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Navbatchi tayinlash
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default DutySchedule;
