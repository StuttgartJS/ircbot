var debug = require('debug')('UTILS');

exports = module.exports = {
    isChannel: isChannel,
    filterCommands: filterCommands,
    isCmd: isCmd,
    isBotMessage: isBotMessage
};

function isChannel(value) {

    if (value.indexOf('#') === 0) {
        return true;
    } else {
        return false;
    }
}
function filterCommands(message) {

    return message.split(' ').filter(function (el) {

        return el.length > 0;
    });
}

function isCmd(value, cmdline) {

    if (cmdline.length) {
        return (
            cmdline[0].toLowerCase() === value.toLowerCase()
        );
    } else {
        return false;
    }
}

function isBotMessage(to, config) {

    return (
        to.toLowerCase() === config.irc.nickname.toLowerCase()
    );

}
