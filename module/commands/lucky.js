
const path = require('path');

module.exports.config = {
    name: "lucky",
    version: "0.0.2",
    hasPermission: 2,
    credits: "HungCho",
    description: "Đoán con số may mắn từ 1 đến 5",
    commandCategory: "game",
    usages: "\nGõ lệnh 'lucky' kèm theo số dự đoán của bạn từ 1 đến 5. Ví dụ: lucky 5.\nHệ thống sẽ tạo ra một con số may mắn từ 1 đến 5 ngẫu nhiên.Nếu số dự đoán của bạn khớp với số may mắn, bạn sẽ nhận được một khoản tiền thưởng và số tiền trong tài khoản của bạn sẽ được cộng thêm. Số tiền thưởng và số tiền cộng thêm sẽ được thông báo.Nếu số dự đoán của bạn không khớp với số may mắn, số tiền trong tài khoản của bạn sẽ bị trừ đi một khoản cược",
    usePrefix: true,
    cooldowns: 5,
    dependencies: [],
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.run = async ({ event, api, Currencies, args }) => {
    const { senderID, threadID, messageID } = event;

    const userData = await Currencies.getData(senderID);
    const money = userData.money || 0;
    const betAmount = 500;
    const winAmount = 5000;

    if (money < betAmount) {
        return api.sendMessage("❌ Bạn không có đủ xu để chơi!n\nLưu ý: Thắng sẽ nhận 5000 Xu - thua sẽ trừ 500 xu", threadID, messageID);
    }


    const number = getRandomInt(1, 5);
    const guess = parseInt(args[0]);

    if (isNaN(guess) || guess < 1 || guess > 5) {
        return api.sendMessage("❌ Số dự đoán không hợp lệ! Vui lòng chọn số từ 1 đến 5.", threadID, messageID);
    }

    let resultMessage = `🔮 Con số may mắn là ${number}.\n`;
    let updatedMoney = money;

    if (guess === number) {
        updatedMoney += winAmount;
        await Currencies.setData(senderID, { money: updatedMoney });
        const remainingMoney = updatedMoney.toLocaleString('vi-VN');
        resultMessage += `🎉 Chúc mừng! Bạn đã đoán đúng và nhận được ${winAmount.toLocaleString('vi-VN')} xu.\n💰 Số xu hiện tại của bạn: ${remainingMoney} xu`;
    } else {
        updatedMoney -= betAmount;
        await Currencies.setData(senderID, { money: updatedMoney });
        const remainingMoney = updatedMoney.toLocaleString('vi-VN');
        resultMessage += `❌ Rất tiếc! Bạn đã đoán sai.\n💰 Số xu hiện tại của bạn: ${remainingMoney} xu`;
    }

    return api.sendMessage(resultMessage, threadID, messageID);
};
