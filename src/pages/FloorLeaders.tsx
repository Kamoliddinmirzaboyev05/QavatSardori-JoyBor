import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface FloorLeader {
  id: number;
  user_info: {
    username: string;
    email: string;
    role: string;
  };
  floor_info: {
    name: string;
    gender: string;
  };
  floor: number;
  user: number;
}

const FloorLeaders: React.FC = () => {
  const [leaders, setLeaders] = useState<FloorLeader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    floorName: '',
    gender: 'male' as 'male' | 'female',
    floorNumber: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchLeaders = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getFloorLeaders();
      setLeaders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
      toast.error('Qavat sardorlarini yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Foydalanuvchi nomi talab qilinadi';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'To\'g\'ri email kiriting';
    }

    if (!formData.floorName.trim()) {
      newErrors.floorName = 'Qavat nomi talab qilinadi';
    }

    if (formData.floorNumber <= 0) {
      newErrors.floorNumber = 'Qavat raqami musbat bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createFloorLeader({
        user_info: {
          username: formData.username,
          password: formData.password,
          role: 'floor_leader',
          email: formData.email
        },
        floor_info: {
          name: formData.floorName,
          gender: formData.gender
        },
        floor: formData.floorNumber,
        user: 0 // This will be set by the backend
      });

      toast.success('Qavat sardori muvaffaqiyatli qo\'shildi');
      setShowForm(false);
      setFormData({
        username: '',
        password: '',
        email: '',
        floorName: '',
        gender: 'male',
        floorNumber: 0
      });
      fetchLeaders();
    } catch (error) {
      console.error('Error creating leader:', error);
      toast.error(error instanceof Error ? error.message : 'Qavat sardorini qo\'shishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Qavat Sardorlari</h2>
          <p className="text-sm text-gray-600">Qavat sardorlarini boshqarish</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi sardor
          </Button>
        </motion.div>
      </motion.div>

      {isLoading && !showForm && (
        <motion.div className="text-center py-8" variants={itemVariants}>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </motion.div>
      )}

      <motion.div className="space-y-4" variants={containerVariants}>
        {!isLoading && leaders.length > 0 ? (
          leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{leader.user_info.username}</h3>
                      <p className="text-sm text-gray-600">{leader.floor_info.name}</p>
                      <p className="text-xs text-gray-500">{leader.user_info.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Qavat: {leader.floor}</p>
                    <p className="text-xs text-gray-500 capitalize">{leader.floor_info.gender}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : !isLoading ? (
          <motion.div variants={itemVariants}>
            <Card className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Hali qavat sardorlari yo'q</p>
              <p className="text-sm text-gray-400 mt-1">Birinchi sardorni qo'shing</p>
            </Card>
          </motion.div>
        ) : null}
      </motion.div>

      {/* Create Leader Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowForm(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Yangi Qavat Sardori</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foydalanuvchi nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Foydalanuvchi nomini kiriting"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parol *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Parolni kiriting"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Email kiriting"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qavat nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.floorName}
                    onChange={(e) => handleInputChange('floorName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.floorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Qavat nomini kiriting"
                  />
                  {errors.floorName && (
                    <p className="text-red-500 text-sm mt-1">{errors.floorName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jinsi *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qavat raqami *
                  </label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => handleInputChange('floorNumber', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.floorNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Qavat raqamini kiriting"
                    min="1"
                  />
                  {errors.floorNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.floorNumber}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                    disabled={isLoading}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      'Qo\'shish'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default FloorLeaders;
