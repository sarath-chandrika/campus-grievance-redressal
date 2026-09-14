import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Zap,
  Clock,
  CheckCircle,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PRIORITY_CONFIG } from '../utils/constants';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Glow decorative blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3.5 py-1 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            Official Institutional Grievance Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Smart Grievance & Redressal <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Resolution with Guaranteed SLA
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An automated, transparent grievance redressal system featuring AI keyword priority detection, courier-style live tracking, real-time alerts, and strict Service Level Agreement (SLA) accountability.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all text-sm"
              >
                Go to Your Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/student/submit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all text-sm"
                >
                  Lodge a Grievance
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-sm"
                >
                  Administrative Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Automated Keyword Classification</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instant NLP keyword detection scans submissions for emergencies (fire, shocks, leaks) to automatically assign priority and route to responsible committees.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Strict SLA Deadlines & Escalation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Automated hourly background cron monitors deadlines. Overdue grievances trigger instant alerts and escalation emails to Department Heads.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Courier-Style Tracking & Feedback</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Follow every status update in a clear vertical audit trail with administrative remarks, followed by a mandatory student resolution rating.
            </p>
          </div>
        </div>
      </div>

      {/* SLA Standards Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Institutional Service Level Commitments (SLA)</h2>
          <p className="text-slate-600 mt-3 text-sm max-w-xl mx-auto">
            Grievances are categorized into 4 strict time tiers based on severity to guarantee timely investigation and resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <div
              key={key}
              className={`p-6 rounded-2xl border ${config.border} ${config.bg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}>
                    {config.label}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mt-2">{config.sla}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {key === 'Critical' && 'Threat to life, fire hazards, severe contamination, assault or medical distress.'}
                  {key === 'High' && 'Major disruptions: power blackouts, pipe bursts, campus WiFi loss, elevator malfunction.'}
                  {key === 'Medium' && 'Classroom issues, ceiling fans, hostel cleaning, mess food quality reviews.'}
                  {key === 'Low' && 'Routine maintenance, furniture requests, ambient noise, general suggestions.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
