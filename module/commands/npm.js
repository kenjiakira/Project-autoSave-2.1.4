const { exec } = require('child_process');

module.exports.config = {
  name: "npm",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Hoàng Ngọc Từ",
  description: "Lệnh Admin.",
  commandCategory: "System",
  usePrefix: true,
  usages: ".npm <install/uninstall> <tên_thư_viện>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const tid = event.threadID;
  const mid = event.messageID;
  const action = args[0];
  const libraryName = args[1];

  if (!action || !libraryName) {
    return api.sendMessage("❗ Vui lòng cung cấp hành động (install/uninstall) và tên thư viện.", tid, mid);
  }

  const command = `npm ${action} ${libraryName}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Lỗi: ${error.message}`);
      return api.sendMessage(`❗ Đã xảy ra lỗi khi thực hiện lệnh: ${error.message}`, tid, mid);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return api.sendMessage(`❗ Lỗi: ${stderr}`, tid, mid);
    }
    console.log(`stdout: ${stdout}`);
    return api.sendMessage(`✅ Thực hiện thành công lệnh \`${command}\`:\n${stdout}`, tid, mid);
  });
};
