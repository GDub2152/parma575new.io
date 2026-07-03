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
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    utcTimeEl.textContent = now.toUTCString().split(" ")[4] + " UTC";
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Reliable Parma, OH weather from Open-Meteo. No API key required.
  async function updateWeather() {
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

    if (!document.getElementById("weatherTemp")) return;

    const weatherCodes = {
      0: ["Clear Sky", "☀️"],
      1: ["Mainly Clear", "🌤️"],
      2: ["Partly Cloudy", "⛅"],
      3: ["Overcast", "☁️"],
      45: ["Fog", "🌫️"],
      48: ["Rime Fog", "🌫️"],
      51: ["Light Drizzle", "🌧️"],
      53: ["Drizzle", "🌧️"],
      55: ["Heavy Drizzle", "🌧️"],
      61: ["Light Rain", "🌦️"],
      63: ["Rain", "🌧️"],
      65: ["Heavy Rain", "⛈️"],
      71: ["Light Snow", "🌨️"],
      73: ["Snow", "❄️"],
      75: ["Heavy Snow", "❄️"],
      80: ["Rain Showers", "🌦️"],
      81: ["Rain Showers", "🌧️"],
      82: ["Heavy Showers", "⛈️"],
      85: ["Snow Showers", "🌨️"],
      86: ["Heavy Snow Showers", "❄️"],
      95: ["Thunderstorm", "⛈️"],
      96: ["Thunderstorm with Hail", "⛈️"],
      99: ["Thunderstorm with Hail", "⛈️"]
    };

    const urls = [
      "https://api.open-meteo.com/v1/forecast?latitude=41.4048&longitude=-81.7229&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,surface_pressure&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York",
      "https://api.open-meteo.com/v1/forecast?latitude=41.4048&longitude=-81.7229&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,surface_pressure&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1&timezone=America%2FNew_York"
    ];

    try {
      let data = null;
      for (const url of urls) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!response.ok) continue;
          data = await response.json();
          if (data && (data.current || data.current_weather)) break;
        } catch (err) {
          console.warn("Weather source failed; trying fallback.", err);
        }
      }
      if (!data) throw new Error("No usable weather data returned.");

      const current = data.current ? { ...data.current } : {};
      if ((!Number.isFinite(Number(current.temperature_2m))) && data.current_weather) {
        const cw = data.current_weather;
        current.temperature_2m = cw.temperature;
        current.wind_speed_10m = cw.windspeed;
        current.weather_code = cw.weathercode;

        const hourly = data.hourly || {};
        const times = hourly.time || [];
        const currentHour = (cw.time || "").slice(0, 13);
        let idx = times.findIndex(t => String(t).slice(0, 13) === currentHour);
        if (idx < 0) idx = 0;
        current.apparent_temperature = hourly.apparent_temperature?.[idx];
        current.relative_humidity_2m = hourly.relative_humidity_2m?.[idx];
        current.pressure_msl = hourly.pressure_msl?.[idx];
        current.surface_pressure = hourly.surface_pressure?.[idx];
      }

      const temp = Number(current.temperature_2m);
      const feels = Number(current.apparent_temperature);
      const humidity = Number(current.relative_humidity_2m);
      const wind = Number(current.wind_speed_10m);
      let pressure = Number(current.pressure_msl ?? current.surface_pressure);

      // Open-Meteo pressure normally returns hPa. Convert hPa to inches of mercury.
      if (Number.isFinite(pressure) && pressure > 100) {
        pressure = pressure / 33.8638866667;
      }

      setText("weatherTemp", Number.isFinite(temp) ? `${Math.round(temp)}°F` : "--");
      setText("feelsLike", Number.isFinite(feels) ? `${Math.round(feels)}°F` : "--");
      setText("humidity", Number.isFinite(humidity) ? `${Math.round(humidity)}%` : "--");
      setText("wind", Number.isFinite(wind) ? `${Math.round(wind)} mph` : "--");
      setText("barometer", Number.isFinite(pressure) ? `${pressure.toFixed(2)} inHg` : "--");

      const condition = weatherCodes[Number(current.weather_code)] || ["Current Conditions", "🌤️"];
      setText("weatherDesc", condition[0]);
      setText("weatherIcon", condition[1]);
    } catch (error) {
      console.error("Weather update failed:", error);
      unavailable();
    }
  }
  updateWeather();
  setInterval(updateWeather, 15 * 60 * 1000);

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
