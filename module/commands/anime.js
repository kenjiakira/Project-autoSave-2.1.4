const translate = require('translate-google');
const { getInfoFromName } = require('mal-scraper');
const request = require('request');
const fs = require('fs');

module.exports.config = {
    name: "anime",
    version: "1.0.0",
    hasPermission: 0,
    credits: "ZiaRein",//Vietsub by Hoàng Ngọc Từ
    description: "Tìm kiếm info Anime",
    commandCategory: "anime",
   usePrefix: true,
    usages: "gõ anime [tên anime cần tìm]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    let query = args.join(" ").trim();
    
    if (!query) {
        return api.sendMessage("Vui lòng cung cấp tên anime cần tìm kiếm.\nUsage: anime [tên anime cần tìm]", event.threadID, event.messageID);
    }

    const Anime = await getInfoFromName(query).catch(err => {
        api.sendMessage("⚠️ " + err, event.threadID, event.messageID);
    });

    if (!Anime) return;
    const getURL = Anime.picture;
    const ext = getURL.substring(getURL.lastIndexOf(".") + 1);

    if (!Anime.genres || Anime.genres.length === 0) Anime.genres = ["Không có"];

    const title = Anime.title;
    const japTitle = Anime.japaneseTitle;
    const type = Anime.type;
    const status = Anime.status;
    const premiered = Anime.premiered;
    const broadcast = Anime.broadcast;
    const aired = Anime.aired;
    const producers = Anime.producers;
    const studios = Anime.studios;
    const source = Anime.source;
    const episodes = Anime.episodes;
    const duration = Anime.duration;
    const genres = Anime.genres.join(", ");
    const popularity = Anime.popularity;
    const ranked = Anime.ranked;
    const score = Anime.score;
    const rating = Anime.rating;
    const synopsis = Anime.synopsis;
    const url = Anime.url;
    const endD = Anime.end_date;

    const translatedSynopsis = await translate(synopsis, { from: 'en', to: 'vi' });

    const callback = function () {
        api.sendMessage(
            {
                body: `📖 THÔNG TIN ANIME\n\n🎥 Tên: ${title}\n🎌 Tên tiếng Nhật: ${japTitle}\n📺 Loại: ${type}\n⚡️ Trạng thái: ${status}\n🗓️ Khởi chiếu: ${premiered}\n📡 Phát sóng: ${broadcast}\n📅 Ra mắt: ${aired}\n🎬 Nhà sản xuất: ${producers}\n🎓 Studio: ${studios}\n📝 Nguồn: ${source}\n🎞️ Số tập: ${episodes}\n⌛️ Thời lượng: ${duration}\n🎭 Thể loại: ${genres}\n🌟 Độ phổ biến: ${popularity}\n🔝 Xếp hạng: ${ranked}\n🎖️ Điểm số: ${score}\n🔞 Đánh giá: ${rating}\n\n📝 Nội dung:\n${translatedSynopsis}\n\n🌐 Link chi tiết: ${url}`,
                attachment: fs.createReadStream(__dirname + `/cache/mal.${ext}`)
            },
            event.threadID,
            () => fs.unlinkSync(__dirname + `/cache/mal.${ext}`),
            event.messageID
        );
    };

    request(getURL).pipe(fs.createWriteStream(__dirname + `/cache/mal.${ext}`)).on("close", callback);
};
