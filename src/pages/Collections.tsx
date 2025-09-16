import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CollectionForm from '../components/collections/CollectionForm';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';

const Collections: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  const getCollectionPayments = (collectionId: string) => {
    return state.payments.filter(payment => payment.collectionId === collectionId);
  };

  const getCollectionStats = (collectionId: string) => {
    const payments = getCollectionPayments(collectionId);
    const paid = payments.filter(p => p.isPaid).length;
    const total = payments.length;
    const collected = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const expected = payments.reduce((sum, p) => sum + p.amount, 0);
    
    return { paid, total, collected, expected };
  };

  const togglePayment = (paymentId: string) => {
    const payment = state.payments.find(p => p.id === paymentId);
    if (payment) {
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          ...payment,
          isPaid: !payment.isPaid,
          paidAt: !payment.isPaid ? new Date().toISOString() : undefined
        }
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Yig'imlar</h2>
          <p className="text-sm text-gray-600">Talabalar to'lovlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yangi yig'im
        </Button>
      </div>

      <div className="space-y-4">
        {state.collections.length > 0 ? (
          state.collections.map((collection) => {
            const stats = getCollectionStats(collection.id);
            const isSelected = selectedCollection === collection.id;
            
            return (
              <Card key={collection.id}>
                <div 
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-1 -m-1"
                  onClick={() => navigate(`/collections/${collection.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {collection.amount.toLocaleString()} so'm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      Muddat: {formatDate(collection.dueDate)}
                    </div>
                    <div className="text-blue-600 font-medium">
                      {stats.paid}/{stats.total} to'landi ({Math.round((stats.paid / stats.total) * 100)}%)
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
                        style={{ width: `${(stats.collected / stats.expected) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Hali yig'imlar yo'q</p>
            <p className="text-sm text-gray-400 mt-1">Boshlash uchun birinchi yig'imingizni yarating</p>
          </Card>
        )}
      </div>

      {showForm && (
        <CollectionForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Collections;