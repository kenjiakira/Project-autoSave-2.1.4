module.exports.config = {
  name: "morse",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Chuyển đổi văn bản thành mã Morse và ngược lại",
  commandCategory: "Tiện ích",
  usePrefix: true,
  usages: [
    "morse encode [văn bản]",
    "morse decode [mã Morse]",
    "Ví dụ:\n" +
    "1. morse encode hello\n" +
    "2. morse decode .... . .-.. .-.. ---"
  ],
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const morseCode = {
    "a": ".-", "b": "-...", "c": "-.-.", "d": "-..", "e": ".", "f": "..-.",
    "g": "--.", "h": "....", "i": "..", "j": ".---", "k": "-.-", "l": ".-..",
    "m": "--", "n": "-.", "o": "---", "p": ".--.", "q": "--.-", "r": ".-.",
    "s": "...", "t": "-", "u": "..-", "v": "...-", "w": ".--", "x": "-..-",
    "y": "-.--", "z": "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
    "6": "-....", "7": "--...", "8": "---..", "9": "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
  };

  const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([key, value]) => [value, key]));

  if (args.length < 2) {
    return api.sendMessage(`Vui lòng sử dụng: ${global.config.PREFIX}morse [encode/decode] [văn bản]`, event.threadID, event.messageID);
  }

  const action = args[0].toLowerCase();
  const text = args.slice(1).join(" ");

  if (action === "encode") {
    const encodedText = text.toLowerCase().split("").map(char => morseCode[char] || char).join(" ");
    return api.sendMessage(`${encodedText}`, event.threadID, event.messageID);
  } else if (action === "decode") {
    const decodedText = text.split(" ").map(code => reverseMorse[code] || code).join("");
    return api.sendMessage(`Decoded Text: ${decodedText}`, event.threadID, event.messageID);
  } else {
    return api.sendMessage(`Hãy sử dụng: ${global.config.PREFIX}morse [encode/decode] [văn bản]`, event.threadID, event.messageID);
  }
};
