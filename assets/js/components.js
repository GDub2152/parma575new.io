document.addEventListener("DOMContentLoaded", () => {
  const pages = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["repeater.html", "Repeater"],
    ["solar.html", "Solar"],
    ["events.html", "Events"],
    ["gallery.html", "Gallery"],
    ["downloads.html", "Downloads"],
    ["join.html", "Join"],
    ["contact.html", "Contact"]
  ];

  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const inArchive = location.pathname.toLowerCase().includes("/archive/");
  const rootPrefix = inArchive ? "../" : "";
  const navLinks = pages.map(([href, label]) => {
    const active = !inArchive && current === href.toLowerCase() ? ' class="active"' : "";
    return `<a${active} href="${rootPrefix}${href}">${label}</a>`;
  }).join("");

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="construction-banner">🚧 WEBSITE UNDER CONSTRUCTION • New features and pages are being added regularly. Check back often! 🚧</div>
      <header class="topbar">
        <div class="nav-wrap">
          <a class="brand" href="${rootPrefix}index.html">
            <img src="${rootPrefix}assets/images/site-logo.svg" alt="Parma 575 Logo" class="site-logo">
            <span>PARMA 575<small>GMRS RADIO GROUP</small></span>
          </a>
          <button class="menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
          <nav class="nav-links" aria-label="Main navigation">${navLinks}</nav>
          <div class="nav-actions">
            <a class="btn btn-green" href="https://www.gofundme.com/f/Parma-575-GMRS-repeater-covering-Northern-Ohio" target="_blank" rel="noopener">❤️ Donate</a>
          </div>
        </div>
      </header>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <div class="footer-inner">
          <p><strong>Parma 575 GMRS Radio Group</strong></p>
          <p>Serving Parma and Northern Ohio GMRS operators.</p>
          <p class="footer-links">
            <a href="${rootPrefix}index.html">Home</a> · <a href="${rootPrefix}repeater.html">Repeater</a> · <a href="${rootPrefix}solar.html">Solar</a> · <a href="${rootPrefix}events.html">Events</a> · <a href="${rootPrefix}contact.html">Contact</a>
          </p>
          <div class="visitor-counter" aria-label="Website visitor counter">
            <span>Visitor Counter</span>
            <img src="https://visitor-badge.laobi.icu/badge?page_id=parma575-gmrs-radio-group&left_text=Visitors" alt="Visitor counter">
          </div>
        </div>
      </footer>`;
  }
});
