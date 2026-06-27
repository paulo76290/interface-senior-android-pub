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
const closePhotosButton = document.querySelector("#closePhotosButton");

const contacts = [
  { name: "Marie", action: "Appel Teams", href: "https://teams.microsoft.com" },
  { name: "Paul", action: "Appel Teams", href: "https://teams.microsoft.com" },
  { name: "Sophie", action: "Appel Teams", href: "https://teams.microsoft.com" }
];

const photoAlbums = [
  { year: "2020", href: "https://www.amazon.fr/photos/share/olMdIX9ks8pmSfOiy4efnDLLzNbLLECLVcTreKqHnjs" },
  { year: "2021", href: "https://www.amazon.fr/photos/share/nWsr5nRzMEOIi1NZYCvx7NeE31eNfwk8CZsa5iIaWfP" },
  { year: "2022", href: "https://www.amazon.fr/photos/share/U7Bo6oxjYJcUTdRajjXHuDrBDaPutWi46tBg4AT7MpS" },
  { year: "2023", href: "https://www.amazon.fr/photos/share/mmHjA0ZBis6Yab57Vv2ptYbEXxjbHRjlOM5zIVMwqvZ" },
  { year: "2024", href: "https://www.amazon.fr/photos/share/ljvld6RPbzFJ3nHVHaTUDYwKYCMzR8qGDgWH4hCUZly" }
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

albumList.innerHTML = photoAlbums
  .map((album) => {
    return `
      <a class="album-link" href="${album.href}" target="_blank" rel="noopener">
        <span class="album-year">Mathilda ${album.year}</span>
        <span class="album-name">Album photos</span>
      </a>
    `;
  })
  .join("");

function showNotice(message) {
  noticeText.textContent = message;
  noticeDialog.showModal();
}

teamsButton.addEventListener("click", () => teamsDialog.showModal());
closeTeamsButton.addEventListener("click", () => teamsDialog.close());
closeNoticeButton.addEventListener("click", () => noticeDialog.close());
photosButton.addEventListener("click", () => photosDialog.showModal());
closePhotosButton.addEventListener("click", () => photosDialog.close());

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
