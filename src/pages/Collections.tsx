import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Calendar, Users, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CollectionForm from '../components/collections/CollectionForm';
import { formatDate } from '../utils/storage';
import { apiService } from '../services/api';
import { clsx } from 'clsx';

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
      const data = await apiService.getCollections();
      setCollections(data);
    } catch (err) {
      setError('Yig\'imlarni yuklashda xatolik yuz berdi');
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const getCollectionStats = (collection: ApiCollection) => {
    if (!collection.rooms) {
      return { paid: 0, total: 0, collected: 0, expected: 0 };
    }

    let paid = 0;
    let total = 0;
    
    collection.rooms.forEach(room => {
      room.students.forEach(student => {
        total++;
        if (student.status === 'paid' || student.status === 'to\'langan') {
          paid++;
        }
      });
    });

    const collected = paid * collection.amount;
    const expected = total * collection.amount;
    
    return { paid, total, collected, expected };
  };

  const handleCollectionClick = (collection: ApiCollection) => {
    navigate(`/collections/${collection.id}`);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yig'imlar</h2>
          <p className="text-sm text-gray-600">Talabalar to'lovlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi yig'im
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yig'imlar yuklanmoqda...</p>
        </div>
      )}

      <div className="space-y-4">
        {!isLoading && collections.length > 0 ? (
          collections.map((collection) => {
            const stats = getCollectionStats(collection);
            
            return (
              <Card 
                key={collection.id}
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

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {collection.deadline ? (
                      <>Muddat: {formatDate(collection.deadline)}</>
                    ) : (
                      'Muddat belgilanmagan'
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">
                    {stats.paid}/{stats.total} to'landi ({stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%)
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Yig'ildi</span>
                    <span className="font-medium">
                      {stats.collected.toLocaleString()} / {stats.expected.toLocaleString()} so'm
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.expected > 0 ? (stats.collected / stats.expected) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        ) : !isLoading ? (
          <Card className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Hali yig'imlar yo'q</p>
            <p className="text-sm text-gray-400 mt-1">Boshlash uchun birinchi yig'imingizni yarating</p>
          </Card>
        ) : null}
      </div>

      {showForm && (
        <CollectionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchCollections();
          }} 
        />
      )}
    </div>
  );
};

export default Collections;