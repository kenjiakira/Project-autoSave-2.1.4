const fs = require('fs');
const path = require('path');

const playerDataPath = path.join(__dirname, '../../json/playerData.json');
const questsPath = path.join(__dirname, '../../json/quests.json');

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

function loadQuests() {
    if (fs.existsSync(questsPath)) {
        return JSON.parse(fs.readFileSync(questsPath, 'utf8'));
    }
    return { quests: [] };
}

function checkAndCompleteQuests(playerData) {
    const quests = loadQuests().quests;
    let completedQuestIds = playerData.quests.map(q => q.id);

    quests.forEach(quest => {
        if (!completedQuestIds.includes(quest.id) && !playerData.quests.some(q => q.id === quest.id && q.isCompleted)) {
            if (quest.goal.type === 'strength' && playerData.strength >= quest.goal.value) {
                playerData.gold += quest.reward.gold;
                playerData.quests.push({
                    id: quest.id,
                    name: quest.name,
                    isCompleted: true
                });

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
                playerData.quests.push({
                    id: quest.id,
                    name: quest.name,
                    isCompleted: true
                });

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

function exploreArea(playerData) {
    const areas = [
        {
            name: "Rừng Rậm",
            description: "Một khu rừng rậm rạp với nhiều cây cối và động vật hoang dã.",
            goldReward: 10,
            healthLoss: 5
        },
        {
            name: "Hang Động",
            description: "Một hang động sâu và tối tăm, chứa nhiều kho báu và mối nguy hiểm.",
            goldReward: 20,
            healthLoss: 10
        },
        {
            name: "Thị Trấn",
            description: "Một thị trấn yên bình với nhiều cửa hàng và người dân.",
            goldReward: 0,
            healthLoss: 0
        }
    ];

    const area = areas[Math.floor(Math.random() * areas.length)];

    playerData.gold += area.goldReward;
    playerData.health -= area.healthLoss;

    if (playerData.health <= 0) {
        playerData.health = 0;
        savePlayerData(playerData.id, playerData);
        return {
            result: "Thua",
            message: `Bạn đã khám phá khu vực "${area.name}" và bị thương nặng. Bạn không thể tiếp tục cuộc phiêu lưu!`
        };
    }

    playerData.explorationCount = (playerData.explorationCount || 0) + 1;
    checkAndCompleteQuests(playerData);

    savePlayerData(playerData.id, playerData);

    return {
        result: "Khám Phá Thành Công",
        message: `Bạn đã khám phá khu vực "${area.name}"!\n\n` +
                 `${area.description}\n` +
                 `💰 Bạn đã nhận được ${area.goldReward} vàng và mất ${area.healthLoss} điểm sức khỏe.\n\n` +
                 `Sức khỏe hiện tại của bạn: ${playerData.health}\n` +
                 `Vàng hiện tại của bạn: ${playerData.gold}`
    };
}

module.exports.config = {
    name: "explore",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Khám phá các khu vực trong thế giới trò chơi.",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .explore",
    cooldowns: 10,
};

module.exports.run = async ({ event, api }) => {
    const { senderID, threadID } = event;

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        return api.sendMessage("Bạn chưa khởi tạo nhân vật. Hãy bắt đầu cuộc phiêu lưu trước khi khám phá thế giới.", threadID);
    }

    const exploreResult = exploreArea(playerData);

    api.sendMessage(exploreResult.message, threadID);
};
