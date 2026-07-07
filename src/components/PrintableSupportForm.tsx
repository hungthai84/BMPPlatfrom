import React from 'react';
import { SupportRequestData } from '../types';

export const PrintableSupportForm: React.FC<{ data: SupportRequestData }> = ({ data }) => {
  return (
    <div className="p-8 bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          .no-print { display: none; }
        }
      `}</style>
      <div className="flex justify-between">
        <div>Số: {data.number}</div>
        <div className="text-center">
          <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold underline">Độc lập - Tự do - Hạnh phúc</p>
          <p>––––––––––✰✰✰––––––––––</p>
        </div>
      </div>
      <h1 className="text-center font-bold text-xl my-6">GIẤY YÊU CẦU HỖ TRỢ TỪ KHÁCH HÀNG</h1>
      
      <div className="mb-6">
        <h2 className="font-bold mb-2">1. PHẦN DÀNH CHO KHÁCH HÀNG:</h2>
        <p>Kính gửi: {data.companyName}</p>
        <p>Tên tôi là: {data.customerName}</p>
        <p>Địa chỉ: {data.address}</p>
        <p>Số CMND/CCCD/ Hộ chiếu: {data.idCard}</p>
        <p>Đề nghị Quý Công ty hỗ trợ: {data.supportRequest}</p>
        <p>Loại dịch vụ: {data.serviceType}</p>
        <p>Nội dung: {data.content}</p>
        <p>Kênh Tiếp Nhận từ: {data.receptionChannel}</p>
        <div className="flex justify-end mt-4">
            <div className="text-center">
                <p>Ngày {data.date}</p>
                <p className="font-bold">Người yêu cầu</p>
                <p>(Ký, ghi đầy đủ họ tên)</p>
                <br/><br/><br/>
                <p>{data.requesterName}</p>
            </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h2 className="font-bold mb-4">2. PHẦN DÀNH CHO CÁC PHÒNG BAN:</h2>
        {['Phòng Ban Liên Đới 1', 'Phòng Ban Liên Đới 2', 'Ban Lãnh Đạo', 'Phòng Ban Thực Hiện'].map((dept, index) => (
          <div key={index} className="mb-4">
            <p className="font-semibold">{index + 1}. {dept}</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <p>Tiếp nhận lần: ..........................</p>
                <p>Tra soát lần: ..........................</p>
                <p>Giờ/Ngày: ..........................</p>
                <p>Ký Tên: ..........................</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
