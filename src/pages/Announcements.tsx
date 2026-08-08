import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Megaphone, AlertTriangle, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/storage';
import apiService from '../services/api';
import { toast } from 'sonner';

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

const Announcements: React.FC = () => {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
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
      setItems(combined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "E'lonlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload: { title: string; content: string; isImportant?: boolean }) => {
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
      toast.success("E'lon (vazifa) yaratildi");
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yaratishda xatolik");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">E'lonlar</h2>
          <p className="text-sm text-surface-600">
            Bildirishnomalar va sardor vazifalari (API)
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={load}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {state.role === 'qavat_sardori' && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <AnnouncementForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      <div className="space-y-4">
        {loading ? (
          <Card className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-surface-400 mx-auto animate-spin" />
          </Card>
        ) : items.length > 0 ? (
          items.map((announcement) => (
            <Card key={`${announcement.type || 'n'}-${announcement.id}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {announcement.type === 'task' ? (
                    <div className="flex items-center justify-center w-10 h-10 bg-danger-100 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-danger-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 bg-brand-100 rounded-full">
                      <Megaphone className="w-5 h-5 text-brand-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900 mb-1">
                    {announcement.title || (announcement.type === 'task' ? 'Vazifa' : "E'lon")}
                  </h3>
                  <p className="text-surface-700 mb-3">
                    {announcement.message || announcement.content || announcement.description}
                  </p>
                  {announcement.created_at && (
                    <p className="text-xs text-surface-500">
                      {formatDateTime(announcement.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <Megaphone className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-500">Hali e'lonlar yo'q</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Announcements;
