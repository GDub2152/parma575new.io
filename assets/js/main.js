document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupClock();
  setupWeather();
  setupGalleryLightbox();
  setupCountdown();
});

function setupMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav-links");
  if (!menuBtn || !nav) return;
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
  });
}

function setupClock() {
  const localTimeEl = document.getElementById("localTime");
  const utcTimeEl = document.getElementById("utcTime");
  if (!localTimeEl || !utcTimeEl) return;

  const updateClock = () => {
    const now = new Date();
    localTimeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    utcTimeEl.textContent = now.toUTCString().split(" ")[4] + " UTC";
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function setupWeather() {
  if (!document.getElementById("weatherTemp")) return;

  // Uses the National Weather Service current observation feed for Cleveland Hopkins (KCLE),
  // which is close to Parma and does not require an API key.
  const NWS_URL = "https://api.weather.gov/stations/KCLE/observations/latest";
  const OPEN_METEO_BACKUP_URL = "https://api.open-meteo.com/v1/forecast?latitude=41.4048&longitude=-81.7229&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York";

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const unavailable = () => {
    setText("weatherTemp", "--");
    setText("weatherDesc", "Weather temporarily unavailable");
    setText("humidity", "--");
    setText("wind", "--");
    setText("barometer", "--");
    setText("feelsLike", "--");
    setText("weatherIcon", "⚠️");
  };

  const iconFor = (description = "") => {
    const d = description.toLowerCase();
    if (d.includes("thunder") || d.includes("storm")) return "⛈️";
    if (d.includes("snow") || d.includes("sleet")) return "❄️";
    if (d.includes("rain") || d.includes("drizzle") || d.includes("shower")) return "🌧️";
    if (d.includes("fog") || d.includes("mist") || d.includes("haze")) return "🌫️";
    if (d.includes("cloud") || d.includes("overcast")) return "☁️";
    if (d.includes("clear") || d.includes("sun")) return "☀️";
    return "🌤️";
  };

  const weatherCodes = {
    0: ["Clear Sky", "☀️"], 1: ["Mainly Clear", "🌤️"], 2: ["Partly Cloudy", "⛅"], 3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"], 48: ["Rime Fog", "🌫️"], 51: ["Light Drizzle", "🌧️"], 53: ["Drizzle", "🌧️"],
    55: ["Heavy Drizzle", "🌧️"], 61: ["Light Rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy Rain", "⛈️"],
    71: ["Light Snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy Snow", "❄️"], 80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"], 82: ["Heavy Showers", "⛈️"], 85: ["Snow Showers", "🌨️"], 86: ["Heavy Snow Showers", "❄️"],
    95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with Hail", "⛈️"], 99: ["Thunderstorm with Hail", "⛈️"]
  };

  async function fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: { "Accept": "application/geo+json, application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  const cToF = c => (c * 9 / 5) + 32;
  const kmhToMph = kmh => kmh * 0.621371;
  const paToInHg = pa => pa * 0.000295299830714;

  async function updateFromNws() {
    const data = await fetchJson(NWS_URL);
    const p = data.properties || {};

    const tempC = Number(p.temperature && p.temperature.value);
    const humidity = Number(p.relativeHumidity && p.relativeHumidity.value);
    const windKmh = Number(p.windSpeed && p.windSpeed.value);
    const pressurePa = Number(p.barometricPressure && p.barometricPressure.value);
    const heatIndexC = Number(p.heatIndex && p.heatIndex.value);
    const windChillC = Number(p.windChill && p.windChill.value);
    const desc = p.textDescription || "Current Conditions";

    let feelsC = Number.isFinite(heatIndexC) ? heatIndexC : (Number.isFinite(windChillC) ? windChillC : tempC);

    setText("weatherTemp", Number.isFinite(tempC) ? `${Math.round(cToF(tempC))}°F` : "--");
    setText("weatherDesc", desc);
    setText("weatherIcon", iconFor(desc));
    setText("humidity", Number.isFinite(humidity) ? `${Math.round(humidity)}%` : "--");
    setText("wind", Number.isFinite(windKmh) ? `${Math.round(kmhToMph(windKmh))} mph` : "--");
    setText("barometer", Number.isFinite(pressurePa) ? `${paToInHg(pressurePa).toFixed(2)} inHg` : "--");
    setText("feelsLike", Number.isFinite(feelsC) ? `${Math.round(cToF(feelsC))}°F` : "--");
  }

  async function updateFromOpenMeteoBackup() {
    const data = await fetchJson(OPEN_METEO_BACKUP_URL);
    const current = data.current || {};
    const temp = Number(current.temperature_2m);
    const feels = Number(current.apparent_temperature);
    const humidity = Number(current.relative_humidity_2m);
    const wind = Number(current.wind_speed_10m);
    let pressure = Number(current.pressure_msl);
    if (Number.isFinite(pressure)) pressure = pressure / 33.8638866667;
    const condition = weatherCodes[Number(current.weather_code)] || ["Current Conditions", "🌤️"];

    setText("weatherTemp", Number.isFinite(temp) ? `${Math.round(temp)}°F` : "--");
    setText("weatherDesc", condition[0]);
    setText("weatherIcon", condition[1]);
    setText("humidity", Number.isFinite(humidity) ? `${Math.round(humidity)}%` : "--");
    setText("wind", Number.isFinite(wind) ? `${Math.round(wind)} mph` : "--");
    setText("barometer", Number.isFinite(pressure) ? `${pressure.toFixed(2)} inHg` : "--");
    setText("feelsLike", Number.isFinite(feels) ? `${Math.round(feels)}°F` : "--");
  }

  async function updateWeather() {
    try {
      await updateFromNws();
    } catch (nwsError) {
      console.warn("NWS weather failed, trying backup weather source:", nwsError);
      try {
        await updateFromOpenMeteoBackup();
      } catch (backupError) {
        console.error("Weather update failed:", backupError);
        unavailable();
      }
    }
  }

  updateWeather();
  setInterval(updateWeather, 15 * 60 * 1000);
}
function setupGalleryLightbox() {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox img");
  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    });
  });
  if (lightbox) lightbox.addEventListener("click", () => lightbox.style.display = "none");
}

function setupCountdown() {
  const needed = ["days", "hours", "minutes", "seconds"];
  if (!needed.every(id => document.getElementById(id))) return;

  function getNextNetDate() {
    const next = new Date();
    const daysUntilThu = (4 - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + daysUntilThu);
    next.setHours(20, 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 7);
    return next;
  }

  function updateCountdown() {
    const diff = Math.max(0, getNextNetDate() - new Date());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
    Object.entries(values).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value).padStart(2, "0");
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}
