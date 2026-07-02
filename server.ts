import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not set or is using placeholder. AI features will fallback to offline mock generators.");
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI: Generate SOP content
app.post("/api/ai/generate-sop", async (req, res) => {
  const { stepCode, stepName, description, objective, department, role } = req.body;
  if (!stepName) {
    return res.status(400).json({ error: "stepName is required" });
  }

  try {
    const ai = getAi();
    const prompt = `Bạn là chuyên gia tư vấn ISO 9001 và tối ưu hóa quy trình doanh nghiệp.
Hãy viết một tài liệu SOP (Standard Operating Procedure) chi tiết, chuẩn chỉnh và chuyên nghiệp bằng Tiếng Việt cho bước quy trình sau:
- Mã bước: ${stepCode || "Chưa có"}
- Tên bước: ${stepName}
- Mô tả: ${description || "Không có mô tả chi tiết"}
- Mục tiêu: ${objective || "Tối ưu hóa hiệu suất làm việc"}
- Bộ phận thực hiện: ${department || "Toàn công ty"} - Chức danh: ${role || "Nhân viên phụ trách"}

Yêu cầu tài liệu SOP phải trả về cấu trúc JSON chính xác theo định dạng sau (chỉ trả về JSON, không kèm markdown \`\`\`json):
{
  "purpose": "Mục đích chi tiết của bước này",
  "scope": "Phạm vi áp dụng của bước này trong doanh nghiệp",
  "definitions": "Định nghĩa và thuật ngữ viết tắt liên quan",
  "responsibility": "Trách nhiệm của các bên liên quan (RACI)",
  "steps": "Quy trình thực hiện chi tiết theo từng bước nhỏ (liệt kê danh sách các bước)",
  "forms": "Các biểu mẫu và tài liệu liên quan cần sử dụng",
  "kpi": "Chỉ số đánh giá hiệu quả công việc (KPI) gợi ý",
  "sla": "Cam kết chất lượng dịch vụ (SLA) về thời gian và chất lượng gợi ý",
  "risks": "Các rủi ro có thể xảy ra trong quá trình thực hiện",
  "controls": "Biện pháp kiểm soát và khắc phục rủi ro tương ứng"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in generate-sop:", error);
    
    // Detailed error propagation with fallbacks
    const isMissingKey = error.message === "GEMINI_API_KEY_MISSING" || (error.status === 400 && error.message?.includes("API key"));
    
    return res.json({
      fallback: true,
      error: isMissingKey ? "Missing API Key" : error.message,
      purpose: `Đảm bảo thực hiện bước "${stepName}" đúng quy chuẩn và hạn chế sai sót.`,
      scope: `Áp dụng cho bộ phận ${department || "chuyên trách"} và các nhân sự liên quan trực tiếp.`,
      definitions: `${stepCode || "SOP"} - Quy trình thao tác chuẩn cho việc ${stepName}.`,
      responsibility: `Chức danh "${role || "Nhân sự phụ trách"}" chịu trách nhiệm chính thực hiện. Bộ phận quản lý giám sát.`,
      steps: [
        "Bước 1: Tiếp nhận thông tin yêu cầu và kiểm tra tính hợp lệ.",
        "Bước 2: Xử lý thông tin theo nghiệp vụ chuẩn.",
        "Bước 3: Ghi nhận kết quả vào hệ thống quản lý.",
        "Bước 4: Báo cáo cấp trên hoặc chuyển giao bước tiếp theo."
      ],
      forms: ["Biểu mẫu ghi nhận thông tin", "Phiếu đánh giá kết quả"],
      kpi: "Hoàn thành 100% đúng hạn, tỷ lệ lỗi dưới 2%",
      sla: "Thời gian xử lý tối đa 4 giờ làm việc",
      risks: "Thông tin đầu vào không đầy đủ hoặc sai lệch",
      controls: "Kiểm tra chéo và yêu cầu bổ sung thông tin trước khi thực hiện"
    });
  }
});

// AI: Suggest KPIs & SLAs & RACI & Optimization
app.post("/api/ai/optimize-process", async (req, res) => {
  const { processName, steps } = req.body;
  if (!processName) {
    return res.status(400).json({ error: "processName is required" });
  }

  try {
    const ai = getAi();
    const prompt = `Bạn là chuyên gia tư vấn cải tiến quy trình Lean Six Sigma.
Hãy phân tích quy trình "${processName}" gồm các bước sau:
${JSON.stringify(steps)}

Yêu cầu phân tích và đưa ra ý kiến chuyên gia bằng Tiếng Việt theo định dạng JSON cấu trúc sau (chỉ trả về JSON, không kèm markdown):
{
  "kpiSuggestions": "Các gợi ý chỉ số KPI tổng thể cho quy trình này",
  "slaSuggestions": "Đề xuất SLA về thời gian xử lý cho từng bước hoặc tổng thể",
  "duplicateDetections": "Phát hiện các bước trùng lặp, dư thừa hoặc thắt nút cổ chai (nếu có)",
  "optimizationProposals": "Các đề xuất tối ưu hóa quy trình, loại bỏ lãng phí để tăng hiệu suất",
  "raciMatrix": "Gợi ý ma trận RACI (Responsible, Accountable, Consulted, Informed) cho các bộ phận"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in optimize-process:", error);
    const isMissingKey = error.message === "GEMINI_API_KEY_MISSING";
    return res.json({
      fallback: true,
      error: isMissingKey ? "Missing API Key" : error.message,
      kpiSuggestions: "1. Thời gian chu kỳ trung bình hoàn thành quy trình.\n2. Tỷ lệ hoàn thành đúng SLA đạt > 95%.\n3. Chỉ số hài lòng của khách hàng nội bộ hoặc bên ngoài (CSAT) > 4.5/5.",
      slaSuggestions: "Đề xuất thời gian tối đa cho các bước phê duyệt là 2 giờ, các bước xử lý nghiệp vụ là 4-8 giờ.",
      duplicateDetections: "Cần lưu ý các bước Phê duyệt nhiều cấp có thể gây nghẽn cổ chai. Cần tích hợp tự động hóa phê duyệt dựa trên hạn mức.",
      optimizationProposals: "1. Số hóa toàn bộ biểu mẫu để tránh nhập liệu thủ công.\n2. Áp dụng hệ thống thông báo tự động (SMS, Email, Chatbot) ngay khi có task mới.",
      raciMatrix: "- Bước Soạn thảo: Nhân viên thực hiện (R), Quản lý bộ phận (A)\n- Bước Kiểm tra: Trưởng phòng chuyên môn (R, A)\n- Bước Phê duyệt: Ban giám đốc (A, I)"
    });
  }
});

// AI Search bar query router
app.post("/api/ai/search", async (req, res) => {
  const { query, availableProcesses } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const ai = getAi();
    const prompt = `Người dùng đang tìm kiếm quy trình hoặc SOP trong hệ thống doanh nghiệp với câu truy vấn sau: "${query}"
Danh sách quy trình hiện có trong hệ thống:
${JSON.stringify(availableProcesses)}

Hãy phân tích câu truy vấn bằng Tiếng Việt và trả về kết quả dưới dạng JSON (chỉ trả về JSON, không kèm markdown):
{
  "matchedProcessId": "ID của quy trình khớp nhất từ danh sách, hoặc null nếu không khớp rõ ràng",
  "explanation": "Lời giải thích ngắn gọn tại sao quy trình này phù hợp, hoặc hướng dẫn tìm kiếm cho người dùng",
  "aiSuggestions": "Gợi ý thêm về các bước hoặc SOP liên quan mà người dùng có thể quan tâm"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in search:", error);
    // Offline / fallback simple matching
    const qLower = query.toLowerCase();
    let matchedId = null;
    if (availableProcesses && Array.isArray(availableProcesses)) {
      const found = availableProcesses.find(p => 
        p.name.toLowerCase().includes(qLower) || 
        p.id.toLowerCase().includes(qLower) || 
        (p.description && p.description.toLowerCase().includes(qLower))
      );
      if (found) matchedId = found.id;
    }

    return res.json({
      fallback: true,
      matchedProcessId: matchedId,
      explanation: matchedId 
        ? `Tìm thấy quy trình phù hợp nhất dựa trên từ khóa tìm kiếm của bạn.`
        : `Không tìm thấy quy trình khớp chính xác. Tuy nhiên, bạn có thể tìm kiếm theo từ khóa liên quan như 'CSKH', 'Tiếp nhận', 'Nhân sự'.`,
      aiSuggestions: "Gợi ý bạn tìm các tài liệu SOP có liên kết hoặc các biểu mẫu tương tác liên quan."
    });
  }
});

// AI Semantic Search: Search for specific answers across processes
app.post("/api/ai/search-process", async (req, res) => {
  const { query, processes } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const ai = getAi();
    const prompt = `Bạn là Trợ lý AI Chuyên gia Vận hành chuẩn ISO 9001 của doanh nghiệp.
Hãy trả lời câu hỏi sau của nhân viên: "${query}"

Sử dụng thông tin chi tiết từ cơ sở dữ liệu các quy trình hiện tại trong công ty:
${JSON.stringify(processes)}

Yêu cầu trả lời bằng Tiếng Việt một cách chuyên nghiệp, chính xác, lịch sự, trích dẫn rõ mã quy trình (VD: QT-CSKH-001) hoặc mã bước nghiệp vụ nếu có. Trả về câu trả lời dưới dạng JSON có trường "answer" (chỉ trả về JSON, không kèm markdown):
{
  "answer": "Nội dung câu trả lời chi tiết kèm hướng dẫn thực hiện..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in search-process:", error);
    
    // Fallback smart response based on keywords
    const qLower = query.toLowerCase();
    let answer = `Tôi đã nhận được câu hỏi "${query}" từ bạn.\n\nDựa trên tài liệu quy chuẩn vận hành của công ty:\n`;
    
    if (qLower.includes("tuyển dụng") || qLower.includes("hr") || qLower.includes("nhân sự")) {
      answer += `• **Quy trình Tuyển dụng & Thử việc Nhân sự (QT-NS-03)** có tổng thời gian cam kết tối đa cho các khâu chính là **92 giờ** (Lập đề xuất: 24h, Lọc hồ sơ & Shortlist: 48h, Phê duyệt gửi Offer: 8h, Onboarding: 12h).\n• **Trưởng phòng chuyên môn** chịu trách nhiệm lập tờ trình đề xuất ban đầu (STEP-NS-01) kèm bản mô tả công việc (JD) chi tiết.`;
    } else if (qLower.includes("khiếu nại") || qLower.includes("cskh") || qLower.includes("bồi thường")) {
      answer += `• **Quy trình Tiếp nhận & Xử lý Khiếu nại Khách hàng (QT-CSKH-001)** quy định thời gian SLA tối đa cho khâu tiếp nhận thông tin là **15 phút** (STEP-CSKH-01). Mức bồi thường vượt quá **1.000.000 VND** phải được chuyển duyệt trực tiếp bởi Ban Giám Đốc.\n• Các biểu mẫu liên đới gồm **Phiếu Tiếp Nhận (form-01)**, **Biên Bản Xác Minh (form-02)** và **Phiếu Khảo Sát CSAT (form-03)**.`;
    } else if (qLower.includes("báo giá") || qLower.includes("ký kết") || qLower.includes("kinh doanh") || qLower.includes("sales")) {
      answer += `• **Quy trình Báo giá & Ký kết Hợp đồng (QT-KD-02)** yêu cầu phản hồi yêu cầu báo giá (RFQ) bước đầu trong tối đa **4 giờ**.\n• Việc đề xuất mức chiết khấu thương mại lớn hơn **5%** bắt buộc phải chuyển qua bước Phê duyệt bởi Giám đốc Sales (STEP-KD-03) để kiểm soát tài chính.`;
    } else {
      answer += `• Hệ thống đang vận hành các quy trình cốt lõi gồm: **QT-CSKH-001 (Dịch vụ Khách hàng)**, **QT-KD-02 (Kinh doanh)**, và **QT-NS-03 (Nhân sự)**.\n• SLA trung bình cho các tác vụ phê duyệt phê duyệt là **2-4 giờ**, các bước nghiệp vụ thực hiện là **8-24 giờ**.\n• Bạn có thể tra cứu chi tiết hơn tại tab "Bản Đồ Quy Trình" hoặc "Tài Liệu SOP".`;
    }

    return res.json({
      fallback: true,
      answer: answer
    });
  }
});

