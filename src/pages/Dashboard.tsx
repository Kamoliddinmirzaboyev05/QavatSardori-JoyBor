import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, DollarSign, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { getCurrentDate } from '../utils/storage';
import { useEffect, useState } from 'react';
import apiService from '../services/api';
import type { LeaderStatistics } from '../types';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  const [stats, setStats] = useState<LeaderStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await apiService.getLeaderStatistics();
        if (isMounted) setStats(data as LeaderStatistics);
      } catch (e: any) {
        if (isMounted) setStatsError(e?.message || 'Xatolik yuz berdi');
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Calculate dashboard metrics
  const activeStudents = state.students.filter(student => !student.isDeleted);
  const todaysAttendance = state.attendance.filter(record => record.date === getCurrentDate());
  const presentToday = todaysAttendance.filter(record => record.status === 'hozir').length;
  const attendanceRate = activeStudents.length > 0 ? Math.round((presentToday / activeStudents.length) * 100) : 0;

  const totalCollections = state.collections.reduce((sum, collection) => sum + collection.amount, 0);
  const paidPayments = state.payments.filter(payment => payment.isPaid);
  const totalCollected = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const collectionRate = totalCollections > 0 ? Math.round((totalCollected / (totalCollections * activeStudents.length)) * 100) : 0;

  const openRequests = state.requests.filter(request => request.status === 'ochiq').length;
  const recentAnnouncements = state.announcements.slice(0, 3);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="p-4 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>
        <p className="text-gray-600">Bugun: {getCurrentDate()}</p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faol talabalar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.active_students || activeStudents.length)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugungi davomat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.today_attendance || presentToday)}
                </p>
                <p className="text-xs text-gray-500">{attendanceRate}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yig'im darajasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.collection_degree || collectionRate)}%
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ochiq so'rovlar</p>
                <p className="text-2xl font-bold text-gray-900">{openRequests}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            So'nggi e'lonlar
          </h3>
          {recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {recentAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  className="p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Hozircha e'lonlar yo'q</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tezkor statistikalar
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami yig'imlar</span>
              <span className="font-semibold">{state.collections.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Yig'ilgan mablag'</span>
              <span className="font-semibold text-green-600">
                {totalCollected.toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kutilayotgan</span>
              <span className="font-semibold text-blue-600">
                {(totalCollections * activeStudents.length).toLocaleString()} so'm
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {statsError && (
        <motion.div 
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-red-600">{statsError}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
