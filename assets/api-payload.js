/** Build POST body with socketId + clientId for backend routing after reconnect. */
(function (global) {
  function withClient(extra) {
    var base = {
      clientId: localStorage.getItem('clientId') || '',
    };
    var sock = global.socket || global.__victimSocket;
    if (sock && sock.id) base.socketId = sock.id;
    return Object.assign(base, extra || {});
  }
  global.ApiPayload = { withClient: withClient };
})(window);
