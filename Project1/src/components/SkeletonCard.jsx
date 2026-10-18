let SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5 animate-pulse">
      {/* Header Placeholder */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 w-full pr-8">
          <div className="h-5 bg-stone-200 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-4 bg-stone-100 dark:bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>

      {/* Body Placeholders */}
      <div className="space-y-3 mt-auto pt-4 border-t border-stone-100 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-stone-200 dark:bg-zinc-700 rounded w-1/3"></div>
          <div className="flex gap-2">
             <div className="w-8 h-8 bg-stone-100 dark:bg-zinc-800 rounded-md"></div>
             <div className="w-8 h-8 bg-stone-100 dark:bg-zinc-800 rounded-md"></div>
          </div>
        </div>
        
        <div className="h-3 bg-stone-100 dark:bg-zinc-800 rounded w-1/4"></div>
        
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-12 bg-stone-100 dark:bg-zinc-800 rounded"></div>
          <div className="h-5 w-16 bg-stone-100 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;