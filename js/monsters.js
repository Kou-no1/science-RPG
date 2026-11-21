(function () {
  var drawingId = 0;
  function themeMotif(theme) {
    var motifs = {
      sky:'<path d="M84 37 Q75 23 92 24 Q98 9 111 23 Q131 14 135 33 Q126 42 84 37Z" fill="#eafcff" stroke="#0e93b3" stroke-width="3"/>',
      plant:'<path d="M108 43 Q77 42 83 15 Q110 14 108 43 M108 43 Q108 9 137 17 Q137 40 108 43" fill="#b5ef76" stroke="#276a34" stroke-width="3"/>',
      life:'<path d="M98 35 Q95 11 110 9 Q126 11 123 35Z" fill="#fff0f5" stroke="#9b3f61" stroke-width="3"/><circle cx="107" cy="25" r="4" fill="#e58aa9"/>',
      electric:'<path d="M111 9 L92 35 H108 L101 54 L130 25 H113Z" fill="#ffd43b" stroke="#8c6a00" stroke-width="3"/>',
      physics:'<circle cx="110" cy="25" r="15" fill="#ffd43b" stroke="#4c5965" stroke-width="3"/><path d="M110 11 V25 L120 30" fill="none" stroke="#4c5965" stroke-width="3"/>',
      pendulum:'<path d="M86 12 H130 M107 12 L126 43" fill="none" stroke="#33455b" stroke-width="5"/><path d="M85 42 Q105 58 129 44" fill="none" stroke="#e6902b" stroke-width="3" stroke-dasharray="4 4"/><circle cx="126" cy="43" r="10" fill="#ffd36e" stroke="#6b4821" stroke-width="3"/>',
      lever:'<path d="M96 48 L108 23 L122 48 Z" fill="#ffd36e" stroke="#60442d" stroke-width="3"/><path d="M75 36 L145 15" stroke="#33455b" stroke-width="6" stroke-linecap="round"/><path d="M77 31 L74 22 L81 14 L93 16 L97 26 Z" fill="#a4b2c3" stroke="#33455b" stroke-width="3"/>',
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
  function shadedBody(inner, prefix) {
    var defs = '', fills = {};
    var body = inner.replace(/fill="(#[a-fA-F0-9]{6})"/g, function (attribute, color) {
      if (color === '#17313b' || color === '#152735' || color === '#ffffff') return attribute;
      if (!fills[color]) {
        var id = prefix + '-fill-' + Object.keys(fills).length;
        fills[color] = id;
        defs += '<radialGradient id="' + id + '" cx=".35" cy=".25" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="' + color + '"/><stop offset=".75" stop-color="' + color + '"/><stop offset="1" stop-color="#253152"/></radialGradient>';
      }
      return 'fill="url(#' + fills[color] + ')"';
    }).replace(/url\(#shadow\)/g,'url(#' + prefix + '-shadow)').replace(/stroke-width="6"/g,'stroke-width="3"').replace(/stroke-width="5"/g,'stroke-width="3"');
    return '<defs>' + defs + '<filter id="' + prefix + '-shadow"><feDropShadow dx="0" dy="8" stdDeviation="4" flood-color="#17313b" flood-opacity=".25"/></filter></defs>' + body;
  }

  // Plane gradients keep adjacent crystal facets distinct; curved surfaces catch a round highlight.
  var materials = {
    saltFront: ['plane', '#ffffff', '#d8eff8', '#b1d5e6'],
    saltSide: ['plane', '#b4dcea', '#91c2d8', '#68a1bd'],
    alumLight: ['plane', '#ffffff', '#ebeafa', '#d6d7ec'],
    alumTop: ['plane', '#eeeefe', '#cbd2ef', '#a6b6db'],
    alumBase: ['plane', '#c5b3e2', '#a49acd', '#817dac'],
    amethyst: ['round', '#f8eefe', '#bb9cd9', '#846995'],
    glass: ['plane', '#ffffff', '#ddf6fb', '#b5dce8'],
    brine: ['plane', '#b4eee6', '#92dfdc', '#68bec5'],
    jade: ['round', '#e4ffdd', '#80d39e', '#469b7a'],
    paper: ['plane', '#fffaf1', '#f4e9cf', '#cfb98b'],
    batWing: ['plane', '#ffdda3', '#f1ad83', '#ba776e'],
    batBody: ['round', '#f7d5d6', '#c7839a', '#925a79'],
    dragon: ['round', '#dee8ff', '#92a9d6', '#6074a7'],
    iceWing: ['plane', '#ecfcff', '#b2e6ec', '#81c6d8'],
    goldWing: ['plane', '#fff5b4', '#ffe089', '#e5ad4d']
  };

  function paintMaterials(inner, prefix) {
    var defs = '', ids = {};
    var body = inner.replace(/url\(#paint-(\w+)\)/g, function (_, key) {
      if (!ids[key]) {
        var m = materials[key], round = m[0] === 'round';
        var tag = round ? 'radialGradient' : 'linearGradient';
        ids[key] = prefix + '-' + key;
        defs += '<' + tag + ' id="' + ids[key] + '" ' + (round ? 'cx="34%" cy="27%" r="80%"' : 'x2="75%" y2="100%"') + '>' +
          '<stop stop-color="' + m[1] + '"/><stop offset="' + (round ? '.54' : '.47') + '" stop-color="' + m[2] + '"/><stop offset="1" stop-color="' + m[3] + '"/></' + tag + '>';
      }
      return 'url(#' + ids[key] + ')';
    });
    return '<defs>' + defs + '</defs>' + body;
  }

  function svgShell(inner, monster, generic) {
    var prefix = 'rq-mon-' + (++drawingId);
    inner = generic ? shadedBody(inner, prefix) + themeMotif(monster.motif || monster.theme) : paintMaterials(inner, prefix);
    var crown = '<g transform="translate(164 8) rotate(9 22 17)" stroke="#744417" stroke-width="3"><path d="M2 7 L14 16 L22 1 L31 16 L44 7 L39 30 H7 Z" fill="#ffcf4b"/><path d="M7 25 H40" stroke="#fff3ba"/><path d="M22 15 L26 20 L22 24 L18 20 Z" fill="#c74b5c" stroke="none"/></g>';
    return '<svg viewBox="0 0 220 180" role="img" aria-label="' + window.RikaSVG.esc(monster.name) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke-linejoin="round">' + inner + (monster.variant === 'legendary' ? crown : '') + '</g></svg>';
  }

  function ground(rx) {
    return '<ellipse cx="110" cy="155" rx="' + rx + '" ry="9" fill="#17313b" opacity=".18"/>';
  }

  // Keep the flat faces explicit: a salt cube and an alum octahedron must read at icon size.
  function saltCube(x, y, scale) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')" stroke="#295e76" stroke-width="3.5">' +
      '<path d="M-50 -29 L-19 -48 L51 -35 V30 L21 50 L-50 37 Z" fill="url(#paint-saltFront)"/>' +
      '<path d="M-50 -29 L-19 -48 L51 -35 L21 -16 Z" fill="#fffef5"/><path d="M21 -16 L51 -35 V30 L21 50 Z" fill="url(#paint-saltSide)"/></g>';
  }

  function alumCrystal(x, y, scale, angle) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + angle + ') scale(' + scale + ')" stroke="#494577" stroke-width="3.5">' +
      '<path d="M0 -40 L33 0 L0 40 L-33 0 Z" fill="url(#paint-alumLight)"/><path d="M0 -40 L33 0 L-7 9 Z" fill="url(#paint-alumTop)"/>' +
      '<path d="M-33 0 L-7 9 L0 40 Z" fill="#c5b1e5"/><path d="M-7 9 L33 0 L0 40 Z" fill="url(#paint-alumBase)"/><path d="M-23 -5 L-8 -24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>';
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
        monster, true
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
        monster, true
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
        monster, true
      );
    },
    makeSoltin: function (monster) {
      return svgShell(ground(67) +
        '<g stroke="#295e76" stroke-width="4"><path d="M68 95 Q42 90 38 72 M153 100 Q177 95 182 79" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="147" rx="15" ry="8" fill="#99cde1"/><ellipse cx="135" cy="148" rx="15" ry="8" fill="#99cde1"/></g>' +
        saltCube(38, 68, .25) + saltCube(183, 73, .22) + saltCube(111, 87, 1.2) +
        '<path d="M61 59 L61 86 M66 56 L94 61" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
        eye(77, 91) + eye(116, 97) + '<path d="M83 118 Q93 130 107 123" fill="none" stroke="#244654" stroke-width="4" stroke-linecap="round"/>', monster);
    },
    makeMyoubaroo: function (monster) {
      return svgShell(ground(64) +
        '<path d="M135 115 Q170 139 184 107 Q184 147 147 142 L124 132 Z" fill="#b4a6da" stroke="#494577" stroke-width="4"/>' +
        alumCrystal(62, 74, 1.1, -32) + alumCrystal(155, 68, 1.17, 37) +
        '<path d="M84 83 L76 57 Q91 60 99 69 Q110 63 123 67 L143 44 L140 77 Q151 88 146 102 Q142 112 132 117 L143 141 L127 147 L114 134 Q102 137 92 132 L75 143 L66 134 L81 116 Q67 97 84 83 Z" fill="url(#paint-amethyst)" stroke="#494577" stroke-width="4"/>' +
        '<path d="M83 108 Q101 123 136 106 Q131 125 113 128 Q95 128 83 117 Z" fill="#ecebff"/>' +
        eye(93, 94) + eye(123, 90) + '<path d="M99 112 Q109 119 120 108" fill="none" stroke="#413655" stroke-width="4" stroke-linecap="round"/>', monster);
    },
    makeTokerun: function (monster) {
      return svgShell(ground(62) +
        '<path d="M47 51 H164 V136 Q164 147 151 147 H74 Q60 147 60 134 V63 Z" fill="url(#paint-glass)" stroke="#2b6178" stroke-width="4"/>' +
        '<path d="M62 79 Q84 84 109 80 T162 79 V135 Q162 145 150 145 H74 Q62 145 62 134 Z" fill="url(#paint-brine)"/>' +
        '<path d="M105 107 L144 25 Q146 20 151 22 Q155 24 153 29 L114 111 Z" fill="#d5f5fa" stroke="#46778a" stroke-width="3"/>' +
        '<path d="M62 81 Q84 86 110 82 T162 81 V136 Q162 145 151 145 H74 Q62 145 62 134 Z" fill="#6fd7d3" fill-opacity=".67"/>' +
        '<path d="M62 79 Q84 84 109 80 T162 79" fill="none" stroke="#368f98" stroke-width="3"/>' +
        '<path d="M46 51 H154 M147 65 H162 M151 77 H162 M147 90 H162 M151 103 H162 M147 116 H162 M151 129 H162" fill="none" stroke="#2b6178" stroke-width="3"/>' +
        '<path d="M70 64 V77 M70 85 V125" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
        eye(91, 101) + eye(128, 101) + '<path d="M98 125 Q109 135 121 125" fill="none" stroke="#204951" stroke-width="4" stroke-linecap="round"/>', monster);
    },
    makeRokagaeru: function (monster) {
      return svgShell(ground(65) +
        '<g stroke="#256854" stroke-width="4"><path d="M58 115 Q37 108 38 127 L25 134 Q44 146 75 132 M162 115 Q183 108 182 127 L195 134 Q176 146 145 132" fill="#87c684"/>' +
        '<path d="M54 104 Q50 74 68 64 Q65 36 84 35 Q102 32 107 49 H117 Q125 30 143 34 Q159 37 157 62 Q173 74 168 104 L154 127 H68 Z" fill="url(#paint-jade)"/></g>' +
        '<path d="M60 81 Q62 72 68 69 M154 70 L158 77" fill="none" stroke="#dcffe6" stroke-width="3.5" stroke-linecap="round"/>' +
        eye(86, 54) + eye(141, 53) + '<path d="M90 75 Q110 88 133 74" fill="none" stroke="#235747" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M48 100 H172 L119 139 V148 L105 153 V140 Z" fill="#abdce6" stroke="#305c76" stroke-width="4"/>' +
        '<path d="M49 94 Q110 77 171 94 L111 136 Z" fill="url(#paint-paper)" stroke="#83664c" stroke-width="3.5"/><path d="M51 94 Q108 108 170 94 M77 101 L110 130 L140 101" fill="none" stroke="#bda57c" stroke-width="3"/>' +
        '<g fill="#705337"><circle cx="91" cy="94" r="4"/><circle cx="111" cy="91" r="3.5"/><circle cx="129" cy="95" r="4"/></g>' +
        '<path d="M111 151 Q99 166 110 169 Q122 168 111 151 Z" fill="#69cae4" stroke="#305c76" stroke-width="2.5"/>', monster);
    },
    makeJohatsuBat: function (monster) {
      return svgShell(ground(65) +
        '<g stroke="#65415b" stroke-width="4"><path d="M91 79 Q62 40 19 44 Q30 55 22 83 Q43 75 51 101 Q73 88 88 115 L102 97 M129 79 Q158 40 201 44 Q190 55 198 83 Q177 75 169 101 Q147 88 132 115 L118 97" fill="url(#paint-batWing)"/>' +
        '<path d="M88 81 Q61 54 24 46 M55 59 L51 97 M132 81 Q159 54 196 46 M165 59 L169 97" fill="none" stroke="#b7685e" stroke-width="3"/>' +
        '<path d="M83 68 L79 39 L101 57 Q109 54 118 57 L140 37 L136 71 Q155 99 130 116 Q110 131 90 116 Q68 102 83 68 Z" fill="url(#paint-batBody)"/></g>' +
        '<path d="M32 49 Q49 49 65 60 M155 60 Q171 49 185 49" fill="none" stroke="#ffebc4" stroke-width="3" stroke-linecap="round"/>' +
        eye(95, 83) + eye(126, 83) + '<path d="M99 103 Q111 111 123 102" fill="none" stroke="#452e45" stroke-width="4" stroke-linecap="round"/>' +
        '<g fill="none" stroke="#549fb0" stroke-width="4" stroke-linecap="round"><path d="M69 132 Q61 121 66 111 M59 117 L66 110 L70 118 M152 132 Q161 121 156 111 M150 118 L156 110 L163 117"/></g>' +
        '<path d="M55 139 Q110 129 165 139 Q155 159 111 160 Q69 158 55 139 Z" fill="#f6ddbf" stroke="#704c50" stroke-width="3.5"/><path d="M56 139 Q110 148 164 139" fill="none" stroke="#a16f67" stroke-width="3"/>' +
        saltCube(98, 136, .10) + saltCube(113, 135, .13) + saltCube(126, 138, .08), monster);
    },
    makeCrystadra: function (monster) {
      var gold = monster.variant === 'legendary';
      var wing = gold ? 'url(#paint-goldWing)' : 'url(#paint-iceWing)', fold = gold ? '#dd9b42' : '#6cabc8';
      return svgShell(ground(81) +
        '<g stroke="#394768" stroke-width="4"><path d="M78 112 Q45 139 28 100 Q22 151 58 148 Q79 148 98 128" fill="#789cc9"/>' +
        '<path d="M115 98 L78 46 L30 23 L42 72 L56 69 L53 98 L70 90 L83 119 Z" fill="' + wing + '"/>' +
        '<path d="M31 25 L87 92 L56 69 M42 72 L54 66 M54 95 L75 83" fill="none" stroke="' + fold + '" stroke-width="4"/>' +
        '<path d="M117 83 L135 44 L172 26 L160 69 L148 65 L145 89 Z" fill="' + wing + '"/>' +
        '<path d="M78 99 Q84 81 103 78 Q121 74 126 58 L136 40 L148 53 Q160 51 169 59 L182 53 L179 74 L193 83 Q197 97 179 102 L158 107 Q151 120 141 130 L151 143 L138 151 L122 137 Q108 142 94 136 L79 150 L61 145 L76 127 Q71 115 78 99 Z" fill="url(#paint-dragon)"/></g>' +
        '<path d="M97 117 Q128 128 148 100 L162 100 Q150 124 131 132 Q111 140 97 132 Z" fill="#dee9f7"/>' +
        alumCrystal(89, 77, .52, -17) + alumCrystal(109, 66, .58, -10) + alumCrystal(126, 47, .62, 5) +
        '<path d="M42 36 L66 51 M155 46 L164 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
        eye(148, 79) + '<circle cx="184" cy="85" r="3" fill="#263950"/><path d="M157 94 Q167 101 181 95" fill="none" stroke="#34415c" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M78 145 L81 139 M139 147 L140 141" stroke="#425477" stroke-width="3" stroke-linecap="round"/>', monster);
    }
  };

  function render(id, className) {
    var monster = window.MONSTERS[id];
    if (!monster) return "";
    var fn = window.RikaMonsterSVG[monster.svg] || window.RikaMonsterSVG.makeGenericSlime;
    return '<span class="monster-figure theme-' + window.RikaSVG.esc(monster.theme) + ' role-' + window.RikaSVG.esc(monster.role) + (monster.variant === "legendary" ? ' legendary' : '') + ' ' + window.RikaSVG.esc(className || "") + '">' + fn(monster) + "</span>";
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
