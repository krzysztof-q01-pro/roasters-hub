<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bean Map — UI Kit v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --c-primary:#974400;--c-primary-hover:#a85218;--c-primary-fixed:#ffdbc9;--c-primary-fixed-dim:#ffb68d;
  --c-secondary:#2c694e;--c-secondary-container:#aeeecb;
  --c-bg:#f9f9f7;--c-surface:#ffffff;--c-surface-low:#f4f4f2;--c-surface-container:#eeeeec;
  --c-surface-high:#e8e8e6;--c-surface-highest:#e2e3e1;
  --c-on-surface:#1a1c1b;--c-on-surface-variant:#564338;
  --c-outline:#897267;--c-outline-variant:#dcc1b3;
  --c-error:#ba1a1a;--c-error-container:#ffdad6;
  --c-warning:#b45309;--c-warning-soft:#fef3c7;
  --c-footer:#1c1917;
  --f-display:'Fraunces',Georgia,serif;
  --f-body:'Source Sans 3',system-ui,sans-serif;
  --r-sm:4px;--r-md:8px;--r-lg:12px;--r-xl:16px;--r-2xl:24px;--r-full:9999px;
  --shadow-card:0 1px 3px rgba(0,0,0,.08);--shadow-hover:0 4px 12px rgba(0,0,0,.12);--shadow-dropdown:0 8px 24px rgba(0,0,0,.12);
}
html,body{height:100%}
body{font-family:var(--f-body);background:var(--c-bg);color:var(--c-on-surface);-webkit-font-smoothing:antialiased}

/* ── PROTOTYPE NAV (clearly separate tool) ── */
.proto-nav{
  position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:4px;
  background:#0f0f0f;border-radius:var(--r-full);
  padding:6px 6px 6px 14px;
  box-shadow:0 8px 32px rgba(0,0,0,.35);
  white-space:nowrap;
}
.proto-label{font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-right:6px}
.proto-btn{
  font-family:var(--f-body);font-size:11px;font-weight:600;color:rgba(255,255,255,.55);
  padding:5px 12px;border-radius:var(--r-full);cursor:pointer;
  border:none;background:transparent;transition:all .15s;
}
.proto-btn:hover{color:white;background:rgba(255,255,255,.1)}
.proto-btn.active{background:var(--c-primary);color:white}

/* ── SCREENS ── */
.screens-wrap{min-height:100vh;padding-bottom:72px}
.screen{display:none;min-height:calc(100vh - 72px)}
.screen.active{display:flex;flex-direction:column}

/* ── HEADER ── */
.header{
  position:sticky;top:0;z-index:100;
  background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(232,232,230,.5);
}
.header-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:66px;gap:16px}
.logo{font-family:var(--f-display);font-size:22px;font-weight:600;color:var(--c-primary);letter-spacing:-.02em;cursor:pointer;text-decoration:none}
.nav-links{display:flex;align-items:center;gap:22px}
.nav-link{font-size:14px;font-weight:700;color:var(--c-on-surface-variant);letter-spacing:-.01em;cursor:pointer;text-decoration:none;transition:color .15s}
.nav-link:hover{color:var(--c-on-surface)}
.nav-link.active{color:var(--c-primary);border-bottom:2px solid var(--c-primary);padding-bottom:3px}

/* Search bar */
.header-search{display:flex;align-items:center;background:var(--c-surface-low);border-radius:var(--r-md);overflow:hidden;height:42px;border:1.5px solid transparent;transition:border-color .2s}
.header-search:focus-within{border-color:var(--c-outline-variant)}
.search-toggle{padding:0 11px;height:100%;display:flex;align-items:center;cursor:pointer;border:none;transition:background .15s}
.search-toggle.on-roasters{background:var(--c-primary);color:white}
.search-toggle.on-cafes{background:var(--c-secondary);color:white}
.search-toggle.off{background:transparent;color:var(--c-outline)}
.search-div{width:1px;height:55%;background:rgba(220,193,179,.3)}
.search-input-wrap{display:flex;align-items:center;padding:0 14px;gap:8px;flex:1}
.search-input{font-family:var(--f-body);font-size:14px;background:transparent;border:none;outline:none;color:var(--c-on-surface);width:180px}
.search-input::placeholder{color:rgba(86,67,56,.45)}

/* Drop-down "Add place" */
.add-btn{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;background:var(--c-surface-container);color:var(--c-on-surface);padding:8px 14px;border-radius:var(--r-md);cursor:pointer;border:none;transition:background .15s;white-space:nowrap}
.add-btn:hover{background:var(--c-surface-high)}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--f-body);font-weight:600;font-size:14px;border-radius:var(--r-md);padding:10px 20px;cursor:pointer;border:1.5px solid transparent;transition:all .2s;text-decoration:none;letter-spacing:-.01em;line-height:1}
.btn-primary{background:var(--c-primary);color:white;border-color:var(--c-primary)}
.btn-primary:hover{background:var(--c-primary-hover);border-color:var(--c-primary-hover)}
.btn-secondary{background:transparent;color:var(--c-primary);border-color:var(--c-primary)}
.btn-secondary:hover{background:var(--c-primary-fixed)}
.btn-ghost{background:transparent;color:var(--c-primary);border-color:transparent}
.btn-success{background:var(--c-secondary);color:white;border-color:var(--c-secondary)}
.btn-danger{background:var(--c-error);color:white;border-color:var(--c-error)}
.btn-sm{padding:6px 14px;font-size:12px}
.btn-lg{padding:14px 30px;font-size:16px;border-radius:var(--r-lg)}
.btn-full{width:100%;justify-content:center}

/* ── BADGES ── */
.badge-verified{display:inline-flex;align-items:center;gap:3px;background:var(--c-secondary);color:white;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;border-radius:var(--r-full)}
.badge-cert{display:inline-flex;background:var(--c-surface-high);color:var(--c-on-surface-variant);font-size:9px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--r-full)}
.badge-featured{background:var(--c-primary);color:white;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;border-radius:var(--r-full)}

/* Status badges */
.status-pending{background:var(--c-warning-soft);color:var(--c-warning);font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:4px}
.status-verified{background:var(--c-secondary-container);color:var(--c-secondary);font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:4px}
.status-rejected{background:var(--c-error-container);color:var(--c-error);font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:4px}

/* ── ROASTER CARDS ── */
.roaster-card{cursor:pointer}
.roaster-card:hover .card-img-wrap{box-shadow:var(--shadow-hover)}
.roaster-card:hover .card-img-bg{transform:scale(1.05)}
.roaster-card:hover .card-title{color:var(--c-primary)}
.card-img-wrap{position:relative;aspect-ratio:4/5;border-radius:var(--r-lg);overflow:hidden;background:var(--c-surface-container);box-shadow:var(--shadow-card);margin-bottom:12px;transition:box-shadow .3s}
.card-img-bg{width:100%;height:100%;transition:transform .7s}
.card-overlay-tl{position:absolute;top:10px;left:10px}
.card-overlay-tr{position:absolute;top:10px;right:10px}
.card-title{font-family:var(--f-display);font-size:17px;font-weight:600;color:var(--c-on-surface);margin-bottom:3px;transition:color .2s;letter-spacing:-.01em}
.card-location{font-size:12px;color:var(--c-outline);margin-bottom:8px}
.card-badges{display:flex;gap:4px;flex-wrap:wrap}

/* Compact */
.compact-card{background:var(--c-surface);border-radius:var(--r-lg);padding:10px;border:1px solid transparent;display:flex;gap:10px;cursor:pointer;transition:all .2s}
.compact-card:hover{border-color:rgba(151,68,0,.2);box-shadow:var(--shadow-hover)}
.compact-card.highlighted{border-color:rgba(151,68,0,.35);background:rgba(255,219,201,.15)}
.compact-img{width:72px;height:72px;border-radius:var(--r-md);flex-shrink:0;overflow:hidden}
.compact-body{flex:1;display:flex;flex-direction:column;justify-content:space-between}
.compact-title{font-family:var(--f-display);font-size:14px;font-weight:700;color:var(--c-on-surface)}
.compact-loc{font-size:11px;color:var(--c-outline);margin:2px 0 6px}

