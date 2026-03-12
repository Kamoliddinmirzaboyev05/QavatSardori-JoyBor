import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StudentForm from '../components/students/StudentForm';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import apiService from '../services/api';
import { toast } from 'sonner';

const Students: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();

  const activeStudents = useMemo(() => {
    return state.students
      .filter(student => !student.isDeleted)
      .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
      );
  }, [state.students, searchTerm]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (studentId: string) => {
    if (confirm('Haqiqatan ham bu talabani o\'chirmoqchimisiz?')) {
      try {
        await apiService.deleteStudent(studentId);
        dispatch({ type: 'DELETE_STUDENT', payload: studentId });
        toast.success('Talaba o\'chirildi');
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Talabani o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(undefined);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Talabalar</h2>
          <p className="text-sm text-gray-600">{activeStudents.length} faol talaba</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Talaba qo'shish
        </Button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Talabalarni qidirish..."
      />

      <div className="space-y-3">
        {activeStudents.length > 0 ? (
          activeStudents.map((student) => (
            <Card key={student.id} className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{student.name} {student.lastName}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {student.room}-xona
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {student.phone}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-500">Talabalar topilmadi</p>
          </Card>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Students;