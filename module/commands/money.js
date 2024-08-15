const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const jimp = require('jimp');

registerFont(path.join(__dirname, 'cache', 'Be_Vietnam_Pro', 'BeVietnamPro-Bold.ttf'), { family: 'Be Vietnam Pro' });

async function circleImage(imageBuffer) {
  const image = await jimp.read(imageBuffer);
  image.circle();
  return await image.getBufferAsync('image/png');
}

function formatNumber(number) {
  const [integerPart, decimalPart] = number.toFixed(2).split(".");
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedIntegerPart},${decimalPart}`;
}

async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo[userID].name;
  } catch (error) {
    console.error(error);
    return "người dùng";
  }
}

async function createBalanceImage(userName, balance, userID) {
  const width = 800;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const backgroundImagePath = path.join(__dirname, 'images', 'background.png');

  try {
    const background = await loadImage(backgroundImagePath);
    ctx.drawImage(background, 0, 0, width, height);

    // Tải và vẽ avatar lên canvas
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const avatarBuffer = Buffer.from(avatarResponse.data);
    const avatarImage = await circleImage(avatarBuffer);
    const avatarImg = await loadImage(avatarImage);
    const avatarSize = 150;
    ctx.drawImage(avatarImg, 50, (height - avatarSize) / 2, avatarSize, avatarSize);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.font = "bold 40px Be Vietnam Pro";
    ctx.fillStyle = "#ffffff";
    const userNameUpper = userName.toUpperCase();
    const userNameText = userNameUpper;
    const userNameWidth = ctx.measureText(userNameText).width;
    const userNameX = (width - userNameWidth) / 2;
    ctx.fillText(userNameText, userNameX, 80);

    ctx.font = "bold 45px Be Vietnam Pro";
    ctx.fillStyle = "#ffd700";
    const balanceText = `${balance} xu`;
    const balanceWidth = ctx.measureText(balanceText).width;
    const balanceX = (width - balanceWidth) / 2;
    ctx.fillText(balanceText, balanceX, 150);

    const imagePath = path.join(__dirname, 'cache', 'balance_image.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);

    return imagePath;
  } catch (error) {
    console.error('Lỗi khi tải hoặc xử lý hình ảnh:', error);
    throw new Error('Lỗi khi tạo hình ảnh');
  }
}

module.exports.config = {
  name: "money",
  version: "1.1.1",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Kiểm tra số tiền của bản thân hoặc người được tag",
  commandCategory: "Tài Chính",
  usePrefix: true,
  usages: "gõ .money để xem xu của mình hoặc của người khác bằng cách tag\nVD: bạn cần xem tiền của người tên A\ngõ [.money @A] hoặc trả lời tin nhắn của người đó",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let userID;

  if (messageReply && messageReply.senderID) {
    userID = messageReply.senderID;
  } else if (args[0]) {
    userID = Object.keys(mentions)[0];
  } else {
    userID = senderID;
  }

  try {
    const userData = await Currencies.getData(userID);
    const balance = userData && userData.money ? userData.money : 0;
    const formattedBalance = formatNumber(balance);
    const userName = await getUserName(api, userID);

    const imagePath = await createBalanceImage(userName, formattedBalance, userID);

    return api.sendMessage({
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("Đã xảy ra lỗi khi kiểm tra số tiền.", threadID, messageID);
  }
};
