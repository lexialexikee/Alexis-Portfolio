/* ============ EDIT YOUR CONTENT HERE ============ */
// img: put your file path (e.g. "images/poster1.jpg"). Leave "" to show a placeholder.
// Add as many projects as you like: the row loops automatically.
// Optional: add  desc: "A short description"  to a project to show it when the card is opened.
const PROJECTS = [
  { title: "Meet our Barber", category: "Company Publication", img: "images/project1.png" },
  { title: "R&J Barbershop", category: "Company Publication",          img: "images/project2.png" },
  { title: "Mental Health Awareness", category: "School Publication",                  img: "images/project3.png" },
  { title: "ComSci-tation", category: "School Publication",                   img: "images/project4.png" },
  { title: "Calling out BSCS 1-4", category: "School Publication",           img: "images/project5.png" },
  { title: "Inside Out", category: "Academic Commission", img: "images/project6.png" },
  { title: "University Graduation Ball", category: "Event Backdrop",                  img: "images/project7.png" },
  { title: "Mr & Ms SHS", category: "Event Backdrop", img: "images/project8.png" },
  { title: "Backburner", category: "Personal Experiment", img: "images/project9.png" },
  { title: "Sinigang Kaibigan", category: "Personal Experience", img: "images/project10.png" },

];
// size: 1 = large, 2 = medium, 3 = small
const SKILLS = [
  ["Graphic Design",1],["Canva",1],["Visual Communication",2],["Branding and Logo Design",2],
  ["Layout and Publication Design",2],["HTML and CSS",2],["JavaScript",2],["Python",3],
];
const SCROLL_SPEED = 55; // gallery auto-scroll, pixels per second. 0 turns it off.
/* ================================================= */

const $ = (s, el = document) => el.querySelector(s);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;