/* ── INPUTS ── */
.input{font-family:var(--f-body);font-size:15px;background:var(--c-surface);border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:11px 16px;color:var(--c-on-surface);width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
.input:focus{border-color:var(--c-primary);box-shadow:0 0 0 3px rgba(151,68,0,.12)}
.input::placeholder{color:rgba(86,67,56,.4)}
.input.error{border-color:var(--c-error);box-shadow:0 0 0 3px rgba(186,26,26,.1)}
textarea.input{resize:vertical;min-height:100px;line-height:1.6}
select.input{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23897267' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
.field-label{font-size:13px;font-weight:600;color:var(--c-on-surface);display:block;margin-bottom:6px}
.field-hint{font-size:12px;color:var(--c-outline);margin-top:5px;line-height:1.4}
.field-error{font-size:12px;color:var(--c-error);margin-top:5px}
.char-counter{font-size:11px;color:var(--c-outline);text-align:right;margin-top:4px}
.field-group{display:flex;flex-direction:column;gap:0}

/* Filter chip */
.chip{display:inline-flex;align-items:center;font-size:13px;font-weight:500;padding:6px 14px;border-radius:var(--r-full);border:1.5px solid var(--c-outline-variant);background:transparent;color:var(--c-on-surface-variant);cursor:pointer;transition:all .15s}
.chip.active{background:var(--c-primary-fixed);color:var(--c-primary);border-color:var(--c-primary)}
.chip:hover:not(.active){border-color:var(--c-outline)}

/* Toggle */
.toggle-wrap{display:flex;align-items:center;justify-content:space-between;padding:12px 0}
.toggle{width:40px;height:22px;border-radius:11px;background:var(--c-surface-high);cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.toggle.on{background:var(--c-primary)}
.toggle-thumb{width:18px;height:18px;border-radius:50%;background:white;position:absolute;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle.on .toggle-thumb{transform:translateX(18px)}

/* ── FORM STEP INDICATOR ── */
.step-bar{display:flex;align-items:center;margin-bottom:36px}
.step-item{display:flex;align-items:center;gap:10px;cursor:pointer}
.step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;transition:all .2s}
.step-dot.done{background:var(--c-secondary);color:white}
.step-dot.active{background:var(--c-primary);color:white;box-shadow:0 0 0 4px rgba(151,68,0,.15)}
.step-dot.upcoming{background:var(--c-surface-container);color:var(--c-outline);border:2px solid var(--c-surface-high)}
.step-text{font-size:13px;font-weight:600}
.step-text.done{color:var(--c-secondary)}
.step-text.active{color:var(--c-primary)}
.step-text.upcoming{color:var(--c-outline)}
.step-line{flex:1;height:2px;margin:0 10px}
.step-line.done{background:var(--c-primary)}
.step-line.upcoming{background:var(--c-surface-high)}

/* ── PHOTO UPLOAD ── */
.upload-zone{border:2px dashed var(--c-outline-variant);border-radius:var(--r-lg);padding:32px;text-align:center;cursor:pointer;transition:all .2s;background:var(--c-surface-low)}
.upload-zone:hover{border-color:var(--c-primary);background:rgba(255,219,201,.15)}
.upload-thumbs{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.upload-thumb{width:72px;height:72px;border-radius:var(--r-md);overflow:hidden;position:relative;flex-shrink:0}
.upload-thumb-remove{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.6);color:white;display:flex;align-items:center;justify-content:center;font-size:9px;cursor:pointer}

/* ── MULTI-SELECT TAGS ── */
.tag-input-wrap{border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:8px 12px;background:var(--c-surface);display:flex;flex-wrap:wrap;gap:6px;cursor:text;transition:border-color .2s}
.tag-input-wrap:focus-within{border-color:var(--c-primary);box-shadow:0 0 0 3px rgba(151,68,0,.12)}
.tag{display:inline-flex;align-items:center;gap:4px;background:var(--c-primary-fixed);color:var(--c-primary);font-size:12px;font-weight:600;padding:3px 8px;border-radius:var(--r-full)}
.tag-remove{cursor:pointer;opacity:.6;font-size:10px}
.tag-text-input{border:none;outline:none;font-family:var(--f-body);font-size:14px;color:var(--c-on-surface);background:transparent;min-width:120px}
.tag-text-input::placeholder{color:rgba(86,67,56,.4)}

/* ── CERT CHECKBOX GRID ── */
.cert-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cert-item{border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:10px 12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px}
.cert-item.selected{border-color:var(--c-secondary);background:rgba(174,238,203,.2)}
.cert-icon{width:20px;height:20px;border-radius:4px;background:var(--c-secondary-container);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
.cert-check{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--c-outline-variant);margin-left:auto;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;transition:all .2s}
.cert-item.selected .cert-check{background:var(--c-secondary);border-color:var(--c-secondary);color:white}

/* ── INFO CARD ── */
.info-card{background:var(--c-surface);border-radius:var(--r-xl);border:1px solid var(--c-surface-high);box-shadow:var(--shadow-card);padding:22px;position:sticky;top:88px}
.info-divider{height:1px;background:var(--c-surface-high);margin:16px 0}

/* ── FOOTER ── */
.footer{background:var(--c-footer);padding:48px 24px 24px;margin-top:auto}
.footer-inner{max-width:1280px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.2fr;gap:32px;margin-bottom:32px}
.footer-brand{font-family:var(--f-display);font-size:26px;color:white;margin-bottom:8px}
.footer-tagline{font-size:13px;color:#a8a29e;line-height:1.6}
.footer-head{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:white;margin-bottom:14px}
.footer-link{font-size:13px;color:#a8a29e;display:block;margin-bottom:10px;text-decoration:none;transition:all .15s;cursor:pointer}
.footer-link:hover{color:#f97316;transform:translateX(2px)}
.footer-cta-link{font-size:13px;color:#f97316;font-weight:600;display:flex;align-items:center;gap:5px;margin-bottom:10px;cursor:pointer;transition:color .15s}
.footer-cta-link:hover{color:white}
.footer-copyright{font-size:11px;color:rgba(168,162,158,.4);border-top:1px solid rgba(255,255,255,.07);padding-top:16px}

/* ── ADMIN ── */
.admin-header{background:var(--c-on-surface);border-bottom:1px solid rgba(255,255,255,.08)}
.admin-header-inner{max-width:100%;display:flex;align-items:center;padding:0 24px;height:58px;gap:32px}
.admin-logo{font-family:var(--f-display);font-size:18px;font-weight:600;color:white;letter-spacing:-.02em}
.admin-logo span{color:var(--c-primary-fixed-dim);font-size:11px;font-family:var(--f-body);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-left:8px;vertical-align:middle}
.admin-nav-link{font-size:13px;font-weight:600;color:rgba(255,255,255,.5);cursor:pointer;transition:color .15s;text-decoration:none;display:flex;align-items:center;gap:6px}
.admin-nav-link:hover{color:white}
.admin-nav-link.active{color:white}
.admin-badge{background:var(--c-primary);color:white;font-size:9px;font-weight:700;padding:2px 6px;border-radius:var(--r-full);line-height:1.4}

.admin-queue-item{padding:12px 16px;border-bottom:1px solid var(--c-surface-high);cursor:pointer;transition:background .15s;display:flex;gap:12px;align-items:center}
.admin-queue-item:hover{background:var(--c-surface-low)}
.admin-queue-item.selected{background:rgba(255,219,201,.25);border-left:3px solid var(--c-primary)}
.admin-queue-thumb{width:44px;height:44px;border-radius:var(--r-md);flex-shrink:0;overflow:hidden}
.admin-queue-name{font-size:14px;font-weight:700;color:var(--c-on-surface);margin-bottom:2px}
.admin-queue-meta{font-size:11px;color:var(--c-outline)}
.admin-tabs{display:flex;border-bottom:1px solid var(--c-surface-high);padding:0 16px;gap:0}
.admin-tab{font-size:12px;font-weight:600;color:var(--c-outline);padding:10px 14px;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s}
.admin-tab.active{color:var(--c-primary);border-bottom-color:var(--c-primary)}

/* Editable field in admin */
.editable-field{position:relative}
.editable-field .edit-overlay{position:absolute;top:0;left:0;right:0;bottom:0;border:1.5px dashed var(--c-outline-variant);border-radius:var(--r-md);cursor:pointer;opacity:0;transition:opacity .2s}
.editable-field:hover .edit-overlay{opacity:1}
.edit-icon{position:absolute;top:6px;right:6px;width:24px;height:24px;background:var(--c-primary);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:11px}

/* ── LAYOUT ── */
.container{max-width:1280px;margin:0 auto;padding:0 24px}

/* map pin */
.map-pin{width:30px;height:30px;border-radius:50%;background:var(--c-primary);display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 2px 8px rgba(151,68,0,.4);cursor:pointer;transition:transform .15s}
.map-pin:hover{transform:scale(1.2)}
.map-pin.cluster{width:38px;height:38px;font-size:12px;font-weight:700;border:3px solid white}
</style>
</head>
<body>

<!-- ═══════════════════════════ SCREENS ═══════════════════════════ -->
<div class="screens-wrap">

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 1 · HOMEPAGE -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen active" id="s-home" data-screen-label="01 Homepage">
  <header class="header">
    <div class="header-inner">
      <div style="display:flex;align-items:center;gap:28px">
        <a class="logo" style="display:flex;align-items:center"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a>
        <nav class="nav-links">
          <a class="nav-link active">Browse Roasters</a>
          <a class="nav-link">Browse Cafes</a>
          <a class="nav-link">Map</a>
        </nav>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="header-search">
          <button class="search-toggle on-roasters"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="14" rx="6" ry="4"/><path d="M12 4c-1.5 0-3 .8-4 2l1.5 1c.6-.8 1.5-1.3 2.5-1.3s1.9.5 2.5 1.3L16 6c-1-1.2-2.5-2-4-2z"/></svg></button>
          <div class="search-div"></div>
          <button class="search-toggle off"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zm0 5H17V5h1.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8z"/><path d="M4 19h16v2H4z"/></svg></button>
          <div class="search-input-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search-input" placeholder="Search roasters..."></div>
        </div>
        <button class="add-btn" onclick="go('register')">+ Add place <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 9l-7 7-7-7"/></svg></button>
      </div>
    </div>
  </header>

  <!-- Hero — video background -->
  <section style="position:relative;min-height:560px;display:flex;align-items:center;overflow:hidden;background:#1a1009">
    <!-- Video -->
    <video
      autoplay muted loop playsinline
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55"
    >
      <source src="../../assets/hero-bg.mp4" type="video/mp4">
    </video>
    <!-- Gradient overlay: bottom darker so stats bar blends, left darker for text legibility -->
    <div style="position:absolute;inset:0;background:linear-gradient(105deg,rgba(10,5,0,.72) 0%,rgba(10,5,0,.35) 55%,rgba(10,5,0,.18) 100%)"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to top,rgba(249,249,247,.9),transparent)"></div>

    <!-- Content -->
    <div class="container" style="position:relative;z-index:2;padding-top:80px;padding-bottom:80px">
      <div style="max-width:640px">
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,219,201,.18);border:1px solid rgba(255,219,201,.35);color:#ffdbc9;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:var(--r-full);margin-bottom:22px;backdrop-filter:blur(8px)">🫘 Specialty Coffee Directory</div>
        <h1 style="font-family:var(--f-display);font-size:58px;font-weight:600;letter-spacing:-.025em;line-height:1.06;color:white;margin-bottom:20px;text-wrap:pretty;text-shadow:0 2px 24px rgba(0,0,0,.25)">Discover specialty coffee</h1>
        <p style="font-size:18px;color:rgba(255,255,255,.8);line-height:1.65;margin-bottom:36px;text-shadow:0 1px 8px rgba(0,0,0,.3)">The global directory connecting cafés and coffee lovers with verified specialty roasters worldwide.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" onclick="go('catalog')">Browse Roasters <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></button>
          <button class="btn btn-lg" onclick="go('register')" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.45);color:white;backdrop-filter:blur(8px)">List Your Roastery</button>
          <button class="btn btn-ghost btn-lg" onclick="go('map')" style="color:rgba(255,255,255,.75)">Find a Cafe ↗</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section style="border-top:1px solid var(--c-surface-high);border-bottom:1px solid var(--c-surface-high);background:var(--c-surface);padding:22px 0">
    <div class="container"><div style="display:flex;justify-content:center;gap:56px;align-items:center">
      <div style="text-align:center"><div style="font-family:var(--f-display);font-size:38px;font-weight:700;color:var(--c-primary);letter-spacing:-.03em;line-height:1">50+</div><div style="font-size:11px;font-weight:700;color:var(--c-outline);text-transform:uppercase;letter-spacing:.12em;margin-top:3px">Roasters</div></div>
      <div style="width:1px;height:38px;background:var(--c-surface-high)"></div>
      <div style="text-align:center"><div style="font-family:var(--f-display);font-size:38px;font-weight:700;color:var(--c-primary);letter-spacing:-.03em;line-height:1">100</div><div style="font-size:11px;font-weight:700;color:var(--c-outline);text-transform:uppercase;letter-spacing:.12em;margin-top:3px">Cafes</div></div>
      <div style="width:1px;height:38px;background:var(--c-surface-high)"></div>
      <div style="text-align:center"><div style="font-family:var(--f-display);font-size:38px;font-weight:700;color:var(--c-primary);letter-spacing:-.03em;line-height:1">17</div><div style="font-size:11px;font-weight:700;color:var(--c-outline);text-transform:uppercase;letter-spacing:.12em;margin-top:3px">Countries</div></div>
      <div style="width:1px;height:38px;background:var(--c-surface-high)"></div>
      <div style="text-align:center"><div style="font-family:var(--f-display);font-size:38px;font-weight:700;color:var(--c-primary);letter-spacing:-.03em;line-height:1">50</div><div style="font-size:11px;font-weight:700;color:var(--c-outline);text-transform:uppercase;letter-spacing:.12em;margin-top:3px">Verified</div></div>
    </div></div>
  </section>

  <!-- Featured -->
  <section style="padding:60px 0">
    <div class="container">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:32px">
        <div><h2 style="font-family:var(--f-display);font-size:34px;font-weight:600;letter-spacing:-.02em;margin-bottom:6px">Featured Roasters</h2><p style="font-size:15px;color:var(--c-outline)">Curated selections from our global network.</p></div>
        <a class="btn btn-ghost" onclick="go('catalog')">View all roasters ↗</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
        <div class="roaster-card" onclick="go('profile')"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#c4a080,#6a3a18);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span><span class="card-overlay-tl badge-featured">Featured</span></div><div class="card-title">Onyx Coffee Lab</div><div class="card-location">Rogers, AR · United States</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">SCA Member</span></div></div>
        <div class="roaster-card" onclick="go('profile')"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#8fa880,#3d5530);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span><span class="card-overlay-tl badge-featured">Featured</span></div><div class="card-title">Tim Wendelboe</div><div class="card-location">Oslo · Norway</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">Organic</span></div></div>
        <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#b0a090,#604a30);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">Square Mile</div><div class="card-location">London · United Kingdom</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">Organic</span></div></div>
        <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#d0c0a0,#806040);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">The Nordic Roast</div><div class="card-location">Oslo · Norway</div><div class="card-badges"><span class="badge-cert">Organic</span><span class="badge-cert">Direct Trade</span></div></div>
      </div>
    </div>
  </section>

  <!-- Value props -->
  <section style="background:var(--c-surface);padding:60px 0;border-top:1px solid var(--c-surface-high)">
    <div class="container">
      <h2 style="font-family:var(--f-display);font-size:34px;font-weight:600;letter-spacing:-.02em;text-align:center;margin-bottom:40px">Built for the specialty coffee community</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
        <div style="text-align:center;padding:0 16px"><div style="width:52px;height:52px;background:var(--c-primary-fixed);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px">🫘</div><h3 style="font-family:var(--f-display);font-size:20px;font-weight:600;margin-bottom:8px">Coffee Roasters</h3><p style="font-size:14px;color:var(--c-on-surface-variant);line-height:1.65">Showcase your beans and unique roasting philosophy to a global audience of dedicated coffee lovers.</p></div>
        <div style="text-align:center;padding:0 16px"><div style="width:52px;height:52px;background:var(--c-secondary-container);border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px">☕</div><h3 style="font-family:var(--f-display);font-size:20px;font-weight:600;margin-bottom:8px">Cafés & Buyers</h3><p style="font-size:14px;color:var(--c-on-surface-variant);line-height:1.65">Source exceptional beans for your café by connecting directly with verified specialty producers worldwide.</p></div>
        <div style="text-align:center;padding:0 16px"><div style="width:52px;height:52px;background:#c8e6ff;border-radius:var(--r-xl);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px">🗺️</div><h3 style="font-family:var(--f-display);font-size:20px;font-weight:600;margin-bottom:8px">Coffee Lovers</h3><p style="font-size:14px;color:var(--c-on-surface-variant);line-height:1.65">Find your next favorite roast and explore the diverse world of specialty coffee through our curated map.</p></div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer"><div class="footer-inner"><div class="footer-grid"><div><div class="footer-brand"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:36px;width:auto;filter:brightness(0) invert(1)"></div><div class="footer-tagline">Connecting the specialty coffee ecosystem through transparency, origin, and community.</div></div><div><div class="footer-head">Explore</div><a class="footer-link">Browse Roasters</a><a class="footer-link">Browse Cafes</a><a class="footer-link">Interactive Map</a></div><div><div class="footer-head">Quick Links</div><a class="footer-link">Register Roastery</a><a class="footer-link">All Roasters</a><a class="footer-link">All Cafes</a></div><div><div class="footer-head">Join Us</div><a class="footer-cta-link">List Your Roastery ↗</a><a class="footer-cta-link">List Your Cafe ↗</a><a class="footer-link" style="margin-top:8px;font-size:12px;color:rgba(168,162,158,.5)">Suggest a roastery</a><a class="footer-link" style="font-size:12px;color:rgba(168,162,158,.5)">Suggest a café</a></div></div><div class="footer-copyright">© 2026 Bean Map. Crafted for the Sensory Curator. &nbsp;·&nbsp; v0.1.23</div></div></footer>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 2 · CATALOG -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-catalog" data-screen-label="02 Catalog">
  <header class="header"><div class="header-inner"><div style="display:flex;align-items:center;gap:28px"><a class="logo" style="display:flex;align-items:center" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><nav class="nav-links"><a class="nav-link active">Browse Roasters</a><a class="nav-link">Browse Cafes</a><a class="nav-link" onclick="go('map')">Map</a></nav></div><div class="header-search"><button class="search-toggle on-roasters"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="14" rx="6" ry="4"/><path d="M12 4c-1.5 0-3 .8-4 2l1.5 1c.6-.8 1.5-1.3 2.5-1.3s1.9.5 2.5 1.3L16 6c-1-1.2-2.5-2-4-2z"/></svg></button><div class="search-div"></div><button class="search-toggle off"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zm0 5H17V5h1.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8z"/><path d="M4 19h16v2H4z"/></svg></button><div class="search-input-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search-input" placeholder="Search roasters..."></div></div></div></div></header>

  <div class="container" style="padding-top:36px;padding-bottom:64px">
    <div style="margin-bottom:24px"><p style="font-size:12px;color:var(--c-outline);margin-bottom:6px">Home › Roasters</p><h1 style="font-family:var(--f-display);font-size:38px;font-weight:600;letter-spacing:-.02em">Specialty Coffee Roasters <span style="font-size:16px;font-weight:400;color:var(--c-outline);font-family:var(--f-body)">(50 verified)</span></h1></div>
    <div style="display:flex;gap:32px;align-items:flex-start">
      <!-- sidebar -->
      <aside style="width:255px;flex-shrink:0">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px"><span style="font-size:14px;font-weight:700">Filters</span><a style="font-size:12px;color:var(--c-primary);cursor:pointer">Clear all</a></div>
        <div style="margin-bottom:16px"><div style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--c-surface);border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input style="border:none;background:transparent;font-family:var(--f-body);font-size:13px;outline:none;width:100%;color:var(--c-on-surface)" placeholder="Search by name or city..."></div></div>
        <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--c-surface-high)"><div style="font-size:12px;font-weight:700;margin-bottom:8px">Country</div><select class="input" style="font-size:13px;padding:8px 10px"><option>All Countries</option><option>🇵🇱 Poland</option><option>🇳🇴 Norway</option><option>🇬🇧 United Kingdom</option><option>🇺🇸 United States</option></select></div>
        <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--c-surface-high)"><div style="font-size:12px;font-weight:700;margin-bottom:8px">Certifications</div><div style="display:flex;flex-wrap:wrap;gap:5px"><span class="chip active" style="font-size:11px;padding:4px 10px">Direct Trade</span><span class="chip" style="font-size:11px;padding:4px 10px">Organic</span><span class="chip" style="font-size:11px;padding:4px 10px">Fair Trade</span><span class="chip" style="font-size:11px;padding:4px 10px">SCA Member</span><span class="chip" style="font-size:11px;padding:4px 10px">Rainforest Alliance</span></div></div>
        <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--c-surface-high)"><div style="font-size:12px;font-weight:700;margin-bottom:8px">Roast Style</div><div style="display:flex;flex-wrap:wrap;gap:5px"><span class="chip active" style="font-size:11px;padding:4px 10px">Light</span><span class="chip" style="font-size:11px;padding:4px 10px">Medium</span><span class="chip" style="font-size:11px;padding:4px 10px">Dark</span><span class="chip" style="font-size:11px;padding:4px 10px">Espresso</span><span class="chip" style="font-size:11px;padding:4px 10px">Filter</span></div></div>
        <div class="toggle-wrap" style="padding:10px 0"><span style="font-size:13px;font-weight:500">Direct Trade only</span><div class="toggle on" onclick="this.classList.toggle('on')"><div class="toggle-thumb"></div></div></div>
        <div class="toggle-wrap" style="padding:10px 0"><span style="font-size:13px;font-weight:500">Featured only</span><div class="toggle" onclick="this.classList.toggle('on')"><div class="toggle-thumb"></div></div></div>
      </aside>
      <!-- grid -->
      <div style="flex:1">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px"><span style="font-size:13px;color:var(--c-outline)">Showing 24 of 50</span><select style="font-family:var(--f-body);font-size:13px;border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:6px 12px;background:var(--c-surface);color:var(--c-on-surface);outline:none"><option>Relevance</option><option>Name A–Z</option><option>Newest</option></select></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
          <div class="roaster-card" onclick="go('profile')"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#c4a080,#6a3a18);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span><span class="card-overlay-tl badge-featured">Featured</span></div><div class="card-title">Onyx Coffee Lab</div><div class="card-location">Rogers, AR · United States</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">SCA Member</span></div></div>
          <div class="roaster-card" onclick="go('profile')"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#8fa880,#3d5530);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">Tim Wendelboe</div><div class="card-location">Oslo · Norway</div><div class="card-badges"><span class="badge-cert">Organic</span><span class="badge-cert">Direct Trade</span></div></div>
          <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#b0a090,#604a30);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">Square Mile</div><div class="card-location">London · United Kingdom</div><div class="card-badges"><span class="badge-cert">Direct Trade</span></div></div>
          <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#d0b090,#9a7050);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">Hard Beans</div><div class="card-location">Opole · Poland</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">Organic</span></div></div>
          <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#e0c0a0,#a07050);height:100%"></div></div><div class="card-title">The Nordic Roast</div><div class="card-location">Oslo · Norway</div><div class="card-badges"><span class="badge-cert">Organic</span></div></div>
          <div class="roaster-card"><div class="card-img-wrap"><div class="card-img-bg" style="background:linear-gradient(155deg,#c8b0a0,#806050);height:100%"></div><span class="card-overlay-tr badge-verified">✓ Verified</span></div><div class="card-title">Five Elephant</div><div class="card-location">Berlin · Germany</div><div class="card-badges"><span class="badge-cert">Direct Trade</span><span class="badge-cert">SCA Member</span></div></div>
        </div>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:40px;align-items:center">
          <button style="padding:7px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-outline-variant);background:var(--c-surface);font-family:var(--f-body);font-size:13px;cursor:pointer;color:var(--c-on-surface-variant)">← Prev</button>
          <button style="padding:7px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-primary);background:var(--c-primary);font-family:var(--f-body);font-size:13px;cursor:pointer;color:white;font-weight:700">1</button>
          <button style="padding:7px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-outline-variant);background:var(--c-surface);font-family:var(--f-body);font-size:13px;cursor:pointer;color:var(--c-on-surface-variant)">2</button>
          <button style="padding:7px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-outline-variant);background:var(--c-surface);font-family:var(--f-body);font-size:13px;cursor:pointer;color:var(--c-on-surface-variant)">3</button>
          <span style="color:var(--c-outline);font-size:13px">…</span>
          <button style="padding:7px 14px;border-radius:var(--r-md);border:1.5px solid var(--c-outline-variant);background:var(--c-surface);font-family:var(--f-body);font-size:13px;cursor:pointer;color:var(--c-on-surface-variant)">Next →</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 3 · ROASTER PROFILE -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-profile" data-screen-label="03 Roaster Profile">
  <header class="header"><div class="header-inner"><div style="display:flex;align-items:center;gap:28px"><a class="logo" style="display:flex;align-items:center" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><nav class="nav-links"><a class="nav-link" onclick="go('catalog')">Browse Roasters</a><a class="nav-link">Browse Cafes</a><a class="nav-link">Map</a></nav></div></div></header>
  <div style="position:relative;height:340px;background:linear-gradient(155deg,#3a2010,#c4a080);overflow:hidden">
    <div style="position:absolute;bottom:0;left:0;right:0;height:60%;background:linear-gradient(to top,rgba(0,0,0,.72),transparent)"></div>
    <div style="position:absolute;bottom:28px;left:32px"><h1 style="font-family:var(--f-display);font-size:42px;font-weight:600;letter-spacing:-.025em;color:white;margin-bottom:5px;text-shadow:0 2px 12px rgba(0,0,0,.3)">Onyx Coffee Lab</h1><p style="font-size:14px;color:rgba(255,255,255,.8)">📍 Rogers, Arkansas, United States</p></div>
    <span class="badge-verified" style="position:absolute;top:22px;right:22px;font-size:11px;padding:6px 14px">✓ Verified Roaster</span>
  </div>
  <div class="container" style="padding-top:32px;padding-bottom:64px">
    <p style="font-size:12px;color:var(--c-outline);margin-bottom:28px">Home › Roasters › United States › Onyx Coffee Lab</p>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:40px;align-items:flex-start">
      <div>
        <section style="margin-bottom:36px"><h2 style="font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em;margin-bottom:14px">About Onyx Coffee Lab</h2><p style="font-size:15px;line-height:1.75;color:var(--c-on-surface-variant)">Pushing the boundaries of specialty coffee through science and transparency. Every bean is selected, profiled, and roasted with precision to unlock its full potential. Founded in Rogers, Arkansas, Onyx Coffee Lab has become one of the most respected roasters in the United States, earning recognition from the Specialty Coffee Association and coffee professionals worldwide.</p></section>
        <section style="margin-bottom:36px"><h2 style="font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em;margin-bottom:14px">Coffee Origins</h2><div style="display:flex;flex-wrap:wrap;gap:8px"><span style="background:var(--c-surface-low);font-size:13px;font-weight:500;padding:7px 16px;border-radius:var(--r-full);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant)">🇪🇹 Ethiopia</span><span style="background:var(--c-surface-low);font-size:13px;font-weight:500;padding:7px 16px;border-radius:var(--r-full);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant)">🇰🇪 Kenya</span><span style="background:var(--c-surface-low);font-size:13px;font-weight:500;padding:7px 16px;border-radius:var(--r-full);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant)">🇨🇴 Colombia</span><span style="background:var(--c-surface-low);font-size:13px;font-weight:500;padding:7px 16px;border-radius:var(--r-full);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant)">🇧🇷 Brazil</span></div></section>
        <section style="margin-bottom:36px"><h2 style="font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em;margin-bottom:14px">Certifications</h2><div style="display:flex;flex-wrap:wrap;gap:8px"><span style="background:var(--c-secondary-container);color:var(--c-secondary);font-size:12px;font-weight:600;padding:7px 16px;border-radius:var(--r-full)">Direct Trade</span><span style="background:var(--c-secondary-container);color:var(--c-secondary);font-size:12px;font-weight:600;padding:7px 16px;border-radius:var(--r-full)">SCA Member</span><span style="background:var(--c-secondary-container);color:var(--c-secondary);font-size:12px;font-weight:600;padding:7px 16px;border-radius:var(--r-full)">Organic</span></div></section>
        <section><h2 style="font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em;margin-bottom:14px">Gallery</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px"><div style="aspect-ratio:4/3;border-radius:var(--r-lg);background:linear-gradient(135deg,#d0b090,#907050);display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.5">☕</div><div style="aspect-ratio:4/3;border-radius:var(--r-lg);background:linear-gradient(135deg,#a0b080,#506040);display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.5">🫘</div><div style="aspect-ratio:4/3;border-radius:var(--r-lg);background:linear-gradient(135deg,#c0a080,#705040);display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.5">🏭</div></div></section>
      </div>
      <!-- info card -->
      <div class="info-card">
        <div style="font-family:var(--f-display);font-size:20px;font-weight:600;margin-bottom:4px">Onyx Coffee Lab</div>
        <div style="font-size:13px;color:var(--c-outline);margin-bottom:10px">📍 Rogers, Arkansas, United States 🇺🇸</div>
        <span class="badge-verified">✓ Verified Roaster</span>
        <div class="info-divider"></div>
        <button class="btn btn-primary btn-full" style="margin-bottom:8px">Visit Website ↗</button>
        <button class="btn btn-secondary btn-full" style="margin-bottom:8px">Shop Online ↗</button>
        <button class="btn btn-ghost btn-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> Instagram</button>
        <div class="info-divider"></div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:6px">Contact</div>
        <p style="font-size:13px;color:var(--c-on-surface-variant)">hello@onyxcoffeelab.com</p>
        <div class="info-divider"></div>
        <button class="btn btn-ghost btn-full" style="font-size:13px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share this roaster</button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 4 · REGISTER — ROASTERY (friendly multi-step) -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-register" data-screen-label="04 Register Roastery">
  <header class="header"><div class="header-inner"><a class="logo" style="display:flex;align-items:center" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><div style="font-size:13px;color:var(--c-outline)">Already listed? <a style="color:var(--c-primary);font-weight:600;cursor:pointer">Sign in</a></div></div></header>
  <div style="flex:1;display:flex">
    <!-- left decoration panel -->
    <div style="width:320px;background:var(--c-on-surface);flex-shrink:0;padding:48px 36px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="font-family:var(--f-display);font-size:26px;color:white;letter-spacing:-.02em;margin-bottom:8px">Get discovered.</div>
        <div style="font-family:var(--f-display);font-size:26px;color:var(--c-primary-fixed-dim);letter-spacing:-.02em;font-style:italic;margin-bottom:28px">Join the community.</div>
        <p style="font-size:14px;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:36px">Your free profile connects you with cafés and coffee lovers worldwide. Verification takes 48 hours.</p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,219,201,.15);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">✓</div><span style="font-size:13px;color:rgba(255,255,255,.7)">Free verified profile</span></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,219,201,.15);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">✓</div><span style="font-size:13px;color:rgba(255,255,255,.7)">Global visibility on catalog & map</span></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,219,201,.15);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">✓</div><span style="font-size:13px;color:rgba(255,255,255,.7)">Direct café connections</span></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,219,201,.15);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">✓</div><span style="font-size:13px;color:rgba(255,255,255,.7)">No credit card required</span></div>
        </div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.25);line-height:1.6">Want to list a café instead? <a style="color:var(--c-primary-fixed-dim);cursor:pointer" onclick="go('register-cafe')">Register a café →</a></div>
    </div>

    <!-- form area -->
    <div style="flex:1;overflow-y:auto;padding:48px 56px;max-width:660px">
      <!-- step bar -->
      <div class="step-bar">
        <div class="step-item"><div class="step-dot done">✓</div><span class="step-text done">Basic Info</span></div>
        <div class="step-line done"></div>
        <div class="step-item"><div class="step-dot active">2</div><span class="step-text active">Contact & Links</span></div>
        <div class="step-line upcoming"></div>
        <div class="step-item"><div class="step-dot upcoming">3</div><span class="step-text upcoming">Specialty</span></div>
      </div>

      <h2 style="font-family:var(--f-display);font-size:30px;font-weight:600;letter-spacing:-.02em;margin-bottom:6px">How can people find you?</h2>
      <p style="font-size:15px;color:var(--c-on-surface-variant);margin-bottom:36px;line-height:1.5">These links will appear on your public profile so cafés can reach you directly.</p>

      <div style="display:flex;flex-direction:column;gap:22px">
        <div class="field-group">
          <label class="field-label">Website URL</label>
          <input class="input" value="https://onyxcoffeelab.com" placeholder="https://yourroastery.com">
        </div>
        <div class="field-group">
          <label class="field-label">Online shop URL <span style="font-size:12px;font-weight:400;color:var(--c-outline)">(optional)</span></label>
          <input class="input" placeholder="https://shop.yourroastery.com">
          <div class="field-hint">If you sell beans online, add your shop URL so coffee lovers can purchase directly.</div>
        </div>
        <div class="field-group">
          <label class="field-label">Instagram</label>
          <div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--c-outline);pointer-events:none">@</span><input class="input" style="padding-left:30px" value="onyxcoffeelab" placeholder="yourhandle"></div>
        </div>
        <div class="field-group">
          <label class="field-label">Contact email <span style="font-size:12px;font-weight:400;color:var(--c-outline)">(optional — shown publicly)</span></label>
          <input class="input" type="email" placeholder="hello@yourroastery.com">
          <div class="field-hint">Cafés looking for suppliers will use this to reach you. Leave blank to keep email private.</div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:24px;border-top:1px solid var(--c-surface-high)">
        <button class="btn btn-ghost">← Back</button>
        <button class="btn btn-primary" onclick="showRegisterStep3()">Continue to Specialty →</button>
      </div>
    </div>
  </div>

  <!-- Step 3 overlay (hidden) -->
  <div id="register-step3" style="display:none;position:fixed;inset:0;background:var(--c-bg);z-index:200;overflow-y:auto;padding-bottom:72px">
    <div style="max-width:1100px;margin:0 auto;padding:0 24px">
      <div style="height:66px;display:flex;align-items:center;border-bottom:1px solid var(--c-surface-high);margin-bottom:40px"><a class="logo" style="display:flex;align-items:center" style="margin-right:auto" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><button class="btn btn-ghost btn-sm" onclick="hideRegisterStep3()">← Back to step 2</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">
        <div>
          <div class="step-bar"><div class="step-item"><div class="step-dot done">✓</div><span class="step-text done">Basic Info</span></div><div class="step-line done"></div><div class="step-item"><div class="step-dot done">✓</div><span class="step-text done">Contact</span></div><div class="step-line done"></div><div class="step-item"><div class="step-dot active">3</div><span class="step-text active">Specialty</span></div></div>
          <h2 style="font-family:var(--f-display);font-size:28px;font-weight:600;letter-spacing:-.02em;margin-bottom:6px">What makes your coffee special?</h2>
          <p style="font-size:14px;color:var(--c-on-surface-variant);margin-bottom:28px;line-height:1.5">Help cafés find you by describing your sourcing and roasting approach.</p>
          <div style="display:flex;flex-direction:column;gap:20px">
            <div class="field-group">
              <label class="field-label">Coffee origins <span style="font-size:12px;font-weight:400;color:var(--c-outline)">(type to add)</span></label>
              <div class="tag-input-wrap"><span class="tag">🇪🇹 Ethiopia <span class="tag-remove">✕</span></span><span class="tag">🇰🇪 Kenya <span class="tag-remove">✕</span></span><span class="tag">🇨🇴 Colombia <span class="tag-remove">✕</span></span><input class="tag-text-input" placeholder="Add origin..."></div>
            </div>
            <div class="field-group">
              <label class="field-label">Roast styles</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <span class="chip active" style="font-size:13px">Light</span>
                <span class="chip active" style="font-size:13px">Filter</span>
                <span class="chip" style="font-size:13px">Medium</span>
                <span class="chip" style="font-size:13px">Dark</span>
                <span class="chip" style="font-size:13px">Espresso</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="field-group" style="margin-bottom:24px">
            <label class="field-label">Certifications</label>
            <div class="cert-grid">
              <div class="cert-item selected"><div class="cert-icon">🌿</div><span style="font-size:12px;font-weight:500;flex:1">Direct Trade</span><div class="cert-check">✓</div></div>
              <div class="cert-item"><div class="cert-icon">🌱</div><span style="font-size:12px;font-weight:500;flex:1">Organic</span><div class="cert-check"></div></div>
              <div class="cert-item selected"><div class="cert-icon">☕</div><span style="font-size:12px;font-weight:500;flex:1">SCA Member</span><div class="cert-check">✓</div></div>
              <div class="cert-item"><div class="cert-icon">⚖️</div><span style="font-size:12px;font-weight:500;flex:1">Fair Trade</span><div class="cert-check"></div></div>
              <div class="cert-item"><div class="cert-icon">🌳</div><span style="font-size:12px;font-weight:500;flex:1">Rainforest Alliance</span><div class="cert-check"></div></div>
              <div class="cert-item"><div class="cert-icon">🐦</div><span style="font-size:12px;font-weight:500;flex:1">Bird Friendly</span><div class="cert-check"></div></div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Profile photos <span style="font-size:12px;font-weight:400;color:var(--c-outline)">(up to 5, max 5MB each)</span></label>
            <div class="upload-zone">
              <div style="font-size:28px;margin-bottom:8px">📸</div>
              <div style="font-size:14px;font-weight:600;color:var(--c-on-surface);margin-bottom:4px">Drag photos here or click to upload</div>
              <div style="font-size:12px;color:var(--c-outline)">JPG, PNG or WebP · Roastery, beans, baristas</div>
            </div>
            <div class="upload-thumbs">
              <div class="upload-thumb" style="background:linear-gradient(135deg,#c4a080,#7a5030)"><div class="upload-thumb-remove">✕</div></div>
              <div class="upload-thumb" style="background:linear-gradient(135deg,#8fa880,#3d5530)"><div class="upload-thumb-remove">✕</div></div>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:28px;padding:14px" onclick="showSuccess()">Submit for Verification →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Success overlay -->
  <div id="register-success" style="display:none;position:fixed;inset:0;background:var(--c-bg);z-index:300;display:none;align-items:center;justify-content:center">
    <div style="text-align:center;max-width:440px;padding:24px">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--c-secondary-container);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px;color:var(--c-secondary)">✓</div>
      <h2 style="font-family:var(--f-display);font-size:32px;font-weight:600;letter-spacing:-.02em;margin-bottom:12px">Your profile is submitted!</h2>
      <p style="font-size:15px;color:var(--c-on-surface-variant);line-height:1.7;margin-bottom:32px">We'll review your roastery profile within 48 hours. You'll receive an email once it's verified and live on Bean Map.</p>
      <button class="btn btn-primary btn-lg" onclick="go('catalog')">Browse roasters while you wait →</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 5 · REGISTER CAFÉ -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-register-cafe" data-screen-label="05 Register Café">
  <header class="header"><div class="header-inner"><a class="logo" style="display:flex;align-items:center" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><div style="font-size:13px;color:var(--c-outline)">Registering a roastery instead? <a style="color:var(--c-primary);font-weight:600;cursor:pointer" onclick="go('register')">Switch →</a></div></div></header>
  <div style="flex:1;display:flex">
    <div style="width:320px;background:#2c694e;flex-shrink:0;padding:48px 36px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="font-family:var(--f-display);font-size:26px;color:white;letter-spacing:-.02em;margin-bottom:8px">Connect with the best.</div>
        <div style="font-family:var(--f-display);font-size:26px;color:var(--c-secondary-container);letter-spacing:-.02em;font-style:italic;margin-bottom:28px">Source better beans.</div>
        <p style="font-size:14px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:36px">List your café and connect with verified specialty roasters. Find new suppliers, showcase your coffee program.</p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(174,238,203,.2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:white">✓</div><span style="font-size:13px;color:rgba(255,255,255,.75)">Free café listing</span></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(174,238,203,.2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:white">✓</div><span style="font-size:13px;color:rgba(255,255,255,.75)">Appear on the café map</span></div>
          <div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:rgba(174,238,203,.2);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;color:white">✓</div><span style="font-size:13px;color:rgba(255,255,255,.75)">Get discovered by roasters</span></div>
        </div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.3)">Specialty coffee community · Bean Map 2026</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:48px 56px;max-width:660px">
      <div class="step-bar">
        <div class="step-item"><div class="step-dot active">1</div><span class="step-text active">Café Info</span></div>
        <div class="step-line upcoming"></div>
        <div class="step-item"><div class="step-dot upcoming">2</div><span class="step-text upcoming">Location</span></div>
        <div class="step-line upcoming"></div>
        <div class="step-item"><div class="step-dot upcoming">3</div><span class="step-text upcoming">Coffee Program</span></div>
      </div>
      <h2 style="font-family:var(--f-display);font-size:30px;font-weight:600;letter-spacing:-.02em;margin-bottom:6px">Tell us about your café</h2>
      <p style="font-size:15px;color:var(--c-on-surface-variant);margin-bottom:36px;line-height:1.5">Basic details for your public café listing on Bean Map.</p>
      <div style="display:flex;flex-direction:column;gap:22px">
        <div class="field-group">
          <label class="field-label">Café name <span style="color:var(--c-error)">*</span></label>
          <input class="input" placeholder="e.g. The Slow Lane Coffee">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="field-group">
            <label class="field-label">Country <span style="color:var(--c-error)">*</span></label>
            <select class="input"><option>Select country…</option><option>🇵🇱 Poland</option><option>🇳🇴 Norway</option><option>🇬🇧 United Kingdom</option><option>🇩🇪 Germany</option><option>🇺🇸 United States</option></select>
          </div>
          <div class="field-group">
            <label class="field-label">City <span style="color:var(--c-error)">*</span></label>
            <input class="input" placeholder="e.g. Warsaw">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Street address</label>
          <input class="input" placeholder="e.g. ul. Nowy Świat 12">
          <div class="field-hint">Helps customers find you on the map.</div>
        </div>
        <div class="field-group">
          <label class="field-label">About your café</label>
          <textarea class="input" placeholder="Describe your café — atmosphere, coffee philosophy, what makes you special…" oninput="document.getElementById('cafe-desc-count').textContent=this.value.length"></textarea>
          <div class="char-counter"><span id="cafe-desc-count">0</span> / 2000</div>
        </div>
        <div class="field-group">
          <label class="field-label">Opening hours <span style="font-size:12px;font-weight:400;color:var(--c-outline)">(optional)</span></label>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="display:grid;grid-template-columns:90px 1fr 1fr;gap:8px;align-items:center"><span style="font-size:13px;font-weight:500;color:var(--c-on-surface-variant)">Mon–Fri</span><input class="input" value="08:00" style="padding:8px 12px;font-size:13px"><input class="input" value="20:00" style="padding:8px 12px;font-size:13px"></div>
            <div style="display:grid;grid-template-columns:90px 1fr 1fr;gap:8px;align-items:center"><span style="font-size:13px;font-weight:500;color:var(--c-on-surface-variant)">Sat–Sun</span><input class="input" value="09:00" style="padding:8px 12px;font-size:13px"><input class="input" value="18:00" style="padding:8px 12px;font-size:13px"></div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:40px;padding-top:24px;border-top:1px solid var(--c-surface-high)">
        <button class="btn btn-success btn-lg">Continue to Location →</button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 6 · ADMIN — PENDING QUEUE -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-admin" data-screen-label="06 Admin Queue">
  <header class="admin-header">
    <div class="admin-header-inner">
      <div class="admin-logo" style="display:flex;align-items:center;gap:8px"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:32px;width:auto"> <span>Admin</span></div>
      <div style="display:flex;align-items:center;gap:24px;margin-left:32px">
        <a class="admin-nav-link active"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Pending <span class="admin-badge">12</span></a>
        <a class="admin-nav-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> All Roasters</a>
        <a class="admin-nav-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3z"/><path d="M4 19h16v2H4z"/></svg> All Cafes</a>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
        <a class="admin-nav-link" onclick="go('home')" style="font-size:12px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg> View site</a>
      </div>
    </div>
  </header>

  <div style="flex:1;display:flex;overflow:hidden;height:calc(100vh - 130px)">
    <!-- Queue list -->
    <div style="width:340px;border-right:1px solid var(--c-surface-high);display:flex;flex-direction:column;flex-shrink:0">
      <div class="admin-tabs">
        <div class="admin-tab active">All</div>
        <div class="admin-tab">Pending</div>
        <div class="admin-tab">Verified</div>
        <div class="admin-tab">Rejected</div>
      </div>
      <div style="overflow-y:auto;flex:1">
        <div class="admin-queue-item selected">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#c4a080,#7a5030)"></div>
          <div style="flex:1"><div class="admin-queue-name">Onyx Coffee Lab</div><div class="admin-queue-meta">Rogers, United States · 2 hours ago</div></div>
          <span class="status-pending">Pending</span>
        </div>
        <div class="admin-queue-item">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#8fa880,#3d5530)"></div>
          <div style="flex:1"><div class="admin-queue-name">Nordic Brew Co.</div><div class="admin-queue-meta">Stockholm, Sweden · 5 hours ago</div></div>
          <span class="status-pending">Pending</span>
        </div>
        <div class="admin-queue-item">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#b0a090,#604a30)"></div>
          <div style="flex:1"><div class="admin-queue-name">Café Noma</div><div class="admin-queue-meta">Copenhagen, Denmark · 1 day ago</div></div>
          <span class="status-pending">Pending</span>
        </div>
        <div class="admin-queue-item">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#d0b090,#9a7050)"></div>
          <div style="flex:1"><div class="admin-queue-name">Blackout Roasters</div><div class="admin-queue-meta">Berlin, Germany · 2 days ago</div></div>
          <span class="status-verified">Verified</span>
        </div>
        <div class="admin-queue-item">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#e0c0a0,#a07050)"></div>
          <div style="flex:1"><div class="admin-queue-name">Sowa Coffee Bar</div><div class="admin-queue-meta">Warsaw, Poland · 2 days ago</div></div>
          <span class="status-rejected">Rejected</span>
        </div>
        <div class="admin-queue-item">
          <div class="admin-queue-thumb" style="background:linear-gradient(135deg,#c8b0a0,#806050)"></div>
          <div style="flex:1"><div class="admin-queue-name">Lunar Coffee</div><div class="admin-queue-meta">Amsterdam, Netherlands · 3 days ago</div></div>
          <span class="status-pending">Pending</span>
        </div>
      </div>
    </div>

    <!-- Detail panel -->
    <div style="flex:1;overflow-y:auto;padding:28px 36px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><h2 style="font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em">Onyx Coffee Lab</h2><span class="status-pending">Pending</span></div>
          <p style="font-size:13px;color:var(--c-outline)">Rogers, Arkansas · United States &nbsp;·&nbsp; Submitted 2 hours ago</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-danger btn-sm" onclick="showRejectModal()">✗ Reject</button>
          <button class="btn btn-success btn-sm">✓ Verify & Publish</button>
        </div>
      </div>

      <!-- Editable preview -->
      <div style="background:var(--c-surface);border-radius:var(--r-xl);border:1px solid var(--c-surface-high);padding:24px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--c-surface-high)">
          <span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-outline)">Profile Preview</span>
          <span style="font-size:11px;color:var(--c-outline);margin-left:auto">Click any field to edit</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div class="editable-field" style="padding:10px;border-radius:var(--r-md);background:var(--c-surface-low)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:4px">Name</div>
            <div style="font-size:15px;font-weight:600">Onyx Coffee Lab</div>
            <div class="edit-overlay"><div class="edit-icon">✎</div></div>
          </div>
          <div class="editable-field" style="padding:10px;border-radius:var(--r-md);background:var(--c-surface-low)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:4px">Location</div>
            <div style="font-size:15px;font-weight:600">Rogers, AR 🇺🇸</div>
            <div class="edit-overlay"><div class="edit-icon">✎</div></div>
          </div>
        </div>
        <div class="editable-field" style="padding:10px;border-radius:var(--r-md);background:var(--c-surface-low);margin-bottom:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:4px">Description</div>
          <div style="font-size:14px;line-height:1.6;color:var(--c-on-surface-variant)">Pushing the boundaries of specialty coffee through science and transparency. Every bean is selected, profiled, and roasted with precision to unlock its full potential.</div>
          <div class="edit-overlay"><div class="edit-icon">✎</div></div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:12px">
          <div style="flex:1;padding:10px;border-radius:var(--r-md);background:var(--c-surface-low)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:6px">Website</div>
            <div style="font-size:13px;color:var(--c-tertiary)">onyxcoffeelab.com ↗</div>
          </div>
          <div style="flex:1;padding:10px;border-radius:var(--r-md);background:var(--c-surface-low)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:6px">Instagram</div>
            <div style="font-size:13px;color:var(--c-tertiary)">@onyxcoffeelab ↗</div>
          </div>
          <div style="flex:1;padding:10px;border-radius:var(--r-md);background:var(--c-surface-low)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:6px">Contact email</div>
            <div style="font-size:13px;color:var(--c-on-surface-variant)">hello@onyxcoffeelab.com</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="badge-cert">Direct Trade</span><span class="badge-cert">SCA Member</span><span class="badge-cert">Organic</span>
          <span style="background:var(--c-surface-low);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant);font-size:11px;padding:3px 9px;border-radius:var(--r-full);font-weight:500">🇪🇹 Ethiopia</span>
          <span style="background:var(--c-surface-low);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant);font-size:11px;padding:3px 9px;border-radius:var(--r-full);font-weight:500">🇰🇪 Kenya</span>
          <span style="background:var(--c-surface-low);border:1px solid var(--c-surface-high);color:var(--c-on-surface-variant);font-size:11px;padding:3px 9px;border-radius:var(--r-full);font-weight:500">🇨🇴 Colombia</span>
        </div>
      </div>

      <!-- Submitted photos -->
      <div style="background:var(--c-surface);border-radius:var(--r-xl);border:1px solid var(--c-surface-high);padding:20px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:12px">Submitted Photos</div>
        <div style="display:flex;gap:10px">
          <div style="width:90px;height:90px;border-radius:var(--r-md);background:linear-gradient(135deg,#c4a080,#7a5030)"></div>
          <div style="width:90px;height:90px;border-radius:var(--r-md);background:linear-gradient(135deg,#8fa880,#3d5530)"></div>
          <div style="width:90px;height:90px;border-radius:var(--r-md);background:linear-gradient(135deg,#b0a090,#604a30)"></div>
        </div>
      </div>

      <!-- Admin notes -->
      <div style="background:var(--c-surface);border-radius:var(--r-xl);border:1px solid var(--c-surface-high);padding:20px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--c-outline);margin-bottom:12px">Admin Notes</div>
        <textarea class="input" style="min-height:72px;font-size:13px" placeholder="Add a private note about this submission…"></textarea>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px">Save Note</button>
      </div>
    </div>
  </div>

  <!-- Reject modal -->
  <div id="reject-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;align-items:center;justify-content:center">
    <div style="background:var(--c-surface);border-radius:var(--r-2xl);padding:28px;width:440px;box-shadow:var(--shadow-dropdown)">
      <h3 style="font-family:var(--f-display);font-size:20px;font-weight:600;margin-bottom:6px">Reason for rejection</h3>
      <p style="font-size:13px;color:var(--c-on-surface-variant);margin-bottom:16px">This message will be sent to the submitter.</p>
      <textarea class="input" style="min-height:90px;font-size:14px;margin-bottom:16px" placeholder="Please provide a brief reason for rejecting this profile…"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-ghost" onclick="hideRejectModal()">Cancel</button>
        <button class="btn btn-danger" onclick="hideRejectModal()">Send Rejection</button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!-- SCREEN 7 · MAP -->
