"use client";

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
  right?: React.ReactNode;
}

export function Navbar({ title, onMenuClick, right }: NavbarProps) {

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                className="p-2 -ml-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={onMenuClick}
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white">{title}</span>
            </div>
          </div>
          <div className="flex items-center">
            {right}
          </div>
        </div>
      </div>
    </nav>
  );
}
