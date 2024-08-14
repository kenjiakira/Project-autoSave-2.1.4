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

// Hàm lưu dữ liệu người chơi
function savePlayerData(playerID, playerData) {
    let data = {};
    if (fs.existsSync(playerDataPath)) {
        data = JSON.parse(fs.readFileSync(playerDataPath, 'utf8'));
    }
    data[playerID] = playerData;
    fs.writeFileSync(playerDataPath, JSON.stringify(data, null, 2), 'utf8');
}

// Hàm tạo nhân vật mới với thuộc tính nhiệm vụ khởi tạo
function createNewCharacter(playerID) {
    const newCharacter = {
        name: "Anh Hùng Vô Danh",
        health: 100,
        strength: 10,
        gold: 500,
        inventory: [],
        location: "Làng Khởi Đầu",
        quests: [] // Khởi tạo thuộc tính quests là mảng rỗng
    };
    savePlayerData(playerID, newCharacter);
    return newCharacter;
}

// Hàm hoàn thành nhiệm vụ
function completeQuest(playerData, questId) {
    const questIndex = playerData.quests.findIndex(q => q.id === questId);
    if (questIndex === -1) {
        return "Nhiệm vụ không tồn tại.";
    }

    const quest = playerData.quests[questIndex];
    if (quest.isCompleted) {
        return "Nhiệm vụ này đã được hoàn thành.";
    }

    // Cập nhật nhiệm vụ thành đã hoàn thành
    playerData.quests[questIndex].isCompleted = true;
    savePlayerData(playerData.id, playerData);

    // Thưởng cho người chơi
    playerData.gold += quest.reward;
    savePlayerData(playerData.id, playerData);

    return `Bạn đã hoàn thành nhiệm vụ "${quest.name}" và nhận được ${quest.reward} vàng.`;
}

module.exports.config = {
    name: "quests",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Xem và nhận nhiệm vụ",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .quests hoặc .accept [id]",
    cooldowns: 10,
};

module.exports.run = async ({ event, api, args }) => {
    const { senderID, threadID } = event;

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        return api.sendMessage("Bạn chưa khởi tạo nhân vật. Hãy bắt đầu cuộc phiêu lưu trước khi xem nhiệm vụ.", threadID);
    }

    // Đảm bảo thuộc tính quests đã được khởi tạo
    if (!Array.isArray(playerData.quests)) {
        playerData.quests = [];
    }

    if (args[0] === "accept") {
        const questId = args[1];
        const message = completeQuest(playerData, questId);
        return api.sendMessage(message, threadID);
    }

    const incompleteQuests = playerData.quests.filter(q => !q.isCompleted);

    const questMessage = incompleteQuests.length > 0 ?
        `📜 Nhiệm vụ hiện tại của bạn:\n` +
        `${incompleteQuests.map(q => `- ${q.name}: ${q.description}`).join('\n')}` :
        "Bạn không có nhiệm vụ nào đang thực hiện.";

    api.sendMessage(questMessage, threadID);
};
