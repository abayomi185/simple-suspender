(function () {
  if (window.top !== window || !/https?/.test(location.protocol)) {
    return;
  }

  let isReceivingFormInput = false;
  let lastActiveTime = 0;
  let favicon = "";
  let preferences = {};
  let interval;

let waitForPrefs = (callback) => {
  if (Object.keys(preferences).length > 0) {
    callback();
  } else {
    setTimeout(() => {
        waitForPrefs(callback);
    }, 50);
  }
};
    
  window.addEventListener('load', async (event) => {
    getFavicon();
    waitForPrefs(() => {
      if (preferences.rememberScroll) {
        safari.extension.dispatchMessage('GET_PAGE_SCROLL_POS');
      }
    })
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      lastActiveTime = nw Date(); // User just went to another tab or window, save the current time
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!isReceivingFormInput) {
      if (event.keyCode >= 48 && event.keyCode <= 90 && event.target.tagName) {
        if (
          event.target.tagName.toUpperCase() === 'INPUT' ||
          event.target.tagName.toUpperCase() === 'TEXTAREA' ||
          event.target.tagName.toUpperCase() === 'FORM' ||
          event.target.isContentEditable === true ||
          event.target.type === "application/pdf"
        ) {
          isReceivingFormInput = true;
        }
      }
    }
  });

  safari.self.addEventListener('message', event => {
    // console.log("event", event)
    switch (event.name) {
      case 'CURRENT_PREFERENCES':
        preferences = event.message;
        if (interval) {
          clearInterval(interval);
        }
        interval = window.setInterval(() => {
          sendTabState();
        }, preferences.minsToSuspend ? ((preferences.minsToSuspend * 60 * 1000) + 1000) : 25000); // add some tolerance 
        break;
      case 'GET_TAB_STATE':
        sendTabState();
        break;
      case 'FORCE_SUSPEND':
        sendTabState({ forcedSuspend: true });
        break;
      case 'SCROLL_POS':
        if (document.documentElement.scrollHeight > event.message.scrollpos) { // check if suspended page was not in an infinite scroll page
          window.scrollTo(0, event.message.scrollpos);
        }
        break;
    }
  });
  safari.extension.dispatchMessage('GET_PREFERENCES');

//TODO:
  // check if we are running the interval tabstate already
  window.setTimeout(() => {
    if (!interval) {
      // default value
      interval = window.setInterval(() => {
        sendTabState();
      }, preferences.minsToSuspend ? ((preferences.minsToSuspend * 60 * 1000) + 1000) : 25000);
    }
  }, 10000);
  

  function sendTabState(options) {
    const stateData = {
      isReceivingFormInput,
      scrollPos: getScrollPos(),
      isMediaPlaying: isMediaPlaying(),
      isOnline: window.navigator.onLine,
      visibilityState: document.visibilityState,
      lastActiveTime: lastActiveTime === 0 ? (new Date).getTime() : lastActiveTime.getTime(),
      url: getUrl(),
      title: document.title,
      favicon,
    };

    options = options || {};
    safari.extension.dispatchMessage('TAB_STATE', Object.assign({}, stateData, options));
  }

  function getUrl() {
    let url = new URL(location.href);
    if (location.host === 'www.youtube.com') {
      const videoEl = document.querySelector('video');
      if (videoEl && videoEl.currentTime) {
        url.searchParams.set('t', parseInt(videoEl.currentTime, 10));
      }
    }
    return url.href;
  }

  function isMediaPlaying() {
    let isPlaying = false;
    if (location.host === 'soundcloud.com') {
        isPlaying = !!document.querySelector('a[role="button"][title="Pause"]') || !!document.querySelector('button[type="button"][class~="playing"]');
    } else {
        isPlaying = !!Array.prototype.find.call(document.querySelectorAll('audio,video'), (elem) => elem.duration > 0 && !elem.paused);
    }
    return isPlaying;
  }

  function getScrollPos() {
    return document.body.scrollTop || document.documentElement.scrollTop || 0;
  }
  
  async function getFavicon() {
    function getIconsFromDom() {
      var links = document.querySelectorAll('link, meta[itemprop="image"], meta[itemprop="og:image"]');
      var icons = [];

      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var rel = link.getAttribute('rel');
        let itemprop = link.getAttribute("itemprop");
        if (rel && rel.toLowerCase().indexOf('icon') > -1 || itemprop && ['image', 'og:image'].includes(itemprop)) {
          let href = link.getAttribute('href') || link.getAttribute('content');
          if (href) {
            if (href.toLowerCase().indexOf('https:') == -1 && href.toLowerCase().indexOf('http:') == -1 &&
              href.indexOf('//') != 0) {

              var absoluteHref = window.location.protocol + '//' + window.location.host;

              if (window.location.port) {
                absoluteHref += ':' + window.location.port;
              }

              if (href.indexOf('/') == 0) {
                absoluteHref += href;
              } else {
                var path = window.location.pathname.split('/');
                path.pop();
                var finalPath = path.join('/');
                absoluteHref += finalPath + '/' + href;
              }

              icons.push(absoluteHref);
            } else if (href.indexOf('//') == 0) {
              var absoluteUrl = window.location.protocol + href;
              icons.push(absoluteUrl);
            }
            //Absolute
            else {
              icons.push(href);
            }
          }
        }
      }

      return icons;
    }

    async function getIconFromURL(requestUrl) {
      const response = await (fetch(requestUrl, {
        method: 'GET',
        redirect: 'manual'
      }).catch((err) => console.log("[Error] getIconFromDir:", err)));
      return response && response.ok === true && response.headers.get('Content-Type').indexOf('image/') >= 0 ? requestUrl : null;
    }
      
    const rootIcon = await getIconFromURL(location.origin + '/favicon.ico');
    if (rootIcon) {
      favicon = rootIcon;
    } else {
      const dirIcon = await getIconFromURL(location.origin + location.pathname + '/favicon.ico');
      if (dirIcon) {
        favicon = dirIcon;
      } else {
        const domIcons = getIconsFromDom();
        if (domIcons.length > 0) {
            if (domIcons.length === 1) {
                favicon = domIcons[0];
            }
            else {
                favicon = domIcons.find(el => /favicon/gi.test(el)) || domIcons[0];
            }
        } else {
            favicon = null;//'assets/default_favicon.ico';
        }
      }
    }
  }
}());
