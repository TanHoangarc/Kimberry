
import React from 'react';

interface PoliciesContentProps {
  back: () => void;
}

const PoliciesContent: React.FC<PoliciesContentProps> = ({ back }) => {
  return (
    <div className="space-y-6 text-lg !text-gray-800">
      
      {/* KHỐI 1: HẢI PHÒNG */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-xl hover:bg-white/80 transition-colors group">
        <h4 className="text-xl font-bold !text-[#184d47] mb-3 flex items-center gap-2">
          1. Đối với hàng nhập về Hải Phòng (HP)
        </h4>
        <p className="mb-4 !text-gray-700">
          Khách hàng vui lòng gửi <b className="!text-[#184d47]">HỒ SƠ GỐC</b> gồm: Phơi phiếu nâng hạ, công văn hoàn cược, UNC cược cont.
        </p>
        
        {/* Box địa chỉ nổi bật */}
        <div className="bg-white/50 p-5 rounded-xl border-l-4 border-[#184d47] shadow-inner">
            <p className="font-semibold !text-gray-800 mb-2 flex items-start gap-2">
                <span className="!text-gray-800">🏢</span> 
                <span className="!text-gray-800">Tầng 3A (Tòa nhà Seabank), Thửa 17, Khu B1, Lô 7B Lê Hồng Phong, P. Gia Viên, TP. Hải Phòng.</span>
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-300 text-base">
                <span className="flex items-center gap-2 !text-[#184d47] font-bold">
                    👤 Tú
                </span>
                <span className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full !text-green-800 font-bold border border-green-200">
                    📞 076 339 5504
                </span>
            </div>
        </div>
      </div>

      {/* KHỐI 2: HỒ CHÍ MINH */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-xl hover:bg-white/80 transition-colors">
        <h4 className="text-xl font-bold !text-[#184d47] mb-3 flex items-center gap-2">
          2. Đối với hàng nhập về Hồ Chí Minh (HCM)
        </h4>
        <p className="mb-4 !text-gray-700">
          Chỉ cần gửi <b className="!text-[#184d47]">BẢN SCAN</b>: Phiếu nâng/hạ, công văn hoàn cược, UNC cược.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-base shadow-inner">
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-2">
                    <span className="!text-gray-700">📧</span>
                    <span className="font-mono !text-blue-800 font-bold">doc_hph@kimberryline.com</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="!text-gray-700">📧</span>
                    <span className="font-mono !text-blue-800 font-bold">fin_vn@kimberryline.com</span>
                 </div>
             </div>
        </div>
        
        <p className="mt-4 text-base !text-red-600 italic flex items-center gap-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
            <span>⚠️</span>
            <strong className="!text-red-700">Lưu ý: Không yêu cầu bản gốc công văn hoàn cược đối với HCM.</strong>
        </p>
      </div>

    </div>
  );
};

export default PoliciesContent;
