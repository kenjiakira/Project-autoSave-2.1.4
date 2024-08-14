const stringSimilarity = require('string-similarity');

module.exports.config = {
  name: "say",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Yan Maglinte",
  description: "Chuyển văn bản thành giọng nói",
  usePrefix: true,
  commandCategory: "message",
  usages: "[ngôn ngữ] [văn bản]",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": "",
    "string-similarity": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  try {
    const { createReadStream, unlinkSync, stat } = global.nodemodule["fs-extra"];
    const { resolve } = global.nodemodule["path"];
    const content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
    let languageToSay = (["ru", "en", "ko", "ja", "tl","fr"].some(item => content.indexOf(item) == 0)) ? content.slice(0, content.indexOf(" ")) : global.config.language;
    let msg = (languageToSay != global.config.language) ? content.slice(3, content.length) : content;

    const bannedWordsPath = resolve(__dirname, '../../module/commands/json/banned_words.json');
    const bannedWords = require(bannedWordsPath).bannedWords;

    const similarityThreshold = 0.4;
    const containsBannedWords = bannedWords.some(word => {
      return stringSimilarity.compareTwoStrings(msg.toLowerCase(), word.toLowerCase()) >= similarityThreshold;
    });

    if (containsBannedWords) {
      return api.sendMessage("⚠️ Nội dung chứa từ cấm. Vui lòng sửa đổi nội dung!", event.threadID, event.messageID);
    }

    if (!msg) {
      return api.sendMessage("Vui lòng nhập văn bản cần chuyển thành giọng nói!", event.threadID, event.messageID);
    }

    if (msg.length > 50) {
      return api.sendMessage("⚠️ Văn bản không được vượt quá 50 ký tự. Vui lòng nhập lại.", event.threadID, event.messageID);
    }

    const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
    await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`, path);

    const stats = await stat(path);
    const fileSizeInBytes = stats.size;
    const maxSizeBytes = 80 * 1024 * 1024; 

    if (fileSizeInBytes > maxSizeBytes) {
      unlinkSync(path);
      return api.sendMessage('⚠️ Không thể gửi tệp vì kích thước lớn hơn 80MB.', event.threadID, event.messageID);
    }

    return api.sendMessage({ attachment: createReadStream(path) }, event.threadID, () => unlinkSync(path), event.messageID);
  } catch (error) {
    console.log(error);
    return api.sendMessage("Đã xảy ra lỗi khi thực hiện chuyển văn bản thành giọng nói.", event.threadID, event.messageID);
  }
};
