const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const jimp = require('jimp');

const apiPath = path.join(__dirname, '../../module/commands/json/cccd.json');

function readOrCreateData() {
    if (!fs.existsSync(apiPath)) {
        fs.writeFileSync(apiPath, JSON.stringify({}), 'utf8');
        return {}; 
    }
    let rawData;
    try {
        rawData = fs.readFileSync(apiPath, 'utf8');
        if (rawData.trim() === '') {
            return {};
        }
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Lỗi khi phân tích tệp JSON:', error);
        return {}; 
    }
}

async function circleImage(imageBuffer) {
    const image = await jimp.read(imageBuffer);
    image.circle();
    return await image.getBufferAsync('image/png');
}

module.exports.config = {
    name: "id",
    version: "1.2.2",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Tạo căn cước",
    commandCategory: "Social",
    usePrefix: true,
    usages: [
            ".id [tên] | [ngày sinh] | [giới tính] | [địa chỉ] - Tạo hoặc cập nhật căn cước công dân với thông tin cá nhân.",
            ".id remove - Xóa thông tin căn cước công dân của bạn.",
            "Ví dụ:",
            ".id Nguyễn Văn A | 01/01/2000 | Nam | 123 Đường ABC - Tạo căn cước công dân với thông tin cá nhân cụ thể.",
            ".id remove - Xóa thông tin căn cước công dân đã lưu."
        ],
    cooldowns: 10
};

module.exports.run = async ({ event, api }) => {
    const { senderID, threadID, body } = event;
    let args = body.trim().split('|').map(arg => arg.trim());

    if (args[0].startsWith('.id ')) {
        args[0] = args[0].substring(4).trim();
    }

    const data = readOrCreateData();

    if (args[0] === 'remove') {
        if (data[senderID]) {
            delete data[senderID];
            fs.writeFileSync(apiPath, JSON.stringify(data, null, 2), 'utf8');
            return api.sendMessage("Thông tin căn cước của bạn đã được xoá.", threadID, event.messageID);
        } else {
            return api.sendMessage("Bạn chưa có căn cước công dân để xoá.", threadID, event.messageID);
        }
    }

    if (data[senderID]) {
        const idCard = data[senderID];

        const imagePath = await createIDCardImage(idCard, senderID);
        return api.sendMessage({
            attachment: fs.createReadStream(imagePath)
        }, threadID, () => fs.unlinkSync(imagePath), event.messageID);
    }

    if (args.length < 4) {
        return api.sendMessage(
            "Vui lòng sử dụng đúng cú pháp: .id [tên] | [ngày sinh] | [giới tính] | [địa chỉ]\n" +
            "Trong đó:\n" +
            "- [tên]: Tên đầy đủ của bạn\n" +
            "- [ngày sinh]: Ngày sinh của bạn (định dạng dd/mm/yyyy)\n" +
            "- [giới tính]: Giới tính của bạn (Nam/Nữ)\n" +
            "- [địa chỉ]: Địa chỉ nơi bạn đang sống\n" +
            "Ví dụ: .id Nguyễn Văn A | 01/01/2000 | Nam | 123 Đường ABC", 
            threadID
        );
    }

    const name = args[0] || 'Chưa cung cấp';
    const dob = args[1] || 'Chưa cung cấp';
    const gender = args[2] || 'Chưa cung cấp';
    const address = args[3] || 'Chưa cung cấp';

    const idCard = {
        uid: senderID,
        name: name,
        dob: dob,
        gender: gender,
        address: address,
        issuedDate: new Date().toISOString(),
        status: 'Bình Thường' 
    };

    data[senderID] = idCard;
    try {
        fs.writeFileSync(apiPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Lỗi khi lưu tệp JSON:', error);
    }

    const imagePath = await createIDCardImage(idCard, senderID);
    return api.sendMessage({
        attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), event.messageID);
};

async function createIDCardImage(idCard, userID) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const backgroundImagePath = 'https://i.imgur.com/KkkxVrf.jpeg'; 
    const background = await loadImage(backgroundImagePath);
    ctx.drawImage(background, 0, 0, width, height);

    ctx.fillStyle = '#000000';
    ctx.font = '20px Open Sans';
    ctx.font = 'bold 23px Arial';
    ctx.fillText(`${idCard.uid}`, 320, 210);
    ctx.font = 'bold 20px Open Sans'; 
    ctx.fillText(`${idCard.name}`, 380, 244);
    ctx.fillText(`${idCard.dob}`, 380, 274);
    ctx.fillText(`${idCard.gender}`, 370, 305);
    ctx.fillText(`${idCard.address}`, 360, 335);
    ctx.fillText(`${idCard.issuedDate}`, 380, 367);

    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const avatarBuffer = Buffer.from(avatarResponse.data);
    const avatar = await circleImage(avatarBuffer);

    const avatarImage = await loadImage(avatar);
    ctx.drawImage(avatarImage, 50, 170, 200, 200);

    const imagePath = path.join(__dirname, 'cccd_image.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);

    return imagePath;
}
