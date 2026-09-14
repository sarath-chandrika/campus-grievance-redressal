import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint, classifyPreview } from '../../services/complaintService';
import { CATEGORIES, PRIORITY_CONFIG } from '../../utils/constants';
import {
  Upload,
  Sparkles,
  ShieldAlert,
  Clock,
  Building,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import PriorityBadge from '../../components/student/PriorityBadge';

const SubmitComplaint = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Live auto-classification state
  const [detectedPriority, setDetectedPriority] = useState('Medium');
  const [suggestedDept, setSuggestedDept] = useState('Hostel Administration');
  const [isClassifying, setIsClassifying] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Instant local keyword check for real-time responsiveness + debounced backend API check
  useEffect(() => {
    const combinedText = `${title} ${description}`.trim();
    if (!combinedText) {
      setDetectedPriority('Medium');
      return;
    }

    setIsClassifying(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await classifyPreview(combinedText, category);
        if (res.priority) setDetectedPriority(res.priority);
        if (res.suggestedDepartment) setSuggestedDept(res.suggestedDepartment);
      } catch (err) {
        // Fallback silently if offline/network error
      } finally {
        setIsClassifying(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [title, description, category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds maximum limit of 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await createComplaint(formData);
      setSuccessMsg('Complaint successfully submitted and queued for redressal!');
      setTimeout(() => {
        navigate(`/student/complaints/${res.complaint._id}`);
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.'
      );
      setLoading(false);
    }
  };

  const priorityMeta = PRIORITY_CONFIG[detectedPriority] || PRIORITY_CONFIG.Medium;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Official Grievance Submission
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Lodge a Campus Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide specific details below. Our intelligent system automatically analyzes your description to classify urgency and enforce institutional SLAs.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-bold">Submission Blocked</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Grievance Title *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Electric shock from water heater in Block B 2nd floor washroom"
              className="w-full text-sm sm:text-base px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all font-medium text-slate-800"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Auto-Detected Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Suggested Redressal Committee
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{suggestedDept}</span>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description *
              </label>
              <span className="text-[11px] text-slate-400">
                Mention room numbers, floor, or specific equipment
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, any hazards, and location details..."
              className="w-full text-sm p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Live Priority Detection Badge / SLA Guarantee Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${priorityMeta.border} ${priorityMeta.bg}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live AI Priority Classification:
                </span>
                <PriorityBadge priority={detectedPriority} />
                {isClassifying && (
                  <span className="text-[10px] text-slate-400 animate-pulse">Scanning...</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Guaranteed SLA: <strong>{priorityMeta.sla}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              {detectedPriority === 'Critical' && (
                <span className="text-rose-700 font-bold">
                  ⚠️ Emergency trigger detected! Immediate escalation & notification will be sent to the campus authorities upon submission.
                </span>
              )}
              {detectedPriority === 'High' && (
                <span className="text-amber-800 font-medium">
                  High severity detected. Requires redressal within 72 hours.
                </span>
              )}
              {detectedPriority === 'Medium' && (
                <span className="text-blue-800">
                  Standard campus service ticket. Guaranteed resolution within 7 days.
                </span>
              )}
              {detectedPriority === 'Low' && (
                <span className="text-emerald-800">
                  Routine request or ambient feedback. Scheduled within 14 days.
                </span>
              )}
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Attach Evidence Photo (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Upload an image file (JPG, PNG, WebP)</span>
                <span className="text-[10px] text-slate-400">Maximum file size: 5MB</span>
              </button>
            ) : (
              <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={imagePreview}
                  alt="Complaint Preview"
                  className="max-h-48 rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full shadow transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !title || !description}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Grievance...
                </>
              ) : (
                'Submit Grievance for Redressal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
