"use strict";

var debug = require('debug')('HELP:');
var utils = require('../../lib/utils');
var color = require('irc-colors');
var pkg = require('../../package.json');
var Puid = require('puid');
var puid = new Puid(true);

debug('Plugin loaded');

function init(client, config) {

    var fs = require('fs');
    var plugins = fs.readdirSync(__dirname + '/../../plugins');
    var helper = {};

    debug('init');

    plugins.forEach(function (plugin) {

        if (config.plugins[plugin]) {

            try {

                helper[plugin] = require(__dirname + '/../../plugins/' + plugin + '/').help;

                debug('PLUGIN:REQUIRE:' + plugin.toUpperCase());

            } catch (e) {
                debug('PLUGIN:REQUIRE:' + plugin.toUpperCase() + ':FAILED');
            }

        }

    });

    client.addListener('message', function (nick, to, message, raw) {

        var debug = require('debug')('HELP:MESSAGE:');
        var reqId = puid.generate();
        var cmdline = utils.filterCommands(message);
        var cmd = {};

        if (!utils.isCmd('!help', cmdline)) {

            debug(reqId, 'DISCARDED');
            return;
        }

        debug(reqId, 'nick', nick, 'to=', to, 'message=', message);

        cmd.command = cmdline.length > 1 && cmdline[1] ? cmdline[1].toLowerCase() : false;

        if (cmd.command && helper[cmd.command]) {

            debug(reqId, 'COMMAND:' + cmd.command.toUpperCase());

            client.say(nick, helper[cmd.command]());

        } else {

            debug = require('debug')('HELP:USAGE:');

            debug(reqId);

            client.say(nick,
                color.bold.blue('==============================================\n') +
                color.bold.blue('YAIB - v' + pkg.version + ' ' + pkg.homepage + '\n') +
                color.bold.blue('!help : All ircbot functions\n') +
                color.bold.blue('==============================================\n')
            );

            plugins.forEach(function (plugin) {

                if (config.plugins[plugin] !== false) {

                    client.say(nick, color.bold.blue(
                        '!help ' + plugin
                    ));
                }
            });

            client.say(nick,
                color.bold.blue('==============================================\n'));
        }
    });
}

function help() {

    debug('HELP');

    return (
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('HELP Plugin\n') +
        color.bold.red.bgyellow('===================================================\n') +
        color.bold.red.bgyellow('!help // list all plugins\n') +
        color.bold.red.bgyellow('!help <command> // show command help\n') +
        color.bold.red.bgyellow('===================================================')
    );
}

module.exports = {
    init: init,
    help: help
};
