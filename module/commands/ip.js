const axios = require('axios');

const apiKey = 'b10fcd9868c138f94e03858fa787d214'; 

module.exports.config = {
  name: "ip",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng NGỌC TỪ",
  description: "Tra cứu thông tin IP",
  usePrefix: true,
  commandCategory: "utilities",
  usages: "ip [địa chỉ IP]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("Vui lòng cung cấp địa chỉ IP để tra cứu thông tin. Ví dụ: ip 8.8.8.8", threadID, messageID);
  }

  const ipAddress = args[0];

  try {
    const response = await axios.get(`http://api.ipstack.com/${ipAddress}?access_key=${apiKey}`);
    const ipInfo = response.data;

    // Kiểm tra và lấy thông tin IP
    const city = ipInfo.city || "Không có thông tin";
    const regionName = ipInfo.region_name || "Không có thông tin";
    const countryName = ipInfo.country_name || "Không có thông tin";
    const timezone = (ipInfo.time_zone && ipInfo.time_zone.name) || "Không có thông tin";
    const organization = ipInfo.organization || "Không có thông tin";

    const message = `Thông tin IP của bạn:\n🌐 IP: ${ipAddress}\n📍 Địa chỉ: ${city}, ${regionName}, ${countryName}\n🌍 Khu vực: ${timezone}\n🔍 Nhà mạng: ${organization}`;

    api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Không thể tra cứu thông tin IP. Vui lòng kiểm tra địa chỉ IP hoặc thử lại sau.", threadID, messageID);
  }
};
