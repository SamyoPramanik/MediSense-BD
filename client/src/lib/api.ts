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

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: number; email: string; name: string; role: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<{ id: number; email: string; full_name: string; role: string }>('/auth/me'),
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
    disease: string; probability: number; predicted_cases: number; predicted_date: string;
    temperature: number; humidity: number;
  }>>('/predict/outbreaks'),
  district: (id: number) => apiFetch<{
    district: { id: number; name: string; name_bn: string; lat: number; lng: number; division: string; population: number };
    predictions: Array<{
      disease: string; predicted_date: string; predicted_cases: number; actual_cases: number | null;
      probability: number; temperature: number; humidity: number;
    }>;
  }>(`/predict/district/${id}`),
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
