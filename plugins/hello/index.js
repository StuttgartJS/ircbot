var debug = require('debug')('HELLO:');

var utils = require('../../lib/utils');
var color = require('irc-colors');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    debug('init');

    var salutation = process.env.IRCBOT_HELLO_SALUTION || config.plugins.hello.salutation || 'Hi';
    var helloMessage = process.env.IRCBOT_HELLO_MESSAGE || config.plugins.hello.message || 'Send !help to me.';

    client.addListener('join', function (channel, nick, raw) {

        var debug = require('debug')('HELLO:JOIN:');

        var reqId = puid.generate();

        var cmd = {};
        cmd.nick = nick ? nick.toLowerCase() : false;
        cmd.hasAdmin = config.admins.hasOwnProperty(cmd.nick);

        debug(reqId, channel.toUpperCase() + ':' + nick.toUpperCase(), 'cmd.hasAdmin=', cmd.isAdmin );

        if (!utils.isBotMessage(cmd.nick, config) && !cmd.hasAdmin) {

            debug(reqId, 'SEND:WELCOME:');

            sendMessage(reqId,
                client,
                channel,
                salutation + ' ' + nick + '!  ' +
                helloMessage
            );
        } else {
            debug(reqId, 'DISCARDED');
        }
    });
}

function sendMessage(reqId, client, to, msg) {

    debug(reqId, 'SENDMESSAGE:', 'to=', to, 'msg=', msg);

    client.say(to, color.bold.gray(msg));
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('HELLO Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('Output welcome message when user joins the channel\n') +
        color.bold.red.bgyellow('===================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
