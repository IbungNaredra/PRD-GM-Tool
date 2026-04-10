(function () {
  var modal = document.getElementById("report-review-modal");
  var select = document.getElementById("report-review-status");
  var summaryEl = document.getElementById("report-review-summary");
  var btnCancel = document.getElementById("report-review-cancel");
  var btnSave = document.getElementById("report-review-save");
  var currentRow = null;

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function getStatusFromRow(row) {
    var pill = row.querySelector("td:nth-child(6) .status-pill");
    if (!pill) return "pending";
    return (pill.textContent || "").trim().toLowerCase();
  }

  function setStatusCell(row, status) {
    var cell = row.querySelector("td:nth-child(6)");
    if (!cell) return;
    var s = status.toLowerCase();
    cell.innerHTML = '<span class="status-pill status-pill--' + s + '">' + s + "</span>";
  }

  function actionsMarkup() {
    return '<button type="button" class="btn btn-primary btn-sm report-review-open">Review</button>';
  }

  function setActionsCell(row, status) {
    var cell = row.querySelector("td:nth-child(7)");
    if (!cell) return;
    if (status === "pending") {
      cell.className = "report-actions";
      cell.innerHTML = actionsMarkup();
    } else {
      cell.className = "report-actions";
      cell.innerHTML = '<span class="text-muted">—</span>';
    }
  }

  function openModal(row) {
    currentRow = row;
    var cells = row.querySelectorAll("td");
    if (cells.length < 6) return;
    var type = cells[0].textContent.trim();
    var idHtml = cells[1].innerHTML.trim();
    var reason = cells[2].textContent.trim();
    var status = getStatusFromRow(row);
    if (summaryEl) {
      summaryEl.innerHTML =
        "<p><strong>Target</strong> " +
        escapeHtml(type) +
        " · " +
        idHtml +
        "</p><p><strong>Top reason</strong> " +
        escapeHtml(reason) +
        "</p>";
    }
    if (select) select.value = status;
    if (modal) modal.hidden = false;
    if (select) select.focus();
  }

  function closeModal() {
    if (modal) modal.hidden = true;
    currentRow = null;
  }

  function saveFromModal() {
    if (!currentRow || !select) return;
    var newStatus = select.value;
    setStatusCell(currentRow, newStatus);
    setActionsCell(currentRow, newStatus);
    closeModal();
  }

  document.addEventListener("click", function (e) {
    var reviewBtn = e.target.closest(".report-review-open");
    if (reviewBtn) {
      var row = reviewBtn.closest("tr");
      if (row) openModal(row);
    }
  });

  if (btnCancel) btnCancel.addEventListener("click", closeModal);
  if (btnSave) btnSave.addEventListener("click", saveFromModal);

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) {
      e.preventDefault();
      closeModal();
    }
  });
})();