/* Placeholder images (SVG data URIs) */
function placeholder(label, ratio = "4:5", i = 0) {
  const [w, h] = ratio.split(":").map(Number), W = 400, H = Math.round(W * h / w);
  const tones = ["#d9d9de", "#cbcbd1", "#e5e5ea"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${tones[i % 3]}"/><path d="M0 0L${W} ${H}M${W} 0L0 ${H}" stroke="#b5b5bd" stroke-width="1.5"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#55555c">${label}</text><text x="50%" y="${H / 2 + 26}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#7a7a82">Placeholder ${ratio}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
// transparent person-shaped placeholder, so you can preview the cutout and fade
const silhouette = () => "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><g fill="#c4c5cc" fill-opacity=".92"><circle cx="200" cy="150" r="82"/><path d="M30 500c0-120 74-200 170-200s170 80 170 200z"/></g></svg>');
document.querySelectorAll("img[data-placeholder]").forEach(img => { img.src = img.dataset.placeholder === "silhouette" ? silhouette() : placeholder(img.dataset.placeholder, img.dataset.ratio); });

$("#year").textContent = new Date().getFullYear();
$("#skills").innerHTML = SKILLS.map(([n, s]) => `<li class="s${s}">${n}</li>`).join("");

/* Split text into letter (or word) spans; returns the spans */
function split(el, by = "letter") {
  const t = el.textContent.trim(); el.setAttribute("aria-label", t); el.textContent = "";
  const out = [];
  t.split(" ").forEach((word, wi, all) => {
    const w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
    (by === "word" ? [word] : [...word]).forEach(ch => { const s = document.createElement("span"); s.textContent = ch; w.appendChild(s); out.push(s); });
    el.appendChild(w);
    if (wi < all.length - 1) el.appendChild(document.createTextNode(" "));
  });
  return out;
}

/* ---------- "Avoid the cursor" physics, reused by hero and about ---------- */
const mouse = { x: -9999, y: -9999 };
addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("pointerdown", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("pointerup", e => { if (e.pointerType === "touch") mouse.x = mouse.y = -9999; });
document.documentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

const dodgers = [];
function dodger(root, els, o = {}) {
  const { R = 150, F = 5, rot = 0.35, spring = 0.04 } = o;
  const items = els.map(el => ({ el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, cx: 0, cy: 0, seed: Math.random() * 2 - 1, sleep: true }));
  const d = {
    measure() {
      items.forEach(i => i.el.style.transform = "none");
      const hr = root.getBoundingClientRect();
      items.forEach(i => {
        const r = i.el.getBoundingClientRect();
        i.cx = r.left - hr.left + r.width / 2; i.cy = r.top - hr.top + r.height / 2;
        i.x = i.y = i.vx = i.vy = i.r = i.vr = 0; i.sleep = true; i.el.style.transform = "";
      });
    },
    step() {
      const hr = root.getBoundingClientRect();
      if (hr.bottom < 0 || hr.top > innerHeight) return;
      const mx = mouse.x - hr.left, my = mouse.y - hr.top, rad = typeof R === "function" ? R() : R;
      for (const l of items) {
        const dx = l.cx + l.x - mx, dy = l.cy + l.y - my, dist = Math.hypot(dx, dy) || 1, near = dist < rad;
        if (!near && l.sleep) continue;
        if (near) {
          const f = Math.pow(1 - dist / rad, 2) * F;
          l.vx += (dx / dist) * f + l.seed * f * 0.6;   // seed = slight unpredictability
          l.vy += (dy / dist) * f - l.seed * f * 0.4;
          l.vr += (dx / dist) * f * rot;
        }
        l.vx -= l.x * spring; l.vy -= l.y * spring; l.vr -= l.r * 0.05;
        l.vx *= 0.86; l.vy *= 0.86; l.vr *= 0.86;
        l.x += l.vx; l.y += l.vy; l.r += l.vr;
        l.sleep = !near && Math.abs(l.x) + Math.abs(l.y) + Math.abs(l.vx) + Math.abs(l.vy) + Math.abs(l.r) < 0.05;
        l.el.style.transform = l.sleep ? "" : `translate(${l.x.toFixed(2)}px,${l.y.toFixed(2)}px) rotate(${l.r.toFixed(2)}deg)`;
      }
    }
  };
  dodgers.push(d); return d;
}
let mTimer;
const measureAll = (delay = 0) => { clearTimeout(mTimer); mTimer = setTimeout(() => { slides.forEach(s => { s.el.style.translate = "none"; }); dodgers.forEach(d => d.measure()); measureSlides(); }, delay); };

/* Hero: giant letters */
const giant = $("#giant"), hero = $("#home");
giant.textContent = giant.textContent.trim() || "PORTFOLIO";
const heroLetters = split(giant);
heroLetters.forEach((s, i) => s.style.animationDelay = `${0.1 + i * 0.07}s`);
giant.setAttribute("aria-label", "Portfolio");
dodger(hero, heroLetters, { R: () => Math.max(150, innerWidth * 0.13), F: 5 });

/* About: heading letters, paragraph words, skills, photo */
const about = $("#about");
dodger(about, split($(".about h2")), { R: 140, F: 4 });
document.querySelectorAll(".about-body p").forEach(p => dodger(about, split(p, "word"), { R: 90, F: 2.2, rot: 0.2 }));
dodger(about, [...document.querySelectorAll("#skills li")], { R: 130, F: 4 });
dodger(about, [$(".about-photo")], { R: 240, F: 1.4, rot: 0.15, spring: 0.03 });

/* Hoverable headline letters */
[$(".works h2"), $(".contact-cta")].forEach(h => { split(h); h.classList.add("hl"); });

addEventListener("resize", () => measureAll(150));
addEventListener("load", () => measureAll(1700));
document.fonts.ready.then(() => measureAll(1700));

/* ---------- Gallery: compact, auto-scrolling row ---------- */
const stage = $("#gallery");
const OFFS = ["0rem", "3.2rem", "1rem", "2.4rem", "0.4rem", "3rem", "1.6rem"]; // staggered heights
const cardHTML = (p, i, clone) => `
  <button class="card" data-i="${i}" style="--off:${OFFS[i % OFFS.length]}" aria-label="Open ${p.title}"${clone ? ' tabindex="-1" aria-hidden="true"' : ""}>
    <span class="card-in">
      <img src="${p.img || placeholder(p.title, "4:5", i)}" alt="${p.title}" loading="lazy" draggable="false">
      <span class="card-info"><span class="card-title">${p.title}</span><span class="card-cat">${p.category}</span><span class="card-more">View project</span></span>
    </span>
  </button>`;
const track = document.createElement("div"); track.className = "track"; stage.appendChild(track);
let cards = [], cw = 0, gap = 0, S = 0, pos = 0, vel = 0, hover = false, dragging = false, moved = false, startX = 0, lastX = 0, lastT = 0, dragVel = 0, tilt = null;

function build() {
  track.innerHTML = PROJECTS.map((p, i) => cardHTML(p, i, false)).join("");
  cw = track.firstElementChild.offsetWidth; gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  S = (cw + gap) * PROJECTS.length;
  const copies = Math.max(2, Math.ceil(stage.clientWidth / S) + 1);       // enough copies to loop seamlessly
  for (let k = 1; k < copies; k++) track.insertAdjacentHTML("beforeend", PROJECTS.map((p, i) => cardHTML(p, i, true)).join(""));
  cards = [...track.children];
}
function place() {
  const W = stage.clientWidth;
  pos %= S; if (pos > 0) pos -= S;
  track.style.transform = `translate3d(${pos.toFixed(1)}px,0,0)`;
  cards.forEach((c, k) => {
    const o = Math.max(-1.4, Math.min(1.4, (pos + k * (cw + gap) + cw / 2 - W / 2) / (W / 2)));  // -1 left edge, 0 center, 1 right edge
    c.style.transform = `perspective(1400px) rotateY(${(-o * 20).toFixed(1)}deg) translateZ(${(-Math.abs(o) * 70).toFixed(0)}px)`;
    c.style.zIndex = Math.round(100 - Math.abs(o) * 40);
  });
}
function scrollRow(dt) {
  if (!dragging) {
    vel += ((hover || reduced ? 0 : -SCROLL_SPEED) - vel) * Math.min(1, dt * 3);  // eases to a stop on hover, back up on leave
    pos += vel * dt;
  }
  place();
}
const impulse = dir => { vel += dir * (cw + gap) * 3; };
$("#prev").onclick = () => impulse(1);
$("#next").onclick = () => impulse(-1);
stage.addEventListener("keydown", e => { if (e.key === "ArrowLeft") impulse(1); if (e.key === "ArrowRight") impulse(-1); });
stage.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });
stage.addEventListener("pointerleave", () => { hover = false; resetTilt(); });

stage.addEventListener("pointerdown", e => { dragging = true; moved = false; startX = lastX = e.clientX; lastT = e.timeStamp; dragVel = 0; });
addEventListener("pointermove", e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dt = (e.timeStamp - lastT) / 1000 || 0.016;
  if (Math.abs(e.clientX - startX) > 6) { moved = true; stage.classList.add("drag"); }
  pos += dx; dragVel = Math.max(-1800, Math.min(1800, dragVel * 0.6 + (dx / dt) * 0.4)); lastX = e.clientX; lastT = e.timeStamp;
});
const endDrag = () => { if (dragging) { dragging = false; vel = dragVel; stage.classList.remove("drag"); } };
addEventListener("pointerup", endDrag); addEventListener("pointercancel", endDrag);

