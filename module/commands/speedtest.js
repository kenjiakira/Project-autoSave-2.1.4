module.exports.config = {
  name: "speedtest",
  version: "1.2.0",
  hasPermission: 0,
  credits: "PSTe",
  description: "Kiểm tra Tốc độ mạng",
  commandCategory: "system",
  usePrefix: false,
  cooldowns: 15,
  dependencies: {
    "fast-speedtest-api": ""
  }
};

const getRandomTip = () => {
  const tips = [
    "💡 Để cải thiện tốc độ mạng, bạn có thể thử khắc phục sự cố hoặc sử dụng băng thông rộng hơn.",
    "⭐ Đảm bảo router của bạn đang hoạt động ổn định để đảm bảo tốc độ mạng cao.",
    "🔌 Kiểm tra và loại bỏ các thiết bị không sử dụng đang kết nối đến mạng để giảm tải và cải thiện tốc độ.",
    "📶 Đặt router ở vị trí trung tâm và không bị cản trở để phủ sóng mạng tốt hơn.",
    "🔍 Sử dụng cáp mạng chất lượng để tránh mất tín hiệu và cải thiện tốc độ mạng."
  ];
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
};

module.exports.run = async function({ api, event }) {
  try {
    const fast = global.nodemodule["fast-speedtest-api"];
    const speedTest = new fast({
      token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
      verbose: false,
      timeout: 10000,
      https: true,
      urlCount: 5,
      bufferSize: 8,
      unit: fast.UNITS.Mbps
    });

    api.sendTypingIndicator(event.threadID);
    const result = await speedTest.getSpeed();

    const message = `🌐 Kết quả kiểm tra tốc độ 🚀\n\n- Tốc độ: ${result} Mbps`;

    const moreInfo = `📊 Thông tin chi tiết:\n- Kích thước bộ đệm: ${speedTest.bufferSize} MB\n- Số lượng URL: ${speedTest.urlCount}\n- Đơn vị: Mbps`;

    const randomTip = getRandomTip();

    const additionalFeaturesText = `⭐ Gợi ý để cải thiện tốc độ mạng:\n${randomTip}`;

    const finalMessage = `${message}\n\n${moreInfo}\n\n${additionalFeaturesText}`;

    return api.sendMessage(finalMessage, event.threadID, event.messageID);
  } catch (error) {
    console.log(error);
    return api.sendMessage(
      "Không thể thực hiện kiểm tra tốc độ ngay bây giờ, vui lòng thử lại sau!",
      event.threadID,
      event.messageID
    );
  }
};
