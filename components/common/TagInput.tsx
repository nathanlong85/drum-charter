'use client';

import { Plus, Tag as TagIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  id?: string;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = 'Add tag...',
  id,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.some((t) => t.trim().toLowerCase() === s.trim().toLowerCase()) &&
      s.toLowerCase().includes(inputValue.trim().toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.some((t) => t.trim().toLowerCase() === trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex flex-wrap items-center gap-2 p-3 bg-surface-container-highest rounded-2xl border transition-all duration-300 ${
          isFocused ? 'border-primary/40 ring-4 ring-primary/5' : 'border-outline-variant/10'
        }`}
      >
        <TagIcon className="w-4 h-4 text-primary/40 ml-1" />

        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-headline font-black uppercase tracking-widest shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-on-primary/60 transition-colors"
              aria-label={`Remove ${tag} tag`}
            >
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={(_e) => {
            setIsFocused(false);
            // Only hide suggestions if the focus is moving outside the container
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(inputValue);
            } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 text-sm font-headline font-bold min-w-[120px] outline-none"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-outline-variant/5 bg-surface-container flex items-center justify-between">
            <span className="text-[9px] font-headline font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">
              Suggested Identities
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(suggestion);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    addTag(suggestion);
                  }
                }}
                className="w-full text-left px-4 py-3 text-[11px] font-headline font-bold uppercase tracking-widest text-on-surface hover:bg-primary/10 hover:text-primary transition-all rounded-xl flex items-center justify-between group"
              >
                {suggestion}
                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
