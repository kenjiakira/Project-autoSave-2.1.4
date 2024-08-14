module.exports.config = {
  name: "all",
  version: "1.0.4",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "tag toàn bộ thành viên",
  commandCategory: "Box chat",
  usePrefix: true,
  usages: "Tag mọi người bằng cách gõ .all <văn bản>",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
  try {
    const botID = api.getCurrentUserID();
    const listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
    var body = (args.length != 0) ? args.join(" ") : "@mọi người", mentions = [], index = 0;

    for (const idUser of listUserID) {
      body = "‎" + body;
      mentions.push({ id: idUser, tag: body, fromIndex: index - 1 });
      index -= 1;
    }

    return api.sendMessage({ body, mentions }, event.threadID, event.messageID);

  }
  catch (e) { return console.log(e); }
}