const axios = require('axios');

module.exports.config = {
  name: "wiki",
  version: "1.0.0",
  hasPermission: 0,
  credits: "HNT",
  description: "Tra cứu thông tin từ Wikipedia.",
  usePrefix: true,
  commandCategory: "utilities",
  usages: "wiki [từ khóa]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function({ api, event, args }) {
  const searchTerm = args.join(" ");
  if (!searchTerm) return api.sendMessage("Bạn chưa nhập từ khóa cần tra cứu trên Wikipedia.", event.threadID);

  const apiUrl = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;

  try {
    const response = await axios.get(apiUrl);
    const wikiData = response.data;

    if (wikiData.title && wikiData.extract) {
      const message = `📚 Wikipedia: ${wikiData.title}\n\n${wikiData.extract}\n\nĐọc thêm: ${wikiData.content_urls.desktop.page}`;
      api.sendMessage(message, event.threadID);
    } else {
      api.sendMessage("Không tìm thấy thông tin từ khóa này trên Wikipedia.", event.threadID);
    }
  } catch (error) {
    api.sendMessage("Không thể truy xuất thông tin từ Wikipedia vào lúc này. Vui lòng thử lại sau.", event.threadID);
  }
};
