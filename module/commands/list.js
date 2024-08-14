const fs = require('fs');
const path = require('path');
const groupsPath = path.join(__dirname, '../../module/commands/noti/groups.json');

function readGroupsData() {
  if (!fs.existsSync(groupsPath)) {
    fs.writeFileSync(groupsPath, JSON.stringify([]), 'utf8');
  }
  const rawData = fs.readFileSync(groupsPath);
  return JSON.parse(rawData);
}

module.exports.config = {
  name: "list",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Hoàng Ngọc Từ",
  description: "lệnh admin",
  commandCategory: "Công Cụ",
  usePrefix: true,
  usages: "[list]",
  cooldowns: 5
};
module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID, messageID);
  }

  const groups = readGroupsData();
  if (groups.length === 0) {
    return api.sendMessage("Hiện tại bot không tham gia nhóm nào.", threadID, messageID);
  }

  try {
    let infoMessage = "Thông tin các nhóm:\n";
    for (const group of groups) {
      const groupThreadID = group.threadID;
      if (!groupThreadID) {
        continue; 
      }
      try {
        const threadInfo = await api.getThreadInfo(groupThreadID);
        if (!threadInfo) {
          infoMessage += `- Tên nhóm: Không tìm thấy thông tin\n- ID nhóm: ${groupThreadID}\n\n`;
          continue;
        }
        const groupName = threadInfo.name;
        const memberCount = threadInfo.participantIDs.length;
        infoMessage += `- Tên nhóm: ${groupName}\n- ID nhóm: ${groupThreadID}\n- Số thành viên: ${memberCount}\n\n`;
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin nhóm với ID ${groupThreadID}:`, error);
        infoMessage += `- Tên nhóm: Không thể lấy thông tin\n- ID nhóm: ${groupThreadID}\n\n`;
      }
    }
    return api.sendMessage(infoMessage, threadID, messageID);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhóm:", error);
    return api.sendMessage("Đã xảy ra lỗi khi lấy thông tin nhóm.", threadID, messageID);
  }
};
