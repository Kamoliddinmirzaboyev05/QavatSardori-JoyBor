import React, { useState, useMemo } from 'react';
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RequestForm from '../../components/requests/RequestForm';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/storage';

const MyRequests: React.FC = () => {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  const myRequests = useMemo(() => {
    if (!state.currentStudentId) return [];
    return state.requests
      .filter(request => request.studentId === state.currentStudentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.requests, state.currentStudentId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'resolved':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const stats = useMemo(() => {
    const total = myRequests.length;
    const open = myRequests.filter(r => r.status === 'open').length;
    const inProgress = myRequests.filter(r => r.status === 'in_progress').length;
    const resolved = myRequests.filter(r => r.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  }, [myRequests]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Requests</h2>
          <p className="text-sm text-gray-600">Submit and track your requests</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            <p className="text-sm text-gray-600">Open</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <div className="space-y-3">
        {myRequests.length > 0 ? (
          myRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(request.status)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{request.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{request.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {formatDateTime(request.createdAt)}
                      {request.updatedAt && (
                        <span> • Updated {formatDateTime(request.updatedAt)}</span>
                      )}
                    </p>
                    
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                    >
                      {request.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No requests yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit your first request for assistance
            </p>
          </Card>
        )}
      </div>

      {showForm && (
        <RequestForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default MyRequests;