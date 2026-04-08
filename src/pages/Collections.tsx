import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, DollarSign, Calendar, ChevronRight, RefreshCw } from 'lucide-react';
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
      className="p-4 space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex flex-col space-y-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Yig'imlar</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Talabalar to'lovlarini boshqarish</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={fetchCollections}
            variant="secondary"
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-[5px] text-[10px] font-bold uppercase tracking-widest"
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
            )}
            Yangilash
          </Button>
          
          <Button 
            onClick={() => setShowForm(true)}
            className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-[5px] text-[10px] font-bold uppercase tracking-widest"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Yangi yig'im
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="p-3 bg-red-50 border border-red-100 rounded-[5px]"
          variants={itemVariants}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-[10px] font-bold text-red-600 uppercase text-center">{error}</p>
        </motion.div>
      )}

      {isLoading && (
        <motion.div 
          className="text-center py-12"
          variants={itemVariants}
        >
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yuklanmoqda...</p>
        </motion.div>
      )}

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
      >
        {!isLoading && collections.length > 0 ? (
          collections.map((collection) => {
            const stats = getCollectionStats(collection);
            
            return (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card 
                  className="p-0 overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                  onClick={() => handleCollectionClick(collection)}
                >
                  <div className="p-4 border-b border-gray-50 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{collection.title}</h3>
                      <p className="text-lg font-black text-gray-900 leading-none">
                        {collection.amount.toLocaleString()} <span className="text-[10px] font-bold text-gray-400 uppercase">so'm</span>
                      </p>
                    </div>
                    {collection.description && (
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-1">{collection.description}</p>
                    )}
                  </div>

                  <div className="p-4 space-y-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {collection.deadline ? formatDate(collection.deadline) : 'Muddat yo\'q'}
                      </div>
                      <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                        {stats.paid}/{stats.total} <span className="text-gray-400">to'landi</span>
                      </div>
                    </div>

                    {stats.total > 0 ? (
                      <div className="space-y-3">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            className="bg-gray-900 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded-[5px] border border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Yig'ildi</p>
                            <p className="text-xs font-black text-gray-900">{stats.collected.toLocaleString()} so'm</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-[5px] border border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Kutilmoqda</p>
                            <p className="text-xs font-black text-gray-900">{stats.expected.toLocaleString()} so'm</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 bg-gray-50 rounded-[5px] border border-dashed border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ma'lumotlar yo'q</p>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Batafsil ko'rish</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : !isLoading ? (
          <motion.div variants={itemVariants}>
            <Card className="text-center py-16 border-dashed border-2 border-gray-100 bg-transparent shadow-none">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Yig'imlar yo'q</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                Hali hech qanday yig'im yaratilmagan. Boshlash uchun tugmani bosing.
              </p>
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