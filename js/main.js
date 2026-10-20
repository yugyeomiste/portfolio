"use strict";

const EMAIL = "romana.jazz@gmail.com";
const GITHUB = "https://github.com/yugyeomiste";
const CV_URL = "assets/cv-romana-azizi.pdf";
const CATEGORIES = {
  code: "Développement",
  "3d": "3D",
  animation: "Animation",
  video: "Vidéo",
  illustration: "Illustration",
};

const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};

const page = document.body.dataset.page;

/* ---------- Données ---------- */
// Essaie l'API du back-end (server.py), sinon lit le JSON statique
// (permet d'héberger le site sur GitHub Pages / Netlify sans serveur).
async function loadData() {
  for (const url of ["/api/portfolio", "data/portfolio.json"]) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch { /* on essaie la source suivante */ }
  }
  throw new Error("Impossible de charger les données du portfolio.");
}

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const chipsHTML = (items = [], max = Infinity) =>
  items.length ? `<ul class="chips">${items.slice(0, max).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>` : "";

/* ---------- Header & footer ---------- */
function renderLayout() {
  const here = (p) => (page === p ? 'aria-current="page"' : "");
  document.querySelector('[data-include="header"]').outerHTML = `
    <header class="site-header">
      <div class="container">
        <a class="brand" href="index.html" aria-label="Romana Azizi, accueil">
          <img src="assets/images/signature.png" alt="" width="40" height="37">
        </a>
        <nav class="nav" aria-label="Navigation principale">
          <a class="nav-home" href="index.html" ${here("home")}>Accueil</a>
          <a href="index.html#projets" ${here("project")}>Projets</a>
          <a href="qui-suis-je.html" ${here("about")}>À propos</a>
          <a href="#contact">Contact</a>
        </nav>
        <a class="nav-cv" href="${CV_URL}" target="_blank" rel="noopener">CV</a>
      </div>
    </header>`;

  document.querySelector('[data-include="footer"]').outerHTML = `
    <footer class="site-footer" id="contact">
      <div class="container">
        <div class="contact">
          <h2>Contact</h2>
          <p class="contact-intro">Une offre de stage, un projet ou simplement envie d’échanger&nbsp;? Écrivez-moi, ce sera avec plaisir.</p>
          <div class="actions">
            <a class="btn btn-primary" href="mailto:${EMAIL}">${ICONS.mail}${EMAIL}</a>
            <a class="btn btn-secondary" href="${GITHUB}" target="_blank" rel="noopener">${ICONS.github}GitHub</a>
            <a class="btn btn-secondary" href="${CV_URL}" target="_blank" rel="noopener">${ICONS.file}Mon CV</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Romana Azizi · <a href="#top" onclick="window.scrollTo({top:0});return false;">Haut de page ↑</a></span>
          <span class="signoff"><span class="hand-note">merci de votre visite ✦</span><img class="signature" src="assets/images/signature.png" alt="Signature de Romana Azizi"></span>
        </div>
      </div>
    </footer>`;

  document.querySelectorAll('[data-icon="github"]').forEach((el) => el.insertAdjacentHTML("afterbegin", ICONS.github));
}

/* ---------- Carrousel (accueil + page projet) ---------- */
// Défilement natif avec scroll-snap (swipe mobile, trackpad), plus flèches,
// points et barre de progression optionnels.
function initSlider(slider, { dots, progress, onChange } = {}) {
  const track = slider.querySelector(".slider-track");
  const prev = slider.querySelector(".slider-btn.prev");
  const next = slider.querySelector(".slider-btn.next");
  const slides = () => [...track.children].filter((el) => el.offsetParent !== null);
  let current = -1;

  const indexOf = () => {
    const list = slides();
    let best = 0;
    list.forEach((s, i) => {
      if (Math.abs(s.offsetLeft - track.scrollLeft) < Math.abs(list[best].offsetLeft - track.scrollLeft)) best = i;
    });
    return best;
  };
  const goTo = (i) => {
    const s = slides()[i];
    if (s) track.scrollTo({ left: s.offsetLeft, behavior: "smooth" });
  };

  function buildDots() {
    if (!dots) return;
    const n = slides().length;
    dots.innerHTML = n > 1
      ? slides().map((_, i) => `<button type="button" aria-label="Aller au média ${i + 1}"></button>`).join("")
      : "";
    [...dots.children].forEach((b, i) => b.addEventListener("click", () => goTo(i)));
  }

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    if (progress) progress.style.width = max > 0 ? `${((track.scrollLeft + track.clientWidth) / track.scrollWidth) * 100}%` : "100%";
    const i = indexOf();
    if (dots) [...dots.children].forEach((b, j) => b.classList.toggle("is-active", j === i));
    if (i !== current) {
      current = i;
      onChange?.(i, slides());
    }
  }

  prev.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: track.clientWidth, behavior: "smooth" }));
  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  });
  window.addEventListener("resize", update);

  buildDots();
  update();
  return {
    prev: () => goTo(Math.max(0, indexOf() - 1)),
    next: () => goTo(Math.min(slides().length - 1, indexOf() + 1)),
    reset() {
      track.scrollTo({ left: 0, behavior: "instant" });
      buildDots();
      update();
    },
  };
}

