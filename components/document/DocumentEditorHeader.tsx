'use client';

import { TagInput } from '@/components/common/TagInput';

export interface DocumentEditorHeaderProps {
  documentLabel: string;
  title: string;
  onTitleChange: (title: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  tagSuggestions?: string[];
  isSaving?: boolean;
  error?: string | null;
  titlePlaceholder?: string;
}

/**
 * Shared header for song, snippet, and notebook editors (title, tags, save status).
 */
export function DocumentEditorHeader({
  documentLabel,
  title,
  onTitleChange,
  tags,
  onTagsChange,
  tagSuggestions = [],
  isSaving = false,
  error = null,
  titlePlaceholder = 'Title',
}: DocumentEditorHeaderProps) {
  return (
    <section className="p-8 pb-4 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 w-full max-w-2xl">
          <div className="flex items-center gap-4 text-primary font-label uppercase tracking-[0.3em] text-[10px] font-black">
            <span>{documentLabel}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span className="text-on-surface-variant flex gap-2 items-center">
              {error ? (
                <span className="text-error">{error}</span>
              ) : isSaving ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <span>Saved</span>
              )}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-5xl lg:text-6xl font-headline font-black tracking-tighter text-on-surface bg-transparent border-none focus:ring-0 w-full p-0 leading-tight"
            placeholder={titlePlaceholder}
            aria-label={titlePlaceholder}
          />
          <div className="mt-6">
            <TagInput
              tags={tags}
              onChange={onTagsChange}
              suggestions={tagSuggestions}
              placeholder="+ ADD TAG"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
