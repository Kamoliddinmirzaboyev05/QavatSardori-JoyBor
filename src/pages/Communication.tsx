import React, { useCallback, useEffect, useState } from 'react';
import {
  MessageCircle,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/storage';
import apiService from '../services/api';

type Tab = 'complaints' | 'announcements';
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

interface NotifItem {
  id: number;
  message?: string;
  title?: string;
  content?: string;
  description?: string;
  created_at?: string;
  is_read?: boolean;
  type?: string;
}

const STATUS_MAP: Record<ApiStatus, string> = {
  pending: 'Ochiq',
  in_progress: 'Jarayonda',
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
};

const Communication: React.FC = () => {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('complaints');

  // —— Shikoyatlar ——
  const [statusFilter, setStatusFilter] = useState<UiFilter>('barchasi');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  // —— E'lonlar ——
  const [announcements, setAnnouncements] = useState<NotifItem[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadComplaints = useCallback(async () => {
    setComplaintsLoading(true);
    try {
      const data = await apiService.getComplaints(
        statusFilter === 'barchasi' ? undefined : { status: statusFilter }
      );
      const list = Array.isArray(data)
        ? data
        : ((data as { results?: Complaint[] })?.results || []);
      setComplaints(list as Complaint[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Shikoyatlarni yuklashda xatolik");
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }, [statusFilter]);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const [notifs, tasks] = await Promise.all([
        apiService.getNotifications().catch(() => []),
        apiService.getTasksForLeaders().catch(() => []),
      ]);
      const nList = Array.isArray(notifs)
        ? notifs
        : ((notifs as { results?: NotifItem[] })?.results || []);
      const tList = Array.isArray(tasks)
        ? tasks
        : ((tasks as { results?: NotifItem[] })?.results || []);
      const mappedTasks = (tList as NotifItem[]).map((t) => ({
        ...t,
        message: t.description || t.message,
        type: 'task',
      }));
      const combined = [...(nList as NotifItem[]), ...mappedTasks].sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
      setAnnouncements(combined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "E'lonlarni yuklashda xatolik");
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'complaints') loadComplaints();
  }, [tab, loadComplaints]);

  useEffect(() => {
    if (tab === 'announcements') loadAnnouncements();
  }, [tab, loadAnnouncements]);

  const updateStatus = async (id: number, status: ApiStatus) => {
    try {
      await apiService.updateComplaint(id, { status });
      toast.success('Holat yangilandi');
      await loadComplaints();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Yangilashda xatolik');
    }
  };

  const handleCreateAnnouncement = async (payload: {
    title: string;
    content: string;
    isImportant?: boolean;
  }) => {
    try {
      const userId = state.user?.id ? Number(state.user.id) : undefined;
      if (!userId || Number.isNaN(userId)) {
        toast.error("Foydalanuvchi ID topilmadi — qayta kiring");
        return;
      }
      await apiService.createAnnouncement({
        title: payload.title,
        content: payload.content,
        user: userId,
      });
      toast.success("E'lon yaratildi");
      setShowForm(false);
      await loadAnnouncements();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yaratishda xatolik");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-orange-500 shrink-0" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500 shrink-0" />;
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
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Aloqa</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Shikoyatlar va e&apos;lonlar
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => (tab === 'complaints' ? loadComplaints() : loadAnnouncements())}
          className="shrink-0"
        >
          <RefreshCw
            className={clsx(
              'w-4 h-4',
              (tab === 'complaints' ? complaintsLoading : announcementsLoading) && 'animate-spin'
            )}
          />
        </Button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-[5px]">
        <button
          type="button"
          onClick={() => setTab('complaints')}
          className={clsx(
            'flex items-center justify-center gap-2 py-2.5 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-colors',
            tab === 'complaints'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Shikoyatlar
        </button>
        <button
          type="button"
          onClick={() => setTab('announcements')}
          className={clsx(
            'flex items-center justify-center gap-2 py-2.5 rounded-[5px] text-[10px] font-bold uppercase tracking-widest transition-colors',
            tab === 'announcements'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          <Megaphone className="w-4 h-4" />
          E&apos;lonlar
        </button>
      </div>

      {/* ——— Shikoyatlar tab ——— */}
      {tab === 'complaints' && (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  'px-1 py-2 rounded-[5px] text-[9px] font-bold uppercase tracking-tight transition-colors border-2',
                  statusFilter === f
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                )}
              >
                {f === 'barchasi' ? 'Barchasi' : STATUS_MAP[f as ApiStatus]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {complaintsLoading ? (
              <Card className="text-center py-10">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">Yuklanmoqda...</p>
              </Card>
            ) : complaints.length > 0 ? (
              complaints.map((item) => (
                <Card key={item.id} className="p-4 border border-gray-100">
                  <div className="flex items-start gap-2 mb-2">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {item.student_name || 'Nomaʼlum'}
                        {item.created_at ? ` · ${formatDateTime(item.created_at)}` : ''}
                        {item.category ? ` · ${item.category}` : ''}
                      </p>
                      {item.admin_response && (
                        <p className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded-[5px]">
                          Javob: {item.admin_response}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
                    <span
                      className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border uppercase',
                        getStatusColor(item.status)
                      )}
                    >
                      {STATUS_MAP[item.status] || item.status}
                    </span>

                    {item.status !== 'resolved' && item.status !== 'rejected' && (
                      <div className="flex gap-2">
                        {item.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => updateStatus(item.id, 'in_progress')}
                          >
                            Jarayon
                          </Button>
                        )}
                        {item.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateStatus(item.id, 'resolved')}
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
              <Card className="text-center py-12 border-dashed border-2 border-gray-100 bg-transparent shadow-none">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  Shikoyatlar yo&apos;q
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 max-w-[220px] mx-auto">
                  Talabalar murojaat yuborganda shu yerda ko&apos;rinadi
                </p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* ——— E'lonlar tab ——— */}
      {tab === 'announcements' && (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Yangi e&apos;lon
            </Button>
          </div>

          {showForm && (
            <AnnouncementForm
              onClose={() => setShowForm(false)}
              onSubmit={handleCreateAnnouncement}
            />
          )}

          <div className="space-y-3">
            {announcementsLoading ? (
              <Card className="text-center py-10">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
              </Card>
            ) : announcements.length > 0 ? (
              announcements.map((item) => (
                <Card
                  key={`${item.type || 'n'}-${item.id}`}
                  className="p-4 border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                        item.type === 'task' ? 'bg-red-100' : 'bg-blue-100'
                      )}
                    >
                      {item.type === 'task' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Megaphone className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {item.title || (item.type === 'task' ? 'Vazifa' : "E'lon")}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.message || item.content || item.description || '—'}
                      </p>
                      {item.created_at && (
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {formatDateTime(item.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12 border-dashed border-2 border-gray-100 bg-transparent shadow-none">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  E&apos;lonlar yo&apos;q
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                  Yangi e&apos;lon yaratish uchun tugmani bosing
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Communication;
