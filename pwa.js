/* Installable app: service worker + a quiet "add to home screen" invitation. */
(function () {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var KEY = 'gaw_install_dismissed';
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (standalone || dismissed) return;

  function bar(html, onInstall) {
    var el = document.createElement('div');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Install Golden Age Wisdom');
    el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9999;' +
      'display:flex;align-items:center;gap:12px;padding:10px 12px 10px 14px;border-radius:999px;' +
      'background:rgba(23,17,48,0.94);border:1px solid rgba(213,183,124,0.35);' +
      'box-shadow:0 12px 40px rgba(0,0,0,0.5);backdrop-filter:blur(12px);' +
      "font-family:'Outfit',sans-serif;color:#e6d3a8;font-size:13px;max-width:calc(100% - 24px);" +
      'opacity:0;transition:opacity .5s ease';
    el.innerHTML = html;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    var act = el.querySelector('[data-act]');
    if (act && onInstall) act.addEventListener('click', function () { onInstall(el); });
    el.querySelector('[data-no]').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 500);
    });
    return el;
  }

  var closeBtn = '<button data-no aria-label="Not now" style="width:26px;height:26px;flex-shrink:0;border-radius:50%;border:none;background:rgba(255,255,255,0.06);color:#9a927f;font-size:14px;cursor:pointer">×</button>';

  // Android / desktop Chrome
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    var deferred = e;
    setTimeout(function () {
      bar('<span style="min-width:0">Keep Golden Age Wisdom on your home screen</span>' +
          '<button data-act style="padding:7px 16px;border-radius:999px;border:none;background:linear-gradient(135deg,#d5b77c,#b89758);color:#241b06;font-family:inherit;font-weight:600;font-size:12.5px;cursor:pointer;white-space:nowrap">Install</button>' +
          closeBtn,
        function (el) {
          deferred.prompt();
          deferred.userChoice.finally(function () {
            try { localStorage.setItem(KEY, '1'); } catch (e) {}
            el.remove();
          });
        });
    }, 8000);
  });

  // iOS Safari has no prompt API — show the two-step gesture instead
  var iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
  if (iOS && safari) {
    setTimeout(function () {
      bar('<span style="min-width:0;font-weight:300">Add to Home Screen: tap <span style="color:#f2e9d8">Share</span> then <span style="color:#f2e9d8">Add to Home Screen</span></span>' + closeBtn);
    }, 9000);
  }
})();
