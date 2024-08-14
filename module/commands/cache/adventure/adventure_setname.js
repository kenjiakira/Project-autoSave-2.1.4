const fs = require('fs');
const path = require('path');

const playerDataPath = path.join(__dirname, '../../json/playerData.json');
const nameDataPath = path.join(__dirname, '../../json/usedNames.json');

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
    if (!playerID || !playerData) {
        console.error("ID người chơi hoặc dữ liệu không hợp lệ.");
        return;
    }

    let data = {};
    if (fs.existsSync(playerDataPath)) {
        data = JSON.parse(fs.readFileSync(playerDataPath, 'utf8'));
    }
    data[playerID] = playerData;
    fs.writeFileSync(playerDataPath, JSON.stringify(data, null, 2), 'utf8');
}

// Hàm tải các tên đã sử dụng
function loadUsedNames() {
    if (fs.existsSync(nameDataPath)) {
        return JSON.parse(fs.readFileSync(nameDataPath, 'utf8'));
    }
    return {};
}

// Hàm lưu tên đã sử dụng
function saveUsedName(name) {
    let usedNames = loadUsedNames();
    usedNames[name.toLowerCase()] = true;
    fs.writeFileSync(nameDataPath, JSON.stringify(usedNames, null, 2), 'utf8');
}

// Hàm tạo nhân vật mới
function createNewCharacter(playerID, name) {
    if (!playerID || !name) {
        console.error("ID người chơi hoặc tên không hợp lệ.");
        return null;
    }

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
    savePlayerData(playerID, newCharacter);
    return newCharacter;
}

module.exports.config = {
    name: "setname",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Đặt tên cho nhân vật của bạn.",
    commandCategory: "Adventure",
    usePrefix: true,
    usages: "sử dụng: .setname [tên]",
    cooldowns: 0,
};

module.exports.run = async ({ event, api, args }) => {
    const { senderID, threadID } = event;
    const name = args.join(' ').trim();

    if (!name) {
        return api.sendMessage("Bạn chưa nhập tên! Vui lòng nhập tên cho nhân vật của bạn.", threadID);
    }

    const usedNames = loadUsedNames();
    if (usedNames[name.toLowerCase()]) {
        return api.sendMessage("Tên này đã được sử dụng. Vui lòng chọn tên khác.", threadID);
    }

    let playerData = loadPlayerData(senderID);

    if (playerData) {
        if (playerData.name === "Anh Hùng Vô Danh") {
            // Cập nhật tên cho nhân vật nếu tên hiện tại là mặc định
            playerData.name = name;
            savePlayerData(senderID, playerData);
            saveUsedName(name);
            return api.sendMessage(`Tên nhân vật của bạn đã được đặt thành "${name}". Bạn có thể bắt đầu cuộc phiêu lưu bằng cách sử dụng lệnh \`.start\`.`, threadID);
        } else {
            // Thông báo nếu nhân vật đã có tên khác
            return api.sendMessage("Bạn đã có tên nhân vật. Để thay đổi tên, hãy xóa nhân vật hiện tại và tạo mới.", threadID);
        }
    } else {
        // Nếu không có dữ liệu người chơi, tạo mới với tên mới
        const newCharacter = createNewCharacter(senderID, name);
        saveUsedName(name);

        api.sendMessage(`Tên nhân vật của bạn đã được đặt thành "${name}". Bạn có thể bắt đầu cuộc phiêu lưu bằng cách sử dụng lệnh \`.start\`.`, threadID);
    }
};
