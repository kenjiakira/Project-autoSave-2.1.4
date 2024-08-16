const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
const axios = require('axios');

const API_KEY = "AIzaSyBKQ2MDvwfT88_JSJwYxnIew1O6OpB0v9Y";
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

module.exports.config = {
  name: "gemini",
  version: "1.0.0",
  hasPermission: 0,
  credits: "HNT",
  description: "Tạo văn bản và phân tích hình ảnh bằng Gemini",
  commandCategory: "general",
  usages: "[prompt] - Nhập một prompt để tạo nội dung văn bản và phân tích ảnh (nếu có).",
  cooldowns: 0,
  usePrefix: true,
  dependencies: {
    "@google/generative-ai": "",
    "fs-extra": "",
    "axios": ""
  }
};
module.exports.handleEvent = async ({ event, api, Users, Threads }) => {
  const { threadID, senderID, body } = event;

  if (senderID === api.getCurrentUserID()) return;

  let threadData = global.data.threadData.get(threadID) || {};
  if (typeof threadData["gemini"] === "undefined" || threadData["gemini"] === false) return;

  const now = Date.now();
  if (cooldowns[senderID] && now - cooldowns[senderID] < COOLDOWN_TIME) return;

  cooldowns[senderID] = now;

  if (body) {
    const prompt = body;
    
    try {
      if (!Array.isArray(conversationHistory[senderID])) {
        conversationHistory[senderID] = [];
      }

      conversationHistory[senderID].push(`User: ${prompt}`);

      const context = conversationHistory[senderID].join("\n");
      const fullPrompt = `${context}\nTrả lời bằng tiếng Việt:`;

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await model.generateContent([{ text: fullPrompt }]);
      const response = await result.response;
      const text = await response.text();

      conversationHistory[senderID].push(`${text}`);

      await saveDataToFile();

      return api.sendMessage(text, threadID);
    } catch (error) {
      console.error("Lỗi khi tạo nội dung:", error);
      return api.sendMessage("", threadID);
    }
  }
};

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
