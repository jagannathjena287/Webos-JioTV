(() => {
  'use strict';

  const SERVICE_URI = 'luna://com.codex.jtvwebos.service/';
  const AUTH_KEY = 'jtv-webos.jio-auth.v1';
  const CHANNELS_KEY = 'jtv-webos.channels.v1';
  const FAVORITES_KEY = 'jtv-webos.favorites.v1';
  const RECENTS_KEY = 'jtv-webos.recents.v1';
  const LANGUAGE_KEY = 'jtv-webos.language.v1';
  const PLAYER_CONTROLS_HIDE_MS = 4500;

  // Curated channels for browser testing when webOS Luna bus is not available
  const DEMO_CHANNELS = [
    { id: '101', name: 'Zee Bangla', group: 'Entertainment', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Zee_Bangla.png' },
    { id: '102', name: 'Star Jalsha HD', group: 'Entertainment', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Jalsha_HD.png' },
    { id: '103', name: 'Colors Bangla', group: 'Entertainment', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Colors_Bangla.png' },
    { id: '104', name: 'Sony Aath', group: 'Entertainment', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Sony_Aath.png' },
    { id: '105', name: 'ABP Ananda', group: 'News', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/ABP_Ananda.png' },
    { id: '106', name: '24 Ghanta', group: 'News', language: 'Bengali', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/24_Ghanta.png' },
    { id: '201', name: 'Star Plus HD', group: 'Entertainment', language: 'Hindi', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Plus_HD.png' },
    { id: '202', name: 'Sony SAB HD', group: 'Entertainment', language: 'Hindi', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Sony_SAB_HD.png' },
    { id: '203', name: 'Zee TV HD', group: 'Entertainment', language: 'Hindi', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Zee_TV_HD.png' },
    { id: '204', name: 'Colors HD', group: 'Entertainment', language: 'Hindi', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Colors_HD.png' },
    { id: '205', name: 'Aaj Tak HD', group: 'News', language: 'Hindi', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Aaj_Tak_HD.png' },
    { id: '301', name: 'Star Sports 1 HD', group: 'Sports', language: 'English', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Star_Sports_1_HD.png' },
    { id: '302', name: 'Sports18 1 HD', group: 'Sports', language: 'English', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Sports18_1_HD.png' },
    { id: '303', name: 'Discovery HD World', group: 'Infotainment', language: 'English', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Discovery_HD.png' },
    { id: '304', name: 'National Geographic HD', group: 'Infotainment', language: 'English', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/Nat_Geo_HD.png' },
    { id: '305', name: 'CNN-News18', group: 'News', language: 'English', isDrm: false, logoUrl: 'https://jiotvimages.cdn.jio.com/dare_images/images/CNN_News_18.png' }
  ];

  // Browser test streams with video & audio for testing the player in a desktop browser
  const DEMO_STREAMS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  ];

  const state = {
    channels: readStored(CHANNELS_KEY, []),
    recents: readStored(RECENTS_KEY, []),
    group: 'all',
    language: readStored(LANGUAGE_KEY, 'all'),
    activeTab: 'home',
    selected: -1,
    previewChannel: null,
    epgCache: {},
    tuneBuffer: '',
    tuneTimer: null,
    active: null,
    auth: readStored(AUTH_KEY, null),
    proxyBaseUrl: '',
    proxyRequest: null,
    proxyPromise: null,
    loading: false,
    otpSent: false,
    controlsHideTimer: null
  };

  const $ = (id) => document.getElementById(id);

  const elements = {
    connection: $('connection'),
    connectionLabel: $('connection-label'),
    headerClock: $('header-clock'),
    list: $('channel-list'),
    groups: $('groups'),
    languages: $('languages'),
    languageFilterRow: $('language-filter-row'),
    empty: $('empty'),
    search: $('search'),
    searchResultsList: $('search-results-list'),
    searchResultsHeading: $('search-results-heading'),
    dialog: $('settings-dialog'),
    mobile: $('jio-mobile'),
    otp: $('jio-otp'),
    otpRow: $('otp-row'),
    signedIn: $('signed-in'),
    loginFields: $('login-fields'),
    settingsMessage: $('settings-message'),
    playerView: $('player-view'),
    player: $('player'),
    playerPrompt: $('player-prompt'),
    playerError: $('player-error'),
    controls: $('player-controls'),
    channelCount: $('channel-count'),
    nowTitle: $('now-title'),
    qualityStatus: $('quality-status'),
    toast: $('toast'),
    tuneDisplay: $('tune-display'),
    tuneDigits: $('tune-digits'),
    programGuide: $('program-guide'),
    guideChannel: $('guide-channel'),
    guideCurrentTitle: $('guide-current-title'),
    guideCurrentTime: $('guide-current-time'),
    guideCurrentDescription: $('guide-current-description'),
    guideProgress: $('guide-progress-fill'),
    guideProgressBar: $('guide-progress'),
    guideProgramList: $('guide-program-list')
  };

  function readStored(key, fallback) {
    try { const val = JSON.parse(localStorage.getItem(key)); return val == null ? fallback : val; }
    catch (_) { return fallback; }
  }

  function clearElement(element) {
    if (!element) return;
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function formatTime(date) {
    let h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
  }

  function updateClock() {
    if (elements.headerClock) elements.headerClock.textContent = formatTime(new Date());
  }
  setInterval(updateClock, 1000);
  updateClock();

  function isWebOSTV() {
    return typeof window.PalmServiceBridge !== 'undefined';
  }

  function serviceCall(method, parameters) {
    return new Promise((resolve, reject) => {
      if (!isWebOSTV() || !window.webOS || !webOS.service || !webOS.service.request) {
        reject(new Error('TV services are unavailable in desktop browser.'));
        return;
      }
      webOS.service.request(SERVICE_URI, {
        method,
        parameters: parameters || {},
        onSuccess(result) {
          if (result && result.returnValue === false) reject(new Error(result.errorText || 'TV service error.'));
          else resolve(result || {});
        },
        onFailure(err) { reject(new Error(err && err.errorText || 'Could not contact TV service.')); }
      });
    });
  }

  function saveAuth(auth) {
    state.auth = auth || null;
    if (state.auth) localStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
    else localStorage.removeItem(AUTH_KEY);
    updateAccountUI();
  }

  function normalizeChannels(channels) {
    return (channels || []).map((ch) => ({
      id: String(ch.id),
      title: ch.name || 'Unknown channel',
      logo: ch.logoUrl || '',
      group: ch.group || 'General',
      language: ch.language || 'Other',
      isDrm: !!ch.isDrm
    }));
  }

  function languageKey(language) {
    const val = String(language || 'Other').trim().toLowerCase();
    if (['hi', 'hin', 'hindi'].includes(val)) return 'hindi';
    if (['bn', 'ben', 'bangla', 'bengali', 'বাংলা'].includes(val)) return 'bengali';
    if (['en', 'eng', 'english'].includes(val)) return 'english';
    return val || 'other';
  }

  function setConnection(label, connected) {
    if (elements.connectionLabel) elements.connectionLabel.textContent = label;
    if (elements.connection) elements.connection.classList.toggle('connected', !!connected);
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), 3000);
  }

  function toggleFavorite(channel) {
    const favorites = new Set(readStored(FAVORITES_KEY, []));
    if (favorites.has(channel.id)) favorites.delete(channel.id);
    else favorites.add(channel.id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    showToast(favorites.has(channel.id) ? `Added ${channel.title} to Favourites` : `Removed ${channel.title}`);
    render();
  }

  function recordRecent(channel) {
    const recents = readStored(RECENTS_KEY, []).filter((id) => id !== channel.id);
    recents.unshift(channel.id);
    state.recents = recents.slice(0, 10);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(state.recents));
  }

  // ==================== TABS & NAVIGATION ====================
  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.view-panel').forEach((panel) => {
      panel.classList.remove('active');
    });

    const panelKey = (tabName === 'search' || tabName === 'guide')
      ? tabName
      : (tabName === 'livetv' || tabName === 'hdtv' || tabName === 'freetv' || tabName === 'favorites')
        ? 'livetv'
        : 'home';
    const targetPanel = $(`view-${panelKey}`);
    if (targetPanel) targetPanel.classList.add('active');

    if (tabName === 'favorites') {
      state.group = 'favorites';
      state.language = 'all';
    } else if (tabName === 'hdtv' || tabName === 'freetv' || tabName === 'livetv') {
      if (state.group === 'favorites') state.group = 'all';
    }

    render();
    if (tabName === 'guide' && state.previewChannel) {
      populateGuideTimeline(state.previewChannel);
    }
  }

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ==================== HERO SECTION BINDING ====================
  function updateHero(channel) {
    if (!channel) return;
    $('hero-channel-name').textContent = channel.title;
    $('hero-channel-id').textContent = channel.id;
    $('hero-show-title').textContent = `${channel.title} Live`;
    $('hero-show-sub').textContent = `${channel.group} · ${channel.language}`;

    const logoInit = $('hero-logo-init');
    const logoImg = $('hero-logo-img');
    if (channel.logo) {
      logoImg.src = channel.logo;
      logoImg.style.display = 'block';
      logoInit.style.display = 'none';
      logoImg.onerror = () => { logoImg.style.display = 'none'; logoInit.style.display = 'block'; logoInit.textContent = channel.title.slice(0, 2).toUpperCase(); };
    } else {
      logoImg.style.display = 'none';
      logoInit.style.display = 'block';
      logoInit.textContent = channel.title.slice(0, 2).toUpperCase();
    }

    const now = new Date();
    const end = new Date(now.getTime() + 45 * 60000);
    $('hero-until-time').textContent = `until ${formatTime(end)}`;
    $('hero-start-time').textContent = formatTime(new Date(now.getTime() - 15 * 60000));
    $('hero-end-time').textContent = formatTime(end);

    const favorites = new Set(readStored(FAVORITES_KEY, []));
    $('hero-fav-star').textContent = favorites.has(channel.id) ? '★' : '☆';

    $('hero-watch-btn').onclick = () => play(channel);
    $('hero-guide-btn').onclick = () => switchTab('guide');
    $('hero-fav-btn').onclick = () => {
      toggleFavorite(channel);
      updateHero(channel);
    };
  }

  // ==================== LIVE TV PREVIEW BINDING ====================
  function updatePreview(channel) {
    if (!channel) return;
    state.previewChannel = channel;
    $('preview-channel-name').textContent = channel.title;
    $('preview-show-title').textContent = `${channel.title} Broadcast`;
    $('preview-show-meta').textContent = `${channel.group} · ID ${channel.id}`;
    $('preview-lang-tag').textContent = channel.language;

    const logoInit = $('preview-logo-init');
    const logoImg = $('preview-logo-img');
    if (channel.logo) {
      logoImg.src = channel.logo;
      logoImg.style.display = 'block';
      logoInit.style.display = 'none';
      logoImg.onerror = () => { logoImg.style.display = 'none'; logoInit.style.display = 'block'; logoInit.textContent = channel.title.slice(0, 2).toUpperCase(); };
    } else {
      logoImg.style.display = 'none';
      logoInit.style.display = 'block';
      logoInit.textContent = channel.title.slice(0, 2).toUpperCase();
    }

    const now = new Date();
    $('preview-start-time').textContent = formatTime(new Date(now.getTime() - 20 * 60000));
    $('preview-end-time').textContent = formatTime(new Date(now.getTime() + 40 * 60000));
    if ($('preview-progress-fill')) $('preview-progress-fill').style.width = '35%';

    $('preview-watch-btn').onclick = () => play(channel);
    $('preview-schedule-btn').onclick = () => switchTab('guide');

    loadChannelEpg(channel).then((programmes) => {
      if (!state.previewChannel || state.previewChannel.id !== channel.id || !programmes.length) return;
      const nowMs = Date.now();
      const current = programmes.find((p) => p.startMs <= nowMs && p.endMs > nowMs) || programmes[0];
      if (!current) return;
      $('preview-show-title').textContent = current.title;
      $('preview-start-time').textContent = formatTime(new Date(current.startMs));
      $('preview-end-time').textContent = formatTime(new Date(current.endMs));
      if ($('preview-desc') && current.description) $('preview-desc').textContent = current.description;
      const pct = Math.max(5, Math.min(100, Math.round(((nowMs - current.startMs) / Math.max(1, current.endMs - current.startMs)) * 100)));
      if ($('preview-progress-fill')) $('preview-progress-fill').style.width = `${pct}%`;
    });
  }

  // ==================== CARD CREATION ====================
  function createLiveCard(channel) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'live-card';
    card.dataset.channelId = channel.id;

    const art = document.createElement('div');
    art.className = 'card-art';

    const top = document.createElement('div');
    top.className = 'card-top';
    const live = document.createElement('span');
    live.className = 'live-pill';
    live.textContent = 'LIVE';
    const star = document.createElement('span');
    star.className = 'card-star';
    const favorites = new Set(readStored(FAVORITES_KEY, []));
    star.textContent = favorites.has(channel.id) ? '★' : '';
    top.append(live, star);

    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';
    const logoBox = document.createElement('div');
    logoBox.className = 'logo-box';
    if (channel.logo) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = channel.logo;
      img.alt = '';
      img.onerror = () => { logoBox.textContent = channel.title.slice(0, 2).toUpperCase(); };
      logoBox.append(img);
    } else {
      logoBox.textContent = channel.title.slice(0, 2).toUpperCase();
    }

    const info = document.createElement('div');
    info.className = 'card-info';
    const title = document.createElement('strong');
    title.className = 'card-title';
    title.textContent = channel.title;
    const sub = document.createElement('span');
    sub.className = 'card-sub';
    sub.textContent = `${channel.group} · ID ${channel.id}`;
    info.append(title, sub);
    bottom.append(logoBox, info);

    card.append(art, top, bottom);

    card.addEventListener('focus', () => {
      updateHero(channel);
      updatePreview(channel);
    });
    card.addEventListener('click', () => play(channel));
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFavorite(channel); });
    return card;
  }

  function createChannelCard(channel) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'channel-card';
    card.dataset.channelId = channel.id;

    const logo = document.createElement('div');
    logo.className = 'logo-box';
    if (channel.logo) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = channel.logo;
      img.alt = '';
      img.onerror = () => { logo.textContent = channel.title.slice(0, 2).toUpperCase(); };
      logo.append(img);
    } else {
      logo.textContent = channel.title.slice(0, 2).toUpperCase();
    }

    const copy = document.createElement('div');
    copy.className = 'channel-copy';
    const title = document.createElement('strong');
    title.textContent = channel.title;
    const group = document.createElement('small');
    group.textContent = `${channel.group} · ${channel.language}`;
    copy.append(title, group);

    const idTag = document.createElement('span');
    idTag.className = 'channel-id';
    idTag.textContent = channel.id;

    card.append(logo, copy, idTag);

    const favorites = new Set(readStored(FAVORITES_KEY, []));
    if (favorites.has(channel.id)) {
      const star = document.createElement('span');
      star.style.color = '#5aa9ff';
      star.style.fontSize = '18px';
      star.textContent = '★';
      card.append(star);
    }

    card.addEventListener('focus', () => updatePreview(channel));
    card.addEventListener('click', () => play(channel));
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFavorite(channel); });
    return card;
  }

  // ==================== RENDER PIPELINE ====================
  function filteredChannels() {
    const q = (elements.search ? elements.search.value : '').trim().toLowerCase();
    const favorites = new Set(readStored(FAVORITES_KEY, []));

    return state.channels.filter((ch) => {
      if (state.activeTab === 'favorites' && !favorites.has(ch.id)) return false;
      if (state.activeTab === 'hdtv' && !ch.title.toLowerCase().includes('hd')) return false;

      const matchesGroup = state.group === 'all' || (state.group === 'favorites' ? favorites.has(ch.id) : ch.group === state.group);
      const matchesLanguage = state.language === 'all' || languageKey(ch.language) === state.language;
      const matchesQuery = !q || `${ch.title} ${ch.group} ${ch.language} ${ch.id}`.toLowerCase().includes(q);

      return matchesGroup && matchesLanguage && matchesQuery;
    });
  }

  function render() {
    const channels = filteredChannels();
    const favorites = new Set(readStored(FAVORITES_KEY, []));

    if (state.channels.length && !state.previewChannel) {
      const first = state.channels.find((c) => favorites.has(c.id)) || state.channels[0];
      updateHero(first);
      updatePreview(first);
    }

    renderHomeStrips();
    renderLiveTvColumns(channels);
    renderSearchResults(channels);
    renderGuideList();
  }

  function renderHomeStrips() {
    const favorites = new Set(readStored(FAVORITES_KEY, []));

    const recentsList = $('row-recents-list');
    if (recentsList) {
      clearElement(recentsList);
      const recentChannels = state.recents.map((id) => state.channels.find((c) => c.id === id)).filter(Boolean);
      $('row-recents').style.display = recentChannels.length ? 'flex' : 'none';
      recentChannels.forEach((c) => recentsList.append(createLiveCard(c)));
    }

    const favsList = $('row-favorites-list');
    if (favsList) {
      clearElement(favsList);
      const favChannels = state.channels.filter((c) => favorites.has(c.id));
      $('row-favorites').style.display = favChannels.length ? 'flex' : 'none';
      favChannels.forEach((c) => favsList.append(createLiveCard(c)));
    }

    ['bengali', 'hindi', 'english'].forEach((lang) => {
      const container = $(`row-${lang}-list`);
      if (container) {
        clearElement(container);
        const lChannels = state.channels.filter((c) => languageKey(c.language) === lang);
        $(`row-${lang}`).style.display = lChannels.length ? 'flex' : 'none';
        lChannels.slice(0, 10).forEach((c) => container.append(createLiveCard(c)));
      }
    });
  }

  function renderLiveTvColumns(channels) {
    const favorites = new Set(readStored(FAVORITES_KEY, []));
    const catList = $('livetv-cat-list');
    if (catList) {
      clearElement(catList);

      const genreCounts = new Map();
      state.channels.forEach((c) => {
        const g = (c.group || 'General').trim();
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });

      const entries = [
        { key: 'all', label: 'All Channels', count: state.channels.length },
        { key: 'favorites', label: 'Favourites', count: state.channels.filter((c) => favorites.has(c.id)).length }
      ];

      Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .forEach(([groupName, count]) => {
          entries.push({ key: groupName, label: groupName, count });
        });

      entries.forEach(({ key, label, count }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `cat-btn${state.group === key ? ' active' : ''}`;
        btn.innerHTML = `<span>${label}</span><span class="cat-count">${count}</span>`;
        btn.onclick = () => {
          state.group = key;
          render();
        };
        catList.append(btn);
      });
    }

    const langBar = $('livetv-lang-bar');
    if (langBar) {
      clearElement(langBar);
      const langCounts = new Map();
      langCounts.set('all', { label: 'All Languages', count: state.channels.length });

      state.channels.forEach((c) => {
        const key = languageKey(c.language);
        const cur = langCounts.get(key) || { label: c.language || 'Other', count: 0 };
        cur.count++;
        langCounts.set(key, cur);
      });

      langCounts.forEach((val, key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `lang-pill${state.language === key ? ' active' : ''}`;
        btn.textContent = val.label;
        btn.onclick = () => {
          state.language = key;
          localStorage.setItem(LANGUAGE_KEY, JSON.stringify(key));
          render();
        };
        langBar.append(btn);
      });
    }

    const libTitle = $('library-title');
    if (libTitle) {
      libTitle.textContent = state.group === 'all'
        ? 'All Live Channels'
        : state.group === 'favorites'
          ? 'Favourite Channels'
          : state.group;
    }

    if (elements.list) {
      clearElement(elements.list);
      const PAGE_SIZE = 80;
      let rendered = 0;

      function appendBatch() {
        const slice = channels.slice(rendered, rendered + PAGE_SIZE);
        slice.forEach((c) => elements.list.append(createChannelCard(c)));
        rendered += slice.length;
        const oldMore = $('load-more-channels');
        if (oldMore) oldMore.remove();
        if (rendered < channels.length) {
          const moreBtn = document.createElement('button');
          moreBtn.id = 'load-more-channels';
          moreBtn.type = 'button';
          moreBtn.className = 'pill-btn secondary-btn load-more-btn';
          moreBtn.textContent = `Show More (${channels.length - rendered} remaining)`;
          moreBtn.onclick = () => {
            appendBatch();
            const firstNew = elements.list.children[rendered - slice.length];
            if (firstNew) firstNew.focus();
          };
          elements.list.append(moreBtn);
        }
      }

      appendBatch();
      elements.list.hidden = channels.length === 0;
    }

    if (elements.channelCount) {
      elements.channelCount.textContent = `${channels.length} channels`;
    }

    if (elements.empty) {
      elements.empty.hidden = channels.length > 0;
    }
  }

  function renderSearchResults(channels) {
    if (!elements.searchResultsList) return;
    clearElement(elements.searchResultsList);
    const q = (elements.search ? elements.search.value : '').trim();
    if (elements.searchResultsHeading) {
      elements.searchResultsHeading.textContent = q ? `Results for "${q}" (${channels.length})` : 'Popular Channels';
    }
    channels.slice(0, 12).forEach((c) => elements.searchResultsList.append(createChannelCard(c)));
  }

  function parseEpochMs(val) {
    if (val == null) return 0;
    const num = Number(val);
    if (isFinite(num) && num > 0) return num < 1e12 ? num * 1000 : num;
    const parsed = Date.parse(String(val));
    return isFinite(parsed) ? parsed : 0;
  }

  async function loadChannelEpg(channel) {
    if (!channel) return [];
    const cached = state.epgCache[channel.id];
    if (cached && Date.now() - cached.fetchedAt < 300000) return cached.programmes;

    let programmes = [];
    if (isWebOSTV()) {
      try {
        const res = await serviceCall('epg/get', { channelId: channel.id, offset: 0 });
        programmes = (res && res.programmes ? res.programmes : []).map((p) => ({
          startMs: parseEpochMs(p.startEpoch),
          endMs: parseEpochMs(p.endEpoch),
          title: p.title || `${channel.title} Live`,
          description: p.description || p.category || `Live broadcast on ${channel.title}.`
        })).filter((p) => p.startMs > 0 && p.endMs > p.startMs);
      } catch (_) {
        programmes = [];
      }
    }

    if (!programmes.length) {
      const base = new Date();
      base.setMinutes(0, 0, 0);
      const labels = ['Live Broadcast', 'Featured Programme', 'Prime Showcase', 'Special Presentation', 'Late Edition'];
      programmes = labels.map((label, idx) => ({
        startMs: base.getTime() + (idx - 1) * 3600000,
        endMs: base.getTime() + idx * 3600000,
        title: `${channel.title} — ${label}`,
        description: `${channel.group} · ${channel.language} broadcast on ${channel.title}.`
      }));
    }

    state.epgCache[channel.id] = { fetchedAt: Date.now(), programmes };
    return programmes;
  }

  function renderGuideList() {
    const picker = $('guide-channel-picker');
    if (!picker) return;
    const targetCount = String(state.channels.length);
    if (picker.dataset.count === targetCount && picker.children.length > 0) return;

    clearElement(picker);
    picker.dataset.count = targetCount;

    const preferred = state.active || state.previewChannel || state.channels[0];
    state.channels.slice(0, 120).forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cat-btn${preferred && preferred.id === c.id ? ' active' : ''}`;
      btn.innerHTML = `<span>${c.title}</span><span class="cat-count">ID ${c.id}</span>`;
      btn.onclick = () => {
        picker.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        populateGuideTimeline(c);
      };
      picker.append(btn);
    });
    if (preferred) populateGuideTimeline(preferred);
  }

  async function populateGuideTimeline(channel) {
    if (!channel) return;
    $('guide-active-ch-name').textContent = `${channel.title} · ID ${channel.id}`;
    $('guide-active-show-name').textContent = 'Loading schedule…';
    const timeline = $('guide-schedule-timeline');
    clearElement(timeline);

    const programmes = await loadChannelEpg(channel);
    if (!timeline) return;
    clearElement(timeline);

    const nowMs = Date.now();
    const relevant = programmes.filter((p) => p.endMs >= nowMs - 3600000);
    const list = (relevant.length ? relevant : programmes).slice(0, 12);
    const current = list.find((p) => p.startMs <= nowMs && p.endMs > nowMs) || list[0];
    $('guide-active-show-name').textContent = current ? current.title : `${channel.title} Live`;

    list.forEach((prog) => {
      const isNow = prog.startMs <= nowMs && prog.endMs > nowMs;
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `timeline-slot${isNow ? ' current' : ''}`;
      slot.innerHTML = `
        <div class="slot-time">${isNow ? 'LIVE NOW · ' : ''}${formatTime(new Date(prog.startMs))} - ${formatTime(new Date(prog.endMs))}</div>
        <div class="slot-info">
          <strong>${prog.title}</strong>
          <p>${prog.description}</p>
        </div>
      `;
      slot.onclick = () => play(channel);
      timeline.append(slot);
    });
  }

  // ==================== ON-SCREEN KEYBOARDS ====================
  document.querySelectorAll('#tv-keyboard .key-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (!elements.search) return;
      if (key === 'SPACE') elements.search.value += ' ';
      else if (key === 'BACKSPACE') elements.search.value = elements.search.value.slice(0, -1);
      else if (key === 'CLEAR') elements.search.value = '';
      else elements.search.value += key.toLowerCase();
      render();
    });
  });

  document.querySelectorAll('#tv-numpad .num-key').forEach((btn) => {
    btn.addEventListener('click', () => {
      const digit = btn.dataset.digit;
      const targetInput = state.otpSent ? elements.otp : elements.mobile;
      if (!targetInput) return;
      if (digit === 'clear') targetInput.value = '';
      else if (digit === 'back') targetInput.value = targetInput.value.slice(0, -1);
      else if (targetInput.value.length < (state.otpSent ? 6 : 10)) targetInput.value += digit;
    });
  });

  // ==================== CHANNELS INGESTION ====================
  async function loadChannels() {
    state.loading = true;
    setConnection('Connecting to Jio…', false);
    try {
      const result = await serviceCall('library/getChannels', {});
      state.channels = normalizeChannels(result.channels);
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(state.channels));
      setConnection(state.auth ? 'Jio ready' : 'Sign in to watch', !!state.auth);
    } catch (err) {
      // In desktop browser preview, use demo channels
      if (!state.channels || state.channels.length === 0) {
        state.channels = normalizeChannels(DEMO_CHANNELS);
      }
      setConnection(state.auth ? 'Jio ready' : 'Browser Mode', !!state.auth);
    } finally {
      state.loading = false;
      render();
    }
  }

  // ==================== VIDEO PLAYBACK (WEB & WEBOS) ====================
  async function play(channel) {
    if (!channel) return;
    recordRecent(channel);
    state.active = channel;

    // Explicitly hide any overlays
    clearTuneBuffer();
    if (elements.programGuide) elements.programGuide.classList.remove('visible');
    if ($('player-channel-drawer')) $('player-channel-drawer').classList.remove('visible');
    if (elements.tuneDisplay) elements.tuneDisplay.classList.remove('visible');
    if (elements.playerPrompt) elements.playerPrompt.hidden = true;
    if (elements.playerError) elements.playerError.hidden = true;

    elements.playerView.classList.add('open');
    elements.nowTitle.textContent = channel.title;
    elements.qualityStatus.textContent = channel.title.toLowerCase().includes('hd') ? '1080p HD' : '720p HD';
    elements.controls.hidden = false;
    revealPlayerControls(true);

    // BROWSER TEST MODE:
    // Play local sample.mp4 so user can test the video player, OSD, pause/resume, and audio in browser
    if (!isWebOSTV()) {
      elements.player.src = 'sample.mp4';
      elements.player.currentTime = 0;
      elements.player.muted = false;
      const playPromise = elements.player.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay unmuted blocked by browser policy, trying muted:', err);
          elements.player.muted = true;
          elements.player.play().catch((e) => {
            console.error('Playback error:', e);
            elements.playerError.textContent = 'Click Play button to start video.';
            elements.playerError.hidden = false;
          });
        });
      }
      showToast(`Playing ${channel.title}`);
      return;
    }

    // ON-TV WEBOS MODE:
    try {
      const baseUrl = await startProxy();
      const manifestUrl = `${baseUrl}/live/${encodeURIComponent(channel.id)}.m3u8`;
      elements.player.src = manifestUrl;
      elements.player.play().catch(() => {});
    } catch (err) {
      elements.playerError.textContent = err.message || 'Stream unavailable.';
      elements.playerError.hidden = false;
    }
  }

  function stopPlayback() {
    state.active = null;
    elements.player.pause();
    elements.player.removeAttribute('src');
    elements.playerView.classList.remove('open');
    elements.controls.hidden = true;
    if (elements.programGuide) elements.programGuide.classList.remove('visible');
    if ($('player-channel-drawer')) $('player-channel-drawer').classList.remove('visible');
  }

  function startProxy() {
    if (!state.auth || !state.auth.authToken) return Promise.reject(new Error('Sign in with Jio in Settings before watching.'));
    if (state.proxyBaseUrl) return Promise.resolve(state.proxyBaseUrl);
    if (state.proxyPromise) return state.proxyPromise;

    state.proxyPromise = new Promise((resolve, reject) => {
      let settled = false;
      state.proxyRequest = webOS.service.request(SERVICE_URI, {
        method: 'proxy/start', parameters: { auth: state.auth }, subscribe: true,
        onSuccess(result) {
          if (result && result.baseUrl) {
            state.proxyBaseUrl = result.baseUrl;
            if (!settled) { settled = true; resolve(result.baseUrl); }
          }
          if (result && result.returnValue === false && !settled) { settled = true; reject(new Error(result.errorText || 'Could not start TV stream service.')); }
        },
        onFailure(err) { if (!settled) { settled = true; reject(new Error(err && err.errorText || 'Stream service failed.')); } }
      });
    }).finally(() => { state.proxyPromise = null; });
    return state.proxyPromise;
  }

  function revealPlayerControls(autoHide) {
    if (state.controlsHideTimer) clearTimeout(state.controlsHideTimer);
    elements.controls.hidden = false;
    if (autoHide) {
      state.controlsHideTimer = setTimeout(() => { elements.controls.hidden = true; }, PLAYER_CONTROLS_HIDE_MS);
    }
  }

  elements.player.addEventListener('playing', () => {
    $('play-toggle').textContent = '❚❚';
    elements.playerError.hidden = true;
  });

  elements.player.addEventListener('pause', () => {
    $('play-toggle').textContent = '▶';
  });

  // ==================== AUTH & SETTINGS ====================
  function updateAccountUI() {
    const signedIn = !!(state.auth && state.auth.authToken);
    if (elements.signedIn) elements.signedIn.hidden = !signedIn;
    if (elements.loginFields) elements.loginFields.hidden = signedIn;
    if (signedIn && $('account-label')) $('account-label').textContent = `Signed in as ${state.auth.mobile ? state.auth.mobile.slice(0, 3) + '••••' + state.auth.mobile.slice(-3) : 'Jio User'}`;
  }

  function openSettings() {
    elements.settingsMessage.textContent = '';
    elements.mobile.value = state.auth && state.auth.mobile ? state.auth.mobile : '';
    elements.otp.value = '';
    elements.otpRow.hidden = !state.otpSent;
    updateAccountUI();
    elements.dialog.showModal();
  }

  async function sendOtp() {
    const mobile = elements.mobile.value.trim();
    if (mobile.length !== 10) {
      elements.settingsMessage.textContent = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    $('send-otp').disabled = true;
    elements.settingsMessage.textContent = 'Requesting OTP from Jio…';

    // BROWSER MODE SIMULATION:
    if (!isWebOSTV()) {
      setTimeout(() => {
        state.otpSent = true;
        elements.otpRow.hidden = false;
        elements.settingsMessage.textContent = 'Demo OTP sent! Enter 123456 to verify (Browser simulation).';
        elements.otp.value = '123456';
        $('send-otp').disabled = false;
        elements.otp.focus();
      }, 700);
      return;
    }

    // ON-TV MODE:
    try {
      const res = await serviceCall('auth/sendOtp', { mobile });
      state.otpSent = true;
      elements.otpRow.hidden = false;
      elements.settingsMessage.textContent = res.message || 'OTP sent to your phone.';
      elements.otp.focus();
    } catch (err) {
      elements.settingsMessage.textContent = err.message || 'Could not request OTP.';
    } finally {
      $('send-otp').disabled = false;
    }
  }

  async function verifyOtp() {
    const mobile = elements.mobile.value.trim();
    const otp = elements.otp.value.trim();
    if (!otp) {
      elements.settingsMessage.textContent = 'Please enter the 6-digit OTP.';
      return;
    }

    $('verify-otp').disabled = true;
    elements.settingsMessage.textContent = 'Verifying OTP…';

    // BROWSER MODE SIMULATION:
    if (!isWebOSTV()) {
      setTimeout(() => {
        saveAuth({ mobile, authToken: 'demo_token_' + Date.now(), ssoToken: 'demo_sso' });
        state.otpSent = false;
        elements.dialog.close();
        setConnection('Jio ready', true);
        showToast('Signed in successfully (Browser simulation).');
        $('verify-otp').disabled = false;
      }, 700);
      return;
    }

    // ON-TV MODE:
    try {
      const res = await serviceCall('auth/verifyOtp', { mobile, otp });
      saveAuth(res.auth);
      state.otpSent = false;
      elements.dialog.close();
      setConnection('Jio ready', true);
      showToast('Signed in to Jio.');
    } catch (err) {
      elements.settingsMessage.textContent = err.message || 'OTP verification failed.';
    } finally {
      $('verify-otp').disabled = false;
    }
  }

  // ==================== REMOTE / D-PAD NAVIGATION ====================
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    const code = e.keyCode;

    if (/^[0-9]$/.test(key) && !elements.dialog.open && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      appendTuneDigit(key);
      return;
    }

    if (key === 'Enter' && state.tuneBuffer) {
      e.preventDefault();
      tuneToEnteredChannel();
      return;
    }

    if (key === 'Escape' || code === 461) {
      e.preventDefault();
      if (elements.dialog.open) { elements.dialog.close(); return; }
      const drawer = $('player-channel-drawer');
      if (drawer && drawer.classList.contains('visible')) {
        drawer.classList.remove('visible');
        revealPlayerControls(true);
        return;
      }
      if (elements.programGuide && elements.programGuide.classList.contains('visible')) {
        elements.programGuide.classList.remove('visible');
        return;
      }
      if (state.active) { stopPlayback(); return; }
      if (state.activeTab !== 'home') { switchTab('home'); return; }
    }

    if (code === 405 && state.active) {
      e.preventDefault();
      togglePlayerGuide();
    }
  });

  function appendTuneDigit(digit) {
    if (state.tuneBuffer.length >= 6) return;
    state.tuneBuffer += digit;
    clearTimeout(state.tuneTimer);
    state.tuneTimer = setTimeout(clearTuneBuffer, 4000);
    elements.tuneDigits.textContent = state.tuneBuffer;
    elements.tuneDisplay.classList.add('visible');
  }

  function clearTuneBuffer() {
    state.tuneBuffer = '';
    elements.tuneDisplay.classList.remove('visible');
  }

  function tuneToEnteredChannel() {
    const id = state.tuneBuffer;
    clearTuneBuffer();
    const ch = state.channels.find((c) => c.id === id);
    if (ch) play(ch);
    else showToast(`No channel found with ID ${id}`);
  }

  // ==================== EVENT LISTENERS ====================
  $('settings-open').addEventListener('click', openSettings);
  $('settings-close').addEventListener('click', () => elements.dialog.close());
  $('settings-done').addEventListener('click', () => elements.dialog.close());
  $('refresh-btn').addEventListener('click', () => {
    showToast('Refreshing channels…');
    loadChannels();
  });
  $('send-otp').addEventListener('click', sendOtp);
  $('verify-otp').addEventListener('click', verifyOtp);
  $('sign-out').addEventListener('click', () => {
    saveAuth(null);
    showToast('Signed out.');
    setConnection(isWebOSTV() ? 'Sign in to watch' : 'Browser Mode', false);
    updateAccountUI();
  });
  async function togglePlayerGuide() {
    if (!elements.programGuide) return;
    const willShow = !elements.programGuide.classList.contains('visible');
    elements.programGuide.classList.toggle('visible', willShow);
    if (!willShow || !state.active) return;

    const ch = state.active;
    elements.guideChannel.textContent = `${ch.title} · ID ${ch.id}`;
    elements.guideCurrentTitle.textContent = 'Loading programme…';
    elements.guideCurrentTime.textContent = '';
    elements.guideCurrentDescription.textContent = '';
    if (elements.guideProgress) elements.guideProgress.style.width = '0%';
    clearElement(elements.guideProgramList);

    const programmes = await loadChannelEpg(ch);
    if (!elements.programGuide.classList.contains('visible') || !state.active || state.active.id !== ch.id) return;

    const nowMs = Date.now();
    const current = programmes.find((p) => p.startMs <= nowMs && p.endMs > nowMs) || programmes[0];
    if (current) {
      elements.guideCurrentTitle.textContent = current.title;
      elements.guideCurrentTime.textContent = `${formatTime(new Date(current.startMs))} – ${formatTime(new Date(current.endMs))}`;
      elements.guideCurrentDescription.textContent = current.description;
      const pct = Math.max(5, Math.min(100, Math.round(((nowMs - current.startMs) / Math.max(1, current.endMs - current.startMs)) * 100)));
      if (elements.guideProgress) elements.guideProgress.style.width = `${pct}%`;
    }

    const upcoming = programmes.filter((p) => p.startMs > nowMs).slice(0, 6);
    upcoming.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'guide-upcoming-card';
      item.innerHTML = `<strong>${p.title}</strong><span>${formatTime(new Date(p.startMs))} – ${formatTime(new Date(p.endMs))}</span>`;
      elements.guideProgramList.append(item);
    });
  }

  async function updateSwitcherGuide(channel) {
    if (!channel) return;
    const chName = $('switcher-ch-name');
    const chId = $('switcher-ch-id');
    const epgNow = $('switcher-epg-now');
    const epgNext = $('switcher-epg-next');
    if (chName) chName.textContent = channel.title;
    if (chId) chId.textContent = `ID ${channel.id}`;
    if (epgNow) epgNow.textContent = 'Loading programme guide…';
    if (epgNext) epgNext.textContent = '';

    const programmes = await loadChannelEpg(channel);
    if (!chName || chName.textContent !== channel.title) return;
    const nowMs = Date.now();
    const current = programmes.find((p) => p.startMs <= nowMs && p.endMs > nowMs) || programmes[0];
    const next = programmes.find((p) => p.startMs > nowMs);
    if (epgNow) {
      epgNow.textContent = current
        ? `Now: ${current.title} (${formatTime(new Date(current.startMs))} – ${formatTime(new Date(current.endMs))})`
        : `${channel.title} Live`;
    }
    if (epgNext) {
      epgNext.textContent = next
        ? `Up Next: ${next.title} (${formatTime(new Date(next.startMs))})`
        : `${channel.group} · ${channel.language}`;
    }
  }

  function toggleChannelDrawer() {
    const drawer = $('player-channel-drawer');
    const list = $('switcher-channel-list');
    if (!drawer || !list) return;

    if (elements.programGuide) elements.programGuide.classList.remove('visible');
    const willShow = !drawer.classList.contains('visible');
    drawer.classList.toggle('visible', willShow);
    if (!willShow) {
      revealPlayerControls(true);
      return;
    }

    if (state.controlsHideTimer) clearTimeout(state.controlsHideTimer);
    clearElement(list);

    let activeCard = null;
    const activeIdx = state.active ? state.channels.findIndex((c) => c.id === state.active.id) : 0;
    const startIdx = Math.max(0, activeIdx - 30);
    const windowChannels = state.channels.slice(startIdx, startIdx + 80);

    windowChannels.forEach((ch) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isPlaying = state.active && state.active.id === ch.id;
      btn.className = `switcher-card${isPlaying ? ' playing' : ''}`;
      btn.dataset.channelId = ch.id;

      const logo = document.createElement('div');
      logo.className = 'logo-box sm';
      if (ch.logo) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = ch.logo;
        img.alt = '';
        img.onerror = () => { logo.textContent = ch.title.slice(0, 2).toUpperCase(); };
        logo.append(img);
      } else {
        logo.textContent = ch.title.slice(0, 2).toUpperCase();
      }

      const meta = document.createElement('div');
      meta.className = 'switcher-card-meta';
      const t = document.createElement('strong');
      t.textContent = ch.title;
      const s = document.createElement('span');
      s.textContent = isPlaying ? 'PLAYING NOW' : `${ch.group} · ${ch.id}`;
      meta.append(t, s);

      btn.append(logo, meta);
      btn.addEventListener('focus', () => updateSwitcherGuide(ch));
      btn.addEventListener('click', () => play(ch));
      list.append(btn);
      if (isPlaying) activeCard = btn;
    });

    const target = activeCard || list.firstElementChild;
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
      updateSwitcherGuide(state.active || state.channels[0]);
    }
  }

  $('back-library').addEventListener('click', stopPlayback);
  const osdChannels = $('osd-channels-btn');
  if (osdChannels) {
    osdChannels.addEventListener('click', toggleChannelDrawer);
  }
  const osdGuide = $('osd-guide-btn');
  if (osdGuide) {
    osdGuide.addEventListener('click', togglePlayerGuide);
  }
  $('play-toggle').addEventListener('click', () => {
    if (elements.player.paused) elements.player.play().catch(() => {});
    else elements.player.pause();
  });

  if (elements.search) {
    elements.search.addEventListener('input', render);
  }

  // Initial load: ensure overlays are hidden
  clearTuneBuffer();
  if (elements.programGuide) elements.programGuide.classList.remove('visible');
  if (elements.tuneDisplay) elements.tuneDisplay.classList.remove('visible');
  if (elements.playerPrompt) elements.playerPrompt.hidden = true;
  if (elements.playerError) elements.playerError.hidden = true;

  updateAccountUI();
  loadChannels();

})();
