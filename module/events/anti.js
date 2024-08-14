module.exports.config = {
  name: "anti",
  eventType: ["log:thread-name", "log:user-nickname", "log:unsubscribe"],
  version: "1.1.1",
  credits: "DC-Nam",
  description: "Anti",
  envConfig: {
    antinamebot: {
      status: true
    }
  }
};

module.exports.run = async function ({ event, api, Threads }) {
  const { threadID, logMessageType, logMessageData, logMessageBody, author } = event;
  const { anti, BOTNAME } = global.config;
  const botID = api.getCurrentUserID();
  let getDataThread = await Threads.getData(threadID) || {};
  const { data, threadInfo } = getDataThread;
  
  switch (logMessageType) {
    case "log:unsubscribe": {
      const outID = logMessageData.leftParticipantFbId;
      const outName = logMessageBody.replace("đã rời khỏi nhóm.", "");
      const { antiout } = data || {};
      
      if (antiout && author === outID && outID !== botID && (antiout.status === true || antiout.status === undefined)) {
        await api.addUserToGroup(outID, threadID, (err) => {
          if (err) {
            return api.sendMessage(`[𝐀𝐧𝐭𝐢𝐨𝐮𝐭] » Không thể add người dùng vừa out chùa lại nhóm :(`, threadID);
          } else {
            return api.sendMessage(`[𝐀𝐧𝐭𝐢𝐨𝐮𝐭] » Đã add ${outName}vừa out chùa lại nhóm`, threadID);
          }
        });
      }
      break;
    }
  }
};

function PREFIX(t) {
  var dataThread = global.data.threadData.get(t) || {};
  return dataThread.PREFIX || global.config.PREFIX;
}
