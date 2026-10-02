(function () {
  var modalOpener = null;
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function furiganaEnabled() {
    return !window.RikaState || !window.RikaState.get || window.RikaState.get().settings.furigana !== false;
  }

  function renderFurigana(text) {
    var source = String(text == null ? "" : text);
    if (window.RikaReadings) source = window.RikaReadings.annotate(source);
    if (!furiganaEnabled()) {
      return escapeHtml(source.replace(/\{([^|{}]+)\|([^{}]+)\}/g, "$1"));
    }
    var html = "";
    var last = 0;
    source.replace(/\{([^|{}]+)\|([^{}]+)\}/g, function (match, kanji, yomi, offset) {
      html += escapeHtml(source.slice(last, offset));
      html += "<ruby>" + escapeHtml(kanji) + "<rt>" + escapeHtml(yomi) + "</rt></ruby>";
      last = offset + match.length;
      return match;
    });
    html += escapeHtml(source.slice(last));
    return html;
  }

  function renderPlain(text) {
    return String(text == null ? "" : text).replace(/\{([^|{}]+)\|([^{}]+)\}/g, "$1");
  }

  function toast(message) {
    var root = document.getElementById("toast-root");
    if (!root) return;
    var node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = renderFurigana(message);
    root.appendChild(node);
    window.setTimeout(function () {
      node.remove();
    }, 3600);
  }

  function closeModal() {
    var root = document.getElementById("modal-root");
    if (!root) return;
    root.classList.remove("is-open");
    root.innerHTML = "";
    if (modalOpener && modalOpener.isConnected) modalOpener.focus();
  }

  function modal(title, body, actions) {
    var root = document.getElementById("modal-root");
    if (!root) return;
    modalOpener = document.activeElement;
    actions = actions || [{ label: "とじる", kind: "primary", action: closeModal }];
    var buttons = actions.map(function (item, index) {
      return '<button type="button" class="' + (item.kind || "primary") + '-button" data-modal-action="' + index + '">' + renderFurigana(item.label) + "</button>";
    }).join("");
    root.innerHTML = '<section class="modal-card rpg-frame" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<h2 id="modal-title">' + renderFurigana(title) + '</h2>' +
      '<div class="modal-body">' + body + '</div>' +
      '<div class="modal-actions">' + buttons + '</div>' +
      '</section>';
    root.classList.add("is-open");
    root.onkeydown = function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
      if (event.key === 'Tab') {
        var nodes = Array.from(root.querySelectorAll('button:not([disabled]),input,select,textarea,a[href]'));
        var first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    root.querySelectorAll("[data-modal-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var action = actions[Number(button.dataset.modalAction)];
        if (action && typeof action.action === "function") action.action();
      });
    });
    var first = root.querySelector("button");
    if (first) first.focus();
  }

  function confirm(title, message, onOk) {
    modal(title, '<p>' + renderFurigana(message) + '</p>', [
      { label: "キャンセル", kind: "ghost", action: closeModal },
      { label: "実行する", kind: "danger", action: function () { closeModal(); onOk(); } }
    ]);
  }

  function hearts(current, max) {
    var html = '<div class="hp-hearts" aria-label="ライフ ' + current + ' / ' + max + '">';
    for (var i = 0; i < max; i += 1) {
      html += '<span class="heart ' + (i < current ? "" : "is-empty") + '" aria-hidden="true">♥</span>';
    }
    return html + "</div>";
  }

  function progressBar(value, label) {
    var pct = Math.max(0, Math.min(100, Number(value) || 0));
    return '<div class="bar" role="progressbar" aria-label="' + escapeHtml(label || "進み具合") + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '" style="--value:' + pct + '%"><span></span></div>';
  }

  window.RikaUI = {
    escapeHtml: escapeHtml,
    renderFurigana: renderFurigana,
    renderPlain: renderPlain,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    confirm: confirm,
    hearts: hearts,
    progressBar: progressBar
  };
  window.renderFurigana = renderFurigana;
})();
