(function () {
  var form = document.getElementById("debugging-search-form");
  var input = document.getElementById("debugging-post-id");
  var err = document.getElementById("debugging-search-error");

  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) {
        err.textContent = "";
        err.hidden = true;
      }
      var v = (input.value || "").trim();
      if (!v) {
        if (err) {
          err.textContent = "Please enter a Post ID.";
          err.hidden = false;
        }
        return;
      }
      if (v === "__notfound__") {
        if (err) {
          err.textContent = "No post found with this ID. Check the Post ID and try again.";
          err.hidden = false;
        }
        return;
      }
      window.location.href = "debugging-detail.html?post=" + encodeURIComponent(v);
    });
  }
})();
