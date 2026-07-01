document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav-links");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  }

  const nextNet = new Date();
  const day = nextNet.getDay();
  const daysUntilThu = (4 - day + 7) % 7 || 7;
  nextNet.setDate(nextNet.getDate() + daysUntilThu);
  nextNet.setHours(20, 0, 0, 0);

  function updateCountdown(){
    const now = new Date();
    let diff = nextNet - now;
    if(diff < 0) diff = 0;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const ids = {days:d, hours:h, minutes:m, seconds:s};
    Object.keys(ids).forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = String(ids[id]).padStart(2, "0");
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure` +
    `&temperature_unit=fahrenheit` +
    `&wind_speed_unit=mph` +
    `&pressure_unit=inhg`;

  document.getElementById("weatherTemp").textContent =
    Math.round(current.temperature_2m) + "°F";

document.getElementById("feelsLike").textContent =
    Math.round(current.apparent_temperature) + "°F";

document.getElementById("humidity").textContent =
    current.relative_humidity_2m + "%";

document.getElementById("wind").textContent =
    Math.round(current.wind_speed_10m) + " mph";

document.getElementById("barometer").textContent =
    current.surface_pressure.toFixed(2) + " inHg";

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox img");
  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      if(lightbox && lightboxImg){
        lightboxImg.src = img.src;
        lightbox.style.display = "flex";
      }
    });
  });
  if(lightbox) lightbox.addEventListener("click", () => lightbox.style.display = "none");
});
