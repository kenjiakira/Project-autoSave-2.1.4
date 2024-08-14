module.exports.config = {
  name: "adminNoti",
  eventType: [
    "log:thread-admins",
    "log:thread-name",
    "log:user-nickname",
    "log:thread-call",
    "log:thread-icon",
    "log:thread-color",
    "log:link-status",
    "log:magic-words",
    "log:thread-approval-mode",
    "log:thread-poll"
  ],
  version: "1.0.1",
  credits: "Akira",
  description: "Group Information Update",
  envConfig: {
    autoUnsend: true,
    sendNoti: true,
    timeToUnsend: 10
  }
};

module.exports.run = async function({ event, api, Threads, Users }) {
  const { author, threadID, logMessageType, logMessageData, logMessageBody } = event;
  const { setData, getData } = Threads;
  const fs = require("fs");
  const iconPath = __dirname + "/cache/emoji.json";
  if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
  if (author === threadID) return;

  try {
    let dataThread = (await getData(threadID)).threadInfo;

    const getUserName = async (id) => {
      const userInfo = await Users.getData(id);
      return userInfo.name;
    };

    switch (logMessageType) {
      case "log:thread-admins": {
        if (logMessageData.ADMIN_EVENT === "add_admin") {
          dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
          const userName = await getUserName(logMessageData.TARGET_ID);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ USER UPDATE ${userName} Trở thành quản trị viên nhóm`, threadID);
        } else if (logMessageData.ADMIN_EVENT === "remove_admin") {
          dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id !== logMessageData.TARGET_ID);
          const userName = await getUserName(logMessageData.TARGET_ID);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ Xóa vị trí quản trị viên của người dùng ${userName}`, threadID);
        }
        break;
      }
      case "log:user-nickname": {
        const { participant_id, nickname } = logMessageData;
        if (participant_id && nickname) {
          dataThread.nicknames = dataThread.nicknames || {};
          dataThread.nicknames[participant_id] = nickname;
          const participantName = await getUserName(participant_id);
          const formattedNickname = nickname || "Biệt danh đã xóa";
          api.sendMessage(`[ GROUP ]\n❯ Cập nhật biệt danh cho ${participantName}: ${formattedNickname}.`, threadID);
        }
        break;
      }
      case "log:thread-name": {
        dataThread.threadName = logMessageData.name || null;
        api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(dataThread.threadName) ? `Đã cập nhật Tên nhóm thành: ${dataThread.threadName}` : 'Đã xóa tên nhóm'}.`, threadID);
        break;
      }
      case "log:thread-icon": {
        const preIcon = JSON.parse(fs.readFileSync(iconPath));
        dataThread.threadIcon = logMessageData.thread_icon || "👍";
        if (global.configModule[this.config.name].sendNoti) {
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${logMessageBody.replace("emoji", "icon")}\n❯ Original Emoji: ${preIcon[threadID] || "unknown"}`, threadID, async (error, info) => {
            preIcon[threadID] = dataThread.threadIcon;
            fs.writeFileSync(iconPath, JSON.stringify(preIcon));
            if (global.configModule[this.config.name].autoUnsend) {
              await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
              return api.unsendMessage(info.messageID);
            }
          });
        }
        break;
      }
      case "log:thread-call": {
        if (logMessageData.event === "group_call_started") {
          const name = await getUserName(logMessageData.caller_id);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} STARTED A ${(logMessageData.video) ? 'VIDEO ' : ''}CALL.`, threadID);
        } else if (logMessageData.event === "group_call_ended") {
          const callDuration = logMessageData.call_duration;
          const hours = Math.floor(callDuration / 3600);
          const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
          const seconds = callDuration - (hours * 3600) - (minutes * 60);
          const timeFormat = `${hours}:${minutes}:${seconds}`;
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(logMessageData.video) ? 'Video' : ''} Cuộc gọi đã kết thúc.\n❯ Thời lượng cuộc gọi: ${timeFormat}`, threadID);
        } else if (logMessageData.joining_user) {
          const name = await getUserName(logMessageData.joining_user);
          api.sendMessage(`❯ [ GROUP UPDATE ]\n❯ ${name} Tham gia ${(logMessageData.group_call_type == '1') ? 'Video' : ''} call.`, threadID);
        }
        break;
      }
      case "log:link-status": {
        api.sendMessage(logMessageBody, threadID);
        break;
      }
      case "log:magic-words": {
        api.sendMessage(`» [ GROUP UPDATE ] Đề tài ${logMessageData.magic_word} Hiệu ứng bổ sung: ${logMessageData.theme_name}\nEmoij: ${logMessageData.emoji_effect || "No emoji "}\nTotal ${logMessageData.new_magic_word_count} word effect added`, threadID)
        break;
      }
      case "log:thread-poll": {
        const obj = JSON.parse(logMessageData.question_json);
        if (logMessageData.event_type === "question_creation" || logMessageData.event_type === "update_vote") {
          api.sendMessage(logMessageBody, threadID);
        }
        break;
      }
      case "log:thread-approval-mode": {
        api.sendMessage(logMessageBody, threadID);
        break;
      }
      case "log:thread-color": {
        dataThread.threadColor = logMessageData.thread_color || "🌤";
        if (global.configModule[this.config.name].sendNoti) {
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${logMessageBody.replace("Theme", "color")}`, threadID, async (error, info) => {
            if (global.configModule[this.config.name].autoUnsend) {
              await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
              return api.unsendMessage(info.messageID);
            }
          });
        }
        break;
      }
    }

    await setData(threadID, { threadInfo: dataThread });
  } catch (error) {
    console.log(error);
  }
};
