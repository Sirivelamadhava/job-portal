import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No jobs found',
  description = 'Try adjusting your search criteria, keywords, or filters to find open opportunities.',
  actionLabel = 'Reset all filters',
  onAction,
}) => {
  return (
    <div className="card-premium p-10 rounded-2xl bg-white border border-slate-200/90 text-center space-y-4 my-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      {onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="btn-secondary text-xs px-4 py-2 font-semibold shadow-xs"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
