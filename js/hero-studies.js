(function () {
  "use strict";
  var seq = 0;
  var characters = [
    { id: "aoi", name: "アオイ", specialty: "結晶研究" },
    { id: "jin", name: "ジン", specialty: "電気工作" },
    { id: "sora", name: "ソラ", specialty: "星空観測" }
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
    function face(shade,smile,wink) {
      return paint("M64 76 Q61 49 88 44 Q115 38 134 61 L134 81 Q141 74 143 82 Q144 90 135 95 Q131 108 112 117 Q103 121 96 117 Q80 113 71 103 Q63 102 59 94 Q54 85 60 83 Q63 82 66 86Z",color('skin')) +
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
    var art=key==='aoi'?aoi():key==='jin'?jin():sora();
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" data-hero-id="'+key+'" role="img" aria-label="'+title+'"><title>'+title+'</title><defs>'+defs+'</defs>'+footShadow+'<g stroke-linecap="round" stroke-linejoin="round">'+art+'</g></svg>';
  }
  window.RikaHeroStudies = {characters:characters, render:render};
})();
