module.exports.config = {
  name: "updatedata",
  version: "1.0",
  hasPermission: 2,
  credits: "Hoàng Ngọc Từ",
  description: "Cập nhật dữ liệu cho các nhóm",
  commandCategory: "System",
  usePrefix: true,
  usages: "updatedata",
  cooldowns: 5,
};

module.exports.run = async function ({ event, api, Threads }) {
  const { threadID } = event;
  const { setData } = Threads;

 
  const resetColor = "\x1b[0m";
  const colors = [
    "\x1b[31m", 
    "\x1b[32m", 
    "\x1b[33m", 
    "\x1b[34m", 
    "\x1b[35m", 
    "\x1b[36m", 
  ];


  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  try {
    console.log(getRandomColor() + "Bắt đầu lấy danh sách các nhóm..." + resetColor);
    const inbox = await api.getThreadList(100, null, ['INBOX']);
    const groupList = inbox.filter(group => group.isSubscribed && group.isGroup);
    const lengthGroup = groupList.length;

    console.log(getRandomColor() + `Tìm thấy ${lengthGroup} nhóm cần cập nhật.` + resetColor);
    for (const groupInfo of groupList) {
      console.log(getRandomColor() + `Đang cập nhật dữ liệu cho nhóm ID: ${groupInfo.threadID}` + resetColor);
      const threadInfo = await api.getThreadInfo(groupInfo.threadID);
      await Threads.setData(groupInfo.threadID, { threadInfo });
      console.log(getRandomColor() + `Đã cập nhật xong dữ liệu cho nhóm ID: ${groupInfo.threadID}` + resetColor);
    }

    api.sendMessage(`Dữ liệu đã được cập nhật cho ${lengthGroup} nhóm.`, threadID);
    console.log(getRandomColor() + `Đã cập nhật xong dữ liệu cho ${lengthGroup} nhóm.` + resetColor);
  } catch (error) {
    console.error(getRandomColor() + "Đã xảy ra lỗi:" + resetColor, error);
    api.sendMessage("Đã xảy ra lỗi khi cập nhật dữ liệu cho các nhóm.", threadID);
  }
};
