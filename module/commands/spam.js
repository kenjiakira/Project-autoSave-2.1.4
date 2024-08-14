const { setTimeout, clearInterval } = require('timers');

module.exports.config = {
  name: "spam",
  version: "1.0.0",
  hasPermission: 2, 
  credits: "HNT",
  description: "Gửi tin nhắn spam.",
  usePrefix: true,
  commandCategory: "Utilities",
  usages: "spam [text] [time]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
  const messageText = args.slice(0, -1).join(" "); 
  const count = parseInt(args[args.length - 1], 10);

  if (!messageText || isNaN(count) || count <= 0) {
    return api.sendMessage("Vui lòng cung cấp nội dung tin nhắn và số lần spam (phải là số dương).", event.threadID);
  }

  const intervalTime = 1000; 
  let remainingCount = count; 

  const intervalId = setInterval(() => {
    if (remainingCount <= 0) {
      clearInterval(intervalId); 
      return api.sendMessage("Đã dừng spam tin nhắn.", event.threadID);
    }

    api.sendMessage(messageText, event.threadID);
    remainingCount--; 
  }, intervalTime);
};
