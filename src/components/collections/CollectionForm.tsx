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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: CollectionFormData) => {
    try {
      // Map dueDate -> deadline for API
      const payload = {
        title: data.title,
        amount: data.amount,
        description: data.description,
        deadline: new Date(data.dueDate).toISOString(),
      };

      await apiService.createCollection(payload);
      toast.success('Yig\'im muvaffaqiyatli yaratildi');
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Yig\'im yaratishda xatolik';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Yangi yig'im</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="masalan, Oylik WiFi to'lovi"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Miqdor (so'm)</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bu yig'im nima uchun ekanligini tasvirlab bering..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Yaratilmoqda...' : 'Yig\'im yaratish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;