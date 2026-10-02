(function () {
  function render(question) {
    if (question.diagramKey === 'table') {
      var data = question.diagramData;
      if (!data || !Array.isArray(data.headers) || !Array.isArray(data.rows)) return '';
      var f = window.RikaUI.renderFurigana;
      return '<div class="question-data"><table><caption>' + (data.fictional ? '練習用の架空の記録' : '観察の記録') + '</caption><thead><tr>' + data.headers.map(function (x) { return '<th scope="col">' + f(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + data.rows.map(function (row) { return '<tr>' + row.map(function (x,i) { return i ? '<td>' + f(x) + '</td>' : '<th scope="row">' + f(x) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    if (question.diagramKey === 'meniscus') {
      return '<figure class="question-diagram"><svg viewBox="0 0 360 180" role="img" aria-label="水面がへこんでいるメスシリンダーの拡大図。水面の最も低い位置と、右の目を同じ高さにそろえる。"><path d="M55 20V160H190V20" fill="#e5faff" stroke="#326078" stroke-width="3"/><path d="M57 65Q122 100 188 65V157H57Z" fill="#82e1ef"/><path d="M57 65Q122 100 188 65" fill="none" stroke="#177b98" stroke-width="3"/><path d="M60 83H300" stroke="#855b14" stroke-width="2" stroke-dasharray="5 5"/><path d="M272 83Q288 64 306 83Q288 102 272 83Z" fill="#fff" stroke="#326078" stroke-width="2"/><circle cx="289" cy="83" r="7" fill="#326078"/><path d="M168 45H188M178 55H188M168 65H188M178 75H188M168 85H188M178 95H188M168 105H188M178 115H188M168 125H188" stroke="#326078" stroke-width="2"/><text x="224" y="126" fill="#2a2350" font-size="16">同じ高さで読む</text></svg><figcaption>水面のいちばん低いところ</figcaption></figure>';
    }
    return '';
  }
  window.RikaDiagrams = { render: render };
})();
