var debug = require('debug')('URLS:');

var utils = require('../../lib/utils');

var color = require('irc-colors');
var cheerio = require('cheerio');
var request = require('request');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    debug('init');

    var levelup = require('levelup');
    var db = levelup(__dirname + '/../../data/urls', {
        keyEncoding: 'binary'
    });

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('URLS:MESSAGE:');

        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);
        var re = /http[s]?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g;

        if (!utils.isCmd('!urls', cmdline) && !re.test(message)) {

            debug(reqId, 'DISCARDED');
            return;
        }

        var cmd = {};
        cmd.cmdlineLength = cmdline.length;
        cmd.limit = cmd.cmdlineLength > 1 ? parseInt(cmdline[1], 10) : config.plugins.urls.defaultLimit || 3;
        cmd.maxLimit = config.plugins.urls.maxLimit || 42;

        cmd.nick = nick ? nick.toLowerCase() : false;
        cmd.to = to ? to.toLowerCase() : false;

        var urls = [];
        var match;

        if (utils.isCmd('!urls', cmdline)) {

            debug = require('debug')('URLS:MESSAGE:COMMAND:');

            debug(reqId, 'cmdline=', cmdline, 'cmd=', cmd);

            if (utils.isBotMessage(cmd.to, config)) {

                debug(reqId, 'SET:PRIVMSG:' + cmd.nick.toUpperCase() + ':ON');

                cmd.to = cmd.nick;
            }

            if (config.admins[cmd.nick]) {

                cmd.maxLimit = cmd.maxLimit * 7;

                debug(reqId, 'EXPAND:LIMIT:' + cmd.maxLimit);
            }

            db.createKeyStream({
                    gt: 'urls\x00',
                    lt: 'urls\x00\xff',
                    limit: cmd.limit && cmd.limit <= cmd.maxLimit ? cmd.limit : 3,
                    reverse: true
                })
                .on('data', function (data) {

                    db.get(data, function (err, url) {

                        sendMessage(reqId, client, to, url);
                    });
                });

        } else {

            debug = require('debug')('URLS:MESSAGE:EXTRACT:');

            // extract URLs from message

            /* jshint -W084 */
            for (re.lastIndex = 0; match = re.exec(message);) {
                urls.push(match[0]);
            }
            /* jshint +W084 */

            debug(reqId, 'URLS:', urls);

            urls.forEach(function (url) {

                debug(reqId, 'SAVE:URL', url);

                request(url, function (error, response, body) {

                    debug(reqId, 'REQUEST', url);

                    if (!error && response.statusCode == 200) {

                        url += ' ' + cheerio.load(body)('title').text().replace(/(\r\n|\n|\r)/gm, "");

                        debug(reqId, 'REQUEST:ADD:URL', url);

                        db.put('urls\x00' + puid.generate(), url, function (err) {

                            if (err) {
                                debug(reqId, 'LEVELDB:ERROR');
                            } else {
                                debug(reqId, 'LEVELDB:INSERTED', url);
                            }
                        });
                    } else {
                        debug(reqId, 'REQUEST:FAILED');
                    }

                });
            });
        }
    });
}

function sendMessage(reqId, client, to, msg) {

    debug(reqId, 'SENDMESSAGE:', 'to=', to, 'msg=', msg);

    client.say(to, color.blue('URL: ') + color.brown(msg));
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('URLS Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('!urls : get latest URLs\n') +
        color.bold.red.bgyellow('!urls 5 : get the 5 latest URLs\n') +
        color.bold.red.bgyellow('===================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
