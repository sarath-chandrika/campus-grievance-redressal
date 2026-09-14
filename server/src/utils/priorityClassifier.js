/**
 * Keyword-based Auto-Priority and Department Classification Engine
 */

const KEYWORD_PRIORITY_MAP = {
  // Critical Priority (SLA: +24 Hours)
  critical: [
    'fire',
    'electric shock',
    'short circuit',
    'spark',
    'sparks',
    'gas leak',
    'lpg leak',
    'food poisoning',
    'poisoning',
    'ragging',
    'harassment',
    'violence',
    'physical assault',
    'medical emergency',
    'unconscious',
    'ambulance',
    'roof collapse',
    'water contaminated',
    'toxic',
    'snake',
    'theft',
  ],

  // High Priority (SLA: +3 Days)
  high: [
    'leak',
    'leakage',
    'power outage',
    'blackout',
    'no electricity',
    'broken pipe',
    'pipe burst',
    'sewage overflow',
    'wifi down',
    'internet failure',
    'ac failure',
    'air conditioner',
    'elevator stuck',
    'lift not working',
    'water shortage',
    'no water',
    'exam clash',
    'hall ticket',
    'door lock broken',
    'geyser shock',
  ],

  // Medium Priority (SLA: +7 Days)
  medium: [
    'fan not working',
    'ceiling fan',
    'cleaning',
    'dirty washroom',
    'projector issue',
    'projector',
    'mess food quality',
    'undercooked',
    'hostel maintenance',
    'library book',
    'id card',
    'tap leaking',
    'flush issue',
    'switch board',
    'pest control',
    'mosquito',
    'window glass',
    'lab equipment',
    'portal error',
  ],

  // Low Priority (SLA: +14 Days)
  low: [
    'noise',
    'loud music',
    'dust',
    'suggestion',
    'light bulb',
    'tube light',
    'chair broken',
    'table broken',
    'desk',
    'notice board',
    'routine check',
    'painting',
    'curtain',
    'sports equipment',
    'drinking water temperature',
    'garden',
  ],
};

// Map keywords/categories to suggested department
const DEPARTMENT_CATEGORY_MAP = {
  Hostel: 'Hostel Administration',
  Mess: 'Mess & Cafeteria Committee',
  Academic: 'Academic Affairs & Examination',
  Infrastructure: 'Estate & Infrastructure Maintenance',
  Other: 'General Grievance Redressal Cell',
};

/**
 * Classifies priority from text content
 * @param {string} text - Title and description combined
 * @returns {string} Priority: 'Critical' | 'High' | 'Medium' | 'Low'
 */
const classifyPriority = (text = '') => {
  if (!text) return 'Medium';
  const lowerText = text.toLowerCase();

  // Check Critical first
  for (const keyword of KEYWORD_PRIORITY_MAP.critical) {
    if (lowerText.includes(keyword)) {
      return 'Critical';
    }
  }

  // Check High
  for (const keyword of KEYWORD_PRIORITY_MAP.high) {
    if (lowerText.includes(keyword)) {
      return 'High';
    }
  }

  // Check Medium
  for (const keyword of KEYWORD_PRIORITY_MAP.medium) {
    if (lowerText.includes(keyword)) {
      return 'Medium';
    }
  }

  // Check Low
  for (const keyword of KEYWORD_PRIORITY_MAP.low) {
    if (lowerText.includes(keyword)) {
      return 'Low';
    }
  }

  // Default priority if no keyword matches
  return 'Medium';
};

/**
 * Computes SLA Deadline based on priority
 * Critical: +24 hours (+1 day)
 * High: +72 hours (+3 days)
 * Medium: +168 hours (+7 days)
 * Low: +336 hours (+14 days)
 * @param {string} priority
 * @param {Date} baseDate
 * @returns {Date}
 */
const computeSlaDeadline = (priority, baseDate = new Date()) => {
  const deadline = new Date(baseDate);

  switch (priority) {
    case 'Critical':
      deadline.setHours(deadline.getHours() + 24);
      break;
    case 'High':
      deadline.setDate(deadline.getDate() + 3);
      break;
    case 'Medium':
      deadline.setDate(deadline.getDate() + 7);
      break;
    case 'Low':
      deadline.setDate(deadline.getDate() + 14);
      break;
    default:
      deadline.setDate(deadline.getDate() + 7);
  }

  return deadline;
};

/**
 * Suggest department based on category and text
 * @param {string} category
 * @param {string} text
 * @returns {string}
 */
const suggestDepartment = (category, text = '') => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('ragging') || lowerText.includes('harassment')) {
    return 'Disciplinary & Anti-Ragging Cell';
  }
  if (lowerText.includes('medical') || lowerText.includes('ambulance') || lowerText.includes('poisoning')) {
    return 'Campus Health Center';
  }
  return DEPARTMENT_CATEGORY_MAP[category] || 'General Grievance Redressal Cell';
};

module.exports = {
  KEYWORD_PRIORITY_MAP,
  classifyPriority,
  computeSlaDeadline,
  suggestDepartment,
};
