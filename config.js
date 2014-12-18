module.exports = {
    irc: {
        server: 'irc.freenode.net',
        nickname: 'StgtJS',
        options: {
            userName: 'StgtJS',
            realName: 'StuttgartJS ircbot',
            port: 7070,
            debug: false,
            showErrors: false,
            autoRejoin: true,
            autoConnect: true,
            channels: ['#StuttgartJS', '#StuttgartJS-Links'],
            secure: true,
            selfSigned: false,
            certExpired: false,
            floodProtection: true,
            floodProtectionDelay: 1000,
            sasl: false,
            stripColors: false,
            channelPrefixes: "&#",
            messageSplit: 512
        }
    },

    plugins: {
        example: false, // disabled

        auth: {
            notify: false
        },
        cmd: true,

        help: true,

        hello: {
            salutation: 'Welcome, ',
            message: 'Send "!help" to get help'
        },

        meetup: {
            groupname: 'stuttgartjs',
            apiKey: '' // set -x IRCBOT_MEETUP_API_KEY 'CHANGE_IT' "
        },

        urls: {
            maxLimit: 42, // limit for rss latest
            defaultLimit: 1 // limit for rss latest
        },

        //* for #StuttgartJS
        rssStuttgartJS: {
            // only activ in this channels
            channels: ['#StuttgartJS'],
            //channels: ['#StuttgartJS', '#StuttgartJS-Links'],
            limit: 42, // limit for rss latest
            timer: 30, // after 30 pings check feeds ~60min
            feeds: [
                'http://echojs.com/rss',
                'http://feeds.feedburner.com/dailyjs?format=xml',
                'http://feeds.feedburner.com/html5rocks',
                'http://www.reddit.com/r/javascript/.rss',
                'http://howtonode.org/feed.xml',
                'http://www.planetnodejs.com/feed',
                'http://www.reddit.com/r/node/.rss',
                'https://www.joyent.com/blog/feed'
            ]
        },
        //*/

        rss: {
            // only activ in this channels, if empty than active in all channels
            channels: ['#StuttgartJS-Links'],
            maxLimit: 42, // limit for rss latest
            defaultLimit: 3, // limit for rss latest
            timer: 3, // after 3 pings check feeds
            feeds: [
                'http://echojs.com/rss',
                'http://www.heise.de/open/news/news-atom.xml',
                'http://www.heise.de/security/news/news-atom.xml',
                'http://www.techstage.de/rss.xml',
                'http://www.heise.de/developer/rss/news-atom.xml',
                'http://feeds.feedburner.com/dailyjs?format=xml',
                'http://feeds.feedburner.com/aktuell/feeds/rss?format=xml',
                'http://feeds2.feedburner.com/codegeekz',
                'http://perfectionkills.com/feed.xml',
                'http://rss.golem.de/rss.php?feed=RSS1.0',
                'http://feeds.feedburner.com/html5rocks',
                'http://www.reddit.com/r/javascript/.rss',
                'http://www.2ality.com/feeds/posts/default',
                'https://hacks.mozilla.org/feed/',
                'http://www.smashingmagazine.com/feed/',
                'http://www.dezignmatterz.com/feed',
                'http://feeds.feedburner.com/HighScalability',
                'http://www.silicon.de/feed/',
                'http://www.drweb.de/magazin/feed/',
                'http://feeds.feedburner.com/CssTricks',
                'http://www.sitepoint.com/feed',
                'http://ariya.ofilabs.com/feed',
                'http://feeds.feedburner.com/ModernWebHQ',
                'http://feeds2.feedburner.com/tympanus',
                'http://news.centurylinklabs.com/rss',
                'http://howtonode.org/feed.xml',
                'http://marijnhaverbeke.nl/blog/feed.atom',
                'http://www.geek-week.de/feed/',
                'http://googlewebmastercentral.blogspot.com/atom.xml',
                'http://www.seo-united.de/blog/feed',
                'http://davidwalsh.name/feed',
                'http://feeds.feedburner.com/TechCrunch/',
                'http://ponyfoo.com/articles/feed',
                'http://www.planetnodejs.com/feed',
                'http://www.reddit.com/r/node/.rss',
                'https://www.joyent.com/blog/feed',
                'http://readwrite.com/rss.xml',
                'http://www.bhorowitz.com/blog.rss',
                'http://scotch.io/feed',
                'http://www.onlinemarketingrockstars.de/feed/',
                'http://www.netzaktiv.de/feed/',
                'http://eisenbergeffect.bluespire.com/rss/',
                'http://www.gizmodo.de/feed',
                'http://javascriptweekly.com/rss/18em492a',
                'http://mobilewebweekly.co/rss/1cd436ic',
                'http://jsforallof.us/feed.xml',
                'http://grochtdreis.de/weblog/feed/',
                'http://feeds.feedburner.com/atozcss',
                'http://feeds.sidebar.io/SidebarFeed',
                'http://blog.millermedeiros.com/feed/',
                'http://www.merrickchristensen.com/atom.xml',
                'http://www.heydonworks.com/feed',
                'http://www.designmadeingermany.de/feed/',
                'http://www.talentbuddy.co/blog/rss/',
                'http://javascriptweekly.com/rss/2635acpd',
                'http://angularjs.de/feed',
                'http://blogs.msdn.com/b/eternalcoding/rss.aspx',
                'http://feeds.feedburner.com/bocoup',
                'http://feeds.feedburner.com/creativebloq/',
                'http://shitformakingwebsites.com/feed/',
                'http://feeds2.feedburner.com/webresourcesdepot',
                'http://rss.badassjs.com/',
                'http://substack.net/blog.xml',
                'https://www.seroundtable.com/index.rdf',
                'http://msdn.microsoft.com/de-de/magazine/cc194384.aspx',
                'http://feeds.feedblitz.com/derickbailey',
                'http://simpleprogrammer.com/feed/',
                'http://joshuaearl.com/feed/',
                'http://de.letsseewhatworks.com/feed/',
                'http://programmingpraxis.com/feed/',
                'http://xkcd.com/atom.xml',
                'http://feeds.feedburner.com/codinghorror',
                'http://feeds2.feedburner.com/thenextweb',
                'http://www.webmonkey.com/feed/',
                'http://feeds2.feedburner.com/Webappers',
                'http://feeds.feedburner.com/webresourcesdepot?format=xml',
                'http://ajaxian.com/index.xml',
                'http://www.designfloat.com/rss.php',
                'http://design.tutsplus.com/posts.atom',
                'http://designreviver.com/feed/',
                'http://feeds2.feedburner.com/SpoonGraphics',
                'http://boxesandarrows.com/home/feed/',
                'https://www.thebestdesigns.com/rss/feed.rss',
                'http://alistapart.com/site/rss',
                'http://webdesignfromscratch.com/category/html-css/feed/',
                'http://www.456bereastreet.com/feed.xml',
                'http://feeds2.feedburner.com/ProBlogDesign',
                'http://calendar.perfplanet.com/feed/'

            ]
        }
    },

    // all nicknames lowerCase !!
    admins: {
        '_pid': false,
        '_pid_': false,
        '_pid1': false,
        '_pid2': false,

        'drmabuse': false,
        'drmabuse_': false,

        'dypsilon': false,
        'dypsilon_': false,

        'hellomichibye': false,
        'hellomichibye_': false,

        'hobbyquaker': false,
        'hobbyquaker_': false,

        'jorin': false,
        'jorin_': false,

        'markus-': false,
        'markus-_': false,

        'xat-': false,
        'xat-_': false,

        'xorrr': false,
        'xorrr_': false

    }

};
