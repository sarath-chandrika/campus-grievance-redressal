import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyComplaints } from '../../services/complaintService';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  Building,
} from 'lucide-react';
import PriorityBadge from '../../components/student/PriorityBadge';
import { formatDate, getSlaStatus } from '../../utils/formatters';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getMyComplaints();
        setComplaints(data.complaints || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/10 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
            Student Redressal Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Welcome back, {user?.name}</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Track and monitor the resolution progress of your campus grievances in real-time.
          </p>
        </div>

        <Link
          to="/student/submit"
          className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl text-sm shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Lodge Complaint
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Filed</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{total}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Lifetime grievances</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pending}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting admin review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgress}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Under active investigation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolved}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Redressed & closed</span>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Recent Grievances</h2>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({complaints.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your grievances...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base">No complaints logged yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Whenever you encounter campus issues with hostel, mess, academics, or infrastructure, submit a complaint here.
            </p>
            <Link
              to="/student/submit"
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs"
            >
              Lodge Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.slice(0, 5).map((complaint) => {
              const slaInfo = getSlaStatus(complaint.slaDeadline, complaint.status);

              return (
                <Link
                  key={complaint._id}
                  to={`/student/complaints/${complaint._id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-400">
                        #{complaint._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {complaint.category}
                      </span>
                      <PriorityBadge priority={complaint.priority} />
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">
                      {complaint.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        complaint.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : complaint.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {complaint.status}
                    </span>

                    <span className="text-[11px] text-slate-500">
                      Filed {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
