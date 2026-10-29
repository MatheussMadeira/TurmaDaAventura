/* @ds-bundle: {"format":4,"namespace":"TDA","components":[{"name":"Icon"},{"name":"Reveal"},{"name":"Button"},{"name":"Tag"},{"name":"Logo"},{"name":"Media"},{"name":"CamoPattern"},{"name":"TextField"},{"name":"Select"},{"name":"SectionHeader"},{"name":"WhatsAppButton"},{"name":"ServiceCard"},{"name":"RestaurantCard"},{"name":"TeamCard"},{"name":"ValuePillar"},{"name":"Header"},{"name":"Hero"},{"name":"Trail"},{"name":"CTABanner"},{"name":"QuoteForm"},{"name":"Footer"},{"name":"WhatsAppFloat"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  /* ---------- motion helpers ---------- */
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  /* true quando 20% do elemento entra na viewport (uma vez só) */
  function useInView(ref, opts) {
    var st = useState(false), seen = st[0], setSeen = st[1];
    useEffect(function () {
      var el = ref.current;
      if (!el || seen) return;
      if (!('IntersectionObserver' in window) || reducedMotion()) { setSeen(true); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { setSeen(true); io.disconnect(); } });
      }, { threshold: (opts && opts.threshold) || 0.2, rootMargin: '0px 0px -40px 0px' });
      io.observe(el);
      return function () { io.disconnect(); };
    }, [seen]);
    return seen;
  }

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }
  function omit(obj, keys) {
    var r = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) r[k] = obj[k];
    return r;
  }

  /* ---------- Reveal ---------- */
  function Reveal(props) {
    var ref = useRef(null);
    var seen = useInView(ref, { threshold: props.threshold });
    var Tag_ = props.as || 'div';
    var effect = props.effect || 'up';
    var kids = props.stagger
      ? React.Children.toArray(props.children).map(function (c, i) {
        return h('div', { key: i, className: 'tda-reveal__item', style: { '--i': Math.min(i, 5) } }, c);
      })
      : props.children;
    var style = Object.assign({}, props.style || {}, props.delay ? { '--tda-delay': props.delay + 'ms' } : {});
    return h(Tag_, { ref: ref, style: style, className: cx('tda-reveal', 'tda-reveal--' + effect, props.stagger && 'tda-reveal--stagger', seen && 'is-visible', props.className) }, kids);
  }

  /* ---------- assets (uploads do design system; no site real vêm de /public/brand) ---------- */
  var ASSETS = {
    'full-green': '/_blob/019a1cfe7b60c514b967203f86a00d1e',
    'full-white': '/_blob/c851e3dab470a515d15dc810c9bc9f82',
    'compact-green': '/_blob/6146debd60e63c28dc81bdf14978631c',
    'compact-white': '/_blob/125aaee50d01acd4075a4b9ac46abdc6',
    'symbol-green': '/_blob/77193a3c503cb53ea20c4d2ba35ab79a',
    'symbol-white': '/_blob/96845bd3449569d13c338efcf96c4d83',
    'paw-green': '/_blob/4c8fd8b1a3525c3600e829a53d8c150b',
    'paw-white': '/_blob/06d3615a05d66b777f98bd2e894a77f3'
  };
  var RATIO = { full: 1600 / 659, compact: 1600 / 548, symbol: 480 / 476, paw: 234 / 290 };

  /* ---------- whatsapp ---------- */
  var DEFAULT_PHONE = '5500000000000';
  function whatsappUrl(phone, message) {
    var p = String(phone || DEFAULT_PHONE).replace(/\D/g, '');
    return 'https://wa.me/' + p + (message ? '?text=' + encodeURIComponent(message) : '');
  }

  /* ---------- Icon ---------- */
  var S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  function p(d, extra) { return h('path', Object.assign({ d: d, key: d }, extra || {})); }
  var ICONS = {
    whatsapp: function () {
      return [
        h('path', { key: 'b', d: 'M4.2 19.8l1.1-3.9A8.4 8.4 0 1 1 8.4 19l-4.2.8z' }),
        h('path', { key: 'h', d: 'M9.1 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.3.6v.5c-.1.6-.9 1.3-1.7 1.3-2.9-.2-6-3.2-6.2-6.2 0-.6.3-1.1.6-1.4z', fill: 'currentColor', stroke: 'none' })
      ];
    },
    instagram: function () { return [h('rect', { key: 'r', x: 3.5, y: 3.5, width: 17, height: 17, rx: 5 }), h('circle', { key: 'c', cx: 12, cy: 12, r: 4 }), h('circle', { key: 'd', cx: 17.2, cy: 6.8, r: 0.9, fill: 'currentColor', stroke: 'none' })]; },
    menu: function () { return [p('M4 7h16'), p('M4 12h16'), p('M4 17h16')]; },
    close: function () { return [p('M6 6l12 12'), p('M18 6L6 18')]; },
    'arrow-right': function () { return [p('M5 12h14'), p('M13 6l6 6-6 6')]; },
    'chevron-down': function () { return [p('M6 9l6 6 6-6')]; },
    check: function () { return [p('M5 12.5l4.5 4.5L19 7.5')]; },
    'map-pin': function () { return [p('M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z'), h('circle', { key: 'c', cx: 12, cy: 9.5, r: 2.5 })]; },
    clock: function () { return [h('circle', { key: 'c', cx: 12, cy: 12, r: 8.5 }), p('M12 7.5V12l3 2')]; },
    calendar: function () { return [h('rect', { key: 'r', x: 3.5, y: 5, width: 17, height: 15.5, rx: 3 }), p('M3.5 10h17'), p('M8 3v4'), p('M16 3v4')]; },
    users: function () { return [h('circle', { key: 'a', cx: 9, cy: 8.5, r: 3.5 }), p('M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5'), p('M15.5 5.2a3.5 3.5 0 0 1 0 6.6'), p('M18 14.8c2 .7 3.2 2.4 3.5 5.2')]; },
    compass: function () { return [h('circle', { key: 'c', cx: 12, cy: 12, r: 8.5 }), p('M15.5 8.5l-2 5-5 2 2-5z')]; },
    tent: function () { return [p('M12 4L2.5 20h19z'), p('M12 4v16'), p('M9 20l3-6 3 6'), p('M10.5 3l1.5 1 1.5-1')]; },
    tree: function () { return [p('M12 3l-6 8h3.5l-4 6h13l-4-6H18z'), p('M12 17v4')]; },
    leaf: function () { return [p('M5 19c0-8 5-13 14-14 0 9-5 14-13 14z'), p('M5 19l7-7')]; },
    scissors: function () { return [h('circle', { key: 'a', cx: 6.5, cy: 7, r: 2.5 }), h('circle', { key: 'b', cx: 6.5, cy: 17, r: 2.5 }), p('M8.6 8.4L20 18'), p('M8.6 15.6L20 6')]; },
    palette: function () { return [p('M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-.9 1.5-1.9-.4-1.2.2-2.4 1.6-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9.2-8.5-9.2z'), h('circle', { key: 'a', cx: 8, cy: 10, r: 1, fill: 'currentColor' }), h('circle', { key: 'b', cx: 12, cy: 7.5, r: 1, fill: 'currentColor' }), h('circle', { key: 'c', cx: 16, cy: 10, r: 1, fill: 'currentColor' })]; },
    utensils: function () { return [p('M7 3v8'), p('M4.5 3v5a2.5 2.5 0 0 0 5 0V3'), p('M7 11v10'), p('M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.5V13H17')]; },
    briefcase: function () { return [h('rect', { key: 'r', x: 3, y: 7, width: 18, height: 13, rx: 3 }), p('M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7'), p('M3 12.5h18')]; },
    star: function () { return [p('M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z')]; },
    flag: function () { return [p('M5 21V4'), p('M5 4.5c4-2 6 2 10 0l4-1v9l-4 1c-4 2-6-2-10 0')]; },
    backpack: function () { return [p('M6 9a6 6 0 0 1 12 0v10.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5z'), p('M9.5 3.6V3h5v.6'), p('M9 14h6v3.5H9z')]; },
    phone: function () { return [p('M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.4 20 4 13.6 3.5 5.1A1.5 1.5 0 0 1 5 3.5z')]; },
    mail: function () { return [h('rect', { key: 'r', x: 3, y: 5, width: 18, height: 14, rx: 3 }), p('M3.5 7l8.5 6 8.5-6')]; },
    heart: function () { return [p('M12 20s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.6C20 15.4 12 20 12 20z')]; },
    shield: function () { return [p('M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z'), p('M8.5 12l2.5 2.5 4.5-4.5')]; },
  };
  function Icon(props) {
    var name = props.name, size = props.size || 24;
    var draw = ICONS[name];
    var rest = omit(props, ['name', 'size', 'label', 'className']);
    return h('svg', Object.assign({
      width: size, height: size, viewBox: '0 0 24 24',
      className: cx('tda-icon', props.className),
      'aria-hidden': props.label ? undefined : true,
      role: props.label ? 'img' : undefined,
      'aria-label': props.label
    }, S, rest), draw ? draw() : null);
  }
  Icon.names = Object.keys(ICONS);

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || 'primary', size = props.size || 'md';
    var iconSize = size === 'lg' ? 22 : size === 'sm' ? 16 : 20;
    var rest = omit(props, ['variant', 'size', 'iconLeft', 'iconRight', 'fullWidth', 'className', 'children', 'href']);
    var cls = cx('tda-btn', 'tda-btn--' + variant, 'tda-btn--' + size, props.fullWidth && 'tda-btn--full', props.className);
    var kids = [
      props.iconLeft ? h(Icon, { key: 'l', name: props.iconLeft, size: iconSize }) : null,
      h('span', { key: 't' }, props.children),
      props.iconRight ? h(Icon, { key: 'r', name: props.iconRight, size: iconSize }) : null
    ];
    if (props.href) return h('a', Object.assign({ href: props.href, className: cls }, rest), kids);
    return h('button', Object.assign({ type: 'button', className: cls }, rest), kids);
  }

  /* ---------- Tag ---------- */
  function Tag(props) {
    return h('span', { className: cx('tda-tag', 'tda-tag--' + (props.tone || 'olive'), props.className) },
      props.icon ? h(Icon, { name: props.icon, size: 14 }) : null, props.children);
  }

  /* ---------- Logo ---------- */
  function Logo(props) {
    var variant = props.variant || 'compact', tone = props.tone || 'green';
    var height = props.height || 48;
    var alt = variant === 'paw' ? '' : 'Turma da Aventura';
    function one(t, extra) {
      var src = (props.sources && props.sources[variant + '-' + t]) || ASSETS[variant + '-' + t];
      return h('img', { key: t, src: src, alt: extra ? '' : alt, 'aria-hidden': extra ? true : undefined, height: height, width: Math.round(height * RATIO[variant]), className: cx('tda-logo', props.className, tone === 'auto' && (t === 'green' ? 'tda-logo--on-light' : 'tda-logo--on-dark')), style: { height: height, width: 'auto' } });
    }
    /* tone 'auto': verde no tema Dia, branco no tema Noite (troca por CSS, sem JS) */
    var img = tone === 'auto' ? h(React.Fragment, null, one('green'), one('white', true)) : one(tone);
    return props.href ? h('a', { href: props.href, className: 'tda-logo-link', 'aria-label': 'Turma da Aventura — início' }, img) : img;
  }

  /* ---------- CamoPattern ---------- */
  var BLOBS = [
    ['camo-1', 'M-10 20 C 20 -5, 70 5, 85 30 S 60 80, 25 70 S -25 45, -10 20z'],
    ['camo-2', 'M95 -10 C 130 -5, 160 20, 150 45 S 110 60, 95 40 S 70 -15, 95 -10z'],
    ['camo-3', 'M120 70 C 150 60, 190 75, 185 105 S 150 140, 125 125 S 95 80, 120 70z'],
    ['camo-4', 'M20 95 C 45 80, 90 95, 95 120 S 70 160, 40 150 S -5 110, 20 95z'],
    ['camo-2', 'M160 140 C 185 130, 215 150, 205 175 S 170 200, 155 185 S 140 150, 160 140z'],
    ['camo-1', 'M60 165 C 85 155, 120 165, 118 185 S 90 215, 65 205 S 40 175, 60 165z'],
    ['camo-3', 'M-15 175 C 5 165, 30 180, 25 200 S -5 220, -20 210z'],
    ['camo-4', 'M175 0 C 195 -10, 215 5, 210 25 S 185 40, 175 25 S 160 8, 175 0z']
  ];
  function CamoPattern(props) {
    var tone = props.tone || 'full';
    var id = 'tda-camo-' + (props.id || tone);
    return h('svg', { className: cx('tda-camo', 'tda-camo--' + tone, props.className), 'aria-hidden': true, width: '100%', height: '100%', preserveAspectRatio: 'none' },
      h('defs', null, h('pattern', { id: id, width: 200, height: 200, patternUnits: 'userSpaceOnUse', patternTransform: 'scale(' + (props.scale || 1) + ')' },
        h('rect', { width: 200, height: 200, className: 'tda-camo__ground' }),
        [-200, 0, 200].map(function (dx) { return [-200, 0, 200].map(function (dy) { return h('g', { key: dx + '_' + dy, transform: 'translate(' + dx + ' ' + dy + ')' }, BLOBS.map(function (b, i) { return h('path', { key: i, d: b[1], className: 'tda-camo__' + b[0] }); })); }); }))),
      h('rect', { width: '100%', height: '100%', fill: 'url(#' + id + ')' }));
  }

  /* ---------- Media ---------- */
  function Media(props) {
    var ratio = props.ratio || '4 / 3';
    return h('div', { className: cx('tda-media', props.rounded === false ? null : 'tda-media--rounded', props.className), style: { aspectRatio: ratio } },
      props.src
        ? h('img', { src: props.src, alt: props.alt || '', loading: 'lazy' })
        : h('div', { className: 'tda-media__placeholder', role: props.alt ? 'img' : undefined, 'aria-label': props.alt || undefined },
          h(CamoPattern, { tone: 'soft', id: props.placeholderId || ('m' + Math.round(Math.random() * 1e6)) }),
          h('span', { className: 'tda-media__badge' }, h(Icon, { name: props.icon || 'tent', size: 28 }))),
      props.caption ? h('span', { className: 'tda-media__caption' }, props.caption) : null);
  }

  /* ---------- Form ---------- */
  var uid = 0;
  function useId(given) { var s = useState(function () { uid += 1; return given || 'tda-f' + uid; }); return s[0]; }
  function Field(props, control) {
    var id = props.id;
    return h('div', { className: cx('tda-field', props.error && 'tda-field--error', props.className) },
      h('label', { className: 'tda-field__label', htmlFor: id }, props.label, props.required ? h('span', { className: 'tda-field__req', 'aria-hidden': true }, ' *') : null),
      control,
      props.error ? h('p', { className: 'tda-field__msg tda-field__msg--error', id: id + '-msg' }, h(Icon, { name: 'flag', size: 14 }), props.error)
        : props.hint ? h('p', { className: 'tda-field__msg', id: id + '-msg' }, props.hint) : null);
  }
  function TextField(props) {
    var id = useId(props.id);
    var rest = omit(props, ['label', 'hint', 'error', 'multiline', 'className', 'id']);
    var common = Object.assign({ id: id, className: 'tda-input', 'aria-invalid': props.error ? true : undefined, 'aria-describedby': (props.error || props.hint) ? id + '-msg' : undefined }, rest);
    return Field(Object.assign({}, props, { id: id }), props.multiline ? h('textarea', Object.assign({ rows: 4 }, common)) : h('input', Object.assign({ type: 'text' }, common)));
  }
  function Select(props) {
    var id = useId(props.id);
    var rest = omit(props, ['label', 'hint', 'error', 'options', 'placeholder', 'className', 'id']);
    var opts = (props.options || []).map(function (o) { var v = typeof o === 'string' ? { value: o, label: o } : o; return h('option', { key: v.value, value: v.value }, v.label); });
    if (props.placeholder) opts.unshift(h('option', { key: '__p', value: '', disabled: true }, props.placeholder));
    return Field(Object.assign({}, props, { id: id }), h('div', { className: 'tda-select' },
      h('select', Object.assign({ id: id, className: 'tda-input', defaultValue: props.value === undefined && props.placeholder ? '' : undefined, 'aria-invalid': props.error ? true : undefined }, rest), opts),
      h(Icon, { name: 'chevron-down', size: 18, className: 'tda-select__chev' })));
  }

  /* ---------- SectionHeader ---------- */
  function SectionHeader(props) {
    var Tag_ = 'h' + (props.level || 2);
    return h('header', { className: cx('tda-sh', 'tda-sh--' + (props.align || 'left'), props.onForest && 'tda-sh--forest', props.className) },
      props.overline ? h('p', { className: 'overline tda-sh__over' }, props.overline) : null,
      h(Tag_, { className: cx(props.level === 1 ? 'h1' : 'h2', 'tda-sh__title') }, props.title),
      props.description ? h('p', { className: 'lead tda-sh__desc' }, props.description) : null);
  }

  /* ---------- WhatsAppButton ---------- */
  function WhatsAppButton(props) {
    var rest = omit(props, ['phone', 'message', 'children']);
    return h(Button, Object.assign({ variant: 'primary', iconLeft: 'whatsapp', href: whatsappUrl(props.phone, props.message), target: '_blank', rel: 'noopener noreferrer' }, rest), props.children || 'Pedir orçamento no WhatsApp');
  }

  /* ---------- Cards ---------- */
  function ServiceCard(props) {
    var Root = props.href ? 'a' : 'article';
    return h(Root, { href: props.href, className: cx('tda-card', 'tda-service', props.href && 'tda-card--link', props.tone === 'earth' && 'tda-service--earth', props.className) },
      props.image !== undefined ? h(Media, { src: props.image, alt: props.imageAlt, icon: props.icon, ratio: '16 / 10', placeholderId: props.placeholderId }) :
        h('span', { className: 'tda-service__icon' }, h(Icon, { name: props.icon || 'compass', size: 28 })),
      h('div', { className: 'tda-card__body' },
        props.overline ? h('p', { className: 'overline tda-card__over' }, props.overline) : null,
        h('h3', { className: 'h4 tda-card__title' }, props.title),
        props.description ? h('p', { className: 'body-sm tda-card__text' }, props.description) : null,
        props.tags && props.tags.length ? h('div', { className: 'tda-tags' }, props.tags.map(function (t) { return h(Tag, { key: t, tone: 'olive' }, t); })) : null,
        props.href ? h('span', { className: 'tda-card__more' }, props.linkLabel || 'Saiba mais', h(Icon, { name: 'arrow-right', size: 18 })) : null));
  }

  function RestaurantCard(props) {
    return h('article', { className: cx('tda-card', 'tda-restaurant', props.className) },
      h('div', { className: 'tda-restaurant__media' },
        h(Media, { src: props.image, alt: props.imageAlt || props.name, icon: 'utensils', ratio: '4 / 3', placeholderId: props.placeholderId }),
        props.brandLogo ? h('img', { className: 'tda-restaurant__brand', src: props.brandLogo, alt: 'Logo ' + props.name }) : null),
      h('div', { className: 'tda-card__body' },
        props.neighborhood ? h('p', { className: 'overline tda-card__over' }, props.neighborhood) : null,
        h('h3', { className: 'h4 tda-card__title' }, props.name),
        h('ul', { className: 'tda-meta' },
          props.schedule ? h('li', null, h(Icon, { name: 'clock', size: 18 }), props.schedule) : null,
          props.address ? h('li', null, h(Icon, { name: 'map-pin', size: 18 }), props.address) : null,
          props.ages ? h('li', null, h(Icon, { name: 'users', size: 18 }), props.ages) : null),
        props.mapsUrl ? h(Button, { variant: 'outline', size: 'sm', href: props.mapsUrl, target: '_blank', rel: 'noopener noreferrer', iconRight: 'arrow-right' }, 'Como chegar') : null));
  }

  function TeamCard(props) {
    return h('article', { className: cx('tda-card', 'tda-team', props.className) },
      h('div', { className: 'tda-team__photo' }, props.photo ? h('img', { src: props.photo, alt: props.name }) : h('span', { className: 'tda-team__initials', 'aria-hidden': true }, (props.name || '?').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join(''))),
      props.nickname ? h('p', { className: 'tagline tda-team__nick' }, props.nickname) : null,
      h('h3', { className: 'h4 tda-card__title' }, props.name),
      props.role ? h('p', { className: 'caption tda-team__role' }, props.role) : null,
      props.bio ? h('p', { className: 'body-sm tda-card__text' }, props.bio) : null,
      props.badges && props.badges.length ? h('div', { className: 'tda-tags tda-tags--center' }, props.badges.map(function (b) { return h(Tag, { key: b, tone: 'earth', icon: 'shield' }, b); })) : null);
  }

  function ValuePillar(props) {
    var ref = useRef(null);
    var seen = useInView(ref);
    return h('div', { ref: ref, className: cx('tda-pillar', 'tda-pillar--' + (props.tone || 'brand'), seen && 'is-visible', props.className), style: props.index !== undefined ? { '--i': props.index } : undefined },
      h('span', { className: 'tda-pillar__badge' }, h(Icon, { name: props.icon || 'star', size: 30 })),
      props.number ? h('p', { className: 'overline tda-pillar__num' }, props.number) : null,
      h('h3', { className: 'h3 tda-pillar__title' }, props.title),
      props.text ? h('p', { className: 'body tda-pillar__text' }, props.text) : null);
  }

  /* ---------- Header ---------- */
  var DEFAULT_NAV = [
    { label: 'Início', href: '/' },
    { label: 'Oficina', href: '/oficina' },
    { label: 'Restaurantes', href: '/restaurantes' },
    { label: 'Eventos corporativos', href: '/eventos-corporativos' },
    { label: 'Quem somos', href: '/quem-somos' }
  ];
  function Header(props) {
    var st = useState(!!props.defaultOpen), open = st[0], setOpen = st[1];
    var sc = useState(false), scrolled = sc[0], setScrolled = sc[1];
    var hd = useState(false), hidden = hd[0], setHidden = hd[1];
    useEffect(function () {
      if (props.static) return;
      var last = window.scrollY, ticking = false;
      function onScroll() {
        if (ticking) return; ticking = true;
        window.requestAnimationFrame(function () {
          var y = window.scrollY;
          setScrolled(y > 8);
          if (Math.abs(y - last) > 6) setHidden(y > last && y > 240);
          last = y; ticking = false;
        });
      }
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return function () { window.removeEventListener('scroll', onScroll); };
    }, [props.static]);
    var nav = props.items || DEFAULT_NAV;
    var links = nav.map(function (it, i) {
      var active = it.href === props.current;
      return h('li', { key: it.href, style: { '--i': i } }, h('a', { href: it.href, className: cx('tda-nav__link', active && 'is-active'), 'aria-current': active ? 'page' : undefined }, it.label));
    });
    return h('header', { className: cx('tda-header', open && 'is-open', (scrolled || props.scrolled) && 'is-scrolled', hidden && !open && 'is-hidden', props.className) },
      h('div', { className: 'tda-header__inner' },
        h(Logo, { variant: 'compact', tone: 'auto', height: 52, href: '/' }),
        h('nav', { className: 'tda-nav', 'aria-label': 'Principal' }, h('ul', { id: 'tda-nav-list', className: 'tda-nav__list' }, links)),
        h('div', { className: 'tda-header__cta' }, h(WhatsAppButton, { size: 'sm', phone: props.phone, message: props.message }, 'Orçamento')),
        h('button', { type: 'button', className: 'tda-header__toggle', 'aria-expanded': open, 'aria-controls': 'tda-nav-list', 'aria-label': open ? 'Fechar menu' : 'Abrir menu', onClick: function () { setOpen(!open); } }, h('span', { className: 'tda-burger', 'aria-hidden': true }, h('span'), h('span'), h('span')))));
  }

  /* ---------- Hero ---------- */
  function Hero(props) {
    var variant = props.variant || 'light';
    return h('section', { className: cx('tda-hero', 'tda-hero--' + variant, props.className) },
      variant === 'forest' ? h('div', { className: 'tda-hero__camo' }, h(CamoPattern, { tone: 'forest', id: 'hero' })) : null,
      h('div', { className: 'tda-hero__inner' },
        h('div', { className: 'tda-hero__copy' },
          props.overline ? h('p', { className: 'overline tda-hero__over' }, props.overline) : null,
          h('h1', { className: 'display tda-hero__title' }, props.title),
          props.lead ? h('p', { className: 'lead tda-hero__lead' }, props.lead) : null,
          h('div', { className: 'tda-hero__actions' },
            h(WhatsAppButton, { size: 'lg', phone: props.phone, message: props.message, variant: variant === 'forest' ? 'inverse' : 'primary' }, props.ctaLabel || 'Pedir orçamento no WhatsApp'),
            props.secondary ? h(Button, { size: 'lg', variant: variant === 'forest' ? 'ghost-inverse' : 'outline', href: props.secondary.href, iconRight: 'arrow-right' }, props.secondary.label) : null),
          props.highlights ? h('ul', { className: 'tda-hero__hl' }, props.highlights.map(function (t) { return h('li', { key: t }, h(Icon, { name: 'check', size: 18 }), t); })) : null),
        h('div', { className: 'tda-hero__visual' },
          h(Media, { src: props.image, alt: props.imageAlt, icon: 'tent', ratio: '5 / 4', placeholderId: 'hero-m' }),
          variant === 'forest' ? h('img', { className: 'tda-hero__paw', src: ASSETS['paw-white'], alt: '', 'aria-hidden': true }) : h('span', { className: 'tda-hero__paw' }, h(Logo, { variant: 'paw', tone: 'auto', height: 100 })))));
  }

  /* ---------- Trail (Como funciona) ---------- */
  function Trail(props) {
    var steps = props.steps || [];
    var ref = useRef(null);
    var seen = useInView(ref, { threshold: 0.35 });
    return h('ol', { ref: ref, className: cx('tda-trail', seen && 'is-visible', props.className), style: { '--tda-trail-n': steps.length } },
      steps.map(function (s, i) {
        return h('li', { key: i, className: 'tda-trail__step', style: { '--i': i } },
          h('span', { className: 'tda-trail__marker' }, h(Icon, { name: s.icon || 'flag', size: 26 })),
          h('p', { className: 'overline tda-trail__num' }, 'Etapa ' + String(i + 1).padStart(2, '0')),
          h('h3', { className: 'h4 tda-trail__title' }, s.title),
          s.text ? h('p', { className: 'body-sm tda-trail__text' }, s.text) : null);
      }));
  }

  /* ---------- CTABanner ---------- */
  function CTABanner(props) {
    return h('section', { className: cx('tda-cta', props.className) },
      h('div', { className: 'tda-cta__camo' }, h(CamoPattern, { tone: 'forest', id: 'cta' })),
      h('div', { className: 'tda-cta__inner' },
        h('img', { className: 'tda-cta__symbol', src: ASSETS['symbol-white'], alt: '', 'aria-hidden': true }),
        h('div', { className: 'tda-cta__copy' },
          h('h2', { className: 'h2 tda-cta__title' }, props.title || 'Bora planejar a próxima aventura?'),
          props.text ? h('p', { className: 'lead tda-cta__text' }, props.text) : null),
        h(WhatsAppButton, { size: 'lg', variant: 'inverse', phone: props.phone, message: props.message }, props.ctaLabel || 'Chamar no WhatsApp')));
  }

  /* ---------- QuoteForm ---------- */
  var EVENT_TYPES = ['Restaurante (recreação fixa)', 'Evento corporativo', 'Oficina', 'Festa ou evento particular', 'Outro'];
  function QuoteForm(props) {
    var s = useState({ nome: '', tipo: '', data: '', criancas: '', idades: '', cidade: '', msg: '' }), v = s[0], set = s[1];
    var e = useState({}), err = e[0], setErr = e[1];
    var sd = useState(false), sending = sd[0], setSending = sd[1];
    var tk = useState(0), tries = tk[0], setTries = tk[1];
    function on(k) { return function (ev) { var n = Object.assign({}, v); n[k] = ev.target.value; set(n); }; }
    function submit(ev) {
      ev.preventDefault();
      var x = {};
      if (!v.nome.trim()) x.nome = 'Conta pra gente seu nome.';
      if (!v.tipo) x.tipo = 'Escolha o tipo de evento.';
      setErr(x);
      if (Object.keys(x).length) { setTries(tries + 1); return; }
      var lines = ['Olá, Turma da Aventura! Quero um orçamento.', '', '• Nome: ' + v.nome, '• Tipo: ' + v.tipo];
      if (v.data) lines.push('• Data: ' + v.data);
      if (v.criancas) lines.push('• Nº de crianças: ' + v.criancas);
      if (v.idades) lines.push('• Idades: ' + v.idades);
      if (v.cidade) lines.push('• Local/cidade: ' + v.cidade);
      if (v.msg) lines.push('', v.msg);
      var url = whatsappUrl(props.phone, lines.join('\n'));
      setSending(true);
      /* breve estado de envio (pegadas animadas) antes de redirecionar */
      window.setTimeout(function () {
        setSending(false);
        if (props.onSubmit) props.onSubmit(url, v); else window.open(url, '_blank', 'noopener');
      }, reducedMotion() ? 0 : 700);
    }
    return h('form', { className: cx('tda-card', 'tda-quote', sending && 'is-sending', props.className), onSubmit: submit, noValidate: true, 'aria-busy': sending || undefined, 'data-tries': tries },
      h('div', { className: 'tda-quote__head' },
        h('h3', { className: 'h3' }, props.title || 'Monte seu orçamento'),
        h('p', { className: 'body-sm tda-card__text' }, props.description || 'Preencha o básico e a conversa abre no WhatsApp com tudo pronto. Respondemos em horário comercial.')),
      h('div', { className: 'tda-quote__grid' },
        h(TextField, { key: 'nome' + (err.nome ? tries : ''), label: 'Seu nome', required: true, value: v.nome, onChange: on('nome'), error: err.nome, autoComplete: 'name' }),
        h(Select, { key: 'tipo' + (err.tipo ? tries : ''), label: 'Tipo de evento', required: true, value: v.tipo, onChange: on('tipo'), options: props.eventTypes || EVENT_TYPES, placeholder: 'Escolha uma opção', error: err.tipo }),
        h(TextField, { label: 'Data (se já souber)', type: 'date', value: v.data, onChange: on('data') }),
        h(TextField, { label: 'Nº de crianças', type: 'number', min: 1, inputMode: 'numeric', value: v.criancas, onChange: on('criancas'), hint: 'Uma estimativa já ajuda.' }),
        h(TextField, { label: 'Idades', value: v.idades, onChange: on('idades'), placeholder: 'Ex.: 4 a 10 anos' }),
        h(TextField, { label: 'Cidade ou local', value: v.cidade, onChange: on('cidade'), autoComplete: 'address-level2' }),
        h(TextField, { label: 'Quer contar mais?', multiline: true, value: v.msg, onChange: on('msg'), className: 'tda-quote__full' })),
      h(Button, { type: 'submit', iconLeft: sending ? null : 'whatsapp', size: 'lg', fullWidth: true, disabled: sending, className: 'tda-quote__submit' },
        sending ? h('span', { className: 'tda-steps', 'aria-hidden': true }, h('i'), h('i'), h('i')) : null,
        sending ? 'Abrindo o WhatsApp…' : 'Continuar no WhatsApp'),
      h('p', { className: 'caption tda-quote__note' }, 'Não divulgamos preços no site: cada aventura é montada sob medida.'));
  }

  /* ---------- Footer ---------- */
  function Footer(props) {
    var nav = props.items || DEFAULT_NAV;
    return h('footer', { className: cx('tda-footer', props.className) },
      h('div', { className: 'tda-footer__inner' },
        h('div', { className: 'tda-footer__brand' },
          h(Logo, { variant: 'full', tone: 'white', height: 120 }),
          h('p', { className: 'body-sm tda-footer__about' }, props.about || 'Recreação infantil para restaurantes, eventos corporativos e oficinas. Monitores treinados, brincadeiras ao ar livre e muita imaginação.')),
        h('nav', { 'aria-label': 'Rodapé' }, h('p', { className: 'overline tda-footer__h' }, 'Navegue'),
          h('ul', { className: 'tda-footer__list' }, nav.map(function (it) { return h('li', { key: it.href }, h('a', { href: it.href }, it.label)); }))),
        h('div', null, h('p', { className: 'overline tda-footer__h' }, 'Fale com a gente'),
          h('ul', { className: 'tda-footer__list' },
            h('li', null, h('a', { href: whatsappUrl(props.phone, 'Olá! Vim pelo site.'), target: '_blank', rel: 'noopener noreferrer' }, h(Icon, { name: 'whatsapp', size: 18 }), props.phoneLabel || 'WhatsApp')),
            props.instagram ? h('li', null, h('a', { href: 'https://instagram.com/' + props.instagram.replace('@', ''), target: '_blank', rel: 'noopener noreferrer' }, h(Icon, { name: 'instagram', size: 18 }), props.instagram)) : null,
            props.email ? h('li', null, h('a', { href: 'mailto:' + props.email }, h(Icon, { name: 'mail', size: 18 }), props.email)) : null,
            props.city ? h('li', null, h('span', null, h(Icon, { name: 'map-pin', size: 18 }), props.city)) : null))),
      h('div', { className: 'tda-footer__bottom' },
        h('p', { className: 'tagline' }, 'Brincar / Aprender / Ensinar'),
        h('p', { className: 'caption' }, '© ' + (props.year || new Date().getFullYear()) + ' Turma da Aventura')));
  }

  /* ---------- WhatsAppFloat ---------- */
  function WhatsAppFloat(props) {
    var sh = useState(!!props.inline), shown = sh[0], setShown = sh[1];
    var cv = useState(false), covered = cv[0], setCovered = cv[1];
    useEffect(function () {
      if (props.inline) return;
      var t = window.setTimeout(function () { setShown(true); }, props.delay === undefined ? 1500 : props.delay);
      function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && window.scrollY / max > 0.3) setShown(true);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      /* some enquanto um QuoteForm estiver na tela */
      var io = null, forms = document.querySelectorAll('.tda-quote');
      if (forms.length && 'IntersectionObserver' in window) {
        io = new IntersectionObserver(function (en) { setCovered(en.some(function (x) { return x.isIntersecting; })); }, { threshold: 0.25 });
        forms.forEach(function (f) { io.observe(f); });
      }
      return function () { window.clearTimeout(t); window.removeEventListener('scroll', onScroll); if (io) io.disconnect(); };
    }, [props.inline]);
    return h('a', { className: cx('tda-wa-float', props.inline && 'tda-wa-float--inline', shown && !covered && 'is-shown', props.pulse !== false && 'tda-wa-float--pulse', props.className), tabIndex: shown && !covered ? undefined : -1, href: whatsappUrl(props.phone, props.message || 'Olá! Vim pelo site e quero saber mais.'), target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Falar com a Turma da Aventura no WhatsApp' },
      h(Icon, { name: 'whatsapp', size: 30 }), props.label ? h('span', { className: 'tda-wa-float__label' }, props.label) : null);
  }

  window.TDA = Object.assign(window.TDA || {}, {
    Icon: Icon, Reveal: Reveal, Button: Button, Tag: Tag, Logo: Logo, Media: Media, CamoPattern: CamoPattern,
    TextField: TextField, Select: Select, SectionHeader: SectionHeader, WhatsAppButton: WhatsAppButton,
    ServiceCard: ServiceCard, RestaurantCard: RestaurantCard, TeamCard: TeamCard, ValuePillar: ValuePillar,
    Header: Header, Hero: Hero, Trail: Trail, CTABanner: CTABanner, QuoteForm: QuoteForm, Footer: Footer,
    WhatsAppFloat: WhatsAppFloat, whatsappUrl: whatsappUrl, useInView: useInView, assets: ASSETS
  });
})();
