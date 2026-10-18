let ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let AlphabeticalSidebar = ({ onSelectLetter, activeLetter }) => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center select-none pointer-events-auto">
      
      {/* Rectangular Container */}
      <div className="flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-l border-t border-b border-slate-200/60 dark:border-zinc-700/60 shadow-lg rounded-l-xl py-4 px-2 max-h-[80vh] overflow-y-auto scrollbar-hide">
        
        {ALPHABET.map((letter) => {
          let isActive = activeLetter === letter;
          
          return (
            <button
              key={letter}
              onClick={() => onSelectLetter(letter)}
              className={`
                w-7 h-7 md:w-8 md:h-8 flex items-center justify-center 
                text-[11px] font-bold rounded-md transition-all duration-150 ease-out my-0.5
                ${isActive 
                  ? 'bg-indigo-600 text-white scale-110 shadow-md' 
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlphabeticalSidebar;