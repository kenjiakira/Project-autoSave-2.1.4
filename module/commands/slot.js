const slotSymbols = ["🍒", "🍋", "🍇", "🍀", "🍉", "🍊", "🍎", "💎", "⭐"];
const betAmounts = [100, 500, 1000, 2000, 5000];
const taxRecipientUID = "100029043375434";
const wildSymbol = "💎"; 
const scatterSymbol = "⭐"; 
const jackpotAmount = 100000;

module.exports.config = {
  name: "slot",
  version: "3.0.0",
  hasPermission: 0,
  credits: "HNT",
  description: "Mini game",
  commandCategory: "game",
  usePrefix: true,
  usages: "Sử dụng: .slot [cược]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
  const { senderID, threadID } = event;

  const userData = await Currencies.getData(senderID);
  const user = await Users.getData(senderID);

  if (!userData) {
    await Currencies.setData(senderID, { money: 0 });
  }

  const userMoney = userData.money || 0;
  const bet = parseInt(args[0]);

  if (!betAmounts.includes(bet)) {
    return api.sendMessage("❌ Vui lòng chọn một mức cược hợp lệ: " + betAmounts.join(", "), threadID);
  }

  if (userMoney < bet) {
    return api.sendMessage("❌ Số dư của bạn không đủ để đặt cược " + formatNumber(bet) + " xu.", threadID);
  }

  const spinResult = [];
  for (let i = 0; i < 3; i++) {
    const randomSymbolIndex = Math.floor(Math.random() * slotSymbols.length);
    spinResult.push(randomSymbolIndex);
  }

  const spinResultText = spinResult.map(index => slotSymbols[index]).join(" ");

  const symbolCounts = spinResult.reduce((acc, index) => {
    acc[index] = (acc[index] || 0) + 1;
    return acc;
  }, {});

  const uniqueSymbols = Object.values(symbolCounts);

  let message = `🎰 Kết quả: ${spinResultText}\n`;
  let winAmount = 0;
  let multiplier = 0;
  const winnerName = user.name;

  if (uniqueSymbols.includes(3)) {
    if (spinResult.includes(slotSymbols.indexOf(wildSymbol))) {
      multiplier = 10;
    } else {
      multiplier = 5;
    }
  } else if (uniqueSymbols.includes(2)) {
    multiplier = 2;
  }

  if (multiplier > 0) {
    winAmount = bet * 1.45 * multiplier;
    message += `🎉 Chúc mừng! ${winnerName} đã thắng ${formatNumber(winAmount)} xu với hệ số ${multiplier}x.\n`;

    const tax = Math.floor(winAmount * 0.01);
    winAmount -= tax;

    if (taxRecipientUID === senderID) {
      message += `👏 Bạn đã nhận được ${formatNumber(winAmount)} xu\n(thuế 1%: ${formatNumber(tax)} xu).`;
    } else {
      await Currencies.increaseMoney(senderID, winAmount);
      await Currencies.increaseMoney(taxRecipientUID, tax);
      message += `👏 ${winnerName} đã nhận được ${formatNumber(winAmount)} xu.\n👏 Thuế đã trừ: ${formatNumber(tax)} xu.`;
    }
  } else if (spinResult.every(index => slotSymbols[index] === wildSymbol)) {
    message += `🎉 Chúc mừng! ${winnerName} đã thắng Jackpot trị giá ${formatNumber(jackpotAmount)} xu!`;
    await Currencies.increaseMoney(senderID, jackpotAmount);
  } else {
    await Currencies.decreaseMoney(senderID, bet);
    message += `😢 Rất tiếc, ${winnerName} đã thua ${formatNumber(bet)} xu. Hãy thử lại may mắn ở lần sau.`;
  }

  api.sendMessage(message, threadID);
};

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
}
