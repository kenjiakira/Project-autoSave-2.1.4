const fs = require('fs');
const path = require('path');

const fortuneMessages = [
    "Bạn sẽ tìm thấy một món quà bất ngờ trong tuần này.",
    "Một người bạn sẽ cần sự giúp đỡ của bạn sớm.",
    "Sự chăm chỉ của bạn sẽ được đền đáp xứng đáng.",
    "Một cơ hội mới sẽ mở ra trước mặt bạn.",
    "Hãy chuẩn bị cho một cuộc gặp gỡ thú vị sắp tới.",
    "Một sự kiện quan trọng sẽ thay đổi hướng đi của bạn.",
    "Có thể bạn sẽ nhận được một tin vui từ gia đình.",
    "Một chuyến đi mới sẽ mang lại nhiều kỷ niệm đẹp.",
    "Bạn sẽ khám phá một sở thích mới và đam mê.",
    "Một người lạ sẽ trở thành bạn đồng hành của bạn.",
    "Sự kiên nhẫn của bạn sẽ mang lại thành công lớn.",
    "Bạn sẽ tìm thấy sự hài lòng trong những việc nhỏ bé.",
    "Một quyết định bất ngờ sẽ mang lại kết quả tích cực.",
    "Có một cơ hội học hỏi mới đang đến gần.",
    "Hãy chuẩn bị cho một cuộc phiêu lưu đầy bất ngờ.",
    "Một điều mới lạ sẽ làm phong phú thêm cuộc sống của bạn.",
    "Bạn sẽ có cơ hội để thể hiện tài năng của mình.",
    "Một cuộc trò chuyện quan trọng sẽ mang lại những thay đổi tích cực.",
    "Bạn sẽ khám phá một bí mật thú vị trong thời gian tới.",
    "Một tin vui từ xa sẽ làm bạn hào hứng.",
    "Bạn sẽ tìm thấy sự cân bằng trong cuộc sống cá nhân.",
    "Có thể bạn sẽ gặp một người bạn tâm giao trong thời gian gần.",
    "Một điều tốt lành sẽ đến với bạn trong công việc.",
    "Hãy chuẩn bị cho một sự thay đổi tích cực trong mối quan hệ của bạn.",
    "Một sự kết hợp mới sẽ tạo ra kết quả tuyệt vời.",
    "Bạn sẽ cảm nhận được sự ủng hộ từ những người xung quanh.",
    "Một món quà tinh thần sẽ mang lại sự vui vẻ cho bạn.",
    "Có một cơ hội đầu tư mới đang chờ đợi bạn.",
    "Bạn sẽ có một sự khám phá bất ngờ về bản thân.",
    "Một cuộc họp sẽ dẫn đến cơ hội làm việc mới.",
    "Bạn sẽ tìm thấy sự an tâm trong những quyết định của mình.",
    "Một cơ hội học tập sẽ giúp bạn phát triển thêm.",
    "Hãy chuẩn bị cho một sự thay đổi tích cực trong môi trường làm việc.",
    "Bạn sẽ có một cuộc gặp gỡ đầy hứng thú với một người quan trọng.",
    "Một món quà từ người thân sẽ làm bạn cảm thấy hạnh phúc.",
    "Có thể bạn sẽ nhận được một lời khen ngợi từ cấp trên.",
    "Bạn sẽ tìm thấy một con đường mới trong sự nghiệp của mình.",
    "Một sự kiện bất ngờ sẽ làm thay đổi thói quen của bạn.",
    "Bạn sẽ khám phá một kỹ năng mới mà bạn chưa biết đến.",
    "Một cuộc trò chuyện thú vị sẽ dẫn đến một cơ hội mới.",
    "Bạn sẽ tìm thấy sự thỏa mãn trong việc giúp đỡ người khác.",
    "Một điều may mắn sẽ xuất hiện trong cuộc sống của bạn.",
    "Bạn sẽ có cơ hội để thay đổi hướng đi của mình.",
    "Có thể bạn sẽ nhận được một món quà đặc biệt từ một người bạn cũ.",
    "Bạn sẽ khám phá một địa điểm mới đầy hấp dẫn.",
    "Một cơ hội hợp tác mới sẽ xuất hiện trong công việc.",
    "Bạn sẽ cảm thấy sự tự tin trong các quyết định quan trọng.",
    "Một tin vui từ bạn bè sẽ làm bạn bất ngờ.",
    "Có thể bạn sẽ nhận được một phần thưởng cho sự nỗ lực của mình.",
    "Một cơ hội để cải thiện mối quan hệ cá nhân của bạn đang đến.",
    "Bạn sẽ tìm thấy sự khích lệ từ một nguồn bất ngờ.",
    "Một chuyến đi sẽ mang lại cho bạn những kỷ niệm tuyệt vời.",
    "Bạn sẽ khám phá một cơ hội mới trong việc học tập hoặc công việc.",
    "Có thể bạn sẽ tìm thấy nguồn cảm hứng mới trong cuộc sống.",
    "Một cuộc gặp gỡ đặc biệt sẽ mở ra một chương mới trong cuộc đời bạn.",
    "Bạn sẽ cảm nhận được sự hỗ trợ mạnh mẽ từ những người xung quanh.",
    "Một điều thú vị đang chờ đợi bạn trong tương lai gần.",
    "Bạn sẽ có một bước tiến lớn trong sự nghiệp của mình.",
    "Có thể bạn sẽ nhận được một sự công nhận xứng đáng từ những nỗ lực của mình."
];

module.exports.config = {
    name: "tuonglai",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Akira",
    description: "Dự đoán tương lai cho bạn",
    commandCategory: "Giải Trí",
    usePrefix: true,
    usages: "Dự đoán tương lai của bạn",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID } = event;

    const randomIndex = Math.floor(Math.random() * fortuneMessages.length);
    const fortuneMessage = fortuneMessages[randomIndex];

    
    api.sendMessage({
        body: `🔮 Dự đoán tương lai của bạn: ${fortuneMessage}`
    }, threadID, messageID);
};
