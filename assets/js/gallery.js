(() => {
  "use strict";
  const DATA_URL = "assets/gallery/gallery-data.json";
  const state = { albums: [], activeAlbum: null, lightboxIndex: 0 };
  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    const albumGrid = $("albumGrid");
    if (!albumGrid) return;
    $("gallerySearch")?.addEventListener("input", renderAlbums);
    $("backToAlbums")?.addEventListener("click", showAlbums);
    setupLightbox();

    try {
      const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Gallery data returned ${response.status}`);
      const data = await response.json();
      state.albums = Array.isArray(data.albums) ? data.albums : [];
      renderAlbums();
    } catch (error) {
      console.error(error);
      showNotice("The gallery is ready, but the OneDrive synchronization has not completed yet. Run the Gallery Sync workflow after finishing the one-time setup.");
      state.albums = [];
      renderAlbums();
    }
  }

  function renderAlbums() {
    const grid = $("albumGrid");
    const query = ($("gallerySearch")?.value || "").trim().toLowerCase();
    const albums = state.albums.filter((album) => album.title.toLowerCase().includes(query));
    const total = state.albums.reduce((sum, album) => sum + album.photos.length, 0);
    $("gallerySummary").textContent = `${state.albums.length} album${state.albums.length === 1 ? "" : "s"} · ${total} photo${total === 1 ? "" : "s"}`;

    if (!albums.length) {
      grid.innerHTML = `<div class="gallery-empty">${state.albums.length ? "No albums match your search." : "No synchronized photos are available yet."}</div>`;
      return;
    }

    grid.innerHTML = albums.map((album) => {
      const cover = album.cover || album.photos[0]?.src || "assets/images/gallery-placeholder.svg";
      const count = album.photos.length;
      return `<button class="album-card" type="button" data-album="${escapeAttr(album.id)}">
        <span class="album-cover"><img src="${escapeAttr(cover)}" alt="${escapeAttr(album.title)} album cover" loading="lazy"><span class="album-count-badge">${count} photo${count === 1 ? "" : "s"}</span></span>
        <span class="album-info"><h3>${escapeHtml(album.title)}</h3><p>Open album →</p></span>
      </button>`;
    }).join("");

    grid.querySelectorAll(".album-card").forEach((button) => {
      button.addEventListener("click", () => openAlbum(button.dataset.album));
    });
  }

  function openAlbum(id) {
    state.activeAlbum = state.albums.find((album) => album.id === id);
    if (!state.activeAlbum) return;
    $("albumGrid").hidden = true;
    $("gallerySearch").closest("label").hidden = true;
    $("photoView").hidden = false;
    $("albumTitle").textContent = state.activeAlbum.title;
    const count = state.activeAlbum.photos.length;
    $("albumCount").textContent = `${count} photo${count === 1 ? "" : "s"}`;
    $("photoGrid").innerHTML = state.activeAlbum.photos.map((photo, index) => `
      <button class="photo-card" type="button" data-index="${index}" aria-label="Open ${escapeAttr(photo.alt || photo.name || "photo")}">
        <img src="${escapeAttr(photo.src)}" alt="${escapeAttr(photo.alt || photo.name || state.activeAlbum.title)}" loading="lazy">
      </button>`).join("");
    $("photoGrid").querySelectorAll(".photo-card").forEach((button) => button.addEventListener("click", () => openLightbox(Number(button.dataset.index))));
    window.scrollTo({ top: document.querySelector(".gallery-page").offsetTop - 90, behavior: "smooth" });
  }

  function showAlbums() {
    state.activeAlbum = null;
    $("photoView").hidden = true;
    $("albumGrid").hidden = false;
    $("gallerySearch").closest("label").hidden = false;
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
    box.addEventListener("touchstart", (event) => { startX = event.changedTouches[0].screenX; }, { passive: true });
    box.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].screenX - startX;
      if (Math.abs(delta) > 55) moveLightbox(delta > 0 ? -1 : 1);
    }, { passive: true });
  }

  function openLightbox(index) { state.lightboxIndex = index; renderLightbox(); $("galleryLightbox").hidden = false; document.body.style.overflow = "hidden"; }
  function closeLightbox() { $("galleryLightbox").hidden = true; document.body.style.overflow = ""; }
  function moveLightbox(direction) {
    if (!state.activeAlbum?.photos.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.activeAlbum.photos.length) % state.activeAlbum.photos.length;
    renderLightbox();
  }
  function renderLightbox() {
    const photo = state.activeAlbum.photos[state.lightboxIndex];
    $("lightboxImage").src = photo.src;
    $("lightboxImage").alt = photo.alt || photo.name || state.activeAlbum.title;
    $("lightboxCaption").textContent = photo.caption || photo.name || `${state.activeAlbum.title} · ${state.lightboxIndex + 1} of ${state.activeAlbum.photos.length}`;
  }
  function showNotice(message) { const el = $("galleryNotice"); el.textContent = message; el.hidden = false; }
  function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/'/g, "&#39;"); }
})();
