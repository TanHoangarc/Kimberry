
import React, { useState, useEffect, useRef } from 'react';
import { MblPaymentData } from '../../types';

const UPLOAD_API_ENDPOINT = '/api/upload';
const PENDING_STORAGE_KEY = 'kimberry-mbl-payment-data';
const COMPLETED_STORAGE_KEY = 'kimberry-mbl-completed-payment-data';
const MA_LINE_STORAGE_KEY = 'kimberry-ma-line-options';

const DEFAULT_MA_LINE_OPTIONS = [
    'EVERGREEN', 'ONE', 'WANHAI', 'COSCO', 'COSCO-HP', 'TSLHN', 'SITC', 'AEC',
    'MSCHCM', 'MSCHP', 'HAIAN-HCM', 'HAIAN-HP', 'MAERSK', 'JINJIANG', 'ORIMAS',
    'RCL', 'OOCL', 'CMACGM', 'MARINE-HP', 'SINOVITRANS', 'SNVT-HP', 'HAPAG-LLOYD'
].sort();


interface MblPaymentContentProps {
  back: () => void;
}

const initialFormData = {
    maLine: '',
    soTien: '',
    mbl: '',
};

const MblPaymentContent: React.FC<MblPaymentContentProps> = ({ back }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [entries, setEntries] = useState<MblPaymentData[]>([]);
    const [completedEntries, setCompletedEntries] = useState<MblPaymentData[]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [completingEntryId, setCompletingEntryId] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uncFileRef = useRef<HTMLInputElement>(null);
    
    const [maLineOptions, setMaLineOptions] = useState<string[]>([]);
    const [newMaLine, setNewMaLine] = useState('');

    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem(PENDING_STORAGE_KEY);
            if (savedEntries) setEntries(JSON.parse(savedEntries));

            const savedCompleted = localStorage.getItem(COMPLETED_STORAGE_KEY);
            if (savedCompleted) setCompletedEntries(JSON.parse(savedCompleted));

            const savedMaLines = localStorage.getItem(MA_LINE_STORAGE_KEY);
            if (savedMaLines) {
                setMaLineOptions(JSON.parse(savedMaLines));
            } else {
                setMaLineOptions(DEFAULT_MA_LINE_OPTIONS);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setMaLineOptions(DEFAULT_MA_LINE_OPTIONS);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(entries));
        } catch (error) {
            console.error("Failed to save MBL payment data to localStorage", error);
        }
    }, [entries]);
    
     useEffect(() => {
        try {
            localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(completedEntries));
        } catch (error) {
            console.error("Failed to save completed MBL payment data to localStorage", error);
        }
    }, [completedEntries]);
    
    useEffect(() => {
        try {
            if (maLineOptions.length > 0) {
               localStorage.setItem(MA_LINE_STORAGE_KEY, JSON.stringify(maLineOptions));
            }
        } catch (error) {
            console.error("Failed to save Ma Line options to localStorage", error);
        }
    }, [maLineOptions]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'soTien') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue ? parseInt(numericValue, 10) : '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleAddMaLine = () => {
        const trimmedNewLine = newMaLine.trim().toUpperCase();
        if (!trimmedNewLine) {
            setStatus({ type: 'error', message: 'Tên Mã Line mới không được để trống.' });
            return;
        }
        if (maLineOptions.some(option => option.toLowerCase() === trimmedNewLine.toLowerCase())) {
            setStatus({ type: 'error', message: `Mã Line "${trimmedNewLine}" đã tồn tại trong danh sách.` });
            return;
        }
        setMaLineOptions(prev => [...prev, trimmedNewLine].sort());
        setNewMaLine('');
        setStatus({ type: 'success', message: `Đã thêm thành công Mã Line "${trimmedNewLine}".` });
    };


    const handleAddEntry = async () => {
        if (!formData.maLine || !selectedFile) {
            setStatus({ type: 'error', message: 'Vui lòng chọn Mã Line và chọn hóa đơn.' });
            return;
        }

        setIsUploading(true);
        setStatus({ type: 'info', message: 'Đang tải hóa đơn và lưu thông tin...' });

        const searchParams = new URLSearchParams({
            jobId: `MBL-${formData.maLine}-${Date.now()}`,
            filename: selectedFile.name,
            uploadPath: 'MBL'
        });

        try {
            const response = await fetch(`${UPLOAD_API_ENDPOINT}?${searchParams.toString()}`, {
                method: 'POST',
                body: selectedFile,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi server');

            const newEntry: MblPaymentData = {
                id: Date.now().toString(),
                ...formData,
                soTien: formData.soTien || 0,
                hoaDonUrl: result.url,
                hoaDonFilename: selectedFile.name,
            };

            setEntries(prev => [...prev, newEntry]);
            setFormData(initialFormData);
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
            setStatus({ type: 'success', message: `Đã thêm thanh toán cho Mã Line "${newEntry.maLine}".` });

        } catch (error) {
            const err = error as Error;
            setStatus({ type: 'error', message: `Thêm thất bại: ${err.message}` });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCompleteClick = (idToComplete: string) => {
        setCompletingEntryId(idToComplete);
        if (uncFileRef.current) {
            uncFileRef.current.value = ''; // Reset file input to allow re-uploading the same file
            uncFileRef.current.click();
        }
    };
    
    const handleUncFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !completingEntryId) {
            setCompletingEntryId(null);
            return;
        }

        const uncFile = event.target.files[0];
        const originalEntry = entries.find(e => e.id === completingEntryId);

        if (!originalEntry) {
            setStatus({ type: 'error', message: 'Không tìm thấy mục gốc để hoàn thành.' });
            setCompletingEntryId(null);
            return;
        }
        
        setIsUploading(true);
        setStatus({ type: 'info', message: `Đang tải file UNC cho Mã Line ${originalEntry.maLine}...` });

        const searchParams = new URLSearchParams({
            jobId: `DONE-${originalEntry.maLine}-${originalEntry.id}`,
            filename: uncFile.name,
            uploadPath: 'DONE'
        });

        try {
            const response = await fetch(`${UPLOAD_API_ENDPOINT}?${searchParams.toString()}`, {
                method: 'POST',
                body: uncFile,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Lỗi server khi tải UNC.');

            const completedEntry: MblPaymentData = {
                ...originalEntry,
                hoaDonUrl: result.url,
                hoaDonFilename: uncFile.name,
            };

            setCompletedEntries(prev => [...prev, completedEntry]);
            setEntries(prev => prev.filter(entry => entry.id !== completingEntryId));
            setStatus({ type: 'success', message: `Đã hoàn thành thanh toán cho Mã Line "${originalEntry.maLine}".` });

        } catch (error) {
            const err = error as Error;
            setStatus({ type: 'error', message: `Hoàn thành thất bại: ${err.message}` });
        } finally {
            setIsUploading(false);
            setCompletingEntryId(null);
        }
    };

    const handleDeleteCompleted = (idToDelete: string) => {
        if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn mục đã thanh toán này?')) {
            setCompletedEntries(prev => prev.filter(entry => entry.id !== idToDelete));
            setStatus({ type: 'info', message: 'Đã xóa mục đã thanh toán.' });
        }
    };


    const statusColor = {
        success: 'text-green-600 bg-green-100 border-green-300',
        error: 'text-red-600 bg-red-100 border-red-300',
        info: 'text-blue-600 bg-blue-100 border-blue-300',
    };

    return (
        <div className="space-y-6">
             <input
                type="file"
                ref={uncFileRef}
                onChange={handleUncFileSelected}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Nhập thông tin thanh toán MBL</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mã Line Dropdown and Add Field */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Mã Line (*)</label>
                        <div className="flex items-center gap-2">
                            <select
                                name="maLine"
                                value={formData.maLine}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-[#5c9ead] outline-none"
                            >
                                <option value="">--- Chọn Mã Line ---</option>
                                {maLineOptions.map(line => <option key={line} value={line}>{line}</option>)}
                            </select>
                            <input
                                type="text"
                                value={newMaLine}
                                onChange={(e) => setNewMaLine(e.target.value)}
                                placeholder="Thêm Mã Line mới..."
                                className="p-2 border rounded-md focus:ring-2 focus:ring-[#5c9ead] outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMaLine()}
                            />
                            <button onClick={handleAddMaLine} className="px-3 py-2 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 transition-colors flex-shrink-0">
                                + Thêm
                            </button>
                        </div>
                    </div>

                    <input
                        name="soTien"
                        value={formData.soTien ? Number(formData.soTien).toLocaleString('en-US') : ''}
                        onChange={handleChange}
                        placeholder="Số tiền"
                        inputMode="decimal"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#5c9ead] outline-none"
                    />
                    <input
                        name="mbl"
                        value={formData.mbl}
                        onChange={handleChange}
                        placeholder="MBL"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#5c9ead] outline-none"
                    />
                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-600 mb-1">Upload hóa đơn (*)</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-[#a8d0a2] file:text-gray-800
                              hover:file:bg-[#5c9ead] hover:file:text-white"
                        />
                    </div>
                </div>
                <button onClick={handleAddEntry} disabled={isUploading} className="mt-4 px-4 py-2 bg-[#5c9ead] text-white rounded-md hover:bg-[#4a8c99] disabled:bg-gray-400">
                    {isUploading ? 'Đang xử lý...' : '➕ Thêm vào bảng'}
                </button>
            </div>

            {status && <div className={`p-3 rounded-md border ${statusColor[status.type]}`}>{status.message}</div>}

            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Danh sách chờ thanh toán ({entries.length} mục)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 font-semibold">Mã Line</th>
                                <th className="p-2 font-semibold">Số tiền</th>
                                <th className="p-2 font-semibold">MBL</th>
                                <th className="p-2 font-semibold">Hóa đơn</th>
                                <th className="p-2 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 whitespace-nowrap">{entry.maLine}</td>
                                    <td className="p-2 whitespace-nowrap">{typeof entry.soTien === 'number' ? entry.soTien.toLocaleString('en-US') : entry.soTien}</td>
                                    <td className="p-2 whitespace-nowrap">{entry.mbl || '-'}</td>
                                    <td className="p-2 whitespace-nowrap">
                                        <a href={entry.hoaDonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={entry.hoaDonFilename}>
                                            Xem hóa đơn
                                        </a>
                                    </td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => handleCompleteClick(entry.id)} disabled={isUploading} className="px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 transition-colors disabled:bg-gray-400" title="Hoàn thành thanh toán và tải lên UNC">
                                            Hoàn thành
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {entries.length === 0 && <p className="text-center text-gray-500 py-4">Chưa có dữ liệu nào.</p>}
            </div>
            
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Danh sách đã thanh toán ({completedEntries.length} mục)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 font-semibold">Mã Line</th>
                                <th className="p-2 font-semibold">Số tiền</th>
                                <th className="p-2 font-semibold">MBL</th>
                                <th className="p-2 font-semibold">UNC</th>
                                <th className="p-2 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedEntries.map((entry) => (
                                <tr key={entry.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 whitespace-nowrap">{entry.maLine}</td>
                                    <td className="p-2 whitespace-nowrap">{typeof entry.soTien === 'number' ? entry.soTien.toLocaleString('en-US') : entry.soTien}</td>
                                    <td className="p-2 whitespace-nowrap">{entry.mbl || '-'}</td>
                                    <td className="p-2 whitespace-nowrap">
                                        <a href={entry.hoaDonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={entry.hoaDonFilename}>
                                            Xem UNC
                                        </a>
                                    </td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => handleDeleteCompleted(entry.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Xóa vĩnh viễn">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {completedEntries.length === 0 && <p className="text-center text-gray-500 py-4">Chưa có dữ liệu nào.</p>}
            </div>
        </div>
    );
};

export default MblPaymentContent;