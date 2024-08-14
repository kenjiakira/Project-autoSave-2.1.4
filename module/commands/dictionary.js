const axios = require('axios');
const translate = require('translate-google');

module.exports.config = {
  name: "dictionary",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Tra cứu từ điển tiếng Anh",
  commandCategory: "Công cụ",
  usePrefix: true,
  usages: "dictionary [từ cần tra cứu]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
  const word = args.join(" ").trim();
  if (!word) {
    return api.sendMessage("📝 Vui lòng nhập từ cần tra cứu.", event.threadID);
  }

  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const result = response.data;

    if (Array.isArray(result) && result.length > 0) {
      const meanings = result[0].meanings;
      if (meanings && meanings.length > 0) {
        let message = `🔍 Nghĩa của từ "${word}":\n`;
        const translationPromises = meanings.map(async meaning => {
          const definition = meaning.definitions[0].definition;
       
          const translatedText = await translate(definition, { to: 'vi' });
          return `- Loại từ: ${meaning.partOfSpeech}\n  Nghĩa: ${translatedText}\n`;
        });
        const translations = await Promise.all(translationPromises);
        message += translations.join("\n");
        api.sendMessage(message, event.threadID);
      } else {
        api.sendMessage(`❌ Không tìm thấy nghĩa cho từ "${word}".`, event.threadID);
      }
    } else {
      api.sendMessage(`❌ Không tìm thấy thông tin cho từ "${word}".`, event.threadID);
    }
  } catch (error) {
    console.error("Lỗi khi tra cứu từ điển:", error);
    api.sendMessage("⚠️ Đã xảy ra lỗi khi tra cứu từ điển.", event.threadID);
  }
};
