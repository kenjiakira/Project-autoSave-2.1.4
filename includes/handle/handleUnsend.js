module.exports = function({ api, Users }) {
  return function({ event, Users, args }) {
    const { senderID, reaction, messageID, threadID, type } = event;
    const currentUserID = api.getCurrentUserID();
    const emojiToDelete = "👍"; 

    if (type === "message_reaction") {

      if (reaction === emojiToDelete) {

        if (senderID === currentUserID) {
    
          return api.unsendMessage(messageID);
        } else {

          return api.sendMessage("⚠️ Bạn không thể gỡ tin nhắn của người khác.", threadID, messageID);
        }
      }
    }
  }
};
