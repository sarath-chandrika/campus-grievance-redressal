export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getSlaStatus = (slaDeadline, status) => {
  if (!slaDeadline) return { isBreached: false, text: 'No SLA' };
  if (status === 'Resolved') {
    return { isBreached: false, isResolved: true, text: 'Resolved within SLA' };
  }

  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) {
    const overdueHours = Math.abs(diffHours);
    const days = Math.floor(overdueHours / 24);
    const hrs = overdueHours % 24;
    return {
      isBreached: true,
      text: `Breached by ${days > 0 ? `${days}d ` : ''}${hrs}h`,
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-300 font-semibold',
    };
  }

  if (diffHours <= 24) {
    return {
      isBreached: false,
      isNearBreach: true,
      text: `${diffHours}h remaining`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
    };
  }

  const days = Math.floor(diffHours / 24);
  return {
    isBreached: false,
    text: `${days} days remaining`,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};
