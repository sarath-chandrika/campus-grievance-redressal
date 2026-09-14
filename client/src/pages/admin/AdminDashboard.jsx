import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getAllComplaints } from '../../services/complaintService';
import { formatDate, getSlaStatus } from '../../utils/formatters';
import PriorityBadge from '../../components/student/PriorityBadge';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Users,
  FileBarChart,
  ListOrdered,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch recent 100 complaints to compute live statistics
        const res = await getAllComplaints({ limit: 100 });
        setComplaints(res.complaints || []);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  // Compute SLA breaches: complaints past slaDeadline and not Resolved
  const now = new Date();
  const breachedComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && new Date(c.slaDeadline) < now
  );
  const overdueCount = breachedComplaints.length;

  // Aggregate Category Data for Bar Chart
  const categories = ['Hostel', 'Mess', 'Academic', 'Infrastructure', 'Other'];
  const categoryCounts = categories.map(
    (cat) => complaints.filter((c) => c.category === cat).length
  );

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Number of Grievances',
        data: categoryCounts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)', // Blue
          'rgba(245, 158, 11, 0.85)', // Amber
          'rgba(139, 92, 246, 0.85)', // Purple
          'rgba(16, 185, 129, 0.85)', // Emerald
          'rgba(100, 116, 139, 0.85)', // Slate
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Aggregate Status Data for Doughnut Chart
  const doughnutData = {
    labels: ['Pending Review', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [pending, inProgress, resolved],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        hoverOffset: 4,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 12 },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Central Grievance Redressal Cell • Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Administrative Analytics & Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor institutional grievance trends, resolve student complaints, and enforce SLA commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            <FileBarChart className="w-4 h-4 text-slate-500" />
            PDF Reports
          </Link>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <ListOrdered className="w-4 h-4" />
            Manage Complaints
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner (If Any) */}
      {overdueCount > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-rose-900">
                {overdueCount} {overdueCount === 1 ? 'Complaint has' : 'Complaints have'} breached SLA Deadlines!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Immediate intervention required. Department escalation notifications have been triggered.
              </p>
            </div>
          </div>
          <Link
            to="/admin/complaints?breached=true"
            className="shrink-0 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl transition-all"
          >
            Review Breaches →
          </Link>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{total}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Registered grievances</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pending}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-blue-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgress}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Under action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolved}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Completed & closed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">SLA Breached</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">{overdueCount}</p>
          <span className="text-[11px] text-rose-500 font-medium mt-1 block">
            {total > 0 ? `${Math.round((overdueCount / total) * 100)}% of total` : '0%'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Grievances by Category</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of complaints across campus departments
                </p>
              </div>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
                Live Distribution
              </span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Resolution Ratio</h3>
                <p className="text-xs text-slate-500 mt-0.5">Lifecycle status breakdown</p>
              </div>
            </div>
            <div className="h-64 sm:h-72 w-full flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Critical & Urgent Grievances Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Grievance Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest campus grievances submitted by students</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Complaints ({total})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {complaints
            .slice(0, 8)
            .map((c) => {
              const sla = getSlaStatus(c.slaDeadline, c.status);

              return (
                <div
                  key={c._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                    sla.isBreached ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{c._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      {sla.isBreached && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-300">
                          SLA Breached
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm truncate">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <strong className="text-slate-700">{c.studentId?.name || 'Student'}</strong> ({c.studentId?.department || 'General'}) • Lodged {formatDate(c.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : c.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {c.status}
                    </span>

                    <Link
                      to={`/admin/complaints/${c._id}`}
                      className="text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-xl transition-all"
                    >
                      Review & Update
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
