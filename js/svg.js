(function () {
  var themeColors = {
    sky: { main: "#5dbfe3", dark: "#276d94", light: "#d9f5ff", land: "#cfeffc" },
    plant: { main: "#55aa5b", dark: "#276a34", light: "#e5f7df", land: "#cde9bf" },
    life: { main: "#e58aa9", dark: "#9b3f61", light: "#fff0f5", land: "#f4cfdc" },
    water: { main: "#4f9fc8", dark: "#29647c", light: "#e1f4fb", land: "#d5c094" },
    solution: { main: "#7bd6e9", dark: "#2d7f96", light: "#ecfbff", land: "#d9f3f8" },
    electric: { main: "#f1c62d", dark: "#8c6a00", light: "#fff8ce", land: "#f2e68a" },
    physics: { main: "#8d98a5", dark: "#4c5965", light: "#eef2f4", land: "#c9d0d8" },
    fire: { main: "#e7653c", dark: "#94301d", light: "#fff0e8", land: "#f3c080" },
    body: { main: "#d85865", dark: "#91323c", light: "#ffe9ec", land: "#e9b5bc" },
    space: { main: "#5367c8", dark: "#26306b", light: "#eef0ff", land: "#b8bee8" },
    earth: { main: "#9c7952", dark: "#5e432b", light: "#f2eadf", land: "#d0b08d" },
    chem: { main: "#9b65cf", dark: "#563176", light: "#f3eaff", land: "#d9c0ef" },
    eco: { main: "#35a786", dark: "#1e654f", light: "#e4f7f1", land: "#bfe2cf" }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function colors(theme) {
    return themeColors[theme] || themeColors.eco;
  }

  function slotIcon(slot, size) {
    var s = size || 40;
    var content = {
      sword: '<path d="M22 5 L27 10 L17 25 L22 30 L18 34 L13 29 L9 33 L7 31 L11 27 L6 22 L10 18 L15 23 Z" fill="#d9edf5" stroke="#243846" stroke-width="2"/><path d="M18 28 L25 35" stroke="#7a4f22" stroke-width="5" stroke-linecap="round"/>',
      shield: '<path d="M20 4 L33 9 V20 C33 29 27 35 20 38 C13 35 7 29 7 20 V9 Z" fill="#8fd2e5" stroke="#243846" stroke-width="2"/><path d="M20 7 V34" stroke="#fff" stroke-width="2" opacity=".65"/>',
      armor: '<path d="M12 8 L18 5 H22 L28 8 L34 17 L29 21 L27 36 H13 L11 21 L6 17 Z" fill="#9fb0bd" stroke="#243846" stroke-width="2"/><path d="M15 14 H25" stroke="#fff" stroke-width="2"/>',
      gauntlet: '<path d="M13 12 C13 8 19 8 19 13 V20 H22 V10 C22 7 28 8 28 12 V24 C28 31 24 36 18 36 C13 36 9 32 9 27 V16 C9 13 13 13 13 16 Z" fill="#f0c56d" stroke="#243846" stroke-width="2"/>'
    }[slot] || '<circle cx="20" cy="20" r="14" fill="#ddd" stroke="#243846" stroke-width="2"/>';
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true">' + content + "</svg>";
  }

  function itemIcon(id, size) {
    var s = size || 40;
    var fill = id === "hint_scroll" ? "#f4ddb0" : id === "crystal_badge" ? "#9de6f0" : "#e96b68";
    var content = id === "hint_scroll"
      ? '<path d="M10 10 H28 C32 10 32 16 28 16 H12 C8 16 8 10 12 10 Z" fill="' + fill + '" stroke="#243846" stroke-width="2"/><path d="M12 16 H30 V31 H12 Z" fill="#fff7df" stroke="#243846" stroke-width="2"/><path d="M16 22 H26 M16 27 H24" stroke="#7a5b2d" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M14 8 H26 L30 18 L20 34 L10 18 Z" fill="' + fill + '" stroke="#243846" stroke-width="2"/><path d="M14 18 H30" stroke="#fff" stroke-width="2" opacity=".7"/>';
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true">' + content + "</svg>";
  }

  function caveIcon(x, y, scale, theme) {
    var c = colors(theme);
    var s = scale || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-28 25 C-28 0 -15 -22 0 -22 C17 -22 29 0 29 25 Z" fill="' + c.dark + '" stroke="#17313b" stroke-width="4"/>' +
      '<path d="M-12 25 C-12 8 -7 0 0 0 C8 0 13 8 13 25 Z" fill="#10232c"/>' +
      '<path d="M-19 -1 L-9 -7 L-4 3 L5 -9 L15 1" fill="none" stroke="' + c.light + '" stroke-width="3" stroke-linecap="round"/>' +
      '</g>';
  }

  function castleIcon(x, y, scale, theme) {
    var c = colors(theme);
    var s = scale || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M-26 22 V-12 H-18 V-24 H-9 V-12 H-3 V-24 H6 V-12 H13 V-24 H22 V-12 H27 V22 Z" fill="' + c.main + '" stroke="#17313b" stroke-width="4"/>' +
      '<path d="M-8 22 V6 C-8 -1 8 -1 8 6 V22 Z" fill="#172c35"/>' +
      '<path d="M-22 -26 L-6 -34 L-6 -25" fill="#f0c84c" stroke="#17313b" stroke-width="2"/>' +
      '</g>';
  }

  function lockIcon(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="-13" y="-3" width="26" height="22" rx="4" fill="#7d8790" stroke="#273440" stroke-width="3"/>' +
      '<path d="M-8 -3 V-10 C-8 -20 8 -20 8 -10 V-3" fill="none" stroke="#273440" stroke-width="4"/>' +
      '</g>';
  }

  function statusGlyph(status, x, y) {
    var map = {
      locked: "🔒",
      unlocked: "◇",
      basicCleared: "⚑",
      bossCleared: "♛",
      perfected: "★"
    };
    return '<text x="' + x + '" y="' + y + '" class="node-label" font-size="24">' + esc(map[status] || "◇") + "</text>";
  }

  function continentPath(grade) {
    if (grade === 5) {
      return '<path d="M82 136 C160 62 276 90 335 138 C414 87 558 92 636 176 C713 259 664 404 542 450 C428 496 339 444 280 482 C190 540 69 467 52 351 C41 275 22 196 82 136 Z" fill="#cfe6bf" stroke="#7ea56e" stroke-width="5"/>';
    }
    return '<path d="M94 408 C34 319 74 177 174 132 C247 99 312 130 370 92 C454 37 586 91 633 186 C697 316 636 451 500 484 C414 505 351 456 289 491 C215 532 131 462 94 408 Z" fill="#cbd5ee" stroke="#7c87b5" stroke-width="5"/>';
  }

  window.RikaSVG = {
    colors: colors,
    esc: esc,
    slotIcon: slotIcon,
    itemIcon: itemIcon,
    caveIcon: caveIcon,
    castleIcon: castleIcon,
    lockIcon: lockIcon,
    statusGlyph: statusGlyph,
    continentPath: continentPath
  };
})();
