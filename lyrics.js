// @name         Mini Lyrics Player
// @version      2.1.0
// @description  Floating PiP lyrics window — always-on-top, synced, shuffle, offset correction
// @author       Mini Lyrics Player
// @license      MIT

(async function miniLyricsPlayer() {
  "use strict";

  // ─── GUARD: wait for Spicetify to fully load ─────────────────────────────
  while (!Spicetify?.Player?.data || !Spicetify?.CosmosAsync) {
    await new Promise((r) => setTimeout(r, 100));
  }

  // ─── SVG ICONS ────────────────────────────────────────────────────────────
  const ICONS = {
    prev: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M7 10l5 5 5-5z"/></svg>`,
    chevronUp: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M7 14l5-5 5 5z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFilled: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    volumeLow: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
    volumeHigh: `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    autoScroll: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`,
    textSize: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
    gaming: `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`,
  };

  // ─── PREFERENCES ─────────────────────────────────────────────────────────
  const PREFS_KEY = "mlp-preferences-v2";
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || null; } catch (_) { return null; }
  }
  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        fontSizeIdx: state.fontSizeIdx, autoScroll: state.autoScroll,
        gamingMode: state.gamingMode, showRemaining: state.showRemaining,
      }));
    } catch (_) { /* ignore */ }
  }

  // ─── STATE ────────────────────────────────────────────────────────────────
  let pipWindow = null;
  const FONT_SIZES = [11, 12.5, 14, 16];
  const _savedPrefs = loadPrefs();
  const state = {
    lyrics: [],
    currentLineIndex: -1,
    progressIntervalId: null,
    rafId: null,
    isCollapsed: false,
    isLiked: false,
    isRepeat: false,
    isShuffled: false,

    dominantColor: "120, 80, 200",
    currentTrackUri: "",
    currentCoverUrl: "",

    // ── v2.0 ──
    fontSizeIdx: _savedPrefs?.fontSizeIdx ?? 1,
    autoScroll: _savedPrefs?.autoScroll ?? true,
    showRemaining: _savedPrefs?.showRemaining ?? false,
    gamingMode: _savedPrefs?.gamingMode ?? false,

    // ── DOM cache ──
    lineElements: [],
    wordElements: [],   // Array of arrays
    wordTimings: [],     // Array of arrays of {startMs, endMs}
  };

  // ─── CSS ──────────────────────────────────────────────────────────────────
  function buildCSS() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        height: 100%; overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #000; color: #fff; user-select: none; -webkit-user-select: none;
      }
      :root { --mlp-accent: 120, 80, 200; --mlp-font-size: 12.5px; }
      #mlp-root { display: flex; flex-direction: column; height: 100%; position: relative; }
      #mlp-bg {
        position: absolute; inset: 0; background-size: cover; background-position: center;
        filter: blur(40px) brightness(0.35); transform: scale(1.15); opacity: 0.95; z-index: 0;
        transition: background-image 0.4s ease;
      }
      #mlp-bg-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65)); z-index: 1;
      }
      #mlp-root::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%);
        pointer-events: none; z-index: 0;
      }
      #mlp-root::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse 100% 60% at 50% 100%, rgba(var(--mlp-accent), 0.10) 0%, transparent 70%);
        pointer-events: none; z-index: 0;
      }
 
      /* ── HEADER ── */
      #mlp-header {
        display: flex; align-items: center; gap: 10px; padding: 13px 14px 10px;
        position: relative; z-index: 2; flex-shrink: 0;
        -webkit-app-region: drag; app-region: drag; cursor: grab;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      #mlp-header button, #mlp-header img { -webkit-app-region: no-drag; app-region: no-drag; }
      #mlp-album-art {
        width: 46px; height: 46px; border-radius: 11px; overflow: hidden; flex-shrink: 0;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.10) inset;
        transition: transform 0.3s ease; cursor: pointer;
      }
      #mlp-album-art:hover { transform: scale(1.05); }
      #mlp-album-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.4s ease; }
      #mlp-track-info { flex: 1; min-width: 0; overflow: hidden; }
      #mlp-track-name {
        color: rgba(255,255,255,0.96); font-size: 13.5px; font-weight: 650;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        letter-spacing: -0.25px; line-height: 1.3;
      }
      #mlp-artist-name {
        color: rgba(255,255,255,0.48); font-size: 11.5px; font-weight: 400;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px;
      }
      #mlp-window-controls { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
      .mlp-wc-btn {
        width: 11px; height: 11px; border-radius: 50%; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.15s; opacity: 0.8; padding: 0; color: transparent; position: relative;
      }
      .mlp-wc-btn svg { position: absolute; opacity: 0; transition: opacity 0.15s; color: rgba(0,0,0,0.65); width: 7px; height: 7px; }
      #mlp-window-controls:hover .mlp-wc-btn { opacity: 1; }
      #mlp-window-controls:hover .mlp-wc-btn svg { opacity: 1; }
      #mlp-wc-close { background: #ff5f57; }
      #mlp-wc-toggle { background: #28c840; }
      .mlp-wc-btn:hover { transform: scale(1.15); }
 
      /* ── CONTROLS ── */
      #mlp-controls {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        padding: 10px 14px; position: relative; z-index: 2; flex-shrink: 0;
        -webkit-app-region: no-drag; app-region: no-drag;
      }
      .mlp-ctrl-btn {
        width: 30px; height: 30px; border-radius: 50%; border: none;
        background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.85);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.12s; flex-shrink: 0;
      }
      .mlp-ctrl-btn:hover { background: rgba(255,255,255,0.18); color: white; transform: scale(1.08); }
      .mlp-ctrl-btn:active { transform: scale(0.93); }
      #mlp-play-btn {
        width: 38px; height: 38px; background: rgba(var(--mlp-accent), 0.65);
        box-shadow: 0 0 16px rgba(var(--mlp-accent), 0.4), 0 2px 8px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.15);
      }
      #mlp-play-btn:hover {
        background: rgba(var(--mlp-accent), 0.85);
        box-shadow: 0 0 24px rgba(var(--mlp-accent), 0.6), 0 4px 12px rgba(0,0,0,0.3);
        transform: scale(1.06);
      }
 
      /* ── PROGRESS ── */
      #mlp-progress-container {
        padding: 0 14px 6px; position: relative; z-index: 2; flex-shrink: 0;
        -webkit-app-region: no-drag; app-region: no-drag;
      }
      #mlp-progress-track {
        height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px;
        overflow: visible; cursor: pointer; position: relative; transition: height 0.15s;
      }
      #mlp-progress-track:hover { height: 5px; }
      #mlp-progress-fill {
        height: 100%; width: 0%;
        background: linear-gradient(90deg, rgba(var(--mlp-accent),0.7), rgba(var(--mlp-accent),1) 60%, rgba(255,255,255,0.9) 100%);
        border-radius: 2px; transition: width 0.18s linear; position: relative;
      }
      #mlp-progress-fill::after {
        content: ''; position: absolute; right: -4px; top: 50%; transform: translateY(-50%);
        width: 8px; height: 8px; border-radius: 50%; background: white;
        box-shadow: 0 0 6px rgba(var(--mlp-accent),0.8); opacity: 0; transition: opacity 0.15s;
      }
      #mlp-progress-track:hover #mlp-progress-fill::after { opacity: 1; }
      #mlp-time-row {
        display: flex; justify-content: space-between; padding-top: 5px;
        font-size: 10px; color: rgba(255,255,255,0.35); font-variant-numeric: tabular-nums;
      }
      #mlp-time-current { cursor: pointer; transition: color 0.15s; }
      #mlp-time-current:hover { color: rgba(255,255,255,0.65); }
 
      /* ── DIVIDER ── */
      .mlp-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);
        margin: 0 14px; position: relative; z-index: 2; flex-shrink: 0;
      }
 
      /* ── LYRICS TOOLBAR ── */
      #mlp-lyrics-toolbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 5px 14px 2px; position: relative; z-index: 2; flex-shrink: 0;
        -webkit-app-region: no-drag; app-region: no-drag;
      }
      .mlp-toolbar-group { display: flex; align-items: center; gap: 3px; }
      .mlp-tool-btn {
        width: 22px; height: 22px; border-radius: 6px; border: none;
        background: transparent; color: rgba(255,255,255,0.3);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, color 0.15s; font-size: 11px; font-weight: 600;
      }
      .mlp-tool-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.75); }
      .mlp-tool-btn:active { transform: scale(0.9); }
      .mlp-tool-btn.active { color: rgba(var(--mlp-accent), 1); }

      /* ── GAMING MODE ── */
      body.gaming-mode, body.gaming-mode * { cursor: none !important; }
      body.gaming-mode #mlp-controls,
      body.gaming-mode #mlp-progress-container,
      body.gaming-mode #mlp-volume-container,
      body.gaming-mode #mlp-lyrics-container,
      body.gaming-mode #mlp-header,
      body.gaming-mode .mlp-tool-btn:not(#mlp-gaming-btn) { pointer-events: none; }
      body.gaming-mode #mlp-gaming-btn { cursor: pointer !important; }
 
      /* ── LYRICS ── */
      #mlp-lyrics-container {
        flex: 1 1 0; min-height: 0; overflow-y: auto;
        padding: 4px 0 16px; position: relative; z-index: 2;
        scrollbar-width: none; -ms-overflow-style: none;
        -webkit-app-region: no-drag; app-region: no-drag;
        mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
      }
      #mlp-lyrics-container::-webkit-scrollbar { display: none; }
      @keyframes mlp-lyric-enter { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      .mlp-lyric-line {
        padding: 6px 18px; font-size: var(--mlp-font-size, 12.5px); font-weight: 500;
        color: rgba(255,255,255,0.28); line-height: 1.5;
        transition: color 0.4s cubic-bezier(0.25,0.46,0.45,0.94), font-size 0.25s ease, font-weight 0.25s ease, text-shadow 0.4s ease;
        cursor: pointer; border-radius: 8px; margin: 1px 8px; word-break: break-word;
        animation: mlp-lyric-enter 0.3s ease both;
      }
      .mlp-lyric-line:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); }
      .mlp-lyric-line.upcoming { color: rgba(255,255,255,0.42); }
      .mlp-lyric-line.prev-line { color: rgba(255,255,255,0.48); }
      .mlp-lyric-line.active {
        font-weight: 700; letter-spacing: -0.3px;
        font-size: calc(var(--mlp-font-size, 12.5px) + 1.5px);
        color: rgba(255,255,255,0.22);
        transform: scale(1.02);
        transform-origin: left center;
        filter: drop-shadow(0 0 18px rgba(var(--mlp-accent), 0.15));
      }

      /* ── MOT PAR MOT — Lightweight Karaoke ── */
      .mlp-word {
        display: inline;
        color: rgba(255,255,255,0.22);
        transition: color 0.12s ease-out;
        will-change: color;
      }
      .mlp-lyric-line:not(.active) .mlp-word {
        color: inherit;
        transition: none;
      }
      .mlp-lyric-line.active .mlp-word.singing {
        color: rgba(255,255,255,0.75);
      }
      .mlp-lyric-line.active .mlp-word.sung {
        color: rgba(255,255,255,0.97);
        text-shadow: 0 0 8px rgba(var(--mlp-accent),0.45);
      }
      #mlp-empty-lyrics {
        text-align: center; padding: 32px 20px;
        color: rgba(255,255,255,0.28); font-size: 12px; line-height: 1.6;
      }
      #mlp-empty-lyrics svg { display: block; margin: 0 auto 10px; opacity: 0.3; }
      #mlp-loading-lyrics { text-align: center; padding: 28px; color: rgba(255,255,255,0.4); font-size: 11.5px; }
      @keyframes mlp-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.9} }
      .mlp-loading-dot { display: inline-block; animation: mlp-pulse 1.4s ease-in-out infinite; }
      .mlp-loading-dot:nth-child(2) { animation-delay: 0.2s; }
      .mlp-loading-dot:nth-child(3) { animation-delay: 0.4s; }
 
      /* ── COLLAPSED ── */
      #mlp-root.collapsed #mlp-lyrics-container,
      #mlp-root.collapsed .mlp-divider,
      #mlp-root.collapsed #mlp-controls,
      #mlp-root.collapsed #mlp-volume-container,
      #mlp-root.collapsed #mlp-progress-container,
      #mlp-root.collapsed #mlp-lyrics-toolbar { display: none; }
 
      /* ── ACTIVE STATES ── */
      .mlp-ctrl-btn.active { color: rgba(var(--mlp-accent), 1); background: rgba(var(--mlp-accent), 0.18); }
      #mlp-like-btn.active { color: #e85d6b; background: rgba(232, 93, 107, 0.18); }
      #mlp-like-btn.active:hover { background: rgba(232, 93, 107, 0.28); }
 
      /* ── VOLUME ── */
      #mlp-volume-container {
        display: flex; align-items: center; gap: 7px;
        padding: 4px 14px 8px; position: relative; z-index: 2; flex-shrink: 0;
        -webkit-app-region: no-drag; app-region: no-drag;
      }
      #mlp-volume-container svg { opacity: 0.45; flex-shrink: 0; }
      #mlp-volume-slider {
        flex: 1; -webkit-appearance: none; appearance: none;
        height: 3px; border-radius: 2px; outline: none; cursor: pointer;
        background: linear-gradient(
          to right, rgba(var(--mlp-accent),0.9) 0%, rgba(var(--mlp-accent),0.9) var(--vol-pct, 100%),
          rgba(255,255,255,0.12) var(--vol-pct, 100%), rgba(255,255,255,0.12) 100%
        ); transition: height 0.15s;
      }
      #mlp-volume-slider:hover { height: 5px; }
      #mlp-volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 10px; height: 10px; border-radius: 50%; background: white;
        box-shadow: 0 0 6px rgba(var(--mlp-accent),0.7); transition: transform 0.12s;
      }
      #mlp-volume-slider:hover::-webkit-slider-thumb { transform: scale(1.3); }
      #mlp-volume-slider::-moz-range-thumb {
        width: 10px; height: 10px; border-radius: 50%; background: white; border: none;
        box-shadow: 0 0 6px rgba(var(--mlp-accent),0.7);
      }
 
      /* ── TOAST ── */
      #mlp-toast {
        position: absolute; bottom: 16px; left: 50%;
        transform: translateX(-50%) translateY(12px);
        background: rgba(10,10,10,0.82); color: rgba(255,255,255,0.9);
        padding: 5px 13px; border-radius: 20px; font-size: 10.5px;
        pointer-events: none; z-index: 10; white-space: nowrap;
        opacity: 0; transition: opacity 0.18s, transform 0.18s;
        border: 1px solid rgba(255,255,255,0.1);
      }
      #mlp-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
 
      @keyframes mlp-slide-in { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      #mlp-root { animation: mlp-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
    `;
  }

  // ─── BUILD HTML ────────────────────────────────────────────────────────────
  function buildHTML() {
    return `
      <div id="mlp-root">
        <div id="mlp-bg"></div>
        <div id="mlp-bg-overlay"></div>
        <div id="mlp-header">
          <div id="mlp-album-art" title="Ouvrir dans Spotify">
            <img id="mlp-album-img" src="" alt="" crossorigin="anonymous" />
          </div>
          <div id="mlp-track-info">
            <div id="mlp-track-name">Aucune piste</div>
            <div id="mlp-artist-name">—</div>
          </div>
          <div id="mlp-window-controls">
            <button class="mlp-wc-btn" id="mlp-wc-close"  title="Fermer">${ICONS.close}</button>
            <button class="mlp-wc-btn" id="mlp-wc-toggle" title="Réduire">${ICONS.chevronDown}</button>
          </div>
        </div>
        <div id="mlp-volume-container">
          ${ICONS.volumeLow}
          <input type="range" id="mlp-volume-slider" min="0" max="100" value="100" />
          ${ICONS.volumeHigh}
        </div>
        <div id="mlp-controls">
          <button class="mlp-ctrl-btn" id="mlp-shuffle-btn" title="Aléatoire (S)">${ICONS.shuffle}</button>
          <button class="mlp-ctrl-btn" id="mlp-prev-btn"    title="Précédent (Ctrl+←)">${ICONS.prev}</button>
          <button class="mlp-ctrl-btn" id="mlp-play-btn"    title="Lecture / Pause (Espace)">${ICONS.play}</button>
          <button class="mlp-ctrl-btn" id="mlp-next-btn"    title="Suivant (Ctrl+→)">${ICONS.next}</button>
          <button class="mlp-ctrl-btn" id="mlp-repeat-btn"  title="Répétition (R)">${ICONS.repeat}</button>
        </div>
        <div id="mlp-progress-container">
          <div id="mlp-progress-track"><div id="mlp-progress-fill"></div></div>
          <div id="mlp-time-row">
            <span id="mlp-time-current" title="Cliquer : temps restant / écoulé">0:00</span>
            <span id="mlp-time-total">0:00</span>
          </div>
        </div>
        <div class="mlp-divider"></div>
        <div id="mlp-lyrics-toolbar">
          <div class="mlp-toolbar-group">
            <button class="mlp-tool-btn active" id="mlp-autoscroll-btn" title="Défilement auto">${ICONS.autoScroll}</button>
            <button class="mlp-tool-btn"         id="mlp-fontsize-btn"   title="Taille texte (cycle)">${ICONS.textSize}</button>
            <button class="mlp-tool-btn"         id="mlp-gaming-btn"    title="Mode Gaming (fenêtre sans focus)">${ICONS.gaming}</button>
          </div>
        </div>
        <div id="mlp-lyrics-container">
          <div id="mlp-empty-lyrics">${ICONS.music}Les paroles apparaîtront ici</div>
        </div>
        <div id="mlp-toast"></div>
      </div>
    `;
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  function getDoc() { return pipWindow?.document ?? null; }
  function getEl(id) { return getDoc()?.getElementById(id) ?? null; }

  function msToTime(ms) {
    if (!ms || isNaN(ms)) return "0:00";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function clearIntervals() {
    clearInterval(state.progressIntervalId);
    state.progressIntervalId = null;
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
  }

  // ─── TOAST ────────────────────────────────────────────────────────────────
  let _toastTimeout = null;
  function showToast(msg) {
    const toast = getEl("mlp-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(_toastTimeout);
    _toastTimeout = setTimeout(() => toast?.classList.remove("show"), 1600);
  }

  // ─── COLOR EXTRACTION ─────────────────────────────────────────────────────
  function extractDominantColor(imgEl) {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 60; canvas.height = 60;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgEl, 0, 0, 60, 60);
        const { data } = ctx.getImageData(0, 0, 60, 60);
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          const br = (pr + pg + pb) / 3;
          if (br < 30 || br > 225) continue;
          r += pr; g += pg; b += pb; count++;
        }
        if (!count) { resolve("120, 80, 200"); return; }
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
        const avg = (r + g + b) / 3, boost = 1.6;
        r = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * boost)));
        g = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * boost)));
        b = Math.min(255, Math.max(0, Math.round(avg + (b - avg) * boost)));
        resolve(`${r}, ${g}, ${b}`);
      } catch (_) { resolve("120, 80, 200"); }
    });
  }

  function applyAccentColor(color) {
    state.dominantColor = color;
    const root = getEl("mlp-root");
    if (root) root.style.setProperty("--mlp-accent", color);
    const playBtn = getEl("mlp-play-btn");
    if (playBtn) playBtn.style.background = `rgba(${color}, 0.65)`;
  }

  function applyFontSize() {
    const root = getEl("mlp-root");
    if (root) root.style.setProperty("--mlp-font-size", `${FONT_SIZES[state.fontSizeIdx]}px`);
  }

  // ─── LYRICS FETCH ─────────────────────────────────────────────────────────
  function parseLine(line) {
    return {
      time: parseInt(line.startTimeMs || line.time || 0, 10),
      endTime: parseInt(line.endTimeMs || 0, 10),
      text: (line.words || line.text || "").trim() || "♪",
    };
  }
  async function fetchLyrics(trackId) {
    if (!trackId) return [];
    try {
      const resp = await Spicetify.CosmosAsync.get(
        `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&market=from_token`
      );
      if (resp?.lyrics?.lines) return resp.lyrics.lines.map(parseLine);
    } catch (e) {
      console.warn("[MiniLyricsPlayer] Color Lyrics API échouée, essai méthode 2…", e);
    }
    if (Spicetify.Platform?.Lyrics) {
      try {
        const lyrics = await Spicetify.Platform.Lyrics.getLyrics(`spotify:track:${trackId}`);
        if (lyrics?.lines) return lyrics.lines.map(parseLine);
      } catch (e) {
        console.warn("[MiniLyricsPlayer] Platform Lyrics API échouée, essai méthode 3…", e);
      }
    }
    try {
      const resp = await Spicetify.CosmosAsync.get(
        `wg://lyrics/v1/track/${trackId}?format=json&market=from_token`
      );
      if (resp?.lines) return resp.lines.map(parseLine);
    } catch (e) {
      console.warn("[MiniLyricsPlayer] Legacy lyrics endpoint échoué.", e);
    }
    return [];
  }

  // ─── LYRICS RENDER (proportional timing + DOM cache) ───────────────────────
  function renderLyrics(lyricsData) {
    const container = getEl("mlp-lyrics-container");
    if (!container) return;
    state.lineElements = [];
    state.wordElements = [];
    state.wordTimings = [];

    if (!lyricsData?.length) {
      container.innerHTML = `<div id="mlp-empty-lyrics">${ICONS.music}Aucune parole disponible</div>`;
      return;
    }

    container.innerHTML = lyricsData.map((line, i) => {
      const words = line.text.split(/\s+/).filter(Boolean);
      // Use endTimeMs when available, else next line start, else +3500ms
      const rawEnd = (line.endTime > line.time) ? line.endTime : null;
      const nextMs = rawEnd ?? lyricsData[i + 1]?.time ?? (line.time + 3500);
      const lineDur = Math.max(600, nextMs - line.time);

      // Reserve 8% of the line duration as lead-in (words don't start immediately)
      const leadIn = Math.min(lineDur * 0.08, 200);
      const activeDur = lineDur - leadIn;

      // Proportional timing based on word length (chars)
      const totalChars = words.reduce((s, w) => s + Math.max(w.length, 1), 0);
      let cumulative = 0;
      const spans = words.map((w) => {
        const startOff = cumulative / totalChars;
        cumulative += Math.max(w.length, 1);
        const endOff = cumulative / totalChars;
        const sMs = line.time + Math.round(leadIn + startOff * activeDur);
        const eMs = line.time + Math.round(leadIn + endOff * activeDur);
        return `<span class="mlp-word">${w}</span>`;
      }).join(" ");
      return `<div class="mlp-lyric-line" data-index="${i}" data-time="${line.time}" style="animation-delay:${i * 16}ms">${spans}</div>`;
    }).join("");

    // Cache DOM references and compute timings in JS only (no data attributes)
    const lineEls = container.querySelectorAll(".mlp-lyric-line");
    lineEls.forEach((el, lineIdx) => {
      state.lineElements[lineIdx] = el;
      const wordEls = Array.from(el.querySelectorAll(".mlp-word"));
      state.wordElements[lineIdx] = wordEls;

      // Recompute timings in JS (mirrors the loop above)
      const line = lyricsData[lineIdx];
      const rawEnd = (line.endTime > line.time) ? line.endTime : null;
      const nextMs = rawEnd ?? lyricsData[lineIdx + 1]?.time ?? (line.time + 3500);
      const lineDur = Math.max(600, nextMs - line.time);
      const leadIn = Math.min(lineDur * 0.08, 200);
      const activeDur = lineDur - leadIn;
      const chars = wordEls.map((w) => Math.max(w.textContent.length, 1));
      const totalChars = chars.reduce((a, b) => a + b, 0);
      let cum = 0;
      state.wordTimings[lineIdx] = chars.map((c) => {
        const sOff = cum / totalChars;
        cum += c;
        const eOff = cum / totalChars;
        return {
          startMs: line.time + Math.round(leadIn + sOff * activeDur),
          endMs: line.time + Math.round(leadIn + eOff * activeDur),
        };
      });

      el.addEventListener("click", () => Spicetify.Player.seek(line.time));
    });
  }

  // ─── BINARY SEARCH for active line ─────────────────────────────────────────
  function findActiveLineIndex(progress) {
    const lyrics = state.lyrics;
    let lo = 0, hi = lyrics.length - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (progress >= lyrics[mid].time - 200) { result = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    return result;
  }

  // ─── LYRICS LINE SYNC (called at 200ms interval) ──────────────────────────
  function syncLyrics() {
    if (!state.lyrics.length || !state.lineElements.length) return;
    const progress = Spicetify.Player.getProgress();
    const newIdx = findActiveLineIndex(progress);

    if (newIdx !== state.currentLineIndex) {
      const prevIdx = state.currentLineIndex;
      state.currentLineIndex = newIdx;

      // Update only affected lines (not all lines)
      const toUpdate = new Set([prevIdx, prevIdx - 1, prevIdx + 1, prevIdx + 2,
                                newIdx, newIdx - 1, newIdx + 1, newIdx + 2]);
      for (const i of toUpdate) {
        const el = state.lineElements[i];
        if (!el) continue;
        el.classList.remove("active", "prev-line", "upcoming");
        if (i === newIdx) el.classList.add("active");
        else if (i === newIdx - 1) el.classList.add("prev-line");
        else if (i === newIdx + 1 || i === newIdx + 2) el.classList.add("upcoming");
      }

      // Reset word classes on previously active line
      if (prevIdx >= 0 && state.wordElements[prevIdx]) {
        state.wordElements[prevIdx].forEach((w) => {
          w.classList.remove("sung", "singing");
        });
      }
      // Reset all words on new active line
      if (newIdx >= 0 && state.wordElements[newIdx]) {
        state.wordElements[newIdx].forEach((w) => {
          w.classList.remove("sung", "singing");
        });
      }

      // Auto-scroll
      if (state.autoScroll && newIdx >= 0) {
        const activeLine = state.lineElements[newIdx];
        const container = getEl("mlp-lyrics-container");
        if (activeLine && container) {
          const cr = container.getBoundingClientRect();
          const lr = activeLine.getBoundingClientRect();
          const offset = lr.top - cr.top - cr.height * 0.38 + lr.height / 2;
          container.scrollBy({ top: offset, behavior: "smooth" });
        }
      }
    }
  }

  // ─── WORD SYNC LOOP (throttled to ~30fps, class-based — no per-frame style writes) ──
  let _lastWordSyncTime = 0;
  function wordWipeLoop() {
    if (!pipWindow || pipWindow.closed) { state.rafId = null; return; }

    // Throttle to ~30fps (every 33ms) to halve CPU/GPU work
    const now = performance.now();
    if (now - _lastWordSyncTime < 33) {
      state.rafId = requestAnimationFrame(wordWipeLoop);
      return;
    }
    _lastWordSyncTime = now;

    const idx = state.currentLineIndex;
    if (idx >= 0 && state.wordElements[idx] && state.wordTimings[idx]) {
      const progress = Spicetify.Player.getProgress();
      const words = state.wordElements[idx];
      const timings = state.wordTimings[idx];

      for (let i = 0; i < words.length; i++) {
        const w = words[i], t = timings[i];
        if (progress >= t.endMs) {
          // Fully sung — set class once, skip further updates
          if (!w.classList.contains("sung")) {
            w.classList.remove("singing");
            w.classList.add("sung");
          }
        } else if (progress >= t.startMs) {
          // Currently being sung
          if (!w.classList.contains("singing")) {
            w.classList.add("singing");
            w.classList.remove("sung");
          }
        } else {
          // Not yet reached — only remove if needed
          if (w.classList.contains("singing") || w.classList.contains("sung")) {
            w.classList.remove("singing", "sung");
          }
        }
      }
    }

    state.rafId = requestAnimationFrame(wordWipeLoop);
  }

  // ─── PROGRESS UPDATE ──────────────────────────────────────────────────────
  let _trackChangeQueued = false;
  function updateProgress() {
    if (!pipWindow || pipWindow.closed) return;
    const item = Spicetify.Player.data?.item || Spicetify.Player.data?.track;
    const liveUri = item?.uri || "";
    if (liveUri && liveUri !== state.currentTrackUri && !_trackChangeQueued) {
      _trackChangeQueued = true;
      updateTrackInfo().then(() => { updatePlayState(); _trackChangeQueued = false; });
      return;
    }
    const fill = getEl("mlp-progress-fill");
    const curr = getEl("mlp-time-current");
    const total = getEl("mlp-time-total");
    if (!fill) return;
    const progress = Spicetify.Player.getProgress();
    const duration = Spicetify.Player.getDuration();
    fill.style.width = `${duration > 0 ? (progress / duration) * 100 : 0}%`;
    if (curr) curr.textContent = state.showRemaining
      ? `-${msToTime(Math.max(0, duration - progress))}`
      : msToTime(progress);
    if (total) total.textContent = msToTime(duration);
    syncLyrics();
  }

  // ─── TRACK INFO UPDATE ────────────────────────────────────────────────────
  async function updateTrackInfo() {
    if (!pipWindow || pipWindow.closed) return;
    const data = Spicetify.Player.data;
    if (!data) return;
    const item = data.item || data.track;
    const name = item?.name || item?.metadata?.title || "—";
    const artists = item?.artists?.map((a) => a.name).join(", ") || item?.metadata?.artist_name || "—";
    const rawArt = item?.album?.images?.[0]?.url || item?.images?.[0]?.url || item?.metadata?.image_xlarge_url || "";
    const art = rawArt.startsWith("spotify:image:")
      ? `https://i.scdn.co/image/${rawArt.split(":").pop()}` : rawArt;
    const uri = item?.uri || data.track?.uri || "";
    const trackId = uri.split(":").pop();
    state.currentTrackUri = uri;
    state.currentCoverUrl = art;

    const bg = getEl("mlp-bg");
    if (bg && art) bg.style.backgroundImage = `url(${art})`;

    const nameEl = getEl("mlp-track-name");
    const artistEl = getEl("mlp-artist-name");
    if (nameEl) nameEl.textContent = name;
    if (artistEl) artistEl.textContent = artists;

    const imgEl = getEl("mlp-album-img");
    if (imgEl && art) {
      imgEl.style.opacity = "0";
      imgEl.src = art;
      imgEl.onload = () => { imgEl.style.opacity = "1"; };
      const proxyImg = new Image();
      proxyImg.crossOrigin = "anonymous";
      proxyImg.onload = async () => { applyAccentColor(await extractDominantColor(proxyImg)); };
      proxyImg.onerror = () => applyAccentColor("120, 80, 200");
      proxyImg.src = art;
    }

    // ── Like ──
    state.isLiked = false;
    updateLikeState();
    if (uri) {
      try {
        const liked = await Spicetify.Platform.LibraryAPI.contains({ uris: [uri] });
        state.isLiked = liked?.[0] ?? false;
      } catch (_) {
        try {
          const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`);
          state.isLiked = Array.isArray(res) ? res[0] : false;
        } catch (_2) { /* ignore */ }
      }
      updateLikeState();
    }

    // ── Reset lyrics + offset au changement de piste ──
    state.currentLineIndex = -1;
    state.lyrics = [];
    state.lineElements = [];
    state.wordElements = [];
    state.wordTimings = [];
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }

    const container = getEl("mlp-lyrics-container");
    if (container) {
      container.innerHTML = `<div id="mlp-loading-lyrics">
        <span class="mlp-loading-dot">●</span>
        <span class="mlp-loading-dot"> ●</span>
        <span class="mlp-loading-dot"> ●</span>
      </div>`;
    }

    if (trackId) {
      const requestedTrackUri = uri;
      const lyrics = await fetchLyrics(trackId);
      if (requestedTrackUri !== state.currentTrackUri) return;
      state.lyrics = lyrics;
      renderLyrics(state.lyrics);
      if (state.lyrics.length > 0 && !state.rafId) {
        state.rafId = requestAnimationFrame(wordWipeLoop);
      }
    } else {
      renderLyrics([]);
    }
  }

  // ─── UI STATE UPDATERS ────────────────────────────────────────────────────
  function updatePlayState() {
    const btn = getEl("mlp-play-btn");
    if (!btn) return;
    btn.innerHTML = Spicetify.Player.isPlaying() ? ICONS.pause : ICONS.play;
  }

  function updateLikeState() {
    const btn = getEl("mlp-like-btn");
    if (!btn) return;
    btn.innerHTML = state.isLiked ? ICONS.heartFilled : ICONS.heart;
    btn.classList.toggle("active", state.isLiked);
  }

  function updateRepeatState() {
    const btn = getEl("mlp-repeat-btn");
    if (!btn) return;
    btn.classList.toggle("active", state.isRepeat);
  }

  function updateShuffleState() {
    const btn = getEl("mlp-shuffle-btn");
    if (!btn) return;
    btn.classList.toggle("active", state.isShuffled);
  }

  function updateAutoScrollState() {
    const btn = getEl("mlp-autoscroll-btn");
    if (!btn) return;
    btn.classList.toggle("active", state.autoScroll);
  }


  // ─── GAMING MODE ──────────────────────────────────────────────────────────
  function _gamingFocusHandler() {
    // Rend immédiatement le focus à Spotify dès que la PiP tente de le prendre
    window.focus();
  }

  function updateGamingMode() {
    const btn = getEl("mlp-gaming-btn");
    if (!btn) return;
    btn.classList.toggle("active", state.gamingMode);
    if (!pipWindow || pipWindow.closed) return;
    // Masquer/afficher le curseur sur la fenêtre PiP
    pipWindow.document.body.classList.toggle("gaming-mode", state.gamingMode);
    if (state.gamingMode) {
      pipWindow.addEventListener("focus", _gamingFocusHandler);
      pipWindow.blur();   // restitue le focus à Spotify immédiatement
      window.focus();
    } else {
      pipWindow.removeEventListener("focus", _gamingFocusHandler);
    }
  }

  // ─── RACCOURCIS CLAVIER ───────────────────────────────────────────────────
  function bindKeyboardShortcuts(doc) {
    doc.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          Spicetify.Player.togglePlay();
          setTimeout(() => updatePlayState(), 80);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) { Spicetify.Player.back(); showToast("⏮ Précédent"); }
          else { Spicetify.Player.seek(Math.max(0, Spicetify.Player.getProgress() - 5000)); showToast("◀ −5s"); }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) { Spicetify.Player.next(); showToast("⏭ Suivant"); }
          else { Spicetify.Player.seek(Math.min(Spicetify.Player.getDuration(), Spicetify.Player.getProgress() + 5000)); showToast("▶ +5s"); }
          break;
        case "ArrowUp":
          e.preventDefault();
          {
            const vol = Math.min(1, (Spicetify.Player.getVolume?.() ?? 0) + 0.05);
            Spicetify.Player.setVolume?.(vol);
            const s = doc.getElementById("mlp-volume-slider");
            if (s) { const p = Math.round(vol * 100); s.value = p; s.style.setProperty("--vol-pct", `${p}%`); }
            showToast(`🔊 ${Math.round(vol * 100)}%`);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          {
            const vol = Math.max(0, (Spicetify.Player.getVolume?.() ?? 1) - 0.05);
            Spicetify.Player.setVolume?.(vol);
            const s = doc.getElementById("mlp-volume-slider");
            if (s) { const p = Math.round(vol * 100); s.value = p; s.style.setProperty("--vol-pct", `${p}%`); }
            showToast(`🔉 ${Math.round(vol * 100)}%`);
          }
          break;
        case "KeyL": doc.getElementById("mlp-like-btn")?.click(); break;
        case "KeyS": doc.getElementById("mlp-shuffle-btn")?.click(); break;
        case "KeyR": doc.getElementById("mlp-repeat-btn")?.click(); break;
      }
    });
  }

  // ─── BIND UI EVENTS ───────────────────────────────────────────────────────
  function bindEvents() {
    const doc = getDoc();
    if (!doc) return;

    doc.getElementById("mlp-wc-close")?.addEventListener("click", () => pipWindow?.close());
    doc.getElementById("mlp-wc-toggle")?.addEventListener("click", () => {
      state.isCollapsed = !state.isCollapsed;
      doc.getElementById("mlp-root")?.classList.toggle("collapsed", state.isCollapsed);
      const btn = doc.getElementById("mlp-wc-toggle");
      if (btn) btn.innerHTML = state.isCollapsed ? ICONS.chevronUp : ICONS.chevronDown;
    });

    // Clic pochette → ouvre dans Spotify
    doc.getElementById("mlp-album-art")?.addEventListener("click", () => {
      if (state.currentTrackUri) {
        Spicetify.Platform?.History?.push?.(`/track/${state.currentTrackUri.split(":").pop()}`);
      }
    });

    doc.getElementById("mlp-prev-btn")?.addEventListener("click", () => Spicetify.Player.back());
    doc.getElementById("mlp-play-btn")?.addEventListener("click", () => {
      Spicetify.Player.togglePlay();
      setTimeout(() => updatePlayState(), 80);
    });
    doc.getElementById("mlp-next-btn")?.addEventListener("click", () => Spicetify.Player.next());

    // ── Shuffle ──
    doc.getElementById("mlp-shuffle-btn")?.addEventListener("click", () => {
      state.isShuffled = !state.isShuffled;
      Spicetify.Player.setShuffle?.(state.isShuffled);
      updateShuffleState();
      showToast(state.isShuffled ? "🔀 Aléatoire activé" : "🔀 Aléatoire désactivé");
    });

    // ── Like ──
    doc.getElementById("mlp-like-btn")?.addEventListener("click", async () => {
      const uri = state.currentTrackUri;
      if (!uri) return;
      try {
        if (state.isLiked) { await Spicetify.Platform.LibraryAPI.remove({ uris: [uri] }); }
        else { await Spicetify.Platform.LibraryAPI.add({ uris: [uri] }); }
        state.isLiked = !state.isLiked;
      } catch (_) {
        Spicetify.Player.toggleHeart?.();
        state.isLiked = !state.isLiked;
      }
      updateLikeState();
      showToast(state.isLiked ? "♥ Ajouté aux favoris" : "♡ Retiré des favoris");
    });

    // ── Repeat ──
    doc.getElementById("mlp-repeat-btn")?.addEventListener("click", () => {
      state.isRepeat = !state.isRepeat;
      Spicetify.Player.setRepeat?.(state.isRepeat ? 2 : 0);
      updateRepeatState();
      showToast(state.isRepeat ? "🔂 Répétition activée" : "🔂 Répétition désactivée");
    });

    // ── Volume ──
    const volSlider = doc.getElementById("mlp-volume-slider");
    if (volSlider) {
      const currentVol = Math.round((Spicetify.Player.getVolume?.() ?? 1) * 100);
      volSlider.value = currentVol;
      volSlider.style.setProperty("--vol-pct", `${currentVol}%`);
      volSlider.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        volSlider.style.setProperty("--vol-pct", `${val}%`);
        Spicetify.Player.setVolume?.(val / 100);
      });
    }

    // ── Seek ──
    doc.getElementById("mlp-progress-track")?.addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      Spicetify.Player.seek(Math.round(pct * Spicetify.Player.getDuration()));
    });

    // ── Temps restant (clic sur chrono) ──
    doc.getElementById("mlp-time-current")?.addEventListener("click", () => {
      state.showRemaining = !state.showRemaining;
      showToast(state.showRemaining ? "⏱ Temps restant" : "⏱ Temps écoulé");
      savePrefs();
    });

    // ── Défilement auto ──
    doc.getElementById("mlp-autoscroll-btn")?.addEventListener("click", () => {
      state.autoScroll = !state.autoScroll;
      updateAutoScrollState();
      showToast(state.autoScroll ? "↕ Défilement auto activé" : "↕ Défilement manuel");
      savePrefs();
    });

    // ── Taille de police ──
    doc.getElementById("mlp-fontsize-btn")?.addEventListener("click", () => {
      state.fontSizeIdx = (state.fontSizeIdx + 1) % FONT_SIZES.length;
      applyFontSize();
      showToast(`Aa ${FONT_SIZES[state.fontSizeIdx]}px`);
      savePrefs();
    });

    // ── Mode Gaming ──
    doc.getElementById("mlp-gaming-btn")?.addEventListener("click", () => {
      state.gamingMode = !state.gamingMode;
      updateGamingMode();
      showToast(state.gamingMode ? "🎮 Mode gaming activé" : "🎮 Mode gaming désactivé");
      savePrefs();
    });

    bindKeyboardShortcuts(doc);
  }

  // ─── OPEN / CLOSE PIP WINDOW ──────────────────────────────────────────────
  async function openPip() {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      pipWindow = null;
      clearIntervals();
      return;
    }

    if ("documentPictureInPicture" in window) {
      try {
        pipWindow = await window.documentPictureInPicture.requestWindow({ width: 320, height: 545 });
      } catch (err) {
        console.warn("[MiniLyricsPlayer] documentPictureInPicture non disponible:", err);
      }
    }

    if (!pipWindow || pipWindow.closed) {
      const left = Math.max(0, window.screen.width - 340);
      pipWindow = window.open(
        "about:blank", "MiniLyricsPlayer",
        `width=320,height=545,left=${left},top=40,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
      );
    }

    if (!pipWindow) {
      Spicetify.showNotification("Impossible d'ouvrir la fenêtre de paroles", true);
      return;
    }

    const doc = pipWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>♫ Paroles</title>
  <style>${buildCSS()}</style>
</head>
<body>${buildHTML()}</body>
</html>`);
    doc.close();

    const root = doc.getElementById("mlp-root");
    if (root) {
      root.style.setProperty("--mlp-accent", state.dominantColor);
      root.style.setProperty("--mlp-font-size", `${FONT_SIZES[state.fontSizeIdx]}px`);
    }

    // Lire état shuffle réel au démarrage
    state.isShuffled = Spicetify.Player.data?.shuffle ?? false;

    bindEvents();

    await updateTrackInfo();
    updatePlayState();
    updateLikeState();
    updateRepeatState();
    updateShuffleState();
    updateAutoScrollState();
    updateGamingMode();
    updateProgress();

    state.progressIntervalId = setInterval(updateProgress, 200);

    pipWindow.addEventListener("pagehide", () => {
      clearIntervals();
      savePrefs();
      pipWindow = null;
      state.currentLineIndex = -1;
      state.lyrics = [];
      state.lineElements = [];
      state.wordElements = [];
      state.wordTimings = [];
    });
  }

  // ─── SPICETIFY PLAYER EVENTS ──────────────────────────────────────────────
  Spicetify.Player.addEventListener("songchange", async () => {
    if (!pipWindow || pipWindow.closed) return;
    const oldUri = state.currentTrackUri;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 150));
      const item = Spicetify.Player.data?.item || Spicetify.Player.data?.track;
      const newUri = item?.uri || "";
      if (newUri && newUri !== oldUri) break;
    }
    if (!pipWindow || pipWindow.closed) return;
    await updateTrackInfo();
    updatePlayState();
  });

  Spicetify.Player.addEventListener("onplaypause", () => {
    updatePlayState();
  });

  // ─── TOPBAR BUTTON ────────────────────────────────────────────────────────
  if (Spicetify.Topbar?.Button) {
    new Spicetify.Topbar.Button(
      "Mini Lyrics Player",
      `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>`,
      openPip,
      false
    );
  }

  console.log("[MiniLyricsPlayer] ✓ v2.0.0 — Karaoke Wipe Engine — Prêt");
})(); // C'est la dernière ligne du fichier. Ne mettez rien après.