import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Users, Save, ArrowLeft, Search } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface Student {
  id: number;
  name: string;
  last_name: string;
  middle_name?: string;
  room_name?: string;
  floor_name?: string;
  group?: string;
  course?: string;
  faculty?: string;
  direction?: string;
  picture?: string | null;
  user_info?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

const AttendanceNew: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, 'in' | 'out' | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => {
      const fullName = `${student.name} ${student.last_name} ${student.middle_name || ''}`.toLowerCase();
      const roomName = (student.room_name || '').toLowerCase();
      const group = (student.group || '').toLowerCase();
      return fullName.includes(query) || roomName.includes(query) || group.includes(query);
    });
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getStudents();
      const studentsList = response.results || response || [];
      
      // Sort students by room and name
      const sortedStudents = studentsList.sort((a: Student, b: Student) => {
        // First sort by room
        if (a.room_name && b.room_name) {
          const roomCompare = a.room_name.localeCompare(b.room_name);
          if (roomCompare !== 0) return roomCompare;
        }
        // Then by last name
        return (a.last_name || '').localeCompare(b.last_name || '');
      });
      
      setStudents(sortedStudents);
      setFilteredStudents(sortedStudents);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      toast.error('Talabalar ro\'yxatini yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle student attendance status
  const toggleStudentStatus = (studentId: number, status: 'in' | 'out') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  // Mark all students with same status
  const markAll = (status: 'in' | 'out') => {
    const newRecords: Record<number, 'in' | 'out'> = {};
    filteredStudents.forEach(student => {
      newRecords[student.id] = status;
    });
    setAttendanceRecords(prev => ({ ...prev, ...newRecords }));
    toast.success(`Barcha talabalar ${status === 'in' ? 'bor' : 'yo\'q'} deb belgilandi`);
  };

  // Get statistics
  const getStats = () => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    filteredStudents.forEach(student => {
      const status = attendanceRecords[student.id];
      if (status === 'in') present++;
      else if (status === 'out') absent++;
      else unmarked++;
    });

    return { present, absent, unmarked, total: filteredStudents.length };
  };

  // Save attendance using full-create endpoint
  const saveAttendance = async () => {
    const stats = getStats();
    
    if (stats.unmarked > 0) {
      const confirmed = window.confirm(
        `${stats.unmarked} ta talaba hali belgilanmagan. Davomatni saqlashni xohlaysizmi?`
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      // Prepare records for API - only include students with status
      const records: { student_id: number; status: 'in' | 'out' }[] = [];
      
      filteredStudents.forEach(student => {
        const status = attendanceRecords[student.id];
        if (status) {
          records.push({
            student_id: student.id,
            status: status
          });
        }
      });

      if (records.length === 0) {
        toast.error('Kamida bitta talabani belgilang');
        setIsSaving(false);
        return;
      }

      console.log('Saving attendance:', { date: selectedDate, records });

      // Call full-create endpoint
      const result = await apiService.fullCreateAttendanceSession({
        date: selectedDate,
        records: records
      });

      console.log('Attendance saved successfully:', result);
      toast.success('Davomat muvaffaqiyatli saqlandi!');
      navigate('/attendance');
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error(err.message || 'Davomat saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = getStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Talabalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 space-y-4 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/attendance')}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Yangi Davomat</h2>
            <p className="text-sm text-gray-600">Talabalar davomati</p>
          </div>
        </div>
      </motion.div>

      {/* Date Picker */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sana
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Talaba, xona yoki guruh bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => markAll('in')}
          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Barchasi bor
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => markAll('out')}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Barchasi yo'q
        </Button>
      </motion.div>

      {/* Statistics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-xs text-emerald-700">Bor</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-xs text-red-700">Yo'q</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-600">{stats.unmarked}</p>
            <p className="text-xs text-gray-700">Belgisiz</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Jami: {stats.total} ta talaba
        </p>
      </motion.div>

      {/* Students List */}
      <motion.div variants={containerVariants} className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const status = attendanceRecords[student.id];
            
            return (
              <motion.div
                key={student.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Student Photo */}
                    <div className="flex-shrink-0">
                      {student.picture ? (
                        <img
                          src={student.picture}
                          alt={`${student.name} ${student.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {student.last_name} {student.name} {student.middle_name || ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.room_name || 'Xona belgilanmagan'} • {student.group || ''}
                      </p>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStudentStatus(student.id, 'in')}
                        className={clsx(
                          "p-2 rounded-lg transition-all duration-200",
                          status === 'in'
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                        )}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleStudentStatus(student.id, 'out')}
                        className={clsx(
                          "p-2 rounded-lg transition-all duration-200",
                          status === 'out'
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        )}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <motion.div variants={itemVariants} className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'Qidiruv bo\'yicha natija topilmadi' : 'Talabalar ro\'yxati bo\'sh'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Save Button - Fixed at bottom with high z-index */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <Button
          onClick={saveAttendance}
          disabled={isSaving || stats.total === 0}
          variant="success"
          className="w-full py-3 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saqlanmoqda...' : `Davomatni Saqlash (${stats.present + stats.absent}/${stats.total})`}
        </Button>
      </div>
      
      {/* Spacer for fixed button */}
      <div className="h-24"></div>
    </motion.div>
  );
};

export default AttendanceNew;
