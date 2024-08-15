module.exports.config = {
  name: "top",
  version: "1.0.4",
  hasPermission: 0,
  credits: "Mirai Team Mod By Hoàng Ngọc Từ",
  description: "Xem danh sách 10 người giàu nhất trong server",
  commandCategory: "Tài Chính",
  usePrefix: true,
  usages: ".top",
  cooldowns: 10
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID } = event;

  const localeText = {
    topmoney_title: `💰 Danh sách 10 người giàu nhất:`,
    topmoney_entry: "\n%1. %2: %3 xu%4"
  };

  const allUsers = await Users.getAll(['name', 'money']);
  const richUsers = allUsers.filter(user => user.money > 0);

  richUsers.sort((a, b) => b.money - a.money);

  const topUsers = richUsers.slice(0, 10);

  let topMoneyMessage = localeText.topmoney_title + "\n";

  topUsers.forEach((user, index) => {
    const rank = index + 1;
    const username = user.name;
    const formattedBalance = formatNumber(user.money);
    
    // Chỉ thêm danh hiệu cho top 1, 2, 3
    let title = '';
    if (rank === 1) title = " - Người đứng đầu🥇";
    else if (rank === 2) title = " - Nhà đầu tư bạc🥈";
    else if (rank === 3) title = " - Nhà đầu tư đồng🥉";

    topMoneyMessage += localeText.topmoney_entry.replace('%1', rank).replace('%2', username).replace('%3', formattedBalance).replace('%4', title) + "\n";
  });

  api.sendMessage(topMoneyMessage, threadID, messageID);
};

function formatNumber(number) {
  const [integerPart, decimalPart] = number.toFixed(2).split(".");
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedIntegerPart},${decimalPart}`;
}
