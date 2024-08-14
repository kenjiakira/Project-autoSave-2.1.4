const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'json', 'farm.json');

const plants = [
    { name: "lúa", growthTime: 5000, reward: 2000 }, 
    { name: "ngô", growthTime: 5000, reward: 2000 },
    { name: "Cà chua", growthTime: 5000, reward: 3000 }, 
    { name: "Cà rốt", growthTime: 5000, reward: 4000 }, 
    { name: "Nho", growthTime: 5000, reward: 5000 } 
];

if (!fs.existsSync(imagePath)) {
    fs.writeFileSync(imagePath, JSON.stringify({}));
}

module.exports.config = {
    name: "farm",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "Trồng cây để kiếm xu(đang update)",
    commandCategory: "Kiếm Tiền",
    usePrefix: true,
    cooldowns: 0,
    update: true
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { senderID, threadID, body } = event;
    const args = body.trim().split(' ');

    try {
        const farmData = JSON.parse(fs.readFileSync(imagePath, 'utf8'));
        const userFarm = farmData[senderID] || {};

        const plantName = args.slice(1).join(' ');
        const plant = plants.find(p => p.name.toLowerCase() === plantName.toLowerCase());

        if (!plant && args[1] !== "thuhoach" && args[1] !== "kiemtra") {
            api.sendMessage(`Lệnh farm có các chức năng sau:
- "farm <tên cây>": để trồng cây.
- "farm thuhoach": để thu hoạch cây đã trồng.
- "farm kiemtra": để kiểm tra thời gian còn lại của cây đã trồng.`, threadID);
            return;
        }

        if (plant) {
          
            const plantedTypes = Object.keys(userFarm).length;
            if (plantedTypes >= 2) {
                api.sendMessage(`Bạn chỉ có thể trồng tối đa 2 loại cây. Hãy thu hoạch cây đã trồng trước khi trồng thêm.`, threadID);
                return;
            }

          
            if (userFarm[plantName]) {
                api.sendMessage(`Bạn đã trồng loại cây "${plantName}" rồi. Vui lòng thu hoạch cây này trước khi trồng lại.`, threadID);
                return;
            }

            const currentTime = Date.now();
            userFarm[plantName] = currentTime + plant.growthTime;
            farmData[senderID] = userFarm;
            fs.writeFileSync(imagePath, JSON.stringify(farmData, null, 2));

            const growthMinutes = Math.ceil(plant.growthTime / 60000);

            api.sendMessage(`Bạn đã trồng cây "${plantName}". Cần đợi ${growthMinutes} phút để thu hoạch.`, threadID);
        } else if (args[1] === "thuhoach") {
            const currentTime = Date.now();
            let totalReward = 0;
            let harvestedPlants = [];

            for (const plantName in userFarm) {
                if (currentTime >= userFarm[plantName]) {
                    const plant = plants.find(p => p.name === plantName);
                    if (plant) {
                        totalReward += plant.reward;
                        harvestedPlants.push(plantName);
                        delete userFarm[plantName];
                    }
                }
            }

            farmData[senderID] = userFarm;
            fs.writeFileSync(imagePath, JSON.stringify(farmData, null, 2));

            if (harvestedPlants.length > 0) {
                await Currencies.increaseMoney(senderID, totalReward);
                api.sendMessage(`Bạn đã thu hoạch được: ${harvestedPlants.join(', ')} và nhận được ${totalReward} xu.`, threadID);
            } else {
                api.sendMessage("Hiện tại không có cây nào để thu hoạch.", threadID);
            }
        } else if (args[1] === "kiemtra") {
            const currentTime = Date.now();
            let statusMessage = "Tình trạng cây trồng:\n";

            let hasPlants = false;

            for (const plantName in userFarm) {
                const plant = plants.find(p => p.name === plantName);
                if (plant) {
                    const endTime = userFarm[plantName];
                    const timeLeft = endTime - currentTime;

                    if (timeLeft > 0) {
                        const minutesLeft = Math.floor(timeLeft / 60000);
                        statusMessage += `- ${plantName}: Còn ${minutesLeft} phút để thu hoạch.\n`;
                        hasPlants = true;
                    } else {
                        statusMessage += `- ${plantName}: Đã đến thời gian thu hoạch.\n`;
                        hasPlants = true;
                    }
                }
            }

            if (!hasPlants) {
                statusMessage = "Bạn không có cây nào đang trồng.";
            }

            api.sendMessage(statusMessage, threadID);
        } else {
            api.sendMessage(`Lệnh không hợp lệ. Vui lòng sử dụng "farm <tên cây>", "farm thuhoach" hoặc "farm kiemtra".`, threadID);
        }
    } catch (e) {
        console.error(e);
        api.sendMessage("Có lỗi xảy ra trong quá trình thực hiện lệnh farm. Vui lòng thử lại sau.", threadID);
    }
};
