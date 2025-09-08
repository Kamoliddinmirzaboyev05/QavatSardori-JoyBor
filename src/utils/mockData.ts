import { Student, Collection, Announcement, Request } from '../types';
import { generateId } from './storage';

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
  },
  {
    id: 'student-5',
    name: 'Sardor Umarov',
    room: '105',
    phone: '+998901234571',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-6',
    name: 'Dilnoza Qodirova',
    room: '106',
    phone: '+998901234572',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-7',
    name: 'Jasur Abdullayev',
    room: '107',
    phone: '+998901234573',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-8',
    name: 'Nigora Yusupova',
    room: '108',
    phone: '+998901234574',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-9',
    name: 'Otabek Nazarov',
    room: '109',
    phone: '+998901234575',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-10',
    name: 'Zarina Ismoilova',
    room: '110',
    phone: '+998901234576',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-11',
    name: 'Aziz Tursunov',
    room: '111',
    phone: '+998901234577',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-12',
    name: 'Gulnora Hasanova',
    room: '112',
    phone: '+998901234578',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-13',
    name: 'Sherzod Mirzayev',
    room: '113',
    phone: '+998901234579',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-14',
    name: 'Madina Qosimova',
    room: '114',
    phone: '+998901234580',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-15',
    name: 'Davron Ergashev',
    room: '115',
    phone: '+998901234581',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-16',
    name: 'Sevara Normatova',
    room: '116',
    phone: '+998901234582',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-17',
    name: 'Rustam Saidov',
    room: '117',
    phone: '+998901234583',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-18',
    name: 'Nargiza Abdullayeva',
    room: '118',
    phone: '+998901234584',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-19',
    name: 'Bekzod Rakhimov',
    room: '119',
    phone: '+998901234585',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student-20',
    name: 'Dilfuza Karimova',
    room: '120',
    phone: '+998901234586',
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
  },
  {
    id: 'collection-3',
    title: 'Elektr energiya to\'lovi',
    amount: 75000,
    description: 'Oylik elektr energiya uchun to\'lov',
    dueDate: '2025-02-20',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-4',
    title: 'Suv to\'lovi',
    amount: 25000,
    description: 'Oylik suv uchun to\'lov',
    dueDate: '2025-02-10',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-5',
    title: 'Gaz to\'lovi',
    amount: 40000,
    description: 'Oylik gaz uchun to\'lov',
    dueDate: '2025-02-25',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-6',
    title: 'Lift ta\'mirlash',
    amount: 100000,
    description: 'Lift ta\'mirlash uchun yig\'im',
    dueDate: '2025-03-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-7',
    title: 'Xavfsizlik kameralari',
    amount: 80000,
    description: 'Yangi xavfsizlik kameralari o\'rnatish',
    dueDate: '2025-02-28',
    createdAt: new Date().toISOString()
  },
  {
    id: 'collection-8',
    title: 'Oshxona jihozlari',
    amount: 60000,
    description: 'Umumiy oshxona jihozlarini yangilash',
    dueDate: '2025-03-05',
    createdAt: new Date().toISOString()
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Yangi qoidalar e\'lon qilinadi',
    content: 'Yotoqxona qoidalari yangilanmoqda. Barcha talabalar diqqat bilan o\'qishlari so\'raladi. Yangi qoidalar: 1) Soat 23:00 dan keyin shovqin qilish taqiqlanadi. 2) Mehmonlarni keltirish uchun oldindan ruxsat olish kerak. 3) Umumiy joylarni tozalash navbat bo\'yicha amalga oshiriladi.',
    isImportant: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 kun oldin
  },
  {
    id: 'announcement-2',
    title: 'Tozalik kuni',
    content: 'Ertaga umumiy tozalik kuni. Barcha talabalar ishtirok etishlari kerak. Soat 09:00 da boshlanadi va 12:00 gacha davom etadi. Tozalik vositalari ta\'minlanadi.',
    isImportant: false,
    createdAt: new Date(Date.now() - 43200000).toISOString() // 12 soat oldin
  },
  {
    id: 'announcement-3',
    title: 'Internet uzilishi',
    content: 'Ertaga soat 14:00 dan 16:00 gacha texnik ishlar tufayli internet uziladi. Iltimos, muhim ishlaringizni oldindan tugatib qo\'ying.',
    isImportant: true,
    createdAt: new Date(Date.now() - 21600000).toISOString() // 6 soat oldin
  },
  {
    id: 'announcement-4',
    title: 'Yangi oshxona vaqtlari',
    content: 'Oshxona ish vaqti o\'zgartirildi. Yangi vaqt: 07:00-22:00. Kechki ovqat vaqti 19:00-21:00 oralig\'ida.',
    isImportant: false,
    createdAt: new Date(Date.now() - 10800000).toISOString() // 3 soat oldin
  },
  {
    id: 'announcement-5',
    title: 'Lift ta\'mirlash ishlari',
    content: 'Kelgusi hafta lift ta\'mirlash ishlari boshlanadi. Ish davomiyligi taxminan 3-5 kun. Bu vaqt ichida zinapoyadan foydalaning.',
    isImportant: true,
    createdAt: new Date(Date.now() - 7200000).toISOString() // 2 soat oldin
  },
  {
    id: 'announcement-6',
    title: 'Yangi xavfsizlik choralari',
    content: 'Yotoqxona xavfsizligini oshirish maqsadida yangi kameralar o\'rnatilmoqda. Barcha kirish-chiqish joylari nazorat ostida bo\'ladi.',
    isImportant: false,
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 soat oldin
  },
  {
    id: 'announcement-7',
    title: 'Elektr energiyasini tejash',
    content: 'Elektr energiyasini tejash maqsadida, xonalardan chiqayotganda chiroqlarni o\'chirishni unutmang. Konditsionerlarni ham kerak bo\'lmaganda o\'chiring.',
    isImportant: false,
    createdAt: new Date(Date.now() - 1800000).toISOString() // 30 daqiqa oldin
  },
  {
    id: 'announcement-8',
    title: 'Yangi WiFi parol',
    content: 'Xavfsizlik sabablariga ko\'ra WiFi paroli o\'zgartirildi. Yangi parol: YotoqxanaWiFi2025. Barcha qurilmalaringizni qayta ulang.',
    isImportant: true,
    createdAt: new Date().toISOString() // Hozir
  }
];

