const axios = require('axios');

module.exports.config = {
  name: "emoji",
  version: "1.0.0",
  hasPermission: 0,
  credits: "NTKhang",
  description: "Mã hóa tin nhắn thành biểu tượng cảm xúc và ngược lại",
  commandCategory: "Công cụ",
  usePrefix: true,
  usages: "emoji en <văn bản>\nhoặc\nemoji de <văn bản>",
  cooldowns: 5
};

module.exports.run = async ({ event, api, args }) => {
  const text = args.slice(1).join(" ");
  const type = args[0];

  if (type == 'encode' || type == "en") {
    const replacements = [
      [/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|a/g, "😀"],
      [/b/g, "😃"],
      [/c/g, "😁"],
      [/đ|d/g, "😅"],
      [/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|e/g, "🥰"],
      [/f/g, "🤣"],
      [/g/g, "🥲"],
      [/h/g, "☺️"],
      [/ì|í|ị|ỉ|ĩ|i/g, "😊"],
      [/k/g, "😇"],
      [/l/g, "😉"],
      [/m/g, "😒"],
      [/n/g, "😞"],
      [/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ|o/g, "😙"],
      [/p/g, "😟"],
      [/q/g, "😕"],
      [/r/g, "🙂"],
      [/s/g, "🙃"],
      [/t/g, "☹️"],
      [/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ|u/g, "😡"],
      [/v/g, "😍"],
      [/x/g, "😩"],
      [/ỳ|ý|ỵ|ỷ|ỹ|y/g, "😭"],
      [/w/g, "😳"],
      [/z/g, "😠"],
      [/\s/g, "."], 
      [/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""],
      [/\u02C6|\u0306|\u031B/g, ""]
    ];

    let encodedText = text.toLowerCase();
    for (const [pattern, emoji] of replacements) {
      encodedText = encodedText.replace(pattern, emoji);
    }

    return api.sendMessage(encodedText, event.threadID, event.messageID);
  } else if (type == 'decode' || type == "de") {
    const replacements = [
      [/😀/g, "a"],
      [/😃/g, "b"],
      [/😁/g, "c"],
      [/😅/g, "d"],
      [/🥰/g, "e"],
      [/🤣/g, "f"],
      [/🥲/g, "g"],
      [/☺️/g, "h"],
      [/😊/g, "i"],
      [/😇/g, "k"],
      [/😉/g, "l"],
      [/😒/g, "m"],
      [/😞/g, "n"],
      [/😙/g, "o"],
      [/😟/g, "p"],
      [/😕/g, "q"],
      [/🙂/g, "r"],
      [/🙃/g, "s"],
      [/☹️/g, "t"],
      [/😡/g, "u"],
      [/😍/g, "v"],
      [/😩/g, "x"],
      [/😭/g, "y"],
      [/😳/g, "w"],
      [/😠/g, "z"],
      [/\./g, ' ']
    ];

    let decodedText = text.toLowerCase();
    for (const [pattern, character] of replacements) {
      decodedText = decodedText.replace(pattern, character);
    }

    return api.sendMessage(decodedText, event.threadID, event.messageID);
  } else {
    return api.sendMessage("Cú pháp sai\nemoji en <văn bản>\nhoặc\nemoji de <văn bản>", event.threadID, event.messageID);
  }
}
