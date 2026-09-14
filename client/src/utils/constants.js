export const CATEGORIES = [
  'Hostel',
  'Mess',
  'Academic',
  'Infrastructure',
  'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const DEPARTMENTS = [
  'Hostel Administration',
  'Mess & Cafeteria Committee',
  'Academic Affairs & Examination',
  'Estate & Infrastructure Maintenance',
  'Disciplinary & Anti-Ragging Cell',
  'Campus Health Center',
  'General Grievance Redressal Cell',
];

export const PRIORITY_CONFIG = {
  Critical: {
    label: 'Critical',
    sla: 'Within 24 Hours',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
  },
  High: {
    label: 'High',
    sla: 'Within 3 Days',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  Medium: {
    label: 'Medium',
    sla: 'Within 7 Days',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
  },
  Low: {
    label: 'Low',
    sla: 'Within 14 Days',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  'In Progress': {
    label: 'In Progress',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
  },
  Resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
};
