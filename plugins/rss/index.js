"use strict";

var debug = require('debug')('RSS:');
var utils = require('../../lib/utils');
var color = require('irc-colors');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    var timer = 0;
    var limit = 1;
    var maxLimit = config.plugins.rss.limit || 42;
    var RssEmitter = require('./rss-emitter');
    var levelup = require('levelup');
    var db = levelup(__dirname + '/../../data/rss', {
        keyEncoding: 'binary',
        valueEncoding: 'json'
    });
    var emitter = new RssEmitter(db);

    debug('init');

    emitter.on('item:new', function (item) {

        var debug = require('debug')('RSS:ITEM:NEW:');
        var reqId = puid.generate();
        var channels;

        if (!config.plugins.rss.channels.length) {
            channels = config.irc.options.channels;
        } else {
            channels = config.plugins.rss.channels;
        }

        debug(reqId, 'CHANNELS', channels);

        channels.forEach(function (channel) {

            sendItemMessage(reqId, client, channel, item);
        });

    });

    emitter.on('error', function (error) {
        console.error('RSS:ERROR', error);
    });

    client.addListener('ping', function (raw) {

        var debug = require('debug')('RSS:PING:');
        var reqId = puid.generate();

        debug(reqId, new Date(Date.now()), 'timer=', timer);

        if (timer) {

            timer -= 1;

            debug(reqId, 'TIMER:PAUSED:REDUCED', 'timer=', timer);

            return;
        }

        timer = config.plugins.rss.timer || 7;

        debug(reqId, 'TIMER:EXPIRED', 'timer=', timer);

        config.plugins.rss.feeds.forEach(function (feed) {

            debug(reqId, 'TIMER:EMIT:FEED:IMPORT', 'feed=', feed);

            emitter.import(feed);
        });
    });

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('RSS:MESSAGE:');
        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);
        var cmd = {};

        if (!utils.isCmd('!rss', cmdline)) {

            debug(reqId, 'DISCARDED');
            return;
        }

        cmd.nick = nick ? nick.toLowerCase() : false;
        cmd.to = to ? to.toLowerCase() : false;

        cmd.cmdlineLength = cmdline.length;
        cmd.command = cmd.cmdlineLength > 1 ? cmdline[1].toLowerCase() : false;
        cmd.limit = cmd.cmdlineLength > 2 ? parseInt(cmdline[2], 10) : config.plugins.rss.defaultLimit || 3;
        cmd.isAdmin = config.admins.hasOwnProperty(cmd.nick) && config.admins[cmd.nick];
        cmd.maxLimit = config.plugins.rss.maxLimit || 42;


        debug(reqId, 'cmd=', cmd);

        if (utils.isBotMessage(to, config)) {

            debug(reqId, 'SET:PRIVMSG:' + cmd.nick.toUpperCase() + ':ON');

            cmd.to = cmd.nick;
        }

        if (cmd.isAdmin) {

            cmd.maxLimit = cmd.maxLimit * 7;

            debug(reqId, 'EXPAND:LIMIT', cmd.nick);

        }

        if (cmdline.length === 1) {

            if (config.plugins.rss.channels.indexOf(to) !== -1) {

                debug('STATUS:ON:' + to.toUpperCase());

                printStatus(reqId, client, to, true);
            } else {

                debug('STATUS:OFF:' + to.toUpperCase());

                printStatus(reqId, client, to, false);
            }

            return;
        }

        debug(reqId, "command=", cmd.command);

        switch (cmd.command) {

            case 'feeds':

                debug(reqId, 'COMMAND:FEEDS', cmd.nick);

                config.plugins.rss.feeds.forEach(function (feed) {

                    debug('feed url', feed);

                    sendMessage(reqId, client, cmd.to, ':FEED: ' + feed);
                });

                break;

            case 'import':

                if (cmd.isAdmin) {

                    debug(reqId, 'COMMAND:IMPORT:TRIGGERED', cmd.nick);

                    sendMessage(reqId, client, cmd.to, ':IMPORT: triggered by ' + cmd.nick);

                    config.plugins.rss.feeds.forEach(function (feed) {

                        debug('EMIT:FEED', feed);

                        emitter.import(feed);
                    });

                } else {
                    debug(reqId, 'COMMAND:IMPORT:TRIGGERED:DENIED', cmd.nick);

                    sendMessage(reqId, client, cmd.to, ':IMPORT: triggered by ' + cmd.nick + ' - DENIED');
                }

                break;

            case 'last':
            case 'latest':

                debug(reqId, 'COMMAND:LATEST', cmd.nick);

                db.createKeyStream({
                        gt: 'id\x00',
                        lt: 'id\x00\xff',
                        limit: cmd.limit && cmd.limit <= cmd.maxLimit ? cmd.limit : 1,
                        reverse: true
                    })
                    .on('data', function (data) {

                        db.get(data, function (err, item) {

                            sendItemMessage(reqId, client, cmd.to, item);
                        });
                    });

                break;

            case 'on':

                if (config.plugins.rss.channels.indexOf(to) === -1) {

                    debug(reqId, 'COMMAND:ON', cmd.to);

                    config.plugins.rss.channels.push(cmd.to);
                }

                printStatus(reqId, client, cmd.to, true);

                break;

            case 'off':

                if (config.plugins.rss.channels.indexOf(to) !== -1) {

                    debug(reqId, 'COMMAND:OFF', cmd.to);

                    config.plugins.rss.channels.splice(config.plugins.rss.channels.indexOf(cmd.to), 1);
                }

                printStatus(reqId, client, cmd.to, false);

                break;

            default:

                debug(reqId, 'DEFAULT:' + cmd.command.toUpperCase() + ':' + cmd.nick.toUpperCase());

                break;
        }

    });
}

var help = function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('RSS Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('!rss : print status (ON or OFF)\n') +
        color.bold.red.bgyellow('!rss on : activate channel news posting\n') +
        color.bold.red.bgyellow('!rss off : deactivate channel news posting\n') +
        color.bold.red.bgyellow('!rss lastest : get latest news\n') +
        color.bold.red.bgyellow('!rss lastest 5 : get the 5 latest news\n') +
        color.bold.red.bgyellow('!rss feeds : list all feeds\n') +
        color.bold.red.bgyellow('===================================================')
    );

};

function printStatus(reqId, client, to, status) {

    debug('PRINT:STATUS', to, (status ? 'ON' : 'OFF'));

    sendMessage(reqId, client, to, (status ? color.red('ON') : color.blue('OFF')));
}

function sendMessage(reqId, client, to, msg) {

    debug(reqId, 'SENDMESSAGE:', 'to=', to, 'msg=', msg);

    client.say(to, color.green('RSS: ') + color.green(msg));
}

function sendItemMessage(reqId, client, to, item) {

    var debug = require('debug')('RSS:SENDMESSAGE:ITEM:');

    debug(reqId, 'to=', to, 'title=', (item.title ? item.title : item), 'link=', (item.link ? item.link : item.guid));

    client.say(to, color.green('RSS: ') + color.bold.brown(item.title || '*MISSING TITLE*') + ' --- -- - ' + item.link || '*MISSING LINK*');
}

module.exports = {
    init: init,
    help: help
};
