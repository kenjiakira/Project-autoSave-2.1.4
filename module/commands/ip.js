const axios = require('axios');

module.exports.config = {
  name: "ip",
  version: "1.0.0",
  hasPermission: 0,
  credits: "NTKhang, Nguyên Blue [convert]",
  description: "Kiểm tra thông tin IP",
  commandCategory: "TOOLS",
  usePrefix: true,
  usages: "ip [địa chỉ IP]\n\n" +
          "Hướng dẫn sử dụng:\n" +
          "- `ip [địa chỉ IP]`: Kiểm tra thông tin địa chỉ IP.",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("❎ Vui lòng nhập địa chỉ IP bạn muốn kiểm tra.", threadID, messageID);
  }

  try {
    const ipAddress = args.join(' ');
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}?fields=66846719`);
    const infoip = response.data;

    if (infoip.status === 'fail') {
      return api.sendMessage(`⚠️ Đã xảy ra lỗi: ${infoip.message}`, threadID, messageID);
    }

    const messageBody = `🗺️ Châu lục: ${infoip.continent}\n` +
                        `🏳️ Quốc gia: ${infoip.country}\n` +
                        `🎊 Mã QG: ${infoip.countryCode}\n` +
                        `🕋 Khu vực: ${infoip.region}\n` +
                        `⛱️ Vùng/Tiểu bang: ${infoip.regionName}\n` +
                        `🏙️ Thành phố: ${infoip.city}\n` +
                        `🛣️ Quận/Huyện: ${infoip.district}\n` +
                        `📮 Mã bưu chính: ${infoip.zip}\n` +
                        `🧭 Latitude: ${infoip.lat}\n` +
                        `🧭 Longitude: ${infoip.lon}\n` +
                        `⏱️ Timezone: ${infoip.timezone}\n` +
                        `👨‍✈️ Tên tổ chức: ${infoip.org}\n` +
                        `💵 Đơn vị tiền tệ: ${infoip.currency}`;

    return api.sendMessage({
      body: messageBody,
      location: {
        latitude: infoip.lat,
        longitude: infoip.lon,
        current: true
      }
    }, threadID, messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ Đã xảy ra lỗi khi kiểm tra IP. Vui lòng thử lại sau.", threadID, messageID);
  }
};
