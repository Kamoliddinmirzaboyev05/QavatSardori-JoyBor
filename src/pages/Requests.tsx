import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDateTime } from '../utils/storage';
import { clsx } from 'clsx';
import apiService from '../services/api';
import { toast } from 'sonner';

type ApiStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
type UiFilter = 'barchasi' | 'pending' | 'in_progress' | 'resolved';

interface Complaint {
  id: number;
  title: string;
  description: string;
  status: ApiStatus;
  category?: string;
  student_name?: string;
  admin_response?: string;
  created_at?: string;
}

const STATUS_MAP: Record<ApiStatus, string> = {
  pending: 'Ochiq',
  in_progress: 'Jarayonda',
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
};

const Requests: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<UiFilter>('barchasi');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getComplaints(
        selectedStatus === 'barchasi' ? undefined : { status: selectedStatus }
      );
      const list = Array.isArray(data)
        ? data
        : ((data as { results?: Complaint[] })?.results || []);
      setComplaints(list as Complaint[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "So'rovlarni yuklashda xatolik");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: number, status: ApiStatus) => {
    try {
      await apiService.updateComplaint(id, { status });
      toast.success('Holat yangilandi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Yangilashda xatolik');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
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
      case 'pending':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'resolved':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filters: UiFilter[] = ['barchasi', 'pending', 'in_progress', 'resolved'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">So'rovlar / Shikoyatlar</h2>
          <p className="text-sm text-gray-600">Talabalar shikoyatlarini boshqarish (API)</p>
        </div>
        <Button size="sm" variant="secondary" onClick={load}>
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-4 gap-2">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={clsx(
                'flex flex-col items-center p-3 rounded-[5px] transition-colors',
                selectedStatus === status
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              )}
            >
              <span className="text-xs capitalize text-center">
                {status === 'barchasi'
                  ? 'Barchasi'
                  : STATUS_MAP[status as ApiStatus] || status}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <Card className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Yuklanmoqda...</p>
          </Card>
        ) : complaints.length > 0 ? (
          complaints.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="font-semibold text-gray-900">{request.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  <p className="text-xs text-gray-500">
                    Kimdan: {request.student_name || 'Noma\'lum'}
                    {request.created_at ? ` • ${formatDateTime(request.created_at)}` : ''}
                    {request.category ? ` • ${request.category}` : ''}
                  </p>
                  {request.admin_response && (
                    <p className="text-xs text-blue-700 mt-2">Javob: {request.admin_response}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={clsx(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(request.status)
                  )}
                >
                  {STATUS_MAP[request.status] || request.status}
                </div>

                {request.status !== 'resolved' && request.status !== 'rejected' && (
                  <div className="flex space-x-2">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => updateStatus(request.id, 'in_progress')}
                      >
                        Jarayonni boshlash
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateStatus(request.id, 'resolved')}
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
            <p className="text-sm text-gray-400 mt-1">
              Talabalar shikoyat yuborganda shu yerda ko'rinadi
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Requests;
