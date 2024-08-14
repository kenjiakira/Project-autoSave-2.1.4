const fs = require('fs');
const path = require('path');

const playerDataPath = path.join(__dirname, '../../json/playerData.json');
const questsPath = path.join(__dirname, '../../json/quests.json');

// Hàm tải dữ liệu người chơi
function loadPlayerData(playerID) {
    if (fs.existsSync(playerDataPath)) {
        const data = JSON.parse(fs.readFileSync(playerDataPath, 'utf8'));
        const playerData = data[playerID] || null;
        if (playerData && !playerData.quests) {
            playerData.quests = []; // Khởi tạo thuộc tính quests nếu chưa có
            savePlayerData(playerID, playerData);
        }
        return playerData;
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

// Hàm tải nhiệm vụ
function loadQuests() {
    if (fs.existsSync(questsPath)) {
        return JSON.parse(fs.readFileSync(questsPath, 'utf8'));
    }
    return { quests: [] };
}
function createNewCharacter(playerID, name) {
    const newCharacter = {
        name: name, 
        health: 100,
        strength: 10,
        gold: 500,
        inventory: [],
        location: "Làng Khởi Đầu",
        quests: [
            {
                id: "quest1",
                name: "Đạt 100 Sức Mạnh",
                isCompleted: false
            }
        ]
    };
    savePlayerData(playerID, newCharacter); // Lưu dữ liệu người chơi với ID hợp lệ
    return newCharacter;
}

function initializeFirstQuest(playerData) {
    const quests = loadQuests().quests;
    const firstQuest = quests.find(q => q.id === "quest1"); // ID của nhiệm vụ đầu tiên

    if (firstQuest) {
        playerData.quests.push({
            id: firstQuest.id,
            name: firstQuest.name,
            isCompleted: false
        });
        savePlayerData(playerData.id, playerData);
    }
}
function checkAndCompleteQuests(playerData) {
    const quests = loadQuests().quests;
    let completedQuestIds = playerData.quests.filter(q => q.isCompleted).map(q => q.id);

    quests.forEach(quest => {
        if (!completedQuestIds.includes(quest.id) && playerData.quests.some(q => q.id === quest.id && !q.isCompleted)) {
            if (quest.goal.type === 'strength' && playerData.strength >= quest.goal.value) {
                playerData.gold += quest.reward.gold;
                playerData.quests.find(q => q.id === quest.id).isCompleted = true;

                if (quest.nextQuestId) {
                    const nextQuest = quests.find(q => q.id === quest.nextQuestId);
                    if (nextQuest) {
                        playerData.quests.push({
                            id: nextQuest.id,
                            name: nextQuest.name,
                            isCompleted: false
                        });
                    }
                }

                savePlayerData(playerData.id, playerData);
            } else if (quest.goal.type === 'explore' && playerData.explorationCount >= quest.goal.value) {
                playerData.gold += quest.reward.gold;
                playerData.quests.find(q => q.id === quest.id).isCompleted = true;

                if (quest.nextQuestId) {
                    const nextQuest = quests.find(q => q.id === quest.nextQuestId);
                    if (nextQuest) {
                        playerData.quests.push({
                            id: nextQuest.id,
                            name: nextQuest.name,
                            isCompleted: false
                        });
                    }
                }

                savePlayerData(playerData.id, playerData);
            }
        }
    });
}


module.exports.config = {
    name: "start",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Khởi tạo cuộc phiêu lưu mới hoặc tiếp tục cuộc phiêu lưu hiện tại",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .adventure_start",
    cooldowns: 5, 
};
module.exports.run = async ({ event, api }) => {
    const { senderID, threadID } = event;

    if (!senderID) {
        return api.sendMessage("ID người chơi không xác định.", threadID);
    }

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        playerData = createNewCharacter(senderID);
        initializeFirstQuest(playerData); // Khởi tạo nhiệm vụ đầu tiên
        api.sendMessage("Chào mừng bạn đến với cuộc phiêu lưu mới! Bạn đã được khởi tạo với nhân vật mới và nhiệm vụ đầu tiên.", threadID);
    } else if (playerData.name === "Anh Hùng Vô Danh") {
        api.sendMessage("Bạn cần đặt tên cho nhân vật của mình trước khi bắt đầu cuộc phiêu lưu.", threadID);
    } else {
        api.sendMessage("Bạn đã tiếp tục cuộc phiêu lưu của mình.", threadID);

        checkAndCompleteQuests(playerData); // Kiểm tra và hoàn thành nhiệm vụ

        const welcomeMessage = `🛡️ ${playerData.name} 🛡️\n\n` +
            `📍 Địa điểm hiện tại: ${playerData.location}\n` +
            `❤️ Sức khỏe: ${playerData.health}\n` +
            `💪 Sức mạnh: ${playerData.strength}\n` +
            `💰 Vàng: ${playerData.gold}\n\n` +
            `📜 Nhiệm vụ: ${playerData.quests.filter(q => !q.isCompleted).map(q => q.name).join(", ") || "Không có nhiệm vụ nào."}\n\n` +
            "Bạn muốn làm gì tiếp theo?\n" +
            "1. Khám phá khu vực\n" +
            "2. Kiểm tra tình trạng\n" +
            "3. Tham gia chiến đấu\n" +
            "4. Xem nhiệm vụ\n" +
            "5. Nhận nhiệm vụ mới\n" +
            "Hãy nhập lệnh tương ứng: adv explore, adv status, adv battle, adv quests, hoặc adv accept [id].";

        api.sendMessage(welcomeMessage, threadID);
    }
};
