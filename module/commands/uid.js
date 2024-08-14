const axios = require('axios');

module.exports.config = {
  name: "uid",
  version: "1.1.1",
  hasPermission: 0,
  credits: "Akira",
  description: "lấy UID facebook của người nào đó",
  commandCategory: "Công cụ",
  usePrefix: true,
  usages: "gõ .UID [tag] or [reply]",
  cooldowns: 0
};

module.exports.languages = {
  "vi": {},
  "en": {}
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (args.length === 0) {
      let uid;
      if (event.type === 'message_reply') {
        uid = event.messageReply.senderID;
      } else {
        uid = event.senderID;
      }
      console.log('UID:', uid);
      return api.sendMessage(uid, event.threadID, event.messageID);
    }

    if (event.type !== 'message_reply') {
      for (var i = 0; i < Object.keys(event.mentions).length; i++) {
        const mentionedUID = Object.keys(event.mentions)[i];
        console.log('UID Mentioned:', mentionedUID);
        api.sendMessage(mentionedUID, event.threadID, event.messageID);
      }
    }

    const link = args[0];
    const protocol = 'https:';
    const hostname = [
      'www.facebook.com',
      'facebook.com',
      'm.facebook.com',
      'mbasic.facebook.com',
      'fb.com'
    ];

    const urlHost = new URL(link).hostname;

    if (!hostname.includes(urlHost)) {
      console.log(`Link không đúng định dạng: ${protocol}//www.facebook.com/ + user name`);
      return api.sendMessage(`Link phải đúng định dạng: ${protocol}//www.facebook.com/ + user name`, event.threadID);
    }

    const accessToken = '6628568379%7Cc1e620fa708a1d5696fb991c1bde5662';
    const getID = (await axios.get(`https://graph.facebook.com/v12.0/${link}?access_token=${accessToken}`)).data;

    if (!getID.id) {
      console.log('Không tìm thấy UID cho liên kết này.');
      return api.sendMessage('Không tìm thấy UID cho liên kết này.', event.threadID, event.messageID);
    }

    console.log('UID:', getID.id);
    return api.sendMessage(getID.id, event.threadID, event.messageID);
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('Yêu cầu bị từ chối. Vui lòng kiểm tra lại API key hoặc liên hệ với quản trị viên.');
      return api.sendMessage('Yêu cầu bị từ chối. Vui lòng kiểm tra lại API key hoặc liên hệ với quản trị viên.', event.threadID, event.messageID);
    }
    console.log(`Đã xảy ra lỗi: ${error.message}`);
    return api.sendMessage(`Đã xảy ra lỗi: ${error.message}`, event.threadID, event.messageID);
  }
};
