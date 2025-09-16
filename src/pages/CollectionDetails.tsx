import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Calendar, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/storage';
import { clsx } from 'clsx';

const CollectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const collection = useMemo(() => {
    return state.collections.find(c => c.id === id);
  }, [state.collections, id]);

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  const collectionPayments = useMemo(() => {
    if (!collection) return [];
    return state.payments.filter(payment => payment.collectionId === collection.id);
  }, [state.payments, collection]);

  const paymentsWithStudents = useMemo(() => {
    return collectionPayments.map(payment => {
      const student = activeStudents.find(s => s.id === payment.studentId);
      return { payment, student };
    }).filter(item => item.student);
  }, [collectionPayments, activeStudents]);

  const stats = useMemo(() => {
    const total = collectionPayments.length;
    const paid = collectionPayments.filter(p => p.isPaid).length;
    const unpaid = total - paid;
    const collected = collectionPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const expected = collectionPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return { total, paid, unpaid, collected, expected };
  }, [collectionPayments]);

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

  if (!collection) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <p className="text-gray-500">Yig'im topilmadi</p>
          <Button onClick={() => navigate('/collections')} className="mt-4">
            Orqaga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate('/collections')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{collection.title}</h1>
          <p className="text-sm text-gray-600">{collection.description}</p>
        </div>
      </div>

      {/* Collection Info */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{collection.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Miqdor (so'm)</p>
          </div>
          <div className="text-center">
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">{formatDate(collection.dueDate)}</p>
            <p className="text-sm text-gray-600">Muddat</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistika</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600">{stats.paid}</p>
            <p className="text-sm text-gray-600">To'langan</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{stats.unpaid}</p>
            <p className="text-sm text-gray-600">To'lanmagan</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Jami</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Yig'ilgan</span>
            <span className="font-medium text-emerald-600">{stats.collected.toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Qolgan</span>
            <span className="font-medium text-red-600">{(stats.expected - stats.collected).toLocaleString()} so'm</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.expected > 0 ? (stats.collected / stats.expected) * 100 : 0}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600">
            {stats.expected > 0 ? Math.round((stats.collected / stats.expected) * 100) : 0}% to'langan
          </p>
        </div>
      </Card>

      {/* Students List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Talabalar ro'yxati</h3>
        <div className="space-y-3">
          {paymentsWithStudents.length > 0 ? (
            paymentsWithStudents.map(({ payment, student }) => (
              <div 
                key={payment.id}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                  payment.isPaid 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => togglePayment(payment.id)}
                    className="flex-shrink-0"
                  >
                    {payment.isPaid ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
                    )}
                  </button>
                  <div>
                    <p className="font-medium text-gray-900">{student?.name}</p>
                    <p className="text-sm text-gray-600">{student?.room}-xona • {student?.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {payment.amount.toLocaleString()} so'm
                  </p>
                  {payment.isPaid && payment.paidAt && (
                    <p className="text-xs text-emerald-600">
                      {formatDate(payment.paidAt)} da to'langan
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Talabalar ro'yxati bo'sh</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tez amallar</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            onClick={() => {
              paymentsWithStudents.forEach(({ payment }) => {
                if (!payment.isPaid) {
                  togglePayment(payment.id);
                }
              });
            }}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Barchasini to'langan deb belgilash
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              paymentsWithStudents.forEach(({ payment }) => {
                if (payment.isPaid) {
                  togglePayment(payment.id);
                }
              });
            }}
            className="w-full"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Barchasini bekor qilish
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CollectionDetails;