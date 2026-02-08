const API_BASE_URL = 'https://joyborv1.pythonanywhere.com/api';

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
      
      // Try to get error details from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
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

  async getAttendanceSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/attendance-sessions/${sessionId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Attendance Records - Bulk Update
  async updateAttendanceRecords(sessionId: string, records: any[]) {
    console.log('API Request Details:');
    console.log('URL:', `${API_BASE_URL}/attendance-records/${sessionId}/bulk-update/`);
    console.log('Method: PATCH');
    console.log('Headers:', this.getAuthHeaders());
    console.log('Body:', JSON.stringify({ records }, null, 2));

    const response = await fetch(`${API_BASE_URL}/attendance-records/${sessionId}/bulk-update/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ records }),
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

  async getCollection(collectionId: string) {
    const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createCollection(collectionData: { title: string; amount: number; description?: string; deadline?: string; }) {
    const response = await fetch(`${API_BASE_URL}/collections/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(collectionData),
    });

    return this.handleResponse(response);
  }

  async updateCollectionRecords(collectionId: string, records: any[]) {
    const response = await fetch(`${API_BASE_URL}/collection-records/${collectionId}/bulk-update/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ records }),
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

  // Leader Statistics
  async getLeaderStatistics() {
    const response = await fetch(`${API_BASE_URL}/statistic-for-leader/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile Management
  async updateProfile(profileData: { first_name: string; last_name: string; phone?: string; email?: string; }) {
    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async changePassword(passwordData: { old_password: string; new_password: string; }) {
    const response = await fetch(`${API_BASE_URL}/change-password/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return this.handleResponse(response);
  }

  // Floor Leader Management
  async createFloorLeader(leaderData: {
    user_info: {
      username: string;
      password: string;
      role: string;
      email: string;
    };
    floor_info: {
      name: string;
      gender: 'male' | 'female';
    };
    floor: number;
    user: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/floor-leaders/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(leaderData),
    });
    return this.handleResponse(response);
  }

  async getFloorLeaders() {
    const response = await fetch(`${API_BASE_URL}/floor-leaders/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;
