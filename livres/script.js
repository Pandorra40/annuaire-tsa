const API_LIVRES = 'https://www.annuaire-tsa.fr/api/livres.php';

/* ── State ────────────────────────────────────────────────── */
let classics     = [];
let activeCat    = '';
let searchQuery  = '';

/* ── DOM ──────────────────────────────────────────────────── */
const classicsEl = document.getElementById('classics');
const newRelEl   = document.getElementById('newReleases');
const searchEl   = document.getElementById('search');
const catBtns    = document.querySelectorAll('#catFilters .filter-btn');

/* ── Charger les classiques depuis l'API ──────────────────── */
async function loadClassics() {
  try {
    const res  = await fetch(API_LIVRES);
    if (!res.ok) throw new Error('Erreur réseau');
    const data = await res.json();
    classics = data.filter(b => b.type === 'classique');
    renderClassics();
  } catch (e) {
    classicsEl.innerHTML = `<div class="empty">Impossible de charger les livres (${e.message}).</div>`;
  }
}

/* ── Render classiques ────────────────────────────────────── */
function renderClassics() {
  const q = searchQuery.toLowerCase();
  const list = classics.filter(b => {
    const text = (b.titre + ' ' + b.auteur + ' ' + (b.description || '') + ' ' + b.categorie).toLowerCase();
    const matchQ   = q === '' || text.includes(q);
    const matchCat = activeCat === '' || b.categorie === activeCat;
    return matchQ && matchCat;
  });

  classicsEl.innerHTML = '';
  if (list.length === 0) {
    classicsEl.innerHTML = '<div class="empty">Aucun classique pour ce filtre.</div>';
    return;
  }
  list.forEach(b => classicsEl.appendChild(buildCard(b, true)));
}

/* ── Build card ───────────────────────────────────────────── */
function buildCard(b, isClassic = false) {
  const art = document.createElement('article');
  art.className = 'card' + (isClassic ? ' card--classic' : '');

  const titre  = b.titre  || b.title  || 'Titre inconnu';
  const auteur = b.auteur || b.author || 'Auteur inconnu';
  const annee  = b.annee  || b.year   || '';
  const cat    = b.categorie || b.cat || '';
  const desc   = b.description || b.desc || '';
  const lien   = b.lien   || b.link   || '#';
  const cover  = b.cover  || null;

  const coverHTML = cover
    ? `<img class="card-cover" src="${cover}" alt="Couverture de ${titre}" loading="lazy">`
    : `<div class="card-cover card-cover--placeholder">${titre.charAt(0)}</div>`;

  art.innerHTML = `
    ${coverHTML}
    <div class="card-body">
      <div class="card-top">
        <h3 class="book-title">${titre}</h3>
        ${isClassic ? '<span class="type-badge classic">Classique</span>' : ''}
      </div>
      <div class="book-author">${auteur}${annee ? ' · ' + annee : ''}</div>
      ${desc ? `<p class="book-desc">${desc}</p>` : ''}
      ${cat ? `<div class="card-tags"><span class="tag">${cat}</span></div>` : ''}
      <div class="card-footer">
        <a class="card-link" href="${lien}" target="_blank" rel="noopener">En savoir plus →</a>
      </div>
    </div>
  `;
  return art;
}

/* ── Fetch nouveautés Open Library ────────────────────────── */
function isLatinScript(str) {
  return str && !/[Ѐ-ӿ؀-ۿ一-鿿぀-ヿ가-힯֐-׿]/.test(str);
}

async function loadNewReleases() {
  try {
    const url = 'https://openlibrary.org/search.json?subject=autism&sort=new&limit=40&fields=title,author_name,first_publish_year,cover_i,key,subject,language';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('Erreur réseau');
    const data = await res.json();

    const books = (data.docs || [])
      .filter(d => {
        if (!d.title || !isLatinScript(d.title)) return false;
        const author = (d.author_name || [])[0] || '';
        if (!isLatinScript(author)) return false;
        const langs = d.language || [];
        if (langs.length > 0 && !langs.includes('fre') && !langs.includes('eng')) return false;
        if (!langs.length) {
          const suspectWords = /\b(del|de la|los|las|el |una |por |con |que |allá|doble|excepcionalidad|autismo\b|niño|viaje)\b/i;
          if (suspectWords.test(d.title)) return false;
        }
        return d.first_publish_year >= 2020;
      })
      .slice(0, 9);

    newRelEl.innerHTML = '';
    if (books.length === 0) {
      newRelEl.innerHTML = '<div class="empty">Aucune nouveauté trouvée pour le moment.</div>';
      return;
    }
    books.forEach(d => {
      const b = {
        titre:  d.title,
        auteur: d.author_name ? d.author_name.slice(0, 2).join(', ') : 'Auteur inconnu',
        annee:  d.first_publish_year || '',
        cat:    d.subject ? d.subject.slice(0, 2).join(' · ') : '',
        desc:   '',
        cover:  d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
        lien:   `https://openlibrary.org${d.key}`
      };
      newRelEl.appendChild(buildCard(b, false));
    });
  } catch (err) {
    newRelEl.innerHTML = `<div class="empty">Impossible de charger les nouveautés (${err.message}).</div>`;
  }
}

/* ── Filtres ──────────────────────────────────────────────── */
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderClassics();
  });
});

searchEl.addEventListener('input', () => {
  searchQuery = searchEl.value.trim();
  renderClassics();
});

/* ── Init ─────────────────────────────────────────────────── */
loadClassics();
loadNewReleases();
setInterval(loadNewReleases, 24 * 60 * 60 * 1000);
