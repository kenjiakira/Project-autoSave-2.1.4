const fs = require('fs');
const path = require('path');

const playerDataPath = path.join(__dirname, '../../json/playerData.json');

function loadPlayerData(playerID) {
    if (fs.existsSync(playerDataPath)) {
        const data = JSON.parse(fs.readFileSync(playerDataPath, 'utf8'));
        return data[playerID] || null;
    }
    return null;
}

function savePlayerData(playerID, playerData) {
    let data = {};
    if (fs.existsSync(playerDataPath)) {
        data = JSON.parse(fs.readFileSync(playerDataPath, 'utf8'));
    }
    data[playerID] = playerData;
    fs.writeFileSync(playerDataPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports.config = {
    name: "train",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Tăng sức mạnh của nhân vật thông qua tập luyện.",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .train",
    cooldowns: 10,
};

module.exports.run = async ({ event, api }) => {
    const { senderID, threadID } = event;

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        return api.sendMessage("Bạn cần có nhân vật trước khi tập luyện. Vui lòng sử dụng lệnh \`.start\` để tạo nhân vật.", threadID);
    }

    if (playerData.gold < 10) {
        return api.sendMessage("Bạn không có đủ vàng để tập luyện. Bạn cần ít nhất 10 vàng.", threadID);
    }

    playerData.strength += 5; 
    playerData.gold -= 1; 

    savePlayerData(senderID, playerData);

    api.sendMessage(`Bạn đã tập luyện và tăng sức mạnh thêm 5 điểm! Sức mạnh hiện tại của bạn là ${playerData.strength}.`, threadID);
};
