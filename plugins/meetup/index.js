var debug = require('debug')('MEETUP:');
var utils = require('../../lib/utils');
var color = require('irc-colors');
var request = require('request');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    var debug = require('debug')('MEETUP');
    var api_key = process.env.IRCBOT_MEETUP_API_KEY || config.plugins.meetup.apiKey || '';
    var groupname = process.env.IRCBOT_MEETUP_GROUPNAME || config.plugins.meetup.groupname || '';
    var url = 'https://api.meetup.com/2/events?key=' +
        api_key +
        '&group_urlname=' +
        groupname +
        '&sign=true';

    debug('init');

    if (!api_key || !groupname) {

        console.log('ERROR: MEETUP PLUGIN NOT LOADED!');

        if (!api_key) {
            console.error('MISSING: IRCBOT_MEETUP_API_KEY - set -x IRCBOT_MEETUP_API_KEY "CHANGE_IT"');
        }

        if (!groupname) {
            console.error('MISSING: IRCBOT_MEETUP_GROUPNAME - set -x IRCBOT_MEETUP_GROUPNAME "CHANGE_IT"');
        }

        return;
    }

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('MEETUP:MESSAGE:');
        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);
        var cmd = {};

        if (!utils.isCmd('!meetup', cmdline)) {

            debug(reqId, 'DISCARDED');
            return;
        }

        debug(reqId, 'nick', nick, 'to=', to, 'message=', message);

        debug(reqId, 'COMMAND:RECOGNIZE');

        if (utils.isBotMessage(to, config)) {

            debug(reqId, 'SET:PRIVMSG:' + nick.toUpperCase() + ':ON');

            to = nick;
        }

        request(url, function (error, response, body) {

            var debug = require('debug')('MEETUP:MESSAGE:REQUEST:');

            if (!error && response.statusCode == 200) {

                debug(reqId, 'ESTABLISHED');

                var item = JSON.parse(body).results[0];

                var d = (new Date(item.time) + '').split(' ');
                var date = [d[2], d[1], d[3], d[4]].join(' ');

                var msg = color.green(date) + ' ' +
                    color.red(item.name) + ' ' +
                    item.yes_rsvp_count + ' ' +
                    'Teilnehmer' + ' ' +
                    item.event_url;

                sendMessage(reqId, client, to, msg);

                debug(reqId, 'SEND:MESSAGE:', msg);

            } else {
                console.error(reqId, 'MEETUP:MESSAGE:REQUEST:ERROR', 'error=', error, 'URL=', url);
            }
        });
    });

}

function sendMessage(reqId, client, to, msg) {

    debug(reqId, 'SENDMESSAGE:', 'to=', to, 'msg=', msg);

    client.say(to, color.green('MEETUP: ') + color.red(msg));
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('MEETUP Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('!meetup : Output info for next StuttgartJS Meetup\n') +
        color.bold.red.bgyellow('===================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
