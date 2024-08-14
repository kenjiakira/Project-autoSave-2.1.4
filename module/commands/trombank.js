const fs = require('fs');
const path = require('path');

const trombankFilePath = path.join(__dirname, 'json', 'trombank.json');
let trombankData = {}; 

try {
  if (fs.existsSync(trombankFilePath)) {
    trombankData = JSON.parse(fs.readFileSync(trombankFilePath, 'utf8'));
  }
} catch (error) {
  console.error("Error reading trombank JSON file:", error);
}

const vaultCooldown = new Map();

module.exports.config = {
  name: "trombank",
  version: "1.1",
  hasPermission: 2,
  credits: "HNT",
  description: "Trộm ngân hàng(EVENT)",
  commandCategory: "Tài chính",
  usePrefix: true,
  usages: "bankrob",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { senderID, threadID, messageID } = event;
  const currentTime = Date.now();
  const vaultUnlockTime = 2 * 60 * 1000; 
  if (trombankData[senderID]) {
    return api.sendMessage("Bạn đã trộm ngân hàng thành công và không thể trộm lại nữa.", threadID, messageID);
  }

  if (vaultCooldown.get(senderID) && vaultCooldown.get(senderID) > currentTime) {
    const remainingTime = Math.ceil((vaultCooldown.get(senderID) - currentTime) / (60 * 1000));
    return api.sendMessage(`Bạn cần chờ thêm ${remainingTime} phút nữa để mở khóa két sắt ngân hàng.`, threadID, messageID);
  }

  const successRate = 0.1; 
  const success = Math.random() < successRate;
  const amount = 200000; 

  if (success) {
    await Currencies.increaseMoney(senderID, amount);
    api.sendMessage(`Bạn đã trộm thành công ${amount} xu từ ngân hàng HCB(2 chân bank).`, threadID, messageID);
    trombankData[senderID] = true; 
    fs.writeFileSync(trombankFilePath, JSON.stringify(trombankData, null, 2), 'utf8');
    vaultCooldown.set(senderID, currentTime + vaultUnlockTime); 
  } else {
    const penalty = 2000;
    await Currencies.decreaseMoney(senderID, penalty);
    api.sendMessage(`Bạn đã bị cảnh sát bắt và bị phạt ${penalty} xu. Bạn cần chờ thêm 2 phút nữa để mở khóa két sắt ngân hàng lần nữa.`, threadID, messageID);
    vaultCooldown.set(senderID, currentTime + vaultUnlockTime); 
  }
};

module.exports.handleReply = async function({ api, event, handleReply, Users, Currencies }) {
  const { senderID, threadID, messageID, body } = event;

};
