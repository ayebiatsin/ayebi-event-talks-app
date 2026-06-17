/* ===========================
   BigQuery Release Notes – JS
   =========================== */

const KNOWN_TAGS = ['Feature', 'Announcement', 'Deprecation', 'Issue', 'Changed', 'Security', 'Breaking Change'];

let allEntries = [];
let activeFilter = 'All';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const refreshBtn    = document.getElementById('refreshBtn');
const refreshSvg    = document.getElementById('refreshSvg');
const refreshLabel  = document.getElementById('refreshLabel');
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const errorMsg      = document.getElementById('errorMsg');
const entriesFeed   = document.getElementById('entriesFeed');
const statsBar      = document.getElementById('statsBar');
const entryCountEl  = document.getElementById('entryCount');
const feedUpdatedEl = document.getElementById('feedUpdated');
const filterChips   = document.getElementById('filterChips');
const lastUpdatedEl = document.getElementById('lastUpdated');
const tweetModal    = document.getElementById('tweetModal');
const tweetTextarea = document.getElementById('tweetText');
const tweetLink     = document.getElementById('tweetLink');
const charCountEl   = document.getElementById('charCount');

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function loadReleaseNotes() {
  setLoading(true);
  try {
    const res  = await fetch('/api/release-notes');
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'Unknown error');
    allEntries = data.entries;
    renderAll();
    updateLastFetched();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

// ── UI state helpers ──────────────────────────────────────────────────────────
function setLoading(on) {
  refreshBtn.disabled = on;
  if (on) {
    refreshSvg.classList.add('spin');
    refreshLabel.textContent = 'Loading…';
    loadingState.style.display  = 'flex';
    errorState.style.display    = 'none';
    entriesFeed.style.display   = 'none';
    statsBar.style.display      = 'none';
  } else {
    refreshSvg.classList.remove('spin');
    refreshLabel.textContent = 'Refresh';
    loadingState.style.display = 'none';
  }
}

function showError(msg) {
  errorMsg.textContent   = msg;
  errorState.style.display  = 'flex';
  entriesFeed.style.display = 'none';
  statsBar.style.display    = 'none';
}

function updateLastFetched() {
  const now = new Date();
  lastUpdatedEl.textContent = 'Fetched at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Tag extraction ────────────────────────────────────────────────────────────
function extractTags(html) {
  const matches = [];
  const regex   = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const raw = m[1].replace(/<[^>]+>/g, '').trim();
    if (raw) matches.push(raw);
  }
  return [...new Set(matches)];
}

function stripHtml(html) {
  const tmp   = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  const tagsFound = new Set(['All']);
  allEntries.forEach(e => extractTags(e.content).forEach(t => tagsFound.add(t)));

  // Build filter chips
  filterChips.innerHTML = '';
  tagsFound.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-' + (tag === 'All' ? 'all' : tag.replace(/\s+/g, ''));
    chip.textContent = tag;
    if (tag === activeFilter) chip.classList.add('chip-active');
    chip.addEventListener('click', () => {
      activeFilter = tag;
      renderAll();
    });
    filterChips.appendChild(chip);
  });

  // Filter
  const visible = activeFilter === 'All'
    ? allEntries
    : allEntries.filter(e => extractTags(e.content).includes(activeFilter));

  // Stats
  entryCountEl.textContent  = visible.length;
  feedUpdatedEl.textContent = formatDate(allEntries[0]?.updated || '');
  statsBar.style.display    = 'flex';

  // Cards
  entriesFeed.innerHTML  = '';
  entriesFeed.style.display = 'flex';
  errorState.style.display  = 'none';

  if (visible.length === 0) {
    entriesFeed.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:60px 0;">No entries match this filter.</p>';
    return;
  }

  visible.forEach((entry, idx) => {
    const card = buildCard(entry, idx);
    entriesFeed.appendChild(card);
  });
}

