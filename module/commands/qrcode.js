const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const qrcode = require('qrcode');
const imageDownloader = require('image-downloader');
const jimp = require('jimp');
const QrCode = require('qrcode-reader');

function getRandomColor() {
  let color;
  do {
    color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  } while (isTooBright(color) || color === '#ffffff');
  return color;
}

function isTooBright(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

module.exports.config = {
  name: "qrcode",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Tạo và đọc mã QR",
  commandCategory: "Công cụ",
  usePrefix: true,
  usages: ".qrcode [dữ liệu] | reply ảnh chứa mã QR để quét",
  cooldowns: 0,
  dependencies: {
    "jimp": "",
    "qrcode": "",
    "canvas": "",
    "qrcode-reader": "",
    "image-downloader": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, type, messageReply, senderID } = event;

  if (args.length > 0) {
    const data = args.join(" ");
    if (!data) {
      return api.sendMessage("» Vui lòng cung cấp dữ liệu để tạo mã QR!", threadID, messageID);
    }

    try {
      const qrCodeBuffer = await qrcode.toBuffer(data, {
        width: 1024,
        color: {
          dark: getRandomColor(), 
          light: '#FFFFFF' 
        }
      });

      const canvasWidth = 800;
      const canvasHeight = 800;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const qrImage = await Canvas.loadImage(qrCodeBuffer);
      const qrSize = Math.min(canvasWidth, canvasHeight) - 60;
      ctx.drawImage(qrImage, 30, 30, qrSize, qrSize);

      const logoUrl = 'https://i.imgur.com/jTjylEF.jpeg';
      const logoPath = path.join(__dirname, 'cache', 'logo.png');
      await imageDownloader.image({ url: logoUrl, dest: logoPath });

      const logoImage = await jimp.read(logoPath);
      logoImage.resize(logoImage.bitmap.width / 4, logoImage.bitmap.height / 4);
      logoImage.circle();
      const logoBuffer = await logoImage.getBufferAsync('image/png');
      const logoCanvas = await Canvas.loadImage(logoBuffer);

      const logoSize = qrSize / 6;
      const logoX = (canvasWidth - logoSize) / 2;
      const logoY = (canvasHeight - logoSize) / 2;
      ctx.drawImage(logoCanvas, logoX, logoY, logoSize, logoSize);


      ctx.font = '30px Arial';
      ctx.fillStyle = '#000000';  
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const copyrightText = 'by HNT';
      const textX = canvasWidth / 2;
      const textY = canvasHeight - 30;  
      ctx.fillText(copyrightText, textX, textY);

      const canvasPath = path.join(__dirname, 'cache', 'qrcode_canvas.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(canvasPath, buffer);

      api.sendMessage({
        attachment: fs.createReadStream(canvasPath)
      }, threadID, () => {
        fs.unlinkSync(canvasPath);
        fs.unlinkSync(logoPath);
      }, messageID);

    } catch (error) {
      console.error("Error while creating QR code:", error);
      return api.sendMessage("» Đã xảy ra lỗi khi tạo mã QR!", threadID, messageID);
    }
  } else if (type === "message_reply" && messageReply.attachments && messageReply.attachments.length > 0) {
    if (messageReply.attachments[0].type !== 'photo') {
      return api.sendMessage("» Bạn chỉ có thể quét mã QR từ ảnh!", threadID, messageID);
    }

    try {
      const imageUrl = messageReply.attachments[0].url;
      const imagePath = path.join(__dirname, "cache", "qrcode.png");

      await imageDownloader.image({ url: imageUrl, dest: imagePath });

      const image = await jimp.read(imagePath);
      const qrReader = new QrCode();
      const qrResult = await new Promise((resolve, reject) => {
        qrReader.callback = (err, value) => err ? reject(err) : resolve(value.result);
        qrReader.decode(image.bitmap);
      });

      if (qrResult) {
        const userData = await api.getUserInfo(senderID);
        const userName = userData[senderID].name;
        return api.sendMessage(`» Chào ${userName}, đây là kết quả quét mã QR: ${qrResult}`, threadID, messageID);
      } else {
        return api.sendMessage("» Không tìm thấy mã QR trong ảnh!", threadID, messageID);
      }
    } catch (error) {
      console.error("Error while scanning QR code:", error);
      return api.sendMessage("» Đã xảy ra lỗi khi quét mã QR!", threadID, messageID);
    }
  } else {
    return api.sendMessage("» Vui lòng cung cấp dữ liệu để tạo mã QR hoặc reply ảnh chứa mã QR để quét!", threadID, messageID);
  }
};
