import { API_BASE } from './constants';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medisense_token');
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface LightLogItem {
  id: string;
  timestamp: string;
  type: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  userSummary: string;
  ip: string;
  hasRequestPayload?: boolean;
  hasResponsePayload?: boolean;
  hasPayload: boolean;
  hasError: boolean;
}

export interface FullLogItem extends LightLogItem {
  user?: { id: number; email: string; role: string; gender: string } | null;
  userAgent?: string;
  requestPayload?: any;
  responsePayload?: any;
  payload?: any;
  error?: string | null;
}


// Audit Page View Logging
export const auditApi = {
  logPageView: (path: string, title?: string, referrer?: string) =>
    apiFetch<{ status: string }>('/audit/page-view', {
      method: 'POST',
      body: JSON.stringify({ path, title, referrer }),
    }),
  getLogs: () =>
    apiFetch<{ total_entries: number; showing: number; logs: LightLogItem[]; log_file_path: string }>('/audit/logs'),
  getLogDetails: (id: string) =>
    apiFetch<FullLogItem>(`/audit/logs/${encodeURIComponent(id)}`),
};



// Auth
export const authApi = {

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: number; email: string; name: string; role: string; gender: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; full_name: string; gender: string; role?: string }) =>
    apiFetch<{ token: string; user: { id: number; email: string; name: string; role: string; gender: string } }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),
  me: () => apiFetch<{ id: number; email: string; full_name: string; role: string; gender: string }>('/auth/me'),
};

// AI Chatbot API
export const chatApi = {
  query: (data: { message?: string; districtId?: number | null; history?: Array<{ sender: string; text: string }> }) =>
    apiFetch<{ reply: string; district?: any; source?: string }>('/chat/query', {
      method: 'POST', body: JSON.stringify(data),
    }),
  femaleCare: (data: { message?: string; history?: Array<{ sender: string; text: string }> }) =>
    apiFetch<{ reply: string; source?: string }>('/chat/female-care', {
      method: 'POST', body: JSON.stringify(data),
    }),
};


// Dashboard
export const dashboardApi = {
  kpi: () => apiFetch<{
    outbreaks: { active_warnings: number; max_probability: number; total_predicted_cases: number };
    equity: { national_index: number; upazilas_measured: number };
    verification: { total_scans: number; counterfeit_found: number; detection_rate: number };
  }>('/dashboard/kpi'),
  feed: () => apiFetch<Array<{ id: number; category: string; message: string; severity: string; created_at: string }>>('/dashboard/feed'),
};

// Predict
export const predictApi = {
  outbreaks: () => apiFetch<Array<{
    district_id: number; name: string; name_bn: string; lat: number; lng: number; division: string;
    diseases: Array<{ disease: string; predicted_cases: number; probability: number; risk: number }>;
    max_risk: number;
  }>>('/predict/outbreaks'),
  district: (id: number) => apiFetch<{
    district: { id: number; name: string; name_bn: string; lat: number; lng: number; division: string; population: number };
    predictions: Array<{
      disease: string; predicted_date: string; predicted_cases: number; actual_cases: number | null;
      probability: number; temperature: number; humidity: number; rainfall_mm: number; season_type: string;
    }>;
  }>(`/predict/district/${id}`),
  upload: (csvData: string, mode: 'replace' | 'append') => apiFetch<{ success: boolean; count: number; message: string }>('/predict/upload', {
    method: 'POST',
    body: JSON.stringify({ csvData, mode })
  }),
  run: () => apiFetch<{ status: string; message: string; trained_rows: number; predictions_count: number }>('/predict/run', {
    method: 'POST'
  }),
};

// Navigate
export const navigateApi = {
  hospitals: () => apiFetch<Array<{
    id: number; name: string; district_id: number; type: string; lat: number; lng: number;
    total_beds: number; available_beds: number; has_emergency: boolean; phone: string;
    district_name: string; division: string;
  }>>('/navigate/hospitals'),
  nearest: (lat: number, lng: number) => apiFetch<Array<{
    id: number; name: string; lat: number; lng: number; distance_km: number;
    total_beds: number; available_beds: number; has_emergency: boolean; phone: string;
    district_name: string;
  }>>(`/navigate/nearest?lat=${lat}&lng=${lng}`),
  equityHeatmap: () => apiFetch<Array<{
    id: number; district_id: number; upazila_name: string; equity_score: number;
    doctor_ratio: number; bed_ratio: number; vaccine_coverage: number;
    district_name: string; lat: number; lng: number; division: string;
  }>>('/navigate/equity-heatmap'),
};

// Verify
export const verifyApi = {
  triage: (symptoms_text: string) => apiFetch<{
    triage_level: string; detected_symptoms: Array<{ level: string; disease: string; en: string }>;
    recommendation: string; confidence: number; model: string;
  }>('/verify/triage', { method: 'POST', body: JSON.stringify({ symptoms_text }) }),
  drug: (data: { barcode?: string; drug_name?: string }) => apiFetch<{
    found: boolean; is_authentic: boolean; confidence: number; message: string;
    drug?: { brand_name: string; generic_name: string; manufacturer: string; dosage_form: string; strength: string; status: string };
  }>('/verify/drug', { method: 'POST', body: JSON.stringify(data) }),
};

// Search
export const searchApi = {
  search: (q: string) => apiFetch<{
    districts: Array<{ id: number; name: string; division: string; type: string }>;
    hospitals: Array<{ id: number; name: string; district_name: string; result_type: string }>;
    drugs: Array<{ id: number; brand_name: string; generic_name: string; status: string; type: string }>;
    diseases: Array<{ disease: string; type: string }>;
    total: number;
  }>(`/search?q=${encodeURIComponent(q)}`),
};
