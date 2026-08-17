const API_BASE_URL = 'https://api.joy-bor.uz/api';
const API_ROOT = API_BASE_URL.replace(/\/+$/, '');

type Json = Record<string, unknown> | unknown[] | null;

class ApiService {
  private getAuthHeaders(json = true): Record<string, string> {
    const token = sessionStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (json) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private refreshInFlight: Promise<boolean> | null = null;

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = (async () => {
      const refresh = sessionStorage.getItem('refresh_token');
      if (!refresh) return false;
      try {
        const res = await fetch(`${API_ROOT}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data.access) return false;
        sessionStorage.setItem('access_token', data.access);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async handleResponse(response: Response, retried = false): Promise<Json> {
    if (response.status === 401 && !retried) {
      const ok = await this.tryRefresh();
      if (!ok) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_role');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Session expired');
      }
      // Caller should retry — surface special error
      throw new Error('TOKEN_REFRESHED');
    }

    if (response.status === 401) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_role');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text) as {
              detail?: string;
              message?: string;
              error?: string;
            };
            errorMessage =
              errorData.detail || errorData.message || errorData.error || text;
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // keep default
      }
      throw new Error(errorMessage);
    }

    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  }

  private async request(
    path: string,
    options: RequestInit = {},
    retried = false
  ): Promise<Json> {
    const jsonBody = !(options.body instanceof FormData);
    const response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(jsonBody && options.method !== 'GET'),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    try {
      return await this.handleResponse(response, retried);
    } catch (e) {
      if (e instanceof Error && e.message === 'TOKEN_REFRESHED' && !retried) {
        return this.request(path, options, true);
      }
      throw e;
    }
  }

  // ——— Auth ———
  async login(username: string, password: string) {
    const response = await fetch(`${API_ROOT}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return this.handleResponse(response) as Promise<{
      access: string;
      refresh: string;
      role?: string;
    }>;
  }

  // ——— Profile ———
  async getProfile() {
    return this.request('/me/');
  }

  async updateProfile(profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    bio?: string;
    address?: string;
    telegram?: string;
  }) {
    return this.request('/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  /** API da alohida change-password yo'q — /me/ orqali emas, xabar beriladi */
  async changePassword(_passwordData: {
    old_password: string;
    new_password: string;
  }): Promise<never> {
    throw new Error(
      "Parol o'zgartirish endpointi API da mavjud emas. Superadmin orqali o'zgartiring."
    );
  }

  // ——— Dashboard ———
  async getDashboardData() {
    return this.request('/floor-leader/dashboard/');
  }

  async getLeaderStatistics() {
    return this.request('/floor-leader/dashboard/');
  }

  // ——— Students ———
  async getStudents(params?: { page?: number; floor?: number; search?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.floor) sp.set('floor', String(params.floor));
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString();
    return this.request(`/students/${q ? `?${q}` : ''}`);
  }

  async createStudent(studentData: Record<string, unknown>) {
    return this.request('/students/create/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(studentId: string | number, studentData: Record<string, unknown>) {
    return this.request(`/students/${studentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(studentId: string | number) {
    await this.request(`/students/${studentId}/`, { method: 'DELETE' });
    return true;
  }

  // ——— Attendance sessions ———
  async fullCreateAttendanceSession(data: {
    date: string;
    records: { student_id: number; status: 'in' | 'out' }[];
  }) {
    return this.request('/attendance-sessions/full-create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAttendanceSession(data?: {
    date: string;
    floor: number;
    leader: number;
  }) {
    return this.request('/attendance-sessions/create/', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getAttendanceSessions(params?: { floor?: number; date?: string; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.floor) sp.set('floor', String(params.floor));
    if (params?.date) sp.set('date', params.date);
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/attendance-sessions/${q ? `?${q}` : ''}`);
  }

  async getAttendanceSession(sessionId: string | number) {
    return this.request(`/attendance-sessions/${sessionId}/`);
  }

  // ——— Attendance records ———
  async getAttendanceRecords(params?: {
    session?: number;
    student?: number;
    status?: string;
    page?: number;
  }) {
    const sp = new URLSearchParams();
    if (params?.session) sp.set('session', String(params.session));
    if (params?.student) sp.set('student', String(params.student));
    if (params?.status) sp.set('status', params.status);
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/attendance-records/${q ? `?${q}` : ''}`);
  }

  /** Bitta yozuvni yangilash */
  async updateAttendanceRecord(
    recordId: string | number,
    data: { status?: 'in' | 'out'; student?: number; session?: number }
  ) {
    return this.request(`/attendance-records/${recordId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Bulk update — API da bulk yo'q; har bir yozuvni alohida PATCH qiladi.
   * records: [{ id, status }] yoki [{ student_id, status }] (id bo'lsa afzal)
   */
  async updateAttendanceRecords(
    _sessionId: string,
    records: Array<{ id?: number; student_id?: number; status: 'in' | 'out' }>
  ) {
    const results = [];
    for (const rec of records) {
      if (rec.id != null) {
        results.push(await this.updateAttendanceRecord(rec.id, { status: rec.status }));
      }
    }
    return results;
  }

  // ——— Collections ———
  async getCollections(params?: { floor?: number; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.floor) sp.set('floor', String(params.floor));
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/collections/${q ? `?${q}` : ''}`);
  }

  async getCollection(collectionId: string | number) {
    return this.request(`/collections/${collectionId}/`);
  }

  async createCollection(collectionData: {
    title: string;
    amount: number;
    description?: string;
    deadline?: string;
    floor?: number;
    leader?: number;
  }) {
    return this.request('/collections/create/', {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  }

  async updateCollectionRecords(
    recordId: number,
    data: { status: string; collection: number; student: number }
  ) {
    return this.request(`/collection-records/${recordId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createCollectionRecord(data: {
    status: string;
    collection: number;
    student: number;
  }) {
    return this.request('/collection-records/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ——— Complaints (UI dagi "Requests") ———
  async getRequests(params?: { status?: string; category?: string; page?: number }) {
    return this.getComplaints(params);
  }

  async getComplaints(params?: { status?: string; category?: string; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.category) sp.set('category', params.category);
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/complaints/${q ? `?${q}` : ''}`);
  }

  async createRequest(requestData: {
    title: string;
    description: string;
    category?: string;
  }) {
    return this.createComplaint(requestData);
  }

  async createComplaint(data: {
    title: string;
    description: string;
    category?: string;
  }) {
    return this.request('/complaints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRequest(requestId: string | number, requestData: Record<string, unknown>) {
    return this.request(`/complaints/${requestId}/`, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    });
  }

  async updateComplaint(id: string | number, data: Record<string, unknown>) {
    return this.request(`/complaints/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ——— Notifications (UI dagi "Announcements" o'qish) ———
  async getAnnouncements() {
    return this.getNotifications();
  }

  async getNotifications() {
    return this.request('/notifications/');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count/');
  }

  async markNotificationAsRead(id: number) {
    return this.request('/notifications/mark-read/', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read/', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  /** Sardor e'lon yaratish — API da alohida announcements yo'q; task-for-leader ishlatiladi */
  async createAnnouncement(announcementData: {
    title?: string;
    content?: string;
    description?: string;
    user?: number;
  }) {
    const description =
      announcementData.description ||
      [announcementData.title, announcementData.content].filter(Boolean).join('\n');
    if (!announcementData.user) {
      throw new Error("E'lon yaratish uchun user (leader) id kerak");
    }
    return this.request('/tasks-for-leaders/create/', {
      method: 'POST',
      body: JSON.stringify({
        user: announcementData.user,
        description,
      }),
    });
  }

  // ——— Duty schedules ———
  async getDutySchedules(params?: { page?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/duty-schedules/${q ? `?${q}` : ''}`);
  }

  async createDutySchedule(data: { date: string; floor: number; room: number }) {
    return this.request('/duty-schedules/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDutySchedule(id: string | number, data: Record<string, unknown>) {
    return this.request(`/duty-schedules/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDutySchedule(id: string | number) {
    return this.request(`/duty-schedules/${id}/`, { method: 'DELETE' });
  }

  // ——— Floor leaders ———
  async getFloorLeaders(params?: { floor?: number; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.floor) sp.set('floor', String(params.floor));
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/floor-leaders/${q ? `?${q}` : ''}`);
  }

  async createFloorLeader(leaderData: Record<string, unknown>) {
    return this.request('/floor-leaders/', {
      method: 'POST',
      body: JSON.stringify(leaderData),
    });
  }

  // ——— Tasks for leaders ———
  async getTasksForLeaders() {
    return this.request('/tasks-for-leaders/');
  }

  async updateTaskForLeader(id: number | string, data: Record<string, unknown>) {
    return this.request(`/tasks-for-leaders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ——— Floors / Rooms (read) ———
  async getFloors() {
    return this.request('/floors/');
  }

  async getRooms(floorId?: number | string) {
    const q = floorId != null ? `?floor=${floorId}` : '';
    return this.request(`/rooms/${q}`);
  }
}

export const apiService = new ApiService();
export default apiService;
