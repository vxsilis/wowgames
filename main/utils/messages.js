// formats a message with playre's username, the message and the time it was sent
const moment = require('moment');

function formatMessage(username, text) {

  return {
    username,
    text,
    time: moment().format('h:mm')
  };
}

module.exports = formatMessage;
