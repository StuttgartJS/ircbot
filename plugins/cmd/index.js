var debug = require('debug')('CMD:');

var utils = require('../../lib/utils');
var color = require('irc-colors');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    debug('init');

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('CMD:MESSAGE:');

        var reqId = puid.generate();

        var cmdline = utils.filterCommands(message);
        var cmd = {};

        cmd.cmdlineLength = cmdline.length;

        if (!utils.isCmd('!cmd', cmdline) || cmd.cmdlineLength < 2) {

            debug(reqId, 'DISCARDED');
            return;
        }

        debug(reqId, 'nick', nick, 'to=', to, 'message=', message);

        cmd.nick = nick ? nick.toLowerCase() : false;
        cmd.to = to ? to.toLowerCase() : false;
        cmd.isAdmin = config.admins.hasOwnProperty(cmd.nick) && config.admins[cmd.nick];

        debug(reqId, 'cmd=', cmd, 'cmdline=', cmdline);

        if (!cmd.isAdmin) {

            debug(reqId, 'DISCARDED:NO_AUTH');

            return;
        }

        debug = require('debug')('CMD:MESSAGE:COMMAND:');

        cmd.command = cmd.cmdlineLength > 1 && cmdline[1] ? cmdline[1].toLowerCase() : false;

        // cmd params
        // ==========
        cmd.param1 = cmd.receiver = cmd.cmdlineLength > 2 && cmdline[2] ? cmdline[2].toLowerCase() : false;
        //cmd.param2 = cmd.PARAM2 = cmd.cmdlineLength > 3 && cmdline[3] ? cmdline[3].toLowerCase() : false;
        cmd.msgMessage = cmd.cmdlineLength > 3 ? cmdline.slice(3).join(' ') : false;

        debug(reqId,
            'cmd=', cmd
        );

        switch (cmd.command) {

            case 'msg':

                debug = require('debug')('CMD:MESSAGE:COMMAND:MSG:');

                debug(reqId);

                if (
                    cmd.cmdlineLength > 3 &&
                    cmd.receiver.indexOf('#') === 0) {

                    client.say(cmd.receiver, cmd.msgMessage + ' (@' + nick + ')');

                    debug(
                        reqId,
                        'SEND:MESSAGE:CHANNEL:' + cmd.receiver.toUpperCase(),
                        'from=', cmd.nick,
                        'message=', cmd.msgMessage
                    );

                } else {
                    debug(reqId, 'ABORTED');
                }

                break;

            default:

                debug(reqId, 'DEFAULT:' + cmd.command.toUpperCase() + ':' + cmd.nick.toUpperCase());

                break;
        }

    });
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('========================================================\n') +
        color.bold.red.bgyellow('CMD Plugin\n') +
        color.bold.red.bgyellow('========================================================\n') +
        color.bold.red.bgyellow('!cmd msg #channel <your message> : send a message as bot\n') +
        color.bold.red.bgyellow('!cmd admin <nickname>  1|0 : set admin rights\n') +
        color.bold.red.bgyellow('========================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
