const fs = require('fs');
const path = require('path');

const groupsPath = path.join(__dirname, 'noti', 'groups.json');

function readOrCreateData(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
    }
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports.config = {
    name: "nsfw",
    version: "1.0.0",
    hasPermission: 2, 
    credits: "Hoàng Ngọc Từ",
    description: "Cập nhật thuộc tính NSFW cho nhóm",
    commandCategory: "Admin",
    usePrefix: true,
    usages: "nsfw [ID] [on/off]",
    cooldowns: 0
};

module.exports.run = async ({ api, event }) => {
    const { senderID, threadID, body } = event;


    const adminIDs = ['100029043375434', '61561753304881'];
    if (!adminIDs.includes(senderID)) {
        return api.sendMessage("Bạn không có quyền thực hiện lệnh này.", threadID);
    }

    const args = body.trim().split(' ');
    if (args.length < 3) {
        return api.sendMessage("Cú pháp sai. Vui lòng sử dụng: nsfw [ID] [on/off]", threadID);
    }

    const groupID = args[1];
    const status = args[2].toLowerCase();

    if (status !== 'on' && status !== 'off') {
        return api.sendMessage("Trạng thái không hợp lệ. Vui lòng sử dụng 'on' hoặc 'off'.", threadID);
    }

    const nsfwStatus = status === 'on';

    let groupsData = readOrCreateData(groupsPath);
    const groupIndex = groupsData.findIndex(g => g.threadID === groupID);

    if (groupIndex !== -1) {
        groupsData[groupIndex].SNFW = nsfwStatus;
    } else {
   
        groupsData.push({ threadID: groupID, SNFW: nsfwStatus });
    }

    saveData(groupsPath, groupsData);

    return api.sendMessage(`Cập nhật thuộc tính NSFW cho nhóm ID ${groupID} thành công.`, threadID);
};
