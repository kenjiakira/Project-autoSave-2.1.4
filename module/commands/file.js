const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "file",
    version: "1.0.0",
    hasPermission: 2, 
    credits: "Hoàng Ngọc Từ",
    description: "lệnh admin",
    commandCategory: "Quản Trị",
    usePrefix: true,
    usages: "[addfile | refile | addfo | refo | editfile | viewfile | file]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;

    if (!global.config.ADMINBOT.includes(senderID)) {
        return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID, messageID);
    }

    const basePath = path.join(__dirname, '../../', 'module/commands');

    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
    }

    const listFilesAndDirs = (dirPath) => {
        let results = [];
        try {
            const list = fs.readdirSync(dirPath);
            list.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    results.push({ type: 'directory', name: file });
                    results = results.concat(listFilesAndDirs(filePath)); 
                } else {
                    results.push({ type: 'file', name: file });
                }
            });
        } catch (error) {
            console.error("Lỗi khi đọc thư mục:", error);
            throw new Error("Không thể đọc thư mục hoặc không tồn tại.");
        }
        return results;
    };

    if (args.length === 0) {
        try {
            const items = listFilesAndDirs(basePath);
            if (items.length === 0) {
                return api.sendMessage("Thư mục `module/commands` hiện tại trống.", threadID, messageID);
            }

            let response = "Danh sách các file và thư mục trong `Script`:\n";
            items.forEach(item => {
                response += `${item.type === 'directory' ? '📁' : '📄'} ${item.name}\n`;
            });

            return api.sendMessage(response, threadID, messageID);
        } catch (error) {
            console.error("Lỗi khi liệt kê các thư mục và file:", error);
            return api.sendMessage("Đã xảy ra lỗi khi liệt kê các thư mục và file.", threadID, messageID);
        }
    }

    if (args.length < 2) {
        return api.sendMessage("Cú pháp sai. Vui lòng sử dụng: [addfile | refile | addfo | refo | editfile | viewfile] [tên] [nội dung (với addfile và editfile)]", threadID, messageID);
    }

    const command = args[0].toLowerCase();
    const targetDir = args[1].split('/').slice(0, -1).join('/'); 
    const fileName = args[1].split('/').pop(); 
    const targetPath = path.join(basePath, args[1]); 

    if (targetDir && !fs.existsSync(path.join(basePath, targetDir))) {
        fs.mkdirSync(path.join(basePath, targetDir), { recursive: true });
    }

    try {
        switch (command) {
            case 'addfile':
                if (fs.existsSync(targetPath)) {
                    return api.sendMessage("File đã tồn tại.", threadID, messageID);
                }

                const addContent = args.slice(2).join(' ') || '';
                fs.writeFileSync(targetPath, addContent, 'utf8');
                return api.sendMessage(`File ${fileName} đã được tạo trong thư mục ${targetDir} với nội dung:\n${addContent}`, threadID, messageID);

            case 'refile':
                if (!fs.existsSync(targetPath)) {
                    return api.sendMessage("File không tồn tại.", threadID, messageID);
                }
                fs.unlinkSync(targetPath);
                return api.sendMessage(`File ${fileName} đã được xóa.`, threadID, messageID);

            case 'addfo':
                if (fs.existsSync(targetPath)) {
                    return api.sendMessage("Thư mục đã tồn tại.", threadID, messageID);
                }
                fs.mkdirSync(targetPath, { recursive: true });
                return api.sendMessage(`Thư mục ${args[1]} đã được tạo.`, threadID, messageID);

            case 'refo':
                if (!fs.existsSync(targetPath)) {
                    return api.sendMessage("Thư mục không tồn tại.", threadID, messageID);
                }
                fs.rmdirSync(targetPath, { recursive: true });
                return api.sendMessage(`Thư mục ${args[1]} đã được xóa.`, threadID, messageID);

            case 'editfile':
                if (!fs.existsSync(targetPath)) {
                    return api.sendMessage("File không tồn tại.", threadID, messageID);
                }

                const editContent = args.slice(2).join(' ') || '';
                fs.writeFileSync(targetPath, editContent, 'utf8');
                return api.sendMessage(`File ${fileName} đã được chỉnh sửa với nội dung:\n${editContent}`, threadID, messageID);

            case 'viewfile':
                if (!fs.existsSync(targetPath)) {
                    return api.sendMessage("File không tồn tại.", threadID, messageID);
                }

                const fileContent = fs.readFileSync(targetPath, 'utf8');
                return api.sendMessage(`Nội dung của file ${fileName}:\n${fileContent}`, threadID, messageID);

            default:
                return api.sendMessage("Lệnh không hợp lệ. Vui lòng sử dụng: [addfile | refile | addfo | refo | editfile | viewfile] [tên] [nội dung (với addfile và editfile)]", threadID, messageID);
        }
    } catch (error) {
        console.error("Lỗi khi xử lý lệnh:", error);
        return api.sendMessage("Đã xảy ra lỗi khi thực hiện lệnh.", threadID, messageID);
    }
};
