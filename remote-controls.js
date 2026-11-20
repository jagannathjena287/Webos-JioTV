(function () {
  'use strict';

  var lastLibraryFocus = null;

  function isVisible(el) {
    if (!el || el.disabled || el.hidden) return false;
    if (el.offsetParent === null && el.tagName !== 'BODY') return false;
    if (el.closest('[hidden]')) return false;
    var panel = el.closest('.view-panel');
    if (panel && !panel.classList.contains('active')) return false;
    return true;
  }

  function getActiveScope() {
    var dialog = document.getElementById('settings-dialog');
    if (dialog && dialog.open) return dialog;

    var playerView = document.getElementById('player-view');
    if (playerView && playerView.classList.contains('open')) {
      var drawer = document.getElementById('player-channel-drawer');
      if (drawer && drawer.classList.contains('visible')) return drawer;
      var controls = document.getElementById('player-controls');
      if (controls && !controls.hidden) return controls;
      return playerView;
    }

    return document.getElementById('app') || document.body;
  }

  function getFocusables(scope) {
    var selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '.timeline-slot'
    ].join(', ');

    var nodes = Array.prototype.slice.call(scope.querySelectorAll(selector));
    return nodes.filter(function (el) {
      if (scope.id === 'app') {
        var pv = document.getElementById('player-view');
        if (pv && pv.contains(el) && !pv.classList.contains('open')) return false;
      }
      return isVisible(el);
    });
  }

  function focusElement(el) {
    if (!el) return false;
    var strip = el.closest('.channel-strip');
    if (strip) strip.style.scrollBehavior = 'auto';
    el.focus({ preventScroll: true });
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    }
    return true;
  }

  function visibleChildren(container, selector) {
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll(selector)).filter(isVisible);
  }

  function handleContainerNavigation(active, dir) {
    // 1. Top Navigation Pill <-> Header Right
    var navPill = active.closest('#nav-pill');
    if (navPill && (dir === 'left' || dir === 'right')) {
      var navItems = visibleChildren(navPill, '.nav-item');
      var idx = navItems.indexOf(active);
      if (idx !== -1) {
        if (dir === 'right') {
          if (idx + 1 < navItems.length) return navItems[idx + 1];
          var headerRight = visibleChildren(document.querySelector('.header-right'), 'button');
          return headerRight[0] || null;
        } else {
          if (idx > 0) return navItems[idx - 1];
          return null;
        }
      }
    }

    var headerRightEl = active.closest('.header-right');
    if (headerRightEl && (dir === 'left' || dir === 'right')) {
      var hrBtns = visibleChildren(headerRightEl, 'button');
      var hrIdx = hrBtns.indexOf(active);
      if (hrIdx !== -1) {
        if (dir === 'left') {
          if (hrIdx > 0) return hrBtns[hrIdx - 1];
          var navBtns = visibleChildren(document.getElementById('nav-pill'), '.nav-item');
          return navBtns[navBtns.length - 1] || null;
        } else if (hrIdx + 1 < hrBtns.length) {
          return hrBtns[hrIdx + 1];
        }
        return null;
      }
    }

    // 2. Horizontal Single-Row Strips & Action Bars
    var rowContainer = active.closest('.channel-strip, .hero-actions, .preview-actions, .keyboard-row, .input-row, .player-controls, .lang-filter-bar, .switcher-channel-list');
    if (rowContainer && (dir === 'left' || dir === 'right')) {
      var rowItems = getFocusables(rowContainer);
      var rIdx = rowItems.indexOf(active);
      if (rIdx !== -1) {
        if (dir === 'left' && rIdx > 0) return rowItems[rIdx - 1];
        if (dir === 'right' && rIdx + 1 < rowItems.length) return rowItems[rIdx + 1];
        if (rowContainer.classList.contains('switcher-channel-list')) return active;
        if (rowContainer.classList.contains('lang-filter-bar')) {
          if (dir === 'left') {
            var leftCats = visibleChildren(document.getElementById('livetv-cat-list'), '.cat-btn');
            return leftCats.find(function (c) { return c.classList.contains('active'); }) || leftCats[0] || active;
          }
          if (dir === 'right') {
            return document.getElementById('preview-watch-btn') || active;
          }
        }
        // Stay inside strip at edges; for keyboard-row allow moving right to search results
        if (rowContainer.classList.contains('channel-strip')) return active;
        if (rowContainer.classList.contains('keyboard-row') && dir === 'right' && rIdx === rowItems.length - 1) {
          var searchCards = visibleChildren(document.getElementById('search-results-list'), '.channel-card');
          if (searchCards.length) return searchCards[0];
        }
        if (rowContainer.classList.contains('keyboard-row') && dir === 'left') return active;
      }
    }

    // 3. Multi-column Grids (Live TV channel-grid, Search results, Numpad)
    var grid = active.closest('.channel-grid, .search-results-grid, .numpad-grid');
    if (grid && (dir === 'left' || dir === 'right')) {
      var gridItems = getFocusables(grid);
      var activeRect = active.getBoundingClientRect();
      var activeCy = activeRect.top + activeRect.height / 2;
      var sameRow = gridItems.filter(function (el) {
        var r = el.getBoundingClientRect();
        return Math.abs((r.top + r.height / 2) - activeCy) < Math.max(20, activeRect.height * 0.55);
      }).sort(function (a, b) {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
      });

      var gIdx = sameRow.indexOf(active);
      if (gIdx !== -1) {
        if (dir === 'left') {
          if (gIdx > 0) return sameRow[gIdx - 1];
          if (grid.classList.contains('channel-grid')) {
            var cats = visibleChildren(document.getElementById('livetv-cat-list'), '.cat-btn');
            return cats.find(function (c) { return c.classList.contains('active'); }) || cats[0] || null;
          }
          if (grid.classList.contains('search-results-grid')) {
            var kbKeys = visibleChildren(document.getElementById('tv-keyboard'), '.key-btn');
            return kbKeys[5] || kbKeys[0] || null;
          }
          return active;
        }
        if (dir === 'right') {
          if (gIdx + 1 < sameRow.length) return sameRow[gIdx + 1];
          if (grid.classList.contains('channel-grid')) {
            return document.getElementById('preview-watch-btn') || document.getElementById('preview-schedule-btn');
          }
          return active;
        }
      }
    }

    // 4. Live TV Left Categories & Right Preview
    if (active.closest('#livetv-cat-list')) {
      var catBtns = visibleChildren(document.getElementById('livetv-cat-list'), '.cat-btn');
      var cIdx = catBtns.indexOf(active);
      if (dir === 'down' && cIdx + 1 < catBtns.length) return catBtns[cIdx + 1];
      if (dir === 'up' && cIdx > 0) return catBtns[cIdx - 1];
      if (dir === 'right') {
        var liveCards = visibleChildren(document.getElementById('channel-list'), '.channel-card');
        return liveCards[0] || document.getElementById('settings-cta');
      }
    }

    if (active.closest('.col-preview') && dir === 'left') {
      var prevCards = visibleChildren(document.getElementById('channel-list'), '.channel-card');
      return prevCards[0] || null;
    }

    // 5. Guide View: Channel Picker <-> Schedule Timeline
    if (active.closest('#guide-channel-picker')) {
      var pickerBtns = visibleChildren(document.getElementById('guide-channel-picker'), '.cat-btn');
      var pIdx = pickerBtns.indexOf(active);
      if (dir === 'down' && pIdx + 1 < pickerBtns.length) return pickerBtns[pIdx + 1];
      if (dir === 'up' && pIdx > 0) return pickerBtns[pIdx - 1];
      if (dir === 'right') {
        var slots = visibleChildren(document.getElementById('guide-schedule-timeline'), '.timeline-slot');
        return slots[0] || null;
      }
    }

    if (active.closest('#guide-schedule-timeline')) {
      var timeSlots = visibleChildren(document.getElementById('guide-schedule-timeline'), '.timeline-slot');
      var tIdx = timeSlots.indexOf(active);
      if (dir === 'down' && tIdx + 1 < timeSlots.length) return timeSlots[tIdx + 1];
      if (dir === 'up' && tIdx > 0) return timeSlots[tIdx - 1];
      if (dir === 'left') {
        var gPicker = visibleChildren(document.getElementById('guide-channel-picker'), '.cat-btn');
        return gPicker.find(function (b) { return b.classList.contains('active'); }) || gPicker[0] || null;
      }
    }

    return undefined;
  }

  function findNextSpatial(current, direction, candidates) {
    if (!current || candidates.indexOf(current) === -1) {
      return candidates[0] || null;
    }

    var cur = current.getBoundingClientRect();
    var cx = cur.left + cur.width / 2;
    var cy = cur.top + cur.height / 2;

    var best = null;
    var bestScore = Infinity;

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el === current) continue;

      var r = el.getBoundingClientRect();
      var tx = r.left + r.width / 2;
      var ty = r.top + r.height / 2;
      var dx = tx - cx;
      var dy = ty - cy;

      var valid = false;
      var primary = 0;
      var secondary = 0;

      if (direction === 'left' && dx < -4) {
        valid = true;
        primary = -dx;
        secondary = Math.abs(dy);
      } else if (direction === 'right' && dx > 4) {
        valid = true;
        primary = dx;
        secondary = Math.abs(dy);
      } else if (direction === 'up' && dy < -4) {
        valid = true;
        primary = -dy;
        secondary = Math.abs(dx);
      } else if (direction === 'down' && dy > 4) {
        valid = true;
        primary = dy;
        secondary = Math.abs(dx);
      }

      if (!valid) continue;

      var score = primary + secondary * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    return best;
  }

  function getDirection(e) {
    switch (e.key || e.keyCode) {
      case 'ArrowLeft':
      case 37:
        return 'left';
      case 'ArrowUp':
      case 38:
        return 'up';
      case 'ArrowRight':
      case 39:
        return 'right';
      case 'ArrowDown':
      case 40:
        return 'down';
      default:
        return null;
    }
  }

  function ensurePlayerControlsVisible() {
    var playerView = document.getElementById('player-view');
    if (!playerView || !playerView.classList.contains('open')) return false;
    var controls = document.getElementById('player-controls');
    if (controls && controls.hidden) {
      playerView.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      if (controls.hidden) controls.hidden = false;
      return true;
    }
    return false;
  }

  function stepChannel(delta) {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll('.channel-card, .live-card')
    ).filter(isVisible);
    if (!cards.length) return;

    var currentIdx = cards.findIndex(function (c) {
      return c === lastLibraryFocus || c.classList.contains('selected');
    });
    if (currentIdx === -1) currentIdx = 0;

    var nextIdx = (currentIdx + delta + cards.length) % cards.length;
    lastLibraryFocus = cards[nextIdx];
    cards[nextIdx].click();
  }

  document.addEventListener('keydown', function (e) {
    var keyCode = e.keyCode || e.which;
    var active = document.activeElement;
    var scope = getActiveScope();
    var playerView = document.getElementById('player-view');
    var playerOpen = !!(playerView && playerView.classList.contains('open'));

    // 1. Directional D-Pad Navigation
    var dir = getDirection(e);
    if (dir) {
      if (active && active.tagName === 'INPUT' && (dir === 'left' || dir === 'right')) {
        if (active.value && active.value.length > 0) return;
      }

      if (playerOpen && ensurePlayerControlsVisible()) {
        e.preventDefault();
        focusElement(document.getElementById('back-library') || document.getElementById('play-toggle'));
        return;
      }

      e.preventDefault();
      var candidates = getFocusables(scope);
      if (!candidates.length) return;

      if (!active || active === document.body || !scope.contains(active)) {
        focusElement(candidates[0]);
        return;
      }

      var containerTarget = handleContainerNavigation(active, dir);
      if (containerTarget !== undefined) {
        if (containerTarget) focusElement(containerTarget);
        return;
      }

      var next = findNextSpatial(active, dir, candidates);
      if (next) {
        focusElement(next);
      }
      return;
    }

    // 2. OK / Enter on non-button focusables or to show player OSD
    if (e.key === 'Enter' || keyCode === 13) {
      var tuneDisplay = document.getElementById('tune-display');
      if (tuneDisplay && isVisible(tuneDisplay)) return;

      if (playerOpen && ensurePlayerControlsVisible()) {
        e.preventDefault();
        focusElement(document.getElementById('play-toggle') || document.getElementById('back-library'));
        return;
      }

      if (active && active.classList && active.classList.contains('timeline-slot')) {
        e.preventDefault();
        active.click();
        return;
      }
    }

    // 3. webOS Media & Channel Keys
    if (playerOpen) {
      if (keyCode === 415 || keyCode === 19) {
        e.preventDefault();
        var playBtn = document.getElementById('play-toggle');
        if (playBtn) {
          playBtn.click();
        } else {
          var video = document.getElementById('player');
          if (video) video.paused ? video.play() : video.pause();
        }
        return;
      }
      if (keyCode === 413) {
        e.preventDefault();
        var back = document.getElementById('back-library');
        if (back) back.click();
        return;
      }
      if (keyCode === 427) {
        e.preventDefault();
        stepChannel(-1);
        return;
      }
      if (keyCode === 428) {
        e.preventDefault();
        stepChannel(1);
        return;
      }
      return;
    }

    // 4. Yellow (405) or Red (403) key to toggle Favorite when browsing cards
    if ((keyCode === 405 || keyCode === 403) && active && active.classList &&
        (active.classList.contains('channel-card') || active.classList.contains('live-card'))) {
      e.preventDefault();
      active.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    }
  });

  document.addEventListener('focusin', function (e) {
    var target = e.target;
    if (!target || target === document.body) return;
    var playerView = document.getElementById('player-view');
    var dialog = document.getElementById('settings-dialog');
    if (playerView && playerView.contains(target)) return;
    if (dialog && dialog.contains(target)) return;
    lastLibraryFocus = target;
  });

  function ensureInitialFocus() {
    var active = document.activeElement;
    if (active && active !== document.body) return;
    var homeNav = document.querySelector('#nav-pill .nav-item.active');
    if (homeNav && isVisible(homeNav)) {
      focusElement(homeNav);
      return;
    }
    var scope = getActiveScope();
    var candidates = getFocusables(scope);
    if (candidates.length) focusElement(candidates[0]);
  }

  window.addEventListener('DOMContentLoaded', function () {
    setTimeout(ensureInitialFocus, 250);

    var playerView = document.getElementById('player-view');
    var dialog = document.getElementById('settings-dialog');

    var observer = new MutationObserver(function () {
      var playerOpen = playerView && playerView.classList.contains('open');
      var dialogOpen = dialog && dialog.open;

      if (!playerOpen && !dialogOpen) {
        if (lastLibraryFocus && isVisible(lastLibraryFocus)) {
          if (document.activeElement === document.body || !document.body.contains(document.activeElement)) {
            focusElement(lastLibraryFocus);
          }
        } else {
          ensureInitialFocus();
        }
      } else if (playerOpen) {
        var controls = document.getElementById('player-controls');
        if (controls && !controls.hidden && (!document.activeElement || !playerView.contains(document.activeElement))) {
          focusElement(document.getElementById('play-toggle') || document.getElementById('back-library'));
        }
      }
    });

    if (playerView) observer.observe(playerView, { attributes: true, attributeFilter: ['class'] });
    if (dialog) observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
})();
