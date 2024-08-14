const fs = require('fs');
const path = require('path');
const toolsPath = path.join(__dirname, 'json', 'stealtools.json');
const userToolsPath = path.join(__dirname, 'json', 'usertools.json');

let toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
let userToolsData = JSON.parse(fs.readFileSync(userToolsPath, 'utf8'));

const cooldown = new Map();

module.exports.config = {
  name: "steal",
  version: "1.1.1",
  hasPermission: 0,
  credits: "HNT",
  description: "Trộm tiền ai đó hoặc mua công cụ trộm",
  commandCategory: "Tài chính",
  usePrefix: true,
  usages: "steal [@mention] | steal bail | steal shop",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { senderID, threadID, messageID, mentions } = event;
  const mentionID = Object.keys(mentions)[0];
  const command = args[0];

  if (command === "bail") {
    const bailAmount = 2000;
    const userBalance = (await Currencies.getData(senderID)).money;

    if (userBalance < bailAmount) {
      return api.sendMessage("Bạn không đủ xu để được bảo lãnh. Bạn cần 2000 xu.", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, bailAmount);
    api.sendMessage("Bạn đã bảo lãnh thành công. Bạn có thể tiếp tục trộm tiền.", threadID, messageID);
    cooldown.delete(senderID); 
    return;
  }

  if (command === "shop") {
    const toolList = toolsData.tools.map((tool, index) => `${index + 1}. ${tool.name} - ${tool.cost} xu`).join("\n");
    return api.sendMessage(`Cửa hàng công cụ trộm:\n${toolList}\n\nVui lòng chọn công cụ bằng cách trả lời số tương ứng.`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "buy_tool"
      });
    });
  }

  if (!mentionID) return api.sendMessage("Bạn phải tag người dùng để trộm tiền.", threadID, messageID);

  const currentTime = Date.now();
  const lastUsed = cooldown.get(senderID) || 0;
  const cooldownFailure = 24 * 60 * 60 * 1000;

  const userTools = userToolsData[senderID] || {};
  const toolSuccessIncrease = Object.keys(userTools).reduce((total, toolId) => {
    const tool = toolsData.tools.find(t => t.id === toolId);
    return total + (tool ? tool.successIncrease : 0);
  }, 0);

  const successRate = 0.5 + (toolSuccessIncrease / 100);
  const success = Math.random() < successRate;
  const amount = Math.floor(Math.random() * 2000) + 1000;

  const senderData = await Currencies.getData(senderID);
  const senderName = senderData.name || `User ${senderID}`;

  if (success) {
    const targetData = await Currencies.getData(mentionID);
    const targetBalance = targetData.money;
    const targetName = mentions[mentionID].replace("@", "");
    if (targetBalance < amount) return api.sendMessage("Người dùng này không có đủ tiền để bạn trộm.", threadID, messageID);

    await Currencies.decreaseMoney(mentionID, amount);
    await Currencies.increaseMoney(senderID, amount);

    api.sendMessage(`Bạn đã trộm thành công ${amount} xu từ ${targetName}.`, threadID, messageID);
    cooldown.set(senderID, currentTime); 

  } else {
    const penalty = 1000; 
    await Currencies.decreaseMoney(senderID, penalty);

    api.sendMessage(`Bạn đã bị cảnh sát bắt và bị phạt ${penalty} xu. Bạn bị giam 24 giờ và không thể thực hiện hành động trộm tiền trong thời gian này. Sử dụng lệnh "steal bail" để được bảo lãnh.`, threadID, messageID);
    cooldown.set(senderID, currentTime + cooldownFailure); 
  }
};

module.exports.handleReply = async function({ api, event, handleReply, Users, Currencies }) {
  const { senderID, threadID, messageID, body } = event;

  if (handleReply.type === "buy_tool") {
    const selectedIndex = parseInt(body) - 1;
    const tool = toolsData.tools[selectedIndex];

    if (!tool) return api.sendMessage("Lựa chọn công cụ không hợp lệ.", threadID, messageID);

    const userBalance = (await Currencies.getData(senderID)).money;

    if (userBalance < tool.cost) {
      return api.sendMessage(`Bạn không đủ tiền để mua "${tool.name}". Cần ${tool.cost} xu.`, threadID, messageID);
    }

    const userPurchasedTools = userToolsData[senderID] || {};
    if (userPurchasedTools[tool.id]) {
      return api.sendMessage(`Bạn đã mua công cụ "${tool.name}" rồi. Không thể mua lại.`, threadID, messageID);
    }

    userPurchasedTools[tool.id] = true;
    userToolsData[senderID] = userPurchasedTools;

    try {
      fs.writeFileSync(userToolsPath, JSON.stringify(userToolsData, null, 2), 'utf8');
    } catch (error) {
      console.error("Lỗi khi ghi tệp JSON:", error);
      return api.sendMessage("Đã xảy ra lỗi khi lưu thông tin công cụ đã mua.", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, tool.cost);
    api.sendMessage(`Bạn đã mua "${tool.name}" thành công. Tỷ lệ thành công khi trộm sẽ tăng thêm ${tool.successIncrease}%.`, threadID, messageID);
  }
};
