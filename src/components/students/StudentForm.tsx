import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

const studentSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  room: z.string().min(1, 'Xona raqami talab qilinadi'),
  phone: z.string().min(10, 'Telefon raqami kamida 10 ta belgidan iborat bo\'lishi kerak')
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose }) => {
  const { dispatch } = useApp();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      name: student.name,
      room: student.room,
      phone: student.phone
    } : undefined
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (student) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: { ...student, ...data }
        });
      } else {
        dispatch({
          type: 'ADD_STUDENT',
          payload: data
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {student ? 'Talabani tahrirlash' : 'Talaba qo\'shish'}
          </h2>
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
              To'liq ismi
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Talaba ismini kiriting"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xona raqami
            </label>
            <input
              {...register('room')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="masalan, 101"
            />
            {errors.room && (
              <p className="mt-1 text-sm text-red-600">{errors.room.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon raqami
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+998901234567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
              {isSubmitting ? 'Saqlanmoqda...' : (student ? 'Yangilash' : 'Qo\'shish')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;