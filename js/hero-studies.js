(function () {
  "use strict";
  var seq = 0;
  var characters = [
    { id: "aoi", name: "アオイ", specialty: "結晶研究" },
    { id: "jin", name: "ジン", specialty: "電気工作" },
    { id: "sora", name: "ソラ", specialty: "星空観測" },
    { id: "mio", name: "ミオ", specialty: "結晶研究" },
    { id: "ritsu", name: "リツ", specialty: "電気工作" },
    { id: "nagi", name: "ナギ", specialty: "星空観測" }
  ];
  function p(d, fill, stroke, width) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="' + (stroke || "none") + '" stroke-width="' + (width || 2.4) + '"/>';
  }
  function c(x, y, r, fill, stroke, width) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + (stroke || "none") + '" stroke-width="' + (width || 2) + '"/>';
  }
  function group(transform, art) { return '<g transform="' + transform + '">' + art + '</g>'; }
  function line(d, color, width) { return p(d, "none", color, width); }
  function star(x, y, size, color) {
    return group('translate('+x+' '+y+') scale('+size+')',p("M0 -7 Q1 -1 6 0 Q1 1 0 7 Q-1 1 -6 0 Q-1 -1 0 -7Z",color));
  }
  function render(key) {
    var character = characters.find(function (entry) { return entry.id === key; });
    if (!character) return "";
    var title = character.specialty + "の" + character.name;
    var id = 'rq-study-' + (++seq) + '-';
    var ink = "#243244", paper = "#fff9e9", brass = "#ffd476";
    function color(k) {return 'url(#' + id + k + ')';}
    function paint(d, f, width) {return p(d,f,ink,width);}
    function grad(k, stops) {
      return '<linearGradient id="'+id+k+'" x2="0.48" y2="1">'+stops.map(function(s,i){return '<stop offset="'+i/(stops.length-1)+'" stop-color="'+s+'"/>';}).join('')+'</linearGradient>';
    }
    var defs = grad('skin', ['#ffe7c8','#ffcd9f','#eaa386']) + grad('snow',['#fffdf2','#e7f3eb','#9dbfc9']) +
      grad('teal',['#56dfcf','#209e9d','#156378']) + grad('copper',['#ffda9b','#f39756','#b45544']) +
      grad('gold',['#fff3ac','#edb854','#a9673f']) + grad('blue',['#416692','#254467','#24344f']) +
      grad('sky',['#beedff','#6cdbe5','#27959f']) + grad('night',['#8a82bf','#545491','#353c70']) +
      grad('silver',['#f2e1e5','#c7c6e1','#8c93bc']) + grad('brown',['#98664b','#75423d','#483748']);
    var footShadow='<ellipse cx="101" cy="228" rx="58" ry="7" fill="#11122d" opacity=".38"/>';
    function boot(x,y,rot,flipped,body,sole) {
      return group('translate('+x+' '+y+') rotate('+rot+') scale('+(flipped?-1:1)+' 1)',
        paint("M-10 -19 L8 -18 L9 -3 Q7 1 17 5 Q24 8 20 14 Q17 17 -9 14 L-13 10Z", body) +
        p("M-12 8 Q3 12 20 9 L20 14 Q10 18 -10 14 L-13 11Z",sole,ink,1.7) +
        p("M-11 -16 L8 -15 L9 -10 L-11 -11Z",sole,ink,1.4) +
        line("M-4 -6 L5 -4 M-4 -2 L4 0",paper,1.6));
    }
    function eye(x,y,scale,shade,reverse) {
      return group('translate('+x+' '+y+') scale('+(reverse?-scale:scale)+' '+scale+')',
        p("M-9 -1 Q-6 -9 2 -9 Q8 -9 9 -4 Q9 7 2 9 Q-5 10 -8 4Z","#fff9ec",ink,1.5) +
        p("M-4 -6 Q0 -10 5 -7 Q9 -2 5 5 Q2 10 -3 6 Q-6 3 -4 -6Z",shade) +
        p("M-3 -7 Q0 -9 4 -7 L4 0 Q1 3 -2 1Z",ink) +
        c(-2,-5,2.7,"white")+c(4,3,1.2,"#e7ffff") +
        line("M-10 -2 Q-6 -10 3 -9 L9 -7",ink,2.7));
    }
    function face(shade,smile,wink,skin) {
      return paint("M64 76 Q61 49 88 44 Q115 38 134 61 L134 81 Q141 74 143 82 Q144 90 135 95 Q131 108 112 117 Q103 121 96 117 Q80 113 71 103 Q63 102 59 94 Q54 85 60 83 Q63 82 66 86Z",skin || color('skin')) +
        p("M70 99 Q82 111 96 114 Q104 118 113 112 L123 106 Q116 114 106 117 Q99 121 87 114Z","#e9a182")+
        line("M60 87 Q65 86 67 94 M138 84 L135 89","#bf7f68",1.5) +
        (wink ? line("M80 88 Q87 81 96 86",ink,3.4) : eye(88,87,1,shade,false)) + eye(116,84,.91,shade,true) +
        line("M81 72 L94 76 M109 74 L122 69",ink,2.7) +
        line("M103 93 L105 96 L102 97","#c98571",1.5) +
        (smile ? p("M95 102 Q102 105 113 99 Q110 110 103 110 Q98 109 95 102Z","#a3484d",ink,1.6) + p("M97 103 Q104 105 111 101 L109 104 Q103 107 98 105Z",paper)
        : line("M98 105 Q106 108 112 101","#924b4c",2)) +
        line("M74 96 L77 93 M78 98 L81 95 M122 94 L125 91","#ed9c8b",1.4);
    }
    function aoi(){
      var coat=color('snow'),teal=color('teal');
      var head=face("#208c98",false,false) +
        paint("M60 91 L51 78 L56 79 L47 67 L60 69 Q54 55 59 45 L65 50 Q64 35 81 27 L81 33 Q94 17 115 19 L110 26 Q129 25 140 34 L133 36 Q150 47 143 67 L137 64 L136 80 L128 89 L128 71 Q124 70 122 59 Q115 74 99 78 L104 64 Q90 78 77 79 L83 68 L71 78 L68 93Z",color('brown')) +
        p("M61 55 Q71 35 90 32 L85 38 Q103 25 120 29 Q99 33 90 44 Q77 44 61 55Z","#bb8057") +
        line("M119 48 Q119 63 108 71 M70 62 L63 72","#6b3e42",1.7);
      var lens=function(x,y,r){return c(x,y,r,color('gold'),ink,2.5)+c(x,y,r-3,color('sky'),ink,1.8)+line('M'+(x-5)+' '+(y+2)+' l7 -7 m-3 10 l6 -6','#fff9df',2);};
      head+=group("rotate(-12 99 52)",p("M59 50 Q94 37 139 47 L139 54 Q96 46 59 57Z","#455265",ink,2)+line("M94 48 Q101 41 107 47",ink,5)+lens(83,49,12)+lens(117,49,12));
      var denim=color('blue'),skin=color('skin');
      var stride=paint("M85 164 L103 171 Q98 183 88 190 L78 204 L63 201 Q68 192 72 184Z",denim)+
        p("M70 193 Q79 189 85 184 L78 195 L68 199Z","#506c83")+
        paint("M66 196 Q71 199 81 199 L76 212 L77 218 Q73 222 65 222 L48 220 Q45 217 49 214 L59 210 Q63 207 66 196Z","#62505a")+
        p("M65 196 Q72 199 81 199 L79 204 Q72 205 63 201Z","#a16b50",ink,1.5)+
        p("M49 215 Q50 212 58 211 L61 213 Q54 213 52 216Z","#96705c")+
        p("M48 216 Q59 220 76 216 L77 221 Q64 225 47 220Z","#394453",ink,1.6)+
        line("M61 209 L68 211","#e0ae78",1.6)+
        paint("M97 168 L121 170 Q118 182 122 189 L119 205 L103 205 L102 195 Q99 191 99 184Z",denim)+
        p("M116 179 Q114 187 119 190 L110 194 L116 195 L113 200 L106 201 L104 191Z","#48607c")+
        paint("M102 201 Q112 204 121 200 L122 212 Q123 216 132 217 Q139 218 138 224 Q126 230 103 226 L101 220 Q104 214 102 201Z","#71504b")+
        p("M102 200 Q112 203 122 199 L122 204 Q113 208 102 205Z","#ba845a",ink,1.5)+
        p("M106 207 Q107 214 105 219 L111 219 Q111 213 110 207Z","#95664f")+
        line("M113 211 L119 209 M114 215 L120 213","#e9bc84",1.6)+
        p("M123 218 Q128 216 134 219 Q130 218 126 221Z","#b48365")+
        p("M102 221 Q117 225 138 221 L138 225 Q127 230 103 227Z","#394453",ink,1.7);
      var sample=group("rotate(-6 169 105)",
        paint("M154 110 Q157 106 159 101 Q160 96 166 95 L173 94 Q178 92 180 96 Q182 100 177 104 L168 108 L159 116Z",skin,1.9)+
        paint("M167 86 H176 V106 Q178 111 190 127 Q194 134 186 136 Q174 138 160 136 Q153 135 156 128 L167 106Z","#d5f4f0",2.1)+
        p("M162 120 Q168 119 174 122 Q179 125 185 124 L189 130 Q191 134 185 134 Q173 136 160 134 Q156 133 158 130Z",teal)+
        p("M166 126 L172 118 L177 124 L173 132 L168 133Z","#befce5","#368e95",1.1)+
        p("M172 118 L172 125 L168 133 L173 132 L177 124Z","#64d6d1")+
        line("M172 118 L172 125 L177 124","#edfff2",1)+
        line("M166 114 L163 120 M159 127 L158 130",paper,2.1)+
        p("M165 85 Q171 83 178 85 V89 Q175 92 165 90Z","#b3e4de",ink,1.8)+
        line("M167 86 Q171 87 176 86","white",1.3)+
        p("M155 109 Q158 106 159 102 Q161 98 165 98 L171 98 Q175 98 174 101 Q174 103 171 104 L166 104 Q165 109 161 112 L158 114Z",skin,ink,1.8)+
        p("M176 94 Q179 93 180 96 Q181 98 179 100 Q179 103 176 105 Q173 105 174 102 L175 100 Q173 100 173 98Z",skin,ink,1.4)+
        line("M175 100 Q177 100 178 98","#b16f59",1.1));
      return paint("M84 124 Q69 134 57 160 Q47 174 31 183 Q45 184 50 181 L41 194 Q63 191 83 177Z","#6eb7bb")+
        stride+
        paint("M83 121 Q100 113 116 121 L128 139 L122 175 Q106 184 79 174 L72 146Z",teal)+
        p("M81 159 L122 157 L124 164 L81 169Z","#55424c",ink,2)+p("M99 158 L109 157 L110 165 L99 166Z",brass,ink,1.7)+
        paint("M83 118 L95 119 L89 131 L94 146 L85 173 L77 195 L51 189 L67 156 L65 136Z",coat)+
        paint("M111 120 L119 117 Q130 122 131 136 L125 152 L142 177 L134 184 L126 180 L122 186 L111 174 L104 148Z",coat)+
        p("M84 120 L94 119 L89 132 L94 139 L84 149 L82 138 L76 133Z",paper,ink,1.6)+
        line("M113 155 L123 153", "#40999d",2.7)+
        p("M111 138 L122 135 L122 143 L113 146Z","#c0dfdf",ink,1.15)+
        line("M115 137 L114 132 M119 136 L119 131","#307a83",1.8)+
        paint("M69 131 Q62 129 57 139 L48 154 Q46 158 50 162 L59 170 L68 162 L60 155 L72 144Z",coat)+
        p("M54 166 L63 158 L68 162 L60 171Z",teal,ink,1.6)+
        p("M61 174 L75 168 L74 178 Q72 182 65 183 L61 181Z","#d6e9e2","#567c83",1.35)+
        paint("M60 168 L66 162 Q69 161 70 164 L73 166 Q75 167 73 170 L68 174 L64 173Z",skin,1.7)+
        p("M60 174 L74 167 L76 170 L62 177Z","#72b6b7",ink,1.45)+
        paint("M124 124 Q131 121 136 130 L138 132 Q146 124 153 110 L161 115 Q154 135 143 147 Q137 153 130 148 L122 141Z",coat)+
        p("M125 137 Q131 144 136 145 Q142 145 149 136 Q141 152 134 148 L125 142Z","#9ebdc3")+
        line("M138 132 L135 137","#69939e",1.6)+
        sample+
        p("M151 111 L154 107 L162 113 L160 118Z",teal,ink,1.75)+
        paint("M75 117 L88 112 L117 114 L120 121 L108 129 L95 126 L91 132 L77 127Z",teal)+
        group("rotate(-3 100 94)",head)+star(184,78,.65,"#9effe3")+star(154,73,.40,brass);
    }
    function jin(){
      var leather=color('copper'), denim=color('blue'), skin=color('skin'), cuff="#334c5a";
      var head=face("#b97929",true,false)+
        paint("M66 92 L54 83 L59 80 Q48 78 43 68 L55 69 Q46 61 42 50 L60 54 L53 36 L72 43 Q67 32 67 24 L85 34 L91 14 L99 29 Q109 19 122 16 L116 31 L137 26 L131 38 L147 38 L140 49 Q148 53 145 62 L140 65 L143 72 L131 86 L126 63 L116 73 L116 61 Q108 71 98 76 L100 63 L80 77 L82 68 L73 76 L69 92Z",denim)+
        p("M51 55 L70 60 L64 44 L80 51 L75 34 L88 43 L92 27 L98 39 L113 27 L107 44 L126 35 Q118 49 93 55 L70 66Z","#507da0")+
        p("M61 68 Q42 64 30 48 Q36 66 45 71 L31 70 Q40 79 58 76Z","#e3884d",ink,1.8)+
        p("M55 70 Q82 57 132 50 L132 57 Q85 64 58 78Z","#ef9654",ink,1.7)+
        group("rotate(-17 135 69)",c(135,68,14,"#384958",ink)+c(135,68,10,color('gold'),ink,1.7)+p("M137 60 L130 69 L135 69 L133 76 L142 65 L136 65Z","#394b5b"))+
        line("M77 99 L79 99 M81 101 L83 100 M121 96 L123 95","#a87557",1.25);
      var stride=
        paint("M85 161 Q98 159 106 172 L88 196 Q82 204 74 199 L49 182 L56 173 L78 185Z",denim)+
        p("M55 177 L80 191 L86 186 L80 197 Q78 199 74 195 L51 181Z","#47658a")+
        boot(45,174,122,false,"#485361","#daa452")+
        paint("M99 163 L118 164 Q124 178 123 187 L112 211 L97 208 L106 185 L96 177Z",denim)+
        p("M115 178 Q120 183 118 189 L110 205 L105 205 L113 188 L108 185Z","#527a9b")+
        paint("M97 200 L116 205 L112 213 Q114 216 124 217 Q132 218 131 224 Q130 228 122 228 L99 228 Q91 228 92 223Z","#485361")+
        p("M96 201 L116 205 L114 210 L95 206Z","#f2ba62",ink,1.65)+
        p("M93 221 Q109 224 131 222 L131 226 Q127 229 121 229 L98 229 Q93 229 92 226Z","#dda554",ink,1.6)+
        line("M104 210 L111 212 M103 214 L110 216",paper,1.7);
      var jacket=
        paint("M80 123 L71 121 Q65 120 62 128 L56 148 Q55 154 63 158 L75 158Z","#527a7b")+
        paint("M85 119 Q102 112 116 119 Q129 124 129 137 L120 154 L119 173 Q95 179 73 167 L77 143 L74 131Z",leather)+
        p("M99 121 L111 117 L115 125 L102 140 L98 165 L88 163 L92 137Z","#ffe0a0",ink,1.6)+
        paint("M83 119 L91 113 L104 122 L98 132 L86 126Z","#fff0cc",1.8)+
        paint("M104 122 L113 115 L123 119 L115 128 L109 125Z","#ffe6b3",1.8)+
        p("M75 161 Q96 170 120 165 L119 173 Q96 178 73 168Z",cuff,ink,1.9)+
        p("M98 167 L108 167 L107 174 L97 174Z",brass,ink,1.5)+
        line("M75 162 L71 153 M80 161 L82 152",ink,4)+line("M75 161 L71 153","#98dbd1",2)+
        paint("M66 158 L85 162 L82 174 Q78 177 65 170Z","#955546",1.8)+
        p("M67 158 L85 161 L83 166 L74 167 L66 163Z",leather,ink,1.2)+c(75,164,1.3,brass);
      var generator=
        paint("M124 127 L138 120 L162 126 L162 148 L149 155 L124 148Z","#447e84")+
        p("M124 127 L148 132 L162 126 L138 120Z","#94cbc2",ink,1.6)+
        p("M148 132 L162 126 L162 148 L149 155Z","#315963",ink,1.6)+
        line("M152 136 L158 133 M152 140 L158 137","#a4d8c9",1.6)+
        paint("M148 118 Q148 115 145 112 Q139 107 142 99 Q145 92 153 93 Q162 94 163 102 Q164 109 158 114 L157 120Z","#ffe690")+
        line("M150 118 L147 104 L152 108 L157 103 L154 119","#b66c3d",1.5)+
        line("M145 102 Q146 97 151 97","#fffef4",2.7)+
        p("M147 117 L158 118 L157 124 Q152 127 147 123Z","#b0c6c4",ink,1.7)+
        c(135,139,8.3,color('gold'),ink,1.9)+c(135,139,4.4,"#6a7075",ink,1.25)+
        line("M135 139 L129 149 L117 145",ink,5.4)+line("M135 139 L129 149 L117 145","#cfddcf",2.6)+
        p("M114 141 Q116 140 118 142 L122 146 Q123 149 120 151 L113 146Z",cuff,ink,1.8);
      return stride+jacket+
        paint("M119 123 Q128 123 131 134 L137 147 L147 146 L151 155 L139 161 Q133 162 129 157 L117 141Z",leather)+
        p("M142 146 L150 144 L154 154 L146 158Z",cuff,ink,1.8)+
        group("translate(3 -1) rotate(7 102 99)",head)+
        line("M153 87 L154 81 M165 92 L170 86 M169 103 L175 102",brass,2.4)+generator+
        paint("M146 152 Q148 150 151 151 L155 150 L159 146 Q162 143 164 146 Q165 149 161 153 L155 158 Q150 160 146 157Z",skin,1.8)+
        line("M155 154 Q159 153 161 150","#bd8063",1.2)+
        paint("M83 125 Q75 122 71 129 L67 139 Q63 149 69 154 Q76 160 84 156 L91 150 L86 141 L81 142 L86 134Z",leather)+
        p("M68 143 Q73 148 85 143 L91 150 L84 156 Q72 160 67 152Z","#ffcf8a",ink,1.8)+
        paint("M85 146 Q94 146 103 141 L111 140 L115 147 L105 152 L88 155 Q82 154 82 151Z",skin,1.8)+
        p("M102 141 L109 138 L115 148 L108 151Z",cuff,ink,1.7)+
        paint("M110 141 Q110 137 114 136 Q117 135 119 138 L121 142 Q122 145 119 145 L116 142 L118 146 Q119 149 115 149 L111 147Z",skin,1.7);
    }
    function sora(){
      var cape=color('night'), metal=color('gold'), snow=color('snow'), skin=color('skin');
      var head=paint("M64 78 Q63 52 86 46 Q117 37 133 61 L134 80 Q141 76 142 82 Q143 89 135 94 Q132 105 113 116 Q105 121 96 117 Q79 112 70 102 Q62 102 59 94 Q54 85 60 83 Q63 82 66 86Z",skin)+
        p("M72 99 Q87 113 100 114 Q110 117 124 105 Q114 117 104 118 Q88 116 72 99Z","#e9a182")+
        line("M60 88 Q64 86 67 94 M137 85 L135 89","#bf7f68",1.5)+
        line("M79 89 Q86 82 94 86",ink,3.2)+
        p("M107 87 Q109 78 118 79 Q122 80 122 84 Q118 90 111 90Z",paper,ink,1.65)+
        c(116,84,3.7,"#666394",ink,1.15)+line("M106 85 Q112 77 121 80",ink,2.4)+
        line("M80 76 Q87 74 93 78 M108 76 Q114 71 121 72",ink,2.1)+
        line("M104 91 L107 94 L104 96","#c98571",1.6)+
        line("M98 105 Q105 108 113 101","#924b4c",2)+
        line("M75 96 L78 93 M79 98 L82 95","#ed9c8b",1.5)+
        paint("M65 89 L56 83 Q50 75 53 66 L47 70 Q47 55 59 47 L54 49 Q66 27 82 30 Q95 16 116 30 Q134 28 143 43 L138 43 Q148 55 140 74 L133 86 L129 71 L127 83 L122 68 L125 58 Q118 68 103 73 L109 58 Q95 70 82 74 L85 61 Q73 69 73 78 L68 91Z",color('silver'))+
        p("M57 58 Q68 35 87 37 Q96 27 113 32 Q96 36 88 46 Q74 45 57 58Z","#fff6e9")+
        line("M117 40 Q113 53 103 60 M133 43 Q133 52 129 58","#9d9ebd",1.8)+
        p("M63 63 L75 58 L76 61 L64 67Z",metal,ink,1.3);
      var mantle=paint("M85 114 Q108 102 121 114 Q128 130 134 151 Q139 167 152 181 Q134 186 110 177 Q88 174 65 191 Q49 200 23 191 Q34 185 42 174 L29 176 Q53 158 65 133Z",cape)+
        p("M119 119 Q121 145 116 166 Q130 178 146 180 Q130 181 111 174 L94 174Z","#373862")+
        p("M70 135 Q62 165 37 187 Q53 184 65 176 Q57 186 43 191 Q63 188 81 173Z","#7775ae")+
        line("M29 190 Q47 196 64 186 Q83 173 96 172 M126 178 Q136 181 146 180","#edc985",1.8)+
        line("M44 177 L52 174 L59 164 L65 166","#d5d5ed",1)+c(44,177,1.45,brass)+c(52,174,1.55,brass)+star(59,164,.49,brass)+c(65,166,1.35,brass);
      var legs=paint("M85 164 L105 170 Q102 182 92 193 L76 207 L63 200 L77 182Z",color('blue'))+
        paint("M98 169 L119 160 Q127 174 132 186 Q133 194 129 207 L114 208 L115 190 Q104 184 98 176Z",color('blue'))+
        line("M78 182 Q82 186 86 186 M119 188 L126 185","#557496",1.6)+
        paint("M65 193 Q71 198 81 200 L74 210 Q72 213 79 215 Q87 217 85 222 Q82 227 69 223 L51 215 Q48 212 52 206Z","#57546b")+
        p("M51 210 Q58 216 71 220 Q80 223 85 219 L85 223 Q80 227 69 224 L51 216 Q48 214 51 210Z","#c7a575",ink,1.6)+
        p("M65 192 Q73 197 82 199 L79 204 Q70 202 62 197Z","#d8b47d",ink,1.6)+
        line("M63 201 L69 204 M60 205 L66 208","#eee2c7",1.5)+
        paint("M113 196 Q122 198 132 194 L130 208 Q131 212 139 213 Q150 214 150 220 Q149 226 135 226 L114 226 Q110 225 111 221Z","#59566e")+
        p("M111 220 Q118 222 135 221 Q145 221 150 218 L150 222 Q146 227 133 227 L114 227 Q110 226 111 220Z","#d9af70",ink,1.7)+
        p("M112 195 Q122 197 133 193 L132 199 Q123 203 112 201Z","#e7bf82",ink,1.7)+
        line("M118 205 L125 204 M118 209 L125 208","#f8ecd4",1.7);
      var coat=paint("M87 117 Q103 112 121 117 L126 139 Q119 150 119 159 L125 168 Q108 174 100 174 L96 171 L93 176 L73 176 Q78 162 76 150Z",snow)+
        p("M99 142 Q99 150 95 158 L92 170 L96 168 L102 171 Q101 160 107 150Z","#b8d1d1")+
        p("M77 157 Q97 161 119 153 L120 160 Q99 168 76 164Z","#695266",ink,1.7)+
        c(83,163,8.5,metal,ink,1.7)+c(83,163,5.9,"#35566b")+star(83,163,.62,"#fff1ba")+
        paint("M85 116 Q73 120 67 136 Q63 149 68 157 Q72 162 80 158 L93 150 L87 142 L77 147 L81 133Z",snow)+
        group("translate(91 143) rotate(-27)",paint("M-9 -10 Q-9 -12 -7 -12 H7 V10 H-7 Q-9 10 -9 8Z",metal,1.7)+
          p("M-6 -10 H5 V7 H-6Z","#485982")+star(0,-3,.58,brass)+line("M-5 9 H6",paper,1))+
        paint("M80 147 Q83 143 87 141 Q90 140 90 143 L88 146 L94 144 Q98 144 96 148 L92 152 Q87 155 82 153Z",skin,1.7)+
        paint("M82 114 Q93 110 102 115 L118 109 Q128 112 131 124 L121 129 L118 136 Q107 133 102 129 Q93 131 85 126 L69 136 Q72 122 82 114Z",cape)+
        star(102,126,.83,brass);
      var sleeve=paint("M111 125 Q117 124 123 118 L126 122 L140 85 L151 91 L137 131 Q134 141 127 141 Q119 140 111 131Z",snow)+
        line("M126 122 L125 129 M127 136 Q130 137 133 132","#97b9c2",1.6)+
        p("M139 87 L141 83 L153 89 L151 94Z",cape,ink,1.7);
      // The eyecup is the optical origin; the grip follows the barrel's tilt.
      var scope=group("translate(115 81.5) rotate(-26)",
        p("M1 -3.4 H17 V3.4 H1Z",metal,ink,1.65)+
        p("M12 -5.5 H36 V5.5 H12Z",color('blue'),ink,1.9)+
        p("M31 -7 L60 -9 V9 L31 7Z",color('blue'),ink,2.1)+
        p("M29 -7 H34 V7 H29Z",metal,ink,1.55)+
        line("M38 -4 L53 -5.2","#a6d7e3",1.8)+
        p("M57 -9.3 L62 -9.8 Q66 -7 66 0 Q66 7 62 9.8 L57 9.3 Q61 0 57 -9.3Z",metal,ink,1.7)+
        p("M62 -8 Q65 -5 65 0 Q65 5 62 8 Q60 0 62 -8Z",color('sky'),ink,1.1)+
        p("M-1 -5 Q1 -6 5 -4 L5 4 Q2 6 -1 5 Q-3 1 -1 -5Z","#565471",ink,1.6)+
        paint("M18 16 Q17 12 19 8 L20 3 Q21 0 23 2 Q24 3 23 7 L27 7 L32 4 Q35 3 35 6 Q37 6 36 9 Q35 13 31 16 L26 21 Q22 21 18 16Z",skin,1.8)+
        line("M29 10 L34 7 M30 13 L34 10","#bc8070",1.05));
      return mantle+legs+coat+group("rotate(-9 99 91)",head)+sleeve+scope+
        star(170,42,.68,brass)+star(182,50,.38,"#dce9ff");
    }
    // The faces, rims and shoe details share a scale so they read in the small battle HUD.
    function oval(x,y,rx,ry,fill) {
      return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"/>';
    }
    function dyes(spec) {
      Object.keys(spec).forEach(function(k){defs+=grad(k,spec[k]);});
    }
    function storyEye(x,y,far,lookX,lookY) {
      var sx=far ? .93 : 1, lash=far ? 1 : -1;
      return group('translate('+x+' '+y+') scale('+sx+' 1)',
        p("M-12 2 C-12 -6 -7 -13 0 -13 C8 -13 12 -7 12 0 C12 9 7 14 0 14 C-7 14 -12 10 -12 2Z","#fffaf5","#9a7b85",1.05)+
        group('translate('+lookX+' '+lookY+')',
          oval(0,0,8.5,11.8,color('iris'))+oval(0,-3,5.2,6.8,"#42374a")+
          p("M-6 5 Q0 10 6 4 Q5 11 0 11 Q-4 11 -6 5Z",color('gleam'))+
          oval(-3.4,-5.8,3.6,4.1,"#fffef6")+c(4,3,1.75,"white")+c(-2.4,8,.95,"#fff7d5"))+
        p("M-12 2 C-13 -8 -6 -14 1 -14 Q10 -14 12 -5 Q7 -12 0 -11 C-7 -11 -10 -5 -12 2Z","#533d50")+
        group('scale('+lash+' 1)',line("M9 -8 Q13 -8 14 -11 M11 -5 Q14 -5 15 -7","#533d50",1.6)));
    }
    function storyFace(mood) {
      var sunny=mood==="wink",toward=mood==="wonder" ? 2.3 : 1;
      var gazeY=mood==="stars" ? -1.4 : mood==="wonder" ? 1 : 0;
      var skin=color('complexion');
      return p("M54 88 C53 62 68 44 96 43 C126 40 146 61 148 87 L148 98 Q157 91 159 100 Q161 110 148 114 C144 130 127 140 103 141 C82 141 64 133 58 118 Q44 118 43 108 Q42 99 51 100 L55 103Z",skin,"#78575b",2.1)+
        line("M48 106 Q53 102 55 110 M152 102 Q156 99 156 103","#ca9087",1.3)+
        oval(69,117,8,4.2,color('blush'))+oval(136,115,7,4,color('blush'))+
        line("M65 118 l2 -3 m2 3 l2 -3 M134 116 l2 -3 m1 3 l2 -3","#df9291",1)+
        (sunny ? line("M70 102 Q79 91 89 101 M71 100 l-3 -2","#603e4c",3.1) :
          storyEye(81,100,false,toward,gazeY))+
        storyEye(122,98,true,toward,gazeY)+
        line(sunny?"M73 85 Q81 81 88 86":"M74 82 Q80 78 87 81","#976c71",1.55)+
        line("M117 79 Q123 75 130 79","#976c71",1.55)+
        p("M102 111 Q105 109 106 112 Q104 114 102 112Z","#d89988")+
        (sunny ? p("M94 121 Q103 124 114 117 Q115 128 106 131 Q99 132 94 124Z","#853e51","#75424e",1.45)+p("M98 122 Q105 123 111 120 Q108 125 100 125Z",paper)+p("M101 129 Q105 125 110 127 Q106 131 101 129Z","#f39a99")+
          c(68,113,1,"#bc8a70")+c(72,111,1,"#bc8a70")+c(135,110,1,"#bc8a70") :
          mood==="wonder" ? p("M99 121 Q102 118 105 120 Q109 123 106 126 Q102 129 99 125 Q98 123 99 121Z","#b66c75","#925965",1.2)+p("M101 126 Q103 123 106 124 Q105 127 101 126Z","#ffb9ac") :
          line("M97 121 Q102 126 109 120","#a56573",1.85));
    }
    function softBoot(x,y,angle,flip,upper,trim) {
      return group('translate('+x+' '+y+') rotate('+angle+') scale('+(flip?-1:1)+' 1)',
        paint("M-9 -12 Q-1 -10 8 -13 L9 -1 Q9 1 14 2 C24 2 25 11 18 14 Q9 18 -8 15 Q-12 14 -12 9Z",upper,1.95)+
        p("M-11 9 Q0 14 14 10 L22 8 Q23 13 17 15 Q7 18 -9 15 Q-12 14 -11 9Z","#fff1d7",ink,1.25)+
        p("M-9 -12 Q0 -10 8 -13 L9 -8 Q1 -5 -10 -8Z",trim,ink,1.1)+
        line("M0 -3 l6 -1 M1 1 l6 -1","#fff7db",1.55)+line("M15 4 l3 1","#fff9ed",1.45));
    }
    function ribbon(x,y,s,angle,f,highlight) {
      return group('translate('+x+' '+y+') rotate('+angle+') scale('+s+')',
        paint("M-2 -1 C-7 -6 -15 -9 -15 -4 Q-17 1 -13 7 Q-8 8 -2 3 Q-7 9 -6 13 L0 9 L3 13 Q5 8 3 3 Q11 8 15 4 Q17 -1 15 -6 Q13 -9 3 -2Z",f,1.65)+
        line("M-11 -3 L-5 0 M6 0 L12 -3",highlight,1.35)+oval(0,0,3.6,3.8,highlight));
    }
    function mio() {
      ink="#40595f";
      dyes({complexion:["#fff3df","#ffdfc7","#f7c3ac"],blush:["#ffcbc4","#f2a8a8"],iris:["#263f55","#307985","#83dec8"],gleam:["#66ddcb","#c5f9d9"],sea:["#d2f2dc","#7fcabc","#428f95","#356b77"],deepSea:["#89c9ba","#529c98","#346a76"],milk:["#fffff1","#f5f6e9","#bbdcd8"],mint:["#abebd6","#66c4b7","#408c93"]});
      var sea=color('sea'),mint=color('mint'),white=color('milk'),skin=color('complexion'),deep=color('deepSea');
      function knot(x,y,s,dir) {
        return group('translate('+x+' '+y+') rotate('+dir+') scale('+s+')',
          paint("M-20 6 Q-25 -6 -17 -15 Q-13 -22 -4 -20 Q7 -26 16 -17 Q26 -12 22 0 Q27 11 15 18 Q8 24 -2 20 Q-15 23 -20 12Z",sea,2.15)+
          line("M-14 4 Q-14 -7 -3 -10 Q8 -13 11 -4 M-2 12 Q11 12 15 4","#589c9c",1.65)+
          p("M-16 -8 Q-10 -18 0 -16 Q-6 -14 -10 -9 Q-14 -5 -16 -8Z","#d6f3de"));
      }
      var hairBack=paint("M48 88 Q43 41 91 35 Q138 29 150 72 Q154 89 150 101 Q148 113 157 116 Q149 129 135 128 Q124 142 106 132 L77 133 Q59 142 49 132 Q34 134 32 124 Q43 125 42 115 Q34 103 40 92Z",deep)+
        knot(47,56,.92,-21)+knot(143,48,.84,17);
      var fringe=paint("M46 91 C38 65 49 46 68 40 Q83 28 102 32 Q127 25 144 45 Q158 59 150 82 Q147 96 150 107 Q153 113 157 111 Q153 121 144 119 Q134 116 136 100 Q140 81 130 69 Q132 83 121 84 Q111 86 106 74 Q105 87 97 87 Q86 87 87 74 Q79 88 69 86 Q61 86 64 77 Q54 87 59 105 Q63 118 54 124 Q49 128 44 122 Q50 122 48 116 Q42 105 46 91Z",sea,2.2)+
        p("M56 58 Q72 40 88 41 Q75 46 72 52 Q64 50 56 58Z","#dff7e5")+
        p("M81 43 Q98 33 112 38 Q119 36 127 40 Q114 40 108 44 Q95 41 81 47Z","#dff7e5")+
        line("M80 54 Q76 64 70 68 M117 52 Q122 58 122 65 M49 100 Q48 109 53 115","#78b8b0",1.55);
      var clip=group("translate(51 71) rotate(-18)",
        [0,72,144,216,288].map(function(a){return group('rotate('+a+')',p("M0 0 Q-6 -4 -3 -8 Q1 -12 4 -7 Q7 -3 0 0Z","#fff6d8","#ac9480",.8));}).join("")+
        c(0,0,3.1,"#efb856")+p("M8 4 L11 -1 L14 4 L11 9Z","#adf8e1",ink,1.1));
      var legs=paint("M81 170 Q92 166 103 178 L93 200 L88 211 L75 209 L78 193Z","#566f80",1.9)+
        paint("M99 174 Q112 166 120 174 L122 196 L121 212 L107 213 L104 194Z","#58788b",1.9)+
        softBoot(81,212,7,true,deep,"#b5ead5")+softBoot(115,213,-3,false,deep,"#b5ead5");
      var outfit=paint("M76 136 Q95 127 114 136 L121 149 L117 162 Q126 171 130 183 Q120 189 109 185 Q100 191 89 187 Q79 190 66 184 Q70 173 77 161Z",mint)+
        line("M86 169 Q82 177 80 183 M106 172 L111 182","#40898c",1.5)+
        paint("M79 133 Q89 128 95 135 Q96 148 90 164 L82 182 Q69 189 60 180 Q68 165 68 149Z",white)+
        paint("M108 134 Q120 130 128 140 L124 158 Q126 174 136 179 Q131 187 119 183 Q106 176 104 162Z",white)+
        p("M71 171 L81 172 Q79 181 72 179Z","#dcf1e5","#679697",1.1)+
        paint("M83 135 Q92 130 101 135 Q110 130 119 135 Q115 144 104 145 Q93 148 83 135Z","#fffde8",1.5)+
        ribbon(101,143,.63,-6,mint,"#e3f9d6");
      var sample=group("translate(124 162) rotate(3) scale(.94 .83)",
        paint("M-10 -4 L-13 -14 L-10 -19 L-4 -16 L1 -5Z","#7ac9cb",1.3)+
        paint("M-3 -3 L-5 -22 L1 -30 L8 -24 L7 -6 L2 0Z","#c4ffea",1.5)+
        p("M1 -28 L2 -19 L7 -23 L6 -6 L2 -2Z","#60bdb9")+
        line("M-4 -21 L2 -18 L7 -23","#69b7b6",.9)+
        paint("M4 -5 L9 -16 L15 -18 L16 -12 L11 -3Z","#8fe3cc",1.1)+
        paint("M-16 -5 Q-8 -6 -2 -3 Q4 -7 8 -4 L14 -5 L18 -2 Q14 3 1 4 Q-11 4 -16 0Z","#9faea7",1.25));
      var loupe=group("translate(164 99) rotate(24)",
        paint("M-2 12 H3 L4 28 Q1 33 -3 28Z",deep,1.6)+c(0,0,14.2,"#f8d595",ink,1.9)+
        c(0,0,11.6,"#c7ede0","#72a8a6",1.1)+p("M-9 1 Q-8 -8 0 -9 L3 -8 L-6 3Z","#f7fff2")+line("M4 6 L8 1","white",1.6));
      return hairBack+legs+outfit+
        paint("M121 139 Q129 134 137 141 L147 124 L155 129 Q150 150 140 155 Q130 157 122 150Z",white)+
        group("rotate(4 100 109)",storyFace('wonder')+fringe+clip)+
        loupe+paint("M147 129 Q144 126 147 122 Q150 117 153 118 Q155 119 153 123 Q156 120 158 122 Q158 127 152 131Z",skin,1.5)+
        paint("M77 141 Q66 137 62 149 Q57 158 64 165 Q72 174 91 171 L104 167 L103 158 L85 159Z",white)+
        p("M98 158 L105 156 L109 166 L102 170Z",mint,ink,1.2)+
        paint("M105 159 Q110 155 113 156 L118 159 Q128 161 139 156 Q143 155 143 158 Q141 164 131 167 L117 171 Q111 171 106 167Z",skin,1.5)+
        sample+star(144,133,.53,"#f7e7b0")+star(179,79,.39,"#bef2dd");
    }
    function ritsu() {
      ink="#604553";
      dyes({complexion:["#ffebcd","#f6ceaa","#eeb18f"],blush:["#ffc2ae","#f2a193"],iris:["#594366","#aa6450","#e7a44a"],gleam:["#ffc966","#ffedac"],apricot:["#ffd7a3","#f3a775","#d57860","#965865"],rust:["#f6b68a","#da886a","#ad6470"],jacket:["#ffdd93","#ffb367","#ef9063"],denim:["#63899a","#42677f","#35475f"]});
      var hair=color('apricot'),rust=color('rust'),jacket=color('jacket'),denim=color('denim'),skin=color('complexion'),yellow="#ffe29b";
      var pony=paint("M126 42 Q130 27 145 25 Q158 17 171 27 Q185 33 183 46 Q192 57 184 70 Q181 77 175 79 Q181 86 186 82 Q184 95 169 95 Q154 97 148 85 Q136 79 142 65 Q148 57 139 52Z",hair,2.35)+
        p("M145 32 Q157 22 168 30 Q177 33 178 43 Q172 37 165 39 Q158 31 145 35Z","#ffe0b0")+
        line("M170 47 Q182 53 173 65 Q165 75 172 80 M151 75 Q149 84 158 87","#d58975",1.7);
      var fringe=paint("M50 95 Q38 82 47 63 Q44 49 63 39 Q72 24 92 29 Q104 19 121 28 Q137 27 144 41 Q159 47 153 66 Q158 83 147 96 Q138 102 134 105 Q134 97 138 86 Q139 80 132 71 Q131 80 123 84 Q124 77 121 73 Q117 85 103 85 Q109 79 108 68 Q97 82 84 85 Q86 79 87 74 Q78 85 68 86 Q60 90 61 104 Q54 102 53 96 L50 99Z",hair,2.3)+
        p("M57 57 Q66 38 85 37 Q80 39 77 46 Q68 44 57 57Z","#ffe5b5")+
        p("M88 36 Q101 26 115 31 Q124 30 130 36 Q115 34 108 39 Q101 35 88 40Z","#ffe5b5")+
        line("M96 48 Q95 60 88 65 M141 59 Q148 66 143 77","#da947a",1.5)+
        line("M68 57 Q74 49 79 47 M116 40 l4 -1","#ffdda8",1.65)+
        p("M48 69 Q74 48 127 45 Q139 43 148 47 L149 54 Q132 49 113 53 Q76 57 50 77Z","#fbe2a1",ink,1.45)+
        p("M59 65 l4 -3 3 3 -5 3Z M75 57 l5 -2 2 3 -5 2Z M92 52 l5 -1 1 3 -5 1Z","#efa97e");
      var kerchief=group("translate(136 46) rotate(10)",
        paint("M0 0 Q-12 -6 -13 -18 Q-12 -21 -7 -18 Q2 -12 3 -3 Q10 -16 22 -14 Q21 -4 7 2Z",yellow,1.75)+
        line("M-8 -14 L0 -5 M8 -3 L17 -10","#dda15f",1.3)+c(2,0,4.1,jacket,ink,1.3));
      var legs=paint("M81 170 L103 175 L89 199 Q83 208 77 205 L58 194 L65 183 L78 189Z",denim,2.1)+
        p("M65 186 L81 195 L85 192 L81 201 L61 191Z","#7293a1")+
        softBoot(57,192,61,true,jacket,"#fff1c4")+
        paint("M98 169 L118 169 Q125 183 122 192 L117 211 L103 211 L105 190Z",denim,2)+
        softBoot(110,213,1,false,jacket,"#fff1c4");
      var bib=paint("M78 134 Q97 126 117 133 Q127 135 131 150 L123 159 L128 174 Q107 183 79 177 L69 170 L73 147Z",jacket)+
        p("M77 143 L84 137 L91 149 L111 147 L117 135 L124 140 L117 155 L121 175 Q103 182 77 176 L79 159Z",denim,ink,1.7)+
        p("M83 133 L90 132 L97 151 L89 153Z","#64899b",ink,1.3)+
        p("M113 134 L120 135 L111 154 L105 153Z","#64899b",ink,1.3)+
        c(92,152,2.3,yellow,ink,.9)+c(109,152,2.2,yellow,ink,.9)+
        p("M88 156 L111 155 L109 165 Q103 172 92 167Z","#5c8093","#435168",1.35)+
        line("M91 159 l1 4 m2 3 l3 1 M106 164 l1 -3","#acc4bd",.8)+
        p("M100 157 L96 162 H100 L99 166 L106 159 H102 L104 157Z",yellow)+
        paint("M68 165 L82 167 L81 178 Q74 183 66 177Z","#ce8863",1.6)+line("M69 169 l10 1","#ffdc9d",1.25);
      var prop=group("translate(30 103) rotate(-25)",
        paint("M-4 3 L5 3 L6 29 Q1 32 -4 28Z","#83bbbb",1.8)+
        p("M-6 3 H6 L7 12 Q1 16 -6 12Z","#557585",ink,1.4)+line("M-3 8 H3 M-2 11 H3","#c0e5d8",1)+
        [0,120,240].map(function(a){return group('rotate('+a+')',
          paint("M-2 -2 Q-12 -7 -13 -18 Q-14 -24 -8 -25 Q-3 -27 -1 -21 Q0 -12 4 -8 Q7 -3 2 0Z","#9de2de",1.6)+
          line("M-9 -20 Q-10 -16 -6 -11","#eaffed",1.65));}).join("")+c(0,0,6.1,jacket,ink,1.6)+c(0,0,2.15,"#fff3b3"));
      var peace=paint("M120 139 Q127 136 133 147 L141 142 L148 129 L156 135 L150 153 Q147 161 139 163 Q130 163 121 156Z",jacket)+
        p("M146 133 L151 126 L161 133 L157 140Z","#fff2c5",ink,1.4)+
        paint("M150 131 Q145 126 147 120 Q148 117 151 119 L153 122 L153 112 Q153 108 156 108 Q159 109 158 119 L164 111 Q167 108 169 111 Q169 114 163 123 Q168 122 166 126 L160 133 Q156 137 152 134Z",skin,1.55)+line("M154 125 Q157 122 161 124","#c78873",1.2);
      return legs+bib+peace+group("rotate(-5 102 112)",pony+storyFace('wink')+fringe+kerchief)+
        line("M41 130 C34 145 34 163 43 164 Q52 165 55 157 Q58 152 64 164 L68 170",ink,2.6)+
        line("M41 130 C34 145 34 163 43 164 Q52 165 55 157 Q58 152 64 164 L68 170","#d9aa75",1.25)+
        paint("M80 137 Q72 134 65 144 L60 150 L47 130 L39 135 L53 160 Q59 169 67 163 L83 149Z",jacket)+
        p("M38 132 L47 127 L53 134 L42 142Z","#fff2c5",ink,1.45)+prop+
        paint("M40 135 Q37 131 38 127 Q38 123 41 121 Q44 120 44 123 L44 127 Q48 122 51 125 Q52 128 48 133 Q45 138 40 135Z",skin,1.5)+
        line("M9 90 Q12 84 18 80 M44 120 Q52 119 55 116","#ffe5a3",1.7);
    }
    function nagi() {
      ink="#584c70";
      dyes({complexion:["#fff4e4","#ffe1cf","#f3c2b2"],blush:["#fed0ce","#ecadba"],iris:["#443757","#7a65a6","#aa95cf"],gleam:["#acb4f2","#ffe5cb"],lilac:["#f4e5f3","#d8c6e6","#b6a6d3","#9184b4"],violet:["#d3c4e4","#b4a1d1","#887caf"],velvet:["#9e9bce","#706b9f","#504f7b"],pearl:["#fcf6f1","#e8e6f1","#c5c4df"]});
      var lilac=color('lilac'),violet=color('violet'),velvet=color('velvet'),pearl=color('pearl'),skin=color('complexion'),gold="#f7da99";
      var waves=paint("M57 55 Q84 29 115 40 Q145 41 152 66 Q161 89 152 108 Q146 125 161 132 Q179 141 171 156 Q168 163 160 165 Q169 152 157 150 Q163 163 149 171 Q145 182 128 178 Q132 173 128 167 L76 163 Q64 176 50 165 Q36 171 28 160 Q23 153 29 146 Q29 158 38 157 Q30 149 35 139 Q38 132 47 127 Q52 122 47 112 Q36 81 57 55Z",lilac,2.25)+
        p("M54 100 Q59 118 53 129 Q49 136 42 140 Q36 145 40 150 Q40 144 49 141 Q66 132 62 112Z","#dcd0e8")+
        line("M51 149 Q62 146 64 136 M153 136 Q165 140 165 147 M145 147 Q147 157 139 163","#aa93be",1.65);
      var fringe=paint("M53 94 Q45 67 61 51 Q74 36 97 40 Q125 34 143 53 Q158 68 148 88 Q143 100 148 108 Q152 114 156 109 Q156 120 147 122 Q135 123 134 108 Q132 98 139 85 L133 80 Q127 86 118 83 Q123 78 123 70 Q116 83 108 84 Q101 85 100 81 Q103 76 103 71 Q95 86 84 85 Q78 84 81 80 Q74 85 66 83 Q59 90 64 105 Q69 119 60 125 Q54 130 47 124 Q56 123 55 117 Q47 110 53 94Z",lilac,2.1)+
        p("M67 66 Q73 54 88 50 Q81 56 79 62 Q73 61 67 66Z","#fff4ed")+p("M92 50 Q108 43 119 49 Q108 48 100 55Z","#fff6ee")+
        line("M92 62 Q90 69 85 72 M133 58 Q138 66 136 72","#bcabcd",1.45);
      var hat=group("rotate(-10 103 54)",
        paint("M48 59 Q36 52 44 40 Q54 25 78 24 Q89 15 109 17 Q138 15 150 31 Q163 41 153 53 Q148 61 133 61 Q110 51 80 60 Q57 70 48 59Z",velvet,2.3)+
        p("M51 48 Q58 30 81 29 Q99 19 113 24 Q92 25 84 33 Q65 34 51 48Z","#bfb9dc")+
        paint("M52 56 Q85 38 119 44 Q134 45 145 51 L142 59 Q118 50 95 52 Q75 54 56 63Z","#70658f",1.65)+
        line("M58 58 Q79 48 97 48 M126 49 l12 4","#ecd7aa",1.3)+
        p("M57 37 Q61 32 66 33 Q59 42 67 47 Q72 50 78 45 Q75 56 65 55 Q52 52 54 43 Q54 39 57 37Z",gold,"#8c7083",1.35)+
        star(76,36,.58,"#ffecb0")+c(81,42,1.1,"#fff1ce")+
        line("M126 28 l7 6 7 -1","#e6d8dd",.8)+c(126,28,1.3,"#ffedc5")+star(133,34,.32,"#ffedc5")+c(140,33,1.1,"#ffedc5"));
      var legs=paint("M82 176 L102 177 L96 198 L94 212 L81 213 L81 197Z","#8a88a8",1.8)+
        paint("M104 176 L120 171 L124 190 L129 207 L116 212 L108 195Z","#9992b0",1.8)+
        softBoot(88,212,0,true,velvet,gold)+softBoot(125,210,-9,false,velvet,gold);
      var cape=paint("M76 135 Q99 121 120 133 Q135 142 138 159 Q143 175 160 181 Q151 189 141 184 Q132 193 119 185 Q93 180 77 187 Q69 195 57 188 Q44 194 30 186 Q47 178 49 163 Q54 147 76 135Z",velvet,2.1)+
        p("M67 145 Q60 166 43 183 Q54 181 59 175 Q59 182 54 185 Q66 182 76 169Z","#a49ac4")+
        line("M37 186 Q46 188 54 185 M123 181 Q134 188 141 181 Q149 185 154 182","#e7cfa7",1.3)+
        line("M47 179 l8 -5 4 -9 7 2 4 -8","#d5c9df",1)+c(47,179,1.3,gold)+c(55,174,1.2,paper)+star(59,165,.46,gold)+c(66,167,1.3,paper)+star(70,159,.38,gold)+
        line("M134 167 l3 6 9 3","#d5c9df",.85)+c(134,167,1.1,paper)+star(137,173,.47,gold)+c(146,176,1.25,paper);
      var coat=paint("M81 136 Q99 129 116 135 Q128 141 124 155 L118 165 Q123 175 132 181 Q130 187 118 186 Q111 192 101 187 Q91 192 82 187 Q72 190 67 183 Q77 168 76 156Z",pearl,1.95)+
        line("M105 154 L100 179 M75 183 Q83 185 88 182 M111 184 Q119 186 123 183","#b5a7c8",1.3)+
        c(103,159,1.6,gold,ink,.8)+c(102,167,1.6,gold,ink,.8)+
        paint("M77 133 Q88 127 100 133 Q113 126 124 133 L131 145 Q121 153 110 149 L101 154 Q89 152 85 147 Q76 150 69 147Z",velvet,1.85)+
        ribbon(104,148,.61,-5,"#e0cce6","#fff2c9");
      var pointing=paint("M119 140 Q127 136 134 145 L142 133 L149 117 L160 121 L150 146 Q145 158 136 159 Q125 158 121 151Z",pearl,1.85)+
        p("M148 118 L151 113 L162 118 L160 126Z","#d7c4e2",ink,1.35)+
        paint("M151 116 Q148 112 150 107 Q152 102 155 104 L157 107 L162 96 Q164 91 167 93 Q170 95 166 103 L163 109 Q168 105 169 108 Q170 113 161 120 Q155 121 151 116Z",skin,1.5)+line("M156 112 Q158 109 161 109","#cd9890",1.2);
      var dial=group("translate(76 154) rotate(-13)",
        c(0,0,16.8,gold,ink,1.8)+c(0,0,13.6,"#f5e3bb",ink,1.2)+
        Array.from({length:12},function(_,i){return group('rotate('+i*30+')',line("M0 -15.6 V-14.4","#927d89",.85));}).join("")+
        paint("M-11 2 Q-9 -9 1 -10 Q11 -10 12 -1 Q11 8 2 9 Q-8 10 -11 2Z","#59628d",1)+
        line("M-8 3 L-4 -3 L1 0 L6 -5 L9 -3","#bcd7eb",.9)+
        c(-8,3,.95,paper)+c(-4,-3,1.3,gold)+c(1,0,1.1,paper)+star(6,-5,.4,gold));
      return waves+cape+legs+coat+
        group("rotate(-4 100 112)",storyFace('stars')+fringe+hat)+pointing+
        paint("M78 141 Q70 139 64 148 Q56 160 62 166 Q68 174 83 170 L89 165 L82 155 L73 157 L80 149Z",pearl,1.85)+
        dial+paint("M64 166 Q62 162 65 159 Q68 157 71 162 L77 162 Q81 160 82 163 Q81 168 73 171 Q67 173 64 166Z",skin,1.45)+
        star(174,82,.84,"#ffdf91")+star(180,94,.36,"#f0e3ff");
    }
    var portraits={aoi:aoi,jin:jin,sora:sora,mio:mio,ritsu:ritsu,nagi:nagi};
    var art=portraits[key]();
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" data-hero-id="'+key+'" role="img" aria-label="'+title+'"><title>'+title+'</title><defs>'+defs+'</defs>'+footShadow+'<g stroke-linecap="round" stroke-linejoin="round">'+art+'</g></svg>';
  }
  window.RikaHeroStudies = {characters:characters, render:render};
})();
