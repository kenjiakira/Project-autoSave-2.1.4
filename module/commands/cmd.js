module.exports.config = {
  name: "cmd",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "lệnh admin",
  commandCategory: "ADMIN",
  usePrefix: true,
  usages: "sử dụng .cmd [load] lệnh cần quản lý ",
  cooldowns: 0,
  dependencies: {
    "fs-extra": "",
    "child_process": "",
    "path": ""
  }
};

const loadCommand = function({ moduleList, threadID, messageID }) {
  const { execSync } = global.nodemodule['child_process'];
  const { writeFileSync, unlinkSync, readFileSync, readdirSync } = global.nodemodule['fs-extra'];
  const { join } = global.nodemodule['path'];
  const { configPath, mainPath, api } = global.client;
  const logger = require(mainPath + '/utils/log');

  var errorList = [];
  delete require['resolve'][require['resolve'](configPath)];
  var configValue = require(configPath);
  writeFileSync(configPath + '.temp', JSON.stringify(configValue, null, 2), 'utf8');

  if (moduleList.includes("All")) {
    moduleList = readdirSync(__dirname).filter(file => file.endsWith('.js')).map(file => file.slice(0, -3));
  }

  for (const nameModule of moduleList) {
    try {
      const dirModule = __dirname + '/' + nameModule + '.js';
      delete require['cache'][require['resolve'](dirModule)];
      const command = require(dirModule);
      global.client.commands.delete(nameModule);
      if (!command.config || !command.run || !command.config.commandCategory)
        throw new Error('Module không đúng định dạng!');
      global.client['eventRegistered'] = global.client['eventRegistered']['filter'](info => info != command.config.name);
      if (command.config.dependencies && typeof command.config.dependencies == 'object') {
        const listPackage = JSON.parse(readFileSync('./package.json')).dependencies,
          listbuiltinModules = require('module')['builtinModules'];
        for (const packageName in command.config.dependencies) {
          var tryLoadCount = 0,
            loadSuccess = ![],
            error;
          const moduleDir = join(global.client.mainPath, 'nodemodules', 'node_modules', packageName);
          try {
            if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
            else global.nodemodule[packageName] = require(moduleDir);
          } catch {
            logger.loader('Không tìm thấy package ' + packageName + ' hỗ trợ cho lệnh ' + command.config.name + 'tiến hành cài đặt...', 'warn');
            const insPack = {};
            insPack.stdio = 'inherit';
            insPack.env = process.env;
            insPack.shell = !![];
            insPack.cwd = join(global.client.mainPath, 'nodemodules');
            execSync('npm --package-lock false --save install ' + packageName + (command.config.dependencies[packageName] == '*' || command.config.dependencies[packageName] == '' ? '' : '@' + command.config.dependencies[packageName]), insPack);
            for (tryLoadCount = 1; tryLoadCount <= 3; tryLoadCount++) {
              require['cache'] = {};
              try {
                if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
                else global.nodemodule[packageName] = require(moduleDir);
                loadSuccess = !![];
                break;
              } catch (erorr) {
                error = erorr;
              }
              if (loadSuccess || !error) break;
            }
            if (!loadSuccess || error) throw 'Không thể tải package ' + packageName + (' cho lệnh ') + command.config.name + ', lỗi: ' + error + ' ' + error['stack'];
          }
        }
        logger.loader(' Đã tải thành công toàn bộ package cho lệnh' + command.config.name);
      }
      if (command.config.envConfig && typeof command.config.envConfig == 'Object') try {
        for (const [key, value] of Object['entries'](command.config.envConfig)) {
          if (typeof global.configModule[command.config.name] == undefined)
            global.configModule[command.config.name] = {};
          if (typeof configValue[command.config.name] == undefined)
            configValue[command.config.name] = {};
          if (typeof configValue[command.config.name][key] !== undefined)
            global.configModule[command.config.name][key] = configValue[command.config.name][key];
          else global.configModule[command.config.name][key] = value || '';
          if (typeof configValue[command.config.name][key] == undefined)
            configValue[command.config.name][key] = value || '';
        }
        logger.loader('Loaded config' + ' ' + command.config.name);
      } catch (error) {
        throw new Error('» 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐚̉𝐢 𝐜𝐨𝐧𝐟𝐢𝐠 𝐦𝐨𝐝𝐮𝐥𝐞, 𝐥𝐨̂̃𝐢: ' + JSON.stringify(error));
      }
      if (command['onLoad']) try {
        const onLoads = {};
        onLoads['configValue'] = configValue;
        command['onLoad'](onLoads);
      } catch (error) {
        throw new Error('» 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐨𝐧𝐋𝐨𝐚𝐝 𝐦𝐨𝐝𝐮𝐥𝐞, 𝐥𝐨̂̃𝐢: ' + JSON.stringify(error), 'error');
      }
      if (command.handleEvent) global.client.eventRegistered.push(command.config.name);
      (global.config.commandDisabled.includes(nameModule + '.js') || configValue.commandDisabled.includes(nameModule + '.js'))
        && (configValue.commandDisabled.splice(configValue.commandDisabled.indexOf(nameModule + '.js'), 1),
          global.config.commandDisabled.splice(global.config.commandDisabled.indexOf(nameModule + '.js'), 1))
      global.client.commands.set(command.config.name, command)
      logger.loader('Loaded command ' + command.config.name + '!');
    } catch (error) {
      errorList.push('- ' + nameModule + ' reason:' + error + ' at ' + error['stack']);
    };
  }
  if (errorList.length != 0) api.sendMessage('» 𝐍𝐡𝐮̛̃𝐧𝐠 𝐥𝐞̣̂𝐧𝐡 𝐯𝐮̛̀𝐚 𝐱𝐚̉𝐲 𝐫𝐚 𝐬𝐮̛̣ 𝐜𝐨̂́ 𝐤𝐡𝐢 𝐡𝐞̣̂ 𝐭𝐡𝐨̂́𝐧𝐠 𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ' + errorList.join(' '), threadID, messageID);
  api.sendMessage('» 𝐕𝐮̛̀𝐚 𝐭𝐚̉𝐢 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ' + (moduleList.length - errorList.length) + ' 𝐥𝐞̣̂𝐧𝐡 ✅', threadID, messageID)
  writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8')
  unlinkSync(configPath + '.temp');
  return;
};

module.exports.run = async function({ event, args, api, Users }) {
  const allowedAdmins = ["100029043375434", "100092325757607","61561753304881"];
  if (!allowedAdmins.includes(event.senderID.toString())) {
    var uid = "";
    uid += `${event.senderID}`;
    let userName = await Users.getNameUser(uid);
    return api.sendMessage(
      `chỉ ADMIN mới có thể được phép sử dụng lệnh này...`,
      event.threadID,
      event.messageID
    );
  }

  const { threadID, messageID } = event;
  var moduleList = args.splice(1, args.length);

  if (moduleList.length == 0)
    return api.sendMessage(
      "» 𝐓𝐞̂𝐧 𝐦𝐨𝐝𝐮𝐥𝐞 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐡𝐨 𝐩𝐡𝐞́𝐩 𝐛𝐨̉ 𝐭𝐫𝐨̂́𝐧𝐠 ⚠️",
      threadID,
      messageID
    );
  else return loadCommand({ moduleList, threadID, messageID });
};
