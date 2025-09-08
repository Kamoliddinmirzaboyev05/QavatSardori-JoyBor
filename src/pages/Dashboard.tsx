import React from 'react';
import { Users, CheckCircle, DollarSign, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { getCurrentDate } from '../utils/storage';

const Dashboard: React.FC = () => {
  const { state } = useApp();

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

  if (state.role === 'talaba') {
    const currentStudent = state.students.find(s => s.id === state.currentStudentId);
    const myAttendance = state.attendance.filter(record => record.studentId === state.currentStudentId);
    const myPayments = state.payments.filter(payment => payment.studentId === state.currentStudentId);
    const myRequests = state.requests.filter(request => request.studentId === state.currentStudentId);
    
    const attendanceRate = myAttendance.length > 0 ? 
      Math.round((myAttendance.filter(a => a.status === 'hozir').length / myAttendance.length) * 100) : 0;
    
    const totalAmount = myPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = myPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const unpaidAmount = totalAmount - paidAmount;

    return (
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Salom, {currentStudent?.name || 'Talaba'}!</h2>
          <p className="text-gray-600">Xona: {currentStudent?.room} • Telefon: {currentStudent?.phone}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{attendanceRate}%</p>
            <p className="text-sm text-gray-600">Davomat darajasi</p>
          </Card>

          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{myPayments.filter(p => p.isPaid).length}</p>
            <p className="text-sm text-gray-600">To'langan</p>
          </Card>

          <Card className="text-center">
            <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{myRequests.filter(r => r.status === 'ochiq').length}</p>
            <p className="text-sm text-gray-600">Ochiq so'rovlar</p>
          </Card>

          <Card className="text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{myAttendance.length}</p>
            <p className="text-sm text-gray-600">Jami kunlar</p>
          </Card>
        </div>

        {/* Payment Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">To'lovlar umumiy ko'rinishi</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Jami miqdor</span>
              <span className="font-medium text-gray-900">{totalAmount.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">To'langan</span>
              <span className="font-medium text-emerald-600">{paidAmount.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Qolgan</span>
              <span className="font-medium text-red-600">{unpaidAmount.toLocaleString()} so'm</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">So'nggi e'lonlar</h3>
          <div className="space-y-3">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className={`border-l-4 pl-4 ${announcement.isImportant ? 'border-red-500' : 'border-blue-500'}`}>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                    {announcement.isImportant && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Muhim
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content.substring(0, 100)}...</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">E'lonlar yo'q</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Boshqaruv paneli</h2>
        <p className="text-gray-600">Qavat boshqaruvi umumiy ko'rinishi</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeStudents.length}</p>
          <p className="text-sm text-gray-600">Faol talabalar</p>
        </Card>

        <Card className="text-center">
          <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
          <p className="text-sm text-gray-600">Bugungi davomat</p>
        </Card>

        <Card className="text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
          <p className="text-sm text-gray-600">Yig'im darajasi</p>
        </Card>

        <Card className="text-center">
          <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{openRequests}</p>
          <p className="text-sm text-gray-600">Ochiq so'rovlar</p>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moliyaviy ko'rinish</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Jami yig'ilishi kerak</span>
            <span className="font-medium text-gray-900">
              {(totalCollections * activeStudents.length).toLocaleString()} so'm
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Yig'ilgan</span>
            <span className="font-medium text-emerald-600">{totalCollected.toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Qolgan</span>
            <span className="font-medium text-red-600">
              {((totalCollections * activeStudents.length) - totalCollected).toLocaleString()} so'm
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Today's Attendance Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bugungi davomat ({getCurrentDate()})</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600">
              {todaysAttendance.filter(a => a.status === 'hozir').length}
            </p>
            <p className="text-sm text-gray-600">Hozir</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-xl font-bold text-orange-600">
              {todaysAttendance.filter(a => a.status === 'kech').length}
            </p>
            <p className="text-sm text-gray-600">Kech</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">
              {todaysAttendance.filter(a => a.status === 'yoq').length}
            </p>
            <p className="text-sm text-gray-600">Yo'q</p>
          </div>
        </div>
      </Card>

      {/* Recent Requests */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">So'nggi so'rovlar</h3>
        <div className="space-y-3">
          {state.requests.slice(0, 3).map((request) => {
            const student = activeStudents.find(s => s.id === request.studentId);
            return (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{request.title}</h4>
                  <p className="text-sm text-gray-600">{student?.name} - {student?.room}-xona</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'ochiq' ? 'bg-red-100 text-red-800' :
                  request.status === 'jarayonda' ? 'bg-orange-100 text-orange-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {request.status === 'ochiq' ? 'OCHIQ' :
                   request.status === 'jarayonda' ? 'JARAYONDA' : 'HAL QILINDI'}
                </div>
              </div>
            );
          })}
          {state.requests.length === 0 && (
            <p className="text-gray-500 text-center py-4">So'rovlar yo'q</p>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">So'nggi e'lonlar</h3>
        <div className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className={`border-l-4 pl-4 ${announcement.isImportant ? 'border-red-500' : 'border-blue-500'}`}>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  {announcement.isImportant && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Muhim
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{announcement.content.substring(0, 100)}...</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">So'nggi e'lonlar yo'q</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;