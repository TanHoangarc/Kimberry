
import React, { useState, useEffect, useCallback } from 'react';

const monthsVN = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<React.ReactNode[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const renderCalendar = useCallback((yearParam: number, monthParam: number) => {
    const firstDay = new Date(yearParam, monthParam, 1).getDay();
    const daysInMonth = new Date(yearParam, monthParam + 1, 0).getDate();
    const prevMonthDays = new Date(yearParam, monthParam, 0).getDate();
    const today = new Date();
    
    const calendarDays: React.ReactNode[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push(
        <div key={`prev-${i}`} className="p-3 text-center rounded-full !text-gray-400 text-sm font-medium">
          {prevMonthDays - i}
        </div>
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && monthParam === today.getMonth() && yearParam === today.getFullYear();
      const isSunday = new Date(yearParam, monthParam, d).getDay() === 0;
      calendarDays.push(
        <div
          key={`current-${d}`}
          className={`
            p-3 text-center rounded-full transition-all duration-300 text-sm font-bold
            ${isToday 
                ? 'bg-[#184d47] !text-white shadow-lg transform scale-110' 
                : '!text-gray-700 hover:bg-[#184d47]/10 hover:!text-[#184d47] cursor-pointer'}
            ${isSunday && !isToday ? '!text-red-600' : ''}
          `}
        >
          {d}
        </div>
      );
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
        calendarDays.push(
            <div key={`next-${d}`} className="p-3 text-center rounded-full !text-gray-400 text-sm font-medium">
                {d}
            </div>
        );
    }
    setDays(calendarDays);
  }, []);

  useEffect(() => {
    renderCalendar(year, month);
  }, [year, month, renderCalendar]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="rounded-3xl border border-white/40 bg-white/70 backdrop-blur-md p-6 w-full shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/50 transition-colors flex-shrink-0 !text-gray-600 hover:!text-[#184d47]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>
        <div className="flex justify-center gap-2 w-full bg-white/50 p-1.5 rounded-full border border-gray-200 shadow-inner">
            <select value={month} onChange={handleMonthChange} className="bg-transparent !text-[#184d47] font-bold text-center outline-none cursor-pointer appearance-none hover:text-green-700 transition-colors text-sm px-2">
                {monthsVN.map((m, i) => <option key={i} value={i} className="text-gray-900 bg-white">{m}</option>)}
            </select>
            <span className="!text-gray-400 self-center">|</span>
            <select value={year} onChange={handleYearChange} className="bg-transparent !text-[#184d47] font-bold text-center outline-none cursor-pointer appearance-none hover:text-green-700 transition-colors text-sm px-2">
                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => <option key={y} value={y} className="text-gray-900 bg-white">{y}</option>)}
            </select>
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/50 transition-colors flex-shrink-0 !text-gray-600 hover:!text-[#184d47]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 text-center gap-1 mb-4 relative z-10">
        {dayNames.map((day, index) => (
          <div key={day} className={`font-extrabold text-[10px] uppercase tracking-widest mb-2 ${index === 0 ? '!text-red-500' : '!text-gray-500'}`}>{day}</div>
        ))}
        {days}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-300 relative z-10">
        <h3 className="font-bold !text-[#184d47] text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="animate-pulse">🔴</span> Thông báo
        </h3>
        <ul className="text-sm !text-gray-700 space-y-3 leading-relaxed font-medium">
          <li className="flex items-start gap-2">
            <span className="!text-green-600 mt-1">●</span>
            <span>Lịch làm việc: <b className="!text-[#184d47]">T2-T6, sáng T7.</b></span>
          </li>
          <li className="flex items-start gap-2">
             <span className="!text-green-600 mt-1">●</span>
             <span>Hoàn cược: <b className="!text-[#184d47]">1-2 tuần</b> sau khi nhận hồ sơ.</span>
          </li>
          <li className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-2">
            <span className="!text-yellow-700 font-bold block mb-1 text-xs uppercase tracking-wider">Lịch nghỉ Tết</span>
            <div className="flex justify-between items-center text-xs !text-gray-800">
                 <span>Nghỉ: <b className="!text-[#184d47]">14/02</b></span>
                 <span>→</span>
                 <span>Làm lại: <b className="!text-[#184d47]">23/02</b></span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
