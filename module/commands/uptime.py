module.exports.config = {
  name: "uptime",	
  version: "1.1.0", 
  hasPermssion: 0,
  credits: "SINGU-💌💌",
  description: "sos", 
  commandCategory: "Không cần dấu lệnh",
  usePrefix: true,
  usages: "¹",
  cooldowns: 0
};
module.exports.languages = {
  "vi": {},
  "en": {}
};

function random(arr) {
var rd = arr[Math.floor(Math.random() * arr.length)];
    return rd;
        };
module.exports.handleEvent = async function ({ api, event, Threads }) {
  const axios = require("axios")
  const picture = (await axios.get(`https://imgur.com/m4ruygS.jpg`, { responseType: "stream"})).data
      const moment = require("moment-timezone");
var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
  var thu =
moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = '𝐂𝐡𝐮̉ 𝐍𝐡𝐚̣̂𝐭'
  if (thu == 'Monday') thu = '𝐓𝐡𝐮̛́ 𝐇𝐚𝐢'
  if (thu == 'Tuesday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚'
  if (thu == 'Wednesday') thu = '𝐓𝐡𝐮̛́ 𝐓𝐮̛'
  if (thu == "Thursday") thu = '𝐓𝐡𝐮̛́ 𝐍𝐚̆𝐦'
  if (thu == 'Friday') thu = '𝐓𝐡𝐮̛́ 𝐒𝐚́𝐮'
  if (thu == 'Saturday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚̉𝐲'
      const dateNow = Date.now();
    const time = process.uptime(),
          nguyen = Math.floor(time / (60 * 60)),
          manh = Math.floor((time % (60 * 60)) / 60),
          toan = Math.floor(time % 60);
  const admins = global.config.ADMINBOT;
    const namebot = config.BOTNAME;
  const res1 = await axios.get(`http://toan-nguyen.toan2005aye.repl.co/images/girl`);
const res2 = await axios.get(`https://api-0703.0703-opa.repl.co/images/girl`);
const res3 = await axios.get(`http://toan-nguyen.toan2005aye.repl.co/images/girl`);
const res4 = await axios.get(`http://toan-nguyen.toan2005aye.repl.co/images/girl`) 
const res5 = await axios.get(`http://toan-nguyen.toan2005aye.repl.co/images/girl`);
const res6 = await axios.get(`http://toan-nguyen.toan2005aye.repl.co/images/girl`);
var data1 = res1.data.url;
var array = [];
var data2 = res2.data.url;
var data3 = res3.data.url;
var data4 = res4.data.url;
var data5 = res5.data.url;
var data6 = res6.data.url
var downloadfile1 = (await axios.get(data1, {responseType: 'stream'})).data;
var downloadfile2 = (await axios.get(data2, {responseType: 'stream'})).data;
var downloadfile3 = (await axios.get(data3, {responseType: 'stream'})).data;
var downloadfile4 = (await axios.get(data4, {responseType: 'stream'})).data;
var downloadfile5 = (await axios.get(data5, {responseType: 'stream'})).data;
var downloadfile6 = (await axios.get(data6, {responseType: 'stream'})).data;
    array.push(downloadfile1);
    array.push(downloadfile2);    
    array.push(downloadfile3);
    array.push(downloadfile4);
    array.push(downloadfile5);    
    array.push(downloadfile6);
  var { threadID, messageID, body } = event,{ PREFIX } = global.config;
  let threadSetting = global.data.threadData.get(threadID) || {};
  let prefix = threadSetting.PREFIX || PREFIX;
  const icon = [""];
  if (body.toLowerCase() == "upt" || (body.toLowerCase() == "uptime") ||  (body.toLowerCase() == "timeonl") || (body.toLowerCase() == "time")) {
       api.sendMessage({body: `🌐⚌⚌[ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗢𝗕𝗢𝗧 ]⚌⚌🌐\n━━━━━━━━━━━━━━━━\n→⏰ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${gio} \n→📆 𝐓𝐡𝐮̛́: (${thu})\n→🌐 𝗧𝗲̂𝗻 𝗕𝗼𝘁: ${global.config.BOTNAME}\n→🌐 𝗣𝗶𝗻𝗴: ${Date.now() - dateNow} ms\n→🌐 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}\n→𝐁𝐨𝐭 𝐡𝐨𝐚̣𝐭 𝐝𝐨̣̂𝐧𝐠 𝐝𝐮̛𝐨̛̣𝐜:\n ▱▱${nguyen} 𝗚𝗶𝗼̛̀,${manh} 𝗣𝗵𝘂́𝘁,${toan} 𝗚𝗶𝗮̂𝘆▱▱\n━━━━━━━━━━━━━━━━\n→⚠️ 𝗧𝗵𝗮̉ 𝗰𝗮̉𝗺 𝘅𝘂́𝗰 "👍" đ𝗲̂̉ 𝗯𝗶𝗲̂́𝘁 𝘁𝗵𝗲̂𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 `, attachment:
array},event.threadID, (err, info) => {
    global.client.handleReaction.push({
      name: this.config.name, 
      messageID: info.messageID,
      author: event.senderID,
    })
      },event.messageID);
  }
 }
//ko api thì attachment: (picture)}, event.threadID, event.messageID);
module.exports.run = async ({ api, event, args, Threads }) => {
                          }
module.exports.handleReaction = async ({ event, api, handleReaction, Currencies, Users}) => {
  const time = process.uptime(),
    h = Math.floor(time / (60 * 60)),
    p = Math.floor((time % (60 * 60)) / 60),
    s = Math.floor(time % 60);
  const axios = global.nodemodule["axios"];
const fs = global.nodemodule["fs-extra"];
const { threadID, messageID, userID } = event;
if (event.userID != handleReaction.author) return;
if (event.reaction != "👍") return;
 api.unsendMessage(handleReaction.messageID);
        var msg = `===== [ 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 𝗕𝗢𝗧 ] =====\n\n💮 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 ${global.config.BOTNAME} đ𝗮̃ 𝗼𝗻𝗹 đ𝘂̛𝗼̛̣𝗰 ${h} 𝗚𝗶𝗼̛̀ ${p} 𝗣𝗵𝘂́𝘁 ${s} 𝗚𝗶𝗮̂𝘆\n⚙️ 𝗣𝗵𝗶𝗲̂𝗻 𝗯𝗮̉𝗻 𝗵𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗰𝘂̉𝗮 𝗯𝗼𝘁: ${global.config.version}\n🔗 𝗧𝗼̂̉𝗻𝗴 𝗹𝗲̣̂𝗻𝗵: ${client.commands.size}\n🖨️ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗰𝗼́: ${client.events.size} 𝗹𝗲̣̂𝗻𝗵 𝘀𝘂̛̣ 𝗸𝗶𝗲̣̂𝗻\n👥 𝗧𝗼̂̉𝗻𝗴 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗱𝘂̀𝗻𝗴: ${global.data.allUserID.length}\n🏘️ 𝗧𝗼̂̉𝗻𝗴 𝗻𝗵𝗼́𝗺: ${global.data.allThreadID.length}\n💓 𝗣𝗿𝗲𝗳𝗶𝘅 𝗯𝗼𝘁: ${global.config.PREFIX}`
        return api.sendMessage({body: msg, attachment: (await axios.get((await axios.get(`http://toan-nguyen..repl.co/images/anime`)).data.url,  {
                    responseType: 'stream'
                })).data},event.threadID); 
}