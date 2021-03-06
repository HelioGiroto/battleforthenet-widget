'use strict';

(function() {
  var transitionTimer;

  var loading = document.getElementById('loading');
  var main = document.getElementById('main');
  var callScript = document.getElementById('script');

  function getOrg(org) {
    function getRandomOrg() {
      var coinToss = Math.random();

      if (coinToss < .20) {
        return 'fp';
      } else if (coinToss < .60) {
        return 'dp';
      } else {
        return 'fftf';
      }
    }

    var orgs = {
      'dp': {
        code: 'dp',
        name: 'Demand Progress',
        url: 'https://demandprogress.org/',
        donate: 'https://secure.actblue.com/donate/nndayofaction?refcode=20170712-bftn'
      },
      'fp': {
        code: 'fp',
        name: 'Free Press Action Fund',
        url: 'https://www.freepress.net/',
        donate: 'https://freepress.actionkit.com/donate/single/'
      },
      'fftf': {
        code: 'fftf',
        name: 'Fight for the Future',
        url: 'https://www.fightforthefuture.org/',
        donate: 'https://donate.fightforthefuture.org/'
      }
    };

    return orgs.hasOwnProperty(org) ? orgs[org] : orgs[getRandomOrg()];
  }

  function getTheme(theme) {
    var themeObj;

    switch(typeof theme === 'string' ? theme : '') {
      case 'money':
        themeObj = {
          className: theme,
          logos: ['images/money.png'],
          headline: 'Please upgrade your plan to proceed.',
          body: 'Well, not yet. But without net neutrality, cable companies could censor websites based on their content, or to favor their own business partners. Congress can stop them, but only if we flood them with calls right now.'
        };
        break;
      case 'stop':
        themeObj = {
          className: theme,
          logos: ['images/stop.png'],
          headline: 'This site has been blocked by your ISP.',
          body: 'Well, not yet. But without net neutrality, cable companies could censor websites, favoring their own business partners. We can stop them and keep the Internet open, fast, and awesome if we all contact the U.S. Congress and the FCC, but we only have a few days left.'
        };
        break;
      case 'slow':
        themeObj = {
          className: theme,
          logos: ['images/slow.svg'],
          headline: 'Sorry, we\'re stuck in the slow lane.',
          body: 'Well, not yet. But the FCC is about to vote to get rid of net neutrality, letting ISPs slow sites like this to a crawl and charge everyone extra fees. Congress can stop them, but only if we flood them with calls right now.'
        };
        break;
      case 'without':
        themeObj = {
          className: theme,
          logos: ['images/slow.svg', 'images/stop_gradient.png', 'images/money_gradient.png'],
          headline: 'This is the web without net neutrality.',
          body: 'The FCC is about to vote to get rid of net neutrality. Without it, sites like this could be censored, slowed down, or forced to charge extra fees. Congress can stop them, but only if we flood them with calls right now.'
        };
        break;
      case 'countdown':
      default:
        themeObj = {
          className: 'countdown',
          logos: [],
          headline: 'URGENT!',
          body: 'The FCC is about to announce a vote on its plan to kill net neutrality. We have just days to stop censorship, throttling, and extra fees online. Congress needs to hear from Internet users like you right now.'
        };
        break;
    }

    if (typeof theme == 'object') {
      var keys = Object.keys(theme);
      for (var k = 0; k < keys.length; k++) {
        themeObj[keys[k]] = theme[keys[k]];
      }
    }

    return themeObj;
  }

  function renderContent(theme) {
    document.body.classList.add(theme.className);

    // Render logos
    var fragment = document.createDocumentFragment();
    var img;

    for (var i = 0; i < theme.logos.length; i++) {
      img = document.createElement('img');
      img.setAttribute('src', theme.logos[i]);
      fragment.appendChild(img);
    }

    document.getElementById('logos').appendChild(fragment);

    // Render headline and body copy
    document.getElementById('headline').textContent = theme.headline;

    var bodyFragment = document.createDocumentFragment();
    var bodyCopy = theme.body.split('\n');
    var paragraph;

    for (var i = 0; i < bodyCopy.length; i++) {
      paragraph = document.createElement('p');
      paragraph.textContent = bodyCopy[i];
      bodyFragment.appendChild(paragraph);
    }
    
    var learnMore = document.createElement('a');
    learnMore.setAttribute('href', 'https://www.battleforthenet.com/#widget-learn-more');
    learnMore.setAttribute('target', '_blank');
    learnMore.textContent = 'Learn more.';

    // Append link to last paragraph in body copy.
    paragraph.textContent += ' ';
    paragraph.appendChild(learnMore);

    document.getElementById('content').appendChild(bodyFragment);

    if (theme.className === 'countdown' && typeof Countdown === 'function') {
      new Countdown({
        target: '#countdown',
        date: this.options.date
      });
    }
  }

  function addCloseListeners() {
    // Add close button listener.
    document.getElementById('close').addEventListener('mousedown', function(e) {
      e.preventDefault();
      sendMessage('stop');
    });

    document.getElementById('background').addEventListener('mousedown', function(e) {
      // Ignore events that propagate up
      if (e.target == document.getElementById('background')) sendMessage('stop');
    });
  }

  function sendMessage(requestType, data) {
    data || (data = {});
    data.requestType = requestType;
    data.BFTN_IFRAME_MSG = true;
    parent.postMessage(data, '*');
  }

  function initGoogleAnalytics() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    if (typeof ga !== 'undefined') {
      ga('create', 'UA-26576645-40', 'auto');
      ga('send', 'pageview');
    }
  }

  var animations = {
    main: {
      options: {
        debug: false,
      },
      init: function(options) {
        var keys = Object.keys(options);
        for (var k = 0; k < keys.length; k++) {
          this.options[keys[k]] = options[keys[k]];
        }

        renderContent.call(this, getTheme(this.options.theme));

        var org = getOrg(this.options.org);
        var donateLinks = document.querySelectorAll('a.donate');
        if (donateLinks.length) {
          for (var i = 0; i < donateLinks.length; i++) {
            if (org.donate) donateLinks[i].setAttribute('href', org.donate);
            donateLinks[i].addEventListener('click', setActionCookie.bind(this));
          }
        }

        if (this.options.uncloseable) {
          document.getElementById('close').classList.add('hidden');
        } else {
          addCloseListeners();
        }

        if (!(this.options.disableGoogleAnalytics || navigator.doNotTrack)) initGoogleAnalytics();

        function onError(e) {
          // TODO: Error handling
        }

        function showCallScript(e) {
          if (transitionTimer) clearTimeout(transitionTimer);

          if (callScript) callScript.classList.remove('invisible');
          if (main) main.classList.add('invisible');
          if (loading) loading.classList.add('hidden');
        }

        function setActionCookie() {
          sendMessage('cookie', {
            name: '_BFTN_WIDGET_ACTION',
            val: 'true',
            expires: this.options.actionCookieExpires
          });
        }

        function onCall(e) {
          if (transitionTimer) clearTimeout(transitionTimer);

          // TODO: Error handling
          // if (e && e.code >= 400) return onError(e);

          setActionCookie.call(this);

          if (loading) {
            loading.addEventListener('transitionend', showCallScript);
            loading.classList.add('invisible');
          }

          transitionTimer = setTimeout(showCallScript, 500);
        }

        var call = document.getElementById('call');
        call.addEventListener('submit', function submitCall(e) {
          e.preventDefault();

          var footer = document.getElementById('footer');
          if (footer) {
            footer.classList.remove('hidden');
            footer.classList.remove('invisible');
          }

          if (callScript) callScript.classList.remove('hidden');
          if (main) main.classList.add('hidden');

          var formData = new FormData(call);
          var xhr = new XMLHttpRequest();

          if (loading) {
            loading.addEventListener('transitionend', onCall.bind(this));
            loading.classList.remove('hidden');
            loading.classList.remove('invisible');
          }

          transitionTimer = setTimeout(onCall.bind(this), 500);

          xhr.open(call.getAttribute('method'), call.getAttribute('action') + '?ref=' + document.referrer, true);
          xhr.send(formData);
        }.bind(this));

        return this;
      },
      log: function() {
        if (this.options.debug) console.log.apply(console, arguments);
      }
    }
  }

  // Handle iframe messages
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.BFTN_WIDGET_MSG) return;

    delete e.data.BFTN_WIDGET_MSG;

    switch (e.data.requestType) {
      case 'putAnimation':
        animations[e.data.modalAnimation].init(e.data);
        break;
    }
  });

  // Start animation
  sendMessage('getAnimation');
})();
