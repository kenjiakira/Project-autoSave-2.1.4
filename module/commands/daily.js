const moment = require('moment-timezone');
const fs = require('fs');
const request = require('request');
const path = require('path');

const rewardMin = 1000;
const rewardMax = 5000;

module.exports.config = {
    name: "daily",
    version: "1.0.1",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Nhận xu mỗi ngày",
    commandCategory: "Tài Chính",
    usePrefix: true,
    usages: "Nhận xu ngẫu nhiên mỗi ngày",
    cooldowns: 0
};

const getLastDailyClaim = async (userID, Currencies) => {
    const userData = await Currencies.getData(userID);
    return userData.lastDailyClaim || 0;
};

const setLastDailyClaim = async (userID, Currencies) => {
    await Currencies.setData(userID, { lastDailyClaim: Date.now() });
};

const getRandomReward = () => Math.floor(Math.random() * (rewardMax - rewardMin + 1)) + rewardMin;

module.exports.run = async ({ api, event, Currencies, Users }) => {
    const { senderID, threadID } = event;

    const lastClaim = await getLastDailyClaim(senderID, Currencies);
    const now = moment().tz('Asia/Ho_Chi_Minh').startOf('day').valueOf();

    if (lastClaim >= now) {
        return api.sendMessage("Bạn đã nhận thưởng hôm nay rồi. Vui lòng quay lại vào ngày mai.", threadID, event.messageID);
    }

    const reward = getRandomReward();
    await Currencies.increaseMoney(senderID, reward);
    await setLastDailyClaim(senderID, Currencies);

    const userData = await Users.getData(senderID);
    const userName = userData.name || "Người dùng";

 
    const gifUrl = 'https://imgur.com/L3o6ZyM.gif'; 
    const gifPath = path.join(__dirname, 'cache', 'daily_reward.gif');
    request(gifUrl).pipe(fs.createWriteStream(gifPath)).on('close', () => {
        api.sendMessage({
            body: `🎉 Chúc mừng ${userName}! Bạn đã nhận được ${reward} xu hôm nay.\nHãy quay lại vào ngày mai để nhận thưởng tiếp nhé!`,
            attachment: fs.createReadStream(gifPath)
        }, threadID, () => fs.unlinkSync(gifPath), event.messageID);
    });
};
