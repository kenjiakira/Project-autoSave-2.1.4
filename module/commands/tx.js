const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const diceImagesPath = path.join(__dirname, 'dice_images');
const combinedImagePath = path.join(__dirname, 'dice_images', 'combined_dice_image.png');
const taxRecipientUID = "100029043375434";

module.exports.config = {
  name: "tx",
  version: "1.1.6",
  hasPermission: 0,
  credits: "Akira",
  description: "Chơi tài xỉu",
  commandCategory: "Mini Game",
  usePrefix: true,
  usages: "Hãy sử dụng: tx [tài/xỉu] [số xu hoặc Allin]",
  cooldowns: 10
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const combineImages = async (diceNumbers) => {
  try {
    const images = await Promise.all(
      diceNumbers.map(diceNumber =>
        sharp(path.join(diceImagesPath, `dice${diceNumber}.png`)).resize(200, 200).toBuffer()
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

const sendResultWithImages = async (api, threadID, message, diceNumbers) => {
  try {
    await combineImages(diceNumbers);

    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(combinedImagePath) 
    }, threadID);
  } catch (error) {
    console.error("Lỗi khi gửi hình ảnh xúc xắc và văn bản:", error);
  }
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;

  try {
    if (!args[0]) return api.sendMessage("Bạn chưa nhập đúng cú pháp. Hãy sử dụng: tx [tài/xỉu] [số xu hoặc Allin]", threadID, messageID);

    const dataMoney = await Currencies.getData(senderID);
    const userData = await Users.getData(senderID);

    if (!dataMoney || !dataMoney.hasOwnProperty('money')) {
      return api.sendMessage("Bạn không có tiền.", threadID, messageID);
    }

    const moneyUser = dataMoney.money;
    const choose = args[0].toLowerCase();

    if (choose !== 'tài' && choose !== 'xỉu')
      return api.sendMessage("Bạn chưa nhập đúng cú pháp. Hãy sử dụng: tx [tài/xỉu] [số xu hoặc Allin]", threadID, messageID);

    if (!args[1])
      return api.sendMessage("Bạn chưa nhập đúng cú pháp. Hãy sử dụng: tx [tài/xỉu] [số xu hoặc Allin]", threadID, messageID);

    let money = 0;
    const maxBet = 20000;

    if (args[1].toLowerCase() === 'allin') {
      money = moneyUser;
    } else {
      money = parseInt(args[1]);
      if (money < 10 || isNaN(money) || money > maxBet)
        return api.sendMessage("Mức đặt cược không hợp lệ hoặc cao hơn 20K xu!!!", threadID, messageID);
      if (moneyUser < money)
        return api.sendMessage(`Số dư của bạn không đủ ${money} xu để chơi`, threadID, messageID);
    }

    const rollDice = () => {
      return Math.floor(Math.random() * 6) + 1;
    };

    const dices = [rollDice(), rollDice(), rollDice()];
    const totalDice = dices.reduce((sum, dice) => sum + dice, 0);

    let result = '';
    let winnings = 0;
    let taxRate = 0.01;

    if (money >= 10000) {
      taxRate = 0.01;
    }

    if (totalDice === 3) {
      if (choose === 'xỉu') {
        result = 'thắng';
        winnings = money * 10;
      } else {
        result = 'thua';
      }
    } else if (totalDice === 18) {
      if (choose === 'tài') {
        result = 'thắng';
        winnings = money * 10;
      } else {
        result = 'thua';
      }
    } else if (choose === 'xỉu' && totalDice >= 4 && totalDice <= 10) {
      result = 'thắng';
      const tax = Math.floor(money * taxRate);
      const totalMoney = money - tax;
      winnings = totalMoney;
    } else if (choose === 'tài' && totalDice >= 11 && totalDice <= 17) {
      result = 'thắng';
      const tax = Math.floor(money * taxRate);
      const totalMoney = money - tax;
      winnings = totalMoney;
    } else {
      result = 'thua';
    }

    let winnerName = userData.name;
    if (result !== 'thắng') {
      winnerName = "Bot";
    }

    if (result === 'thắng') {
      const tax = Math.floor(money * taxRate);
      await Currencies.decreaseMoney(senderID, tax);
      await Currencies.increaseMoney(taxRecipientUID, tax);
      await Currencies.increaseMoney(senderID, winnings);

      await sendResultWithImages(
        api,
        threadID,
        `🎲 ❄️ Kết quả: ${dices.join(' + ')} = ${totalDice}\n${winnerName} đã ${result}! 💰💰💰\nSố tiền đặt cược: ${money.toFixed(0)} xu\nTiền thắng: ${winnings.toFixed(0)} xu\nThuế (-${(taxRate * 100).toFixed(0)}%): ${tax.toFixed(0)} xu\nTiền thuế đã được chuyển tới ADMIN để Phát Lộc`,
        dices
      );
    } else {
      await Currencies.decreaseMoney(senderID, parseInt(money));
      await sendResultWithImages(
        api,
        threadID,
        `🎲 ❄️ Kết quả: ${dices.join(' + ')} = ${totalDice}\n${winnerName} đã ${result}! 😢😢😢\nSố tiền đặt cược: ${money.toFixed(0)} xu\nChúc bạn may mắn lần sau! 🍀🍀🍀`,
        dices
      );
    }
  } catch (error) {
    console.error("Lỗi trong quá trình thực hiện lệnh:", error);
    api.sendMessage("Đã xảy ra lỗi trong quá trình thực hiện lệnh. Vui lòng thử lại sau.", threadID, messageID);
  }
};
