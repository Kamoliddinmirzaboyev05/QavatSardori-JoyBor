import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Phone, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import StudentForm from '../components/students/StudentForm';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

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
        student.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
      );
  }, [state.students, searchTerm]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
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
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-600">{activeStudents.length} active students</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search students..."
      />

      <div className="space-y-3">
        {activeStudents.length > 0 ? (
          activeStudents.map((student) => (
            <Card key={student.id} className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Room {student.room}
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
            <p className="text-gray-500">No students found</p>
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