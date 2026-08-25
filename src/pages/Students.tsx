import React, { useState, useMemo } from 'react';
import { Phone, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import SearchInput from '../components/common/SearchInput';
import { useApp } from '../context/AppContext';

const Students: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Talabalar</h2>
        <p className="text-sm text-surface-600">{activeStudents.length} faol talaba</p>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Talabalarni qidirish..."
      />

      <div className="space-y-3">
        {activeStudents.length > 0 ? (
          activeStudents.map((student) => (
            <Card key={student.id}>
              <h3 className="font-semibold text-surface-900">{student.name} {student.lastName}</h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-surface-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {student.room}-xona
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {student.phone}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <p className="text-surface-500">Talabalar topilmadi</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Students;
