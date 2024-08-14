const adminUIDs = ["100029043375434"];

module.exports.config = {
  name: "reset",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Yae Miko",
  description: "Reset số Xu người dùng",
  commandCategory: "Hệ Thống",
  usePrefix: true,
  usages: "reset [%]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const percentageInput = args[0];

  if (!percentageInput) {
   
    const threadList = await api.getThreadList(100, null, ["INBOX"]); 

    for (const thread of threadList) {
      const threadID = thread.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const threadMembers = threadInfo.userInfo;

      for (const member of threadMembers) {
        const userID = member.id;
        await Currencies.setData(userID, { money: 0 });
      }
    }

    return api.sendMessage("Toàn bộ số tiền của thành viên trong server đã được xóa!", event.threadID);
  }

  const percentage = parseInt(percentageInput);

  if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
    return api.sendMessage("Vui lòng nhập một phần trăm hợp lệ từ 1 đến 100 hoặc không nhập để xóa toàn bộ tiền!", event.threadID);
  }

  const senderID = event.senderID;

  if (!adminUIDs.includes(senderID)) {
    return api.sendMessage("Bạn không có quyền truy cập vào chức năng này!", event.threadID);
  }

  const threadList = await api.getThreadList(100, null, ["INBOX"]); 

  for (const thread of threadList) {
    const threadID = thread.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const threadMembers = threadInfo.userInfo;

    for (const member of threadMembers) {
      const userID = member.id;
      const currenciesData = await Currencies.getData(userID);

      if (currenciesData !== false) {
        const money = currenciesData.money || 0;

        if (money > 0) {
          const reducedMoney = Math.ceil(money * (percentage / 100)); 
          await Currencies.setData(userID, { money: reducedMoney });
        }
      }
    }
  }

  return api.sendMessage(`Số tiền của tất cả thành viên trong server đã được reset về ${percentage}%!`, event.threadID);
};
