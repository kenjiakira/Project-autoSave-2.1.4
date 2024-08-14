module.exports.config = {
	name: "rules",
	version: "1.0.1",
    hasPermission: 0,
	credits: "CatalizCS",
	description: "tạo luật cho nhóm của bạn",
	commandCategory: "Box Chat",
  usePrefix: true,
	usages: "rules add [nội dung]: Thêm một luật mới vào nhóm. Bạn cần có đủ quyền để sử dụng lệnh này.\nVí dụ: rules add Không spam trong nhóm rules list hoặc rules all: Hiển thị danh sách các luật hiện tại của nhóm.\nVí dụ: rules list\nrules remove [số] hoặc rules delete [số] hoặc rules rm [số]: Xóa một luật khỏi danh sách bằng cách chỉ định số thứ tự của luật. Bạn cần có đủ quyền để sử dụng lệnh này.\nVí dụ: rules remove 2\nrules delete all hoặc rules rm all: Xóa toàn bộ danh sách luật của nhóm. Bạn cần có đủ quyền để sử dụng lệnh này.\nVí dụ: rules delete all\nNếu không có tùy chọn nào được sử dụng, lệnh sẽ hiển thị danh sách luật của nhóm. Nếu nhóm không có luật nào, sẽ hiển thị một thông báo tương ứng.\nHãy thay [tên lệnh] bằng (prefix) của bot trong nhóm của bạn. Ví dụ, nếu tiền tố của bot là !, thì bạn sẽ sử dụng !rules add [nội dung] để thêm một luật mới.\n\nLưu ý: Đối với các lệnh có tùy chọn [add] hoặc [remove/delete], bạn cần có đủ quyền để sử dụng lệnh đó trong nhóm",
	cooldowns: 5,
	dependencies: {
        "fs-extra": "",
        "path": ""
    }
}

module.exports.onLoad = () => {
    const { existsSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const pathData = join(__dirname, "json", "rules.json");
    if (!existsSync(pathData)) return writeFileSync(pathData, "[]", "utf-8"); 
}

module.exports.run = ({ event, api, args, permission }) => {
    const { threadID, messageID } = event;
    const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const pathData = join(__dirname, "json", "rules.json");
    const content = (args.slice(1, args.length)).join(" ");
    var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
    var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, listRule: [] };

    switch (args[0]) {
        case "add": {
            if (permission == 0) return api.sendMessage("[Luật] Bạn không có đủ quyền để sử dụng thêm luật!", threadID, messageID);
            if (content.length == 0) return api.sendMessage("[Luật] Vui lòng không để trống nội dung", threadID, messageID);
            if (content.indexOf("\n") != -1) {
                const contentSplit = content.split("\n");
                for (const item of contentSplit) thisThread.listRule.push(item);
            }
            else {
                thisThread.listRule.push(content);
            }
            writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            api.sendMessage('[Luật] Đã thêm một luật mới vào nhóm thành công!', threadID, messageID);
            break;
        }
        case "list":
        case "all": {
            var msg = "", index = 0;
            for (const item of thisThread.listRule) msg += `${index+=1}/ ${item}\n`;
            if (msg.length == 0) return api.sendMessage("[Luật] Nhóm của bạn không có danh sách luật để hiển thị!", threadID, messageID);
            api.sendMessage(`=== Danh sách luật của nhóm ===\n\n${msg}`, threadID, messageID);
            break;
        }
        case "rm":
        case "remove":
        case "delete": {
            if (!isNaN(content) && content > 0) {
                if (permission == 0) return api.sendMessage("[Luật] Bạn không có đủ quyền để sử dụng xóa luật!", threadID, messageID);
                if (thisThread.listRule.length == 0) return api.sendMessage("[Luật] Nhóm của bạn không có danh sách luật để xóa!", threadID, messageID);
                thisThread.listRule.splice(content - 1, 1);
                api.sendMessage(`[Luật] Đã xóa thành công luật thứ ${content}`, threadID, messageID);
                break;
            }
            else if (content == "all") {
                if (permission == 0) return api.sendMessage("[Luật] Bạn không có đủ quyền để sử dụng xóa luật!", threadID, messageID);
                if (thisThread.listRule.length == 0) return api.sendMessage("[Luật] Nhóm của bạn không có danh sách luật để xóa!", threadID, messageID);
                thisThread.listRule = [];
                api.sendMessage(`[Luật] Đã xóa toàn bộ danh sách luật của nhóm!`, threadID, messageID);
                break;
            }
        }
        default: {
            if (thisThread.listRule.length != 0) {
                var msg = "", index = 0;
                for (const item of thisThread.listRule) msg += `${index+=1}/ ${item}\n`;
                return api.sendMessage(`=Danh sách luật của nhóm =\n\n${msg}\n[Tuân thủ luật của nhóm sẽ đóng góp tích cực cho cộng đồng của bạn!]`, threadID, messageID);
            }
            else return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }

    if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
    return writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
}
