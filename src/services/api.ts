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

  // ——— Students ———
  async getStudents(params?: { page?: number; floor?: number; search?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.floor) sp.set('floor', String(params.floor));
    if (params?.search) sp.set('search', params.search);
    const q = sp.toString();
    return this.request(`/students/${q ? `?${q}` : ''}`);
  }

  /** Qidiruv/navbatchilik uchun to'liq ro'yxat kerak — sahifalarni to'liq yig'ib qaytaradi. */
  async getAllStudents(): Promise<unknown[]> {
    const results: unknown[] = [];
    let page = 1;
    while (page <= 40) {
      const data = (await this.request(`/students/?page=${page}&page_size=100`)) as
        | { results?: unknown[]; next?: string | null }
        | unknown[];
      const batch = Array.isArray(data) ? data : data?.results ?? [];
      results.push(...batch);
      if (Array.isArray(data) || !data.next || batch.length === 0) break;
      page += 1;
    }
    return results;
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
    sp.set('page', String(params?.page || 1));
    sp.set('page_size', '100');
    return this.request(`/attendance-sessions/?${sp.toString()}`);
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
    sp.set('page', String(params?.page || 1));
    sp.set('page_size', '100');
    return this.request(`/attendance-records/?${sp.toString()}`);
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
   * Bulk update — API da bulk yo'q; har bir yozuvni alohida PATCH qiladi (parallel).
   * records: [{ id, status }] yoki [{ student_id, status }] (id bo'lsa afzal)
   */
  async updateAttendanceRecords(
    _sessionId: string,
    records: Array<{ id?: number; student_id?: number; status: 'in' | 'out' }>
  ) {
    return Promise.all(
      records
        .filter((rec) => rec.id != null)
        .map((rec) => this.updateAttendanceRecord(rec.id as number, { status: rec.status }))
    );
  }

  // ——— Collections ———
  async getCollections(params?: { floor?: number; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.floor) sp.set('floor', String(params.floor));
    sp.set('page', String(params?.page || 1));
    sp.set('page_size', '100');
    return this.request(`/collections/?${sp.toString()}`);
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

  // ——— Complaints (sardor -> admin) ———
  async getMyComplaints(params?: { type?: string; status?: string; category?: string; page?: number }) {
    const sp = new URLSearchParams();
    if (params?.type) sp.set('type', params.type);
    if (params?.status) sp.set('status', params.status);
    if (params?.category) sp.set('category', params.category);
    if (params?.page) sp.set('page', String(params.page));
    const q = sp.toString();
    return this.request(`/floor-leader/my-complaints/${q ? `?${q}` : ''}`);
  }

  async sendComplaint(data: {
    type: 'complaint' | 'suggestion';
    category?: string;
    title: string;
    description: string;
    image?: File | null;
  }) {
    const form = new FormData();
    form.append('type', data.type);
    if (data.category) form.append('category', data.category);
    form.append('title', data.title);
    form.append('description', data.description);
    if (data.image) form.append('image', data.image);
    return this.request('/floor-leader/complaints/to-admin/', {
      method: 'POST',
      body: form,
    });
  }

  // ——— Notifications ———
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
    sp.set('page', String(params?.page || 1));
    sp.set('page_size', '100');
    return this.request(`/duty-schedules/?${sp.toString()}`);
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
