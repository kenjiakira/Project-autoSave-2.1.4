module.exports.config = {
    name: "antiout",
    version: "1.1.1",
    hasPermission: 0,
    credits: "DC-Nam",
    description: "Bật/tắt chống out chùa",
    commandCategory: "Box chat",
  usePrefix: true,
    usages: ".antiout: Bật hoặc tắt chế độ chống out cho nhóm. Khi bạn chạy lệnh này, bot sẽ thay đổi trạng thái chống out và gửi một tin nhắn thông báo về trạng thái đã thay đổi.\n\nVí dụ:\n\n- Nếu trạng thái chống out đang bật, khi bạn chạy lệnh .antiout, bot sẽ tắt chế độ chống out và thông báo \"Đã tắt chế độ chống out nhóm\".\n- Nếu trạng thái chống out đang tắt, khi bạn chạy lệnh .antiout, bot sẽ bật chế độ chống out và thông báo \"Đã bật chế độ chống out nhóm\".",
    cooldowns: 0
}
module.exports.run = async function({
    api: a,
    event: e,
    args: g,
    Threads: T
}) {
    const {
        threadID: t,
        messageID: m,
        senderID: s
    } = e
    let getDataThread = await T.getData(t) || {}
    const {
        data,
        threadInfo
    } = getDataThread
    if (typeof data.antiout == "undefined") {
        data.antiout = {
            status: true,
            storage: []
        }
        await T.setData(t, {
            data
        });
        await global.data.threadData.set(t, data)
    }
    const status = data.antiout.status == true ? false : true
    data.antiout.status = status
    await T.setData(t, {
        data
    });
    await global.data.threadData.set(t, data)
    var msg = `» Đã ${status == true ? "bật" : "tắt"} chế độ chống out nhóm`
    a.sendMessage(msg, t, m)
}