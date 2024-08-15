const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "game",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Hiển thị danh sách các trò chơi",
    commandCategory: "tiện ích",
    usePrefix: false,
    usages: "game\n\n" +
            "Hướng dẫn sử dụng:\n" +
            "- `game`: Xem danh sách các trò chơi có sẵn.",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID } = event;

    const commandFiles = fs.readdirSync(path.join(__dirname, '../../module/commands')).filter(file => file.endsWith('.js'));

    const games = commandFiles
        .map(file => require(path.join(__dirname, '../../module/commands', file)))
        .filter(cmd => cmd.config.commandCategory === 'game')
        .map(cmd => `🔹 **${cmd.config.name}**\n   - ${cmd.config.description}`)
        .join('\n\n');

    const message = games.length > 0
        ? `🎮 **Danh sách trò chơi**\n\n${games}\n\n📝 Gõ \`help <tên game>\` để xem hướng dẫn chơi.`
        : "🔍 Không có trò chơi nào hiện có.";

    return api.sendMessage(message, threadID, messageID);
};
