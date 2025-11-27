
import React, { useState } from 'react';
import { JobData } from '../../types';

interface JobSearchContentProps {
  back: () => void;
}

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxk6Gw3BlWnhFay3Zacc_NC9ntebz_lELseV0eXocXtS59xUeK781b-B8ZnQ-sT0Oay/exec";
const LOCAL_STORAGE_KEY = 'kimberry-job-entries';

// Define Modern Icons
const Icons = {
  Job: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  LocalCharge: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Deposit: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Status: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CalendarIn: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  CalendarOut: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const JobSearchContent: React.FC<JobSearchContentProps> = ({ back }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("⚠️ Vui lòng nhập mã HBL hoặc Job cần tra cứu.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    // 1. Check local storage first
    try {
        const localDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localDataRaw) {
            const localJobs: JobData[] = JSON.parse(localDataRaw);
            const foundJob = localJobs.find(job => job.Ma?.trim().toLowerCase() === trimmedQuery.toLowerCase());
            if (foundJob) {
                setResult(foundJob);
                setIsLoading(false);
                return; // Found in local data, so we stop here.
            }
        }
    } catch (e) {
        console.error("Error reading from local storage:", e);
    }


    // 2. If not found locally, fetch from Google Sheet
    try {
      const response = await fetch(`${WEB_APP_URL}?q=${encodeURIComponent(trimmedQuery)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
      
      const searchResult = Array.isArray(data) ? data[0] : data;
      if (!searchResult || Object.keys(searchResult).length === 0) {
        setError(`❌ Không tìm thấy dữ liệu cho mã: ${trimmedQuery}`);
      } else {
        setResult(searchResult);
      }

    } catch (err) {
      console.error(err);
      setError("❌ Lỗi kết nối hoặc dữ liệu không đọc được từ Google Sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (val: string) => {
      const isFilled = val !== '';
      return `w-full p-4 pl-5 border rounded-3xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#184d47] focus:border-transparent transition-all duration-300 text-lg ${isFilled ? '!bg-[#E8F0FE] !text-black border-[#184d47]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`;
  };

  // Helper component for result rows
  const ResultRow = ({ icon, label, value, highlight = false, isStatus = false }: { icon: React.ReactNode, label: string, value: any, highlight?: boolean, isStatus?: boolean }) => {
      const hasValue = value && value !== '-' && value !== 0;
      
      // Use !text-[...] to override global styles
      let valueColor = '!text-[#184d47] font-semibold'; // Default dark teal
      if (highlight) valueColor = '!text-[#184d47] font-extrabold text-xl'; 
      if (isStatus && hasValue) valueColor = '!text-[#184d47] font-bold';

      return (
        <div className="flex items-center justify-between p-4 border-b border-gray-300 last:border-0 hover:bg-white/50 transition-colors group">
            <div className="flex items-center gap-4">
                <span className="!text-[#184d47] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    {icon}
                </span>
                <span className="!text-gray-600 font-medium">{label}</span>
            </div>
            <div className={`text-right ${valueColor}`}>
                {typeof value === 'number' ? value.toLocaleString('en-US') : (value || "-")}
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-8">
        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg transition-all hover:bg-white/10">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔍</span>
                <h3 className="text-xl font-bold text-green-300">Tra cứu Job</h3>
             </div>
             <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nhập mã Job hoặc số HBL..."
                    className={getInputStyle(query)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#184d47] text-white rounded-2xl hover:bg-green-700 transition-colors font-bold shadow-lg disabled:opacity-50"
                >
                    {isLoading ? '⏳' : 'Tìm kiếm'}
                </button>
             </div>
             {error && (
                <div className="mt-4 p-3 bg-red-500/20 text-red-200 rounded-xl border border-red-500/30 flex items-center gap-2">
                    <span>{error}</span>
                </div>
             )}
        </div>

        {/* Results */}
        {result && (
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-xl animate-fade-in text-[#184d47]">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300/50">
                    <span className="text-2xl">📦</span>
                    <h3 className="text-xl font-bold !text-[#184d47]">Kết quả chi tiết</h3>
                </div>
                
                <div className="flex flex-col">
                     <ResultRow icon={Icons.Job} label="Mã Job" value={result.Ma} />
                     <ResultRow icon={Icons.LocalCharge} label="Local Charge" value={result.MaKH} highlight />
                     <ResultRow icon={Icons.Deposit} label="Tiền Cược" value={result.SoTien} highlight />
                     
                     <div className="h-px bg-gray-300 w-full my-2"></div>

                     <ResultRow icon={Icons.Status} label="Trạng thái LCC" value={result.TrangThai} isStatus />
                     <ResultRow icon={Icons.CalendarIn} label="Ngày nhận cược" value={result.NoiDung1} />
                     <ResultRow icon={Icons.CalendarOut} label="Ngày hoàn cược" value={result.NoiDung2} />
                </div>
            </div>
        )}
        
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.4s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default JobSearchContent;
