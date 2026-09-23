import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  minDate?: string;
  maxDate?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    return new Date();
  };

  const initialDate = parseDate(value);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  useEffect(() => {
    const d = parseDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formatDisplay = (dStr: string) => {
    if (!dStr) return 'Select date';
    const d = parseDate(dStr);
    const day = d.getDate();
    const month = monthNames[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const fullDate = `${viewYear}-${m}-${d}`;
    onChange(fullDate);
    setIsOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Styled Trigger Button */}
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
          <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className={value ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-400'}>
            {formatDisplay(value)}
          </span>
        </div>
      </button>

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      {/* Popover Calendar Grid */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl p-4 select-none"
          >
            {/* Header: Month / Year / Prev / Next */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {shortDays.map((d) => (
                <span key={d} className="text-[11px] font-semibold text-slate-400">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty offset padding */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-8" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const m = String(viewMonth + 1).padStart(2, '0');
                const d = String(dayNum).padStart(2, '0');
                const dateKey = `${viewYear}-${m}-${d}`;
                const isSelected = dateKey === value;
                const isToday = dateKey === todayStr;

                const isDisabled = Boolean((minDate && dateKey < minDate) || (maxDate && dateKey > maxDate));

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                        : isToday
                        ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : isDisabled
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Action: Today */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onChange(todayStr);
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
