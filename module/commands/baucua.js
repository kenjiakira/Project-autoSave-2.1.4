const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); 

module.exports.config = {
  name: "baucua",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Chơi Bầu Cua",
  commandCategory: "game",
  usePrefix: true,
  usages: "baucua <cược> <bầu/cua/cá/mèo/tôm/nai>\n\n" +
      "Hướng dẫn sử dụng:\n" +
      "- `<cược>`: Số tiền bạn muốn cược, ví dụ: 1000\n" +
      "- `<bầu/cua/cá/mèo/tôm/nai>`: Con vật bạn dự đoán sẽ xuất hiện, chọn một trong các con vật này\n\n" +
      "Ví dụ:\n" +
      "- Cược 1000 xu vào con mèo: `baucua 1000 mèo`\n" +
      "- Cược 5000 xu vào con tôm: `baucua 5000 tôm`\n\n" +
      "Lưu ý:\n" +
      "- Số tiền cược tối đa là 10000 xu.\n" +
      "- Bạn phải chờ 15 giây trước khi chơi lại.",
  cooldowns: 5
};

const playingUsers = new Set();
const maxBet = 10000;
const combinedImagePath = path.join(__dirname, 'baucua', 'combined_baucua_image.png');

module.exports.onLoad = function() {
  const imageDir = path.join(__dirname, 'baucua', 'images');
  const dataDir = path.join(__dirname, 'baucua', 'datauser');

  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
};

const combineImages = async (imagePaths) => {
  try {
    const images = await Promise.all(
      imagePaths.map(imagePath =>
        sharp(imagePath).resize(200, 200).toBuffer()
      )
    );

    const combinedImage = sharp({
      create: {
        width: 600, 
        height: 200,
        channels: 4,
        background: 'white'
      }
    });

    const compositeImage = combinedImage.composite(
      images.map((imageBuffer, index) => ({
        input: imageBuffer,
        top: 0,
        left: index * 200
      }))
    );

    await compositeImage.toFile(combinedImagePath);
    console.log("Hình ảnh đã được kết hợp và lưu tại:", combinedImagePath);
  } catch (error) {
    console.error("Lỗi khi kết hợp hình ảnh:", error);
  }
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;

  if (playingUsers.has(senderID)) {
    return api.sendMessage("⏳ Bạn phải chờ 15 giây trước khi chơi lại.", threadID, messageID);
  }

  if (args.length < 2) {
    return api.sendMessage("📝 Bạn phải nhập số tiền cược và chọn một trong các con vật: bầu, cua, cá, mèo, tôm, nai. Ví dụ: baucua 1000 mèo", threadID, messageID);
  }

  const betAmount = parseInt(args[0]);
  const chosenAnimal = args[1].toLowerCase();
  const animals = ["bầu", "cua", "cá", "mèo", "tôm", "nai"];
  const animalEmojis = {
    "bầu": "🍐",
    "cua": "🦀",
    "cá": "🐟",
    "mèo": "🐈",
    "tôm": "🦐",
    "nai": "🦌"
  };

  const animalImages = {
    "bầu": path.join(__dirname, 'baucua', 'images', 'bau.jpg'),
    "cua": path.join(__dirname, 'baucua', 'images', 'cua.jpg'),
    "cá": path.join(__dirname, 'baucua', 'images', 'ca.jpg'),
    "mèo": path.join(__dirname, 'baucua', 'images', 'meo.jpg'),
    "tôm": path.join(__dirname, 'baucua', 'images', 'tom.jpg'),
    "nai": path.join(__dirname, 'baucua', 'images', 'nai.jpg')
  };

  if (!animals.includes(chosenAnimal)) {
    return api.sendMessage("❌ Con vật bạn chọn không hợp lệ. Vui lòng chọn một trong các con vật: bầu, cua, cá, mèo, tôm, nai. Ví dụ: baucua 1000 mèo", threadID, messageID);
  }

  const userData = await Currencies.getData(senderID);
  const userMoney = userData.money;

  if (isNaN(betAmount) || betAmount <= 0) {
    return api.sendMessage("❌ Số tiền cược không hợp lệ.", threadID, messageID);
  }

  if (betAmount > userMoney) {
    return api.sendMessage("❌ Bạn không có đủ tiền để đặt cược.", threadID, messageID);
  }

  if (betAmount > maxBet) {
    return api.sendMessage(`❌ Số tiền cược tối đa là ${maxBet} xu.`, threadID, messageID);
  }

  playingUsers.add(senderID);

  const diceResults = Array(3).fill().map(() => animals[Math.floor(Math.random() * animals.length)]);
  const diceResultsWithImages = diceResults.map(animal => {
    const imagePath = animalImages[animal];
    return imagePath;
  });

  await combineImages(diceResultsWithImages);

  const winnings = diceResults.filter(animal => animal === chosenAnimal).length * betAmount;

  let message;
  if (winnings > 0) {
    await Currencies.increaseMoney(senderID, winnings);
    message = `🎉 Chúc mừng! Bạn đã thắng ${winnings} xu.`;
  } else {
    await Currencies.decreaseMoney(senderID, betAmount);
    message = `😢 Rất tiếc! Bạn đã thua ${betAmount} xu.`;
  }

  api.sendMessage({
    body: message,
    attachment: fs.createReadStream(combinedImagePath) 
  }, threadID, messageID);

  setTimeout(() => playingUsers.delete(senderID), 15000); 
};
