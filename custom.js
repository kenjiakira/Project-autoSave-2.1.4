module.exports = async ({ api, event }) => {
  const logger = require('./utils/log')
  const config = {
    autoRestart: {
      status: false, //SET TO TRUE TO AUTORESTART BUT I SUGGEST YOU SHOULD USE UPTIME INSTEAD OF AUTORESTART
      time: 40, //40 minutes
      note: 'To avoid problems, enable periodic bot restarts'
    },
    accpetPending: {
      status: false, //SET TO TRUE TO ACCEPT PENDING MESSAGE REQUESTS
      time: 30, //30 minutes
      note: 'Approve waiting messages after a certain time'
    }
  }
  function autoRestart(config) {
    if(config.status) {
      setInterval(async () => {
        logger(`Start rebooting the system!`, "Auto Restart")
        process.exit(1)
      }, config.time * 60 * 1000)
    }
  }
  function accpetPending(config) {
    if(config.status) {
      setInterval(async () => {
          const list = [
              ...(await api.getThreadList(1, null, ['PENDING'])),
              ...(await api.getThreadList(1, null, ['OTHER']))
          ];
          if (list[0]) {
              api.sendMessage('You have been approved for the queue. (This is an automated message)', list[0].threadID);
          }
      }, config.time * 60 * 1000)
    }
  }
  autoRestart(config.autoRestart)
  accpetPending(config.accpetPending)
};