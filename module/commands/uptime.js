let botStartTime = Date.now();
const os = require('os');
const moment = require('moment');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

let commandCount = 0;

module.exports.config = {
    name: "uptime",
    version: "1.1.0",
    hasPermission: 0,
    credits: "HNT",
    description: "Xem thời gian bot đã online và thông tin hệ thống.",
    commandCategory: "Hệ thống",
    usages: "uptime",
    usePrefix: false,
    cooldowns: 5
};

function createProgressBar(total, current, length = 17) {
    const filledLength = Math.round((current / total) * length);
    const bar = "█".repeat(filledLength) + "░".repeat(length - filledLength);
    return `[${bar}] ${(current / total * 100).toFixed(2)}%`;
}

async function getPing() {
    try {
        const { stdout } = await execPromise('ping -c 1 google.com');
        const match = stdout.match(/time=(\d+\.\d+) ms/);
        return match ? `${match[1]} ms` : 'N/A';
    } catch {
        return 'N/A';
    }
}

async function getSystemInfo() {
    try {
        const platform = os.platform();
        const arch = os.arch();
        const cpuModel = os.cpus()[0].model;
        const coreCount = os.cpus().length;
        const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2); // GB
        const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2); // GB

        return {
            platform,
            arch,
            cpuModel,
            coreCount,
            freeMemory,
            totalMemory
        };
    } catch {
        return {
            platform: 'N/A',
            arch: 'N/A',
            cpuModel: 'N/A',
            coreCount: 'N/A',
            freeMemory: 'N/A',
            totalMemory: 'N/A'
        };
    }
}

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;

    let currentTime = Date.now();
    let uptime = currentTime - botStartTime;
    let seconds = Math.floor((uptime / 1000) % 60);
    let minutes = Math.floor((uptime / (1000 * 60)) % 60);
    let hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    let days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    let memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    let cpuLoad = os.loadavg()[0].toFixed(2);
    
    const ping = await getPing();
    const systemInfo = await getSystemInfo();

    let uptimeMessage = `⏱️ BOT UPTIME\n`;
    uptimeMessage += `=======================\n`;
    uptimeMessage += `🕒 Thời gian online: ${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây\n`;
    uptimeMessage += `=======================\n`;
    uptimeMessage += `📊 Số lệnh đã thực thi: ${commandCount}\n`;
    uptimeMessage += `💾 Bộ nhớ sử dụng: ${memoryUsage.toFixed(2)} MB\n`;
    uptimeMessage += `⚙️ CPU Load: ${cpuLoad}%\n`;
    uptimeMessage += `🖥️ Hệ điều hành: ${systemInfo.platform} (${systemInfo.arch})\n`;
    uptimeMessage += `🔧 CPU Model: ${systemInfo.cpuModel} (${systemInfo.coreCount} core(s))\n`;
    uptimeMessage += `🧠 Dung lượng bộ nhớ: ${systemInfo.freeMemory} GB (Trên tổng ${systemInfo.totalMemory} GB)\n`;
    
    const maxUptime = 86400000;
    const uptimeBar = createProgressBar(maxUptime, uptime);
    uptimeMessage += `\n📅 Progress đến 24h: ${uptimeBar}\n`;

    return api.sendMessage(uptimeMessage, threadID, messageID);
};

module.exports.handleCommand = function() {
    commandCount++;
};
