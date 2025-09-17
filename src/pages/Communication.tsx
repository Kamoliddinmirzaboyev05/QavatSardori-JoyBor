import React, { useState, useMemo } from 'react';
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle, Megaphone, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import RequestForm from '../components/requests/RequestForm';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/storage';
import { clsx } from 'clsx';

const Communication: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'requests' | 'announcements'>('requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'barchasi' | 'ochiq' | 'jarayonda' | 'hal_qilindi'>('barchasi');

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  const filteredRequests = useMemo(() => {
    return state.requests.filter(request => 
      selectedStatus === 'barchasi' || request.status === selectedStatus
    );
  }, [state.requests, selectedStatus]);

  const sortedAnnouncements = [...state.announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStudentName = (studentId: string) => {
    const student = activeStudents.find(s => s.id === studentId);
    return student ? student.name : 'Noma\'lum talaba';
  };

  const updateRequestStatus = (requestId: string, status: 'ochiq' | 'jarayonda' | 'hal_qilindi') => {
    const request = state.requests.find(r => r.id === requestId);
    if (request) {
      dispatch({
        type: 'UPDATE_REQUEST',
        payload: { ...request, status }
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ochiq':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'jarayonda':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'hal_qilindi':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ochiq':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'jarayonda':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'hal_qilindi':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const statusCounts = {
    barchasi: state.requests.length,
    ochiq: state.requests.filter(r => r.status === 'ochiq').length,
    jarayonda: state.requests.filter(r => r.status === 'jarayonda').length,
    hal_qilindi: state.requests.filter(r => r.status === 'hal_qilindi').length
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Aloqa</h2>
          <p className="text-sm text-gray-600">So'rovlar va e'lonlar boshqaruvi</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('requests')}
          className={clsx(
            "flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'requests'
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          So'rovlar ({state.requests.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={clsx(
            "flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'announcements'
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          E'lonlar ({state.announcements.length})
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi so'rov
            </Button>
          </div>

          {/* Status Filter */}
          <Card>
            <div className="grid grid-cols-4 gap-2">
              {(['barchasi', 'ochiq', 'jarayonda', 'hal_qilindi'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={clsx(
                    "flex flex-col items-center p-3 rounded-lg transition-colors",
                    selectedStatus === status
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                      : "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg font-bold">{statusCounts[status]}</span>
                  <span className="text-xs capitalize">
                    {status === 'barchasi' ? 'Barchasi' : 
                     status === 'ochiq' ? 'Ochiq' :
                     status === 'jarayonda' ? 'Jarayonda' : 'Hal qilindi'}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Requests List */}
          <div className="space-y-3">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.content}</p>
                      <p className="text-xs text-gray-500">
                        Kimdan: {getStudentName(request.studentId)} • {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div
                      className={clsx(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(request.status)
                      )}
                    >
                      {request.status === 'ochiq' ? 'OCHIQ' :
                       request.status === 'jarayonda' ? 'JARAYONDA' : 'HAL QILINDI'}
                    </div>

                    {request.status !== 'hal_qilindi' && (
                      <div className="flex space-x-2">
                        {request.status === 'ochiq' && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => updateRequestStatus(request.id, 'jarayonda')}
                          >
                            Jarayonni boshlash
                          </Button>
                        )}
                        {request.status === 'jarayonda' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateRequestStatus(request.id, 'hal_qilindi')}
                          >
                            Hal qilindi
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">So'rovlar topilmadi</p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowAnnouncementForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi e'lon
            </Button>
          </div>

          <div className="space-y-4">
            {sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {announcement.isImportant ? (
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <Megaphone className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        {announcement.isImportant && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Muhim
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{announcement.content}</p>
                      
                      <p className="text-xs text-gray-500">
                        {formatDateTime(announcement.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Hali e'lonlar yo'q</p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Forms */}
      {showRequestForm && (
        <RequestForm onClose={() => setShowRequestForm(false)} />
      )}

      {showAnnouncementForm && (
        <AnnouncementForm onClose={() => setShowAnnouncementForm(false)} />
      )}

    </div>
  );
};

export default Communication;