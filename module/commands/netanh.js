const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');

const config = {
  name: "netanh",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Akira",
  description: "Làm nét ảnh",
  usePrefix: true,
  commandCategory: "Hình ảnh",
  usages: "[reply]",
  update: true,
  cooldowns: 0
};

const enhanceImageWithSharp = async (inputPath, outputPath) => {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    await image
      .resize({
        width: Math.round(metadata.width * 2), 
        height: Math.round(metadata.height * 2),
        fit: 'contain',
        kernel: 'lanczos3' 
      })
      .sharpen()  
      .toFile(outputPath);

    console.log('Ảnh đã được nâng cao độ phân giải và lưu vào:', outputPath);
  } catch (error) {
    console.error('Lỗi khi nâng cao độ phân giải ảnh:', error);
    throw error;
  }
};

const run = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID } = event;

  if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
    const attachment = event.messageReply.attachments[0];

    if (attachment.type === 'photo') {
      const imageURL = attachment.url;
      const imagePath = path.resolve(__dirname, 'cache', `original-${senderID}.jpg`);
      const outputPath = path.resolve(__dirname, 'cache', `enhanced-${senderID}.jpg`);

      try {
       
        const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

        await enhanceImageWithSharp(imagePath, outputPath);

       
        api.sendMessage({
          body: 'Đây là ảnh đã được nâng cao độ phân giải:',
          attachment: fs.createReadStream(outputPath)
        }, threadID, async () => {
        
          fs.unlinkSync(imagePath);
          fs.unlinkSync(outputPath);
        }, messageID);
      } catch (error) {
        console.error('Lỗi khi xử lý ảnh:', error);
        api.sendMessage('⚠️ Đã xảy ra lỗi khi nâng cao độ phân giải ảnh. Vui lòng thử lại sau.', threadID, messageID);
      }
    } else {
      api.sendMessage('❯ Vui lòng reply một bức ảnh.', threadID, messageID);
    }
  } else {
    api.sendMessage('❯ Vui lòng reply một bức ảnh.', threadID, messageID);
  }
};

module.exports = { config, run };
