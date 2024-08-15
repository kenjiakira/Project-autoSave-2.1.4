const { randomInt } = require('crypto');

module.exports.config = {
    name: "work",
    version: "1.7.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Làm việc để kiếm xu.",
    commandCategory: "game",
    usePrefix: true,
    usages: "[công việc]",
    cooldowns: 0
};

module.exports.run = async ({ api, event, Currencies, Users }) => {
    const { threadID, messageID, senderID } = event;
    const lastWorkTime = global.lastWorkTime || {};
    const currentTime = Date.now();

    if (lastWorkTime[senderID] && currentTime - lastWorkTime[senderID] < 450000) { 
        const remainingTime = Math.ceil((450000 - (currentTime - lastWorkTime[senderID])) / 1000);
        return api.sendMessage(`⏳ Vui lòng đợi ${remainingTime} giây trước khi làm việc lại.`, threadID, messageID);
    }
    lastWorkTime[senderID] = currentTime;
    global.lastWorkTime = lastWorkTime;

    const jobs = [
        { name: "Gặt lúa 🌾", minReward: 1000, maxReward: 3000, type: "grain" },
        { name: "Lái xe tải 🚚", minReward: 1500, maxReward: 4000, type: "truck" },
        { name: "Giao hàng 📦", minReward: 2000, maxReward: 5000, type: "delivery" },
        { name: "Grab 🚖", minReward: 1000, maxReward: 3500, type: "grab" }
    ];

    const userData = await Users.getData(senderID);
    const userName = userData.name;
    const job = jobs[randomInt(0, jobs.length)];
    const reward = randomInt(job.minReward, job.maxReward + 1);

    if (job.type === "grain") {
        const grainTypes = [
            { name: "Gạo ST24", sellPricePerBag: 60 },
            { name: "Gạo ST25", sellPricePerBag: 70 },
            { name: "Gạo Tám Xoan", sellPricePerBag: 80 },
            { name: "Gạo Bắc Thơm", sellPricePerBag: 90 },
            { name: "Gạo Jasmine", sellPricePerBag: 60 },
            { name: "Gạo Basmati", sellPricePerBag: 70 },
            { name: "Gạo Hương Lài", sellPricePerBag: 80 },
            { name: "Gạo Cẩm", sellPricePerBag: 90 },
            { name: "Gạo Tẻ Sữa", sellPricePerBag: 60 },
            { name: "Gạo Ghi Lê", sellPricePerBag: 70 },
            { name: "Gạo Tám thơm", sellPricePerBag: 80 },
            { name: "Gạo Ba Vì", sellPricePerBag: 90 },
            { name: "Gạo Bao Thai", sellPricePerBag: 60 },
            { name: "Gạo Thái Bình", sellPricePerBag: 70 },
            { name: "Gạo Tám Lúa", sellPricePerBag: 80 },
            { name: "Gạo Lúa Vàng", sellPricePerBag: 90 }
        ];

        const grainType = grainTypes[randomInt(0, grainTypes.length)];
        const bagsOfGrain = randomInt(10, 21);
        const totalSellPrice = bagsOfGrain * grainType.sellPricePerBag;
        await Currencies.increaseMoney(senderID, totalSellPrice);

        const response = `${userName} đã thu về ${bagsOfGrain} bao ${grainType.name} và bán được ${totalSellPrice} xu! 🌾💵`;
        api.sendMessage(response, threadID, messageID);
        return;
    }

    if (job.type === "truck") {
        const truckEvents = [
            { description: "trái cây 🍎", minReward: 300, maxReward: 700 },
            { description: "hàng 📦", minReward: 400, maxReward: 800 },
            { description: "đồ nội thất 🛋️", minReward: 500, maxReward: 900 },
            { description: "vật liệu xây dựng 🧱", minReward: 600, maxReward: 1000 },
            { description: "thực phẩm đông lạnh ❄️", minReward: 600, maxReward: 1000 },
            { description: "khoáng sản ⛏️", minReward: 600, maxReward: 1000 },
            { description: "rau củ 🥦", minReward: 600, maxReward: 1000 },
            { description: "gạo 🌾", minReward: 600, maxReward: 1000 }
        ];

        const truckEvent = truckEvents[randomInt(0, truckEvents.length)];
        const eventReward = randomInt(truckEvent.minReward, truckEvent.maxReward + 1);
        const totalReward = reward + eventReward;
        await Currencies.increaseMoney(senderID, totalReward);

        const response = `${userName} đã lái xe tải và kiếm được ${reward} xu! 🚚 Trên đường, ${userName} còn chở thêm ${truckEvent.description} và kiếm được thêm ${eventReward} xu! Tổng cộng ${totalReward} xu.`;
        api.sendMessage(response, threadID, messageID);
        return;
    }

    if (job.type === "delivery") {
        const deliveredPackages = randomInt(20, 41);
        const earnPerPackage = randomInt(10, 50);
        const deliveryReward = deliveredPackages * earnPerPackage;
        const totalReward = reward + deliveryReward;
        await Currencies.increaseMoney(senderID, totalReward);

        const response = `${userName} đã giao ${deliveredPackages} đơn và kiếm được ${deliveryReward} xu! 📦💵 Tổng cộng ${totalReward} xu.`;
        api.sendMessage(response, threadID, messageID);
        return;
    }

    if (job.type === "grab") {
        const passengers = randomInt(10, 21);
        const earnPerPassenger = randomInt(50, 150);
        const grabReward = passengers * earnPerPassenger;
        const totalReward = reward + grabReward;
        await Currencies.increaseMoney(senderID, totalReward);

        const response = `${userName} làm Grab và đã chở ${passengers} khách kiếm được ${grabReward} xu! 🚖💵 Tổng cộng ${totalReward} xu.`;
        api.sendMessage(response, threadID, messageID);
        return;
    }

    await Currencies.increaseMoney(senderID, reward);
    const randomEvents = [
        { description: "còn nhặt được 💰", minReward: 100, maxReward: 500 },
        { description: "còn tìm thấy 🏆", minReward: 200, maxReward: 600 },
        { description: "còn thấy 💵", minReward: 300, maxReward: 700 }
    ];

    const randomEvent = randomEvents[randomInt(0, randomEvents.length)];
    const foundMoney = randomInt(randomEvent.minReward, randomEvent.maxReward + 1);
    await Currencies.increaseMoney(senderID, foundMoney);

    const response = `${userName} đã làm công việc "${job.name}" và kiếm được ${reward} xu! 🎉\nTrên đường về, ${userName} ${randomEvent.description} ${foundMoney} xu! 💵`;
    api.sendMessage(response, threadID, messageID);
};
