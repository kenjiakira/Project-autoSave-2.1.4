const fs = require('fs-extra');
const ytdl = require('@distube/ytdl-core');
const Youtube = require('youtube-search-api');
const axios = require('axios');
const path = require('path');

const config = {
  name: "ytb",
  version: "1.0.0",
  hasPermission: 0,
  credits: "HNT",
  description: "Xem video YouTube qua liên kết hoặc từ khóa tìm kiếm",
  usePrefix: true,
  commandCategory: "Phương tiện",
  usages: "[searchVideo]",
  cooldowns: 0
};

const ITAG = 18;

const downloadVideoFromYoutube = async (link, filePath, itag = ITAG) => {
  try {
    const videoID = link.split('v=')[1];
    if (!videoID || videoID.length !== 11) {
      throw new Error('ID video không hợp lệ');
    }

    return new Promise((resolve, reject) => {
      ytdl(link, { filter: format => format.itag === itag })
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          resolve(filePath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  } catch (e) {
    console.error('Lỗi khi tải video từ YouTube:', e);
    throw e;
  }
};

const handleReply = async ({ api, event, handleReply }) => {
  try {
    const videoLink = "https://www.youtube.com/watch?v=" + handleReply.link[event.body - 1];
    const filePath = path.resolve(__dirname, 'cache', `video-${event.senderID}.mp4`);
    await downloadVideoFromYoutube(videoLink, filePath, ITAG);

    if (fs.statSync(filePath).size > 26214400) {
      fs.unlinkSync(filePath);
      return api.sendMessage('⚠️ Video này quá lớn để gửi (trên 25MB).', event.threadID, event.messageID);
    }

    api.unsendMessage(handleReply.messageID);

    const message = {
      body: `❍━━━━━━━━━━━━❍\n📺 Video: ${handleReply.title[event.body - 1]}\n❍━━━━━━━━━━━━❍`,
      attachment: fs.createReadStream(filePath),
    };

    return api.sendMessage(message, event.threadID, () => {
      fs.unlinkSync(filePath);
    }, event.messageID);
  } catch (error) {
    console.log('Lỗi khi xử lý phản hồi:', error);
    api.sendMessage('⚠️ Đã xảy ra lỗi khi gửi tin nhắn.', event.threadID, event.messageID);
  }
};

const run = async function({ api, event, args }) {
  if (!args?.length) return api.sendMessage('❯ Tìm kiếm không được để trống!', event.threadID, event.messageID);

  const keywordSearch = args.join(" ");

  if (args[0]?.startsWith("https://")) {
    try {
      const filePath = path.resolve(__dirname, 'cache', `video-${event.senderID}.mp4`);
      await downloadVideoFromYoutube(args[0], filePath, ITAG);

      if (fs.statSync(filePath).size > 26214400) {
        fs.unlinkSync(filePath);
        return api.sendMessage('⚠️ Video này quá lớn để gửi (trên 25MB).', event.threadID, event.messageID);
      }

      const message = {
        body: `📺 Đây là video bạn yêu cầu:`,
        attachment: fs.createReadStream(filePath),
      };

      return api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    } catch (e) {
      console.log('Lỗi khi tải video từ YouTube:', e);
      api.sendMessage('⚠️ Đã xảy ra lỗi khi tải video.', event.threadID, event.messageID);
    }
  } else {
    try {
      const data = (await Youtube.GetListByKeyword(keywordSearch, false, 6))?.items ?? [];
      const link = data.map(value => value?.id);
      const titles = data.map(value => value?.title);

      const thumbnails = [];

      for (let i = 0; i < data.length; i++) {
        const thumbnailUrl = `https://i.ytimg.com/vi/${data[i]?.id}/hqdefault.jpg`;
        const thumbnailPath = path.resolve(__dirname, 'cache', `thumbnail-${event.senderID}-${i + 1}.jpg`);
        const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(thumbnailPath, Buffer.from(response.data, 'binary'));
        thumbnails.push(fs.createReadStream(thumbnailPath));
      }

      const body = `Có ${link.length} kết quả phù hợp với từ khóa tìm kiếm của bạn:\n\n${data.map((value, index) => `❍━━━━━━━━━━━━❍\n${index + 1} - ${value?.title} (${value?.length?.simpleText})\n\n`).join('')}❯ Vui lòng trả lời để chọn một trong những kết quả tìm kiếm trên`;

      return api.sendMessage({ attachment: thumbnails, body }, event.threadID, (error, info) => {
        for (let i = 0; i < thumbnails.length; i++) {
          fs.unlinkSync(path.resolve(__dirname, 'cache', `thumbnail-${event.senderID}-${i + 1}.jpg`));
        }

        global.client.handleReply.push({
          type: 'reply',
          name: config.name,
          messageID: info.messageID, // Lưu lại messageID để có thể gỡ bỏ sau
          author: event.senderID,
          link,
          title: titles
        });
      }, event.messageID);
    } catch (e) {
      console.log('Lỗi khi tìm kiếm video:', e);
      return api.sendMessage(`⚠️ Đã xảy ra lỗi, vui lòng thử lại sau!!\n${e}`, event.threadID, event.messageID);
    }
  }
};

module.exports = { config, run, handleReply };
