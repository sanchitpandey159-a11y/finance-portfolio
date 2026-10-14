/* Portfolio behaviour: mobile menu, resume preview, photo fallback, reveal, GQI charts. */
(function () {
  document.documentElement.classList.add('js');

  // Mobile menu
  var btn = document.getElementById('menuBtn'), nav = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu';
    });
  });

  // Photo fallback: shows initials if assets/images/professional-photo.jpg is missing
  var photo = document.getElementById('profilePhoto'), fb = document.getElementById('photoFallback');
  function noPhoto() { photo.style.display = 'none'; fb.hidden = false; }
  photo.addEventListener('error', noPhoto);
  if (photo.complete && photo.naturalWidth === 0) noPhoto();

  // Resume preview (iframe loads only when opened)
  var pBtn = document.getElementById('previewBtn'), pBox = document.getElementById('previewBox');
  pBtn.addEventListener('click', function () {
    var show = pBox.hidden;
    pBox.hidden = !show;
    pBtn.setAttribute('aria-expanded', String(show));
    pBtn.textContent = show ? 'Hide preview' : 'Preview here';
    var f = pBox.querySelector('iframe');
    if (show && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src);
  });

  // Scroll reveal
  var els = document.querySelectorAll('.card,.metric,.tl-item,.section-head,.contact-card,.corr-card');
  els.forEach(function (e) { e.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); } });
    }, { threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  } else els.forEach(function (e) { e.classList.add('visible'); });

  /* Project data: from Project_cip.xlsx (GQI + Ratios sheets). Edit here if figures change. */
  var years = ['FY20–21', 'FY21–22', 'FY22–23', 'FY23–24', 'FY24–25'];
  var totals = [55.00, 75.77, 78.46, 77.68, 81.41];
  var dims = [
    ['Board Independence', 20, [0, 10, 10, 9.33, 7.69]],
    ['Board Diversity', 15, [0, 0.83, 0.71, 0.67, 7.31]],
    ['Board Activity', 15, [15, 15, 15, 15, 15]],
    ['Attendance', 10, [10, 9.94, 9.75, 9.68, 9.74]],
    ['Audit Committee Quality', 20, [10, 20, 18, 18, 16.67]],
    ['CSR Compliance', 15, [15, 15, 15, 15, 15]],
    ['Disclosure & Transparency', 10, [5, 5, 10, 10, 10]]
  ];
  var indep = [0, 6, 7, 7, 5], board = [7, 12, 14, 15, 13];
  var f2 = function (n) { return (Math.round(n * 100) / 100).toFixed(2); };

  // Year explorer
  var tabs = document.getElementById('yearTabs'), list = document.getElementById('dimList');
  var tot = document.getElementById('exTotal'), sub = document.getElementById('exSub'), note = document.getElementById('exNote');
  function show(i) {
    tabs.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    list.innerHTML = dims.map(function (d) {
      var v = d[2], diff = i ? v[i] - v[i - 1] : 0;
      var delta = i && Math.abs(diff) >= 0.005 ? '<em class="' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '+' : '−') + f2(Math.abs(diff)) + '</em>' : '';
      return '<div class="dim"><span class="name">' + d[0] + '</span><div class="track"><div class="fill" style="width:' + (v[i] / d[1] * 100) + '%"></div></div><span class="val">' + f2(v[i]) + ' / ' + d[1] + delta + '</span></div>';
    }).join('');
    tot.innerHTML = f2(totals[i]) + '<small> / 105</small>';
    sub.textContent = years[i] + ' · ' + indep[i] + ' of ' + board[i] + ' directors independent';
    if (!i) { note.textContent = 'Baseline year: no independent directors on the board; Audit Committee and Disclosure scores were still low.'; return; }
    var ch = dims.map(function (d) { return [d[0], d[2][i] - d[2][i - 1]]; })
      .filter(function (x) { return Math.abs(x[1]) >= 1; })
      .sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]); }).slice(0, 3);
    var dt = totals[i] - totals[i - 1];
    var t = (dt >= 0 ? '+' : '−') + f2(Math.abs(dt)) + ' points vs ' + years[i - 1] + '.';
    if (ch.length) t += ' Biggest movers: ' + ch.map(function (x) { return x[0] + ' (' + (x[1] > 0 ? '+' : '−') + f2(Math.abs(x[1])) + ')'; }).join(', ') + '.';
    if (i === 1) t += ' The rise coincided with the first independent-director appointments; it is an association, not proof of cause.';
    if (i === 4) t += ' Independent directors fell from 7 to 5, while Board Diversity rose.';
    note.textContent = t;
  }
  years.forEach(function (y, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = y;
    b.addEventListener('click', function () { show(i); }); tabs.appendChild(b);
  });

  /* ---------- Charts: SVG generated from the project data above ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(tag, attrs, parent, s) { var e = el(tag, attrs, parent); e.textContent = s; return e; }

  // 1) GQI trend: line + area, with hover/focus tooltip
  (function () {
    var host = document.getElementById('gqiLine'), tip = document.getElementById('gqiTip');
    if (!host) return;
    var W = 480, H = 270, L = 40, R = 22, T = 34, B = 34, lo = 45, hi = 90, n = totals.length;
    var x = function (i) { return L + 20 + i * (W - L - R - 40) / (n - 1); };
    var y = function (v) { return T + (hi - v) / (hi - lo) * (H - T - B); };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'chart-svg', role: 'img',
      'aria-label': 'Line chart of the Governance Quality Index: ' + years.map(function (yr, i) { return yr + ' ' + f2(totals[i]); }).join(', ') });
    var defs = el('defs', {}, svg), g = el('linearGradient', { id: 'gqiFill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': '#d7f078', 'stop-opacity': 0.38 }, g);
    el('stop', { offset: '100%', 'stop-color': '#d7f078', 'stop-opacity': 0 }, g);
    [45, 60, 75, 90].forEach(function (v) {
      el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), 'class': 'grid' }, svg);
      txt('text', { x: L - 10, y: y(v) + 4, 'class': 'axis', 'text-anchor': 'end' }, svg, v);
    });
    var pts = totals.map(function (v, i) { return x(i) + ',' + y(v); });
    el('path', { d: 'M' + x(0) + ',' + y(lo) + ' L' + pts.join(' L') + ' L' + x(n - 1) + ',' + y(lo) + ' Z', fill: 'url(#gqiFill)', 'class': 'area pop' }, svg);
    el('path', { d: 'M' + pts.join(' L'), 'class': 'line', pathLength: 1 }, svg);
    var pop = el('g', { 'class': 'pop' }, svg);
    totals.forEach(function (v, i) {
      txt('text', { x: x(i) + (i ? 0 : 6), y: i ? y(v) - 16 : y(v) + 28, 'class': 'val' }, pop, f2(v));
      txt('text', { x: x(i), y: H - 8, 'class': 'axis', 'text-anchor': 'middle' }, pop, years[i].replace('FY', 'FY').replace('–', '–'));
      var c = el('circle', { cx: x(i), cy: y(v), r: 6, 'class': 'dot', tabindex: 0, 'aria-label': years[i] + ': ' + f2(v) + ' out of 105' }, pop);
      var showTip = function () {
        var d = i ? v - totals[i - 1] : 0;
        tip.innerHTML = years[i] + ' · <b>' + f2(v) + '</b>' + (i ? ' <span style="color:' + (d >= 0 ? '#17663f' : '#a12b2b') + '">' + (d >= 0 ? '+' : '−') + f2(Math.abs(d)) + '</span>' : '');
        tip.style.left = (x(i) / W * 100) + '%'; tip.style.top = (y(v) / H * 100) + '%'; tip.hidden = false;
      };
      c.addEventListener('mouseenter', showTip); c.addEventListener('focus', showTip);
      c.addEventListener('mouseleave', function () { tip.hidden = true; }); c.addEventListener('blur', function () { tip.hidden = true; });
    });
    host.insertBefore(svg, tip);
  })();

  // 2) Governance profile radar: FY21 vs FY25 (each dimension as % of its maximum)
  (function () {
    var host = document.getElementById('radar'); if (!host) return;
    var names = ['Board independence', 'Board diversity', 'Board activity', 'Attendance', 'Audit committee', 'CSR compliance', 'Disclosure'];
    var W = 380, H = 340, cx = 190, cy = 172, Rr = 112, n = dims.length;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
    var P = function (i, f) { return [cx + Math.cos(ang(i)) * Rr * f, cy + Math.sin(ang(i)) * Rr * f]; };
    var svg = el('svg', { viewBox: '-50 0 ' + (W + 100) + ' ' + H, 'class': 'chart-svg light' });
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      el('polygon', { points: dims.map(function (d, i) { return P(i, f).join(','); }).join(' '), 'class': 'grid' }, svg);
    });
    dims.forEach(function (d, i) {
      var p = P(i, 1), q = P(i, 1.14);
      el('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], 'class': 'spoke' }, svg);
      var c = Math.cos(ang(i));
      txt('text', { x: q[0], y: q[1] + 4, 'class': 'lbl', 'text-anchor': c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle' }, svg, names[i]);
    });
    [[0, '#cf9b46', 0.14, '5 4'], [4, '#126f68', 0.22, '']].forEach(function (s) {
      var pts = dims.map(function (d, i) { return P(i, d[2][s[0]] / d[1]).join(','); }).join(' ');
      var g = el('g', { 'class': 'pop' }, svg);
      el('polygon', { points: pts, fill: s[1], 'fill-opacity': s[2], stroke: s[1], 'stroke-width': 2.5, 'stroke-dasharray': s[3], 'stroke-linejoin': 'round' }, g);
      dims.forEach(function (d, i) {
        var p = P(i, d[2][s[0]] / d[1]);
        var dot = el('circle', { cx: p[0], cy: p[1], r: 4, fill: s[1] }, g);
        el('title', {}, dot).textContent = years[s[0]] + ' · ' + names[i] + ': ' + Math.round(d[2][s[0]] / d[1] * 100) + '% of maximum';
      });
    });
    host.appendChild(svg);
  })();

  // 3) FY21 vs FY25 performance bars (percent metrics)
  (function () {
    var host = document.getElementById('pairs'); if (!host) return;
    var rows = [['Net profit margin', 14.11, 24.66], ['ROCE', 15.42, 21.74], ['EBITDA margin', 23.17, 36.02], ['Return on equity', 34.79, 35.68]];
    host.innerHTML = rows.map(function (r) {
      return '<div class="pair"><div class="pair-top"><span>' + r[0] + '</span><span><b>' + f2(r[2]) + '%</b> <em>from ' + f2(r[1]) + '%</em></span></div>' +
        '<div class="track"><div class="fill old" style="width:' + (r[1] / 40 * 100) + '%"></div></div>' +
        '<div class="track"><div class="fill" style="width:' + (r[2] / 40 * 100) + '%"></div></div></div>';
    }).join('');
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', rows.map(function (r) { return r[0] + ' ' + f2(r[1]) + ' to ' + f2(r[2]) + ' percent'; }).join('; '));
  })();

  // 4) Board composition: board size vs independent directors
  (function () {
    var host = document.getElementById('boardChart'); if (!host) return;
    var W = 480, H = 270, L = 34, R = 12, T = 28, B = 52, hi = 16, n = years.length;
    var gw = (W - L - R) / n, bw = 24;
    var y = function (v) { return T + (hi - v) / hi * (H - T - B); };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'chart-svg light' });
    [0, 4, 8, 12, 16].forEach(function (v) {
      el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), 'class': 'grid' }, svg);
      txt('text', { x: L - 8, y: y(v) + 4, 'class': 'axis', 'text-anchor': 'end' }, svg, v);
    });
    years.forEach(function (yr, i) {
      var c = L + gw * i + gw / 2, share = Math.round(indep[i] / board[i] * 100);
      [[board[i], '#b9c6d8', -bw - 2, 'Board size'], [indep[i], '#126f68', 2, 'Independent directors']].forEach(function (b) {
        var r = el('rect', { x: c + b[2], y: y(b[0]), width: bw, height: y(0) - y(b[0]), rx: 4, fill: b[1], 'class': 'col' }, svg);
        el('title', {}, r).textContent = yr + ' · ' + b[3] + ': ' + b[0];
        txt('text', { x: c + b[2] + bw / 2, y: y(b[0]) - 6, 'class': 'axis strong', 'text-anchor': 'middle' }, svg, b[0]);
      });
      txt('text', { x: c, y: H - 26, 'class': 'axis', 'text-anchor': 'middle' }, svg, yr);
      txt('text', { x: c, y: H - 8, 'class': 'axis strong', 'text-anchor': 'middle' }, svg, share + '% indep.');
    });
    host.appendChild(svg);
  })();

  show(4);
})();