function resetTilt() { if (tilt) { tilt.style.setProperty("--rx", "0deg"); tilt.style.setProperty("--ry", "0deg"); tilt = null; } }
stage.addEventListener("pointermove", e => {
  const ci = e.target.closest(".card-in");
  if (tilt && tilt !== ci) resetTilt();
  if (!ci || e.pointerType !== "mouse" || dragging) return;
  tilt = ci; const r = ci.getBoundingClientRect();
  ci.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(1) + "deg");
  ci.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 16).toFixed(1) + "deg");
});
addEventListener("resize", () => { build(); place(); });
build(); place();

/* Lightbox */
const lb = $("#lightbox");
stage.addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (!c || moved) return;
  const p = PROJECTS[c.dataset.i];
  $("#lbImg").src = p.img || placeholder(p.title, "4:5", +c.dataset.i);
  $("#lbImg").alt = p.title;
  $("#lbCap").innerHTML = `<strong>${p.title}</strong> · ${p.category}${p.desc ? `<br><span class="lb-desc">${p.desc}</span>` : ""}`;
  lb.showModal();
});
$("#lbClose").onclick = () => lb.close();
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
$("#lbImg").onclick = () => lb.classList.toggle("zoomed");              // click the image: fit-to-screen <-> real size
lb.addEventListener("close", () => lb.classList.remove("zoomed"));
const lbFrame = $("#lbFrame");
lbFrame.addEventListener("pointermove", e => {                          // tilt toward the cursor
  if (e.pointerType !== "mouse" || lb.classList.contains("zoomed")) return;
  const r = lbFrame.getBoundingClientRect();
  lbFrame.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(1) + "deg");
  lbFrame.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(1) + "deg");
});
lbFrame.addEventListener("pointerleave", () => { lbFrame.style.setProperty("--rx", "0deg"); lbFrame.style.setProperty("--ry", "0deg"); });

