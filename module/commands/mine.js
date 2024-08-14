module.exports.config = {
  name: "mine",
  version: "1.0.3",
  hasPermission: 2,
  credits: "Akira",
  description: "Khai thác tài nguyên",
  commandCategory: "kiếm tiền",
  usePrefix: true,
  update: true,
  cooldowns: 5,
  envConfig: {
      cooldownTime: 600000  
  },
  dependencies: {
      "fs": "",
      "request": ""
  }
};

module.exports.handleReply = async ({ event: e, api, handleReply, Currencies }) => {
  const { threadID, senderID } = e;
  let data = (await Currencies.getData(senderID)).data || {};

  if (handleReply.author != e.senderID) {
    return api.sendMessage("⚡ Đừng bấm nhanh quá nhé, chờ cooldown đã!", e.threadID, e.messageID);
  }

  var a = 0;
  var msg = "";

  switch (handleReply.type) {
      case "choosee": {
          switch (e.body) {
              case "1":
                  const minerals = ["đồng", "bạc", "vàng"];
                  const weights = [2000, 5000, 20000];
                  const index = weightedRandom(weights);
                  const mineral = minerals[index];
                  a = weights[index];
                  msg = `Bạn vừa khai thác được ${mineral} và bán được ${a} xu`;
                  await Currencies.increaseMoney(e.senderID, parseInt(a));
                  break;
              case "2":
                  const tasks = ["Khai thác KS ở Quảng Ninh", "Khai thác Vật liệu ở nam Cực", "Khai Thác Quặng ở Lào"];
                  const randomIndex = Math.floor(Math.random() * tasks.length);
                  const task = tasks[randomIndex];
                  const reward = Math.floor(Math.random() * 30000) + 30000;
                  msg = `Bạn vừa hoàn thành công việc "${task}" và nhận được ${reward} xu`;
                  await Currencies.increaseMoney(e.senderID, reward);
                  break;
              default:
                  break;
          }

          const choose = parseInt(e.body);
          if (isNaN(e.body)) return api.sendMessage("⚡ Vui lòng nhập theo thứ tự nhé!", e.threadID, e.messageID);
          if (choose > 2 || choose < 1) return api.sendMessage("⚡ Số chỉ từ 1 đến 2 thôi nhé!", e.threadID, e.messageID);

          api.unsendMessage(handleReply.messageID);
          return api.sendMessage(`${msg}`, threadID, async () => {
              data.work2Time = Date.now();
              await Currencies.setData(senderID, { data });
          });
      }
  }
};

function weightedRandom(weights) {
  var totalWeight = weights.reduce((a, b) => a + b, 0);
  var randomNumber = Math.random() * totalWeight;
  var weightSum = 0;

  for (var i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (randomNumber < weightSum) {
          return i;
      }
  }
  return weights.length - 1;
}

module.exports.run = async ({ event: e, api, handleReply, Currencies }) => {
  const { threadID, senderID } = e;
  const cooldown = module.exports.config.envConfig.cooldownTime; 
  let data = (await Currencies.getData(senderID)).data || {};

  if (typeof data !== "undefined" && cooldown - (Date.now() - data.work2Time) > 0) {
      var time = cooldown - (Date.now() - data.work2Time),
          minutes = Math.floor((time / 60000) % 60),
          seconds = ((time % 60000) / 1000).toFixed(0);
      return api.sendMessage(`⚡ Bạn vừa làm việc không được đâu, chờ sau nhé!\nThời gian còn lại: ${minutes} phút ${seconds} giây`, e.threadID, e.messageID);
  }
  else {
      var msg = {
          body: "===💎KHAI THÁC💎===" + `\n` +
              "\n1 ≻ KHAI THÁC KHOÁNG SẢN Ở MỎ ĐÁ🚛" +
              "\n2 ≻ KHAI THÁC CHỖ KHÁC" +
              `\n\n📌Reply để chọn nơi khai thác!`,
      };
      return api.sendMessage(msg, e.threadID, (error, info) => {
          data.work2Time = Date.now();
          global.client.handleReply.push({
              type: "choosee",
              name: this.config.name,
              author: e.senderID,
              messageID: info.messageID
          });
      });
  }
};
