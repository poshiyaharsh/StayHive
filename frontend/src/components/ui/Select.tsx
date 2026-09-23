import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (val: any) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error,
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-11.5 px-3.5 flex items-center justify-between rounded-xl border bg-white dark:bg-slate-900 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          error
            ? 'border-rose-400 text-rose-900 focus:ring-rose-500'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          {selectedOption ? (
            <div className="truncate">
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedOption.label}
              </span>
              {selectedOption.sublabel && (
                <span className="ml-2 text-xs text-slate-400 font-normal">
                  {selectedOption.sublabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400">No options found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="truncate">
                          <div>{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-xs text-slate-400 font-normal">{opt.sublabel}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
