module.exports.config = {
  name: "translate",
  version: "1.0.1",
  hasPermission: 0,
  credits: "(Được sửa đổi bởi Yan Maglinte)",
  description: "Dịch văn bản",
  usePrefix: true,
  commandCategory: "media",
  usages: `${global.config.PREFIX}trans fr Xin chào, bạn khỏe không?`,
  cooldowns: 5,
  dependencies: {
    "request": ""
  }
};

/* Mã đã được sửa đổi!
Dưới đây là cách sử dụng:
"dịch [Ngôn ngữ Đích] [Văn bản]"

Hãy thử ví dụ này và xem kết quả:

Dịch "Xin chào, bạn khỏe không?" sang tiếng Pháp:
• "<prefix>trans fr Xin chào, bạn khỏe không?"

Dịch "Tôi yêu bạn" sang tiếng Tây Ban Nha:
• "<prefix>trans es Tôi yêu bạn"

Dịch "Buổi sáng tốt lành" sang tiếng Đức:
• "<prefix>trans de Buổi sáng tốt lành"

Sửa đổi bởi Yan Maglinte */

module.exports.run = async ({ api, event, args }) => {
  const request = global.nodemodule["request"];
  const targetLanguage = args[0];
  const content = args.slice(1).join(" ");

  if (content.length === 0 && event.type !== "message_reply")
    return global.utils.throwError(this.config.name, event.threadID, event.messageID);

  let translateThis, lang;

  if (event.type === "message_reply") {
    translateThis = event.messageReply.body;
    lang = targetLanguage || global.config.language;
  } else {
    translateThis = content;
    lang = targetLanguage || global.config.language;
  }

  return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
    if (err)
      return api.sendMessage("Đã xảy ra lỗi!", event.threadID, event.messageID);

    const retrieve = JSON.parse(body);
    let text = '';
    retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
    const fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];

    api.sendMessage(`❯ Kết quả dịch: ${text}\n - Đã dịch từ ${fromLang} sang ${lang}`, event.threadID, event.messageID);
  });
};