/* ---------- Accueil : projets ---------- */
function coverHTML(p) {
  const c = p.cover;
  if (c.type === "placeholder") return `<div class="cover-placeholder">${escapeHTML(c.label || p.title)}</div>`;
  if (c.type === "video") {
    return `<img src="${c.poster}" alt="" loading="lazy">
            <video data-src="${c.src}" muted loop playsinline preload="none"></video>
            <span class="play-badge" aria-hidden="true"></span>`;
  }
  return `<img src="${c.src}" alt="" loading="lazy">`;
}

// Sous-titre des cartes : catégorie, puis l'année ou « Projet perso »
const metaDetail = (p) => p.year || (p.context === "Projet personnel" ? "Projet perso" : "");
const metaHTML = (p) =>
  `${CATEGORIES[p.category] ?? ""}${metaDetail(p) ? ` <span>· ${escapeHTML(metaDetail(p))}</span>` : ""}`;

// Jusqu'à deux visuels par projet : la couverture, puis de préférence une image du carrousel
function shotsOf(p) {
  if (p.shots) return p.shots; // visuels choisis à la main (data/portfolio.json) pour éviter les doublons
  const src = (m) => (m.type === "video" ? m.poster : m.type === "image" ? m.src : null);
  const media = [...p.media.filter((m) => m.type === "image"), ...p.media.filter((m) => m.type === "video")];
  return [...new Set([p.cover, ...media].map(src).filter(Boolean))].slice(0, 2);
}


/* Projets disposés de part et d’autre d’un fil central, que l’étoile descend */
function renderGrid(projects) {
  const grid = document.getElementById("grid");
  grid.innerHTML = projects
    .map((p) => {
      const url = `projet.html?p=${encodeURIComponent(p.slug)}`;
      const img = shotsOf(p)[0];
      const visual = img
        ? `<img src="${img}" alt="" loading="lazy">`
        : `<div class="cover-placeholder">${escapeHTML(p.title)}</div>`;
      return `
      <article class="thread-item reveal" data-category="${p.category}">
        <a class="thread-media" href="${url}" tabindex="-1" aria-hidden="true">${visual}</a>
        <span class="thread-dot" aria-hidden="true"></span>
        <div class="thread-text">
          <p class="card-meta">${metaHTML(p)}</p>
          <h3><a href="${url}">${escapeHTML(p.title)}</a></h3>
          <p class="thread-summary">${escapeHTML(p.summary ?? "")}</p>
          ${chipsHTML(p.tech, 3)}
          <a class="link-arrow" href="${url}">Voir le projet</a>
        </div>
      </article>`;
    })
    .join("");

  const relayout = () => {
    // alternance gauche / droite recalculée sur les projets visibles
    [...grid.children].filter((el) => !el.classList.contains("is-hidden"))
      .forEach((el, i) => el.classList.toggle("is-flipped", i % 2 === 1));
  };
  relayout();

  // Filtres
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      const f = btn.dataset.filter;
      grid.querySelectorAll(".thread-item").forEach((item) => {
        item.classList.toggle("is-hidden", f !== "all" && item.dataset.category !== f);
      });
      relayout();
    });
  });
}

/* ---------- Compétences ---------- */
function renderSkills(skills) {
  const el = document.getElementById("skills");
  if (!el) return;
  el.innerHTML = skills
    .map((s) => `<article class="skill-card reveal"><h3>${escapeHTML(s.group)}</h3>${chipsHTML(s.items)}</article>`)
    .join("");
}

/* ---------- Page projet ---------- */
function mediaHTML(m, title) {
  const caption = m.caption ? `<figcaption>${escapeHTML(m.caption)}</figcaption>` : "";
  const content = m.type === "video"
    ? `<video src="${m.src}" poster="${m.poster}" controls loop playsinline preload="metadata"></video>`
    : `<img src="${m.src}" alt="${escapeHTML(m.alt || title)}" loading="lazy">`;
  return `<figure class="slide"><div class="frame">${content}</div>${caption}</figure>`;
}

