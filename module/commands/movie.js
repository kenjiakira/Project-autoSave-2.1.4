const axios = require("axios");
const fs = require("fs-extra");
const translate = require('translate-google');

module.exports.config = {
  name: "movie",
  version: "1.0.0",
  hasPermission: 0,
  credits: "August Quinn",
  description: "xem thông tin về phim",
  usages: ".movieinfo [title]\nVí dụ: .movieinfo Avengers Endgame",
  usePrefix: true,
  commandCategory: "Information Retrieval",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const apiKey = "db4f9cfb";
  const youtubeApiKey = "AIzaSyBkeljYcuoBOHfx523FH2AEENlciKnm3jM";
  const title = args.join(" ");

  if (!title) {
    api.sendMessage("Vui lòng cung cấp tên phim.", event.threadID, event.messageID);
    return;
  }

  const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const movieData = response.data;

    if (movieData.Response === "False") {
      api.sendMessage("Không tìm thấy bộ phim hoặc đã xảy ra lỗi.", event.threadID, event.messageID);
      return;
    }

    const movieTitle = movieData.Title;
    const year = movieData.Year;
    const cast = movieData.Actors;
    const ratings = movieData.Ratings.map(rating => `${rating.Source}: ${rating.Value}`).join("\n");
    const posterUrl = movieData.Poster;

    let path = __dirname + "/cache/movie_poster.jpg";
    let hasError = false;

    try {
      let imageResponse = await axios.get(posterUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(imageResponse.data, "binary"));
    } catch (error) {
      console.log(error);
      hasError = true;
    }

    const trailerUrl = await getMovieTrailer(movieTitle, youtubeApiKey);


    const translatedPlot = await translateToVietnamese(movieData.Plot);

    const movieInfo = `
🎬 Thông tin về bộ phim "${movieTitle}" (${year}):

🎭 Diễn viên: ${cast}
📖 Nội dung: ${translatedPlot}
📊 Đánh giá:\n${ratings}
🎥 Trailer: ${trailerUrl}
🖼️ Đường dẫn ảnh bìa: ${posterUrl}
`;

    if (!hasError) {
      api.sendMessage({
        body: movieInfo,
        attachment: fs.createReadStream(path)
      }, event.threadID, async () => {
        fs.unlinkSync(path);
        try {
          const trailerVideoBuffer = await getTrailerVideo(trailerUrl);
          api.sendMessage({
            body: "Trailer Video:",
            attachment: fs.createReadStream(trailerVideoBuffer.path)
          }, event.threadID, () => {
            fs.unlinkSync(trailerVideoBuffer.path);
          });
        } catch (error) {
          console.error(error);
          api.sendMessage("Không thể tải video trailer.", event.threadID);
        }
      });
    } else {
      api.sendMessage(movieInfo, event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("Đã xảy ra lỗi khi lấy thông tin về phim.", event.threadID, event.messageID);
  }
};

async function getMovieTrailer(movieTitle, apiKey) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(
    `${movieTitle} official trailer`
  )}&key=${apiKey}&maxResults=1&type=video`;

  try {
    const response = await axios.get(searchUrl);
    const videoId = response.data.items[0].id.videoId;
    const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return trailerUrl;
  } catch (error) {
    console.error(error);
    return "Không tìm thấy video trailer.";
  }
}

async function translateToVietnamese(text) {
  try {
    const translatedText = await translate(text, { to: 'vi' });
    return translatedText;
  } catch (error) {
    console.error('Lỗi khi dịch sang tiếng Việt:', error);
    return text; // Trả về văn bản gốc nếu có lỗi
  }
}

async function getTrailerVideo(trailerUrl) {
  const path = __dirname + "/cache/trailer_video.mp4";
  const response = await axios.get(trailerUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(path, Buffer.from(response.data, "binary"));
  return { path };
}
