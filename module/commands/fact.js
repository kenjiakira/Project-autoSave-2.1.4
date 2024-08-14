 module.exports.config = {
  name: "fact",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "fact ngẫu nhiên",
  commandCategory: "general",
  usePrefix: true,
  usages: "fact - Gửi một sự thật ngẫu nhiên.",
  cooldowns: 5
};

const axios = require('axios');
const translate = require('translate-google');

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://useless-facts.sameerkumar.website/api');
    const fact = response.data.data;

    translate(fact, { to: 'vi' }).then(translatedFact => {
      api.sendMessage(`📚 Sự thật ngẫu nhiên: ${translatedFact}`, event.threadID);
    });
  } catch (error) {
    console.error(error);
    api.sendMessage('Đã xảy ra lỗi khi lấy sự thật ngẫu nhiên.', event.threadID);
  }
};