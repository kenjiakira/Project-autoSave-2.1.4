const axios = require('axios');
const translate = require('translate-google');

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "câu hỏi vui",
  usePrefix: true,
  commandCategory: "game",
  usages: "quiz",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { correctAnswer, answers, messageID } = handleReply;
  const validOptions = ['a', 'b', 'c', 'd'];
  const userChoice = event.body.toLowerCase();

  if (!validOptions.includes(userChoice)) {
    return api.sendMessage("Vui lòng chỉ chọn A, B, C, hoặc D.", event.threadID, event.messageID);
  }

  const correctIndex = answers.indexOf(correctAnswer);

  let response;
  if (userChoice === validOptions[correctIndex]) {
    response = `Chính xác! Đáp án đúng là ${String.fromCharCode(65 + correctIndex)}.`;
  } else {
    response = `Sai rồi. Đáp án đúng là ${String.fromCharCode(65 + correctIndex)}: ${correctAnswer}.`;
  }

  api.sendMessage(response, event.threadID, () => {
    setTimeout(() => {
      api.unsendMessage(messageID);
    }, 0);
  });

  const index = global.client.handleReply.findIndex(reply => reply.messageID === messageID);
  if (index !== -1) {
    global.client.handleReply.splice(index, 1);
  }
};

module.exports.run = async function({ api, event }) {
  try {
    const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const questionData = res.data.results[0];
    const { question, correct_answer, incorrect_answers } = questionData;

    const answers = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);
    const correctIndex = answers.indexOf(correct_answer);

    const translatedData = await translate([
      question,
      ...answers
    ], { to: 'vi' });

    const translatedQuestion = translatedData[0];
    const translatedAnswers = translatedData.slice(1);
    const options = translatedAnswers.map((answer, index) => `${String.fromCharCode(65 + index)}. ${answer}`).join('\n');

    const questionText = `${translatedQuestion}\n\n${options}`;

    api.sendMessage(questionText, event.threadID, (error, info) => {
      const messageID = info.messageID;

      global.client.handleReply.push({
        type: "quiz",
        name: this.config.name,
        author: event.senderID,
        messageID,
        question,
        correctAnswer: translatedAnswers[correctIndex],
        answers: translatedAnswers
      });

      setTimeout(() => {
        const index = global.client.handleReply.findIndex(reply => reply.messageID === messageID);
        if (index !== -1) {
          api.sendMessage("Hết thời gian trả lời câu hỏi.", event.threadID);
          global.client.handleReply.splice(index, 1);
        } else {
          console.log("Không tìm thấy messageID trong global.client.handleReply:", messageID);
        }
      }, 30000); 
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("Đã xảy ra lỗi khi lấy câu hỏi. Vui lòng thử lại sau.", event.threadID, event.messageID);
  }
};
