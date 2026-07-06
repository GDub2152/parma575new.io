function renderParma575Events(targetId, mode) {
  const target = document.getElementById(targetId);
  if (!target || typeof EVENTS === "undefined") return;

  const activeEvents = EVENTS.filter(event => event.active);
  const section = target.closest("section");

  if (activeEvents.length === 0) {
    if (section) section.style.display = "none";
    return;
  }

  target.innerHTML = activeEvents.map(event => {
    if (mode === "compact") {
      return `
        <div class="event-row dynamic-event-row">
          <img src="${event.image}" alt="${event.title}">
          <div>
            <h3>${event.title}</h3>
            <p>${event.date} • ${event.time}<br>${event.location}</p>
          </div>
          <div class="event-row-actions">
            <a class="btn btn-blue" href="events.html">Details</a>
            <a class="btn btn-green" href="${event.buttonLink}" target="_blank" rel="noopener">RSVP</a>
          </div>
        </div>
      `;
    }

    return `
      <article class="card event-detail-card">
        <img class="event-detail-image" src="${event.image}" alt="${event.title}">
        <h3>${event.title}</h3>
        <p><strong>${event.date}</strong><br>${event.time}</p>
        <p><strong>${event.location}</strong><br>${event.address}</p>
        <p>${event.description}</p>
        <p>${event.details}</p>
        <div class="event-actions">
          <a class="btn btn-green" href="${event.buttonLink}" target="_blank" rel="noopener">${event.buttonText}</a>
          <a class="btn btn-blue" href="${event.mapLink}" target="_blank" rel="noopener">📍 Open in Google Maps</a>
        </div>
      </article>
    `;
  }).join("");
}
