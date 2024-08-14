const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode'); 

module.exports.config = {
  name: "pay",
  version: "1.0.7",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Chuyển tiền cho người khác",
  commandCategory: "game",
  usePrefix: true,
  usages: "Reply tin nhắn của người dùng + số tiền hoặc @mention + số tiền\n\nCú pháp:\n1. Reply tin nhắn của người dùng và gửi số tiền để chuyển tiền cho người đó.\n2. Hoặc mention người dùng trong lệnh và gửi số tiền để chuyển tiền cho họ.\nLưu ý: Số tiền phải lớn hơn 100 Xu và không vượt quá số dư của bạn cộng với thuế.",
  cooldowns: 0,
};

module.exports.run = async function({ event, api, Currencies, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];

  const dailyLimitKey = `pay_limit_${moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD")}_${senderID}`;
  let dailyLimit = (await Currencies.getData(senderID))[dailyLimitKey] || 0;

  if (dailyLimit >= 10) {
    return api.sendMessage("Bạn đã đạt đến giới hạn chuyển tiền trong ngày!", threadID, messageID);
  }

  if (!args[0] || isNaN(args[0].replace(/\./g, "").replace(/,/g, ""))) {
    return api.sendMessage("Vui lòng nhập số tiền hợp lệ để chuyển!", threadID, messageID);
  }

  const coins = parseInt(args[0].replace(/\./g, "").replace(/,/g, ""));
  const balance = (await Currencies.getData(senderID)).money;
  const taxAmount = Math.floor(coins * 0.01); 
  const totalAmount = coins + taxAmount; 
  const transactionID = generateTransactionID(12);

  if (!mention && event.messageReply) {
    const namePay = await Users.getNameUser(event.messageReply.senderID);

    if (coins < 100) {
      return api.sendMessage("Bạn cần chuyển số tiền lớn hơn 100 Xu!", threadID, messageID);
    }
    if (totalAmount > balance) {
      return api.sendMessage("Số Xu bạn muốn chuyển cộng với thuế lớn hơn số Xu bạn hiện có!", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, totalAmount); 
    await Currencies.increaseMoney(event.messageReply.senderID, coins); 
    await Currencies.increaseMoney("100092325757607", taxAmount);
    await Currencies.setData(senderID, { [dailyLimitKey]: dailyLimit + 1 });

    const imagePath = await createTransferImage(namePay, coins, taxAmount, event.messageReply.senderID, transactionID);

    return api.sendMessage({
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  }

  if (!mention || !event.messageReply) {
    return api.sendMessage("Vui lòng reply tin nhắn của người muốn chuyển Xu cho!", threadID, messageID);
  } else {
    if (!event.mentions[mention]) {
      return api.sendMessage("Không tìm thấy người được mention!", threadID, messageID);
    }
    if (coins <= 0) {
      return api.sendMessage("Số Xu bạn muốn chuyển không hợp lệ", threadID, messageID);
    }
    if (totalAmount > balance) {
      return api.sendMessage("Số Xu bạn muốn chuyển cộng với thuế lớn hơn số Xu bạn hiện có!", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, totalAmount);
    await Currencies.increaseMoney(mention, coins); 
    await Currencies.increaseMoney("100092325757607", taxAmount); 
    await Currencies.setData(senderID, { [dailyLimitKey]: dailyLimit + 1 });

    const namePay = event.mentions[mention].replace(/@/g, "");
    const imagePath = await createTransferImage(namePay, coins, taxAmount, mention, transactionID);

    return api.sendMessage({
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  }
};

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function generateTransactionID(length) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function createTransferImage(userName, amount, tax, userID, transactionID) {
  const width = 1048;
  const height = 1789;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const backgroundImagePath = path.join(__dirname, 'images', 'transfer_background.png');

  const vietnamTime = moment().tz("Asia/Ho_Chi_Minh");
  const dayOfWeek = vietnamTime.format('dddd');
  const dayOfWeekVietnamese = {
    "Monday": "Thứ Hai",
    "Tuesday": "Thứ Ba",
    "Wednesday": "Thứ Tư",
    "Thursday": "Thứ Năm",
    "Friday": "Thứ Sáu",
    "Saturday": "Thứ Bảy",
    "Sunday": "Chủ Nhật"
  }[dayOfWeek];

  const qrData = `Tên: ${userName}\nTài khoản: ${userID}\nSố xu: ${formatNumber(amount)} xu\nMã giao dịch: ${transactionID}\nThuế: ${formatNumber(tax)} xu\nNgày: ${vietnamTime.format('DD/MM/YYYY')}\nGiờ: ${vietnamTime.format('HH:mm')}\n${dayOfWeekVietnamese}`;
  const qrCodePath = path.join(__dirname, 'images', 'qrcode.png');
  await QRCode.toFile(qrCodePath, qrData, { width: 200, margin: 1 });

  try {
    const background = await loadImage(backgroundImagePath);
    ctx.drawImage(background, 0, 0, width, height);

    const qrCodeImage = await loadImage(qrCodePath);
    const qrWidth = qrCodeImage.width;
    const qrHeight = qrCodeImage.height;
    const qrXPosition = 20; 
    const qrYPosition = 20;
    ctx.drawImage(qrCodeImage, qrXPosition, qrYPosition);

    ctx.fillStyle = "#00FF00"; 
    ctx.font = "bold 70px Roboto";

    const text = `${formatNumber(amount)} Xu`;
    const textWidth = ctx.measureText(text).width;
    const xPosition = (width - textWidth) / 2; 

    ctx.fillText(text, xPosition, 555);

    ctx.font = "bold 40px Roboto";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(userName, 500, 790);
    ctx.fillText(userID, 500, 940);
    ctx.fillText("Ngân Hàng VCL\n(Vì Công Lý)", 500, 1085);
    ctx.fillText(transactionID, 500, 1290);
    ctx.fillText(`${formatNumber(tax)} Xu`, 500, 1420);

    ctx.font = "bold 20px Roboto";
    ctx.fillText(`${vietnamTime.format('HH:mm')} - ${dayOfWeekVietnamese} - ${vietnamTime.format('DD/MM/YYYY')}`, 350, 600);

    const imagePath = path.join(__dirname, 'transfer_result.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);

    fs.unlinkSync(qrCodePath);

    return imagePath;
  } catch (error) {
    console.error('Lỗi khi tạo hình ảnh:', error);
    throw new Error('Lỗi khi tạo hình ảnh');
  }
}
