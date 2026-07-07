import React, { useState } from 'react';
import { SupportRequestData } from '../types';
import { PrintableSupportForm } from './PrintableSupportForm';

export const SupportRequestManager: React.FC = () => {
  const [formData, setFormData] = useState<SupportRequestData>({
    number: '',
    companyName: '',
    customerName: '',
    address: '',
    idCard: '',
    supportRequest: '',
    serviceType: '',
    content: '',
    receptionChannel: '',
    date: '',
    requesterName: ''
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isPreview) {
    return (
      <div className="p-4">
        <button
          onClick={() => setIsPreview(false)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Quay lại chỉnh sửa
        </button>
        <button
          onClick={() => window.print()}
          className="mb-4 ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          In biểu mẫu
        </button>
        <div id="printable-area">
          <PrintableSupportForm data={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Giấy Yêu Cầu Hỗ Trợ Từ Khách Hàng</h1>
      <div className="grid grid-cols-2 gap-4">
        <input name="number" placeholder="Số" onChange={handleChange} className="border p-2 rounded" />
        <input name="companyName" placeholder="Kính gửi Công Ty" onChange={handleChange} className="border p-2 rounded" />
        <input name="customerName" placeholder="Tên tôi là" onChange={handleChange} className="border p-2 rounded col-span-2" />
        <input name="address" placeholder="Địa chỉ" onChange={handleChange} className="border p-2 rounded col-span-2" />
        <input name="idCard" placeholder="Số CMND/CCCD/ Hộ chiếu" onChange={handleChange} className="border p-2 rounded col-span-2" />
        <input name="supportRequest" placeholder="Đề nghị Quý Công ty hỗ trợ" onChange={handleChange} className="border p-2 rounded col-span-2" />
        <input name="serviceType" placeholder="Loại dịch vụ" onChange={handleChange} className="border p-2 rounded" />
        <input name="receptionChannel" placeholder="Kênh Tiếp Nhận từ" onChange={handleChange} className="border p-2 rounded" />
        <textarea name="content" placeholder="Nội dung" onChange={handleChange} className="border p-2 rounded col-span-2" rows={4} />
        <input name="date" placeholder="Ngày" onChange={handleChange} className="border p-2 rounded" />
        <input name="requesterName" placeholder="Người yêu cầu (Họ tên)" onChange={handleChange} className="border p-2 rounded" />
      </div>
      <button
        onClick={() => setIsPreview(true)}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
      >
        Xem trước & In
      </button>
    </div>
  );
};
