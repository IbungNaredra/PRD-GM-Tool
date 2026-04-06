(function () {
  "use strict";

  var UID_RE = /^\d{4,10}$/;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function parseUidInput(raw) {
    var parts = raw.split(/[\s,;\n\r]+/).filter(Boolean);
    var seen = Object.create(null);
    var valid = [];
    var invalid = [];
    parts.forEach(function (p) {
      var t = p.trim();
      if (!t) return;
      if (!UID_RE.test(t)) {
        invalid.push(t);
        return;
      }
      if (seen[t]) return;
      seen[t] = true;
      valid.push(t);
    });
    return { valid: valid, invalid: invalid };
  }

  function dash(v) {
    return v === undefined || v === null || String(v).trim() === "" ? "—" : v;
  }

  var els = {
    batchName: $("#grant-batch-name"),
    creditAmount: $("#grant-credit-amount"),
    expiry: $("#grant-expiry"),
    reason: $("#grant-reason"),
    uidPaste: $("#grant-uid-paste"),
    csvInput: $("#grant-csv-input"),
    tabPaste: $("#tab-uid-paste"),
    tabCsv: $("#tab-uid-csv"),
    panelPaste: $("#panel-uid-paste"),
    panelCsv: $("#panel-uid-csv"),
    summaryName: $("#summary-batch-name"),
    summaryRecipients: $("#summary-recipients"),
    summaryPerUser: $("#summary-per-user"),
    summaryTotal: $("#summary-total"),
    summaryExpiry: $("#summary-expiry"),
    summaryReason: $("#summary-reason"),
    uidValidCount: $("#uid-valid-count"),
    uidInvalidCount: $("#uid-invalid-count"),
    uidPreview: $("#uid-preview"),
    uidInvalidList: $("#uid-invalid-preview"),
    btnExecute: $("#btn-execute-grant"),
    btnClear: $("#btn-clear-form"),
    modal: $("#grant-confirm-modal"),
    modalSummary: $("#modal-summary-body"),
    modalInput: $("#grant-confirm-input"),
    btnModalCancel: $("#grant-modal-cancel"),
    btnModalConfirm: $("#grant-modal-confirm"),
    toast: $("#grant-toast"),
  };

  function currentUidResult() {
    if (els.panelPaste && !els.panelPaste.hidden) {
      return parseUidInput(els.uidPaste.value);
    }
    return window.__grantCsvParsed || { valid: [], invalid: [] };
  }

  function updateSummary() {
    var u = currentUidResult();
    var n = u.valid.length;
    var amt = parseFloat(els.creditAmount.value);
    var per = Number.isFinite(amt) ? amt : NaN;
    var total = Number.isFinite(per) ? n * per : NaN;

    els.summaryName.textContent = dash(els.batchName.value.trim());
    els.summaryRecipients.textContent = n > 0 ? String(n) : "—";
    els.summaryPerUser.textContent = Number.isFinite(per) ? String(per) : "—";
    els.summaryTotal.textContent = Number.isFinite(total) ? String(total) : "—";
    els.summaryExpiry.textContent = els.expiry.value
      ? els.expiry.value + " (WIB, end of day)"
      : "—";
    els.summaryReason.textContent = dash(els.reason.value.trim());

    els.uidValidCount.textContent = String(n);
    els.uidInvalidCount.textContent = String(u.invalid.length);

    renderPreview(u.valid, els.uidPreview, 8);
    renderInvalid(u.invalid.slice(0, 12), els.uidInvalidList);

    var filled =
      els.batchName.value.trim() &&
      els.reason.value.trim() &&
      els.expiry.value &&
      Number.isFinite(per) &&
      per > 0 &&
      n >= 1;

    els.btnExecute.disabled = !filled;
  }

  function renderPreview(arr, container, max) {
    if (!container) return;
    container.innerHTML = "";
    var show = arr.slice(0, max);
    show.forEach(function (id) {
      var span = document.createElement("span");
      span.className = "uid-chip uid-chip--ok";
      span.textContent = id;
      container.appendChild(span);
    });
    if (arr.length > max) {
      var more = document.createElement("span");
      more.className = "uid-chip uid-chip--more";
      more.textContent = "+" + (arr.length - max) + " more";
      container.appendChild(more);
    }
  }

  function renderInvalid(arr, container) {
    if (!container) return;
    container.innerHTML = "";
    arr.forEach(function (bad) {
      var span = document.createElement("span");
      span.className = "uid-chip uid-chip--bad";
      span.textContent = bad.length > 16 ? bad.slice(0, 14) + "…" : bad;
      span.title = bad;
      container.appendChild(span);
    });
  }

  function switchTab(mode) {
    if (mode === "paste") {
      els.tabPaste.setAttribute("aria-selected", "true");
      els.tabCsv.setAttribute("aria-selected", "false");
      els.panelPaste.hidden = false;
      els.panelCsv.hidden = true;
    } else {
      els.tabPaste.setAttribute("aria-selected", "false");
      els.tabCsv.setAttribute("aria-selected", "true");
      els.panelPaste.hidden = true;
      els.panelCsv.hidden = false;
    }
    updateSummary();
  }

  function parseCsvText(text) {
    var lines = text.split(/\r?\n/).filter(function (l) {
      return l.trim().length;
    });
    if (!lines.length) return { valid: [], invalid: [] };
    var start = 0;
    var h = lines[0].toLowerCase();
    if (h.indexOf("uid") !== -1) start = 1;
    var body = lines.slice(start).join("\n");
    return parseUidInput(body.replace(/,/g, "\n"));
  }

  function onCsvFile(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      window.__grantCsvParsed = parseCsvText(String(reader.result || ""));
      updateSummary();
    };
    reader.readAsText(f);
  }

  function openModal() {
    var u = currentUidResult();
    var amt = parseFloat(els.creditAmount.value);
    var n = u.valid.length;
    var total = n * amt;
    els.modalSummary.innerHTML =
      "<p><strong>Batch name:</strong> " +
      escapeHtml(els.batchName.value.trim()) +
      "</p>" +
      "<p><strong>Recipients:</strong> " +
      n +
      "</p>" +
      "<p><strong>Credits per user:</strong> " +
      amt +
      "</p>" +
      "<p><strong>Total credits:</strong> " +
      total +
      "</p>" +
      "<p><strong>Expiry:</strong> " +
      escapeHtml(els.expiry.value) +
      " (WIB)</p>" +
      "<p><strong>Reason:</strong> " +
      escapeHtml(els.reason.value.trim()) +
      "</p>";
    els.modalInput.value = "";
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      els.modalInput.focus();
    }, 50);
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = "";
  }

  function confirmGrant() {
    if (els.modalInput.value.trim() !== "GRANT") {
      els.modalInput.setAttribute("aria-invalid", "true");
      return;
    }
    els.modalInput.removeAttribute("aria-invalid");
    closeModal();
    showToast(
      "Grant executed (prototype). " +
        currentUidResult().valid.length +
        " users would be credited."
    );
    clearForm();
  }

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(window.__grantToastT);
    window.__grantToastT = setTimeout(function () {
      els.toast.hidden = true;
    }, 5000);
  }

  function clearForm() {
    els.batchName.value = "";
    els.creditAmount.value = "";
    els.expiry.value = "";
    els.reason.value = "";
    els.uidPaste.value = "";
    if (els.csvInput) els.csvInput.value = "";
    window.__grantCsvParsed = { valid: [], invalid: [] };
    updateSummary();
  }

  window.__grantCsvParsed = { valid: [], invalid: [] };

  ["input", "change"].forEach(function (ev) {
    [els.batchName, els.creditAmount, els.expiry, els.reason, els.uidPaste].forEach(
      function (el) {
        if (el) el.addEventListener(ev, updateSummary);
      }
    );
  });

  if (els.tabPaste)
    els.tabPaste.addEventListener("click", function () {
      switchTab("paste");
    });
  if (els.tabCsv)
    els.tabCsv.addEventListener("click", function () {
      switchTab("csv");
    });

  if (els.csvInput) els.csvInput.addEventListener("change", onCsvFile);

  if (els.btnExecute)
    els.btnExecute.addEventListener("click", function () {
      if (!els.btnExecute.disabled) openModal();
    });
  if (els.btnClear) els.btnClear.addEventListener("click", clearForm);
  if (els.btnModalCancel) els.btnModalCancel.addEventListener("click", closeModal);
  if (els.btnModalConfirm) els.btnModalConfirm.addEventListener("click", confirmGrant);

  if (els.modal) {
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && els.modal && !els.modal.hidden) closeModal();
  });

  updateSummary();
})();
