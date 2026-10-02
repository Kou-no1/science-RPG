(function () {
  var drawingId = 0;
  function themeMotif(theme) {
    var motifs = {
      sky:'<path d="M84 37 Q75 23 92 24 Q98 9 111 23 Q131 14 135 33 Q126 42 84 37Z" fill="#eafcff" stroke="#0e93b3" stroke-width="3"/>',
      plant:'<path d="M108 43 Q77 42 83 15 Q110 14 108 43 M108 43 Q108 9 137 17 Q137 40 108 43" fill="#b5ef76" stroke="#276a34" stroke-width="3"/>',
      life:'<path d="M98 35 Q95 11 110 9 Q126 11 123 35Z" fill="#fff0f5" stroke="#9b3f61" stroke-width="3"/><circle cx="107" cy="25" r="4" fill="#e58aa9"/>',
      electric:'<path d="M111 9 L92 35 H108 L101 54 L130 25 H113Z" fill="#ffd43b" stroke="#8c6a00" stroke-width="3"/>',
      physics:'<circle cx="110" cy="25" r="15" fill="#ffd43b" stroke="#4c5965" stroke-width="3"/><path d="M110 11 V25 L120 30" fill="none" stroke="#4c5965" stroke-width="3"/>',
      fire:'<path d="M90 39 Q88 23 102 17 Q100 30 111 7 Q132 27 128 39Z" fill="#ffcf62" stroke="#94301d" stroke-width="3"/>',
      heat:'<path d="M90 39 Q88 23 102 17 Q100 30 111 7 Q132 27 128 39Z" fill="#ffcf62" stroke="#a53653" stroke-width="3"/>',
      body:'<path d="M110 38 C77 19 101 8 110 19 C121 5 144 22 110 38Z" fill="#ff9ab6" stroke="#91323c" stroke-width="3"/>',
      space:'<path d="M123 10 A19 19 0 1 0 130 37 A17 17 0 0 1 123 10Z" fill="#ffd43b" stroke="#26306b" stroke-width="3"/>',
      earth:'<path d="M88 37 L97 11 L118 17 L135 37Z" fill="#ffd089" stroke="#5e432b" stroke-width="3"/><path d="M95 25 H125 M91 32 H131" stroke="#9c7952" stroke-width="3"/>',
      chem:'<path d="M101 12 H119 V28 Q134 42 110 42 Q87 42 101 28Z" fill="#b5ef76" stroke="#563176" stroke-width="3"/>',
      eco:'<circle cx="110" cy="26" r="18" fill="#70dbdd" stroke="#1e654f" stroke-width="3"/><path d="M99 13 L110 22 L102 32 L114 38 L121 24 L116 13" fill="#55aa5b"/>',
      water:'<path d="M110 10 Q82 36 110 43 Q138 36 110 10Z" fill="#a0eeff" stroke="#29647c" stroke-width="3"/>',
      light:'<path d="M110 7 L116 21 L131 23 L120 33 L123 47 L110 39 L97 47 L100 33 L89 23 L104 21Z" fill="#fff1a2" stroke="#a4670a" stroke-width="3"/>',
      sound:'<path d="M106 14 V35 Q90 30 91 40 Q92 47 105 42 V21 L124 17 V31 Q111 28 111 38 Q112 45 124 38 V9Z" fill="#fff8ca" stroke="#187663" stroke-width="3"/>'
    };
    return motifs[theme] || '';
  }
  function svgShell(inner, label, theme) {
    var prefix = 'rq-mon-' + (++drawingId), defs = '', fills = {};
    inner = inner.replace(/fill="(#[a-fA-F0-9]{6})"/g, function (attribute, color) {
      if (color === '#17313b' || color === '#152735' || color === '#ffffff') return attribute;
      if (!fills[color]) {
        var id = prefix + '-fill-' + Object.keys(fills).length;
        fills[color] = id;
        defs += '<radialGradient id="' + id + '" cx=".35" cy=".25" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="' + color + '"/><stop offset=".75" stop-color="' + color + '"/><stop offset="1" stop-color="#253152"/></radialGradient>';
      }
      return 'fill="url(#' + fills[color] + ')"';
    }).replace(/url\(#shadow\)/g,'url(#' + prefix + '-shadow)').replace(/stroke-width="6"/g,'stroke-width="3"').replace(/stroke-width="5"/g,'stroke-width="3"');
    return '<svg viewBox="0 0 220 180" role="img" aria-label="' + window.RikaSVG.esc(label || "モンスター") + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' + defs + '<filter id="' + prefix + '-shadow"><feDropShadow dx="0" dy="8" stdDeviation="4" flood-color="#17313b" flood-opacity=".25"/></filter></defs>' +
      '<g stroke-linejoin="round">' + inner + themeMotif(theme) + '</g>' +
      '</svg>';
  }

  function eye(cx, cy) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="13" ry="15" fill="#fff"/><circle cx="' + cx + '" cy="' + (cy + 2) + '" r="8" fill="#152735"/><circle cx="' + (cx - 3) + '" cy="' + (cy - 3) + '" r="3" fill="#fff"/><circle cx="' + (cx - 18) + '" cy="' + (cy + 16) + '" r="5" fill="#ff9ab6" opacity=".5"/>';
  }

  window.RikaMonsterSVG = {
    makeGenericSlime: function (monster) {
      var c = window.RikaSVG.colors(monster.theme);
      return svgShell(
        '<ellipse cx="110" cy="146" rx="66" ry="14" fill="#17313b" opacity=".18"/>' +
        '<path d="M51 122 C44 79 71 44 103 39 C117 18 146 25 149 51 C176 64 188 96 171 125 C150 158 76 158 51 122 Z" fill="' + c.main + '" stroke="' + c.dark + '" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M75 72 C88 55 122 54 141 67" fill="none" stroke="' + c.light + '" stroke-width="9" stroke-linecap="round" opacity=".72"/>' +
        eye(88, 101) + eye(132, 101) +
        '<path d="M94 126 C105 135 121 135 133 126" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>',
        monster.name, monster.theme
      );
    },
    makeGenericDragon: function (monster) {
      var c = window.RikaSVG.colors(monster.theme);
      return svgShell(
        '<ellipse cx="110" cy="152" rx="73" ry="13" fill="#17313b" opacity=".18"/>' +
        '<path d="M47 111 C28 76 56 49 89 66 C91 35 126 23 145 48 C169 43 189 60 184 87 C205 99 195 132 166 126 C151 158 83 160 67 128 C56 130 50 123 47 111 Z" fill="' + c.main + '" stroke="' + c.dark + '" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M67 76 L37 45 L79 56 Z M151 57 L184 28 L174 73 Z" fill="' + c.light + '" stroke="' + c.dark + '" stroke-width="5"/>' +
        '<path d="M103 43 L112 20 L124 44 Z M134 53 L149 33 L151 62 Z" fill="#ffe078" stroke="' + c.dark + '" stroke-width="4"/>' +
        eye(101, 91) + eye(143, 91) +
        '<path d="M112 119 C125 130 143 128 153 116" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M72 119 C51 141 34 133 26 119" fill="none" stroke="' + c.dark + '" stroke-width="8" stroke-linecap="round"/>',
        monster.name, monster.theme
      );
    },
    makeGenericBeast: function (monster) {
      var c = window.RikaSVG.colors(monster.theme);
      return svgShell(
        '<ellipse cx="110" cy="150" rx="70" ry="13" fill="#17313b" opacity=".18"/>' +
        '<path d="M58 116 C48 82 73 56 111 56 C150 56 178 80 166 116 C160 145 70 145 58 116 Z" fill="' + c.main + '" stroke="' + c.dark + '" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M70 60 L84 33 L98 61 Z M129 60 L146 34 L155 66 Z" fill="' + c.light + '" stroke="' + c.dark + '" stroke-width="5"/>' +
        eye(93, 95) + eye(130, 95) +
        '<path d="M101 119 C110 126 122 126 130 119" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="57" cy="128" r="10" fill="' + c.dark + '"/><circle cx="165" cy="128" r="10" fill="' + c.dark + '"/>',
        monster.name, monster.theme
      );
    },
    makeSoltin: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="151" rx="62" ry="12" fill="#17313b" opacity=".18"/>' +
        '<path d="M59 122 C50 87 72 58 104 55 C114 34 143 38 149 62 C174 75 182 102 164 126 C142 151 80 151 59 122 Z" fill="#c9f6ff" stroke="#2d7f96" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M82 62 L93 42 L105 62 L126 50 L132 75" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>' +
        '<path d="M62 110 L42 96 L56 82 M159 109 L180 94 L165 80" fill="none" stroke="#2d7f96" stroke-width="6" stroke-linecap="round"/>' +
        eye(88, 101) + eye(132, 101) +
        '<path d="M98 126 C109 135 123 134 134 125" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>',
        monster.name
      );
    },
    makeMyoubaroo: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="151" rx="68" ry="12" fill="#17313b" opacity=".18"/>' +
        '<path d="M58 114 C51 80 82 54 110 62 C125 40 156 47 162 77 C185 91 177 129 148 132 C129 151 82 145 58 114 Z" fill="#91e1ef" stroke="#2d7f96" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M75 73 L37 43 L90 57 Z M146 66 L186 38 L172 87 Z" fill="#eafcff" stroke="#2d7f96" stroke-width="5"/>' +
        '<path d="M111 57 L122 33 L135 58 Z" fill="#fff4a3" stroke="#2d7f96" stroke-width="4"/>' +
        eye(95, 96) + eye(135, 96) +
        '<path d="M104 122 C115 130 129 129 139 120" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>',
        monster.name
      );
    },
    makeTokerun: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="151" rx="64" ry="12" fill="#17313b" opacity=".16"/>' +
        '<path d="M57 121 C50 78 82 48 118 55 C150 47 177 85 162 123 C143 153 78 153 57 121 Z" fill="#bff4ff" opacity=".72" stroke="#2d7f96" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M78 82 C93 68 122 67 142 80" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".9"/>' +
        eye(88, 102) + eye(133, 102) +
        '<path d="M96 126 C109 134 124 134 136 125" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>',
        monster.name
      );
    },
    makeRokagaeru: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="151" rx="70" ry="12" fill="#17313b" opacity=".18"/>' +
        '<path d="M54 119 C50 82 78 62 110 63 C145 62 170 84 166 119 C160 148 62 148 54 119 Z" fill="#85d7cf" stroke="#2d7f96" stroke-width="6" filter="url(#shadow)"/>' +
        '<circle cx="84" cy="64" r="18" fill="#eafcff" stroke="#2d7f96" stroke-width="5"/><circle cx="136" cy="64" r="18" fill="#eafcff" stroke="#2d7f96" stroke-width="5"/>' +
        eye(84, 64) + eye(136, 64) +
        '<path d="M82 111 C98 126 123 127 139 111" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M68 126 L39 139 M151 126 L181 139" stroke="#2d7f96" stroke-width="8" stroke-linecap="round"/>',
        monster.name
      );
    },
    makeJohatsuBat: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="151" rx="66" ry="12" fill="#17313b" opacity=".15"/>' +
        '<path d="M105 72 C92 49 70 54 64 78 C45 68 26 82 33 108 C50 101 62 108 71 126 C82 147 140 147 151 126 C160 108 173 101 190 108 C197 82 176 68 157 78 C151 54 128 49 115 72 Z" fill="#98d9e8" stroke="#2d7f96" stroke-width="6" filter="url(#shadow)"/>' +
        '<path d="M89 75 L100 52 L110 76 L121 52 L132 75" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
        eye(94, 102) + eye(126, 102) +
        '<path d="M100 124 C110 130 121 130 130 124" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>',
        monster.name
      );
    },
    makeCrystadra: function (monster) {
      return svgShell(
        '<ellipse cx="110" cy="153" rx="78" ry="13" fill="#17313b" opacity=".18"/>' +
        '<path d="M43 113 C30 76 64 47 93 65 C96 33 128 18 149 46 C177 44 197 70 184 99 C203 118 184 143 158 130 C143 160 77 160 61 130 C50 131 45 123 43 113 Z" fill="#8fe8f4" stroke="#226f86" stroke-width="7" filter="url(#shadow)"/>' +
        '<path d="M82 61 L44 30 L95 47 Z M151 52 L190 23 L176 76 Z" fill="#dcfbff" stroke="#226f86" stroke-width="5"/>' +
        '<path d="M101 43 L114 11 L129 45 Z M132 48 L151 22 L154 60 Z M77 69 L67 43 L91 58 Z" fill="#fff5ad" stroke="#226f86" stroke-width="4"/>' +
        eye(101, 92) + eye(143, 92) +
        '<path d="M111 121 C125 131 143 130 154 117" fill="none" stroke="#152735" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M70 123 C45 148 27 135 20 119" fill="none" stroke="#226f86" stroke-width="8" stroke-linecap="round"/>',
        monster.name
      );
    }
  };

  function render(id, className) {
    var monster = window.MONSTERS[id];
    if (!monster) return "";
    var fn = window.RikaMonsterSVG[monster.svg] || window.RikaMonsterSVG.makeGenericSlime;
    return '<span class="monster-figure theme-' + window.RikaSVG.esc(monster.theme) + ' role-' + window.RikaSVG.esc(monster.role) + (monster.variant === "legendary" ? ' legendary' : '') + ' ' + (className || "") + '">' + fn(monster) + (monster.variant === "legendary" ? '<span class="legendary-crown" aria-hidden="true">★</span>' : '') + "</span>";
  }

  function byTheme(theme, role) {
    return Object.keys(window.MONSTERS || {}).map(function (id) { return window.MONSTERS[id]; }).filter(function (monster) {
      return monster.theme === theme && (!role || monster.role === role);
    });
  }

  function choose(unit, tier) {
    if (tier !== "basic") return window.MONSTERS[tier === "bonus" ? unit.legendaryId : unit.bossId] || byTheme(unit.theme, "boss")[0] || null;
    var ids = unit.encounters || byTheme(unit.theme, "zako").map(function (m) { return m.id; });
    var data = window.RikaState.get();
    var bag = data.encounterBags[unit.unitId];
    if (!Array.isArray(bag)) bag = [];
    bag = bag.filter(function (id) { return ids.includes(id); });
    if (!bag.length) {
      bag = ids.slice();
      for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var temp = bag[i]; bag[i] = bag[j]; bag[j] = temp; }
    }
    var unseen = bag.find(function (id) { return !data.owned.monsters.seen.includes(id); });
    var id = unseen || bag[0];
    data.encounterBags[unit.unitId] = bag.filter(function (x) { return x !== id; });
    window.RikaState.save();
    return window.MONSTERS[id] || null;
  }

  window.RikaMonsters = {
    render: render,
    byTheme: byTheme,
    choose: choose
  };
})();
