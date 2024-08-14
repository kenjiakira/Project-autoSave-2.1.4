const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBKQ2MDvwfT88_JSJwYxnIew1O6OpB0v9Y";
let commandEnabled = true;
const conversationHistory = {};

module.exports = {
  config: {
    name: "",
    version: "1.0",
    hasPermission: 0,
    credits: "HNT",
    description: "Trò chuyện cùng bot",
    usePrefix: false,
    commandCategory: "general",
    usages: "[prompt] | .toggle",
    cooldowns: 5,
    dependencies: {
      "@google/generative-ai": ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (args.length === 1 && args[0].toLowerCase() === '.toggle') {
      commandEnabled = !commandEnabled;
      return api.sendMessage(`Lệnh đã ${commandEnabled ? 'bật' : 'tắt'}.`, threadID, messageID);
    }

    if (!commandEnabled) {
      return api.sendMessage("Lệnh hiện tại đang bị tắt. Vui lòng bật lại để sử dụng.", threadID, messageID);
    }

    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("Vui lòng nhập một prompt.", threadID, messageID);
    }

    try {

      if (!conversationHistory[senderID]) {
        conversationHistory[senderID] = [];
      }
      conversationHistory[senderID].push(`User: ${prompt}`);

      const context = conversationHistory[senderID].join("\n");

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(context); 
      const response = await result.response;
      const text = await response.text();

      conversationHistory[senderID].push(`Bot: ${text}`);

      return api.sendMessage(text, threadID, messageID);
    } catch (error) {
      console.error("Error generating content:", error);
      return api.sendMessage("Đã xảy ra lỗi khi tạo nội dung.", threadID, messageID);
    }
  }
};
