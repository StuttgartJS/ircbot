var debug = require('debug')('AUTH:');

var utils = require('../../lib/utils');

var color = require('irc-colors');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    debug('init');

    client.addListener('join', function (channel, nick, raw) {

        var debug = require('debug')('AUTH:JOIN:');
        var reqId = puid.generate();

        debug(reqId, channel.toUpperCase() + ':' + nick.toUpperCase());

        client.say('NickServ', 'ACC' + ' ' + nick);
    });

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('AUTH:MESSAGE:');
        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);
        var cmd = {};
        cmd.cmdlineLength = cmdline.length;

        // early return
        if (!utils.isCmd('!auth', cmdline) || cmd.cmdlineLength > 3) {

            debug(reqId, 'DISCARDED');
            return;
        }

        cmd.nick = nick ? nick.toLowerCase() : false;
        cmd.to = to ? to.toLowerCase() : false;
        cmd.isAdmin = config.admins.hasOwnProperty(cmd.nick) && config.admins[cmd.nick];

        debug(reqId, 'cmdline=', cmdline, 'cmd=', cmd);

        if (cmd.cmdlineLength === 1) {

            debug(reqId, 'SEND:ACC:REQUEST:' + cmd.nick.toUpperCase());

            client.say('NickServ', 'ACC' + ' ' + cmd.nick);

            return;
        }

        if (utils.isBotMessage(cmd.to, config)) {

            debug(reqId, 'SET:PRIVMSG:' + cmd.nick.toUpperCase() + ':ON');

            cmd.to = cmd.nick;
        }

        cmd.command = cmd.cmdlineLength > 1 && cmdline[1] ? cmdline[1].toLowerCase() : false;
        cmd.user = cmd.cmdlineLength > 2 && cmdline[2] ? cmdline[2].toLowerCase() : false;

        debug(reqId, 'COMMAND:RECOGNIZED:' + cmd.command.toUpperCase());

        switch (cmd.command) {

            case 'list':

                debug = require('debug')('AUTH:MESSAGE:COMMAND:LIST:');

                debug(reqId);

                cmd.admins = [];

                Object.keys(config.admins).forEach(function (admin) {

                    var name = admin.toLowerCase();

                    if (config.admins[name]) {
                        cmd.admins.push(name);
                    }
                });

                debug(reqId, 'SEND:MSG:ADMINS', 'cmd.admins=', cmd.admins);

                sendMessage(reqId,
                    client,
                    cmd.to,
                    'ADMINS: ' +
                    (cmd.admins.length ? cmd.admins.join(', ') : 'tortelini')
                );

                break;

            case 'add':

                debug = require('debug')('AUTH:MESSAGE:COMMAND:ADD:');

                debug(reqId);

                if (cmd.isAdmin && cmd.user) {

                    config.admins[cmd.user] = true;

                    debug(reqId, cmd.nick.toUpperCase());
                }

                debug(reqId, 'ADMINS:', config.admins);

                break;

            case 'remove':

                debug = require('debug')('AUTH:MESSAGE:COMMAND:REMOVE:');

                debug(reqId);

                if (cmd.isAdmin && cmd.user) {

                    delete(config.admins[cmd.user]);

                    debug(reqId, cmd.nick.toUpperCase());
                }

                debug(reqId, 'ADMINS:', config.admins);

                break;

            default:

                debug(reqId, 'DEFAULT:' + cmd.command.toUpperCase() + ':' + cmd.nick.toUpperCase());

                break;
        }
    });

    client.addListener('notice', function (nick, to, message, raw) {

        var debug = require('debug')('AUTH:NOTICE:');

        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);

        var cmd = {};
        cmd.cmdlineLength = cmdline.length;
        cmd.nick = nick && nick.length ? nick.toLowerCase() : false;

        // early return
        if (cmd.cmdlineLength > 4 || !cmd.nick) {

            debug(reqId, 'DISCARDED', 'cmd=', cmd, 'cmdline=', cmdline);
            return;
        }

        cmd.user = cmd.receiver = cmd.cmdlineLength && cmdline[0] ? cmdline[0].toLowerCase() : false;
        cmd.isAdmin = config.admins.hasOwnProperty(cmd.nick) && config.admins[cmd.nick];
        cmd.hasAdmin = config.admins.hasOwnProperty(cmd.user);
        cmd.nickservAcc = 'ACC';
        cmd.nickservStatus = 3;
        cmd.nickserv = 'nickserv';

        debug(reqId, 'cmdline=', cmdline, 'cmd=', cmd);

        if (
            cmd.cmdlineLength === 3 || cmd.cmdlineLength === 4 &&
            utils.isBotMessage(to, config) &&
            cmd.nick === cmd.nickserv &&
            cmd.nickservAcc === cmdline[1].toUpperCase() &&
            cmd.nickservStatus === parseInt(cmdline[2], 10) &&
            !cmd.isAdmin &&
            hasAdmin &&
            cmd.user
        ) {

            config.admins[cmd.user] = true;
            //sendMessage(reqId, client, cmd.user, 'AUTH: changed role to admin');
        }

    });

    client.addListener('nick', function (oldnick, newnick, channels, raw) {

        var debug = require('debug')('AUTH:NICK:');

        var reqId = puid.generate();

        var cmd = {};
        cmd.oldnick = oldnick ? oldnick.toLowerCase() : false;
        cmd.newnick = newnick ? newnick.toLowerCase() : false;
        cmd.isAdmin = cmd.oldnick ? config.admins[cmd.oldnick] : false;

        if (!cmd.oldnick || !cmd.newnick || !cmd.isAdmin) {

            debug(reqId, 'DISCARDED', 'cmd=', cmd);
            return;
        }

        debug(reqId, 'cmd=', cmd.oldnick);

        deauthAdmin(reqId, config, cmd.oldnick);

        config.admins[cmd.newnick] = true;

        debug(reqId, 'ADMIN:RIGHTS:ADDED:' + cmd.newnick.toUpperCase());

    });

    client.addListener('part', function (channel, nick, reason, raw) {

        var debug = require('debug')('AUTH:PART:');

        var reqId = puid.generate();

        debug(reqId, 'nick=', nick);

        deauthAdmin(reqId, config, nick);
    });

    client.addListener('quit', function (nick, reason, channels, raw) {

        var debug = require('debug')('AUTH:QUIT:');

        var reqId = puid.generate();

        debug(reqId, 'nick=', nick);

        deauthAdmin(reqId, config, nick);
    });
}

