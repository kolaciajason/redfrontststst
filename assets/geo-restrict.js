/**
 * Redirect visitors from blocked countries to Google.
 * Skipped on localhost / *.test / *.local
 */
(function () {
  var REDIRECT = 'https://www.google.com/';
  var BLOCKED_CODES = { AL: 1, RS: 1, XK: 1 };
  var BLOCKED_NAMES = { albania: 1, serbia: 1, kosovo: 1 };

  function isLocalHost() {
    var h = location.hostname;
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '::1' ||
      h.endsWith('.test') ||
      h.endsWith('.local')
    );
  }

  function revealPage() {
    document.documentElement.style.visibility = '';
    document.documentElement.removeAttribute('data-geo-pending');
  }

  function redirectAway() {
    location.replace(REDIRECT);
  }

  function isBlocked(data) {
    if (!data) return false;
    var code = String(data.country_code || data.countryCode || '').toUpperCase();
    var name = String(data.country || '').toLowerCase().trim();
    if (code && BLOCKED_CODES[code]) return true;
    if (name && BLOCKED_NAMES[name]) return true;
    return false;
  }

  if (isLocalHost()) {
    return;
  }

  document.documentElement.style.visibility = 'hidden';
  document.documentElement.setAttribute('data-geo-pending', '1');

  fetch('https://ipwho.is/?fields=country,country_code,success', { cache: 'no-store' })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data && data.success !== false && isBlocked(data)) {
        redirectAway();
        return;
      }
      revealPage();
    })
    .catch(function () {
      revealPage();
    });
})();
