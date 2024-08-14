const axios = require('axios');

module.exports.config = {
    name: "shortenurl",
    version: "1.0.0",
    hasPermission: 0,
    credits: "HNT",
    description: "Rút gọn liên kết dài thành liên kết ngắn gọn.",
    commandCategory: "Tiện ích",
    usePrefix: true,
    usages: "shortenurl [URL]",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const longUrl = args.join(' ');

    if (!longUrl) {
        return api.sendMessage("Bạn cần cung cấp liên kết để rút gọn. Ví dụ: !shortenurl https://www.example.com", threadID, messageID);
    }

    try {
      
        const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
        const shortUrl = response.data;

        if (shortUrl && shortUrl.startsWith('http')) {
            api.sendMessage(`Liên kết rút gọn của bạn là: ${shortUrl}`, threadID, messageID);
        } else {
            api.sendMessage("Đã xảy ra lỗi khi rút gọn liên kết. Vui lòng thử lại sau.", threadID, messageID);
        }
    } catch (error) {
        api.sendMessage("Không thể rút gọn liên kết vào lúc này. Vui lòng thử lại sau.", threadID, messageID);
    }
};
