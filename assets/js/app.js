function setActiveNav(){
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a=>{
    if(a.getAttribute("href") === page) a.classList.add("active");
  });
}

function renderHeader(){
  const header = document.querySelector("[data-header]");
  if(!header) return;
  header.innerHTML = `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="index.html">
          <img src="assets/images/parma575-logo.svg" alt="Parma 575 logo">
          <span class="brand-title">
            <strong>Parma 575</strong>
            <span>GMRS Radio Group</span>
          </span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          <a href="index.html">Home</a>
          <a href="repeater.html">Repeater</a>
          <a href="weather.html">Weather</a>
          <a href="solar.html">Solar</a>
          <a href="events.html">Events</a>
          <a href="contact.html">Contact</a>
        </nav>
      </div>
    </header>`;
  setActiveNav();
}

function renderFooter(){
  const footer = document.querySelector("[data-footer]");
  if(!footer) return;
  footer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <p><strong>Parma 575 GMRS Radio Group</strong></p>
        <p>Good friends. Good radio. Great community.</p>
        <p class="footer-links">
          <a href="index.html">Home</a>
          <a href="repeater.html">Repeater</a>
          <a href="weather.html">Weather</a>
          <a href="solar.html">Solar</a>
          <a href="events.html">Events</a>
          <a href="contact.html">Contact</a>
        </p>
        <div class="visitor-counter" aria-label="Website visitor counter">
          <span>Visitor Counter</span>
          <img src="https://visitor-badge.laobi.icu/badge?page_id=parma575-gmrs-radio-group&left_text=Visitors" alt="Visitor counter">
        </div>
      </div>
    </footer>`;
}

function eventMarkup(compact=false){
  if(!window.CURRENT_EVENT || !CURRENT_EVENT.active) return "";
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="kicker">Current Event</span>
            <h2>${CURRENT_EVENT.title}</h2>
          </div>
          <a class="btn btn-primary" href="${CURRENT_EVENT.rsvpLink}" target="_blank" rel="noopener">RSVP Now</a>
        </div>
        <div class="event-panel">
          <div class="event-layout">
            <div class="event-flyer">
              <img src="${CURRENT_EVENT.flyer}" alt="${CURRENT_EVENT.title} flyer">
            </div>
            <aside class="rsvp-box">
              <h3>Scan to RSVP</h3>
              <img class="qr" src="${CURRENT_EVENT.qr}" alt="QR code for picnic RSVP">
              <a class="btn btn-blue" href="${CURRENT_EVENT.rsvpLink}" target="_blank" rel="noopener">Open RSVP Form</a>
              <a class="btn btn-dark" href="${CURRENT_EVENT.mapLink}" target="_blank" rel="noopener">Get Directions</a>
              <p>If scanning does not work, use the RSVP button.</p>
            </aside>
          </div>
          <div class="event-info">
            <div class="event-info-grid">
              <div class="info-pill"><strong>Date</strong>${CURRENT_EVENT.date}</div>
              <div class="info-pill"><strong>Time</strong>${CURRENT_EVENT.time}</div>
              <div class="info-pill"><strong>Location</strong>${CURRENT_EVENT.location}</div>
              <div class="info-pill"><strong>Address</strong>${CURRENT_EVENT.address}</div>
            </div>
            <p class="lead">${CURRENT_EVENT.description}</p>
          </div>
        </div>
      </div>
    </section>`;
}

function renderCurrentEvent(){
  const el = document.querySelector("[data-current-event]");
  if(el) el.innerHTML = eventMarkup();
}

async function loadWeather(){
  const el = document.querySelector("[data-weather]");
  if(!el) return;
  try{
    const url = "https://api.open-meteo.com/v1/forecast?latitude=41.4048&longitude=-81.7229&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York";
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current || {};
    const inHg = c.pressure_msl ? (c.pressure_msl * 0.0295299830714).toFixed(2) : "—";
    el.innerHTML = `
      <div class="weather-grid">
        <div class="weather-item"><span>Temperature</span><strong>${Math.round(c.temperature_2m ?? 0)}°F</strong></div>
        <div class="weather-item"><span>Feels Like</span><strong>${Math.round(c.apparent_temperature ?? 0)}°F</strong></div>
        <div class="weather-item"><span>Humidity</span><strong>${Math.round(c.relative_humidity_2m ?? 0)}%</strong></div>
        <div class="weather-item"><span>Barometer</span><strong>${inHg} inHg</strong></div>
        <div class="weather-item"><span>Wind</span><strong>${Math.round(c.wind_speed_10m ?? 0)} mph</strong></div>
        <div class="weather-item"><span>Rain</span><strong>${c.precipitation ?? 0} in</strong></div>
      </div>`;
  }catch(e){
    el.innerHTML = `<p class="notice">Weather data is temporarily unavailable.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderHeader();
  renderFooter();
  renderCurrentEvent();
  loadWeather();
});
