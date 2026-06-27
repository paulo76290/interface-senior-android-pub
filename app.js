const timeNowEl = document.querySelector("#timeNow");
const todayEl = document.querySelector("#today");
const contactsEl = document.querySelector("#contacts");
const teamsButton = document.querySelector("#teamsButton");
const teamsDialog = document.querySelector("#teamsDialog");
const closeTeamsButton = document.querySelector("#closeTeamsButton");
const noticeDialog = document.querySelector("#noticeDialog");
const noticeText = document.querySelector("#noticeText");
const closeNoticeButton = document.querySelector("#closeNoticeButton");
const photosButton = document.querySelector("#photosButton");
const photosDialog = document.querySelector("#photosDialog");
const albumList = document.querySelector("#albumList");
const albumForm = document.querySelector("#albumForm");
const albumNameInput = document.querySelector("#albumNameInput");
const albumUrlInput = document.querySelector("#albumUrlInput");
const closePhotosButton = document.querySelector("#closePhotosButton");
const ALBUM_STORAGE_KEY = "tablette-simple-photo-albums";

const contacts = [
  { name: "Marie", action: "Appel Teams", href: "https://teams.microsoft.com" },
  { name: "Paul", action: "Appel Teams", href: "https://teams.microsoft.com" },
  { name: "Sophie", action: "Appel Teams", href: "https://teams.microsoft.com" }
];

let photoAlbums = loadPhotoAlbums();

const dateFormatter = new Intl.DateTimeFormat("fr-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const timeFormatter = new Intl.DateTimeFormat("fr-BE", {
  hour: "2-digit",
  minute: "2-digit"
});

function updateClock() {
  const now = new Date();
  timeNowEl.textContent = timeFormatter.format(now);
  todayEl.textContent = dateFormatter.format(now);
}

updateClock();
setInterval(updateClock, 30000);

contactsEl.innerHTML = contacts
  .map((contact) => {
    const initial = contact.name.slice(0, 1).toUpperCase();
    return `
      <a class="contact" href="${contact.href}" aria-label="${contact.action} avec ${contact.name}">
        <span class="contact-avatar" aria-hidden="true">${initial}</span>
        <span>
          <span class="contact-name">${contact.name}</span>
          <span class="contact-action">${contact.action}</span>
        </span>
      </a>
    `;
  })
  .join("");

function loadPhotoAlbums() {
  try {
    return JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePhotoAlbums() {
  localStorage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(photoAlbums));
}

function normalizeAlbumUrl(url) {
  const trimmedUrl = url.trim();
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function renderPhotoAlbums() {
  albumList.innerHTML = "";

  if (photoAlbums.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Aucun album ajouté pour le moment.";
    albumList.append(emptyMessage);
    return;
  }

  photoAlbums.forEach((album) => {
    const albumLink = document.createElement("a");
    albumLink.className = "album-link";
    albumLink.href = album.href;
    albumLink.target = "_blank";
    albumLink.rel = "noopener";

    const albumTitle = document.createElement("span");
    albumTitle.className = "album-year";
    albumTitle.textContent = album.name;

    const albumSubtitle = document.createElement("span");
    albumSubtitle.className = "album-name";
    albumSubtitle.textContent = "Album photos";

    albumLink.append(albumTitle, albumSubtitle);
    albumList.append(albumLink);
  });
}

renderPhotoAlbums();

function showNotice(message) {
  noticeText.textContent = message;
  noticeDialog.showModal();
}

teamsButton.addEventListener("click", () => teamsDialog.showModal());
closeTeamsButton.addEventListener("click", () => teamsDialog.close());
closeNoticeButton.addEventListener("click", () => noticeDialog.close());
photosButton.addEventListener("click", () => photosDialog.showModal());
closePhotosButton.addEventListener("click", () => photosDialog.close());

albumForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const albumName = albumNameInput.value.trim();
  const albumUrl = normalizeAlbumUrl(albumUrlInput.value);

  if (!albumName || !albumUrl) {
    showNotice("Ajoutez un nom et un lien pour l'album.");
    return;
  }

  photoAlbums.push({ name: albumName, href: albumUrl });
  savePhotoAlbums();
  renderPhotoAlbums();
  albumForm.reset();
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "emergency") {
      window.location.href = "intent://open/#Intent;scheme=teamviewer;package=com.teamviewer.quicksupport;S.browser_fallback_url=https%3A%2F%2Fwww.teamviewer.com%2Ffr%2Fdownload%2Fandroid%2F;end";
      return;
    }

    if (action === "volume") {
      showNotice("Utilisez les boutons physiques de la tablette pour augmenter le son.");
      return;
    }

    showNotice("Glissez depuis le haut de l'écran pour régler la luminosité.");
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
