import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const TagInput = ({ value = [], onChange, placeholder = 'Add…', label, suggestions = [], maxTags = 20 }) => {
  const [input, setInput] = useState('');
  const [showSugg, setShowSugg] = useState(false);

  const addTag = (tag) => {
    const t = tag.trim();
    if (t && !value.includes(t) && value.length < maxTags) onChange([...value, t]);
    setInput('');
    setShowSugg(false);
  };

  const removeTag = (tag) => onChange(value.filter(t => t !== tag));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (input.trim()) addTag(input); }
    if (e.key === 'Backspace' && !input && value.length > 0) removeTag(value[value.length - 1]);
  };

  const filtered = suggestions
    .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s))
    .slice(0, 8);

  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <div className="min-h-[42px] px-2.5 py-1.5 flex flex-wrap gap-1.5 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-gray-900 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-24">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSugg(true); }}
            onKeyDown={handleKey}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            onFocus={() => setShowSugg(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="w-full text-sm outline-none bg-transparent py-0.5 text-gray-900 placeholder:text-gray-400"
          />
          {showSugg && filtered.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 z-10 w-56 bg-white border border-gray-200 rounded-xl shadow-card-hover overflow-hidden">
              {filtered.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => addTag(s)}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400">Enter or comma to add · {value.length}/{maxTags}</p>
    </div>
  );
};
