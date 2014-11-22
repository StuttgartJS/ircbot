var debug = require('debug')('DEBUG:');

var utils = require('../../lib/utils');
var color = require('irc-colors');

debug('Plugin loaded');

function init(client, config) {

    debug('init');

    // client.addListener('message', function (nick, to, message, raw) {
    //
    //     if (!utils.isBotMessage(nick, config)) {
    //         console.error("MESSAGE EVENT:", nick, to, message, raw);
    //     }
    // });

    // client.addListener('join', function (channel, nick, raw) {
    //
    //     if (!utils.isBotMessage(nick, config)) {
    //         console.error("JOIN EVENT:", channel, nick, raw);
    //     }
    // });

    debug('process.env.DEBUG=', process.env.DEBUG);

    client.addListener('raw', function (raw) {

        var debug = require('debug')('DEBUG:RAW:');

        debug('EVENT: raw', raw);
        // debug(config.admins);
    });
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('DEBUG Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('Only for dev\n') +
        color.bold.red.bgyellow('===================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
