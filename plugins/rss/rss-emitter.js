var debug = require('debug')('RSS:EMITTER:');

(function () {
    var EventEmitter, RssEmitter, feedparser, levelup, request, Puid, puid,
        __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function Ctor() {
                this.constructor = child;
            }
            Ctor.prototype = parent.prototype;
            child.prototype = new Ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    Puid = require('puid');
    request = require('request');
    Feedparser = require('feedparser');
    levelup = require('levelup');
    EventEmitter = require('events').EventEmitter;
    url = require('url');

    puid = new Puid(true);

    RssEmitter = (function (_super) {

        __extends(RssEmitter, _super);

        function RssEmitter(db) {
            this.db = db;
        }

        RssEmitter.prototype["import"] = function (url) {

            var debug = require('debug')('RSS:EMITTER:IMPORT:');
            var fp, pipe, req, self;

            debug('request received for', 'url=', url);

            fp = new Feedparser({
                addmeta: false
            });
            self = this;
            req = request(url);

            pipe = req.pipe(fp);

            pipe.on('error', function (error) {
                console.error('PLUGIN:RSS:EMITTER:ERROR', error);
            });

            return pipe.on('readable', function () {

                var debug = require('debug')('RSS:EMITTER:IMPORT:READABLE:');
                var item;

                item = this.read();

                return self.db.get(item.guid, function (err, value) {

                    var debug = require('debug')('RSS:EMITTER:IMPORT:READABLE:DB');

                    debug('search item.guid=', item.guid);

                    if (err) {

                        item.id = puid.generate();

                        debug('generated id=', item.guid, 'not listed');

                        return self.db.put('id\x00' + item.id, item, function (err) {

                            var debug = require('debug')('RSS:EMITTER:IMPORT:READABLE:DB:PUT:ID');

                            debug(
                                'item.id=','id\x00' + item.id,
                                'item.guid=', item.guid,
                                'err=', err
                            );
                            return self.db.put(item.guid, '{ "loaded": "true" }', function (err) {

                                var debug = require('debug')('RSS:EMITTER:IMPORT:READABLE:DB:PUT:LOADED');

                                debug(
                                    'item.id=','id\x00' + item.id,
                                    'item.title=', item.title,
                                    'err=', err
                                );

                                return self.emit('item:new', item);
                            });
                        });
                    } else {
                        debug = require('debug')('RSS:EMITTER:IMPORT:READABLE:DB:PUT:SKIPPED');

                        debug(item.guid,
                            'trigger' ,
                            'item:skipped',
                            'item.title=', item.title,
                            'item.link=', item.link,
                            'item.guid=', item.guid
                        );

                        return self.emit('item:skipped', item.guid);
                    }
                });
            });

        };

        return RssEmitter;

    })(EventEmitter);

    module.exports = RssEmitter;

}).call(this);
