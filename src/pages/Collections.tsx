import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CollectionForm from '../components/collections/CollectionForm';
import { formatDate } from '../utils/storage';
import { apiService } from '../services/api';

interface StudentRecord {
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
  students: StudentRecord[];
}

interface ApiCollection {
  id: number;
  title: string;
  amount: number;
  description?: string;
  deadline?: string;
  rooms?: Room[];
}

const Collections: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setError('Tizimga kiring');
        return;
      }

      const data = await apiService.getCollections();
      console.log('Collections API response:', data);
      
      // Ensure data is an array and handle the API response properly
      const collectionsArray = Array.isArray(data) ? data : [];
      setCollections(collectionsArray);
      
      if (collectionsArray.length === 0) {
        console.log('No collections found');
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err instanceof Error ? err.message : 'Yig\'imlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const getCollectionStats = (collection: ApiCollection) => {
    console.log('Processing collection:', collection);
    
    if (!collection.rooms || !Array.isArray(collection.rooms)) {
      console.log('No rooms data for collection:', collection.id);
      return { paid: 0, total: 0, collected: 0, expected: 0, percentage: 0 };
    }

    let paid = 0;
    let total = 0;
    
    collection.rooms.forEach(room => {
      if (room.students && Array.isArray(room.students)) {
        room.students.forEach(student => {
          total++;
          // Check for different possible status values
          const status = student.status?.toLowerCase();
          if (status === 'paid' || status === 'to\'langan' || status === 'tolangan' || status === 'completed') {
            paid++;
          }
        });
      }
    });

    const collected = paid * (collection.amount || 0);
    const expected = total * (collection.amount || 0);
    const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
    
    console.log(`Collection ${collection.id} stats:`, { paid, total, collected, expected, percentage });
    
    return { paid, total, collected, expected, percentage };
  };

  const handleCollectionClick = (collection: ApiCollection) => {
    navigate(`/collections/${collection.id}`);
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
          <h2 className="text-2xl font-bold text-gray-900">Yig'imlar</h2>
          <p className="text-sm text-gray-600">Talabalar to'lovlarini boshqarish</p>
        </div>
        <div className="flex space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={fetchCollections}
              variant="secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Yangilash
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi yig'im
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
          variants={itemVariants}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {isLoading && (
        <motion.div 
          className="text-center py-8"
          variants={itemVariants}
        >
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yig'imlar yuklanmoqda...</p>
        </motion.div>
      )}

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
      >
        {!isLoading && collections.length > 0 ? (
          collections.map((collection, index) => {
            const stats = getCollectionStats(collection);
            console.log(`Rendering collection ${collection.id}:`, { collection, stats });
            
            return (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCollectionClick(collection)}
                >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                    {collection.description && (
                      <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      {collection.amount.toLocaleString()} so'm
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {collection.deadline ? (
                      <>Muddat: {formatDate(collection.deadline)}</>
                    ) : (
                      'Muddat belgilanmagan'
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">
                    {stats.total > 0 ? (
                      `${stats.paid}/${stats.total} to'landi (${stats.percentage}%)`
                    ) : (
                      'Ma\'lumot yo\'q'
                    )}
                  </div>
                </div>

                {stats.total > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yig'ildi</span>
                      <span className="font-medium text-green-600">
                        {stats.collected.toLocaleString()} so'm
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kutilayotgan</span>
                      <span className="font-medium text-gray-900">
                        {stats.expected.toLocaleString()} so'm
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Hali talabalar ro'yxati yuklanmagan
                  </div>
                )}
                </Card>
              </motion.div>
            );
          })
        ) : !isLoading ? (
          <motion.div variants={itemVariants}>
            <Card className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500">Hali yig'imlar yo'q</p>
              <p className="text-sm text-gray-400 mt-1">Boshlash uchun birinchi yig'imingizni yarating</p>
            </Card>
          </motion.div>
        ) : null}
      </motion.div>

      {showForm && (
        <CollectionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchCollections();
          }} 
        />
      )}
    </motion.div>
  );
};

export default Collections;