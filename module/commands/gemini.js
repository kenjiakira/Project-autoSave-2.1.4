const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');

const API_KEY = "AIzaSyC8wE4cn_OKDgZdHp1VQ4FDDgiMeT9z914";
const conversationHistory = {};
const jsonFilePath = path.resolve(__dirname, 'json', 'gemini.json');

const readDataFromFile = async () => {
  try {
    if (await fs.pathExists(jsonFilePath)) {
      const data = await fs.readJson(jsonFilePath);
      Object.assign(conversationHistory, data);
    }
  } catch (error) {
    console.error("Lỗi khi đọc tệp JSON:", error);
  }
};

const saveDataToFile = async () => {
  try {
    await fs.writeJson(jsonFilePath, conversationHistory, { spaces: 2 });
  } catch (error) {
    console.error("Lỗi khi ghi tệp JSON:", error);
  }
};

readDataFromFile();

const cooldowns = {};

const COOLDOWN_TIME = 10000;
module.exports = {
  config: {
    name: "gemini",
    version: "1.0.0",
    hasPermission: 0,
    credits: "HNT",
    description: "Tạo văn bản và phân tích hình ảnh bằng Gemini",
    usePrefix: true,
    commandCategory: "general",
    usages: "[prompt] - Nhập một prompt để tạo nội dung văn bản và phân tích ảnh (nếu có).",
    cooldowns: 0,
    dependencies: {
      "@google/generative-ai": "",
      "fs-extra": "",
      "axios": ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;

    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("Vui lòng nhập một prompt.", threadID, messageID);
    }

    const now = Date.now();
    if (cooldowns[senderID] && now - cooldowns[senderID] < COOLDOWN_TIME) {
      const timeLeft = Math.ceil((COOLDOWN_TIME - (now - cooldowns[senderID])) / 1000);
      return api.sendMessage(`Bạn phải chờ thêm ${timeLeft} giây trước khi gửi lệnh tiếp theo.`, threadID, messageID);
    }

    cooldowns[senderID] = now;

    try {

      if (!Array.isArray(conversationHistory[senderID])) {
        conversationHistory[senderID] = [];
      }

      conversationHistory[senderID].push(`User: ${prompt}`);

      const context = conversationHistory[senderID].join("\n");
      const fullPrompt = `${context}\nTrả lời bằng tiếng Việt:`;

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      let imageParts = [];

      // Xử lý ảnh đính kèm (nếu có)
      if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
        const attachments = messageReply.attachments.filter(att => att.type === 'photo');

        for (const attachment of attachments) {
          const fileUrl = attachment.url;
          const tempFilePath = path.join(__dirname, 'cache', `temp_image_${Date.now()}.jpg`);

          const response = await axios({
            url: fileUrl,
            responseType: 'stream'
          });

          const writer = fs.createWriteStream(tempFilePath);
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          // Chuyển đổi hình ảnh thành dữ liệu nội tuyến
          const fileData = fs.readFileSync(tempFilePath);
          const base64Image = Buffer.from(fileData).toString('base64');

          imageParts.push({
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg'
            }
          });

          fs.unlinkSync(tempFilePath);
        }
      }

      const result = await model.generateContent([{ text: fullPrompt }, ...imageParts]);

      const response = await result.response;
      const text = await response.text();

      conversationHistory[senderID].push(`Bot: ${text}`);

      await saveDataToFile();

      // Reply lại tin nhắn gốc
      return api.sendMessage(text, threadID, messageID);

    } catch (error) {
      console.error("Lỗi khi tạo nội dung:", error);
      return api.sendMessage("Nội Dung bị chặn do yêu cầu an toàn.", threadID, messageID);
    }
  }
};
