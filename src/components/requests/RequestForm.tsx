import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';

const requestSchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 ta belgidan iborat bo\'lishi kerak'),
  content: z.string().min(10, 'Matn kamida 10 ta belgidan iborat bo\'lishi kerak')
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  onClose: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onClose }) => {
  const { state, dispatch } = useApp();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      if (!state.currentStudentId) {
        console.error('No current student ID');
        return;
      }

      dispatch({
        type: 'ADD_REQUEST',
        payload: {
          ...data,
          studentId: state.currentStudentId,
          status: 'ochiq'
        }
      });
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Yangi so'rov</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mavzu
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="masalan, Xonadagi konditsioner ishlamayapti"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tavsif
            </label>
            <textarea
              {...register('content')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="So'rovingizni batafsil tasvirlab bering..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Yuborilmoqda...' : 'So\'rov yuborish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;