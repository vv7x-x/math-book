export interface StudentProfile {
  fullName: string;
  nationalId: string;
  studentPhone: string;
  parentPhone: string;
  stage: string;
  age: number;
  approved: boolean;
  user: {
    email: string;
    role: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export async function fetchStudentProfile(): Promise<StudentProfile> {
  return fetchWithAuth(`${API_BASE}/api/students/me`);
}

export async function logout(): Promise<void> {
  await fetchWithAuth(`${API_BASE}/api/auth/logout`, { method: 'POST' });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export async function updateStudentProfile(data: Partial<StudentProfile>) {
  return fetchWithAuth(`${API_BASE}/api/students/me`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Attendance QR
export async function fetchMyQR(): Promise<{ data: { qr: string } }> {
  return fetchWithAuth(`${API_BASE}/api/attendance/my-qr`);
}

// Schedules
export async function fetchSchedules(params?: { stage?: string; center?: string }) {
  const qs = new URLSearchParams()
  if (params?.stage) qs.set('stage', params.stage)
  if (params?.center) qs.set('center', params.center)
  const url = `${API_BASE}/api/schedules${qs.toString() ? `?${qs.toString()}` : ''}`
  return fetchWithAuth(url)
}

// Announcements
export async function fetchAnnouncements(params?: { stage?: string; center?: string }) {
  const qs = new URLSearchParams()
  if (params?.stage) qs.set('stage', params.stage)
  if (params?.center) qs.set('center', params.center)
  const url = `${API_BASE}/api/announcements${qs.toString() ? `?${qs.toString()}` : ''}`
  return fetchWithAuth(url)
}

// Payments
export async function fetchMyPayments() {
  return fetchWithAuth(`${API_BASE}/api/payments/me`)
}
