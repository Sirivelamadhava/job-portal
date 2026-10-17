import React from 'react';

const JobCardSkeleton = () => {
  return (
    <div className="card-premium p-6 rounded-2xl bg-white border border-slate-200/90 animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-24 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
      </div>

      <div className="space-y-2">
        <div className="h-5 w-4/5 bg-slate-200 rounded"></div>
        <div className="h-3 w-full bg-slate-100 rounded"></div>
        <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-2">
        <div className="h-6 w-16 bg-slate-100 rounded-md"></div>
        <div className="h-6 w-20 bg-slate-100 rounded-md"></div>
        <div className="h-6 w-14 bg-slate-100 rounded-md"></div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 w-28 bg-slate-200 rounded"></div>
        <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;
