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
        className={`flex flex-wrap gap-2 p-2 border-2 rounded-lg transition-all ${
          isFocused ? 'border-zinc-800 bg-white' : 'border-zinc-100 bg-zinc-50'
        }`}
      >
        <TagIcon className="w-4 h-4 text-zinc-400 mt-1 ml-1" />

        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-zinc-800 text-white px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-400 transition-colors"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="w-3 h-3" />
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
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 min-w-[120px] placeholder-zinc-400 font-medium"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-zinc-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
              Suggestions
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
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
                className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 hover:text-white transition-colors font-bold uppercase tracking-tight flex items-center justify-between group focus:bg-zinc-800 focus:text-white focus:outline-none"
              >
                {suggestion}
                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