function asideHTML(p) {
  const rows = [
    ["Année", p.year],
    ["Contexte", p.context],
    ["Équipe", p.team],
    ["Mon rôle", p.role],
  ].filter(([, v]) => v);
  const links = (p.links ?? [])
    .map((l, i) => {
      const icon = l.type === "github" ? ICONS.github : ICONS.external;
      const cls = i === 0 ? "btn-primary" : "btn-secondary";
      return `<a class="btn ${cls} btn-block" href="${l.url}" target="_blank" rel="noopener">${icon}${escapeHTML(l.label)}</a>`;
    })
    .join("");
  return `
    <aside class="card-panel" aria-label="Fiche projet">
      <h2 class="panel-title">Fiche projet</h2>
      <dl class="kv">
        ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}
        ${p.tech?.length ? `<div><dt>Technologies</dt><dd>${chipsHTML(p.tech)}</dd></div>` : ""}
      </dl>
      ${links ? `<div class="panel-links">${links}</div>` : ""}
    </aside>`;
}

function renderProject(projects) {
  const root = document.getElementById("project");
  const slug = new URLSearchParams(location.search).get("p");
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) {
    root.innerHTML = `<p class="error">Projet introuvable. <a href="index.html#projets">Retour aux projets</a></p>`;
    return;
  }
  const p = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  document.title = `${p.title} · Romana Azizi`;

  const media = p.media.length
    ? `<div class="slider" id="media-slider">
         <button class="slider-btn prev" aria-label="Média précédent"></button>
         <div class="slider-track media">${p.media.map((m) => mediaHTML(m, p.title)).join("")}</div>
         <button class="slider-btn next" aria-label="Média suivant"></button>
       </div>
       <div class="slider-dots"></div>`
    : `<div class="media-empty"><div class="cover-placeholder">${escapeHTML(p.title)}<small>Visuels à venir</small></div></div>`;

  root.innerHTML = `
    <a class="back" href="index.html#projets">← Tous les projets</a>
    <header class="project-hero">
      <p class="eyebrow">${CATEGORIES[p.category] ?? ""}${metaDetail(p) ? ` · ${escapeHTML(metaDetail(p))}` : ""}</p>
      <h1>${escapeHTML(p.title)}</h1>
      ${p.subtitle ? `<p class="project-sub">${escapeHTML(p.subtitle)}</p>` : ""}
    </header>
    ${media}
    <div class="project-layout">
      <div class="prose">
        ${p.description.map((d) => `<p>${escapeHTML(d)}</p>`).join("")}
        ${p.highlights?.length ? `<h2>Points clés</h2><ul>${p.highlights.map((h) => `<li>${escapeHTML(h)}</li>`).join("")}</ul>` : ""}
      </div>
      ${asideHTML(p)}
    </div>
    <nav class="pager" aria-label="Autres projets">
      <a class="prev" href="projet.html?p=${prev.slug}"><small>← Projet précédent</small><strong>${escapeHTML(prev.title)}</strong></a>
      <a class="next" href="projet.html?p=${next.slug}"><small>Projet suivant →</small><strong>${escapeHTML(next.title)}</strong></a>
    </nav>
    <div class="lightbox" id="lightbox"><img alt=""></div>`;

  const lb = document.getElementById("lightbox");
  root.querySelectorAll(".media img").forEach((img) =>
    img.addEventListener("click", () => {
      lb.querySelector("img").src = img.src;
      lb.querySelector("img").alt = img.alt;
      lb.classList.add("is-open");
    })
  );
  lb.addEventListener("click", () => lb.classList.remove("is-open"));

  const sliderEl = document.getElementById("media-slider");
  const slider = sliderEl && initSlider(sliderEl, {
    dots: root.querySelector(".slider-dots"),
    // Met en pause les vidéos qui sortent de l'écran
    onChange(idx, slides) {
      slides.forEach((s, j) => { if (j !== idx) s.querySelector("video")?.pause(); });
    },
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("is-open");
    if (!slider || lb.classList.contains("is-open") || e.target.closest("input, textarea, video")) return;
    if (e.key === "ArrowLeft") slider.prev();
    if (e.key === "ArrowRight") slider.next();
  });
}

/* ---------- À propos : outils ---------- */
function renderTools(tools) {
  // « tile » : l'icône est déjà une tuile d'appli complète (Adobe, Java), elle remplit le carré
  const item = (t, hidden) =>
    `<li${hidden ? ' aria-hidden="true"' : ""}><span class="tool-icon${t.tile ? " is-tile" : ""}"><img src="${t.icon}" alt=""></span>${escapeHTML(t.name)}</li>`;
  // La liste est dupliquée pour que le défilement boucle sans coupure
  const el = document.getElementById("tools");
  if (!el) return;
  el.innerHTML =
    tools.map((t) => item(t, false)).join("") + tools.map((t) => item(t, true)).join("");
}