export const mockRequests: Request[] = [
  {
    id: 'request-1',
    studentId: 'student-1',
    title: 'Konditsioner tuzatish',
    content: 'Xonamdagi konditsioner ishlamayapti. Tuzatishni so\'rayman. Sovutish rejimi ishlamayapti va shovqin chiqarayapti.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 kun oldin
  },
  {
    id: 'request-2',
    studentId: 'student-2',
    title: 'Kalit almashish',
    content: 'Xona kalitini yo\'qotib qo\'ydim. Yangi kalit kerak. Iltimos, tezroq hal qiling.',
    status: 'jarayonda',
    createdAt: new Date(Date.now() - 43200000).toISOString() // 12 soat oldin
  },
  {
    id: 'request-3',
    studentId: 'student-3',
    title: 'Chiroq almashtirish',
    content: 'Xonamdagi chiroq yonmayapti. Almashtirishni so\'rayman.',
    status: 'hal_qilindi',
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 kun oldin
  },
  {
    id: 'request-4',
    studentId: 'student-4',
    title: 'Suv quvuri tuzatish',
    content: 'Hammomda suv quvuri oqayapti. Tuzatish kerak. Suv isrofi bo\'lyapti.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 21600000).toISOString() // 6 soat oldin
  },
  {
    id: 'request-5',
    studentId: 'student-5',
    title: 'Deraza tuzatish',
    content: 'Xona derazasi yopilmayapti. Tuzatishni so\'rayman. Shamol kiradi va sovuq.',
    status: 'jarayonda',
    createdAt: new Date(Date.now() - 10800000).toISOString() // 3 soat oldin
  },
  {
    id: 'request-6',
    studentId: 'student-6',
    title: 'WiFi muammosi',
    content: 'Xonamda WiFi signali juda zaif. Internet tez-tez uziladi. Tekshirib ko\'ring.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 7200000).toISOString() // 2 soat oldin
  },
  {
    id: 'request-7',
    studentId: 'student-7',
    title: 'Shkaf ta\'mirlash',
    content: 'Xonamdagi shkafning eshigi singan. Ta\'mirlash yoki almashtirish kerak.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 soat oldin
  },
  {
    id: 'request-8',
    studentId: 'student-8',
    title: 'Elektr rozetkasi',
    content: 'Xonamdagi elektr rozetkasi ishlamayapti. Telefon quvvatlash uchun kerak.',
    status: 'jarayonda',
    createdAt: new Date(Date.now() - 1800000).toISOString() // 30 daqiqa oldin
  },
  {
    id: 'request-9',
    studentId: 'student-9',
    title: 'Issiq suv muammosi',
    content: 'Hammomda issiq suv kelmayapti. Faqat sovuq suv bor. Tuzatishni so\'rayman.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 900000).toISOString() // 15 daqiqa oldin
  },
  {
    id: 'request-10',
    studentId: 'student-10',
    title: 'Stol va stul',
    content: 'Xonamdagi stol buzilgan va stul ham beqaror. Yangilarini so\'rayman.',
    status: 'hal_qilindi',
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 kun oldin
  },
  {
    id: 'request-11',
    studentId: 'student-11',
    title: 'Parda o\'rnatish',
    content: 'Xonamda parda yo\'q. Quyosh nuri juda kuchli kirib, uxlashga xalaqit beradi.',
    status: 'ochiq',
    createdAt: new Date(Date.now() - 600000).toISOString() // 10 daqiqa oldin
  },
  {
    id: 'request-12',
    studentId: 'student-12',
    title: 'Ventilatsiya tizimi',
    content: 'Xonamda havo aylanishi yomon. Ventilatsiya tizimini tekshiring.',
    status: 'jarayonda',
    createdAt: new Date(Date.now() - 300000).toISOString() // 5 daqiqa oldin
  }
];