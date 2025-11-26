
import React, { useState, useEffect, useCallback } from 'react';

interface CalendarPopupProps {
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

const monthsVN = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const CalendarPopup: React.FC<CalendarPopupProps> = ({ onSelectDate, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<React.ReactNode[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleDayClick = useCallback((day: number) => {
    const selected = new Date(year, month, day);
    onSelectDate(selected);
  }, [year, month, onSelectDate]);

  const renderCalendar = useCallback((yearParam: number, monthParam: number) => {
    const firstDay = new Date(yearParam, monthParam, 1).getDay();
    const daysInMonth = new Date(yearParam, monthParam + 1, 0).getDate();
    const prevMonthDays = new Date(yearParam, monthParam, 0).getDate();
    const today = new Date();
    
    const calendarDays: React.ReactNode[] = [];

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push(
        <div key={`prev-${i}`} className="p-3 text-center rounded-full text-white/20 text-sm">
          {prevMonthDays - i}
        </div>
      );
    }

    // Current month's days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && monthParam === today.getMonth() && yearParam === today.getFullYear();
      const isSunday = new Date(yearParam, monthParam, d).getDay() === 0;
      calendarDays.push(
        <div
          key={`current-${d}`}
          onClick={() => handleDayClick(d)}
          className={`
            p-3 text-center rounded-full transition-all duration-300 cursor-pointer text-sm font-medium
            ${isToday 
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[0_0_15px_rgba(74,222,128,0.5)] transform scale-110' 
                : 'text-white/90 hover:bg-white/10 hover:text-green-300'}
            ${isSunday && !isToday ? 'text-red-300/80' : ''}
          `}
        >
          {d}
        </div>
      );
    }
     // Next month's days
    const totalCells = firstDay + daysInMonth;
    const remaining = 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
        calendarDays.push(
            <div key={`next-${d}`} className="p-3 text-center rounded-full text-white/20 text-sm">
                {d}
            </div>
        );
    }
    setDays(calendarDays);
  }, [handleDayClick]);

  useEffect(() => {
    renderCalendar(year, month);
  }, [year, month, renderCalendar]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-[#0f4c42] to-[#072924] p-6 w-full max-w-sm text-white shadow-2xl relative overflow-hidden group" 
        onClick={e => e.stopPropagation()}
      >
         {/* Glossy Overlay */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

         <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 text-white/80 hover:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
            <h3 className="font-bold text-lg text-green-300 uppercase tracking-wide">{`${monthsVN[month]} ${year}`}</h3>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 text-white/80 hover:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
         </div>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0 absolute top-3 right-3 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
         <div className="grid grid-cols-7 text-center gap-1 relative z-10">
            {dayNames.map((day, index) => (
                <div key={day} className={`font-bold text-[10px] uppercase tracking-widest mb-2 ${index === 0 ? 'text-red-400' : 'text-green-200/50'}`}>{day}</div>
            ))}
            {days}
         </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default CalendarPopup;
