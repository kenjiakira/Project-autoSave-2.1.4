module.exports.config = {
  name: "rizz",
  version: "1.2.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "câu nói hoặc câu thơ về tán tỉnh",
  commandCategory: "Giải Trí",
  usePrefix: true,
  usages: "Sử dụng: .rizz hoặc .rizz add <câu nói>",
  cooldowns: 5
};

const fs = require('fs');
const path = require('path');

const pickupLinesFile = path.join(__dirname, 'json', 'pickupLines.json');
let pickupLines = [];

const loadPickupLines = () => {
  if (fs.existsSync(pickupLinesFile)) {
    pickupLines = JSON.parse(fs.readFileSync(pickupLinesFile, 'utf8'));
  } else {
    pickupLines = [
    ];
    savePickupLines();
  }
};

const savePickupLines = () => {
  fs.writeFileSync(pickupLinesFile, JSON.stringify(pickupLines, null, 2), 'utf8');
};

let recentPickupLines = [];
const recentLinesLimit = 5;
const avoidRepeatDuration = 60000;

module.exports.run = async ({ api, event }) => {
  const { threadID, senderID, body } = event;

  if (body.startsWith('.rizz add')) {
    const adminIDs = ['61561753304881'];

    if (!adminIDs.includes(senderID)) {
      return api.sendMessage('Bạn không có quyền sử dụng lệnh này.', threadID);
    }

    const newLine = body.slice('.rizz add'.length).trim();
    if (!newLine) {
      return api.sendMessage('Vui lòng nhập câu nói để thêm.', threadID);
    }

    pickupLines.push(newLine);
    savePickupLines();
    return api.sendMessage('Câu nói mới đã được thêm thành công!', threadID);
  }

  let name1 = "Tôi"; 
  let name2 = "Cậu";  
  let randomPickupLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
  randomPickupLine = randomPickupLine.replace(/{name1}/g, name1).replace(/{name2}/g, name2);

  do {
    randomPickupLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
    randomPickupLine = randomPickupLine.replace(/{name1}/g, name1).replace(/{name2}/g, name2);
  } while (recentPickupLines.includes(randomPickupLine));

  recentPickupLines.push(randomPickupLine);

  if (recentPickupLines.length > recentLinesLimit) {
    recentPickupLines.shift();
  }

  await api.sendMessage(randomPickupLine, threadID);

  setTimeout(() => {
    recentPickupLines = recentPickupLines.filter(line => line !== randomPickupLine);
  }, avoidRepeatDuration);
};

loadPickupLines();
