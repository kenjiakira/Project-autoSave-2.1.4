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

module.exports.config = {
    name: "status",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Xem tình trạng hiện tại của bạn.",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .status",
    cooldowns: 0,
};

module.exports.run = async ({ event, api }) => {
    const { senderID, threadID } = event;

    let playerData = loadPlayerData(senderID);

    if (!playerData) {
        return api.sendMessage("Bạn chưa có nhân vật. Vui lòng tạo nhân vật trước khi kiểm tra tình trạng.", threadID);
    }

    // Đảm bảo các thuộc tính không bị undefined
    const health = playerData.health || 100;
    const strength = playerData.strength || 10;
    const gold = playerData.gold || 500;
    const inventoryCount = playerData.inventory ? playerData.inventory.length : 0;

    const statusMessage = `🛡️ Tình Trạng Hiện Tại 🛡️\n\n` +
        `📍 Địa điểm hiện tại: ${playerData.location || "Không xác định"}\n` +
        `❤️ Sức khỏe: ${health}\n` +
        `💪 Sức mạnh: ${strength}\n` +
        `💰 Vàng: ${gold}\n` +
        `📦 Túi đồ: ${inventoryCount} món đồ\n\n` +
        "Bạn có thể sử dụng các lệnh khác để tiếp tục cuộc phiêu lưu của mình:\n" +
        "1. Khám phá khu vực: \`.adv explore\`\n" +
        "2. Tham gia chiến đấu: \`.adv battle\`\n" +
        "3. Đặt tên mới: \`.setname [tên]\`";

    api.sendMessage(statusMessage, threadID);
};
