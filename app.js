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
const photoGallery = document.querySelector("#photoGallery");
const photoInput = document.querySelector("#photoInput");
const closePhotosButton = document.querySelector("#closePhotosButton");
const PHOTO_DB_NAME = "tablette-simple-photos";
const PHOTO_STORE_NAME = "photos";

const contacts = [
  {
    name: "Marie",
    action: "Appel Teams",
    href: "intent://teams.microsoft.com/#Intent;scheme=https;package=com.microsoft.teams;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.microsoft.teams;end"
  },
  {
    name: "Paul",
    action: "Appel Teams",
    href: "intent://teams.microsoft.com/#Intent;scheme=https;package=com.microsoft.teams;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.microsoft.teams;end"
  },
  {
    name: "Sophie",
    action: "Appel Teams",
    href: "intent://teams.microsoft.com/#Intent;scheme=https;package=com.microsoft.teams;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.microsoft.teams;end"
  }
];

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

teamsButton.addEventListener("click", () => teamsDialog.showModal());
closeTeamsButton.addEventListener("click", () => teamsDialog.close());
closeNoticeButton.addEventListener("click", () => noticeDialog.close());
photosButton.addEventListener("click", () => {
  renderStoredPhotos();
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

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "emergency") {
      window.location.href = "intent://launch/#Intent;package=com.teamviewer.quicksupport;S.browser_fallback_url=market%3A%2F%2Fdetails%3Fid%3Dcom.teamviewer.quicksupport;end";
      return;
    }
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
