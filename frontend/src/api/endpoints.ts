import apiClient from './client';
import type {
  Asset,
  BerthSchedule,
  ComplianceReport,
  EPod,
  GeofenceZone,
  Incident,
  ReconciliationRun,
  TelemetryQuery,
  Terminal,
  Trip,
  User,
  Vehicle,
  Vessel,
} from '../types';

// Response envelope
interface ApiResponse<T> {
  data: T;
  meta: { page: number; per_page: number; total: number } | null;
  errors: { message: string }[] | null;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
};

// Users
export const usersApi = {
  list: (page = 1, perPage = 25) =>
    apiClient.get<ApiResponse<User[]>>('/users', { params: { page, per_page: perPage } }),
  get: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    apiClient.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: Partial<User>) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Assets
export const assetsApi = {
  list: (page = 1, perPage = 25, assetType?: string) =>
    apiClient.get<ApiResponse<Asset[]>>('/assets', { params: { page, per_page: perPage, asset_type: assetType } }),
  get: (id: string) => apiClient.get<ApiResponse<Asset>>(`/assets/${id}`),
  create: (data: Partial<Asset>) => apiClient.post<ApiResponse<Asset>>('/assets', data),
  update: (id: string, data: Partial<Asset>) => apiClient.patch<ApiResponse<Asset>>(`/assets/${id}`, data),
  searchTags: (q: string) => apiClient.get<ApiResponse<unknown[]>>('/assets/tags/search', { params: { q } }),
};

// Telemetry
export const telemetryApi = {
  ingest: (readings: unknown[]) => apiClient.post('/telemetry/ingest', { readings }),
  query: (params: TelemetryQuery) =>
    apiClient.get('/telemetry/query', {
      params: { tag_ids: params.tagIds.join(','), start: params.start, end: params.end, downsample: params.downsample },
    }),
  latest: (tagId: string) => apiClient.get(`/telemetry/latest/${tagId}`),
};

// Vessels
export const vesselsApi = {
  list: (page = 1, perPage = 25, status?: string) =>
    apiClient.get<ApiResponse<Vessel[]>>('/vessels', { params: { page, per_page: perPage, status } }),
  get: (id: string) => apiClient.get<ApiResponse<Vessel>>(`/vessels/${id}`),
  create: (data: Partial<Vessel>) => apiClient.post<ApiResponse<Vessel>>('/vessels', data),
  berths: (vesselId: string) => apiClient.get<ApiResponse<BerthSchedule[]>>(`/vessels/${vesselId}/berths`),
};

// Terminals
export const terminalsApi = {
  list: (page = 1, perPage = 25) =>
    apiClient.get<ApiResponse<Terminal[]>>('/terminals', { params: { page, per_page: perPage } }),
  get: (id: string) => apiClient.get<ApiResponse<Terminal>>(`/terminals/${id}`),
  tanks: (terminalId: string) => apiClient.get(`/terminals/${terminalId}/tanks`),
};

// Fleet
export const fleetApi = {
  vehicles: (page = 1, perPage = 25) =>
    apiClient.get<ApiResponse<Vehicle[]>>('/fleet/vehicles', { params: { page, per_page: perPage } }),
  trips: (page = 1, perPage = 25, status?: string) =>
    apiClient.get<ApiResponse<Trip[]>>('/fleet/trips', { params: { page, per_page: perPage, status } }),
  createTrip: (data: Partial<Trip>) => apiClient.post<ApiResponse<Trip>>('/fleet/trips', data),
  epod: (tripId: string) => apiClient.get<ApiResponse<EPod>>(`/fleet/epod/${tripId}`),
  geofences: () => apiClient.get<ApiResponse<GeofenceZone[]>>('/fleet/geofences'),
};

// Incidents
export const incidentsApi = {
  list: (page = 1, perPage = 25, status?: string) =>
    apiClient.get<ApiResponse<Incident[]>>('/incidents', { params: { page, per_page: perPage, status } }),
  get: (id: string) => apiClient.get<ApiResponse<Incident>>(`/incidents/${id}`),
  create: (data: Partial<Incident>) => apiClient.post<ApiResponse<Incident>>('/incidents', data),
  update: (id: string, data: Partial<Incident>) => apiClient.patch<ApiResponse<Incident>>(`/incidents/${id}`, data),
};

// Reconciliation
export const reconciliationApi = {
  list: (page = 1, perPage = 25, status?: string) =>
    apiClient.get<ApiResponse<ReconciliationRun[]>>('/reconciliation', { params: { page, per_page: perPage, status } }),
  get: (id: string) => apiClient.get<ApiResponse<ReconciliationRun>>(`/reconciliation/${id}`),
  trigger: (data: { name: string; period_start: string; period_end: string; tolerance_threshold_pct?: number }) =>
    apiClient.post<ApiResponse<ReconciliationRun>>('/reconciliation/trigger', data),
  variances: (runId: string, exceptionsOnly = false) =>
    apiClient.get(`/reconciliation/${runId}/variances`, { params: { exceptions_only: exceptionsOnly } }),
};

// Compliance
export const complianceApi = {
  reports: (page = 1, perPage = 25) =>
    apiClient.get<ApiResponse<ComplianceReport[]>>('/compliance/reports', { params: { page, per_page: perPage } }),
  createReport: (data: Partial<ComplianceReport>) =>
    apiClient.post<ApiResponse<ComplianceReport>>('/compliance/reports', data),
  auditLogs: (page = 1, perPage = 50) =>
    apiClient.get('/compliance/audit', { params: { page, per_page: perPage } }),
  custody: (page = 1, perPage = 25) =>
    apiClient.get('/compliance/custody', { params: { page, per_page: perPage } }),
};

// Analytics
export const analyticsApi = {
  ufg: (assetId: string, start: string, end: string) =>
    apiClient.get('/analytics/ufg', { params: { asset_id: assetId, start, end } }),
  leakProbability: (assetId: string, start: string, end: string) =>
    apiClient.get('/analytics/leak-probability', { params: { asset_id: assetId, start, end } }),
  meterDrift: (tagId: string, start: string, end: string) =>
    apiClient.get('/analytics/meter-drift', { params: { tag_id: tagId, start, end } }),
  fraudScore: (tripId: string) =>
    apiClient.get('/analytics/fraud-score', { params: { trip_id: tripId } }),
  integrity: (assetId: string, start: string, end: string) =>
    apiClient.get('/analytics/integrity', { params: { asset_id: assetId, start, end } }),
  predictiveMaintenance: (assetId: string, start: string, end: string) =>
    apiClient.get('/analytics/predictive-maintenance', { params: { asset_id: assetId, start, end } }),
};
