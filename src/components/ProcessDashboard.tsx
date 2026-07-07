import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  GitBranch,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Settings,
  History,
  Printer,
  Award,
  Download,
  Plus,
} from "lucide-react";
import WorkflowBuilder from "./WorkflowBuilder";
import ProcessGeneralInfo from "./ProcessGeneralInfo";
import ProcessChangelog from "./ProcessChangelog";
import PublishDocument from "./PublishDocument";
import ReferenceDocuments from "./ReferenceDocuments";
import FormManager from "./FormManager";
import { Process, DynamicForm, ChangelogItem, ProcessStatus } from "../types";

// ISO 9001 Predefined Templates
const ISO_TEMPLATES = [
  {
    id: "tuyendung",
    name: "Quy trình Tuyển dụng Nhân sự chuẩn ISO 9001",
    code: "QT-NS-01-ISO",
    department: "Phòng Nhân sự",
    level: 2 as const,
    description: "Quy trình kiểm soát hoạt động tuyển dụng chuẩn hóa, đáp ứng yêu cầu năng lực nhân sự nghiêm ngặt theo Tiêu chuẩn ISO 9001:2015 - Điều khoản 7.2.",
    purpose: "Đảm bảo tuyển dụng đúng người, đúng năng lực, đúng tiến độ và lưu trữ hồ sơ theo chuẩn chất lượng ISO.",
    purposeList: [
      "Đảm bảo mọi vị trí công việc đều được tuyển dụng đúng người, đúng năng lực và đáp ứng tiến độ.",
      "Chuẩn hóa trình tự, thủ tục tuyển dụng từ khi phát sinh nhu cầu đến khi ứng viên nhận việc.",
      "Lưu trữ hồ sơ chứng minh năng lực đáp ứng của nhân sự theo tiêu chuẩn ISO 9001."
    ],
    scopeAppliesTo: "Toàn bộ các phòng ban, đơn vị trực thuộc công ty.",
    termList: [
      { term: "ISO 9001:2015", explanation: "Tiêu chuẩn Hệ thống quản lý chất lượng Quốc tế" },
      { term: "JD", explanation: "Job Description - Bản mô tả công việc" },
      { term: "YCTD", explanation: "Yêu cầu tuyển dụng nhân sự" }
    ],
    referencesList: [
      { name: "Tiêu chuẩn ISO 9001:2015 - Điều khoản 7.2 Năng lực", code: "ISO 9001:2015" }
    ],
    nodes: [
      { id: "node-start", type: "start" as const, label: "Bắt đầu yêu cầu tuyển dụng", code: "START", assigneeDept: "Phòng ban yêu cầu", assigneeRole: "Trưởng bộ phận", assigneePerson: "Trưởng bộ phận", slaInMinutes: 0, description: "Phát sinh nhu cầu bổ sung nhân sự", objective: "Yêu cầu được kích hoạt", checklist: [], formId: null, x: 50, y: 150 },
      { id: "node-1", type: "task" as const, label: "Lập phiếu yêu cầu tuyển dụng & JD", code: "B1", assigneeDept: "Phòng ban yêu cầu", assigneeRole: "Trưởng bộ phận", assigneePerson: "Trưởng bộ phận", sla: "2 ngày", slaInMinutes: 2880, description: "Thiết lập phiếu yêu cầu tuyển dụng chi tiết kèm theo Bản mô tả công việc (JD) cho vị trí cần tuyển.", objective: "Hoàn thiện hồ sơ đề xuất tuyển dụng", checklist: ["Xác định định biên nhân sự", "Viết bản mô tả công việc (JD)", "Trình duyệt trực tuyến"], formId: "form-01", x: 220, y: 150 },
      { id: "node-2", type: "approval" as const, label: "Phê duyệt yêu cầu tuyển dụng", code: "B2", assigneeDept: "Ban Điều Hành", assigneeRole: "Giám đốc Điều hành", assigneePerson: "CEO", sla: "1 ngày", slaInMinutes: 1440, description: "Ban điều hành xem xét nhu cầu nhân sự, kế hoạch ngân sách và phê duyệt đề xuất tuyển dụng.", objective: "Đưa ra quyết định phê duyệt chính thức", checklist: ["Kiểm tra ngân sách phòng ban", "Đánh giá sự cấp thiết vị trí"], formId: null, x: 400, y: 150 },
      { id: "node-decision", type: "decision" as const, label: "Duyệt hay không duyệt?", code: "DEC-1", assigneeDept: "Ban Điều Hành", assigneeRole: "CEO", assigneePerson: "CEO", slaInMinutes: 0, description: "Quyết định duyệt hay từ chối tuyển dụng.", objective: "Nhánh rẽ phê duyệt", checklist: [], formId: null, x: 580, y: 150 },
      { id: "node-reject", type: "task" as const, label: "Thông báo từ chối tuyển dụng", code: "REJECT", assigneeDept: "Phòng Nhân sự", assigneeRole: "Chuyên viên Tuyển dụng", assigneePerson: "Recruiter", sla: "1 ngày", slaInMinutes: 1440, description: "Gửi phản hồi từ chối phê duyệt về cho bộ phận yêu cầu kèm lý do để điều chỉnh hoặc hoãn kế hoạch.", objective: "Thông báo phản hồi kết quả", checklist: [], formId: null, x: 580, y: 300 },
      { id: "node-3", type: "task" as const, label: "Đăng tuyển & Lọc hồ sơ ứng viên", code: "B3", assigneeDept: "Phòng Nhân sự", assigneeRole: "Chuyên viên Tuyển dụng", assigneePerson: "Recruiter", sla: "5 ngày", slaInMinutes: 7200, description: "Thực hiện truyền thông tuyển dụng trên các kênh, tiếp nhận hồ sơ và sàng lọc ứng viên phù hợp với JD.", objective: "Thu hút danh sách ứng viên tiềm năng", checklist: ["Đăng tin tuyển dụng đa kênh", "Sàng lọc CV theo tiêu chí", "Gửi bài test chuyên môn"], formId: null, x: 760, y: 150 },
      { id: "node-4", type: "task" as const, label: "Tổ chức phỏng vấn & Đánh giá", code: "B4", assigneeDept: "Phòng Nhân sự", assigneeRole: "Hội đồng Tuyển dụng", assigneePerson: "Hội đồng tuyển dụng", sla: "3 ngày", slaInMinutes: 4320, description: "Thực hiện phỏng vấn chuyên môn và đánh giá thái độ, kỹ năng mềm của ứng viên. Ghi chép kết quả phỏng vấn.", objective: "Chọn được ứng viên tối ưu nhất", checklist: ["Lên lịch hẹn phỏng vấn", "Chuẩn bị bộ câu hỏi đánh giá", "Hội đồng đánh giá sau phỏng vấn"], formId: null, x: 940, y: 150 },
      { id: "node-5", type: "task" as const, label: "Gửi thư mời nhận việc (Offer Letter)", code: "B5", assigneeDept: "Phòng Nhân sự", assigneeRole: "Chuyên viên Tuyển dụng", assigneePerson: "Recruiter", sla: "2 ngày", slaInMinutes: 2880, description: "Thỏa thuận chế độ lương thưởng, thời gian thử việc và gửi Offer Letter chính thức cho ứng viên đạt yêu cầu.", objective: "Ứng viên xác nhận đồng ý nhận việc", checklist: ["Đàm phán đãi ngộ trực tiếp", "Gửi Offer Letter điện tử", "Xác nhận ngày bắt đầu đi làm"], formId: null, x: 1120, y: 150 },
      { id: "node-end", type: "end" as const, label: "Tiếp nhận nhân sự & Thử việc", code: "END", assigneeDept: "Phòng Nhân sự", assigneeRole: "Hướng dẫn viên hội nhập", assigneePerson: "HR Admin", slaInMinutes: 0, description: "Tiếp nhận ứng viên vào ngày đầu tiên, tổ chức chương trình đào tạo hội nhập chuẩn ISO.", objective: "Nhân sự bắt đầu thử việc thành công", checklist: [], formId: null, x: 1300, y: 150 }
    ],
    edges: [
      { id: "e1", source: "node-start", target: "node-1" },
      { id: "e2", source: "node-1", target: "node-2" },
      { id: "e3", source: "node-2", target: "node-decision" },
      { id: "e4", source: "node-decision", target: "node-3", label: "Đồng ý" },
      { id: "e5", source: "node-decision", target: "node-reject", label: "Từ chối" },
      { id: "e6", source: "node-3", target: "node-4" },
      { id: "e7", source: "node-4", target: "node-5" },
      { id: "e8", source: "node-5", target: "node-end" }
    ]
  },
  {
    id: "muahang",
    name: "Quy trình Mua hàng & Kiểm soát Nhà cung ứng chuẩn ISO 9001",
    code: "QT-MH-02-ISO",
    department: "Phòng Mua hàng",
    level: 2 as const,
    description: "Quy trình kiểm soát hoạt động mua sắm vật tư đầu vào và đánh giá chất lượng nhà cung ứng theo Tiêu chuẩn ISO 9001:2015 - Điều khoản 8.4.",
    purpose: "Kiểm soát chặt chẽ hoạt động mua sắm hàng hóa, dịch vụ và đánh giá năng lực nhà cung cấp nhằm tối ưu hóa chi phí và chất lượng vật tư đầu vào.",
    purposeList: [
      "Đảm bảo vật tư, dịch vụ mua ngoài đáp ứng đầy đủ yêu cầu kỹ thuật và chất lượng.",
      "Chuẩn hóa thủ tục lựa chọn, phê duyệt nhà cung cấp dịch vụ/vật tư có năng lực tốt nhất.",
      "Kiểm soát chi phí mua hàng và thời gian đáp ứng tối ưu."
    ],
    scopeAppliesTo: "Áp dụng cho mọi hoạt động mua sắm vật tư, nguyên liệu, tài sản cố định trong công ty.",
    termList: [
      { term: "PO", explanation: "Purchase Order - Đơn đặt hàng" },
      { term: "PR", explanation: "Purchase Request - Yêu cầu mua hàng" },
      { term: "NCC", explanation: "Nhà cung cấp vật tư/dịch vụ" }
    ],
    referencesList: [
      { name: "Tiêu chuẩn ISO 9001:2015 - Khoản 8.4 Kiểm soát sản phẩm/dịch vụ do bên ngoài cung cấp", code: "ISO 9001:2015" }
    ],
    nodes: [
      { id: "node-start", type: "start" as const, label: "Phát sinh nhu cầu mua sắm", code: "START", assigneeDept: "Bộ phận đề xuất", assigneeRole: "Nhân viên đề xuất", assigneePerson: "User", slaInMinutes: 0, description: "Nhu cầu mua sắm vật tư hoặc trang thiết bị được phát sinh", objective: "Yêu cầu kích hoạt", checklist: [], formId: null, x: 50, y: 150 },
      { id: "node-1", type: "task" as const, label: "Lập phiếu yêu cầu mua sắm (PR)", code: "B1", assigneeDept: "Bộ phận đề xuất", assigneeRole: "Nhân viên đề xuất", assigneePerson: "User", sla: "1 ngày", slaInMinutes: 1440, description: "Xác định rõ loại vật tư, quy cách kỹ thuật, số lượng và thời gian cần thiết. Tạo phiếu PR.", objective: "Hoàn tất phiếu PR chuẩn", checklist: ["Xác định quy cách kỹ thuật", "Ước lượng ngân sách mua sắm"], formId: "form-02", x: 220, y: 150 },
      { id: "node-2", type: "task" as const, label: "Tìm kiếm & Khảo sát báo giá NCC", code: "B2", assigneeDept: "Phòng Mua hàng", assigneeRole: "Chuyên viên Mua hàng", assigneePerson: "Buyer", sla: "3 ngày", slaInMinutes: 4320, description: "Liên hệ tối thiểu 3 nhà cung cấp để nhận báo giá cạnh tranh. Đối chiếu năng lực nhà cung cấp theo tiêu chí ISO.", objective: "Bảng so sánh báo giá NCC", checklist: ["Liên hệ NCC lấy thông tin", "Thu thập tối thiểu 3 báo giá", "Đánh giá sơ bộ năng lực NCC"], formId: null, x: 390, y: 150 },
      { id: "node-3", type: "approval" as const, label: "Duyệt báo giá & Chọn Nhà cung cấp", code: "B3", assigneeDept: "Phòng Tài Chính", assigneeRole: "Trưởng phòng Tài chính", assigneePerson: "CFO", sla: "1 ngày", slaInMinutes: 1440, description: "Xem xét so sánh giá, điều khoản thanh toán, và duyệt lựa chọn nhà cung cấp tối ưu nhất.", objective: "Nhà cung cấp được phê duyệt chính thức", checklist: ["Kiểm tra hạn mức ngân sách", "Đàm phán chính sách chiết khấu"], formId: null, x: 560, y: 150 },
      { id: "node-4", type: "task" as const, label: "Lập Đơn đặt hàng (PO) & Hợp đồng", code: "B4", assigneeDept: "Phòng Mua hàng", assigneeRole: "Trưởng phòng Mua hàng", assigneePerson: "Procurement Manager", sla: "1 ngày", slaInMinutes: 1440, description: "Tạo đơn PO chính thức và tiến hành ký kết hợp đồng mua bán với nhà cung cấp được duyệt.", objective: "Hợp đồng hoặc Đơn PO được ký kết", checklist: ["Soạn thảo hợp đồng mua sắm", "Trình ký phê duyệt PO"], formId: null, x: 730, y: 150 },
      { id: "node-5", type: "task" as const, label: "Nhận hàng & Kiểm tra chất lượng (KCS)", code: "B5", assigneeDept: "Phòng Kho / Bộ phận QA-QC", assigneeRole: "Thủ kho & Nhân viên KCS", assigneePerson: "Warehouse Keeper", sla: "2 ngày", slaInMinutes: 2880, description: "Nhận vật tư, đối chiếu số lượng, thông số kỹ thuật. Tiến hành kiểm tra chất lượng sản phẩm đầu vào.", objective: "Biên bản kiểm nghiệm hàng hóa", checklist: ["Đếm số lượng thực tế", "Kiểm tra quy cách đóng gói", "Lập phiếu KCS đạt/không đạt"], formId: null, x: 900, y: 150 },
      { id: "node-decision", type: "decision" as const, label: "Vật tư đạt chất lượng?", code: "DEC-1", assigneeDept: "Bộ phận QA-QC", assigneeRole: "Nhân viên KCS", assigneePerson: "QC Auditor", slaInMinutes: 0, description: "Kiểm tra sự phù hợp của sản phẩm so với đơn PO và cam kết.", objective: "Xác nhận tính đạt chuẩn", checklist: [], formId: null, x: 1070, y: 150 },
      { id: "node-fail", type: "task" as const, label: "Yêu cầu đổi trả / Đền bù", code: "FAIL", assigneeDept: "Phòng Mua hàng", assigneeRole: "Chuyên viên Mua hàng", assigneePerson: "Buyer", sla: "1 ngày", slaInMinutes: 1440, description: "Lập biên bản hàng không đạt, gửi phản hồi yêu cầu nhà cung cấp đổi trả sản phẩm đạt chuẩn hoặc hoàn tiền.", objective: "Khiếu nại nhà cung cấp thành công", checklist: ["Chụp ảnh lỗi vật tư", "Gửi văn bản khiếu nại NCC"], formId: null, x: 1070, y: 300 },
      { id: "node-pass", type: "task" as const, label: "Nhập kho & Chuyển hồ sơ thanh toán", code: "PASS", assigneeDept: "Phòng Kế toán", assigneeRole: "Kế toán thanh toán", assigneePerson: "Accountant", sla: "1 ngày", slaInMinutes: 1440, description: "Tiến hành nhập kho vật tư đạt chuẩn. Chuyển bộ chứng từ hoàn chỉnh sang phòng Kế toán để làm thủ tục thanh toán.", objective: "Nhập kho vật tư hoàn tất", checklist: ["Nhập số liệu vào phần mềm ERP", "Ký nhận phiếu nhập kho"], formId: null, x: 1240, y: 150 },
      { id: "node-end", type: "end" as const, label: "Hoàn tất thanh toán & Lưu hồ sơ", code: "END", assigneeDept: "Phòng Kế toán", assigneeRole: "Kế toán trưởng", assigneePerson: "Chief Accountant", slaInMinutes: 0, description: "Thực hiện thanh toán theo điều khoản hợp đồng và lưu trữ hồ sơ theo chuẩn ISO.", objective: "Quy trình kết thúc trọn vẹn", checklist: [], formId: null, x: 1410, y: 150 }
    ],
    edges: [
      { id: "e1", source: "node-start", target: "node-1" },
      { id: "e2", source: "node-1", target: "node-2" },
      { id: "e3", source: "node-2", target: "node-3" },
      { id: "e4", source: "node-3", target: "node-4" },
      { id: "e5", source: "node-4", target: "node-5" },
      { id: "e6", source: "node-5", target: "node-decision" },
      { id: "e7", source: "node-decision", target: "node-pass", label: "Đạt" },
      { id: "e8", source: "node-decision", target: "node-fail", label: "Không đạt" },
      { id: "e9", source: "node-pass", target: "node-end" }
    ]
  },
  {
    id: "tailieu",
    name: "Quy trình Kiểm soát Tài liệu & Thông tin dạng văn bản chuẩn ISO 9001",
    code: "QT-TL-03-ISO",
    department: "QA/QC",
    level: 2 as const,
    description: "Quy trình kiểm soát thông tin dạng văn bản nhằm đảm bảo các tài liệu, biểu mẫu, quy trình nội bộ được phê duyệt và phân phối đúng quy định.",
    purpose: "Quy định trình tự và nguyên tắc quản lý hệ thống tài liệu, đảm bảo thông tin chính xác, kịp thời và có kiểm soát trong hệ thống chất lượng nội bộ.",
    purposeList: [
      "Quy định thống nhất các bước từ soạn thảo, xem xét, phê duyệt đến ban hành tài liệu nội bộ.",
      "Ngăn ngừa việc sử dụng tài liệu đã hết hiệu lực hoặc tài liệu không chính thức trong công ty.",
      "Kiểm soát việc phân phối, sửa đổi và lưu trữ các hồ sơ chất lượng."
    ],
    scopeAppliesTo: "Áp dụng cho mọi tài liệu thuộc Hệ thống quản lý chất lượng ISO 9001 của công ty.",
    termList: [
      { term: "MR", explanation: "Management Representative - Đại diện lãnh đạo về chất lượng" },
      { term: "HTQLCL", explanation: "Hệ thống quản lý chất lượng" },
      { term: "Tài liệu lỗi thời", explanation: "Tài liệu đã hết hiệu lực do có phiên bản mới thay thế" }
    ],
    referencesList: [
      { name: "Tiêu chuẩn ISO 9001:2015 - Khoản 7.5 Thông tin dạng văn bản", code: "ISO 9001:2015" }
    ],
    nodes: [
      { id: "node-start", type: "start" as const, label: "Yêu cầu soạn thảo / Sửa đổi tài liệu", code: "START", assigneeDept: "Bộ phận đề xuất", assigneeRole: "Trưởng bộ phận", assigneePerson: "User", slaInMinutes: 0, description: "Phát sinh nhu cầu xây dựng tài liệu mới hoặc chỉnh sửa tài liệu hiện hành", objective: "Yêu cầu ban hành được kích hoạt", checklist: [], formId: null, x: 50, y: 150 },
      { id: "node-1", type: "task" as const, label: "Soạn thảo / Sửa đổi dự thảo tài liệu", code: "B1", assigneeDept: "Phòng QA/QC", assigneeRole: "Kiểm soát viên chất lượng", assigneePerson: "QA Specialist", sla: "3 ngày", slaInMinutes: 4320, description: "Viết mới hoặc cập nhật nội dung quy trình/tài liệu dựa trên biểu mẫu tiêu chuẩn ISO.", objective: "Bản thảo quy trình hoàn tất thô", checklist: ["Thu thập tài liệu liên quan", "Soạn thảo dự thảo lần 1", "Sắp xếp mã danh mục"], formId: null, x: 220, y: 150 },
      { id: "node-2", type: "task" as const, label: "Thẩm định & Xem xét nội dung", code: "B2", assigneeDept: "Phòng QA/QC", assigneeRole: "Trưởng bộ phận QA/QC", assigneePerson: "QA Manager", sla: "2 ngày", slaInMinutes: 2880, description: "Kiểm tra tính pháp lý, tính đồng bộ với các quy trình hiện hành khác của công ty.", objective: "Bản dự thảo đã qua thẩm định", checklist: ["So sánh quy trình chồng chéo", "Kiểm tra lỗi kỹ thuật soạn thảo", "Đánh giá tính khả thi thực tế"], formId: null, x: 390, y: 150 },
      { id: "node-3", type: "approval" as const, label: "Phê duyệt ban hành", code: "B3", assigneeDept: "Ban Điều Hành", assigneeRole: "Giám đốc Điều hành", assigneePerson: "CEO", sla: "1 ngày", slaInMinutes: 1440, description: "Ký phê duyệt quyết định ban hành tài liệu mới hoặc bản sửa đổi chính thức.", objective: "Quyết định phê duyệt ban hành chính thức", checklist: ["Đọc lướt nội dung cốt lõi", "Ký duyệt số ban hành"], formId: null, x: 560, y: 150 },
      { id: "node-decision", type: "decision" as const, label: "Duyệt ban hành?", code: "DEC-1", assigneeDept: "Ban Điều Hành", assigneeRole: "CEO", assigneePerson: "CEO", slaInMinutes: 0, description: "Đánh giá phê duyệt cuối cùng từ CEO.", objective: "Xác nhận duyệt hoặc điều chỉnh", checklist: [], formId: null, x: 730, y: 150 },
      { id: "node-adjust", type: "task" as const, label: "Chỉnh sửa hoàn thiện dự thảo", code: "ADJUST", assigneeDept: "Phòng QA/QC", assigneeRole: "Nhân viên soạn thảo", assigneePerson: "QA Specialist", sla: "1 ngày", slaInMinutes: 1440, description: "Bộ phận soạn thảo chỉnh sửa lại nội dung theo ý kiến đóng góp của lãnh đạo.", objective: "Bản dự thảo cập nhật hoàn chỉnh", checklist: ["Chỉnh sửa nội dung theo yêu cầu", "Lập báo cáo tiếp thu giải trình"], formId: null, x: 730, y: 300 },
      { id: "node-4", type: "task" as const, label: "Cấp mã & Đóng dấu lưu hành", code: "B4", assigneeDept: "Phòng QA/QC", assigneeRole: "Document Controller (DC)", assigneePerson: "Doc Controller", sla: "1 ngày", slaInMinutes: 1440, description: "Đóng dấu 'BẢN GỐC' hoặc 'TÀI LIỆU KIỂM SOÁT'. Cấp mã số quy trình mới theo sơ đồ quản lý.", objective: "Tài liệu lưu hành đóng dấu mã số chuẩn", checklist: ["Cấp mã số duy nhất của quy trình", "Đóng dấu lưu hành kiểm soát", "Cập nhật vào danh mục tài liệu"], formId: null, x: 900, y: 150 },
      { id: "node-5", type: "task" as const, label: "Phân phối & Đào tạo thực hiện", code: "B5", assigneeDept: "Các Trưởng bộ phận", assigneeRole: "Trưởng bộ phận", assigneePerson: "Manager", sla: "3 ngày", slaInMinutes: 4320, description: "Gửi tài liệu bản mềm/bản cứng có kiểm soát đến các bộ phận liên quan và hướng dẫn đào tạo nhân sự áp dụng.", objective: "CBNV hiểu rõ và áp dụng chính xác", checklist: ["Gửi tài liệu điện tử đến bộ phận", "Lên lịch đào tạo hướng dẫn", "Đánh giá hiểu biết của nhân viên"], formId: null, x: 1070, y: 150 },
      { id: "node-end", type: "end" as const, label: "Thu hồi tài liệu cũ & Lưu trữ", code: "END", assigneeDept: "Phòng QA/QC", assigneeRole: "Document Controller", assigneePerson: "Doc Controller", slaInMinutes: 0, description: "Thu hồi tài liệu phiên bản cũ đã hết hiệu lực, lưu trữ dạng bản hủy để tránh nhầm lẫn.", objective: "Tài liệu cũ lỗi thời được kiểm soát thu hồi", checklist: [], formId: null, x: 1240, y: 150 }
    ],
    edges: [
      { id: "e1", source: "node-start", target: "node-1" },
      { id: "e2", source: "node-1", target: "node-2" },
      { id: "e3", source: "node-2", target: "node-3" },
      { id: "e4", source: "node-3", target: "node-decision" },
      { id: "e5", source: "node-decision", target: "node-4", label: "Đồng ý" },
      { id: "e6", source: "node-decision", target: "node-adjust", label: "Cần sửa" },
      { id: "e7", source: "node-4", target: "node-5" },
      { id: "e8", source: "node-5", target: "node-end" }
    ]
  }
];

