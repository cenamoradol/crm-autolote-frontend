"use client";

export function Navbar({ title, center, right }: { title: string; center?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white">{title}</span>
            </div>
            {center && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {center}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {right}
          </div>
        </div>
      </div>
    </nav>
  );
}