/* ---------- Nav active section ---------- */
const links = [...document.querySelectorAll(".nav li a")];
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(s => secObs.observe(s));

/* ---------- Scroll slide: elements slide off when you scroll away, and slide back when you scroll back ---------- */
// Add data-slide="l" | "r" | "u" | "d" to any element in index.html to give it this effect.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const slides = [...document.querySelectorAll("[data-slide]")].map(el => ({ el, dir: { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[el.dataset.slide] || [-1, 0], c: 0, a: -1 }));
let maxScroll = 0;
function measureSlides() {
  slides.forEach(s => { s.el.style.translate = "none"; const r = s.el.getBoundingClientRect(); s.c = r.top + scrollY + r.height / 2; s.h = r.height; s.a = -1; });
  maxScroll = document.documentElement.scrollHeight - innerHeight;
}
const ease = t => t * t * (3 - 2 * t);
function updateSlides() {
  if (reduced) return;
  const vh = innerHeight, vw = innerWidth;
  for (const s of slides) {
    const pos = s.c - scrollY, bottom = pos + s.h / 2, top = pos - s.h / 2;     // element edges in the viewport
    const bottomAtEnd = s.c - maxScroll + s.h / 2, topAtEnd = s.c - maxScroll - s.h / 2;
    // Leaving: starts only once the element's bottom edge is in the top 30% of the screen, so it slides off as it really leaves
    const exitStart = bottomAtEnd > 0 ? Math.min(0.3 * vh, bottomAtEnd - 2) : 0.3 * vh;   // never leave a resting element displaced at the page end
    // Arriving: only while its top edge is in the bottom 25% of the screen
    let enterStart = Math.max(0.75 * vh, topAtEnd + 4);
    if (s.c - s.h / 2 < vh) enterStart = Math.max(enterStart, s.c - s.h / 2 + 4);          // elements already on screen at load don't slide in
    const e = ease(clamp((exitStart - bottom) / (0.35 * vh), 0, 1)), f = ease(clamp((top - enterStart) / (0.25 * vh), 0, 1)), a = Math.max(e, f);
    if (Math.abs(a - s.a) < 0.001) continue;
    s.a = a;
    const x = s.dir[0] * a * vw * 0.6, y = s.dir[1] * (e - f) * vh * 0.25;
    s.el.style.translate = a ? `${x.toFixed(1)}px ${y.toFixed(1)}px` : "";
    s.el.style.opacity = a ? (1 - a).toFixed(2) : "";
  }
}
measureSlides();

