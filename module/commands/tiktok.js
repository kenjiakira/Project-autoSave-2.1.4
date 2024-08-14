const axios = require('axios');
const fs = require('fs');
const path = require('path');

let is_url = (url) => /^http(s|):\/\//.test(url);

let stream_url = async (url, type) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = path.join(__dirname, 'cache', `${Date.now()}.${type}`);
    fs.writeFileSync(filePath, res.data);
    setTimeout(() => fs.unlinkSync(filePath), 1000 * 60); 
    return fs.createReadStream(filePath);
  } catch (error) {
    console.error("Lỗi khi tải tệp từ URL:", error);
    throw new Error("Không thể tải tệp từ URL");
  }
};

module.exports.config = {
  name: 'tiktok',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'HNT',
  description: '🎥 Tải video hoặc hình ảnh từ TikTok 🌟',
  commandCategory: 'Giải trí',
  usages: 'tiktok [URL TikTok]',
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (args.length === 0) {
    return api.sendMessage("⚠️ Vui lòng cung cấp URL TikTok. 📲", threadID, messageID);
  }

  const url = args.join(" ").trim();

  if (!is_url(url)) {
    return api.sendMessage("❌ Vui lòng cung cấp URL hợp lệ. 🌐", threadID, messageID);
  }

  if (/tiktok\.com/.test(url)) {
    try {
      const res = await axios.post(`https://www.tikwm.com/api/`, { url });

      if (res.data.code !== 0) {
        return api.sendMessage("⚠️ Không thể tải nội dung từ URL này. 😢", threadID, messageID);
      }

      const tiktok = res.data.data;
      let attachment = [];

      if (Array.isArray(tiktok.images)) {
        for (let imageUrl of tiktok.images) {
          attachment.push(await stream_url(imageUrl, 'jpg'));
        }
      } else {
        attachment.push(await stream_url(tiktok.play, 'mp4'));
      }

      api.sendMessage({
        body: `🎉==[ TIKTOK DOWNLOAD ]==🎉\n\n🎬 **Tiêu đề**: ${tiktok.title}\n❤️ **Lượt thích**: ${tiktok.digg_count}\n👤 **Tác giả**: ${tiktok.author.nickname}\n🆔 **ID TikTok**: ${tiktok.author.unique_id}`,
        attachment
      }, threadID, messageID);

    } catch (error) {
      console.error("Lỗi trong quá trình xử lý:", error);
      return api.sendMessage("❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. 😥", threadID, messageID);
    }
  } else {
    return api.sendMessage("⚠️ Vui lòng cung cấp URL TikTok hợp lệ. 📲", threadID, messageID);
  }
};