<!-- ══════════════════════════════════════════════════════ -->
<div class="screen" id="s-map" data-screen-label="07 Map">
  <header class="header"><div class="header-inner"><a class="logo" style="display:flex;align-items:center" onclick="go('home')"><img src="../../assets/beanmap-logo.png" alt="Bean Map" style="height:40px;width:auto"></a><div class="header-search" style="flex:1;max-width:400px;margin:0 20px"><div class="search-input-wrap" style="flex:1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search-input" style="width:100%" placeholder="Search city or roaster…"></div></div><div style="display:flex;gap:8px"><select style="font-family:var(--f-body);font-size:13px;border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:7px 12px;background:var(--c-surface);color:var(--c-on-surface);outline:none"><option>All Countries</option><option>🇵🇱 Poland</option><option>🇳🇴 Norway</option></select><select style="font-family:var(--f-body);font-size:13px;border:1.5px solid var(--c-outline-variant);border-radius:var(--r-md);padding:7px 12px;background:var(--c-surface);color:var(--c-on-surface);outline:none"><option>All Certs</option><option>Direct Trade</option><option>Organic</option></select><button class="btn btn-secondary btn-sm">☰ List</button></div></div></header>
  <div style="flex:1;display:flex;overflow:hidden;height:calc(100vh - 130px)">
    <div style="flex:1;position:relative;background:linear-gradient(150deg,#e4dfd4,#cec8bc);overflow:hidden">
      <div style="position:absolute;inset:0;opacity:.12"><svg width="100%" height="100%"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#897267" stroke-width=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:100px;opacity:.06">🗺️</div>
      <div class="map-pin" style="position:absolute;top:34%;left:47%"></div>
      <div class="map-pin" style="position:absolute;top:27%;left:51%"></div>
      <div class="map-pin" style="position:absolute;top:41%;left:54%"></div>
      <div class="map-pin cluster" style="position:absolute;top:49%;left:43%;color:white;font-size:11px;font-weight:700">5</div>
      <div class="map-pin" style="position:absolute;top:21%;left:37%"></div>
      <div class="map-pin" style="position:absolute;top:59%;left:61%"></div>
      <div style="position:absolute;top:29%;left:53%;background:var(--c-surface);border-radius:var(--r-lg);padding:12px;width:210px;box-shadow:var(--shadow-hover);margin-left:18px">
        <div style="display:flex;gap:10px">
          <div style="width:44px;height:44px;border-radius:var(--r-md);background:linear-gradient(135deg,#8fa880,#3d5530);flex-shrink:0"></div>
          <div style="flex:1"><div style="font-family:var(--f-display);font-size:13px;font-weight:700;margin-bottom:2px">Tim Wendelboe</div><div style="font-size:11px;color:var(--c-outline);margin-bottom:8px">Oslo, Norway</div><button class="btn btn-primary btn-sm" onclick="go('profile')">View Profile →</button></div>
        </div>
      </div>
    </div>
    <div style="width:330px;overflow-y:auto;background:var(--c-surface);border-left:1px solid var(--c-surface-high);display:flex;flex-direction:column">
      <div style="padding:14px 16px;border-bottom:1px solid var(--c-surface-high);flex-shrink:0"><span style="font-size:13px;font-weight:700">50 roasters</span></div>
      <div style="padding:10px;display:flex;flex-direction:column;gap:6px">
        <div class="compact-card highlighted" onclick="go('profile')"><div class="compact-img" style="background:linear-gradient(135deg,#8fa880,#3d5530)"></div><div class="compact-body"><div><div class="compact-title">Tim Wendelboe</div><div class="compact-loc">Oslo, Norway 🇳🇴</div></div><div style="display:flex;gap:4px"><span class="badge-cert">Organic</span><span class="badge-cert">Direct Trade</span></div></div></div>
        <div class="compact-card" onclick="go('profile')"><div class="compact-img" style="background:linear-gradient(135deg,#c4a080,#6a3a18)"></div><div class="compact-body"><div><div class="compact-title">Onyx Coffee Lab</div><div class="compact-loc">Rogers, AR 🇺🇸</div></div><div style="display:flex;gap:4px"><span class="badge-cert">Direct Trade</span><span class="badge-cert">SCA</span></div></div></div>
        <div class="compact-card"><div class="compact-img" style="background:linear-gradient(135deg,#b0a090,#604a30)"></div><div class="compact-body"><div><div class="compact-title">Square Mile Coffee</div><div class="compact-loc">London, UK 🇬🇧</div></div><div style="display:flex;gap:4px"><span class="badge-cert">Direct Trade</span></div></div></div>
        <div class="compact-card"><div class="compact-img" style="background:linear-gradient(135deg,#d0b090,#9a7050)"></div><div class="compact-body"><div><div class="compact-title">Hard Beans</div><div class="compact-loc">Opole, Poland 🇵🇱</div></div><div style="display:flex;gap:4px"><span class="badge-cert">Direct Trade</span><span class="badge-cert">Organic</span></div></div></div>
        <div class="compact-card"><div class="compact-img" style="background:linear-gradient(135deg,#e0c0a0,#a07050)"></div><div class="compact-body"><div><div class="compact-title">The Nordic Roast</div><div class="compact-loc">Oslo, Norway 🇳🇴</div></div><div style="display:flex;gap:4px"><span class="badge-cert">Organic</span></div></div></div>
      </div>
    </div>
  </div>
