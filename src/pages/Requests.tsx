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
        return <AlertCircle className="w-5 h-5 text-danger-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-warning-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-surface-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'in_progress':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'resolved':
        return 'text-success-600 bg-success-50 border-success-200';
      default:
        return 'text-surface-600 bg-surface-50 border-surface-200';
    }
  };

  const filters: UiFilter[] = ['barchasi', 'pending', 'in_progress', 'resolved'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">So'rovlar / Shikoyatlar</h2>
          <p className="text-sm text-surface-600">Talabalar shikoyatlarini boshqarish (API)</p>
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
                  ? 'bg-brand-100 text-brand-700 border-2 border-brand-300'
                  : 'bg-surface-50 text-surface-600 border-2 border-transparent hover:bg-surface-100'
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
            <RefreshCw className="w-8 h-8 text-surface-400 mx-auto mb-2 animate-spin" />
            <p className="text-surface-500">Yuklanmoqda...</p>
          </Card>
        ) : complaints.length > 0 ? (
          complaints.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="font-semibold text-surface-900">{request.title}</h3>
                  </div>
                  <p className="text-sm text-surface-600 mb-2">{request.description}</p>
                  <p className="text-xs text-surface-500">
                    Kimdan: {request.student_name || 'Noma\'lum'}
                    {request.created_at ? ` • ${formatDateTime(request.created_at)}` : ''}
                    {request.category ? ` • ${request.category}` : ''}
                  </p>
                  {request.admin_response && (
                    <p className="text-xs text-brand-700 mt-2">Javob: {request.admin_response}</p>
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
            <MessageCircle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500">So'rovlar topilmadi</p>
            <p className="text-sm text-surface-400 mt-1">
              Talabalar shikoyat yuborganda shu yerda ko'rinadi
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Requests;
