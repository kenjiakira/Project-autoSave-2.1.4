module.exports.config = {
  name: "setname",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Khánh Milo",
  description: "Đặt biệt danh cho người dùng trong nhóm hoặc tất cả thành viên.",
  commandCategory: "group",
  usePrefix: true,
  usages: "setname [tất cả | @user] [biệt danh]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {

  if (args.length < 2) {
    return api.sendMessage("Vui lòng nhập đầy đủ thông tin. Cú pháp: setname [tất cả | @user] [biệt danh]", event.threadID);
  }

  const action = args[0].toLowerCase();
  const name = args.slice(1).join(" ");

  if (!name) {
    return api.sendMessage("Vui lòng nhập biệt danh mới để đặt.", event.threadID);
  }

  if (action === "all") {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const participantIDs = threadInfo.participantIDs;

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    for (let userID of participantIDs) {
      await delay(3000); // Đợi 3 giây giữa các thay đổi
      api.changeNickname(name, event.threadID, userID);
    }

    api.sendMessage("Đã thay đổi biệt danh của tất cả thành viên.", event.threadID);
  } else {
    const targetUserID = action === "reply" ? event.messageReply.senderID : Object.keys(event.mentions)[0];

    if (!targetUserID) {
      return api.sendMessage("Vui lòng đề cập hoặc reply người dùng để đặt biệt danh.", event.threadID);
    }

    api.changeNickname(name, event.threadID, targetUserID, (error) => {
      if (!error) {
        api.sendMessage("Thay đổi biệt danh thành công!", event.threadID);
      } else {
        api.sendMessage("Có lỗi xảy ra khi thay đổi biệt danh.", event.threadID);
      }
    });
  }
};
