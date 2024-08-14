const fs = require('fs');
const path = require('path');

const playerDataPath = path.join(__dirname, '../../json/playerData.json');

// Hàm tải dữ liệu người chơi
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

function battleMonster(playerData) {
    const monsters = [
        { name: "Goblin", health: 50, reward: 20 },
        { name: "Orc", health: 80, reward: 40 },
        { name: "Dragon", health: 150, reward: 100 }
    ];

    const monster = monsters[Math.floor(Math.random() * monsters.length)];
    const playerStrength = playerData.strength || 10;
    const isVictory = playerStrength >= monster.health;

    if (isVictory) {
        playerData.gold += monster.reward;
        return {
            result: "Chiến thắng",
            message: `Bạn đã đánh bại ${monster.name}!\n\n` +
                     `🏆 Bạn nhận được ${monster.reward} vàng!\n` +
                     `💰 Vàng hiện tại của bạn: ${playerData.gold}`
        };
    } else {
        playerData.health -= 20; // Giảm sức khỏe khi thua
        if (playerData.health <= 0) {
            playerData.health = 0;
            return {
                result: "Thua",
                message: `Bạn đã bị đánh bại bởi ${monster.name}.\n` +
                         `Bạn không còn sức khỏe để tiếp tục cuộc phiêu lưu.`
            };
        }
        return {
            result: "Thua",
            message: `Bạn đã bị đánh bại bởi ${monster.name}.\n\n` +
                     `❤️ Sức khỏe hiện tại của bạn: ${playerData.health}`
        };
    }
}

module.exports.config = {
    name: "battle",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Tham gia trận chiến với quái vật.",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .battle",
    cooldowns: 10, // Thời gian giữa các lần sử dụng lệnh (giây)
};

module.exports.run = async ({ event, api }) => {
    const { senderID, threadID } = event;

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        return api.sendMessage("Bạn chưa khởi tạo nhân vật. Hãy bắt đầu cuộc phiêu lưu trước khi tham gia chiến đấu.", threadID);
    }

    const battleResult = battleMonster(playerData);

    savePlayerData(senderID, playerData);

    api.sendMessage(battleResult.message, threadID);
};
