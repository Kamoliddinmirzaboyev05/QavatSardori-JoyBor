import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../common/Button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const collectionSchema = z.object({
  title: z.string().min(3, 'Sarlavha kamida 3 ta belgidan iborat bo\'lishi kerak'),
  amount: z.number().min(1, 'Miqdor 0 dan katta bo\'lishi kerak'),
  description: z.string().min(5, 'Tavsif kamida 5 ta belgidan iborat bo\'lishi kerak').optional(),
  dueDate: z.string().min(1, 'Muddat talab qilinadi')
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: CollectionFormData) => {
    try {
      const payload = {
        title: data.title,
        amount: data.amount,
        description: data.description,
        deadline: new Date(data.dueDate).toISOString().split('T')[0], // YYYY-MM-DD format
      };

      await apiService.createCollection(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yig\'im yaratishda xatolik yuz berdi');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-[5px] sm:rounded-[5px] w-full max-w-md max-h-[min(92dvh,92vh)] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-surface-100 mb-0 sm:mb-0">
        <div className="flex items-center justify-between p-5 border-b border-surface-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-surface-900 uppercase tracking-tighter">Yangi yig&apos;im</h2>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">Ma&apos;lumotlarni to&apos;ldiring</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-surface-50 text-surface-400 hover:text-surface-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">Sarlavha</label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-surface-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all text-sm font-medium"
                placeholder="masalan, Oylik WiFi to'lovi"
              />
              {errors.title && (
                <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase ml-1">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">Miqdor (so&apos;m)</label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                min="0"
                step="1000"
                className="w-full px-4 py-3 border border-surface-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all text-sm font-medium"
                placeholder="50000"
              />
              {errors.amount && (
                <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase ml-1">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">Tavsif</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 border border-surface-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all text-sm font-medium resize-none"
                placeholder="Bu yig'im nima uchun ekanligini tasvirlab bering..."
              />
              {errors.description && (
                <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase ml-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">Muddat</label>
              <input
                {...register('dueDate')}
                type="date"
                className="w-full px-4 py-3 border border-surface-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all text-sm font-medium"
              />
              {errors.dueDate && (
                <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase ml-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-4 border-t border-surface-100 bg-white shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 bg-surface-100 text-surface-700 hover:bg-surface-200 py-3.5"
              onClick={onClose}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-surface-900 hover:bg-black text-white py-3.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Yaratilmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;