/* ---------- Custom cursor (desktop only) ---------- */
const cur = $(".cursor"); let cx = 0, cy = 0;
if (fine && !reduced) {
  addEventListener("pointermove", () => cur.classList.add("on"));
  document.addEventListener("pointerover", e => cur.classList.toggle("big", !!e.target.closest("a,button,.card")));
}

/* ---------- Hero sky: twinkling stars + shooting stars ---------- */
const sky = $("#stars"), sctx = sky.getContext("2d");
let SW = 0, SH = 0, twinkles = [], shooters = [], nextShot = 1200;
function sizeSky() {
  const dpr = Math.min(devicePixelRatio || 1, 2), r = hero.getBoundingClientRect();
  SW = r.width; SH = r.height; sky.width = SW * dpr; sky.height = SH * dpr; sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  twinkles = Array.from({ length: Math.round(SW * SH / 14000) }, () => ({ x: Math.random() * SW, y: Math.random() * SH * 0.85, r: Math.random() * 1.2 + 0.3, p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.5 }));
}
function drawSky(t, dt) {
  const hr = hero.getBoundingClientRect(); if (hr.bottom < 0 || hr.top > innerHeight) return;
  sctx.clearRect(0, 0, SW, SH); sctx.fillStyle = "#fff";
  for (const s of twinkles) {
    sctx.globalAlpha = 0.25 + 0.45 * (Math.sin(t * 0.001 * s.s + s.p) * 0.5 + 0.5);
    sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.283); sctx.fill();
  }
  if (!reduced) {
    if (t > nextShot) {                       // launch a new shooting star every 1 to 3 seconds
      const ang = (22 + Math.random() * 18) * Math.PI / 180;
      shooters.push({ x: SW * (0.25 + Math.random() * 0.85), y: -10 + Math.random() * SH * 0.4, dx: -Math.cos(ang), dy: Math.sin(ang), sp: 700 + Math.random() * 600, len: 120 + Math.random() * 140, age: 0, T: 0.9 + Math.random() * 0.6 });
      nextShot = t + 1000 + Math.random() * 2200;
    }
    shooters = shooters.filter(s => s.age < s.T);
    for (const s of shooters) {
      s.age += dt; s.x += s.dx * s.sp * dt; s.y += s.dy * s.sp * dt;
      const a = Math.sin(Math.PI * Math.min(1, s.age / s.T)), tx = s.x - s.dx * s.len, ty = s.y - s.dy * s.len;
      const g = sctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.globalAlpha = 1; sctx.strokeStyle = g; sctx.lineWidth = 2; sctx.lineCap = "round";
      sctx.beginPath(); sctx.moveTo(s.x, s.y); sctx.lineTo(tx, ty); sctx.stroke();
      sctx.fillStyle = `rgba(255,255,255,${a})`; sctx.beginPath(); sctx.arc(s.x, s.y, 2.2, 0, 6.283); sctx.fill();
    }
  }
  sctx.globalAlpha = 1;
}
addEventListener("resize", () => { sizeSky(); drawSky(0, 0); });
sizeSky(); drawSky(0, 0);

/* ---------- One animation loop ---------- */
const photo = $("#heroPhoto");
let lastFrame = 0;
requestAnimationFrame(function loop(t) {
  const dt = Math.min((t - lastFrame) / 1000 || 0, 0.05); lastFrame = t;
  updateSlides();
  if (!reduced) {
    dodgers.forEach(d => d.step());
    const hr = hero.getBoundingClientRect(), on = mouse.x > -999;
    photo.style.transform = `translate(${on ? (mouse.x - hr.left) / hr.width * -24 + 12 : 0}px,${on ? (mouse.y - hr.top) / hr.height * -16 + 8 : 0}px)`;
    drawSky(t, dt);
  }
  scrollRow(dt);
  if (fine && !reduced) { cx += (mouse.x - cx) * .2; cy += (mouse.y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; }
  requestAnimationFrame(loop);
});