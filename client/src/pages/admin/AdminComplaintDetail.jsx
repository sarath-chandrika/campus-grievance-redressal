import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus } from '../../services/complaintService';
import { formatDate, getSlaStatus } from '../../utils/formatters';
import { STATUSES, STATUS_CONFIG } from '../../utils/constants';
import PriorityBadge from '../../components/student/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
  Star,
  ExternalLink,
} from 'lucide-react';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update form state
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchDetail = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
      setNewStatus(data.complaint.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess('');

    try {
      const res = await updateComplaintStatus(id, {
        status: newStatus,
        remarks: remarks || `Administrative status updated to ${newStatus}`,
      });
      setUpdateSuccess(`Status successfully transitioned to "${newStatus}"! Email notification dispatched to student.`);
      setRemarks('');
      setComplaint(res.complaint);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          <p className="font-bold text-base">Error Loading Grievance</p>
          <p className="text-xs mt-1">{error || 'Complaint not found.'}</p>
          <Link
            to="/admin/complaints"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 underline"
          >
            ← Back to All Complaints
          </Link>
        </div>
      </div>
    );
  }

  const sla = getSlaStatus(complaint.slaDeadline, complaint.status);
  const statusStyle = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.Pending;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link
        to="/admin/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Master Complaint List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Grievance Information & Status Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{complaint._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {complaint.category}
                </span>
                <PriorityBadge priority={complaint.priority} />
                {sla.isBreached && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-300">
                    SLA Breached
                  </span>
                )}
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle.badge}`}>
                {complaint.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              {complaint.title}
            </h1>

            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              {complaint.description}
            </p>

            {/* Evidence Image */}
            {complaint.image && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Uploaded Photo Evidence
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 max-w-md">
                  <img
                    src={`/${complaint.image}`}
                    alt="Complaint Evidence"
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Student & Submission Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Complainant</span>
                <span className="font-bold text-slate-800">{complaint.studentId?.name || 'Unknown'}</span>
                <span className="block text-[11px] text-slate-400">{complaint.studentId?.email}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Department</span>
                <span className="font-semibold text-slate-700">{complaint.studentId?.department || 'General'}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Lodged At</span>
                <span className="font-semibold text-slate-700">{formatDate(complaint.createdAt)}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Target SLA</span>
                <span
                  className={`font-bold ${sla.isBreached ? 'text-rose-600' : 'text-slate-700'}`}
                >
                  {formatDate(complaint.slaDeadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Student Feedback & Rating (If Resolved) */}
          {complaint.rating && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <span>⭐</span> Student Resolution Rating & Feedback
              </h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= complaint.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {complaint.rating} out of 5 Stars
                </span>
              </div>
              {complaint.feedbackComment && (
                <p className="text-xs text-slate-700 italic bg-white/80 p-3 rounded-xl border border-emerald-100 mt-2">
                  "{complaint.feedbackComment}"
                </p>
              )}
            </div>
          )}

          {/* Vertical Courier Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>📦</span>
              Redressal Lifecycle & Action Audit Trail
            </h2>
            <Timeline history={complaint.statusHistory} />
          </div>
        </div>

        {/* Right 1 Col: Administrative Status Transition Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              Status Redressal Action
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Transition the lifecycle status. The student will receive an instant notification email and real-time socket update.
            </p>

            {updateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Action Remarks / Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Electrician assigned to inspect line. Replacement scheduled today at 3 PM..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Remarks are automatically logged into the student's courier timeline.
                </span>
              </div>

              <button
                type="submit"
                disabled={isUpdating || !remarks.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isUpdating ? 'Updating & Notifying...' : 'Commit Status Update'}
              </button>
            </form>
          </div>

          {/* SLA Overview Box */}
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              sla.isBreached
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                SLA Compliance Clock
              </h4>
            </div>
            <p className="text-xl font-black mt-1">{sla.text}</p>
            <p className="text-xs opacity-75 mt-1">
              Deadline: {formatDate(complaint.slaDeadline)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
