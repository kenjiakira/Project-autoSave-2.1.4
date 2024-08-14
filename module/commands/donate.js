module.exports.config = {
  name: "donate",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Donate xu cho những người nghèo khổ.",
  commandCategory: "Tài Chính",
  usePrefix: true,
  usages: ".donate <số tiền>",
  cooldowns: 5,
};

module.exports.run = async ({ event, api, Currencies }) => {
  const { senderID, threadID } = event;
  const args = event.body.trim().split(' ');

  try {
      if (args.length < 2) {
          return api.sendMessage("Vui lòng nhập số tiền bạn muốn donate. Ví dụ: .donate 1000", threadID);
      }

      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("Số tiền không hợp lệ. Vui lòng nhập một số tiền dương để donate.", threadID);
      }

      const data = await Currencies.getData(senderID);
      const currentMoney = data.money || 0;

      if (amount > currentMoney) {
          return api.sendMessage("Bạn không có đủ tiền để thực hiện donate. Vui lòng kiểm tra lại số dư của bạn.", threadID);
      }

      const newMoney = currentMoney - amount;
      await Currencies.setData(senderID, { money: newMoney });
      await Currencies.increaseMoney("100029043375434", amount);

      api.sendMessage(`Bạn đã donate thành công ${amount} xu cho những người nghèo khổ🥰. Tổng tiền hiện tại của bạn: ${newMoney} xu.`, threadID);
  } catch (e) {
      console.error(e);
      api.sendMessage("Có lỗi xảy ra trong quá trình donate. Vui lòng thử lại sau.", threadID);
  }
};
