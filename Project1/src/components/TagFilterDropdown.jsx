import { useState, useEffect, useRef } from 'react';

let TagFilterDropdown = ({ allTags, onSelectTag, activeTag }) => {
  let [isOpen, setIsOpen] = useState(false);
  let dropdownRef = useRef(null);

  useEffect(() => {
    let handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let handleSelect = (tag) => {
    onSelectTag(tag === activeTag ? null : tag); 
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex justify-center items-center w-full sm:w-auto rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
          activeTag 
            ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500' 
            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500'
        }`}
      >
        {activeTag ? (
          <>
            <span className="mr-2">#</span>
            <span>{activeTag}</span>
            <svg className="-mr-1 ml-2 h-5 w-5 rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5 text-slate-400 dark:text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Tag
            <svg className="-mr-1 ml-2 h-5 w-5 text-slate-400 dark:text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 divide-y divide-gray-100 dark:divide-zinc-800 z-[60] max-h-60 overflow-y-auto animate-fade-in-down">
          
          <div className="py-1">
            {/* Option to Clear Filter */}
            <button
              onClick={() => handleSelect(null)}
              className={`${!activeTag ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-zinc-300'} group flex items-center px-4 py-2.5 text-sm w-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors`}
            >
              <svg className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 dark:text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Show All Contacts
            </button>

            {/* List of Unique Tags */}
            {allTags.length > 0 ? (
              allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSelect(tag)}
                  className={`${activeTag === tag ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-zinc-300'} group flex items-center px-4 py-2.5 text-sm w-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors`}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 mr-3 rounded-full bg-slate-100 dark:bg-zinc-700 text-[10px] font-bold text-slate-500 dark:text-zinc-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    #
                  </span>
                  {tag}
                  
                  {/* Checkmark for Active Selection */}
                  {activeTag === tag && (
                    <svg className="ml-auto h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-zinc-400 italic text-center">
                No tags found yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilterDropdown;