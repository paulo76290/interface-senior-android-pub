const timeNowEl = document.querySelector("#timeNow");
const todayEl = document.querySelector("#today");
const noticeDialog = document.querySelector("#noticeDialog");
const noticeText = document.querySelector("#noticeText");
const closeNoticeButton = document.querySelector("#closeNoticeButton");
const photosButton = document.querySelector("#photosButton");
const photosDialog = document.querySelector("#photosDialog");
const photoGallery = document.querySelector("#photoGallery");
const photoInput = document.querySelector("#photoInput");
const onlineAlbumList = document.querySelector("#onlineAlbumList");
const onlineAlbumForm = document.querySelector("#onlineAlbumForm");
const onlineAlbumNameInput = document.querySelector("#onlineAlbumNameInput");
const onlineAlbumUrlInput = document.querySelector("#onlineAlbumUrlInput");
const closePhotosButton = document.querySelector("#closePhotosButton");

const PHOTO_DB_NAME = "tablette-simple-photos";
const PHOTO_STORE_NAME = "photos";
const ONLINE_ALBUM_STORAGE_KEY = "tablette-simple-online-albums";

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

let onlineAlbums = loadOnlineAlbums();

function updateClock() {
  const now = new Date();
  timeNowEl.textContent = timeFormatter.format(now);
  todayEl.textContent = dateFormatter.format(now);
}

updateClock();
setInterval(updateClock, 30000);

function showNotice(message) {
  noticeText.textContent = message;
  noticeDialog.showModal();
}

function openPhotoDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredPhotos() {
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, "readonly");
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function addStoredPhoto(file) {
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, "readwrite");
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.add({
      name: file.name,
      type: file.type,
      blob: file,
      createdAt: Date.now()
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function renderStoredPhotos() {
  photoGallery.innerHTML = "";
  const photos = await getStoredPhotos();

  if (photos.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Aucune image ajoutée pour le moment.";
    photoGallery.append(emptyMessage);
    return;
  }

  photos
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((photo) => {
      const image = document.createElement("img");
      image.className = "local-photo";
      image.src = URL.createObjectURL(photo.blob);
      image.alt = photo.name || "Photo ajoutée";
      image.addEventListener("load", () => URL.revokeObjectURL(image.src), { once: true });
      photoGallery.append(image);
    });
}

function loadOnlineAlbums() {
  try {
    return JSON.parse(localStorage.getItem(ONLINE_ALBUM_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOnlineAlbums() {
  localStorage.setItem(ONLINE_ALBUM_STORAGE_KEY, JSON.stringify(onlineAlbums));
}

function normalizeUrl(url) {
  const trimmedUrl = url.trim();
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function renderOnlineAlbums() {
  onlineAlbumList.innerHTML = "";

  if (onlineAlbums.length === 0) {
    return;
  }

  onlineAlbums.forEach((album) => {
    const albumLink = document.createElement("a");
    albumLink.className = "album-link";
    albumLink.href = album.href;
    albumLink.target = "_blank";
    albumLink.rel = "noopener";

    const albumTitle = document.createElement("span");
    albumTitle.className = "album-title";
    albumTitle.textContent = album.name;

    const albumSubtitle = document.createElement("span");
    albumSubtitle.className = "album-name";
    albumSubtitle.textContent = "Album en ligne";

    albumLink.append(albumTitle, albumSubtitle);
    onlineAlbumList.append(albumLink);
  });
}

closeNoticeButton.addEventListener("click", () => noticeDialog.close());
photosButton.addEventListener("click", () => {
  renderStoredPhotos();
  renderOnlineAlbums();
  photosDialog.showModal();
});
closePhotosButton.addEventListener("click", () => photosDialog.close());

photoInput.addEventListener("change", async () => {
  const imageFiles = [...photoInput.files].filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    return;
  }

  try {
    await Promise.all(imageFiles.map((file) => addStoredPhoto(file)));
    await renderStoredPhotos();
    photoInput.value = "";
  } catch {
    showNotice("Impossible d'ajouter ces images. Essayez avec moins de photos à la fois.");
  }
});

onlineAlbumForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const albumName = onlineAlbumNameInput.value.trim();
  const albumUrl = normalizeUrl(onlineAlbumUrlInput.value);

  if (!albumName || !albumUrl) {
    showNotice("Ajoutez un nom et un lien pour l'album.");
    return;
  }

  onlineAlbums.push({ name: albumName, href: albumUrl });
  saveOnlineAlbums();
  renderOnlineAlbums();
  onlineAlbumForm.reset();
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "emergency") {
      window.location.href = "teamviewer10://";
      return;
    }
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
