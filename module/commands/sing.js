const fs = require('fs-extra');
const ytdl = require('@distube/ytdl-core');
const Youtube = require('youtube-search-api');
const axios = require('axios');
const path = require('path');

const convertHMS = (value) => new Date(value * 1000).toISOString().slice(11, 19);

const config = {
  name: "sing",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Akira",
  description: "Phát nhạc qua liên kết YouTube hoặc từ khóa tìm kiếm",
  usePrefix: true,
  commandCategory: "Phương tiện",
  usages: "[searchMusic]",
  cooldowns: 0
};

const ITAG = 140; 

const downloadMusicFromYoutube = async (link, filePath, itag = ITAG) => {
  try {
    if (!link || typeof link !== 'string' || !link.startsWith('https://www.youtube.com/watch?v=')) {
      throw new Error('Liên kết không hợp lệ');
    }

    const videoID = link.split('v=')[1];
    if (!videoID || videoID.length !== 11) {
      throw new Error('ID video không hợp lệ');
    }

    const data = await ytdl.getInfo(link);
    const result = {
      title: data.videoDetails.title,
      dur: Number(data.videoDetails.lengthSeconds),
      viewCount: data.videoDetails.viewCount,
      likes: data.videoDetails.likes,
      author: data.videoDetails.author.name,
      timestart: Date.now()
    };

    return new Promise((resolve, reject) => {
      ytdl(link, { filter: format => format.itag === itag })
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          resolve({
            data: filePath,
            info: result
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  } catch (e) {
    console.error('Lỗi khi tải nhạc từ YouTube:', e);
    throw e; 
  }
};


const handleReply = async ({ api, event, handleReply }) => {
  try {
    const filePath = path.resolve(__dirname, 'cache', `audio-${event.senderID}.mp3`);
    const downloadResult = await downloadMusicFromYoutube("https://www.youtube.com/watch?v=" + handleReply.link[event.body - 1], filePath, ITAG);

    if (!downloadResult || !downloadResult.data) {
      console.error('Lỗi: Data không xác định');
      return;
    }

    const { data, info } = downloadResult;

    if (fs.statSync(data).size > 26214400) {
      return api.sendMessage('⚠️Không thể gửi tệp vì kích thước lớn hơn 25MB.', event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    }

    api.unsendMessage(handleReply.messageID);

    const message = {
      body: `❍━━━━━━━━━━━━❍\n🎵 Tiêu đề: ${info.title}\n⏱️ Thời lượng: ${convertHMS(info.dur)}\n⏱️ Thời gian xử lý: ${Math.floor((Date.now() - info.timestart) / 1000)} giây\n❍━━━━━━━━━━━━❍`,
      attachment: fs.createReadStream(data),
    };

    return api.sendMessage(message, event.threadID, async () => {
      fs.unlinkSync(filePath);
    }, event.messageID);
  } catch (error) {
    console.log('Lỗi khi xử lý phản hồi:', error);
    api.sendMessage('⚠️Đã xảy ra lỗi khi gửi tin nhắn.', event.threadID, event.messageID);
  }
};

const run = async function({ api, event, args }) {
  if (!args?.length) return api.sendMessage('❯ Tìm kiếm không được để trống!', event.threadID, event.messageID);

  const keywordSearch = args.join(" ");
  const filePath = path.resolve(__dirname, 'cache', `sing-${event.senderID}.mp3`);

  if (args[0]?.startsWith("https://")) {
    try {
      const { data, info } = await downloadMusicFromYoutube(args[0], filePath);
      const body = `❍━━━━━━━━━━━━❍\n🎵 Tiêu đề: ${info.title}\n⏱️ Thời lượng: ${convertHMS(info.dur)}\n⏱️ Thời gian xử lý: ${Math.floor((Date.now() - info.timestart) / 1000)} giây\n❍━━━━━━━━━━━━❍`;

      if (fs.statSync(data).size > 26214400) {
        return api.sendMessage('⚠️Không thể gửi tệp vì kích thước lớn hơn 25MB.', event.threadID, () => fs.unlinkSync(data), event.messageID);
      }

      return api.sendMessage({ body, attachment: fs.createReadStream(data) }, event.threadID, () => fs.unlinkSync(data), event.messageID);
    } catch (e) {
      console.log('Lỗi khi tải nhạc từ YouTube:', e);
      api.sendMessage('⚠️Đã xảy ra lỗi khi tải nhạc.', event.threadID, event.messageID);
    }
  } else {
    try {
      const data = (await Youtube.GetListByKeyword(keywordSearch, false, 6))?.items ?? [];
      const link = data.map(value => value?.id);
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
          messageID: info.messageID,
          author: event.senderID,
          link
        });
      }, event.messageID);
    } catch (e) {
      console.log('Lỗi khi tìm kiếm video:', e);
      return api.sendMessage(`⚠️Đã xảy ra lỗi, vui lòng thử lại sau!!\n${e}`, event.threadID, event.messageID);
    }
  }
};

module.exports = { config, run, handleReply };
