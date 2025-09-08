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
  const presentToday = todaysAttendance.filter(record => record.status === 'present').length;
  const attendanceRate = activeStudents.length > 0 ? Math.round((presentToday / activeStudents.length) * 100) : 0;

  const totalCollections = state.collections.reduce((sum, collection) => sum + collection.amount, 0);
  const paidPayments = state.payments.filter(payment => payment.isPaid);
  const totalCollected = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const collectionRate = totalCollections > 0 ? Math.round((totalCollected / (totalCollections * activeStudents.length)) * 100) : 0;

  const openRequests = state.requests.filter(request => request.status === 'open').length;
  const recentAnnouncements = state.announcements.slice(0, 3);

  if (state.role === 'student') {
    const currentStudent = state.students.find(s => s.id === state.currentStudentId);
    const myAttendance = state.attendance.filter(record => record.studentId === state.currentStudentId);
    const myPayments = state.payments.filter(payment => payment.studentId === state.currentStudentId);
    const myRequests = state.requests.filter(request => request.studentId === state.currentStudentId);

    return (
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Salom, {currentStudent?.name || 'Talaba'}!</h2>
          <p className="text-gray-600">Xona: {currentStudent?.room}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{myAttendance.filter(a => a.status === 'present').length}</p>
            <p className="text-sm text-gray-600">Present Days</p>
          </Card>

          <Card className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{myPayments.filter(p => p.isPaid).length}</p>
            <p className="text-sm text-gray-600">Paid Bills</p>
          </Card>

          <Card className="text-center">
            <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{myRequests.length}</p>
            <p className="text-sm text-gray-600">My Requests</p>
          </Card>

          <Card className="text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{myAttendance.length}</p>
            <p className="text-sm text-gray-600">Total Days</p>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
          <div className="space-y-3">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No announcements</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Floor management overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeStudents.length}</p>
          <p className="text-sm text-gray-600">Active Students</p>
        </Card>

        <Card className="text-center">
          <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
          <p className="text-sm text-gray-600">Today's Attendance</p>
        </Card>

        <Card className="text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
          <p className="text-sm text-gray-600">Collection Rate</p>
        </Card>

        <Card className="text-center">
          <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{openRequests}</p>
          <p className="text-sm text-gray-600">Open Requests</p>
        </Card>
      </div>

      {/* Today's Attendance Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Present</span>
            <span className="text-sm font-medium text-emerald-600">
              {todaysAttendance.filter(a => a.status === 'present').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Late</span>
            <span className="text-sm font-medium text-orange-600">
              {todaysAttendance.filter(a => a.status === 'late').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Absent</span>
            <span className="text-sm font-medium text-red-600">
              {todaysAttendance.filter(a => a.status === 'absent').length}
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
        <div className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{announcement.content.substring(0, 100)}...</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent announcements</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;