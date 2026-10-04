/* Kalimna sur le code de runway.com (transcrit par CHEF) : ce que faisait le JavaScript de Runway, rien de plus.
   En-tete au defilement, menu telephone, onglets de l'accueil, carrousel de l'about. */
(function () {
  'use strict';

  function chaque(liste, f) { Array.prototype.forEach.call(liste, f); }

  /* en-tete : fond blanc et texte fonce des qu'on quitte le haut de la page, comme runway.com */
  var header = document.querySelector('header');
  var fond = header && header.querySelector('div[aria-hidden="true"]');
  var blancAuHaut = header && header.classList.contains('text-white');
  function enTete() {
    if (!header || !fond) return;
    var bas = window.scrollY > 8;
    fond.classList.toggle('opacity-0', !bas);
    fond.classList.toggle('opacity-100', bas);
    if (blancAuHaut) {
      header.classList.toggle('text-white', !bas);
      header.classList.toggle('text-offBlack', bas);
    }
  }
  window.addEventListener('scroll', enTete, { passive: true });
  enTete();

  /* menu telephone */
  var ouvrir = document.getElementById('wh-menu-open');
  var menu = document.getElementById('wh-menu');
  var fermer = document.getElementById('wh-menu-close');
  function basculer(etat) {
    if (!menu) return;
    menu.hidden = !etat;
    if (ouvrir) ouvrir.setAttribute('aria-expanded', etat ? 'true' : 'false');
    document.documentElement.style.overflow = etat ? 'hidden' : '';
  }
  function touche(el, f) {
    if (!el) return;
    el.addEventListener('click', f);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); }
    });
  }
  touche(ouvrir, function () { basculer(true); });
  touche(fermer, function () { basculer(false); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) basculer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') basculer(false); });

  /* onglets de l'accueil : un trait se remplit, puis l'onglet suivant, comme runway.com */
  var onglets = document.querySelector('[data-wh-onglets]');
  if (onglets) {
    var etats = JSON.parse(onglets.getAttribute('data-wh-onglets'));
    var pistes = onglets.querySelectorAll('[data-wh-piste]');
    var panneau = document.getElementById('wh-panel');
    var vue = panneau.querySelector('img');
    var courant = 0, debut = performance.now(), DUREE = 7000;
    var montrer = function (k) {
      courant = k;
      debut = performance.now();
      var source = panneau.querySelector('source');
      if (source && etats[k].webp) source.srcset = etats[k].webp;
      vue.src = etats[k].src;
      vue.alt = etats[k].alt;
      panneau.setAttribute('aria-labelledby', 'wh-tab-' + k);
      chaque(onglets.querySelectorAll('button[data-wh-onglet]'), function (b) {
        var on = b.getAttribute('data-wh-onglet') === String(k);
        var s = b.querySelector('span');
        if (b.getAttribute('role') === 'tab') {
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          s.classList.toggle('opacity-100', on);
          s.classList.toggle('opacity-30', !on);
          s.classList.toggle('hover:opacity-60', !on);
        } else {
          b.setAttribute('aria-current', on ? 'true' : 'false');
          s.classList.toggle('opacity-100', on);
          s.classList.toggle('opacity-50', !on);
          s.classList.toggle('hover:opacity-80', !on);
        }
      });
    };
    var tic = function (t) {
      var f = Math.min(1, Math.max(0, (t - debut) / DUREE));
      chaque(pistes, function (p) {
        p.style.width = (+p.getAttribute('data-wh-piste') === courant ? f * 100 : 0) + '%';
      });
      if (f >= 1) montrer((courant + 1) % etats.length);
      requestAnimationFrame(tic);
    };
    chaque(onglets.querySelectorAll('button[data-wh-onglet]'), function (b) {
      b.addEventListener('click', function () { montrer(+b.getAttribute('data-wh-onglet')); });
    });
    etats.forEach(function (e) {
      var i = new Image(), s = panneau.querySelector('source');
      if (s && e.webp) { i.sizes = s.getAttribute('sizes') || '100vw'; i.srcset = e.webp; } else i.src = e.src;
    });
    requestAnimationFrame(tic);
  }

  /* carrousel de l'about : on le tire */
  var carrousel = document.querySelector('[data-wh-carrousel]');
  if (carrousel) {
    var bande = carrousel.querySelector('[data-wh-piste-carrousel]');
    var x = 0, depart = null, x0 = 0;
    var poser = function (v) {
      var min = Math.min(0, carrousel.clientWidth - bande.scrollWidth);
      x = Math.max(min, Math.min(0, v));
      bande.style.transform = 'translate3d(' + x + 'px,0,0)';
    };
    carrousel.addEventListener('pointerdown', function (e) {
      depart = e.clientX;
      x0 = x;
      carrousel.setPointerCapture(e.pointerId);
    });
    carrousel.addEventListener('pointermove', function (e) { if (depart !== null) poser(x0 + e.clientX - depart); });
    ['pointerup', 'pointercancel'].forEach(function (n) {
      carrousel.addEventListener(n, function () { depart = null; });
    });
    window.addEventListener('resize', function () { poser(x); });
  }
})();
