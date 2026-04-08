import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  ClipboardList, 
  Calendar, 
  TrendingUp, 
  Home, 
  User, 
  Building2,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { getCurrentDate } from '../utils/storage';
import apiService from '../services/api';
import type { DashboardData } from '../types';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboardData();
      setDashboardData(data as DashboardData);
    } catch (e: any) {
      console.error('Dashboard data fetch error:', e);
      setError(e?.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 text-blue-600" />
        </motion.div>
        <p className="mt-4 text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Xatolik yuz berdi</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { floor, students, attendance_today, attendance_last_7_days, collections, tasks } = dashboardData;

  return (
    <motion.div 
      className="p-4 space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floor Info Header */}
      <motion.div variants={itemVariants} className="bg-gray-900 rounded-[5px] p-6 text-white shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">{floor.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 opacity-80">
              <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                {floor.dormitory}
              </div>
              <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                <User className="w-3.5 h-3.5 mr-1.5" />
                {floor.gender === 'male' ? 'O\'g\'il bolalar' : 'Qiz bolalar'}
              </div>
            </div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-[5px]">
            <Home className="w-6 h-6" />
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="p-4 border border-gray-100 bg-white shadow-sm h-full">
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 rounded-[5px] self-start mb-3">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Talabalar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{students.total}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 border border-gray-100 bg-white shadow-sm h-full">
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 rounded-[5px] self-start mb-3">
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Davomat</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {attendance_today.present}/{attendance_today.total}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 border border-gray-100 bg-white shadow-sm h-full">
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 rounded-[5px] self-start mb-3">
                <DollarSign className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Yig'imlar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {collections.paid_records}/{collections.total}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-4 border border-gray-100 bg-white shadow-sm h-full">
            <div className="flex flex-col h-full">
              <div className="bg-gray-100 p-2 rounded-[5px] self-start mb-3">
                <ClipboardList className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vazifalar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.pending}</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Attendance Today Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 border border-gray-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-700" />
              Bugungi davomat
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{getCurrentDate()}</span>
          </div>
          
          {!attendance_today.has_session ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">Bugun hali davomat olinmagan</p>
              <Link 
                to="/attendance/new"
                className="inline-flex items-center px-6 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-[5px] hover:bg-black transition-colors"
              >
                Davomatni boshlash
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-[5px] text-center border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{attendance_today.present}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Bor</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-[5px] text-center border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{attendance_today.absent}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Yo'q</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-[5px] text-center border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{attendance_today.total}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Jami</p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Last 7 Days Chart-like view */}
        <motion.div variants={itemVariants}>
          <Card className="p-5 border-none shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                7 kunlik davomat
              </h3>
            </div>
            <div className="flex items-end justify-between h-40 gap-1 px-2">
              {attendance_last_7_days.map((day, idx) => {
                const percentage = day.total > 0 ? (day.present / day.total) * 100 : 0;
                const dateObj = new Date(day.date);
                const dayName = dateObj.toLocaleDateString('uz-UZ', { weekday: 'short' });
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative flex flex-col justify-end h-32">
                      <motion.div 
                        className="bg-blue-500 rounded-t-lg w-full min-h-[4px]"
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ delay: 0.2 + idx * 0.05, duration: 0.5 }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {day.present}/{day.total} ({Math.round(percentage)}%)
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 mt-3 uppercase tracking-tighter">
                      {dayName}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Tasks Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="p-5 border-none shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
              Vazifalar tahlili
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Kutilmoqda</span>
                </div>
                <span className="text-sm font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">{tasks.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Jarayonda</span>
                </div>
                <span className="text-sm font-bold bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">{tasks.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Bajarildi</span>
                </div>
                <span className="text-sm font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full">{tasks.completed}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Umumiy bajarilish</span>
                  <span className="text-xs font-bold text-purple-600">
                    {tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Rooms Occupancy Section */}
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center px-1">
            <Home className="w-5 h-5 mr-2 text-indigo-600" />
            Xonalar holati
          </h3>
          <Link to="/students" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center">
            Barchasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.by_room.map((room, index) => (
            <motion.div
              key={room.room}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-4 border-none shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{room.room}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Sig'im: <span className="font-semibold text-gray-700">{room.capacity}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex -space-x-1 mb-1">
                    {[...Array(room.occupied)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                    ))}
                    {[...Array(room.free)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-200 ring-2 ring-white" />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    room.free === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {room.free === 0 ? 'To\'lgan' : `${room.free} bo'sh`}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
