'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibraryHeader() {
  const pathname = usePathname();

  const tabs = [
    { id: 'songs', label: 'Song Charts', href: '/library/songs' },
    { id: 'notebooks', label: 'Notebooks', href: '/library/notebooks' },
    { id: 'snippets', label: 'Snippets', href: '/library/snippets' },
    { id: 'setlists', label: 'Setlists', href: '/library/setlists' },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black tracking-tighter text-on-surface uppercase mb-2">
            My Library
          </h2>
          <p className="text-on-surface-variant font-headline text-xs tracking-[0.3em] uppercase max-w-md">
            Orchestrating rhythm through modular architectural design systems.
          </p>
        </div>
      </section>

      <div
        className="flex gap-1.5 p-1.5 bg-surface-container-low rounded-2xl shadow-inner border border-outline-variant/5 overflow-x-auto no-scrollbar"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              data-testid={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              className={`px-5 py-2.5 text-[11px] font-label font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'bg-surface-container-highest text-primary shadow-lg ring-1 ring-primary/20'
                  : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high/50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
