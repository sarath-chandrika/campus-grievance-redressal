import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingWidget = ({ existingRating, existingComment, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingComment || '');
  const [submitted, setSubmitted] = useState(!!existingRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    await onSubmit({ rating, feedbackComment: comment });
    setSubmitted(true);
  };

  if (submitted || existingRating) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5">
        <h4 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-2">
          <span>⭐</span> Student Feedback & Resolution Rating
        </h4>
        <div className="flex items-center gap-1.5 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= (existingRating || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-slate-700 ml-2">
            {(existingRating || rating)} out of 5 Stars
          </span>
        </div>
        {(existingComment || comment) && (
          <p className="text-sm text-slate-700 italic bg-white/70 p-3 rounded-lg border border-emerald-100 mt-2">
            "{existingComment || comment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
      <h4 className="font-semibold text-slate-900 text-sm mb-1">
        Rate Grievance Resolution
      </h4>
      <p className="text-xs text-slate-600 mb-3">
        Your feedback helps the institution monitor administrative accountability.
      </p>

      {/* Star Selector */}
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating || rating) >= star;
          return (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 text-slate-300 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
        {rating > 0 && (
          <span className="text-xs font-semibold text-slate-700 ml-2">
            {rating} / 5 Stars
          </span>
        )}
      </div>

      {/* Comment Input */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Optional comment about the resolution speed or quality..."
        className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3 resize-none"
      />

      <button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting Feedback...' : 'Submit Grievance Rating'}
      </button>
    </form>
  );
};

export default RatingWidget;
