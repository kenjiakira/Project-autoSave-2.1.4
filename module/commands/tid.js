const fs = require('fs');
const path = require('path');
const groupsPath = path.join(__dirname, '../../module/commands/noti/groups.json');

function readOrCreateGroupsData() {
    if (!fs.existsSync(groupsPath)) {
        fs.writeFileSync(groupsPath, JSON.stringify([], null, 4), 'utf8');
    }
    const rawData = fs.readFileSync(groupsPath);
    return JSON.parse(rawData);
}

function saveGroupsData(data) {
    fs.writeFileSync(groupsPath, JSON.stringify(data, null, 4), 'utf8');
}

async function updateGroupName(threadID) {
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.name;
        let groups = readOrCreateGroupsData();

        groups = groups.map(group => {
            if (group.threadID === threadID) {
                return { ...group, name: groupName };
            }
            return group;
        }).filter(group => group.name !== null);

        saveGroupsData(groups);
    } catch (error) {
        console.error(`Lỗi khi cập nhật tên nhóm: ${error}`);
    }
}

module.exports.config = {
  name: "tid",
  version: "1.0.1",
  hasPermission: 0,
  credits: "Akira",
  description: "Lấy TID và thông tin nhóm",
  commandCategory: "Công Cụ",
  usePrefix: true,
  usages: [".tid", ".tid creator"],
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const args = event.body.trim().split(" ");
  const threadID = event.threadID;
  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.name;
  const threadType = threadInfo.threadType;

  let groups = readOrCreateGroupsData();
  if (!groups.find(group => group.threadID === threadID)) {
    groups.push({ threadID, name: groupName });
    saveGroupsData(groups);
  }

  if (args.length === 1) {
    const message = `Thông tin nhóm:\n- Tên nhóm: ${groupName}\n- TID: ${threadID}\n- Loại nhóm: ${threadType}`;
    return api.sendMessage(message, event.threadID);
  }

  const option = args[1].toLowerCase();
  switch (option) {
    case "creator":
      const creatorID = threadInfo.creatorID;
      const creator = await api.getUserInfo(creatorID);
      if (creator && creator[creatorID]) {
        const creatorName = creator[creatorID].name;
        api.sendMessage(`Người tạo nhóm: ${creatorName}`, event.threadID);
      } else {
        api.sendMessage(`Không thể lấy thông tin người tạo nhóm.`, event.threadID);
      }
      break;
    default:
      api.sendMessage("Không có chức năng tuỳ chọn hợp lệ. Vui lòng sử dụng `.tid` hoặc `.tid creator`", event.threadID);
      break;
  }

  await updateGroupName(threadID);
};
