import React from 'react';
import { PRIORITY_CONFIG } from '../../utils/constants';

const PriorityBadge = ({ priority = 'Medium', showSla = false }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{priority}</span>
      {showSla && <span className="opacity-75 font-normal">({config.sla})</span>}
    </span>
  );
};

export default PriorityBadge;
