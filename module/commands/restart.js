const { exec } = require("child_process");

module.exports.config = {
  name: "restart",
  version: "1.0.0",
  hasPermission: 2, 
  credits: "HNT",
  description: "Khởi động lại bot",
  commandCategory: "admin",
  usages: "restart",
  usePrefix: true,
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  api.sendMessage("Bot đang khởi động lại...", threadID, messageID, () => {
    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        console.error(`Lỗi khi khởi động lại bot: ${error.message}`);
        return api.sendMessage("Có lỗi xảy ra khi khởi động lại bot!", threadID, messageID);
      }

      if (stderr) {
        console.error(`Lỗi: ${stderr}`);
        return api.sendMessage("Có lỗi xảy ra khi khởi động lại bot!", threadID, messageID);
      }

      console.log(`Kết quả: ${stdout}`);
    });
  });
};