interface ProcessDashboardProps {
  processes: Process[];
  process: Process | undefined;
  forms: DynamicForm[];
  onSaveProcess: (updatedProcess: Process) => void;
  onUpdateProcessStatus: (
    id: string,
    newStatus: Process["status"],
    reviewComments?: string,
    updatedChangelog?: ChangelogItem[],
  ) => void;
  onSaveForms: (updatedForms: DynamicForm[]) => void;
  currentUserRole: string;
  companyName?: string;
  departments: string[];
  onCreateProcess?: (newProc: Process) => void;
  onSelectProcess?: (id: string, tab: string) => void;
}

export default function ProcessDashboard({
  processes,
  process,
  forms,
  onSaveProcess,
  onUpdateProcessStatus,
  onSaveForms,
  currentUserRole,
  companyName = "CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM",
  departments,
  onCreateProcess,
  onSelectProcess,
}: ProcessDashboardProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [isISOModalOpen, setIsISOModalOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleImportTemplate = (tmpl: typeof ISO_TEMPLATES[0]) => {
    const newProcessId = `iso-${tmpl.id}-${Date.now()}`;
    const newProcess: Process = {
      ...tmpl,
      id: newProcessId,
      version: "1.0",
      status: "draft" as ProcessStatus,
      completionRate: 100,
      publishDate: new Date().toISOString().split('T')[0],
      creator: "Hệ thống ISO",
      reviewer: "Đại diện Lãnh đạo",
      approver: "Giám đốc Điều hành",
      changelog: [
        {
          version: "1.0",
          date: new Date().toISOString().split('T')[0],
          author: "Hệ thống ISO",
          description: "Khởi tạo từ quy trình mẫu chuẩn ISO 9001:2015"
        }
      ]
    };

    if (onCreateProcess) {
      onCreateProcess(newProcess);
    }
    
    setIsISOModalOpen(false);
    
    if (onSelectProcess) {
      onSelectProcess(newProcessId, 'process-dashboard');
    }
  };

  const renderISODialog = () => {
    return (
      // @ts-ignore
      <Dialog
        open={isISOModalOpen}
        onClose={() => setIsISOModalOpen(false)}
        maxWidth="lg"
        fullWidth
        // @ts-ignore
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          }
        }}
        id="iso-templates-dialog"
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Award className="w-6 h-6 text-amber-500 shrink-0" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>NHẬP MẪU QUY TRÌNH CHUẨN ISO 9001:2015</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
              Hệ thống cung cấp các mẫu quy trình đạt chuẩn ISO 9001:2015 đã được thiết lập sẵn đầy đủ các bước (nodes), sơ đồ trực quan, mục đích, phạm vi, trách nhiệm và biểu mẫu đi kèm.
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {ISO_TEMPLATES.map((tmpl) => (
              // @ts-ignore
              <Grid item xs={12} md={4} key={tmpl.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: 'warning.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
                    }
                  }}
                  id={`card-iso-tmpl-${tmpl.id}`}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={tmpl.code} 
                        color="warning" 
                        variant="outlined"
                        size="small" 
                        sx={{ fontWeight: 700, borderRadius: 1.5 }} 
                      />
                      <Chip 
                        label={`Cấp độ ${tmpl.level}`} 
                        color="primary" 
                        variant="outlined" 
                        size="small" 
                        sx={{ fontWeight: 600, borderRadius: 1.5 }} 
                      />
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.4, minHeight: 48, color: 'text.primary' }}>
                      {tmpl.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flexGrow: 1, fontSize: '0.8rem', lineHeight: 1.6 }}>
                      {tmpl.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Bộ phận chủ quản:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{tmpl.department}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Số bước quy trình:</Typography>
                        <Chip label={`${tmpl.nodes.length} Nodes`} size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Phiên bản mặc định:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>1.0</Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<Download size={16} />}
                      onClick={() => handleImportTemplate(tmpl)}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 2,
                        mt: 'auto',
                        py: 1,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        }
                      }}
                      id={`btn-import-iso-${tmpl.id}`}
                    >
                      Nhập Mẫu Quy Trình
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setIsISOModalOpen(false)} 
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
            color="inherit"
            id="btn-close-iso-dialog"
          >
            Đóng Lại
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (!process) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }} id="process-dashboard-empty-state">
        {/* Render top action bar even if no process is selected */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="process-select-label-empty">Chọn Quy Trình Đang Quản Lý</InputLabel>
              <Select
                labelId="process-select-label-empty"
                value=""
                label="Chọn Quy Trình Đang Quản Lý"
                onChange={(e) => onSelectProcess?.(e.target.value as string, 'process-dashboard')}
                sx={{ fontWeight: 600, fontSize: "0.85rem" }}
              >
                {processes.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {p.code} - {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <Button
              variant="contained"
              color="warning"
              startIcon={<Award size={18} />}
              onClick={() => setIsISOModalOpen(true)}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.85rem",
                borderRadius: 2,
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                }
              }}
              id="btn-trigger-iso-empty"
            >
              Nhập Mẫu Quy Trình Chuẩn ISO 9001
            </Button>
          </Box>
        </Paper>

        <Box sx={{ p: 8, textAlign: "center", color: "text.secondary", bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Award size={48} className="mx-auto text-amber-500 mb-3" />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>Chưa chọn quy trình nghiệp vụ</Typography>
          <Typography variant="body2" sx={{ maxWidth: 450, mx: "auto", mb: 3 }}>
            Vui lòng chọn một quy trình từ danh sách bên trên để bắt đầu chỉnh sửa thiết kế, hoặc nhập nhanh một quy trình mẫu chuẩn ISO 9001:2015 đã được thiết lập sẵn.
          </Typography>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Award size={16} />}
            onClick={() => setIsISOModalOpen(true)}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2 }}
            id="btn-secondary-iso-empty"
          >
            Nhập Mẫu Quy Trình Chuẩn ISO 9001
          </Button>
        </Box>

        {renderISODialog()}
      </Box>
    );
  }

  const statusColors = {
    draft: { color: "primary", label: "Bản Nháp" },
    pending: { color: "warning", label: "Chờ Phê Duyệt" },
    active: { color: "success", label: "Đang Hiệu Lực" },
    expired: { color: "default", label: "Hết Hiệu Lực" },
  };

  const statusInfo = statusColors[process.status] || statusColors.draft;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}
      id="process-dashboard-active"
    >
      {/* Top Action Bar: Process Selection & ISO Template Import */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
        id="process-dashboard-action-bar"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="process-select-label-active">Chọn Quy Trình Đang Quản Lý</InputLabel>
            <Select
              labelId="process-select-label-active"
              value={process.id}
              label="Chọn Quy Trình Đang Quản Lý"
              onChange={(e) => onSelectProcess?.(e.target.value as string, 'process-dashboard')}
              sx={{ fontWeight: 600, fontSize: "0.85rem" }}
            >
              {processes.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  {p.code} - {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Award size={18} />}
            onClick={() => setIsISOModalOpen(true)}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.85rem",
              borderRadius: 2,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              }
            }}
            id="btn-trigger-iso-active"
          >
            Nhập Mẫu Quy Trình Chuẩn ISO 9001
          </Button>
        </Box>
      </Paper>

      {/* Header Process Info */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
        id="process-info-header"
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {process.name}
            </Typography>
            <Chip
              label={statusInfo.label}
              color={statusInfo.color as any}
              size="small"
              sx={{ fontWeight: 600 }}
              id="process-status-chip"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Mã: <strong>{process.code}</strong> • Phòng ban:{" "}
            <strong>{process.department}</strong> • Cập nhật lần cuối:{" "}
            <strong>{process.publishDate || "Chưa cập nhật"}</strong>
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Mức độ hoàn thiện
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.main" }}
            id="process-completion-rate"
          >
            {process.completionRate}%
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          overflow: "hidden",
        }}
        id="process-dashboard-tabs-container"
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 56,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9rem",
              },
            }}
            id="process-dashboard-tabs"
          >
            <Tab
              icon={<BookOpen size={18} />}
              iconPosition="start"
              label="Thông Tin Chung"
              id="tab-general-info"
            />
            <Tab
              icon={<GitBranch size={18} />}
              iconPosition="start"
              label="Thiết Kế Lưu Đồ"
              id="tab-workflow-builder"
            />
            <Tab
              icon={<FileSpreadsheet size={18} />}
              iconPosition="start"
              label="Biểu Mẫu"
              id="tab-forms"
            />
            <Tab
              icon={<History size={18} />}
              iconPosition="start"
              label="Phiên Bản"
              id="tab-changelog"
            />
            <Tab
              icon={<Printer size={18} />}
              iconPosition="start"
              label="In & Ban Hành"
              id="tab-publish"
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, bgcolor: "#f8fafc" }}>
          {tabIndex === 0 && (
            <ProcessGeneralInfo
              processes={processes}
              process={process}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
              departments={departments}
            />
          )}
          {tabIndex === 1 && (
            <WorkflowBuilder
              process={process}
              forms={forms}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 2 && (
            <FormManager
              forms={forms}
              onSaveForms={onSaveForms}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 3 && (
            <ProcessChangelog
              process={process}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 4 && (
            <PublishDocument
              process={process}
              onUpdateProcessStatus={onUpdateProcessStatus}
              currentUserRole={currentUserRole}
              companyName={companyName}
            />
          )}
        </Box>
      </Paper>

      {renderISODialog()}
    </Box>
  );
}
