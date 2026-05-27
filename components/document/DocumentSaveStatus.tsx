'use client';

export interface DocumentSaveStatusProps {
  isSaving: boolean;
  error: string | null;
}

export function DocumentSaveStatus({ isSaving, error }: DocumentSaveStatusProps) {
  return (
    <div
      className="fixed bottom-8 right-8 z-50 pointer-events-none"
      data-testid="floating-save-status"
    >
      {isSaving && (
        <div className="bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em]">
            Saving...
          </span>
        </div>
      )}
      {error && (
        <div className="bg-error/10 backdrop-blur-md border border-error/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-error rounded-full" />
          <span className="text-[10px] font-headline font-black text-error uppercase tracking-[0.2em]">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
