export interface User {
  id: string;
  name: string;
  lastName: string;
  email?: string;
  role: string;
}

export interface Student {
  id: string;
  name: string;
  room: string;
  phone: string;
  createdAt: string;
  isDeleted?: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'hozir' | 'yoq' | 'kech';
  createdAt: string;
}

export interface Collection {
  id: string;
  title: string;
  amount: number;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  collectionId: string;
  studentId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isImportant: boolean;
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  studentId: string;
  readAt: string;
}

export interface Request {
  id: string;
  studentId: string;
  title: string;
  content: string;
  status: 'ochiq' | 'jarayonda' | 'hal_qilindi';
  createdAt: string;
  updatedAt?: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user?: User;
  students: Student[];
  attendance: AttendanceRecord[];
  collections: Collection[];
  payments: Payment[];
  announcements: Announcement[];
  announcementReads: AnnouncementRead[];
  requests: Request[];
}

export interface LeaderStatistics {
  active_students: number;
  collection_degree: number;
  today_attendance: number;
}
