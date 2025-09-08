import { Student, Collection, Announcement, Request, generateId } from './storage';

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Ahmad Karimov',
    room: '101',
    phone: '+998901234567',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-2',
    name: 'Fatima Aliyeva',
    room: '102',
    phone: '+998901234568',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-3',
    name: 'Bobur Rahimov',
    room: '103',
    phone: '+998901234569',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-4',
    name: 'Malika Tosheva',
    room: '104',
    phone: '+998901234570',
    createdAt: new Date().toISOString()
  }
];

export const mockCollections: Collection[] = [
  {
    id: 'collection-1',
    title: 'Tozalik uchun hissa',
    amount: 50000,
    description: 'Qavatni tozalash uchun umumiy yig\'im',
    dueDate: '2025-02-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-2',
    title: 'WiFi uchun to\'lov',
    amount: 30000,
    description: 'Oylik internet to\'lovi',
    dueDate: '2025-02-01',
    createdAt: new Date().toISOString()
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Yangi qoidalar e\'lon qilinadi',
    content: 'Yotoqxona qoidalari yangilanmoqda. Barcha talabalar diqqat bilan o\'qishlari so\'raladi.',
    isImportant: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'announcement-2',
    title: 'Tozalik kuni',
    content: 'Ertaga umumiy tozalik kuni. Barcha talabalar ishtirok etishlari kerak.',
    isImportant: false,
    createdAt: new Date().toISOString()
  }
];

export const mockRequests: Request[] = [
  {
    id: 'request-1',
    studentId: 'student-1',
    title: 'Konditsioner tuzatish',
    content: 'Xonamdagi konditsioner ishlamayapti. Tuzatishni so\'rayman.',
    status: 'open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'request-2',
    studentId: 'student-2',
    title: 'Kalit almashish',
    content: 'Xona kalitini yo\'qotib qo\'ydim. Yangi kalit kerak.',
    status: 'in_progress',
    createdAt: new Date().toISOString()
  }
];