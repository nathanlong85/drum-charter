import type { ReactNode } from 'react';
import LibraryHeader from '@/components/library/LibraryHeader';

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 md:space-y-12 pb-24 md:pb-8">
      <LibraryHeader />
      {children}
    </div>
  );
}