</div>

</div><!-- /screens-wrap -->

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PROTOTYPE NAVIGATOR — clearly separate from app UI -->
<!-- ═══════════════════════════════════════════════════════ -->
<nav class="proto-nav">
  <span class="proto-label">Screens</span>
  <button class="proto-btn active" onclick="go('home',this)">Homepage</button>
  <button class="proto-btn" onclick="go('catalog',this)">Catalog</button>
  <button class="proto-btn" onclick="go('profile',this)">Profile</button>
  <button class="proto-btn" onclick="go('register',this)">Register Roastery</button>
  <button class="proto-btn" onclick="go('register-cafe',this)">Register Café</button>
  <button class="proto-btn" onclick="go('admin',this)">Admin</button>
  <button class="proto-btn" onclick="go('map',this)">Map</button>
</nav>

<script>
const SCREENS = ['home','catalog','profile','register','register-cafe','admin','map'];

function go(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.proto-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('s-'+id);
  if (el) el.classList.add('active');
  if (btn) { btn.classList.add('active'); }
  else {
    const idx = SCREENS.indexOf(id);
    if (idx >= 0) document.querySelectorAll('.proto-btn')[idx]?.classList.add('active');
  }
  localStorage.setItem('bm_screen', id);
  window.scrollTo(0, 0);
}

function showRegisterStep3() {
  document.getElementById('register-step3').style.display = 'block';
  window.scrollTo(0,0);
}
function hideRegisterStep3() {
  document.getElementById('register-step3').style.display = 'none';
}
function showSuccess() {
  document.getElementById('register-step3').style.display = 'none';
  const s = document.getElementById('register-success');
  s.style.display = 'flex';
}
function showRejectModal() {
  const m = document.getElementById('reject-modal');
  m.style.display = 'flex';
}
function hideRejectModal() {
  document.getElementById('reject-modal').style.display = 'none';
}

// Chip toggles
document.querySelectorAll('.chip, .cert-item').forEach(el => {
  el.addEventListener('click', () => {
    if (el.classList.contains('cert-item')) {
      el.classList.toggle('selected');
      const check = el.querySelector('.cert-check');
      if (check) check.textContent = el.classList.contains('selected') ? '✓' : '';
    } else {
      el.classList.toggle('active');
    }
  });
});

// Toggle switches
document.querySelectorAll('.toggle').forEach(t => {
  t.addEventListener('click', () => t.classList.toggle('on'));
});

// Restore
const saved = localStorage.getItem('bm_screen');
if (saved && SCREENS.includes(saved)) go(saved);
</script>
</body>
</html>
