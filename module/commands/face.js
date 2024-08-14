const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_KEY = 'h-HR-8Wo4Oba0YjzdatT7IZcK2pMMa4h'; 
const API_SECRET = 'TdqZSKDStGa16jOSmKjaGlBRLd1vvCEb';

module.exports.config = {
  name: "face",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "đếm số lượng mặt(BETA)",
  commandCategory: "Công Cụ",
  usePrefix: true,
  usages: "[Ảnh] - Reply một ảnh chứa khuôn mặt mà bạn muốn phân tích.",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;

  if (type === "message_reply" && messageReply.attachments && messageReply.attachments.length > 0) {
    if (messageReply.attachments[0].type !== 'photo') {
      return api.sendMessage("Bạn chỉ có thể đo độ đẹp từ ảnh!", threadID, messageID);
    }

    const imageUrl = messageReply.attachments[0].url;

    try {

      const response = await axios({
        url: imageUrl,
        responseType: 'arraybuffer'
      });
      const imageBuffer = response.data;


      const form = new FormData();
      form.append('api_key', API_KEY);
      form.append('api_secret', API_SECRET);
      form.append('image_file', imageBuffer, { filename: 'image.jpg' });

      const apiResponse = await axios.post('https://api-us.faceplusplus.com/facepp/v3/detect', form, {
        headers: form.getHeaders()
      });

      const faceData = apiResponse.data.faces;
      if (faceData.length === 0) {
        return api.sendMessage("Không tìm thấy khuôn mặt trong ảnh.", threadID, messageID);
      }

      console.log("Dữ liệu trả về từ API:", JSON.stringify(apiResponse.data, null, 2));


      const numberOfFaces = faceData.length;
      const message = `Đã phát hiện ${numberOfFaces} khuôn mặt trong ảnh.`;
      return api.sendMessage(message, threadID, messageID);

    } catch (error) {
      console.error("Lỗi khi phân tích ảnh:", error);
      return api.sendMessage("Đã xảy ra lỗi khi phân tích ảnh.", threadID, messageID);
    }
  } else {
    return api.sendMessage("Vui lòng reply ảnh mặt để đo độ đẹp.", threadID, messageID);
  }
};
