const config = {
  name: "kbb",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Akira",
  description: "Chơi trò kéo búa bao",
  usePrefix: true,
  commandCategory: "game",
  usages: "**Hướng dẫn cách chơi:**\n1. Gửi lệnh với một trong các tùy chọn: kéo, búa, bao.\n2. Bot sẽ chọn ngẫu nhiên một trong các tùy chọn này và hiển thị kết quả.\n3. Nếu bạn thắng, bạn sẽ nhận được 100 xu. Hòa không có phần thưởng xu.",
  cooldowns: 10
};

const run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;

  const choices = ['kéo ✂️', 'búa 🔨', 'bao 📰'];
  const userChoice = args[0]?.toLowerCase();

  const emojiMap = {
    'kéo': '✂️',
    'búa': '🔨',
    'bao': '📰'
  };

  const botChoiceRaw = choices[Math.floor(Math.random() * choices.length)];
  const botChoice = botChoiceRaw.split(' ')[0];  // Lấy tên không có emoji

  if (!choices.some(choice => choice.includes(userChoice))) {
    return api.sendMessage('❍━━━━━━━━━━━━━━❍\n  MiniGame Kéo Búa Bao\n❍━━━━━━━━━━━━━━❍\n\n Vui lòng chọn "kéo ✂️", "búa 🪨", hoặc "bao 📰".', threadID, messageID);
  }

  const userChoiceEmoji = emojiMap[userChoice];

  let result;
  if (userChoice === botChoice) {
    result = 'Hòa! 🤝';
  } else if (
    (userChoice === 'kéo' && botChoice === 'bao') ||
    (userChoice === 'búa' && botChoice === 'kéo') ||
    (userChoice === 'bao' && botChoice === 'búa')
  ) {
    result = 'Bạn thắng! 🎉 +100xu';
    await Currencies.increaseMoney(senderID, 100);
  } else {
    result = 'Bot thắng! 😜';
  }

  const responseMessage = `❍━━━━━━━━━━━━━━❍\nMiniGame Kéo Búa Bao\n❍━━━━━━━━━━━━━━❍\n\nBạn chọn: ${userChoiceEmoji}\nBot chọn: ${emojiMap[botChoice]}\n\nKết quả: ${result}`;
  
  api.sendMessage(responseMessage, threadID, messageID);
};

module.exports = { config, run };
