const fs = require('fs');

module.exports.config = {
    name: "data",
    version: "0.0.1",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "lệnh admin",
    commandCategory: "Lệnh Admin",
    usePrefix: true,
    usages: " [Tag]",
    cooldowns: 5,
    info: [
        {
            key: 'Tag',
            prompt: 'Để trống hoặc tag một người nào đó, có thể tag nhiều người',
            type: 'Văn Bản',
            example: '@Mirai-chan'
        }
    ]
};

module.exports.run = async function ({ api, event, args, Currencies }) {
    const adminUIDs = ["100029043375434", ,"61561753304881"];

    if (!adminUIDs.includes(event.senderID)) {
        return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", event.threadID, event.messageID);
    }

    if (!event.messageReply || event.type !== "message_reply") {
        return api.sendMessage("❌ Vui lòng reply tin nhắn của người dùng để thay đổi số tiền!", event.threadID, event.messageID);
    }

    const repliedMessage = event.messageReply;
    const moneySet = parseInt(args[0]);

    if (isNaN(moneySet) || moneySet < 0) {
        return api.sendMessage("❌ Vui lòng nhập một số tiền hợp lệ!", event.threadID, event.messageID);
    }

    const targetUserID = repliedMessage.senderID;
    const targetUserName = repliedMessage.senderID === event.senderID ? "bạn" : `người dùng với ID ${targetUserID}`;

    await Currencies.setData(targetUserID, { money: moneySet });

    return api.sendMessage({
        body: `✅ Đã thay đổi số dư của ${targetUserName} thành ${moneySet} xu`,
        mentions: [
            { tag: targetUserName, id: targetUserID }
        ]
    }, event.threadID, event.messageID);
};
