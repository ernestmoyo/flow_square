export const QUALITY_FLAGS = {
  GOOD: { label: 'Good', color: 'bg-green-500', textColor: 'text-green-700' },
  BAD: { label: 'Bad', color: 'bg-red-500', textColor: 'text-red-700' },
  UNCERTAIN: { label: 'Uncertain', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
} as const;

export const INCIDENT_SEVERITIES = {
  LOW: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800' },
} as const;

export const INCIDENT_STATUSES = {
  DETECTED: { label: 'Detected', color: 'bg-red-100 text-red-800' },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  EVIDENCE_REQUIRED: { label: 'Evidence Required', color: 'bg-orange-100 text-orange-800' },
  CLOSED: { label: 'Closed', color: 'bg-green-100 text-green-800' },
} as const;

export const VESSEL_STATUSES = {
  APPROACHING: { label: 'Approaching', color: 'bg-blue-100 text-blue-800' },
  AT_ANCHOR: { label: 'At Anchor', color: 'bg-yellow-100 text-yellow-800' },
  BERTHED: { label: 'Berthed', color: 'bg-green-100 text-green-800' },
  DISCHARGING: { label: 'Discharging', color: 'bg-purple-100 text-purple-800' },
  DEPARTED: { label: 'Departed', color: 'bg-gray-100 text-gray-800' },
} as const;

export const TRIP_STATUSES = {
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  EN_ROUTE: { label: 'En Route', color: 'bg-yellow-100 text-yellow-800' },
  AT_DESTINATION: { label: 'At Destination', color: 'bg-green-100 text-green-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-200 text-green-900' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
} as const;

export const USER_ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'CONTROL_ROOM', label: 'Control Room' },
  { value: 'INTEGRITY_HSE', label: 'Integrity / HSE' },
  { value: 'FINANCE_REGULATORY', label: 'Finance / Regulatory' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'OPERATOR', label: 'Operator' },
  { value: 'VIEWER', label: 'Viewer' },
] as const;
