const fs = require('fs-extra');
const pathFile = __dirname + '/cache/txt/autoseen.txt';

module.exports.config = {
  name: "autoseen",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Yan Maglinte",
  description: "lệnh admin",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "[on/off]\n\nBật hoặc tắt chế độ tự động seen cho tin nhắn trong nhóm.\nKhi bạn chạy lệnh này, bot sẽ thay đổi trạng thái chống out và gửi một tin nhắn thông báo về trạng thái đã thay đổi.\n\nVí dụ:\n- Nếu trạng thái tự động seen đang bật, khi bạn chạy lệnh `.autoseen`, bot sẽ tắt chế độ tự động seen và thông báo 'The autoseen function is now enabled for new messages.'.\n- Nếu trạng thái tự động seen đang tắt, khi bạn chạy lệnh `.autoseen`, bot sẽ bật chế độ tự động seen và thông báo 'The autoseen function has been disabled for new messages.'.",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ api, event, args }) => {
  if (!fs.existsSync(pathFile))
    fs.writeFileSync(pathFile, 'false');
  const isEnable = fs.readFileSync(pathFile, 'utf-8');
  if (isEnable == 'true')
    api.markAsReadAll(() => { });
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (args[0] == 'on') {
      fs.writeFileSync(pathFile, 'true');
      api.sendMessage('The autoseen function is now enabled for new messages.', event.threadID, event.messageID);
    } else if (args[0] == 'off') {
      fs.writeFileSync(pathFile, 'false');
      api.sendMessage('The autoseen function has been disabled for new messages.', event.threadID, event.messageID);
    } else {
      api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
    }
  }
  catch (e) {
    console.log(e);
  }
};