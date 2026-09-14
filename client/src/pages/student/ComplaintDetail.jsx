import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintById, submitFeedback } from '../../services/complaintService';
import { formatDate, getSlaStatus } from '../../utils/formatters';
import { STATUS_CONFIG } from '../../utils/constants';
import PriorityBadge from '../../components/student/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import RatingWidget from '../../components/student/RatingWidget';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  User,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve complaint detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleRatingSubmit = async ({ rating, feedbackComment }) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(id, { rating, feedbackComment });
      await fetchDetail(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating feedback.');
    } finally {
      setIsSubmittingFeedback(false);
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
            to="/student/complaints"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 underline"
          >
            ← Back to My Complaints
          </Link>
        </div>
      </div>
    );
  }

  const slaInfo = getSlaStatus(complaint.slaDeadline, complaint.status);
  const statusStyle = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.Pending;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <Link
        to="/student/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Grievances List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Complaint Info & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
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
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle.badge}`}
              >
                {complaint.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              {complaint.title}
            </h1>

            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              {complaint.description}
            </p>

            {/* Evidence Image */}
            {complaint.image && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Attached Photo Evidence
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

            {/* Metadata Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Date Lodged</span>
                <span className="font-semibold text-slate-700">{formatDate(complaint.createdAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Assigned Admin</span>
                <span className="font-semibold text-slate-700">
                  {complaint.assignedAdminId ? complaint.assignedAdminId.name : 'Pending Assignment'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Target SLA</span>
                <span
                  className={`font-semibold ${
                    slaInfo.isBreached ? 'text-rose-600 font-bold' : 'text-slate-700'
                  }`}
                >
                  {formatDate(complaint.slaDeadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Section (Visible when Resolved) */}
          {complaint.status === 'Resolved' && (
            <RatingWidget
              existingRating={complaint.rating}
              existingComment={complaint.feedbackComment}
              onSubmit={handleRatingSubmit}
              isSubmitting={isSubmittingFeedback}
            />
          )}

          {/* Timeline Tracking Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>📦</span>
              Redressal Status & Audit Trail
            </h2>
            <Timeline history={complaint.statusHistory} />
          </div>
        </div>

        {/* Right 1 Col: SLA Status & Redressal Guidelines Sidebar */}
        <div className="space-y-6">
          {/* SLA Status Card */}
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              slaInfo.isBreached
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : slaInfo.isNearBreach
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                SLA Compliance Status
              </h3>
            </div>
            <p className="text-2xl font-black mt-1">{slaInfo.text}</p>
            <p className="text-xs opacity-80 mt-2 leading-relaxed">
              Target Deadline: {formatDate(complaint.slaDeadline)}
            </p>
            {slaInfo.isBreached && (
              <p className="text-xs font-bold text-rose-700 mt-2 bg-rose-100/80 p-2.5 rounded-xl border border-rose-200">
                ⚠️ This complaint has breached its SLA. An automatic escalation notification has been triggered to senior administration.
              </p>
            )}
          </div>

          {/* Institution Contact Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Redressal Guidelines</h3>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Priority is computed based on hazard keywords and campus safety standards.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Admin remarks will appear in your status timeline whenever action is taken.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                Once resolved, please submit your feedback rating to complete the cycle.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
