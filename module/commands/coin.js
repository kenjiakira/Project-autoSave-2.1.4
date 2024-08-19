const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');

Chart.defaults.color = '#ffffff';

const minCoinValue = 80;
const maxCoinValue = 110;
const cooldowns = new Map();
const maxCoinsPerTransaction = 100000; 
const maxCoinsBuyPerTransaction = 10000; 
const transactionWaitTime = 1 * 60 * 1000;
let coinValue = Math.floor(Math.random() * (maxCoinValue - minCoinValue + 1)) + minCoinValue;
let previousCoinValue = coinValue;

const historicalData = Array.from({ length: 60 }, () => Math.floor(Math.random() * (maxCoinValue - minCoinValue + 1)) + minCoinValue);

function getVietnamTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = new Date(utc + (7 * 3600000)); 
    return vnTime;
}

function generateCoinChart() {
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const reversedLabels = Array.from({ length: 60 }, (_, i) => `${60 - i} phút trước`);
    const reversedData = historicalData.slice().reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: reversedLabels,
            datasets: [{
                label: 'Giá trị 1 Coin/Xu',
                data: reversedData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff'
                    }
                },
                title: {
                    display: true,
                    text: 'GIÁ TRỊ COIN TRONG 60 PHÚT GẦN NHẤT',
                    color: '#ffffff'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Thời Gian',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Giá Trị (Xu)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            },
            elements: {
                line: {
                    borderColor: '#00ff00',
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });

    const buffer = canvas.toBuffer('image/png');
    const chartPath = path.join(__dirname, 'cache', 'coin_chart.png');
    fs.writeFileSync(chartPath, buffer);

    return chartPath;
}

function roundToTwoDecimalPlaces(value) {
    return Math.round(value * 100) / 100;
}

async function updateCoinValue() {
    const baseChange = Math.floor(Math.random() * (5 - (-5) + 1)) - 5;
    const adjustedChange = Math.floor(previousCoinValue * baseChange / 100);
    coinValue = Math.max(minCoinValue, Math.min(maxCoinValue, roundToTwoDecimalPlaces(previousCoinValue + adjustedChange)));

    previousCoinValue = coinValue;

    historicalData.shift();
    historicalData.push(coinValue);
}

function isTradingAllowed() {
    const now = getVietnamTime();
    const hours = now.getHours();
    return hours >= 6 && hours < 23;
}

function isTransactionAllowed(userID, transactionType) {
    const now = getVietnamTime();
    const currentHour = now.getHours();

    let userCooldown = cooldowns.get(userID);
    if (!userCooldown) {
        userCooldown = { buy: [], sell: [], lastTransaction: 0, lastTransactionType: '' };
    }

    const timeSinceLastTransaction = now.getTime() - userCooldown.lastTransaction;

    if (timeSinceLastTransaction < transactionWaitTime && userCooldown.lastTransactionType === transactionType) {
        console.log(`Bạn phải chờ thêm ${Math.ceil((transactionWaitTime - timeSinceLastTransaction) / 1000)} giây trước khi thực hiện giao dịch ${transactionType} tiếp theo.`);
        return false;
    }

    userCooldown.lastTransaction = now.getTime();
    userCooldown.lastTransactionType = transactionType;

    cooldowns.set(userID, userCooldown);
    return true;
}

function updateChartEveryMinute() {
    setInterval(async () => {
        await updateCoinValue();
        generateCoinChart();
    }, 60000);
}

updateChartEveryMinute();

module.exports.config = {
    name: "coin",
    version: "2.2.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Đào coin để kiếm xu",
    commandCategory: "game",
    usePrefix: true,
    usages: `
        .coin - Xem biểu đồ giá trị coin trong 60 phút gần nhất và giá coin hiện tại.
        .coin buy <số lượng> - Mua coin với số lượng chỉ định. Tối đa ${maxCoinsBuyPerTransaction.toLocaleString()} coin mỗi giao dịch.
        .coin sell <số lượng> - Bán coin với số lượng chỉ định. Tối đa ${maxCoinsPerTransaction.toLocaleString()} coin mỗi giao dịch.
        .coin mine - Đào coin để kiếm thêm coin. Có thời gian chờ giữa các lần đào.
    `,
    cooldowns: 0,
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { senderID, threadID } = event;
    const args = event.body.trim().split(' ');

    try {
        if (args[1] === 'buy') {
            if (!isTradingAllowed()) {
                return api.sendMessage("🕒 Bạn chỉ có thể mua coin từ 6 giờ sáng đến 11 giờ tối hàng ngày", threadID);
            }

            const quantity = parseInt(args[2]);

            if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > maxCoinsBuyPerTransaction) { 
                return api.sendMessage(`Vui lòng nhập số lượng coin hợp lệ để mua (tối đa ${maxCoinsBuyPerTransaction.toLocaleString()} coin).`, threadID);
            }

            if (!isTransactionAllowed(senderID, 'buy')) {
                return api.sendMessage("⏳ Bạn cần chờ thêm trước khi thực hiện giao dịch mua tiếp theo.", threadID);
            }

            const data = await Currencies.getData(senderID);
            const currentMoney = data.money || 0;
            let totalCost = roundToTwoDecimalPlaces(quantity * coinValue);

            let fee = 0;
            if (quantity < 100) {
                fee = totalCost * 0.01; 
            } else {
                fee = totalCost * 0.03;
            }
            fee = roundToTwoDecimalPlaces(fee);
            totalCost += fee;

            if (totalCost > currentMoney) {
                const moneyNeeded = roundToTwoDecimalPlaces(totalCost - currentMoney);
                return api.sendMessage(`Bạn không có đủ xu để mua ${quantity.toLocaleString()} coin.\nBạn cần thêm ${moneyNeeded.toLocaleString()} xu để thực hiện giao dịch này.`, threadID);
            }

            const newMoney = roundToTwoDecimalPlaces(currentMoney - totalCost);
            await Currencies.setData(senderID, { money: newMoney });

            const currentCoins = data.coins || 0;
            const newCoins = currentCoins + quantity;
            await Currencies.setData(senderID, { coins: newCoins });

            return api.sendMessage(`📌 Bạn đã mua thành công ${quantity.toLocaleString()} coin với giá ${totalCost.toLocaleString()} xu (bao gồm phí giao dịch).\nSố coin hiện tại của bạn: ${newCoins.toLocaleString()} coin.`, threadID);
        } else if (args[1] === 'sell') {
            if (!isTradingAllowed()) {
                return api.sendMessage("🕒 Bạn chỉ có thể bán coin từ 6 giờ sáng đến 11 giờ tối hàng ngày", threadID);
            }

            const quantity = parseInt(args[2]);

            if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > maxCoinsPerTransaction) {
                return api.sendMessage(`Vui lòng nhập số lượng coin hợp lệ để bán (tối đa ${maxCoinsPerTransaction.toLocaleString()} coin).`, threadID);
            }

            if (!isTransactionAllowed(senderID, 'sell')) {
                return api.sendMessage("⏳ Bạn cần chờ thêm trước khi thực hiện giao dịch bán tiếp theo.", threadID);
            }

            const data = await Currencies.getData(senderID);
            const currentCoins = data.coins || 0;

            if (quantity > currentCoins) {
                return api.sendMessage(`Bạn không có đủ ${quantity.toLocaleString()} coin để thực hiện giao dịch bán này.`, threadID);
            }

            const earnings = roundToTwoDecimalPlaces(quantity * coinValue);
            const newCoins = currentCoins - quantity;
            await Currencies.setData(senderID, { coins: newCoins });

            const newMoney = (data.money || 0) + earnings;
            await Currencies.setData(senderID, { money: newMoney });

            return api.sendMessage(`📌 Bạn đã bán thành công ${quantity.toLocaleString()} coin với giá ${earnings.toLocaleString()} xu.\nSố coin còn lại của bạn: ${newCoins.toLocaleString()} coin.`, threadID);
        } else if (args[1] === 'mine') {
            const userCooldown = cooldowns.get(senderID) || {};
            const now = Date.now();

            if (userCooldown.mine && (now - userCooldown.mine) < transactionWaitTime) {
                const remainingTime = Math.ceil((transactionWaitTime - (now - userCooldown.mine)) / 1000);
                return api.sendMessage(`⏳ Bạn phải chờ thêm ${remainingTime} giây trước khi có thể đào coin tiếp.`, threadID);
            }

            const data = await Currencies.getData(senderID);
            const coinsMined = Math.floor(Math.random() * (10 - 5 + 1)) + 5; 
            const newCoins = (data.coins || 0) + coinsMined;

            await Currencies.setData(senderID, { coins: newCoins });
            cooldowns.set(senderID, { ...userCooldown, mine: now });

            return api.sendMessage(`🎉 Bạn đã đào được ${coinsMined.toLocaleString()} coin!\nSố coin hiện tại của bạn: ${newCoins.toLocaleString()} coin.`, threadID);
        } else {
            const chartPath = await generateCoinChart();
            const message = `📊 Biểu đồ giá trị coin trong 60 phút gần nhất:\nHiện tại 1 coin có giá ${coinValue.toLocaleString()} xu.\n\n` +
                `Lệnh:\n` +
                `.coin buy <số lượng> - Mua coin với số lượng chỉ định. Tối đa ${maxCoinsBuyPerTransaction.toLocaleString()} coin mỗi giao dịch.\n` +
                `.coin sell <số lượng> - Bán coin với số lượng chỉ định. Tối đa ${maxCoinsPerTransaction.toLocaleString()} coin mỗi giao dịch.\n` +
                `.coin mine - Đào coin để kiếm thêm coin. Có thời gian chờ giữa các lần đào.`;

            await api.sendMessage({
                body: message,
                attachment: fs.createReadStream(chartPath)
            }, threadID);
        }
    } catch (error) {
        console.error(error);
        return api.sendMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.", threadID);
    }
};
