(function () {
  var themeColors = {
    light: { main: "#ffd43b", dark: "#a4670a", light: "#fff8ca", land: "#e6edb5" },
    sound: { main: "#55d5b5", dark: "#187663", light: "#e8fff8", land: "#f2baba" },
    heat: { main: "#ef8582", dark: "#a53653", light: "#fff0ed", land: "#a7e3e5" },
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

  function hero() {
    return '<svg viewBox="0 0 200 240" role="img" aria-label="主人公" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<radialGradient id="heroSkin" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffe6cf"/><stop offset="1" stop-color="#f6b98f"/></radialGradient>' +
      '<linearGradient id="heroCape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37e0d6"/><stop offset="1" stop-color="#0d9aa0"/></linearGradient>' +
      '<linearGradient id="heroHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a2b"/><stop offset="1" stop-color="#5a3418"/></linearGradient>' +
      '<radialGradient id="heroPotion" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#e9ffff"/><stop offset=".5" stop-color="#41e6ff"/><stop offset="1" stop-color="#0e93b3"/></radialGradient>' +
      '<linearGradient id="heroGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset="1" stop-color="#e69100"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="100" cy="230" rx="46" ry="9" fill="#000" opacity=".3"/>' +
      '<path d="M66 120 Q34 180 52 222 L100 230 L148 222 Q166 180 134 120 Z" fill="url(#heroCape)" stroke="#0a7d82" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="80" y="188" width="16" height="34" rx="8" fill="#3a2f6b"/><rect x="104" y="188" width="16" height="34" rx="8" fill="#3a2f6b"/>' +
      '<ellipse cx="88" cy="224" rx="12" ry="7" fill="#241a4d"/><ellipse cx="112" cy="224" rx="12" ry="7" fill="#241a4d"/>' +
      '<line x1="150" y1="52" x2="150" y2="196" stroke="url(#heroGold)" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="150" cy="46" r="20" fill="url(#heroPotion)" stroke="#0a7d82" stroke-width="2.5"/><circle cx="150" cy="46" r="27" fill="#41e6ff" opacity=".2"/>' +
      '<circle cx="144" cy="42" r="3" fill="#fff" opacity=".85"/><circle cx="156" cy="52" r="2" fill="#fff" opacity=".75"/>' +
      '<path d="M72 132 C72 112 128 112 128 132 L124 186 C124 196 76 196 76 186 Z" fill="url(#heroCape)" stroke="#0a7d82" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="74" y="158" width="52" height="10" rx="5" fill="url(#heroGold)"/><circle cx="100" cy="147" r="9" fill="#eafcff" stroke="#0a7d82" stroke-width="2"/>' +
      '<path d="M96 147 H104 M100 143 V151" stroke="#0e93b3" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M74 140 Q58 150 68 174" fill="none" stroke="url(#heroCape)" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M126 140 Q148 138 150 52" fill="none" stroke="url(#heroCape)" stroke-width="14" stroke-linecap="round"/><circle cx="150" cy="52" r="8" fill="#f6b98f" stroke="#c98a63" stroke-width="1.5"/>' +
      '<circle cx="100" cy="96" r="42" fill="url(#heroSkin)" stroke="#d79a72" stroke-width="2"/>' +
      '<path d="M60 86 C58 52 92 44 100 44 C110 44 142 52 140 86 C132 70 120 64 100 64 C80 64 68 70 60 86 Z" fill="url(#heroHair)"/>' +
      '<rect x="60" y="72" width="80" height="10" rx="5" fill="#4a3a2a"/>' +
      '<circle cx="82" cy="74" r="12" fill="#1d2a3a" stroke="#caa14d" stroke-width="3"/><circle cx="118" cy="74" r="12" fill="#1d2a3a" stroke="#caa14d" stroke-width="3"/>' +
      '<circle cx="82" cy="74" r="7" fill="#22d3ee" opacity=".5"/><circle cx="118" cy="74" r="7" fill="#22d3ee" opacity=".5"/>' +
      '<ellipse cx="86" cy="102" rx="9" ry="11" fill="#fff"/><ellipse cx="114" cy="102" rx="9" ry="11" fill="#fff"/>' +
      '<circle cx="88" cy="105" r="5.5" fill="#3a2a1a"/><circle cx="112" cy="105" r="5.5" fill="#3a2a1a"/>' +
      '<circle cx="86" cy="102" r="1.8" fill="#fff"/><circle cx="110" cy="102" r="1.8" fill="#fff"/>' +
      '<path d="M92 120 Q100 127 108 120" fill="none" stroke="#a35b3a" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="74" cy="114" r="6" fill="#ff9a7a" opacity=".5"/><circle cx="126" cy="114" r="6" fill="#ff9a7a" opacity=".5"/>' +
      '</svg>';
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

  function muContinent(unlocked) {
    return '<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="海に浮かぶムー大陸。結晶の扉、光の庭、水門の谷の三つの研究地。' + (unlocked ? '島への道が開いている。' : '島への道はまだ閉じている。') + '">' +
      '<defs><linearGradient id="muSea" x2="0" y2="1"><stop stop-color="#33227d"/><stop offset="1" stop-color="#116a89"/></linearGradient><linearGradient id="muStone" x2="0" y2="1"><stop stop-color="#8473ba"/><stop offset="1" stop-color="#37245e"/></linearGradient><linearGradient id="muCrystal" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>' +
      '<path d="M0 20Q400-20 800 20V360H0Z" fill="url(#muSea)"/><g fill="none" stroke="#64dce5" stroke-width="2" opacity=".32"><path d="M0 260Q150 225 320 265T800 260M0 300Q160 265 350 305T800 295M20 335Q240 300 470 335T800 330"/></g>' +
      '<g opacity="' + (unlocked ? '1' : '.45') + '"><path d="M190 180Q345 310 425 128T630 210" fill="none" stroke="#ffd43b" stroke-width="3" stroke-dasharray="9 9"/>' +
      '<g transform="translate(180 180)"><ellipse cy="74" rx="108" ry="19" fill="#071a49" opacity=".45"/><path d="M-100 10L-72 65L0 90L72 60L100 10Z" fill="url(#muStone)" stroke="#241a63" stroke-width="3"/><ellipse rx="100" ry="35" fill="#61d6df" stroke="#eafcff" stroke-width="3"/><path d="M-38-2V-67Q0-110 38-67V-2Z" fill="#302563" stroke="#ffd43b" stroke-width="6"/><path d="M-28-4V-64Q0-92 28-64V-4" fill="none" stroke="#22d3ee" stroke-width="3"/><path d="M-70 4L-61-57L-45 4M46 4L62-62L74 4M-16-63L0-115L16-63" fill="url(#muCrystal)" stroke="#167b98" stroke-width="3"/><text y="121" text-anchor="middle" fill="#fff" font-size="20" font-weight="800">けっしょうのとびら</text></g>' +
      '<g transform="translate(423 115)"><ellipse cy="80" rx="106" ry="18" fill="#071a49" opacity=".45"/><path d="M-100 10L-62 74L0 98L70 64L100 10Z" fill="url(#muStone)" stroke="#241a63" stroke-width="3"/><ellipse rx="100" ry="34" fill="#53bda0" stroke="#dbfff1" stroke-width="3"/><path d="M-75 0V-52H75V0M-90-52H90L66-71H-63Z" fill="#d7e2ed" stroke="#444478" stroke-width="4"/><path d="M0 2V-51M0-23Q-42-70-40-26Q-23 0 0-23M0-37Q37-82 40-39Q25-15 0-37" fill="#99e871" stroke="#247057" stroke-width="4"/><path d="M-69-48V-3M69-48V-3" stroke="#ffd43b" stroke-width="8"/><text y="128" text-anchor="middle" fill="#fff" font-size="20" font-weight="800">ひかりのにわ</text></g>' +
      '<g transform="translate(642 213)"><ellipse cy="65" rx="104" ry="17" fill="#071a49" opacity=".45"/><path d="M-100 9L-66 59L0 80L75 58L100 9Z" fill="url(#muStone)" stroke="#241a63" stroke-width="3"/><ellipse rx="100" ry="33" fill="#c7d77c" stroke="#f5ffcc" stroke-width="3"/><path d="M-8-24Q30 0 0 25L-26 28Q4 0-29-23" fill="#22d3ee"/><path d="M-46-12V-66H41V-12" fill="#677cb2" stroke="#263461" stroke-width="4"/><path d="M-32-11V-50H28V-11" fill="#19376d" stroke="#ffd43b" stroke-width="4"/><path d="M-29-10Q-6-31 25-10L32 7H-30Z" fill="#80eaf3"/><text y="106" text-anchor="middle" fill="#fff" font-size="20" font-weight="800">すいもんのたに</text></g></g>' +
      (!unlocked ? '<g transform="translate(420 265)"><rect x="-34" y="-12" width="68" height="56" rx="9" fill="#fff2b0" stroke="#5c447f" stroke-width="4"/><path d="M-22-12V-31A22 22 0 0 1 22-31V-12" fill="none" stroke="#ffd43b" stroke-width="8"/><circle cy="13" r="7" fill="#45346e"/></g>' : '') + '</svg>';
  }

  function muBadge(badged) {
    var color = badged ? '#ffd43b' : '#22d3ee';
    return '<svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (badged ? '探究バッジ' : '研究成功のしるし') + '"><path d="M35 85L20 167L62 150L80 170L87 81M80 84L90 170L112 150L148 167L126 82" fill="#7c3aed" stroke="#241a63" stroke-width="3"/><circle cx="80" cy="75" r="60" fill="' + color + '" stroke="#fff" stroke-width="5"/><circle cx="80" cy="75" r="48" fill="#fff" opacity=".35"/><path d="M80 35L90 62L120 63L97 82L105 111L80 94L55 111L63 82L40 63L70 62Z" fill="#fff" stroke="#776014" stroke-width="3"/><text x="80" y="82" text-anchor="middle" font-size="18" font-weight="800" fill="#34215a">MU</text></svg>';
  }

  window.RikaSVG = {
    muContinent: muContinent,
    muBadge: muBadge,
    colors: colors,
    esc: esc,
    slotIcon: slotIcon,
    itemIcon: itemIcon,
    hero: hero,
    caveIcon: caveIcon,
    castleIcon: castleIcon,
    lockIcon: lockIcon,
    statusGlyph: statusGlyph,
    continentPath: continentPath
  };
})();
