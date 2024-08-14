const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "contact",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Xem thông tin liên lạc với admin.",
  commandCategory: "Tiện ích",
  usePrefix: true,
  usages: "contact",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const adminContactInfo = `
Chào Các Users Thân Mến, 🌟

Hôm nay, mình muốn chia sẻ với các bạn một câu chuyện đặc biệt về 𝗔𝗞𝗜𝗕𝗢𝗧, một bot mang trong mình tình cảm và sự sáng tạo cá nhân. 💖🌈

𝗔𝗞𝗜𝗕𝗢𝗧 không phải là sản phẩm của một tập đoàn lớn, mà là kết quả của đam mê và sự thử nghiệm cá nhân. Mỗi dòng code đều chứa đựng một phần tâm huyết và sự sáng tạo của người tạo ra nó. 🌱✨

Khi 𝗔𝗞𝗜𝗕𝗢𝗧 tương tác với bạn, đó là những khoảnh khắc ý nghĩa, nơi sự cố gắng và lòng nhiệt huyết được thể hiện. Đây không chỉ là một công cụ, mà là một phần của câu chuyện lớn hơn về sự nỗ lực và tình yêu. 💬🌠

Chúng tớ tự hào về 𝗔𝗞𝗜𝗕𝗢𝗧 không phải vì sự hoàn hảo, mà vì nó là một phần của trái tim và tâm hồn của mình. Mỗi lần 𝗔𝗞𝗜𝗕𝗢𝗧 hoạt động, mình cảm thấy niềm hạnh phúc giản dị và tự hào. 🌺💫

Cảm ơn các bạn đã đồng hành cùng mình! Nếu bạn muốn kết nối thêm, hãy tham gia group Messenger của ADMIN hoặc theo dõi chúng mình trên Facebook qua đường link https://beacons.ai/kenjiakira

Với tất cả sự chân thành và lòng nhiệt huyết,


  `;

  const gifPath = path.join(__dirname, 'contact' , 'contact.gif');

  api.sendMessage({
    body: adminContactInfo,
    attachment: fs.createReadStream(gifPath)
  }, threadID, messageID);
};
