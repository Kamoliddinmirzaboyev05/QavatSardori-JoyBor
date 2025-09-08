import React, { useState, useMemo } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/storage';
import { clsx } from 'clsx';

const Requests: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const activeStudents = useMemo(() => {
    return state.students.filter(student => !student.isDeleted);
  }, [state.students]);

  const filteredRequests = useMemo(() => {
    return state.requests.filter(request => 
      selectedStatus === 'all' || request.status === selectedStatus
    );
  }, [state.requests, selectedStatus]);

  const getStudentName = (studentId: string) => {
    const student = activeStudents.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const updateRequestStatus = (requestId: string, status: 'open' | 'in_progress' | 'resolved') => {
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

  const statusCounts = {
    all: state.requests.length,
    open: state.requests.filter(r => r.status === 'open').length,
    in_progress: state.requests.filter(r => r.status === 'in_progress').length,
    resolved: state.requests.filter(r => r.status === 'resolved').length
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Requests</h2>
          <p className="text-sm text-gray-600">Manage student requests</p>
        </div>
      </div>

      {/* Status Filter */}
      <Card>
        <div className="grid grid-cols-4 gap-2">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
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
                {status === 'all' ? 'All' : status.replace('_', ' ')}
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
                    From: {getStudentName(request.studentId)} • {formatDateTime(request.createdAt)}
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
                  {request.status.replace('_', ' ').toUpperCase()}
                </div>

                {request.status !== 'resolved' && (
                  <div className="flex space-x-2">
                    {request.status === 'open' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => updateRequestStatus(request.id, 'in_progress')}
                      >
                        Start Progress
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateRequestStatus(request.id, 'resolved')}
                      >
                        Mark Resolved
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
            <p className="text-gray-500">No requests found</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedStatus === 'all' 
                ? 'Students can submit requests for assistance' 
                : `No ${selectedStatus.replace('_', ' ')} requests`
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Requests;