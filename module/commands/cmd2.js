const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "cmd2",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "lệnh Admin",
    commandCategory: "ADMIN",
    usePrefix: true,
    usages: "sử dụng: .cmd2 [load] [tên_lệnh]",
    cooldowns: 0,
};

const loadAdventureCommand = (moduleList, threadID, messageID, api) => {
    const commandDir = path.join(__dirname, 'cache/adventure');
    const errorList = [];

    if (moduleList.includes("all")) {
        moduleList = fs.readdirSync(commandDir)
            .filter(file => file.endsWith('.js'))
            .map(file => file.slice(0, -3));
    }

    moduleList.forEach(nameModule => {
        try {
            const commandPath = path.join(commandDir, `${nameModule}.js`);
            if (!fs.existsSync(commandPath)) {
                errorList.push(`- ${nameModule}: File không tồn tại.`);
                return;
            }
            delete require.cache[require.resolve(commandPath)];
            const command = require(commandPath);
            if (!command || typeof command.run !== 'function') {
                errorList.push(`- ${nameModule}: Lệnh không đúng định dạng hoặc thiếu phương thức run.`);
                return;
            }
            if (!command.config || typeof command.config.name !== 'string') {
                errorList.push(`- ${nameModule}: Cấu hình lệnh không đầy đủ.`);
                return;
            }
            global.client.commands.set(command.config.name, command);
            api.sendMessage(`Đã tải thành công lệnh ${command.config.name}!`, threadID, messageID);
        } catch (error) {
            errorList.push(`- ${nameModule}: ${error.message}`);
        }
    });

    if (errorList.length > 0) {
        api.sendMessage(`Có lỗi xảy ra khi tải các lệnh: \n${errorList.join('\n')}`, threadID, messageID);
    }
};

module.exports.run = async function({ event, args, api }) {
    const { threadID, messageID } = event;
    const allowedAdmins = ["100029043375434", "100092325757607", "61561753304881"];

    if (!allowedAdmins.includes(event.senderID.toString())) {
        return api.sendMessage("Chỉ ADMIN mới có thể sử dụng lệnh này.", threadID, messageID);
    }

    const moduleList = args.splice(1);

    if (moduleList.length === 0) {
        return api.sendMessage("Vui lòng chỉ định tên lệnh cần tải.", threadID, messageID);
    }

    loadAdventureCommand(moduleList, threadID, messageID, api);
};
