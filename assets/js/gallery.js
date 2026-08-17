(() => {
  "use strict";

  const DATA_URL = "assets/gallery/gallery-data.json";
  const state = { photos: [], lightboxIndex: 0 };
  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    if (!$(`photoGrid`)) return;
    setupLightbox();

    try {
      const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Gallery data returned ${response.status}`);
      const data = await response.json();
      const albums = Array.isArray(data.albums) ? data.albums : [];
      state.photos = albums.flatMap((album) => Array.isArray(album.photos) ? album.photos : []);
      renderPhotos();
    } catch (error) {
      console.error(error);
      showNotice("The photo gallery could not be loaded. Please try again after the next site deployment.");
      state.photos = [];
      renderPhotos();
    }
  }

  function renderPhotos() {
    const grid = $("photoGrid");
    const count = state.photos.length;
    $("gallerySummary").textContent = `${count} photo${count === 1 ? "" : "s"}`;

    if (!count) {
      grid.innerHTML = '<div class="gallery-empty">No photos are available yet.</div>';
      return;
    }

    grid.innerHTML = state.photos.map((photo, index) => `
      <button class="photo-card" type="button" data-index="${index}" aria-label="Open ${escapeAttr(photo.alt || photo.name || "photo")}">
        <img src="${escapeAttr(photo.src)}" alt="${escapeAttr(photo.alt || photo.name || "Parma 575 photo")}" loading="lazy" decoding="async">
      </button>`).join("");

    grid.querySelectorAll(".photo-card").forEach((button) => {
      button.addEventListener("click", () => openLightbox(Number(button.dataset.index)));
    });
  }

  function setupLightbox() {
    const box = $("galleryLightbox");
    if (!box) return;

    box.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    box.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
    box.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));
    box.addEventListener("click", (event) => { if (event.target === box) closeLightbox(); });

    document.addEventListener("keydown", (event) => {
      if (box.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    });

    let startX = 0;
    box.addEventListener("touchstart", (event) => {
      startX = event.changedTouches[0].screenX;
    }, { passive: true });
    box.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].screenX - startX;
      if (Math.abs(delta) > 55) moveLightbox(delta > 0 ? -1 : 1);
    }, { passive: true });
  }

  function openLightbox(index) {
    state.lightboxIndex = index;
    renderLightbox();
    $("galleryLightbox").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    $("galleryLightbox").hidden = true;
    document.body.style.overflow = "";
  }

  function moveLightbox(direction) {
    if (!state.photos.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.photos.length) % state.photos.length;
    renderLightbox();
  }

  function renderLightbox() {
    const photo = state.photos[state.lightboxIndex];
    $("lightboxImage").src = photo.src;
    $("lightboxImage").alt = photo.alt || photo.name || "Parma 575 photo";
    $("lightboxCaption").textContent = photo.caption || photo.name || `Photo ${state.lightboxIndex + 1} of ${state.photos.length}`;
  }

  function showNotice(message) {
    const el = $("galleryNotice");
    el.textContent = message;
    el.hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }
})();
