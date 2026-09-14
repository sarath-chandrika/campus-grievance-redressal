import React from 'react';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, PlayCircle, UserCheck } from 'lucide-react';

const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-sm">
        No status history records available yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'In Progress':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'Pending':
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {history.map((step, idx) => {
        const isLatest = idx === history.length - 1;

        return (
          <div key={step._id || idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-white ring-4 ring-white shadow-sm border ${
                isLatest ? 'border-blue-500 ring-blue-100' : 'border-slate-300'
              }`}
            >
              {getStatusIcon(step.status)}
            </div>

            {/* Content card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isLatest
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      step.status
                    )}`}
                  >
                    {step.status}
                  </span>
                  {isLatest && (
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Current Status
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {formatDate(step.timestamp)}
                </span>
              </div>

              {/* Remarks */}
              {step.remarks ? (
                <p className="text-sm text-slate-700 mt-2 bg-white/80 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  "{step.remarks}"
                </p>
              ) : (
                <p className="text-xs italic text-slate-400 mt-1">No remarks recorded.</p>
              )}

              {/* Updated by */}
              {step.updatedBy && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Updated by{' '}
                    <strong className="text-slate-700">{step.updatedBy.name || 'System'}</strong>{' '}
                    ({step.updatedBy.role || 'Staff'})
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
