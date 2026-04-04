export interface User {
  id: string;
  name: string;
  lastName: string;
  email?: string;
  role: string;
  floor?: number;
  floorLeaderId?: number;
}

export interface Student {
  id: string;
  name: string;
  lastName?: string;
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
  open_tasks?: number;
}

export interface DashboardData {
  floor: {
    id: number;
    name: string;
    gender: string;
    dormitory: string;
  };
  students: {
    total: number;
    by_room: Array<{
      room: string;
      capacity: number;
      occupied: number;
      free: number;
    }>;
  };
  attendance_today: {
    has_session: boolean;
    session_id: number | null;
    present: number;
    absent: number;
    total: number;
  };
  attendance_last_7_days: Array<{
    date: string;
    present: number;
    total: number;
  }>;
  collections: {
    total: number;
    paid_records: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}