function buildCard(entry, idx) {
  const card = document.createElement('div');
  card.className  = 'entry-card';
  card.style.animationDelay = (idx * 40) + 'ms';
  card.dataset.idx = idx;

  const tags    = extractTags(entry.content);
  const plainText = stripHtml(entry.content).replace(/\s+/g, ' ').trim();

  card.innerHTML = `
    <div class="entry-header">
      <div class="entry-meta">
        <span class="entry-date">${escHtml(entry.title)}</span>
      </div>
      <div class="entry-actions">
        ${entry.link ? `<a href="${escHtml(entry.link)}" target="_blank" rel="noopener" class="icon-btn btn-docs" title="View on Google Cloud Docs" onclick="event.stopPropagation()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Docs
        </a>` : ''}
        <button class="icon-btn btn-copy" title="Copy content" onclick="copyCardContent(event, this)" data-text="${escHtml(plainText)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
        <button class="icon-btn btn-tweet" title="Share on X" onclick="openTweetModal(event, this)" data-title="${escHtml(entry.title)}" data-link="${escHtml(entry.link)}" data-text="${escHtml(plainText.slice(0, 180))}" data-tags="${escHtml(tags.join(','))}">
          <svg width="12" height="12" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z" fill="white"/></svg>
          Tweet
        </button>
      </div>
    </div>
    <div class="entry-body">${styleTags(entry.content)}</div>
  `;

  // Card click = select
  card.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    document.querySelectorAll('.entry-card.selected').forEach(c => c.classList.remove('selected'));
    card.classList.toggle('selected');
  });

  return card;
}

// Style the <h3> tag elements with colored badges
function styleTags(html) {
  return html.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (match, inner) => {
    const tag = inner.replace(/<[^>]+>/g, '').trim();
    const cls = KNOWN_TAGS.includes(tag) ? 'tag-' + tag.replace(/\s+/g, '') : 'tag-default';
    return `<h3 class="${cls}">${inner}</h3>`;
  });
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Tweet Modal ───────────────────────────────────────────────────────────────
function openTweetModal(event, btn) {
  event.stopPropagation();

  const title  = btn.dataset.title  || '';
  const link   = btn.dataset.link   || '';
  const text   = btn.dataset.text   || '';
  const tags   = btn.dataset.tags   ? btn.dataset.tags.split(',').filter(Boolean) : [];

  const hashtags = tags.map(t => '#' + t.replace(/\s+/g, '')).join(' ');
  const snippet  = text.length > 120 ? text.slice(0, 117) + '…' : text;

  const defaultTweet = `📢 BigQuery Update – ${title}\n\n${snippet}\n\n${hashtags}${link ? '\n' + link : ''}`.trim();

  tweetTextarea.value = defaultTweet.slice(0, 280);
  updateCharCount();
  updateTweetLink();

  tweetModal.style.display = 'flex';
  setTimeout(() => tweetTextarea.focus(), 100);
}

function closeTweetModal(event) {
  if (event && event.target !== tweetModal) return;
  tweetModal.style.display = 'none';
}

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && tweetModal.style.display !== 'none') {
    tweetModal.style.display = 'none';
  }
});

function updateCharCount() {
  const len = tweetTextarea.value.length;
  charCountEl.textContent = len;
  const footer = document.querySelector('.tweet-footer');
  footer.classList.toggle('char-over', len > 280);
  updateTweetLink();
}

function updateTweetLink() {
  const text = tweetTextarea.value.slice(0, 280);
  tweetLink.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
}

// ── Export & Copy Utilities ───────────────────────────────────────────────────

async function copyCardContent(event, btn) {
  event.stopPropagation();
  const text = btn.dataset.text || '';
  try {
    await navigator.clipboard.writeText(text);
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

function exportToCsv() {
  if (allEntries.length === 0) return;
  
  const headers = ['Date', 'Title', 'Link', 'Tags', 'Content'];
  const rows = allEntries.map(entry => {
    const title = entry.title || '';
    const date = formatDate(entry.updated);
    const link = entry.link || '';
    const tags = extractTags(entry.content).join(', ');
    const content = stripHtml(entry.content).replace(/\s+/g, ' ').trim();
    
    return [date, title, link, tags, content].map(val => `"${val.replace(/"/g, '""')}"`).join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bigquery_release_notes.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadReleaseNotes);
