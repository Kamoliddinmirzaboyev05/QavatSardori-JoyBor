const API_BASE_URL = 'https://joyboryangi.pythonanywhere.com';

class ApiService {
  private getAuthHeaders() {
    const token = sessionStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_role');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    return this.handleResponse(response);
  }

  // Attendance Sessions
  async createAttendanceSession() {
    const response = await fetch(`${API_BASE_URL}/attendance-sessions/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getAttendanceSessions() {
    const response = await fetch(`${API_BASE_URL}/attendance-sessions/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Students
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createStudent(studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData),
    });

    return this.handleResponse(response);
  }

  async updateStudent(studentId: string, studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData),
    });

    return this.handleResponse(response);
  }

  async deleteStudent(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  }

  // Collections
  async getCollections() {
    const response = await fetch(`${API_BASE_URL}/collections/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createCollection(collectionData: any) {
    const response = await fetch(`${API_BASE_URL}/collections/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(collectionData),
    });

    return this.handleResponse(response);
  }

  // Requests
  async getRequests() {
    const response = await fetch(`${API_BASE_URL}/requests/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createRequest(requestData: any) {
    const response = await fetch(`${API_BASE_URL}/requests/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    return this.handleResponse(response);
  }

  async updateRequest(requestId: string, requestData: any) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    return this.handleResponse(response);
  }

  // Announcements
  async getAnnouncements() {
    const response = await fetch(`${API_BASE_URL}/announcements/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createAnnouncement(announcementData: any) {
    const response = await fetch(`${API_BASE_URL}/announcements/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(announcementData),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;