module.exports.config = {
  name: "unsend",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Akira",
  description: "Gỡ tin nhắn của Bot",
  usePrefix: true,
  commandCategory: "message",
  usages: "Gỡ tin nhắn bằng cách reply tin nhắn cần gỡ với lệnh Unsend",
  cooldowns: 0,
  emoji: {
    delete: "👍"
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, messageReply, senderID } = event;
  const currentUserID = api.getCurrentUserID();
  const { emojis } = module.exports.config;

  try {
    if (event.type === "message_reply") {
      if (messageReply.senderID !== currentUserID && messageReply.senderID !== senderID) {
        return api.sendMessage("⚠️ Bạn không thể gỡ tin nhắn của người khác.", threadID, messageID);
      }
      await api.unsendMessage(messageReply.messageID);
      return;
    }

    if (event.type === "message_reaction") {
      if (event.reaction === emojis.delete) {
        if (event.senderID === currentUserID) {  
          await api.unsendMessage(event.messageID);
          return;
        } else {
          return api.sendMessage("⚠️ Bạn không thể gỡ tin nhắn của người khác.", threadID, messageID);
        }
      }
    }
    
    return api.sendMessage("⚠️ Hãy reply tin nhắn hoặc thả emoji '👍' để gỡ tin nhắn.", threadID, messageID);
  } catch (error) {
    console.error("Lỗi khi gỡ tin nhắn:", error);
    return api.sendMessage("⚠️ Đã xảy ra lỗi khi gỡ tin nhắn. Vui lòng thử lại sau.", threadID, messageID);
  }
};
