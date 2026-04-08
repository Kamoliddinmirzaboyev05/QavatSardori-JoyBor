import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Users, Calendar, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate, getCurrentDate } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useApp } from '../context/AppContext';

interface AttendanceRecord {
  id: number;
  session: number;
  session_date: string;
  floor_name: string;
  student: number;
  student_name: string;
  student_last_name: string;
  status: string;
  created_at: string;
}

interface GroupedSession {
  id: number;
  date: string;
  floorName: string;
  present: number;
  absent: number;
  total: number;
  records: AttendanceRecord[];
}

const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [groupedSessions, setGroupedSessions] = useState<GroupedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance records and group them
  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAttendanceRecords();
      const records: AttendanceRecord[] = result.results || (Array.isArray(result) ? result : []);

      // Group by session ID
      const sessionsMap: Record<number, GroupedSession> = {};
      
      records.forEach(record => {
        const sessionId = record.session;
        if (!sessionsMap[sessionId]) {
          sessionsMap[sessionId] = {
            id: sessionId,
            date: record.session_date,
            floorName: record.floor_name || 'Noma\'lum qavat',
            present: 0,
            absent: 0,
            total: 0,
            records: []
          };
        }
        
        sessionsMap[sessionId].records.push(record);
        sessionsMap[sessionId].total++;
        
        if (record.status.toLowerCase() === 'in' || record.status === 'Hozir' || record.status === 'Bor') {
          sessionsMap[sessionId].present++;
        } else if (record.status.toLowerCase() === 'out' || record.status === 'Yo\'q') {
          sessionsMap[sessionId].absent++;
        }
      });

      // Convert to array and sort by date (most recent first)
      const sessions = Object.values(sessionsMap).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id
      );

      setGroupedSessions(sessions);

    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
      setGroupedSessions([]);
      setError(err.message || 'Davomat ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Create attendance session - navigate to new page
  const createAttendanceSession = () => {
    navigate('/attendance/new');
  };

  // Load attendance sessions on component mount
  useEffect(() => {
    fetchAttendanceData();
  }, []);

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

  const handleSessionClick = (sessionId: number) => {
    console.log('Session clicked:', sessionId);
    navigate(`/attendance/${sessionId}`);
  };

  const handleCreateNew = () => {
    navigate('/attendance/new');
  };

  // Group sessions by date for visual separation
  const sessionsByDate = groupedSessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {} as Record<string, GroupedSession[]>);

  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
      className="p-4 space-y-4 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col space-y-3"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Davomat Tarixi</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Olingan davomatlar ro'yxati</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={createAttendanceSession}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white py-3 rounded-[5px] uppercase tracking-widest font-bold text-[11px]"
          >
            <Calendar className="w-3.5 h-3.5 mr-2" />
            {isLoading ? 'Yuklanmoqda...' : 'Yangi Davomat Olish'}
          </Button>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          className="p-3 bg-red-50 border border-red-200 rounded-[5px]"
          variants={itemVariants}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          className="text-center py-8"
          variants={itemVariants}
        >
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Davomatlar yuklanmoqda...</p>
        </motion.div>
      )}

      {/* Attendance Sessions List Grouped by Date */}
      {!isLoading && (
        <motion.div
          className="space-y-6"
          variants={containerVariants}
        >
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 flex items-center">
                  <span className="bg-gray-200 h-px flex-1 mr-3"></span>
                  {formatDisplayDate(date)}
                  <span className="bg-gray-200 h-px flex-1 ml-3"></span>
                </h3>
                
                {sessionsByDate[date].map((session) => (
                  <motion.div
                    key={session.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-700" />
                              <h3 className="font-bold text-gray-900 uppercase tracking-tight">
                                {session.floorName}
                              </h3>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {formatDate(session.date)} • ID: #{session.id}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="text-xl font-black text-gray-900 leading-none">
                                {session.present}/{session.total}
                              </p>
                              <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">
                                {session.total > 0 ? Math.round((session.present / session.total) * 100) : 0}%
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 rounded-[5px] p-2 text-center border border-gray-100">
                            <p className="text-lg font-bold text-gray-900">{session.present}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Bor</p>
                          </div>
                          <div className="bg-gray-50 rounded-[5px] p-2 text-center border border-gray-100">
                            <p className="text-lg font-bold text-gray-900">{session.absent}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Yo'q</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                            Yaratilgan: {new Date(session.records[0].created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                            {session.total} ta talaba
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ))
          ) : (
            <motion.div variants={itemVariants}>
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
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AttendanceList;
