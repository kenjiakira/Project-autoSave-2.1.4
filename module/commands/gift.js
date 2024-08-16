const fs = require('fs');
const path = require('path');

const giftDataPath = path.join(__dirname, 'json', 'giftcodes.json');
const validGiftCodesPath = path.join(__dirname, 'json', 'validGiftCodes.json');

function readOrCreateGiftData() {
  if (!fs.existsSync(giftDataPath)) {
    fs.writeFileSync(giftDataPath, JSON.stringify({}), 'utf8');
    return {}; 
  }
  let rawData;
  try {
    rawData = fs.readFileSync(giftDataPath, 'utf8');
    if (rawData.trim() === '') {
      return {};
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Lỗi khi phân tích tệp JSON:', error);
    return {};
  }
}

function readValidGiftCodes() {
  if (!fs.existsSync(validGiftCodesPath)) {
    fs.writeFileSync(validGiftCodesPath, JSON.stringify({}), 'utf8');
    return {}; 
  }
  let rawData;
  try {
    rawData = fs.readFileSync(validGiftCodesPath, 'utf8');
    if (rawData.trim() === '') {
      return {};
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Lỗi khi phân tích tệp JSON:', error);
    return {};
  }
}

function saveGiftData(data) {
  try {
    fs.writeFileSync(giftDataPath, JSON.stringify(data), 'utf8');
  } catch (error) {
    console.error('Lỗi khi lưu tệp JSON:', error);
  }
}

module.exports.config = {
  name: "gift",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Nhận xu từ Code",
  commandCategory: "Giải trí",
  usePrefix: true,
  usages: "giftcode [mã gift code]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Currencies, args }) {
  const { threadID, messageID, senderID } = event;

  if (args.length === 0) {
    return api.sendMessage("Vui lòng nhập mã gift code.", threadID, messageID);
  }

  const giftCode = args.join(" ").trim(); 
  const giftData = readOrCreateGiftData();
  const validGiftCodes = readValidGiftCodes();

  if (giftData[senderID]) {
    return api.sendMessage("❌ Bạn đã nhận gift code trước đó. Bạn không thể nhận lại.", threadID, messageID);
  }

  if (!validGiftCodes[giftCode]) {
    return api.sendMessage("❌ Mã gift code không hợp lệ. Ví dụ: .gift VCL\ncode sẽ được công bố khi có sự kiện trong tương lai", threadID, messageID);
  }

  const amount = validGiftCodes[giftCode];

  giftData[senderID] = true;
  saveGiftData(giftData);

  await Currencies.increaseMoney(senderID, amount);

  api.sendMessage(`🎉 Chúc mừng! Bạn đã nhận được ${amount} xu từ gift code ${giftCode}.`, threadID, messageID);
};
