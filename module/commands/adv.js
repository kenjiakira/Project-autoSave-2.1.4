const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "adv",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Hoàng Ngọc Từ",
  description: "Adventure",
  commandCategory: "Game",
  usePrefix: true,
  update: true,
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const subCommand = args[0];

  if (!subCommand) {
    return api.sendMessage("Chào mừng đến với Adventure! Các lệnh hiện có:\n\n" +
      "🔹 adv start: Bắt đầu cuộc phiêu lưu\n" +
      "🔹 adv status: Kiểm tra tình trạng nhân vật\n" +
      "🔹 adv explore: Khám phá thế giới\n" +
      "🔹 adv battle: Tham gia trận chiến\n" +
      "🔹 adv setname [tên]: Đặt tên cho nhân vật của bạn\n" +
      "🔹 adv train: Tập luyện để nâng cao sức mạnh\n\n" +
      "Hãy nhập 'adv [lệnh]' để tiếp tục!", threadID, messageID);
  }

  try {
    const commandPath = path.join(__dirname, 'cache', 'adventure', `adventure_${subCommand}.js`);
    if (fs.existsSync(commandPath)) {
      const command = require(commandPath);
      return command.run({ api, event, args: args.slice(1) });
    } else {
      return api.sendMessage("Lệnh không hợp lệ! Hãy nhập 'adv' để xem các lệnh khả dụng.", threadID, messageID);
    }
  } catch (error) {
    console.error("Lỗi khi thực hiện lệnh adventure:", error);
    return api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh. Vui lòng thử lại sau.", threadID, messageID);
  }
};
