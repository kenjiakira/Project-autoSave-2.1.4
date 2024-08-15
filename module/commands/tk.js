const fs = require('fs-extra');
const path = require('path');

const dataFilePath = path.resolve(__dirname, 'json', 'khaosat.json');
const surveyQuestions = [
  "Bạn có thường xuyên sử dụng bot không?\n1. Có\n2. Không",
  "Bạn thấy bot có dễ sử dụng không? \n1. Rất dễ \n2. Dễ \n3. Bình thường \n4. Khó \n5. Rất khó",
  "Bạn có hài lòng với tốc độ phản hồi của bot không? \n1. Rất hài lòng \n2. Hài lòng \n3. Bình thường \n4. Không hài lòng \n5. Rất không hài lòng",
  "Bạn có gặp vấn đề gì khi sử dụng bot không? \n1. Có \n2. Không",
  "Bạn muốn thêm tính năng gì cho bot? \n1. Chat tự động \n2. Game mới \n3. Tiện ích mới \n4. Khác",
  "Bạn có thấy thông tin trong bot rõ ràng không? \n1. Rõ ràng \n2. Bình thường \n3. Không rõ ràng",
  "Bạn có khuyến nghị bot này cho người khác không? \n1. Có \n2. Không",
  "Bạn nghĩ mức độ thân thiện của bot như thế nào? \n1. Rất thân thiện \n2. Thân thiện \n3. Bình thường \n4. Không thân thiện \n5. Rất không thân thiện",
  "Bạn có thích giao diện và thiết kế của bot không? \n1. Có \n2. Bình thường \n3. Không",
  "Bạn có hài lòng với sự hỗ trợ của đội ngũ phát triển bot không? \n1. Rất hài lòng \n2. Hài lòng \n3. Bình thường \n4. Không hài lòng \n5. Rất không hài lòng"
];

module.exports.config = {
  name: "tk",
  version: "1.0.0",
  hasPermission: 2,
  credits: "HNT",
  description: "Thống kê kết quả khảo sát với kết quả chi tiết",
  commandCategory: "utilities",
  usePrefix: true,
  usages: "thongkekhaosat - Thống kê kết quả khảo sát chi tiết",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;

  try {
    const data = await fs.readJson(dataFilePath, { default: {} });

    // Initialize counters
    const questionStats = surveyQuestions.map(() => ({
      count: Array(5).fill(0),
      total: 0
    }));

    // Count answers
    Object.values(data).forEach(answers => {
      answers.forEach((answer, index) => {
        if (answer) {
          questionStats[index].count[parseInt(answer) - 1]++;
          questionStats[index].total++;
        }
      });
    });

    // Format result
    let resultMessage = "===📊 THỐNG KÊ KẾT QUẢ KHẢO SÁT ===\n\n";
    surveyQuestions.forEach((question, index) => {
      resultMessage += `${index + 1}. ${question}\n`;
      const stats = questionStats[index];
      stats.count.forEach((count, i) => {
        if (count > 0) { // Chỉ hiển thị các câu trả lời có số lượng lớn hơn 0
          const percentage = stats.total ? ((count / stats.total) * 100).toFixed(2) : 0;
          resultMessage += `  ${i + 1}: ${count} phản hồi (${percentage}%)\n`;
        }
      });
      resultMessage += "\n";
    });

    api.sendMessage(resultMessage || "Không có dữ liệu để thống kê.", threadID, messageID);
  } catch (error) {
    console.error("Lỗi khi thống kê kết quả khảo sát:", error);
    api.sendMessage("Đã xảy ra lỗi khi thống kê kết quả khảo sát.", threadID, messageID);
  }
};
