import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllComplaints } from '../../services/complaintService';
import { formatDate, getSlaStatus } from '../../utils/formatters';
import { CATEGORIES, PRIORITIES, STATUSES, STATUS_CONFIG } from '../../utils/constants';
import PriorityBadge from '../../components/student/PriorityBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';

const AdminComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Filter state
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [breached, setBreached] = useState(searchParams.get('breached') === 'true');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // React to URL search params changes (e.g. clicking All Grievances or Review Breaches)
  useEffect(() => {
    setStatus(searchParams.get('status') || '');
    setBreached(searchParams.get('breached') === 'true');
    setPage(1);
  }, [searchParams]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
      };
      if (status) params.status = status;
      if (breached) params.breached = 'true';
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const res = await getAllComplaints(params);
      setComplaints(res.complaints || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error('Error fetching complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, breached, category, priority, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setStatus('');
    setBreached(false);
    setCategory('');
    setPriority('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
    setSortBy('createdAt');
    setOrder('desc');
    setSearchParams({});
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Institutional Grievance Master Table
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total {totalCount} complaints logged across all departments
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description..."
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setBreached(false);
              setPage(1);
            }}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p} Priority
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Date Range Sub-Bar + Breach Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Quick SLA Breach Filter Button */}
          <button
            type="button"
            onClick={() => {
              setBreached(!breached);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
              breached
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {breached ? 'Showing SLA Breaches (Click to Clear)' : 'Filter SLA Breaches Only'}
          </button>
        </div>

        {/* Active Filter Indicator */}
        {(breached || status || category || priority || search || startDate || endDate) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered By:</span>
            {breached && (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold border border-rose-300">
                SLA Breached Only
                <button type="button" onClick={() => { setBreached(false); setSearchParams({}); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                Status: {status}
                <button type="button" onClick={() => { setStatus(''); setSearchParams({}); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                Category: {category}
                <button type="button" onClick={() => setCategory('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priority && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                Priority: {priority}
                <button type="button" onClick={() => setPriority('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline ml-2"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Subject & Student</th>
                <th className="py-3.5 px-4">Category</th>
                <th
                  onClick={() => toggleSort('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Priority
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => toggleSort('slaDeadline')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    SLA Countdown
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Date Filed
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading complaint records...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    No complaints matching your query.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const sla = getSlaStatus(c.slaDeadline, c.status);
                  const isBreached = sla.isBreached;
                  const statusStyle = STATUS_CONFIG[c.status] || STATUS_CONFIG.Pending;

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBreached ? 'bg-rose-50/60 border-l-4 border-l-rose-500' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-700">
                        #{c._id.slice(-6).toUpperCase()}
                      </td>

                      {/* Subject & Student info */}
                      <td className="py-4 px-4 max-w-xs">
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                          title={c.title}
                        >
                          {c.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          Student: <strong className="text-slate-700">{c.studentId?.name || 'N/A'}</strong> ({c.studentId?.department || 'General'})
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {c.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border ${statusStyle.badge}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* SLA Status (Red highlighted if breached) */}
                      <td className="py-4 px-4">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {sla.text}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600 font-medium">
                            {sla.text}
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-slate-500">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Review
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total results)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
