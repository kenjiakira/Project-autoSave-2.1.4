const fs = require('fs');
const path = require('path');
const axios = require('axios');
const groupsPath = path.join(__dirname, '../../module/commands/noti/groups.json');
const bannedGroupsPath = path.join(__dirname, '../../module/commands/noti/bannedGroups.json');
const notiPath = path.join(__dirname, 'cache', 'noti');

function readOrCreateFile(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf8');
    }
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

function saveToFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

async function updateGroupName(threadID, api) {
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.name;
        let groups = readOrCreateFile(groupsPath);

        groups = groups.map(group => {
            if (group.threadID === threadID) {
                return { ...group, name: groupName };
            }
            return group;
        }).filter(group => group.name !== null);

        saveToFile(groupsPath, groups);
    } catch (error) {
        console.error(`Lỗi khi cập nhật tên nhóm: ${error}`);
    }
}

module.exports.config = {
    name: "noti",
    version: "2.0.0",
    hasPermission: 2,
    credits: "HNT",
    description: "lệnh admin",
    commandCategory: "admin",
    usePrefix: true,
    usages: "noti [nội dung]",
    cooldowns: 0
};

module.exports.run = async function({ event, api, args }) {
    const { threadID, messageID, senderID, messageReply } = event;

    if (!global.config.ADMINBOT.includes(senderID)) {
        return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID, messageID);
    }

    const messageContent = args.join(" ");
    const groups = readOrCreateFile(groupsPath);
    const bannedGroups = readOrCreateFile(bannedGroupsPath);

    if (!messageContent && !messageReply) {
        return api.sendMessage("Vui lòng nhập nội dung tin nhắn hoặc trả lời một ảnh hoặc video để gửi.", threadID, messageID);
    }

    const notificationMessage = `${messageContent || ""}`;

    const filteredGroups = groups.filter(group => !bannedGroups.includes(group.threadID));

    if (messageReply) {
        const attachments = messageReply.attachments || [];

        if (attachments.length > 0) {
            const { type, url } = attachments[0];

            if (type === 'video') {
                const tempVideoPath = path.join(notiPath, 'temp_video.mp4');
                ensureDirectoryExistence(tempVideoPath);

                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(tempVideoPath, response.data);

                    let sentCount = 0;
                    for (const group of filteredGroups) {
                        try {
                            await api.sendMessage({ body: notificationMessage, attachment: fs.createReadStream(tempVideoPath) }, group.threadID);
                            sentCount++;
                        } catch (error) {
                            console.error(`Lỗi khi gửi video đến nhóm ${group.threadID}:`, error);
                        }
                    }

                    fs.unlinkSync(tempVideoPath);

                    return api.sendMessage(`Đã gửi video đến ${sentCount} nhóm.`, threadID, messageID);
                } catch (error) {
                    return api.sendMessage("Đã xảy ra lỗi khi tải video.", threadID, messageID);
                }
            }

            if (type === 'photo') {
                const tempImagePath = path.join(notiPath, 'temp_image.jpg');
                ensureDirectoryExistence(tempImagePath);

                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(tempImagePath, response.data);

                    let sentCount = 0;
                    for (const group of filteredGroups) {
                        try {
                            await api.sendMessage({ body: notificationMessage, attachment: fs.createReadStream(tempImagePath) }, group.threadID);
                            sentCount++;
                        } catch (error) {
                            console.error(`Lỗi khi gửi ảnh đến nhóm ${group.threadID}:`, error);
                        }
                    }

                    fs.unlinkSync(tempImagePath);

                    return api.sendMessage(`Đã gửi ảnh đến ${sentCount} nhóm.`, threadID, messageID);
                } catch (error) {
                    return api.sendMessage("Đã xảy ra lỗi khi tải ảnh.", threadID, messageID);
                }
            }
        } else {
            return api.sendMessage("Không tìm thấy đính kèm hợp lệ trong tin nhắn trả lời.", threadID, messageID);
        }
    } else {
        if (filteredGroups.length === 0) {
            return api.sendMessage("Hiện tại bot không tham gia nhóm nào hoặc tất cả các nhóm đều bị cấm.", threadID, messageID);
        }

        let sentCount = 0;
        for (const group of filteredGroups) {
            try {
                await api.sendMessage(notificationMessage, group.threadID);
                sentCount++;
            } catch (error) {
                console.error(`Lỗi khi gửi tin nhắn đến nhóm ${group.threadID}:`, error);
            }
        }

        return api.sendMessage(`Đã gửi tin nhắn đến ${sentCount} nhóm.`, threadID, messageID);
    }
};

module.exports.handleEvent = async function({ event, api }) {
    const { threadID } = event;
    let groups = readOrCreateFile(groupsPath);

    if (!groups.find(group => group.threadID === threadID)) {
        groups.push({ threadID, name: null }); // Thêm nhóm với tên null
        saveToFile(groupsPath, groups);
    }

    // Cập nhật tên nhóm và xóa nếu cần
    await updateGroupName(threadID, api);

    return;
};
