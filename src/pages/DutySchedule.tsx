import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';

interface DutyAssignment {
  id: string;
  room: string;
  date: string;
  status: 'tayinlangan' | 'bajarilgan' | 'bajarilmagan';
  createdAt: string;
}

interface AttendanceSession {
  id: number;
  date: string;
  is_active: boolean;
  created_at: string;
}

const DutySchedule: React.FC = () => {
  const { state } = useApp();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [dutyAssignments, setDutyAssignments] = useState<DutyAssignment[]>([]);

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  // Get unique rooms from students
  const rooms = useMemo(() => {
    const roomSet = new Set(activeStudents.map(student => student.room));
    return Array.from(roomSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [activeStudents]);

  // Get current duty assignment
  const currentDuty = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dutyAssignments.find(duty => duty.date === today);
  }, [dutyAssignments]);

  // Get next room for duty rotation
  const getNextRoom = () => {
    if (rooms.length === 0) return null;

    const lastAssignment = dutyAssignments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastAssignment) return rooms[0];

    const lastRoomIndex = rooms.findIndex(room => room === lastAssignment.room);
    const nextIndex = (lastRoomIndex + 1) % rooms.length;
    return rooms[nextIndex];
  };

  // Assign duty to room
  const assignDuty = () => {
    if (!selectedRoom) return;

    const today = new Date().toISOString().split('T')[0];
    const newAssignment: DutyAssignment = {
      id: Date.now().toString(),
      room: selectedRoom,
      date: today,
      status: 'tayinlangan',
      createdAt: new Date().toISOString()
    };

    setDutyAssignments(prev => [...prev, newAssignment]);
    setShowAssignModal(false);
    setSelectedRoom('');
  };

  // Mark duty as completed
  const markDutyCompleted = (dutyId: string) => {
    setDutyAssignments(prev =>
      prev.map(duty =>
        duty.id === dutyId ? { ...duty, status: 'bajarilgan' } : duty
      )
    );
  };

  // Mark duty as not completed
  const markDutyNotCompleted = (dutyId: string) => {
    setDutyAssignments(prev =>
      prev.map(duty =>
        duty.id === dutyId ? { ...duty, status: 'bajarilmagan' } : duty
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bajarilgan':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'bajarilmagan':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bajarilgan':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'bajarilmagan':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
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
          <h2 className="text-xl font-bold text-gray-900">Navbatchilik</h2>
          <p className="text-sm text-gray-600">Kunlik navbatchilik tayinlash va kuzatish</p>
        </div>
      </motion.div>

      {/* Current Duty */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bugungi navbatchi</h3>
          {currentDuty ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {currentDuty.room}-xona
                  </h4>
                  <p className="text-sm text-gray-600">
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
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Bugun navbatchi tayinlanmagan</p>
              {nextRoom && (
                <p className="text-sm text-gray-400 mt-2">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Navbatchilik tarixi</h3>
          <div className="space-y-3">
            {dutyAssignments.length > 0 ? (
              dutyAssignments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((duty) => {
                  return (
                    <div key={duty.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(duty.status)}
                        <div>
                          <p className="font-medium text-gray-900">{duty.room}-xona</p>
                          <p className="text-sm text-gray-600">
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
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Navbatchilik tarixi yo'q</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Assign Duty Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Navbatchi xona tayinlash</h3>
              <p className="text-sm text-gray-600 mt-1">Bugun uchun navbatchi xonani tanlang</p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {rooms.map((room) => (
                  <label
                    key={room}
                    className={clsx(
                      "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedRoom === room
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
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
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{room}-xona</p>
                        <p className="text-sm text-gray-600">Navbatchilik uchun</p>
                      </div>
                    </div>
                    {selectedRoom === room && (
                      <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex space-x-3">
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
