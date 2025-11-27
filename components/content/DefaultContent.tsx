
import React from 'react';

interface DefaultContentProps {
  back: () => void;
}

const DefaultContent: React.FC<DefaultContentProps> = () => {
  return (
    <div className="space-y-8 leading-relaxed py-4 text-lg !text-gray-800">
      {/* Section 1 */}
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/40 hover:bg-white/80 transition-colors shadow-xl">
        <h4 className="font-bold text-2xl !text-[#184d47] mb-4 drop-shadow-sm">1. Hướng dẫn hàng nhập</h4>
        <p className="font-medium !text-gray-700">
            Mọi yêu cầu liên quan đến hàng nhập, khách hàng vui lòng <span className="!text-[#184d47] font-bold">reply all email</span> gửi thông báo hàng đến của KML và không bỏ bất kỳ email nào của KML khỏi email đang làm việc để đảm bảo yêu cầu của khách hàng được gửi đến nhân viên phụ trách.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 items-center text-base font-semibold">
            <span className="!text-gray-600">Kimberry sử dụng:</span>
            <span className="px-4 py-1 rounded-full border border-yellow-500/50 !text-yellow-800 bg-yellow-100">Lệnh giấy (HPH)</span>
            <span className="px-4 py-1 rounded-full border border-blue-500/50 !text-blue-800 bg-blue-100">EDO (HCM)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Section 2 */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/40 hover:bg-white/80 transition-colors shadow-xl flex flex-col justify-center">
            <h4 className="font-bold text-2xl !text-[#184d47] mb-6 border-b border-gray-300 pb-2">2. Mức cược container</h4>
            <div className="space-y-6">
                <div>
                    <span className="!text-gray-600 block text-base font-bold mb-1 uppercase tracking-wide">Hàng nhập về HPH</span> 
                    <div className="flex items-baseline gap-2">
                        <b className="font-extrabold !text-[#184d47] text-2xl">3,000,000</b>
                        <span className="!text-gray-500">/</span>
                        <b className="font-extrabold !text-[#184d47] text-2xl">6,000,000</b>
                        <span className="text-base !text-gray-600 font-bold ml-1">VND</span>
                    </div>
                    <span className="text-sm !text-gray-500 font-medium">(20GP / 40HQ)</span>
                </div>
                
                <div className="h-px bg-gray-300 w-full"></div>

                <div>
                    <span className="!text-gray-600 block text-base font-bold mb-1 uppercase tracking-wide">Hàng nhập về HCM</span> 
                    <div className="flex items-baseline gap-2">
                        <b className="font-extrabold !text-[#184d47] text-2xl">1,000,000</b>
                        <span className="!text-gray-500">/</span>
                        <b className="font-extrabold !text-[#184d47] text-2xl">2,000,000</b>
                        <span className="text-base !text-gray-600 font-bold ml-1">VND</span>
                    </div>
                    <span className="text-sm !text-gray-500 font-medium">(20GP / 40HQ)</span>
                </div>
            </div>
            <p className="mt-6 text-base !text-yellow-900 italic bg-yellow-100 p-3 rounded-lg border border-yellow-300 font-medium">
                💡 Với các lô hàng miễn cược, KML sẽ thông báo trực tiếp trên email gửi AN.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/40 hover:bg-white/80 transition-colors shadow-xl">
            <h4 className="font-bold text-2xl !text-[#184d47] mb-6 border-b border-gray-300 pb-2">3. Lưu ý AN & Hóa đơn</h4>
             <ul className="space-y-4 font-medium !text-gray-700">
                <li className="flex items-start gap-3">
                    <span className="!text-green-600 mt-1 font-bold">✓</span>
                    <span className="!text-gray-700">Kiểm tra kỹ <b className="!text-[#184d47] font-extrabold">LOCAL CHARGE</b> trên AN/HÓA ĐƠN NHÁP.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="!text-red-600 mt-1 font-bold">✕</span>
                    <span className="!text-gray-700">Kimberry không giải quyết hủy hóa đơn sau khi khách đã xác nhận.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="!text-green-600 mt-1 font-bold">✓</span>
                    <span className="!text-gray-700">Kiểm tra kỹ: Số cont, Loại cont, Trọng lượng, Cảng đi/đến...</span>
                </li>
             </ul>
             
             <div className="mt-8 pt-6 border-t border-gray-300">
                 <p className="!text-gray-500 uppercase text-xs font-bold tracking-widest mb-3">EMAIL NHẬN HÓA ĐƠN</p>
                 <div className="space-y-3 text-base">
                     <div className="flex items-center gap-3 bg-white/50 p-2 rounded-lg border border-white/50">
                        <span className="text-xl">📧</span>
                        <span className="font-mono !text-blue-700 font-bold">finance@longhoanglogistics.com</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white/50 p-2 rounded-lg border border-white/50">
                        <span className="text-xl">📧</span>
                        <span className="font-mono !text-blue-700 font-bold">fin_vn@kimberryline.com</span>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default DefaultContent;