function deauthAdmin(reqId, config, nick) {

    var debug = require('debug')('AUTH:DEAUTH:');

    var cmd = {};
    cmd.nick = nick ? nick.toLowerCase() : false;
    cmd.isAdmin = config.admins[cmd.nick];

    debug(reqId, 'cmd=', cmd);

    if (cmd.isAdmin) {

        config.admins[cmd.nick] = false;

        debug(reqId, 'ADMIN:RIGHTS:REMOVED:' + cmd.nick.toUpperCase());
    } else {
        debug(reqId, 'ADMIN:RIGHTS:UNCHANGED:' + cmd.nick.toUpperCase());
    }

}

function sendMessage(reqId, client, to, msg) {

    debug(reqId, 'SENDMESSAGE:', 'to=', to, 'msg=', msg);

    client.say(to, color.brown('AUTH: ') + color.bold.brown(msg));
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('==============================================================\n') +
        color.bold.red.bgyellow('AUTH Plugin\n') +
        color.bold.red.bgyellow('==============================================================\n') +
        color.bold.red.bgyellow('!auth : authenticate yourself as admin\n') +
        color.bold.red.bgyellow('!auth list : list all authenticated admins\n') +
        color.bold.red.bgyellow('!auth add <nickname> : authenticate nickname\n') +
        color.bold.red.bgyellow('!auth remove <nickname> : remove nickname from admins\n') +
        color.bold.red.bgyellow('==============================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
