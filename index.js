#!/usr/bin/env node

var debug = require('debug')('MAIN');

var fs = require('fs');
var irc = require('irc');

var argv = require('minimist')(process.argv.slice(2));

var config = {};
var plugins = [];

process.on('uncaughtException', function (err) {
    console.error('ERROR: uncaughtException', err);
    console.error(err.stack);
    process.exit(1);
});

if (argv.config) {
    debug('USE:CONFIG:USER', argv.config);
    config = require(argv.config);
} else {
    debug('USE:CONFIG:PACKAGE');
    config = require('./config');
}

if (process.env.IRCBOT_PLUGINS) {
    plugins = process.env.IRCBOT_PLUGINS.replace(/\s+/g, '').split(',');
    debug('USE:ENV:IRCBOT_PLUGINS:' + plugins);

} else {
    plugins = fs.readdirSync('./plugins');
    debug('USE:ALL:PLUGINS:', plugins);
}

if (process.env.IRCBOT_NICKNAME) {
    config.irc.nickname = process.env.IRCBOT_NICKNAME;
    debug('ENV:IRCBOT_NICKNAME:' + config.irc.nickname);
}

if (process.env.IRCBOT_SERVER) {
    config.irc.server = process.env.IRCBOT_SERVER;
    debug('ENV:IRCBOT_SERVER:' + config.irc.server);
}

if (process.env.IRCBOT_CHANNELS) {
    config.irc.options.channels = process.env.IRCBOT_CHANNELS.replace(/\s+/g, '').split(',');
    debug('ENV:IRCBOT_CHANNELS:' + config.irc.options.channels);
}

// add ircbot nickname to allowed admins
config.admins[config.irc.nickname.toLowerCase()] = true;

var client = new irc.Client(
    config.irc.server,
    config.irc.nickname,
    config.irc.options
);

debug('START:', argv);

client.addListener('error', function (error) {
    console.error('MAIN:ERROR:', error);
});

client.addListener('registered', function (raw) {

    debug(config.irc.server);

    if (process.env.IRCBOT_NICKSERV) {
        debug('MAIN:REGISTERED:IRCBOT_NICKSERV', process.env.IRCBOT_NICKSERV);
        client.say('NickServ', 'identify ' + process.env.IRCBOT_NICKSERV);
    } else {
        console.error('MAIN:REGISTERED:WARNING: IRCBOT NICKSERV PASSWORD missing - set env IRCBOT_NICKSERV');
    }
});

config.plugins.debug = (process.env.IRCBOT_DEBUG || process.env.DEBUG) || false;

// load plugins
plugins.forEach(function (plugin) {

    var pluginDir = './plugins/' + plugin + '/';

    if (config.plugins[plugin] !== false && fs.existsSync(pluginDir)) {
        require(pluginDir).init(client, config);
        debug('PLUGIN:LOADED', plugin);
    }
});
