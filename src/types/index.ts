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

export interface AppState {
  isAuthenticated: boolean;
  user?: User;
  students: Student[];
  dashboardData?: DashboardData;
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
