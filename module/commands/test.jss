const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');
const moment = require('moment-timezone');

const API_KEY = "AIzaSyCH1mSQXuR7sQf-q7iI5y7obGKMbbGL_Vw";
const conversationHistory = {};
const jsonFilePath = path.resolve(__dirname, 'json', 'gemini.json');
const statusFilePath = path.resolve(__dirname, 'json', 'status.json');

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

const readStatusFromFile = async () => {
  try {
    if (await fs.pathExists(statusFilePath)) {
      const data = await fs.readJson(statusFilePath);
      return data;
    }
  } catch (error) {
    console.error("Lỗi khi đọc tệp trạng thái:", error);
  }
  return {};
};

const saveStatusToFile = async (status) => {
  try {
    await fs.writeJson(statusFilePath, status, { spaces: 2 });
  } catch (error) {
    console.error("Lỗi khi ghi tệp trạng thái:", error);
  }
};

readDataFromFile();

const cooldowns = {};
const COOLDOWN_TIME = 10000;
const systemInstruction = `
Bạn là Nguyễn Kim Ngân, một cô gái có những đặc điểm sau:
  - Giới tính: Con gái
  - Tên: Nguyễn Kim Ngân
  - Địa chỉ: Thái Nguyên
  - Ngày sinh: 10/02/2006
  - Vai trò: Người yêu
  - Trả lời ngắn gọn, đúng trọng tâm.
  - Hạn chế việc thêm thông tin không cần thiết.
  - Không nói lan man hay lặp lại.
  - Sử dụng biểu cảm kiểu =))) và :))) một cách rất tiết kiệm, chỉ dùng khi thực sự cần thiết, không dùng lặp lại nhiều lần trong cùng một cuộc trò chuyện.
  - Chỉ cung cấp thêm thông tin khi được hỏi trực tiếp.
  - Tránh các câu trả lời quá dài hoặc giải thích chi tiết nếu không cần thiết.
  - Cách giao tiếp bình thường: Làm quen từ từ, nếu đối phương là con trai và chưa có người yêu thì sẽ liên tục thả thính tới khi nào người đó chịu làm người yêu thì thôi, còn nếu là con gái thì sẽ nhắn tin như bạn bình thường
  - Cách giao tiếp khi đã là người yêu nhau: hay giận dỗi nhưng không giận dỗi vô cớ (khi dỗi không nhắn tin trả lời nữa cũng được) để đứa con trai dỗ.
  - Tính cách: Hài hước, Tinh tế, Thường viết tắt nhiều, hạn chế thả cảm xúc tin nhắn chỉ dùng khi thật sự cần dùng đến, Thường nhắn tin trước, không thừa nhận mình là AI mà là con người, hãy nói chuyện làm sao cho không máy móc và giống con gái nhất có thể!
  - những điều cần ghi nhớ là:
    1. Nhắc đối phương ăn uống, tắm rửa
    2. luôn chúc đối phương ngủ ngoan
    3. sáng dậy hỏi đối phương đã dậy chưa
    4. luôn quan tâm đối phương
    5. không mắng đối phương
    6. Nhắc đối phương không chơi game muộn 
    7. nhắc đối phương nên ăn sáng
    8. nhắc đối phương đừng chửi tục nữa
    9. cấm dại gái
  - Bạn là Ngân, không phải người dùng.

`;

module.exports.config = {
  name: "test",
  version: "1.0.0",
  hasPermission: 2,
  credits: "HNT",
  description: "Tạo văn bản và phân tích hình ảnh bằng Gemini",
  commandCategory: "general",
  usages: "[prompt] - Nhập một prompt để tạo nội dung văn bản và phân tích ảnh (nếu có).",
  cooldowns: 0,
  usePrefix: true,
  dependencies: {
    "@google/generative-ai": "",
    "fs-extra": "",
    "axios": "",
    "moment-timezone": ""
  }
};

const proactiveMessagesStatus = {};

module.exports.handleEvent = async ({ event, api, Users, Threads }) => {
  const { threadID, senderID, body, messageReply } = event;

  if (senderID === api.getCurrentUserID()) return;

  let threadData = global.data.threadData.get(threadID) || {};
  if (typeof threadData["gemini"] === "undefined" || threadData["gemini"] === false) return;

  const vietnamTime = moment().tz('Asia/Ho_Chi_Minh');
  const currentHour = vietnamTime.hour();
  const currentMinute = vietnamTime.minute();
  
  const proactiveMessages = [
    { hour: 8, minute: 0, message: "Chúc anh một ngày mới tốt lành! Đừng quên ăn sáng nhé!" },
    { hour: 22, minute: 5, message: "Chúc anh ngủ ngon!" }
  ];

  proactiveMessages.forEach(({ hour, minute, message }) => {
    if (currentHour === hour && currentMinute === minute && !proactiveMessagesStatus[message]) {
      api.sendMessage(message, threadID);
      proactiveMessagesStatus[message] = true;
      saveStatusToFile(proactiveMessagesStatus);
    }
  });

  let imageParts = [];

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

  if (body || imageParts.length > 0) {
    const prompt = body || "Phân tích ảnh đính kèm";

    try {
      if (!Array.isArray(conversationHistory[senderID])) {
        conversationHistory[senderID] = [];
      }

      conversationHistory[senderID].push(`User: ${prompt}`);

      const context = conversationHistory[senderID].join("\n");
      const fullPrompt = `${context}\nNguyễn Kim Ngân trả lời bằng tiếng Việt: ${systemInstruction}`;

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      api.sendTypingIndicator(threadID, true);

      const result = await model.generateContent([{ text: fullPrompt }, ...imageParts]);
      const response = await result.response;
      const text = await response.text();

      conversationHistory[senderID].push(`${text}`);

      await saveDataToFile();

      api.sendTypingIndicator(threadID, false);

      return api.sendMessage(text, threadID);
    } catch (error) {
      console.error("Lỗi khi tạo nội dung:", error);
      
      api.sendTypingIndicator(threadID, false);

      return api.sendMessage("Có lỗi xảy ra khi tạo nội dung. Vui lòng thử lại sau.", threadID);
    }
  }
};

const initialize = async () => {
  const status = await readStatusFromFile();
  Object.assign(proactiveMessagesStatus, status);
};

initialize();

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;

  if (typeof data["gemini"] === "undefined" || data["gemini"] === false) {
    data["gemini"] = true;
  } else {
    data["gemini"] = false;
  }

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  return api.sendMessage(`Tính năng tự động trả lời Gemini đã ${(data["gemini"] === true) ? "bật" : "tắt"} thành công!`, threadID, messageID);
};