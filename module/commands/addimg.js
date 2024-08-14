const fs = require('fs');
const path = require('path');
const imgurClientId = '367d09e2357ee13';

module.exports.config = {
    name: "addimg",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "lệnh admin",
    commandCategory: "Admin",
    usePrefix: true,
    usages: "Gửi ảnh để thêm vào danh sách",
    cooldowns: 5
};

const imagePath = path.join(__dirname, 'URLIMGUR', 'imgur_urls.json');

function readOrCreateData() {
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, JSON.stringify([]), 'utf8');
    }
    const rawData = fs.readFileSync(imagePath);
    let data;
    try {
        data = JSON.parse(rawData);
        if (!Array.isArray(data)) {
            data = [];
        }
    } catch (error) {
        data = [];
    }
    return data;
}

module.exports.run = async ({ api, event }) => {
    const { senderID, threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage("Vui lòng reply với ít nhất một ảnh để thêm vào danh sách.", threadID, messageID);
    }

    const imageUrls = messageReply.attachments
        .filter(attachment => attachment.type === 'photo')
        .map(attachment => attachment.url);

    if (imageUrls.length === 0) {
        return api.sendMessage("Không có ảnh hợp lệ được đính kèm.", threadID, messageID);
    }

    try {
        const data = readOrCreateData();
        imageUrls.forEach(url => data.push(url));
        fs.writeFileSync(imagePath, JSON.stringify(data, null, 2), 'utf8');
        return api.sendMessage(`Đã thêm ${imageUrls.length} URL ảnh vào danh sách.`, threadID, messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage("Có lỗi xảy ra khi thêm URL ảnh.", threadID, messageID);
    }
};
