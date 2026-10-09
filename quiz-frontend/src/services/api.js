const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

function getHeaders(isJson = true) {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('quiz_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth Endpoints
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(name, email, password, semester_id, college) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, semester_id, college })
    });
    return handleResponse(res);
  },

  async getMe(semesterId = null) {
    const url = semesterId ? `${API_BASE}/auth/me?semester_id=${semesterId}` : `${API_BASE}/auth/me`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  async submitSemesterRequest(requested_semester_id, reason = '') {
    const res = await fetch(`${API_BASE}/auth/semester-request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ requested_semester_id, reason })
    });
    return handleResponse(res);
  },

  async getMySemesterRequests() {
    const res = await fetch(`${API_BASE}/auth/semester-request`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async redeemCode(code) {
    const res = await fetch(`${API_BASE}/auth/redeem-code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    return handleResponse(res);
  },

  // Academic Endpoints
  async getSemesters() {
    const res = await fetch(`${API_BASE}/academics/semesters`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSubjects(semesterId = null) {
    const url = semesterId
      ? `${API_BASE}/academics/subjects?semester_id=${semesterId}`
      : `${API_BASE}/academics/subjects`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getSubjectSyllabus(subjectIdentifier) {
    const res = await fetch(`${API_BASE}/academics/subjects/${encodeURIComponent(subjectIdentifier)}/syllabus`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Quiz Endpoints
  async generateQuestions({ subject, chapters, difficulty, numberOfQuestions, testType, timeLimit }) {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, chapters, difficulty, numberOfQuestions, testType, timeLimit })
    });
    return handleResponse(res);
  },

  async submitQuiz(payload) {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async pauseQuiz(payload) {
    const res = await fetch(`${API_BASE}/quiz/pause`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getQuizHistory(status = '', semesterId = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (semesterId) params.append('semester_id', semesterId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/quiz/history${queryString}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAnalytics(semesterId = null) {
    const url = semesterId ? `${API_BASE}/quiz/analytics?semester_id=${semesterId}` : `${API_BASE}/quiz/analytics`;
    const res = await fetch(url, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAttemptById(attemptId) {
    const res = await fetch(`${API_BASE}/quiz/attempts/${attemptId}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async logActiveTime(seconds = 10) {
    const res = await fetch(`${API_BASE}/quiz/log-time`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ seconds })
    });
    return handleResponse(res);
  },

  // Admin Endpoints
  admin: {
    async getOverview() {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async getUsers(params = {}) {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/admin/users?${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async getUserDetails(id, semesterId = null) {
      const url = semesterId
        ? `${API_BASE}/admin/users/${id}/details?semester_id=${semesterId}`
        : `${API_BASE}/admin/users/${id}/details`;
      const res = await fetch(url, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async createUser(userData) {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },

    async updateUser(id, userData) {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },

    async deleteUser(id) {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async createSemester(data) {
      const res = await fetch(`${API_BASE}/admin/semesters`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async updateSemester(id, data) {
      const res = await fetch(`${API_BASE}/admin/semesters/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async deleteSemester(id) {
      const res = await fetch(`${API_BASE}/admin/semesters/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async createSubject(data) {
      const res = await fetch(`${API_BASE}/admin/subjects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async updateSubject(id, data) {
      const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async deleteSubject(id) {
      const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async createChapter(data) {
      const res = await fetch(`${API_BASE}/admin/chapters`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async updateChapter(id, data) {
      const res = await fetch(`${API_BASE}/admin/chapters/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async deleteChapter(id) {
      const res = await fetch(`${API_BASE}/admin/chapters/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async getQuestions(params = {}) {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/admin/questions?${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async createQuestion(data) {
      const res = await fetch(`${API_BASE}/admin/questions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async updateQuestion(id, data) {
      const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async deleteQuestion(id) {
      const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async getSemesterRequests(params = {}) {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/admin/semester-requests?${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },

    async reviewSemesterRequest(id, status, admin_comment = '') {
      const res = await fetch(`${API_BASE}/admin/semester-requests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, admin_comment })
      });
      return handleResponse(res);
    }
  }
};

export default api;