/* ---------- Petits dessins à côté des titres de section ---------- */
const DOODLES = ["d-star", "d-sparkles"];
function addDoodles() {
  document.querySelectorAll(".section-head h2, .site-footer h2").forEach((h, i) => {
    if (h.querySelector(".doodle")) return;
    h.insertAdjacentHTML("beforeend", `<span class="doodle doodle-title ${DOODLES[i % DOODLES.length]}" aria-hidden="true"></span>`);
  });
}

/* ---------- Trait qui se dessine au défilement (accueil) ---------- */
// Le trait serpente dans les marges, passe d’un côté à l’autre entre les sections,
// et une étoile suit sa pointe au fil du défilement.
function initTrail() {
  const main = document.querySelector("main.has-trail");
  if (!main) return;
  const svg = main.querySelector(".scroll-trail");
  const ghost = svg.querySelector(".trail-ghost");
  const inks = [...svg.querySelectorAll(".trail-ink")];
  const ink = inks[0];
  const head = main.querySelector(".trail-head");
  let length = 0;

  function build() {
    // offsetHeight (et non scrollHeight) : le SVG lui-même ne doit pas agrandir la page
    const W = main.clientWidth, H = main.offsetHeight;
    const container = main.querySelector(".container");
    const gutter = container ? container.getBoundingClientRect().left - main.getBoundingClientRect().left : 0;
    svg.style.display = gutter < 70 ? "none" : "";
    head.style.display = svg.style.display;
    if (gutter < 70) return;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    lastH = H;

    const top = main.getBoundingClientRect().top;
    const thread = main.querySelector(".thread");
    if (!thread || !thread.offsetHeight) { length = 0; head.style.display = "none"; return; }
    // Le fil ne vit que dans la section Projets : il descend au centre, avec une très légère ondulation
    const xC = W / 2;
    const y0 = thread.getBoundingClientRect().top - top + 10;
    const y1 = thread.getBoundingClientRect().bottom - top - 10;
    let d = `M ${xC} ${y0}`;
    const step = 140;
    for (let y = y0, k = 0; y < y1; y += step, k++) {
      const yn = Math.min(y + step, y1), amp = (k % 2 ? -1 : 1) * 3;
      d += ` C ${xC + amp} ${y + step * 0.35}, ${xC - amp} ${y + step * 0.65}, ${xC} ${yn}`;
    }
    ghost.setAttribute("d", d);
    inks.forEach((p) => p.setAttribute("d", d));
    length = ink.getTotalLength();
    inks.forEach((p) => (p.style.strokeDasharray = `${length}`));
    update();
  }

  function update() {
    if (!length || svg.style.display === "none") return;
    const rect = main.getBoundingClientRect();
    // la pointe suit un repère situé aux deux tiers de l’écran
    const target = Math.min(Math.max(innerHeight * 0.66 - rect.top, 0), rect.height);
    const first = ink.getPointAtLength(0).y, last = ink.getPointAtLength(length).y;
    head.style.opacity = target > first - 40 && target < last + 120 ? "1" : "0";
    // recherche de la longueur de tracé correspondant à cette hauteur
    let lo = 0, hi = length;
    for (let k = 0; k < 18; k++) {
      const m = (lo + hi) / 2;
      if (ink.getPointAtLength(m).y < target) lo = m; else hi = m;
    }
    inks.forEach((p) => (p.style.strokeDashoffset = `${length - lo}`));
    const pt = ink.getPointAtLength(lo);
    // les points du fil s’allument au passage de l’étoile
    main.querySelectorAll(".thread-dot").forEach((dot) => {
      const r = dot.getBoundingClientRect();
      dot.classList.toggle("is-lit", r.top + r.height / 2 - rect.top <= pt.y + 2);
    });
    head.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
  }

  // mise à jour directe à chaque défilement : l’étoile reste collée au trait, sans décalage
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  let lastH = 0;
  new ResizeObserver(() => { if (Math.abs(main.offsetHeight - lastH) > 2) build(); }).observe(main);
  build();
}

/* ---------- Apparition au scroll ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.1 }
);
// Ce qui est déjà à l'écran s'affiche tout de suite, le reste au scroll
const initReveal = () =>
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-visible");
    else io.observe(el);
  });

/* ---------- Démarrage ---------- */
(async function init() {
  renderLayout();
  initReveal();
  try {
    const data = await loadData();
    if (page === "home") renderGrid(data.projects);
    if (page === "project") renderProject(data.projects);
    renderTools(data.tools);
    renderSkills(data.skills);
    addDoodles();
    initTrail();
    } catch (err) {
    const target = document.getElementById("grid") || document.getElementById("project") || document.getElementById("skills");
    if (target) target.innerHTML = `<p class="error">${escapeHTML(err.message)}<br>Lancez le site avec <code>python3 server.py</code>.</p>`;
  }
  initReveal();
})();