// AI Quiz Generator: Generate quiz questions for a process
app.post("/api/ai/generate-quiz", async (req, res) => {
  const { processName, department, steps } = req.body;
  if (!processName) {
    return res.status(400).json({ error: "processName is required" });
  }

  try {
    const ai = getAi();
    const prompt = `Bạn là Trưởng ban Khảo thí Đào tạo Nội bộ của doanh nghiệp.
Hãy biên soạn 3 câu hỏi trắc nghiệm kiểm tra độ hiểu biết (mỗi câu 4 phương án lựa chọn A, B, C, D) cho quy trình: "${processName}" thuộc bộ phận "${department}".
Các bước trong quy trình gồm:
${JSON.stringify(steps)}

Yêu cầu các câu hỏi phải kiểm tra thực tế:
- Ai chịu trách nhiệm làm bước nào?
- Thời gian SLA cam kết là bao nhiêu?
- Các rủi ro tiềm ẩn hoặc biểu mẫu là gì?

Trả về kết quả bằng Tiếng Việt dưới dạng JSON có cấu trúc sau (chỉ trả về JSON, không kèm markdown):
{
  "questions": [
    {
      "question": "Nội dung câu hỏi trắc nghiệm?",
      "options": [
        "Phương án A",
        "Phương án B",
        "Phương án C",
        "Phương án D"
      ],
      "correctAnswer": 0 // Chỉ số của câu trả lời đúng (0 cho A, 1 cho B, 2 cho C, 3 cho D)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in generate-quiz:", error);
    
    // Fallback quiz questions based on the input process name
    const pName = processName.toLowerCase();
    let questions = [];

    if (pName.includes("khiếu nại") || pName.includes("cskh")) {
      questions = [
        {
          question: "Trong Quy trình Tiếp nhận & Xử lý Khiếu nại (QT-CSKH-001), thời gian cam kết SLA tối đa cho Giao dịch viên hoàn tất tiếp nhận thông tin khách hàng là bao lâu?",
          options: [
            "10 phút",
            "15 phút",
            "30 phút",
            "1 giờ"
          ],
          correctAnswer: 1
        },
        {
          question: "Nếu đề xuất bồi thường thiệt hại cho khách hàng vượt quá hạn mức thông thường (trên 1.000.000 VND) thì ai có thẩm quyền ký duyệt ngân sách?",
          options: [
            "Giao dịch viên tiếp nhận",
            "Trưởng nhóm Call Center",
            "Trưởng phòng Chăm sóc khách hàng",
            "Giám đốc vận hành (COO) / CEO"
          ],
          correctAnswer: 3
        },
        {
          question: "Biện pháp phòng ngừa rủi ro chính được quy định tại bước liên hệ xin lỗi và bồi thường cho khách hàng là gì?",
          options: [
            "Gọi điện vào giờ hành chính",
            "Ủy quyền nâng mức thỏa thuận thêm tối đa 10% cho giao dịch viên kỳ cựu",
            "Gửi quà tặng bằng tiền mặt qua bưu điện",
            "Tự động khóa tài khoản khách hàng"
          ],
          correctAnswer: 1
        }
      ];
    } else if (pName.includes("tuyển dụng") || pName.includes("thử việc") || pName.includes("nhân sự")) {
      questions = [
        {
          question: "Ai có trách nhiệm lập Phiếu đề xuất tuyển dụng và đính kèm bản mô tả công việc (JD) ban đầu trong quy trình?",
          options: [
            "Chuyên viên nhân sự (Recruiter)",
            "Ứng viên dự tuyển",
            "Trưởng phòng chuyên môn phát sinh nhu cầu",
            "Giám đốc nhân sự"
          ],
          correctAnswer: 2
        },
        {
          question: "Đâu là biện pháp kiểm soát rủi ro được thiết lập để tránh trường hợp trưởng phòng đề xuất tuyển dụng tự phát vượt định biên?",
          options: [
            "Gặp mặt phê duyệt trực tiếp",
            "Hệ thống tự động khóa tính năng đề xuất nếu vượt quá định biên phòng ban được duyệt đầu năm",
            "Phạt tài chính phòng ban đề xuất",
            "Đăng tuyển thử nghiệm trên mạng xã hội trước"
          ],
          correctAnswer: 1
        },
        {
          question: "Thời gian cam kết (SLA) tối đa để Ban Giám Đốc phê duyệt kết quả phỏng vấn tuyển dụng chuyên môn và cho phép gửi thư mời nhận việc (Offer) là bao lâu?",
          options: [
            "4 giờ làm việc",
            "8 giờ làm việc",
            "24 giờ làm việc",
            "3 ngày"
          ],
          correctAnswer: 1
        }
      ];
    } else {
      questions = [
        {
          question: "Mục đích tối thượng của việc ban hành và rà soát quy trình chuẩn SOP theo tiêu chuẩn ISO 9001 là gì?",
          options: [
            "Để quảng bá thương hiệu ra thị trường",
            "Để tránh bị cơ quan nhà nước xử phạt",
            "Đảm bảo chất lượng vận hành đồng đều, giảm thiểu lãng phí và rủi ro lỗi thao tác con người",
            "Tăng giờ làm việc của nhân viên"
          ],
          correctAnswer: 2
        },
        {
          question: "Trong ma trận phân bổ trách nhiệm RACI, chữ cái 'A' (Accountable) đại diện cho vai trò nào sau đây?",
          options: [
            "Người trực tiếp thực hiện tác vụ",
            "Người chịu trách nhiệm giải trình cuối cùng và phê duyệt kết quả",
            "Người được tham vấn ý kiến chuyên môn",
            "Người chỉ được thông báo kết quả sau khi hoàn thành"
          ],
          correctAnswer: 1
        },
        {
          question: "Cam kết chất lượng dịch vụ SLA về thời gian xử lý nên được thiết lập dựa trên nguyên tắc nào?",
          options: [
            "Thiết lập thời gian càng ngắn càng tốt bất kể tính khả thi",
            "Thiết lập dựa trên thỏa thuận chủ quan của nhân viên",
            "Thiết lập thời gian tối đa hợp lý, có tính đến rủi ro thắt nút cổ chai và khả năng đáp ứng thực tế",
            "Không cần quy định thời gian tối đa"
          ],
          correctAnswer: 2
        }
      ];
    }

    return res.json({
      fallback: true,
      questions: questions
    });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Process Management Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
