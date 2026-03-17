'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-xs font-bold border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-all"
    >
      PRINTER FRIENDLY
    </button>
  );
}
