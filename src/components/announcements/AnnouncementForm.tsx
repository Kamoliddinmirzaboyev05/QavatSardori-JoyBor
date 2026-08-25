import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const announcementSchema = z.object({
  title: z.string().min(3, 'Sarlavha kamida 3 ta belgidan iborat bo\'lishi kerak'),
  content: z.string().min(10, 'Matn kamida 10 ta belgidan iborat bo\'lishi kerak'),
  isImportant: z.boolean().default(false)
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  onClose: () => void;
  onSubmit?: (data: AnnouncementFormData) => void | Promise<void>;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onClose, onSubmit: onSubmitProp }) => {
  const { state } = useApp();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema)
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      if (onSubmitProp) {
        await onSubmitProp(data);
        return;
      }
      const userId = state.user?.id ? Number(state.user.id) : undefined;
      if (!userId || Number.isNaN(userId)) {
        toast.error("Foydalanuvchi ID topilmadi — qayta kiring");
        return;
      }
      await apiService.createAnnouncement({
        title: data.title,
        content: data.content,
        user: userId,
      });
      toast.success("E'lon yaratildi");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "E'lon yuborilmadi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-[5px] sm:rounded-[5px] w-full max-w-md max-h-[min(92dvh,92vh)] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-surface-200 shrink-0">
          <h2 className="text-lg font-semibold text-surface-900">Yangi e&apos;lon</h2>
          <button type="button" onClick={onClose} className="text-surface-400 hover:text-surface-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Sarlavha</label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-surface-300 rounded-[5px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="masalan, Muhim xabar"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Matn</label>
              <textarea
                {...register('content')}
                rows={4}
                className="w-full px-3 py-2 border border-surface-300 rounded-[5px] focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="E'loningizni bu yerga yozing..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-danger-600">{errors.content.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('isImportant')}
                type="checkbox"
                id="isImportant"
                className="h-4 w-4 text-danger-600 focus:ring-danger-500 border-surface-300 rounded"
              />
              <label htmlFor="isImportant" className="ml-2 block text-sm text-surface-700">
                Muhim deb belgilash (yuqori ustuvorlik)
              </label>
            </div>
          </div>

          <div className="flex gap-3 p-4 border-t border-surface-100 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "E'lon qilinmoqda..." : "E'lon qilish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;