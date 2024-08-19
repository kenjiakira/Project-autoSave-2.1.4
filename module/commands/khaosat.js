const fs = require('fs-extra');
const path = require('path');
const lockfile = require('lockfile');

const surveyQuestions = [
  "Bạn có thường xuyên sử dụng bot không?\n1. Có\n2. Không",
  "Bạn thấy bot có dễ sử dụng không? \n1. Rất dễ \n2. Dễ \n3. Bình thường \n4. Khó \n5. Rất khó",
  "Bạn có hài lòng với tốc độ phản hồi của bot không? \n1. Rất hài lòng \n2. Hài lòng \n3. Bình thường \n4. Không hài lòng \n5. Rất không hài lòng",
  "Bạn có gặp vấn đề gì khi sử dụng bot không? \n1. Có \n2. Không",
  "Bạn muốn thêm tính năng gì cho bot? \n1. Chat tự động \n2. Game mới \n3. Tiện ích mới \n4. Khác",
  "Bạn có thấy thông tin trong bot rõ ràng không? \n1. Rõ ràng \n2. Bình thường \n3. Không rõ ràng",
  "Bạn có khuyến nghị bot này cho người khác không? \n1. Có \n2. Không",
  "Bạn nghĩ mức độ thân thiện của bot như thế nào? \n1. Rất thân thiện \n2. Thân thiện \n3. Bình thường \n4. Không thân thiện \n5. Rất không thân thiện",
  "Bạn có thích giao diện và thiết kế của bot không? \n1. Có \n2. Bình thường \n3. Không",
  "Bạn có hài lòng với sự hỗ trợ của đội ngũ phát triển bot không? \n1. Rất hài lòng \n2. Hài lòng \n3. Bình thường \n4. Không hài lòng \n5. Rất không hài lòng"
];

const dataFilePath = path.resolve(__dirname, 'json', 'khaosat.json');
const rewardFilePath = path.resolve(__dirname, 'json', 'rewardks.json');
const lockPath = dataFilePath + '.lock';

function readJsonFile() {
  return new Promise((resolve, reject) => {
    lockfile.lock(lockPath, { wait: 5000 }, (err) => {
      if (err) return reject(err);

      fs.readJson(dataFilePath, (err, data) => {
        lockfile.unlock(lockPath, () => {});
        if (err) return reject(err);
        resolve(data);
      });
    });
  });
}

function writeJsonFile(data) {
  return new Promise((resolve, reject) => {
    lockfile.lock(lockPath, { wait: 5000 }, (err) => {
      if (err) return reject(err);

      fs.writeJson(dataFilePath, data, { spaces: 2 }, (err) => {
        lockfile.unlock(lockPath, () => {});
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

module.exports.config = {
  name: "khaosat",
  version: "1.0.2",
  hasPermission: 0,
  credits: "HNT",
  description: "Khởi tạo khảo sát ý kiến người dùng",
  commandCategory: "utilities",
  usePrefix: true,
  usages: "khaosat start - Bắt đầu khảo sát",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;

  let rewardsData = await fs.readJson(rewardFilePath, { default: {} });

  if (rewardsData[senderID]) {
    return api.sendMessage("Bạn đã hoàn tất khảo sát và nhận phần thưởng. Cảm ơn bạn!", threadID, messageID);
  }

  if (args[0] === "start") {
    try {
      let data = await readJsonFile();

      if (!data[senderID]) {
        data[senderID] = Array(surveyQuestions.length).fill(null);
        await writeJsonFile(data);
      }

      const questionIndex = data[senderID].indexOf(null);
      if (questionIndex !== -1) {
        const question = surveyQuestions[questionIndex];
        return api.sendMessage(question, threadID, async (error, info) => {
          if (error) {
            console.error("Lỗi khi gửi câu hỏi khảo sát:", error);
          }
          global.client.handleReply.push({
            type: "survey",
            name: this.config.name,
            author: senderID,
            questionIndex: questionIndex,
            messageID: info.messageID
          });
        });
      }

      api.sendMessage("Bạn đã hoàn tất khảo sát. Cảm ơn bạn!", threadID, messageID);
    } catch (error) {
      console.error("Lỗi khi xử lý khảo sát:", error);
      api.sendMessage("Đã xảy ra lỗi khi bắt đầu khảo sát. Vui lòng thử lại sau.", threadID, messageID);
    }
  } else {
    api.sendMessage("⚠️ Vui lòng sử dụng cú pháp: khaosat start để bắt đầu khảo sát.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ event: e, api, handleReply, Currencies }) => {
  const { threadID, senderID } = e;

  try {
    let data = await readJsonFile();
    let rewardsData = await fs.readJson(rewardFilePath, { default: {} });

    if (!data[senderID]) {
      return api.sendMessage("Bạn không thể trả lời câu hỏi này vì chưa bắt đầu khảo sát.", threadID, e.messageID);
    }

    if (rewardsData[senderID]) {
      return api.sendMessage("Bạn đã hoàn tất khảo sát và nhận phần thưởng. Cảm ơn bạn!", threadID, e.messageID);
    }

    const answer = e.body.trim();
    const questionIndex = handleReply.questionIndex;

    if (!["1", "2", "3", "4", "5"].includes(answer)) {
      return api.sendMessage("⚡ Vui lòng chọn một trong các đáp án từ 1 đến 5.", threadID, e.messageID);
    }

    data[senderID][questionIndex] = answer;

    await writeJsonFile(data);

    if (data[senderID].includes(null)) {
      const nextQuestionIndex = data[senderID].indexOf(null);
      const nextQuestion = surveyQuestions[nextQuestionIndex];
      api.sendMessage(nextQuestion, threadID, async (error, info) => {
        if (error) {
          console.error("Lỗi khi gửi câu hỏi khảo sát:", error);
        }
        global.client.handleReply.push({
          type: "survey",
          name: this.config.name,
          author: senderID,
          questionIndex: nextQuestionIndex,
          messageID: info.messageID
        });
      });
    } else {
      await fs.writeJson(rewardFilePath, { ...rewardsData, [senderID]: true }, { spaces: 2 });
      await Currencies.increaseMoney(senderID, 50000);
      api.sendMessage("Bạn đã hoàn tất khảo sát và nhận được 50k xu. Cảm ơn bạn!", threadID, e.messageID);
    }
  } catch (error) {
    console.error("Lỗi khi xử lý phản hồi khảo sát:", error);
    api.sendMessage("Đã xảy ra lỗi khi xử lý phản hồi của bạn. Vui lòng thử lại sau.", threadID, e.messageID);
  }
};
