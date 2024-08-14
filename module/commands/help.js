const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const commandImagesPath = path.join(__dirname, 'json', 'commandImages.json');
let commandImages = {};

try {
  commandImages = require(commandImagesPath);
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Không tìm thấy file commandImages.json, hãy tạo file với dữ liệu mặc định.');
    fs.writeFileSync(commandImagesPath, JSON.stringify({}));
  } else {
    console.error('Lỗi khi tải file JSON:', error);
  }
}

module.exports.config = {
  name: "help",
  version: "1.4.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Xem danh sách lệnh và lệnh đang được cập nhật",
  commandCategory: "System",
  usePrefix: true,
  usages: ".help [số trang] hoặc .help [tên lệnh]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const cmds = global.client.commands;
  const tid = event.threadID;
  const mid = event.messageID;
  const commandsPerPage = 10;
  const totalPages = Math.ceil(cmds.size / commandsPerPage);
  const page = args[0] && !isNaN(args[0]) ? parseInt(args[0]) : 1;
  const commandName = args[0] && isNaN(args[0]) ? args[0].toLowerCase() : null;

  if (commandName === "all") {
    let allCommands = Array.from(cmds.values());
    let allCommandsList = "Danh sách toàn bộ lệnh có trong hệ thống:\n";
    allCommands.forEach((cmd, index) => {
      const config = cmd.config;
      allCommandsList += `>${index + 1}. ${config.name}: ${config.description}\n`;
    });

    return api.sendMessage(allCommandsList, tid);
  }

  if (commandName) {
    if (!cmds.has(commandName)) {
      return api.sendMessage(`❗ Không tìm thấy lệnh '${commandName}' trong hệ thống.`, tid, mid);
    }

    const cmd = cmds.get(commandName);
    const config = cmd.config;
    const usage = config.usages ? config.usages : "Không có cách sử dụng được cung cấp.";
    const message = `》 ${config.name} 《\n➢ Cách sử dụng:\n ${usage}\n➢ Mô tả:\n ${config.description}\n➢ Tác giả: ${config.credits}\n➢ Phiên bản: ${config.version}\n`;

    let imgUrls = commandImages[commandName];
    if (typeof imgUrls === 'string') {
      imgUrls = [imgUrls];
    } else if (!Array.isArray(imgUrls)) {
      imgUrls = [];
    }

    const pathToSave = path.join(__dirname, "cache");

    if (imgUrls.length > 0) {
      try {
        const imageFiles = await Promise.all(imgUrls.map(async (imgUrl, index) => {
          const filePath = path.join(pathToSave, `image_${index}.png`);
          const downloadIMG = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(filePath, Buffer.from(downloadIMG, "binary"));
          return filePath;
        }));

        const messageObject = {
          body: message,
          attachment: imageFiles.map(file => fs.createReadStream(file))
        };

        return api.sendMessage(messageObject, tid, mid);
      } catch (error) {
        console.error('Lỗi khi tải ảnh:', error);
        return api.sendMessage(`${message}\n❗ Không thể tải ảnh.`, tid, mid);
      }
    } else {
      return api.sendMessage(`${message}\n❗ Không có ảnh chi tiết cho lệnh '${commandName}'.`, tid, mid);
    }
  }

  if (page < 1 || page > totalPages) {
    return api.sendMessage(`❗ Trang không hợp lệ. Vui lòng nhập từ 1 đến ${totalPages}.`, tid, mid);
  }

  const startIndex = (page - 1) * commandsPerPage;
  const endIndex = startIndex + commandsPerPage;
  const commandList = Array.from(cmds.values()).slice(startIndex, endIndex);

  let msg = `===𝗗𝗔𝗡𝗛 𝗦𝗔́𝗖𝗛 𝗟𝗘̣̂𝗡𝗛===\n\n`;
  commandList.forEach((cmd, index) => {
    msg += `\n>${startIndex + index + 1}. ${cmd.config.name}: ${cmd.config.description}\n`;
  });

  let updatingCommands = [];
  cmds.forEach((cmd, name) => {
    if (cmd.config.update) { 
      updatingCommands.push(name); 
    }
  });

  if (updatingCommands.length > 0) {
    msg += `\n𝗟𝗘̣̂𝗡𝗛 Đ𝗔𝗡𝗚 𝗨𝗣𝗗𝗔𝗧𝗘\n`;
    updatingCommands.forEach((cmdName, index) => {
      const cmd = cmds.get(cmdName); 
      msg += `\n>${startIndex + index + 1}. ${cmd.config.name}: ${cmd.config.description}\n`;
    });
  }

  msg += `\n>Tổng Số Lệnh: ${cmds.size}`;
  msg += `\n» Tổng số trang cho 𝗵𝗲𝗹𝗽: ${totalPages}`;
  msg += `\n\n»✅ Gõ 𝗵𝗲𝗹𝗽 [𝘀𝗼̂́ 𝘁𝗿𝗮𝗻𝗴] để xem các lệnh ở trang khác.\n»✅ Gõ 𝗵𝗲𝗹𝗽 [𝘁𝗲̂𝗻 𝗹𝗲̣̂𝗻𝗵] để xem thông tin chi tiết về lệnh.\n»✅ Gõ 𝗵𝗲𝗹𝗽 𝗮𝗹𝗹 để xem toàn bộ lệnh.`;
  msg += `\n\n COPYRIGHT BY ©𝐇𝐍𝐓|2024`;

  const img = [
    "https://i.postimg.cc/KzsW3Wzr/images-86.jpg",
    "https://i.postimg.cc/fLXHkRGZ/c113eb0f980f3e8ee44c1421159dd71cfa6a0950.jpg",
    "https://i.postimg.cc/d0Z6S0td/create-fast-and-awesome-ai-art-with-midjourney-based-on-your-words.jpg",
    "https://imgur.com/eBiUv73.png",
    "https://imgur.com/D2lHK38.png",
    "https://imgur.com/9NRUAPx.png",
    "https://imgur.com/3e7pJk0.png",
    "https://imgur.com/noBYWeB.png",
    "https://imgur.com/SmCKYQs.png",
    "https://imgur.com/thARmPa.png",
    "https://imgur.com/o7TfNOi.png",
    "https://imgur.com/nCTAglM.png",
    "https://i.imgur.com/us82FmM.jpeg",
    "https://i.imgur.com/XGfaZRE.jpeg",
    "https://i.imgur.com/K5NfJCu.jpeg",
    "https://i.imgur.com/DcFcUJo.jpeg",
    "https://i.imgur.com/SjgWjzw.jpeg"
  ];

  const pathToSave = path.join(__dirname, "cache", "menu.png");
  const rdimg = img[Math.floor(Math.random() * img.length)];

  try {
    const downloadIMG = (await axios.get(rdimg, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathToSave, Buffer.from(downloadIMG, "binary"));
  } catch (error) {
    console.error('Lỗi khi tải ảnh:', error);
  }

  const messageObject = {
    body: msg,
    attachment: fs.createReadStream(pathToSave)
  };

  return api.sendMessage(messageObject, tid);
};
