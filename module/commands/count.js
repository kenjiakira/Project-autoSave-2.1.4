module.exports.config = {
  name: "count",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Blue & Yan Maglinte",
  description: "Đếm số ký tự văn bản",
  usePrefix: true,
  commandCategory: "utilities",
  usages: "Cách sử dụng lệnh count:\n\nNhập .count [input] vào nhóm chat.\nThay [input] bằng chuỗi bạn muốn đếm.\n\nVí dụ:\nĐể đếm số từ, đoạn văn và ký tự chữ và số trong chuỗi Hello world!, bạn nhập: .count Hello world!\nBot sẽ trả về kết quả là: ❯ Có 2 từ(s), 1 đoạn(s), và 10 (Các) ký tự chữ và số trong input.\n\nNhư vậy, bạn có thể sử dụng lệnh count để đếm các thành phần trong một chuỗi input nhất định.",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = function({ api, event, args }) {
  const inputStr = args.join(" ");
  const wordCount = inputStr.split(" ").length;
  const paragraphCount = (inputStr.match(/\n\n/g) || []).length + 1;
  const alphanumericCount = (inputStr.match(/[a-zA-Z0-9]/g) || []).length;

  api.sendMessage(`❯ Có${wordCount} kỹ tự, ${paragraphCount} đoạn, và ${alphanumericCount} ký tự chữ và số trong input.`, event.threadID);
};
