(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.siteId;
  if (!siteId || !/^[a-z-]+$/.test(siteId)) return;
  const initial = script.dataset.initialCheck === 'true';
  let known = initial ? null : true;
  let busy = false;
  let checkedAt = 0;
  const style = document.createElement('style');
  style.textContent = 'html[data-site-checking] body{visibility:hidden}html[data-site-paused] body>:not(#site-maintenance){display:none!important}#site-maintenance{position:fixed;inset:0;z-index:2147483647;background:#17181c;color:#f1f2f4;display:grid;place-items:center;font-family:system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}#site-maintenance h1{font-size:clamp(26px,5vw,40px);margin:20px 0}#site-maintenance p{color:#a3a7af;line-height:1.8}#site-maintenance small{letter-spacing:.2em;color:#9dd9c5}';
  document.head.appendChild(style);
  if (initial) document.documentElement.dataset.siteChecking = '';
  function show(unavailable) {
    document.documentElement.dataset.sitePaused = '';
    if (!document.body) { document.addEventListener('DOMContentLoaded', () => show(unavailable), {once:true}); return; }
    let panel = document.getElementById('site-maintenance');
    if (!panel) { panel = document.createElement('div'); panel.id = 'site-maintenance'; panel.setAttribute('role','status'); document.body.appendChild(panel); }
    panel.innerHTML = '<main><small>LEOKUO</small><h1>' + (unavailable?'服務暫時無法連線':'網站暫停開放') + '</h1><p>請稍後再回來，謝謝你的耐心等候。</p></main>';
  }
  async function check() {
    if (busy) return;
    busy = true; checkedAt = Date.now();
    try {
      const response = await fetch('https://api.leokuo.com/sites/' + siteId + '/status', {signal:AbortSignal.timeout(5000)});
      const data = await response.json();
      if (!response.ok || !data.ok || typeof data.enabled !== 'boolean') throw Error('status unavailable');
      known = data.enabled;
      if (known) { document.getElementById('site-maintenance')?.remove(); delete document.documentElement.dataset.sitePaused; }
      else window.location.reload();
    } catch { if (known === null) show(true); }
    finally { delete document.documentElement.dataset.siteChecking; busy = false; }
  }
  window.addEventListener('keydown', event => { if (document.documentElement.hasAttribute('data-site-paused')) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  window.setInterval(check, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now()-checkedAt>30000) void check(); });
  if (initial) void check();
})();
