
import React, { useState } from 'react';

// Declare PDFLib global variable loaded from CDN in index.html
declare const PDFLib: any;

interface AiToolContentProps {
  back: () => void;
}

type ToolType = 'split' | 'unlock';

const getInputStyle = (val: string | number) => {
    const isFilled = val !== '' && val !== null && val !== undefined;
    return `w-full p-3 border rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#184d47] transition-all duration-300 ${isFilled ? '!bg-[#E8F0FE] !text-black border-[#184d47]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`;
};

const AiToolContent: React.FC<AiToolContentProps> = ({ back }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('split');

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTool('split')}
          className={`px-6 py-3 rounded-t-2xl font-bold text-sm transition-all transform duration-300 relative overflow-hidden ${
            activeTool === 'split'
              ? 'text-white bg-white/10 border-t border-x border-white/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTool === 'split' && <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_10px_#4ade80]"></div>}
          ✂️ Tách file PDF
        </button>
        <button
          onClick={() => setActiveTool('unlock')}
          className={`px-6 py-3 rounded-t-2xl font-bold text-sm transition-all transform duration-300 relative overflow-hidden ${
            activeTool === 'unlock'
              ? 'text-white bg-white/10 border-t border-x border-white/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTool === 'unlock' && <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_10px_#4ade80]"></div>}
          🔓 Unlock PDF
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-10 shadow-xl min-h-[500px]">
        {activeTool === 'split' && <SplitPdfTool />}
        {activeTool === 'unlock' && <UnlockPdfTool />}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: SPLIT PDF TOOL ---
interface PageItem {
    index: number;
    originalName: string;
    customName: string;
}

const SplitPdfTool: React.FC = () => {
    const [mode, setMode] = useState<'range' | 'individual'>('range');
    const [file, setFile] = useState<File | null>(null);
    const [pageRange, setPageRange] = useState('');
    const [outputName, setOutputName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Individual mode state
    const [loadedPdfDoc, setLoadedPdfDoc] = useState<any>(null);
    const [pageList, setPageList] = useState<PageItem[]>([]);
    
    // Preview state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
            setStatus(null);
            
            // Default name for Range mode
            setOutputName(f.name.replace('.pdf', '') + '_split');

            // Load for Individual mode
            if (mode === 'individual') {
                setIsProcessing(true);
                try {
                    const arrayBuffer = await f.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    setLoadedPdfDoc(pdfDoc);
                    
                    const count = pdfDoc.getPageCount();
                    const pages: PageItem[] = [];
                    const baseName = f.name.replace('.pdf', '');
                    for (let i = 0; i < count; i++) {
                        pages.push({
                            index: i,
                            originalName: `Page ${i + 1}`,
                            customName: `${baseName}_page_${i + 1}`
                        });
                    }
                    setPageList(pages);
                } catch (error) {
                    console.error(error);
                    setStatus({ type: 'error', message: 'Không thể đọc file PDF.' });
                } finally {
                    setIsProcessing(false);
                }
            }
        } else if (f) {
            setStatus({ type: 'error', message: 'Vui lòng chọn file PDF.' });
        }
    };

    // Mode Switch Handler
    const handleModeSwitch = (newMode: 'range' | 'individual') => {
        setMode(newMode);
        setFile(null);
        setStatus(null);
        setPageList([]);
        setLoadedPdfDoc(null);
        setPageRange('');
        setOutputName('');
    };

    // --- RANGE SPLIT LOGIC ---
    const handleSplitRange = async () => {
        if (!file || !pageRange || !outputName) {
            setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }

        setIsProcessing(true);
        setStatus(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();

            const newPdfDoc = await PDFLib.PDFDocument.create();

            const pagesToKeep = new Set<number>();
            const parts = pageRange.split(',').map(p => p.trim());

            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= totalPages) pagesToKeep.add(i - 1);
                        }
                    }
                } else {
                    const p = Number(part);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) {
                        pagesToKeep.add(p - 1);
                    }
                }
            }

            const indices = Array.from(pagesToKeep).sort((a, b) => a - b);
            
            if (indices.length === 0) {
                throw new Error('Không có trang nào hợp lệ được chọn.');
            }

            const copiedPages = await newPdfDoc.copyPages(pdfDoc, indices);
            copiedPages.forEach((page: any) => newPdfDoc.addPage(page));

            const pdfBytes = await newPdfDoc.save();
            
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${outputName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus({ type: 'success', message: 'Đã tách và tải xuống thành công!' });

        } catch (error) {
            console.error(error);
            const e = error as Error;
            setStatus({ type: 'error', message: `Lỗi: ${e.message}` });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- INDIVIDUAL SPLIT LOGIC ---
    const handleNameChange = (index: number, newName: string) => {
        setPageList(prev => {
            const newList = [...prev];
            newList[index] = { ...newList[index], customName: newName };
            return newList;
        });
    };

    const handleDownloadSinglePage = async (pageItem: PageItem) => {
        if (!loadedPdfDoc) return;
        
        try {
            const newPdfDoc = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(loadedPdfDoc, [pageItem.index]);
            newPdfDoc.addPage(copiedPage);
            
            const pdfBytes = await newPdfDoc.save();
            
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            // Ensure .pdf extension
            const filename = pageItem.customName.toLowerCase().endsWith('.pdf') 
                ? pageItem.customName 
                : `${pageItem.customName}.pdf`;
                
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tải trang này.');
        }
    };
    
    const handlePreviewPage = async (pageItem: PageItem) => {
        if (!loadedPdfDoc) return;
        setPreviewLoading(true);
        setPreviewUrl(null);

        try {
            const newPdfDoc = await PDFLib.PDFDocument.create();
            // Copy only the selected page
            const [copiedPage] = await newPdfDoc.copyPages(loadedPdfDoc, [pageItem.index]);
            newPdfDoc.addPage(copiedPage);
            
            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (error) {
            console.error(error);
            alert('Không thể tạo bản xem trước.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Mode Switcher */}
            <div className="flex justify-center gap-6 p-2 bg-white/5 rounded-2xl border border-white/10 w-max mx-auto">
                <label className={`flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl transition-all ${mode === 'range' ? 'bg-[#184d47] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <input 
                        type="radio" 
                        name="splitMode" 
                        checked={mode === 'range'} 
                        onChange={() => handleModeSwitch('range')}
                        className="hidden"
                    />
                    <span className="font-bold">Tách theo khoảng</span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl transition-all ${mode === 'individual' ? 'bg-[#184d47] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <input 
                        type="radio" 
                        name="splitMode" 
                        checked={mode === 'individual'} 
                        onChange={() => handleModeSwitch('individual')}
                        className="hidden"
                    />
                    <span className="font-bold">Tách từng trang</span>
                </label>
            </div>

            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <label className="block text-base font-bold text-green-300 mb-3">
                        1. Chọn file PDF gốc {mode === 'individual' ? '(Tự động phân tích trang)' : ''}
                    </label>
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-max text-sm text-gray-300
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#a8d0a2] file:text-gray-800
                          hover:file:bg-[#5c9ead] hover:file:text-white
                          bg-white/5 rounded-full border border-white/10 pr-4 cursor-pointer"
                    />
                </div>

                {mode === 'range' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <label className="block text-base font-bold text-green-300 mb-3">2. Trang cần tách (Ví dụ: 1, 3-5, 8)</label>
                            <input 
                                type="text" 
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder="Nhập số trang..."
                                className={getInputStyle(pageRange)}
                            />
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <label className="block text-base font-bold text-green-300 mb-3">3. Tên file mới (Không cần đuôi .pdf)</label>
                            <input 
                                type="text" 
                                value={outputName}
                                onChange={(e) => setOutputName(e.target.value)}
                                placeholder="Nhập tên file..."
                                className={getInputStyle(outputName)}
                            />
                        </div>

                        <div className="md:col-span-2">
                             <button
                                onClick={handleSplitRange}
                                disabled={isProcessing || !file}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? '⏳ Đang xử lý...' : '🚀 Tách và Tải xuống'}
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'individual' && pageList.length > 0 && (
                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 shadow-inner">
                        <div className="bg-white/10 p-4 font-bold text-green-300 grid grid-cols-[60px_1fr_80px_100px] gap-4 text-center text-sm uppercase tracking-wider">
                            <div>Trang</div>
                            <div>Tên File Mới</div>
                            <div>Xem</div>
                            <div>Tải</div>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {pageList.map((page, idx) => (
                                <div key={page.index} className="grid grid-cols-[60px_1fr_80px_100px] gap-4 p-3 border-b border-white/5 last:border-0 items-center hover:bg-white/10 transition-colors">
                                    <div className="text-center font-bold text-gray-300">{idx + 1}</div>
                                    <input 
                                        type="text" 
                                        value={page.customName}
                                        onChange={(e) => handleNameChange(idx, e.target.value)}
                                        className={getInputStyle(page.customName)}
                                    />
                                    <div className="text-center">
                                         <button 
                                            onClick={() => handlePreviewPage(page)}
                                            disabled={previewLoading}
                                            className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all font-semibold"
                                            title="Xem trước"
                                        >
                                            👁️ Xem
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <button 
                                            onClick={() => handleDownloadSinglePage(page)}
                                            className="px-3 py-1.5 bg-green-500/20 text-green-300 border border-green-500/40 rounded-lg text-xs hover:bg-green-500 hover:text-white transition-all font-semibold"
                                        >
                                            ⬇ Tải
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status && (
                    <div className={`p-4 rounded-xl text-sm font-semibold border ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'}`}>
                        {status.message}
                    </div>
                )}
            </div>
            
            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={closePreview}>
                    <div className="bg-gray-900 border border-white/20 rounded-2xl p-4 w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                             <h3 className="font-bold text-xl text-white">Xem trước</h3>
                             <button onClick={closePreview} className="text-gray-400 hover:text-white text-2xl">✕</button>
                        </div>
                        <div className="flex-1 bg-black/50 rounded-xl overflow-hidden relative">
                             <iframe src={previewUrl} className="w-full h-[75vh]" title="PDF Page Preview"></iframe>
                        </div>
                    </div>
                </div>
            )}
            
            {previewLoading && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
                        <span className="animate-spin text-3xl">⏳</span>
                        <span className="text-white font-bold">Đang tạo bản xem trước...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: UNLOCK PDF TOOL ---
const UnlockPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
            setStatus(null);
        } else if (f) {
            setStatus({ type: 'error', message: 'Vui lòng chọn file PDF.' });
        }
    };

    const handleUnlock = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Vui lòng chọn file PDF.' });
            return;
        }

        setIsProcessing(true);
        setStatus(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Try to load with ignoreEncryption: true.
            // This works for Owner Passwords (permissions) where content is not encrypted against reading.
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            // Saving automatically removes encryption unless specifically re-encrypted
            const pdfBytes = await pdfDoc.save();
            
            // Download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${file.name.replace('.pdf', '')}_unlocked.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setStatus({ type: 'success', message: 'Đã mở khóa và tải xuống thành công!' });

        } catch (error) {
            console.error(error);
            const e = error as Error;
            setStatus({ type: 'error', message: `Lỗi: ${e.message}. Có thể file cần mật khẩu để mở (User Password).` });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <label className="block text-base font-bold text-green-300 mb-3">1. Chọn file PDF bị khóa</label>
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-max text-sm text-gray-300
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#a8d0a2] file:text-gray-800
                          hover:file:bg-[#5c9ead] hover:file:text-white
                          bg-white/5 rounded-full border border-white/10 pr-4 cursor-pointer"
                    />
                </div>

                {status && (
                    <div className={`p-4 rounded-xl text-sm font-semibold border ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'}`}>
                        {status.message}
                    </div>
                )}

                <button
                    onClick={handleUnlock}
                    disabled={isProcessing || !file}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? '⏳ Đang xử lý...' : '🔓 Mở khóa và Tải xuống'}
                </button>
            </div>
        </div>
    );
};

export default AiToolContent;
