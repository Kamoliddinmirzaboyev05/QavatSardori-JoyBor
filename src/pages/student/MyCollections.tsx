import React, { useMemo } from 'react';
import { DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/storage';

const MyCollections: React.FC = () => {
  const { state } = useApp();
  
  const myPayments = useMemo(() => {
    if (!state.currentStudentId) return [];
    return state.payments.filter(payment => payment.studentId === state.currentStudentId);
  }, [state.payments, state.currentStudentId]);

  const paymentsWithCollection = useMemo(() => {
    return myPayments.map(payment => {
      const collection = state.collections.find(c => c.id === payment.collectionId);
      return { payment, collection };
    }).filter(item => item.collection);
  }, [myPayments, state.collections]);

  const stats = useMemo(() => {
    const total = myPayments.length;
    const paid = myPayments.filter(p => p.isPaid).length;
    const unpaid = total - paid;
    const totalAmount = myPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = myPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    
    return { total, paid, unpaid, totalAmount, paidAmount };
  }, [myPayments]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Payments</h2>
        <p className="text-sm text-gray-600">Track your payment status</p>
      </div>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
            <p className="text-sm text-gray-600">Unpaid</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-600">
              {stats.paidAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Paid Amount</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {(stats.totalAmount - stats.paidAmount).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Remaining</p>
          </div>
        </div>
      </Card>

      {/* Payment List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        {paymentsWithCollection.length > 0 ? (
          paymentsWithCollection.map(({ payment, collection }) => (
            <Card key={payment.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{collection?.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{collection?.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {collection && formatDate(collection.dueDate)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {payment.amount.toLocaleString()} so'm
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    {payment.isPaid ? (
                      <div className="flex items-center text-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Paid</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Unpaid</span>
                      </div>
                    )}
                  </div>
                  {payment.isPaid && payment.paidAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid on {formatDate(payment.paidAt)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payments yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your payment history will appear here
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCollections;