(function () {
  var errEl = document.getElementById("debugging-detail-error");
  var bodyEl = document.getElementById("debugging-detail-body");
  var pidEl = document.getElementById("debugging-detail-post-id");
  var urlDisplay = document.getElementById("debugging-detail-url-display");

  function getParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function init() {
    var postId = getParam("post");
    if (!postId) {
      window.location.replace("debugging.html");
      return;
    }

    if (urlDisplay) {
      urlDisplay.textContent = window.location.href.replace(/#.*$/, "");
    }

    if (postId === "__notfound__") {
      if (errEl) {
        errEl.textContent = "No post found with this ID. Check the Post ID and try again.";
        errEl.hidden = false;
      }
      if (bodyEl) bodyEl.hidden = true;
      return;
    }

    if (pidEl) pidEl.textContent = postId;
  }

  init();
})();
