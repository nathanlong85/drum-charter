'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-[10px] font-headline font-black border border-outline-variant/20 px-4 py-2 rounded-xl hover:bg-surface-bright transition-all uppercase tracking-widest text-on-surface-variant/60 hover:text-primary shadow-sm"
    >
      PRINTER FRIENDLY
    </button>
  );
}
