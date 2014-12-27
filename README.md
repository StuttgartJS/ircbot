IRCBOT
======

Yet another IrcBot

Installation
============

```
$ git clone ....

# set environment variables

$ set IRCBOT_NICKNAME "botname"
$ set IRCBOT_SERVER "irc.freenode.net"
$ set IRCBOT_NICKSERV "nickserv-password"

$ set IRCBOT_CHANNELS "#StuttgartJS,#StuttgartJS-Links"

$ set IRCBOT_MEETUP_GROUPNAMES "stuttgartjs,Web-Dev-BBQ-Stuttgart"
$ set IRCBOT_MEETUP_API_KEY "CHANGE_IT"

$ set DEBUG=*    // see https://www.npmjs.org/package/debug
```

Copy config.js to ex. myConfig.js

```
$ node index.js --config myConfig.js
```

Plugins
=======

Activate plugins in your custom config.js

### RSS

retrieve feeds and send new items to the channel(s)

-	!rss // print status (ON or OFF)
-	!rss on // activate channel news posting
-	!rss off // deactivate channel news posting
-	!rss lastest // get latest news
-	!rss lastest 5 // get the 5 latest news
-	!rss feeds // list all feeds

```
config.plugins.rss: {
    channels: ['#StuttgartJS-Links'],   // only active in this channels
    defaultLimit: 3,                    // limit for rss latest
    maxLimit: 7,                        // limit for rss latest
    checkFeedsTimer: 3,                 // after 3 pings check feeds
    feeds: ['http://echojs.com/rss']    // feed URLs
}
```

### Hello

Output welcome message when user joins the channel

```
config.plugins.hello: {
    salutation: 'Welcome, ',
    message: 'Send "!help" to get help'
}
```

### Meetup

-	!meetup // Output info for next StuttgartJS Meetup

```
config.plugins.meetup: {
    groupnames: ["stuttgartjs", "Web-Dev-BBQ-Stuttgart"],
    api_key: " set -x IRCBOT_MEETUP_API_KEY 'CHANGE_IT' "
}
```

```
$ set -x IRCBOT_MEETUP_GROUPNAMES "stuttgartjs,Web-Dev-BBQ-Stuttgart"
$ set -x IRCBOT_MEETUP_API_KEY "CHANGE_IT"
```

### URLs

Save URLs from channel messages

-	!urls // get latest URLs
-	!urls 5 // get the 5 latest URLs

```
config.plugins.urls: {
    // for listing last saved urls
    maxLimit: 42,
    defaultLimit: 3
}
```

### Help

Output help :-)

```
config.plugins.help: true
```

### Auth

Authenticate yourself as admin

-	!auth // authenticate yourself as admin
-	!auth list // list all authenticated admins
-	!auth add <nickname> // authenticate nickname
-	!auth remove <nickname> // remove nickname from admins

```
config.plugins.auth: true  // default notify: false

config.plugins.auth: {
    notify: false
}
```

### Cmd

Send commands to the bot (you must be auth'en as admin)

-	!cmd msg <#channel> <your message> // send a message as bot

```
config.plugins.cmd: true
```

-	!cmd admin <nickname> 1|0 // set admin rights
-	!cmd [+|-]op <#channel> <nickname> // give|take nickname channel-op on #channel
-	!cmd [+|-]op <nickname> // give|take nickname channel-op on current channel
-	!cmd [+|-]op // give|take yourself channel-op on current channel

### Debug

Only for dev – output raw events

see module https://npmjs.org/package/debug

```
$ set DEBUG "DEBUG:*"
```
