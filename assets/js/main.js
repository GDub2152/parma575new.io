document.addEventListener("DOMContentLoaded", () => {
  // Menu toggle
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav-links");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // Update clock
  function updateClock() {
    const localTimeEl = document.getElementById("localTime");
    const utcTimeEl = document.getElementById("utcTime");
    
    if (!localTimeEl || !utcTimeEl) return;

    const now = new Date();

    localTimeEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    utcTimeEl.textContent = now.toUTCString().split(" ")[4] + " UTC";
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Gallery lightbox
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox img");
  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      if (lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.style.display = "flex";
      }
    });
  });
  if (lightbox) {
    lightbox.addEventListener("click", () => lightbox.style.display = "none");
  }

  // Countdown timer for next net (Thursday 8 PM)
  const nextNet = new Date();
  const day = nextNet.getDay();
  const daysUntilThu = (4 - day + 7) % 7 || 7;
  nextNet.setDate(nextNet.getDate() + daysUntilThu);
  nextNet.setHours(20, 0, 0, 0);

  function updateCountdown() {
    const now = new Date();
    let diff = nextNet - now;
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const ids = { days: d, hours: h, minutes: m, seconds: s };
    Object.keys(ids).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(ids[id]).padStart(2, "0");
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
