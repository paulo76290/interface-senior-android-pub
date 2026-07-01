const timeNowEl = document.querySelector("#timeNow");
const todayEl = document.querySelector("#today");
const noticeDialog = document.querySelector("#noticeDialog");
const noticeText = document.querySelector("#noticeText");
const closeNoticeButton = document.querySelector("#closeNoticeButton");
const teamsButton = document.querySelector("#teamsButton");
const teamsDialog = document.querySelector("#teamsDialog");
const teamContactList = document.querySelector("#teamContactList");
const teamContactForm = document.querySelector("#teamContactForm");
const newTeamContactButton = document.querySelector("#newTeamContactButton");
const teamEditIndexInput = document.querySelector("#teamEditIndexInput");
const teamNameInput = document.querySelector("#teamNameInput");
const teamEmailInput = document.querySelector("#teamEmailInput");
const teamSubmitButton = document.querySelector("#teamSubmitButton");
const cancelTeamEditButton = document.querySelector("#cancelTeamEditButton");
const closeTeamsButton = document.querySelector("#closeTeamsButton");
const photosButton = document.querySelector("#photosButton");
const photosDialog = document.querySelector("#photosDialog");
const onlineAlbumList = document.querySelector("#onlineAlbumList");
const onlineAlbumForm = document.querySelector("#onlineAlbumForm");
const newLocalFolderButton = document.querySelector("#newLocalFolderButton");
const newInternetAlbumButton = document.querySelector("#newInternetAlbumButton");
const onlineAlbumEditIndexInput = document.querySelector("#onlineAlbumEditIndexInput");
const onlineAlbumTypeInput = document.querySelector("#onlineAlbumTypeInput");
const onlineAlbumNameInput = document.querySelector("#onlineAlbumNameInput");
const onlineAlbumUrlInput = document.querySelector("#onlineAlbumUrlInput");
const onlineAlbumSubmitButton = document.querySelector("#onlineAlbumSubmitButton");
const cancelOnlineAlbumEditButton = document.querySelector("#cancelOnlineAlbumEditButton");
const closePhotosButton = document.querySelector("#closePhotosButton");
const weatherButton = document.querySelector("#weatherButton");
const homeWeatherLabel = document.querySelector("#homeWeatherLabel");
const homeWeatherTemp = document.querySelector("#homeWeatherTemp");
const weatherDialog = document.querySelector("#weatherDialog");
const weatherPlace = document.querySelector("#weatherPlace");
const weatherPanel = document.querySelector("#weatherPanel");
const weatherForm = document.querySelector("#weatherForm");
const weatherCityInput = document.querySelector("#weatherCityInput");
const refreshWeatherButton = document.querySelector("#refreshWeatherButton");
const closeWeatherButton = document.querySelector("#closeWeatherButton");
const settingsButton = document.querySelector("#settingsButton");
const settingsDialog = document.querySelector("#settingsDialog");
const closeSettingsButton = document.querySelector("#closeSettingsButton");
const exportSettingsButton = document.querySelector("#exportSettingsButton");
const importSettingsInput = document.querySelector("#importSettingsInput");

const ONLINE_ALBUM_STORAGE_KEY = "tablette-simple-online-albums";
const TEAM_CONTACT_STORAGE_KEY = "interface-senior-teams-contacts";
const WEATHER_CITY_STORAGE_KEY = "interface-senior-weather-city";

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
let teamContacts = loadTeamContacts();
let weatherCity = localStorage.getItem(WEATHER_CITY_STORAGE_KEY) || "";
let isMobileDevice = detectMobileDevice();

function detectMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 760px)").matches;
}

function applyDeviceMode() {
  isMobileDevice = detectMobileDevice();
  document.body.classList.toggle("is-mobile", isMobileDevice);
  document.body.classList.toggle("is-desktop", !isMobileDevice);
}

function updateClock() {
  const now = new Date();
  timeNowEl.textContent = timeFormatter.format(now);
  todayEl.textContent = dateFormatter.format(now);
}

applyDeviceMode();
refreshAdaptiveLinks();
updateClock();
setInterval(updateClock, 30000);
window.addEventListener("resize", () => {
  applyDeviceMode();
  refreshAdaptiveLinks();
});

function showNotice(message) {
  noticeText.textContent = message;
  noticeDialog.showModal();
}

function collectSettings() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    teams: teamContacts,
    photoLinks: onlineAlbums,
    weatherCity
  };
}

function downloadSettings() {
  const blob = new Blob([JSON.stringify(collectSettings(), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "interface-senior-reglages.json";
  link.click();
  URL.revokeObjectURL(url);
}

function applyImportedSettings(settings) {
  if (!settings || typeof settings !== "object") {
    throw new Error("Format invalide.");
  }

  teamContacts = Array.isArray(settings.teams) ? settings.teams : [];
  onlineAlbums = Array.isArray(settings.photoLinks) ? settings.photoLinks : [];
  weatherCity = typeof settings.weatherCity === "string" ? settings.weatherCity : "";

  saveTeamContacts();
  saveOnlineAlbums();
  localStorage.setItem(WEATHER_CITY_STORAGE_KEY, weatherCity);
  loadWeather();
}

function loadTeamContacts() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_CONTACT_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTeamContacts() {
  localStorage.setItem(TEAM_CONTACT_STORAGE_KEY, JSON.stringify(teamContacts));
}

function createTeamsChatUrl(email) {
  return `msteams://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`;
}

function getWhatsAppUrl() {
  return isMobileDevice ? "whatsapp://send" : "whatsapp://";
}

function getTeamViewerUrl() {
  if (/Android/i.test(navigator.userAgent)) {
    return "intent://#Intent;scheme=teamviewerqs;package=com.teamviewer.quicksupport.market;end";
  }

  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return "teamviewerqs://";
  }

  return "teamviewer10://";
}

function refreshAdaptiveLinks() {
  const whatsAppLink = document.querySelector("[data-app='whatsapp']");

  if (whatsAppLink) {
    whatsAppLink.href = getWhatsAppUrl();
  }
}

function createContactTitle(email) {
  const localPart = email.split("@")[0] || email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderTeamContacts() {
  teamContactList.innerHTML = "";

  if (teamContacts.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "Aucun contact Teams ajouté pour le moment.";
    teamContactList.append(emptyMessage);
    return;
  }

  teamContacts.forEach((contact, index) => {
    const contactCard = document.createElement("div");
    contactCard.className = "contact-card";

    const contactLink = document.createElement("a");
    contactLink.className = "album-link";
    contactLink.href = createTeamsChatUrl(contact.email);
    contactLink.target = isMobileDevice ? "_self" : "_blank";
    contactLink.rel = "noopener";

    const contactName = document.createElement("span");
    contactName.className = "album-title";
    contactName.textContent = contact.name || createContactTitle(contact.email);

    const contactAction = document.createElement("span");
    contactAction.className = "album-name";
    contactAction.textContent = contact.email;

    contactLink.append(contactName, contactAction);

    const editButton = document.createElement("button");
    editButton.className = "ghost-button";
    editButton.type = "button";
    editButton.textContent = "modifier";
    editButton.addEventListener("click", () => startTeamEdit(index));

    const deleteButton = document.createElement("button");
    deleteButton.className = "card-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Supprimer ${contact.name || createContactTitle(contact.email)}`);
    deleteButton.addEventListener("click", () => deleteTeamContact(index));

    const cardActions = document.createElement("div");
    cardActions.className = "card-actions";
    cardActions.append(editButton);

    const reorderControls = createReorderControls(index, teamContacts.length, moveTeamContact);

    contactCard.append(contactLink, deleteButton, cardActions, reorderControls);
    teamContactList.append(contactCard);
  });
}

function createReorderControls(index, length, onMove) {
  const controls = document.createElement("div");
  controls.className = "reorder-controls";

  const upButton = document.createElement("button");
  upButton.className = "reorder-button";
  upButton.type = "button";
  upButton.textContent = "↑";
  upButton.setAttribute("aria-label", "Monter");
  upButton.disabled = index === 0;
  upButton.addEventListener("click", () => onMove(index, -1));

  const downButton = document.createElement("button");
  downButton.className = "reorder-button";
  downButton.type = "button";
  downButton.textContent = "↓";
  downButton.setAttribute("aria-label", "Descendre");
  downButton.disabled = index === length - 1;
  downButton.addEventListener("click", () => onMove(index, 1));

  controls.append(upButton, downButton);
  return controls;
}

function moveItem(items, index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return false;
  }

  const [item] = items.splice(index, 1);
  items.splice(nextIndex, 0, item);
  return true;
}

function moveTeamContact(index, direction) {
  if (!moveItem(teamContacts, index, direction)) {
    return;
  }

  saveTeamContacts();
  renderTeamContacts();
}

function deleteTeamContact(index) {
  const contact = teamContacts[index];
  if (!contact) {
    return;
  }

  const contactName = contact.name || createContactTitle(contact.email);
  if (!window.confirm(`Supprimer le contact ${contactName} ?`)) {
    return;
  }

  teamContacts.splice(index, 1);
  saveTeamContacts();
  renderTeamContacts();
}

function resetTeamForm() {
  teamEditIndexInput.value = "";
  teamContactForm.reset();
  teamSubmitButton.textContent = "Ajouter le contact";
  teamContactForm.hidden = true;
  newTeamContactButton.hidden = false;
}

function startTeamCreate() {
  teamEditIndexInput.value = "";
  teamContactForm.reset();
  teamSubmitButton.textContent = "Ajouter le contact";
  teamContactForm.hidden = false;
  newTeamContactButton.hidden = true;
  teamNameInput.focus();
}

function startTeamEdit(index) {
  const contact = teamContacts[index];
  if (!contact) {
    return;
  }

  teamEditIndexInput.value = String(index);
  teamNameInput.value = contact.name || createContactTitle(contact.email);
  teamEmailInput.value = contact.email;
  teamSubmitButton.textContent = "Enregistrer";
  teamContactForm.hidden = false;
  newTeamContactButton.hidden = true;
  teamNameInput.focus();
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

function normalizeLocalFolderPath(path) {
  const trimmedPath = path.trim();

  if (/^file:\/\//i.test(trimmedPath)) {
    return trimmedPath;
  }

  const normalizedPath = trimmedPath.replace(/\\/g, "/");

  if (/^[a-z]:\//i.test(normalizedPath)) {
    return encodeURI(`file:///${normalizedPath}`);
  }

  return encodeURI(`file://${normalizedPath}`);
}

function normalizePhotoShortcutHref(value, type) {
  if (type === "local-folder") {
    return normalizeLocalFolderPath(value);
  }

  return normalizeUrl(value);
}

function getPhotoShortcutLabel(type) {
  return type === "local-folder" ? "Dossier local" : "Album internet";
}

function getPhotoShortcutPlaceholder(type) {
  return type === "local-folder" ? "D:\\Images\\Photos" : "https://photos.google.com/...";
}

function getPhotoShortcutSubmitLabel(type) {
  return type === "local-folder" ? "Ajouter le dossier" : "Ajouter l'album";
}

function getWeatherLabel(code) {
  const labels = {
    0: "Ciel clair",
    1: "Plutôt dégagé",
    2: "Partiellement nuageux",
    3: "Couvert",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine légère",
    53: "Bruine",
    55: "Bruine forte",
    61: "Pluie légère",
    63: "Pluie",
    65: "Pluie forte",
    71: "Neige légère",
    73: "Neige",
    75: "Neige forte",
    80: "Averses légères",
    81: "Averses",
    82: "Fortes averses",
    95: "Orage"
  };

  return labels[code] || "Météo variable";
}

function renderWeatherLoading(city) {
  weatherPlace.textContent = city || "Choisir une ville";
  weatherPanel.innerHTML = `<p class="empty-message">Chargement de la météo...</p>`;
}

function renderWeatherError(message) {
  weatherPanel.innerHTML = `<p class="empty-message">${message}</p>`;
  homeWeatherLabel.textContent = weatherCity ? weatherCity : "Ajouter la météo";
  homeWeatherTemp.textContent = "";
}

function renderWeather(data, location) {
  const current = data.current;
  const units = data.current_units;
  const daily = data.daily;
  const hourly = data.hourly;
  const label = getWeatherLabel(current.weather_code);
  const today = new Date().toISOString().slice(0, 10);
  const hourlyItems = hourly.time
    .map((time, index) => ({
      time,
      temperature: hourly.temperature_2m[index],
      code: hourly.weather_code[index]
    }))
    .filter((item) => item.time.startsWith(today))
    .filter((_, index) => index % 3 === 0)
    .slice(0, 8);

  weatherPlace.textContent = `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}`;
  homeWeatherLabel.textContent = `${location.name} · ${label}`;
  homeWeatherTemp.textContent = `${Math.round(current.temperature_2m)}${units.temperature_2m}`;
  weatherPanel.innerHTML = `
    <div class="weather-current">
      <span class="weather-temp">${Math.round(current.temperature_2m)}${units.temperature_2m}</span>
      <span class="weather-label">${label}</span>
    </div>
    <div class="weather-details">
      <span>Vent ${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}</span>
      <span>Min ${Math.round(daily.temperature_2m_min[0])}${units.temperature_2m}</span>
      <span>Max ${Math.round(daily.temperature_2m_max[0])}${units.temperature_2m}</span>
    </div>
    <div class="hourly-forecast" aria-label="Prévisions de la journée">
      ${hourlyItems
        .map((item) => {
          const hour = new Date(item.time).toLocaleTimeString("fr-BE", {
            hour: "2-digit",
            minute: "2-digit"
          });
          return `
            <div class="hour-card">
              <span class="hour-time">${hour}</span>
              <span class="hour-temp">${Math.round(item.temperature)}${units.temperature_2m}</span>
              <span class="hour-label">${getWeatherLabel(item.code)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

async function fetchWeather(city) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
  const geocodeResponse = await fetch(geocodeUrl);
  const geocodeData = await geocodeResponse.json();
  const location = geocodeData.results?.[0];

  if (!location) {
    throw new Error("Ville introuvable.");
  }

  const forecastUrl = [
    "https://api.open-meteo.com/v1/forecast",
    `?latitude=${location.latitude}`,
    `&longitude=${location.longitude}`,
    "&current=temperature_2m,weather_code,wind_speed_10m",
    "&hourly=temperature_2m,weather_code",
    "&daily=temperature_2m_max,temperature_2m_min",
    "&timezone=auto"
  ].join("");
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  renderWeather(forecastData, location);
}

async function loadWeather() {
  if (!weatherCity) {
    weatherPlace.textContent = "Choisir une ville";
    homeWeatherLabel.textContent = "Ajouter la météo";
    homeWeatherTemp.textContent = "";
    renderWeatherError("Ajoutez une ville pour afficher la météo.");
    return;
  }

  renderWeatherLoading(weatherCity);

  try {
    await fetchWeather(weatherCity);
  } catch {
    renderWeatherError("Impossible de récupérer la météo pour le moment.");
  }
}

function renderOnlineAlbums() {
  onlineAlbumList.innerHTML = "";

  if (onlineAlbums.length === 0) {
    return;
  }

  onlineAlbums.forEach((album, index) => {
    const albumCard = document.createElement("div");
    albumCard.className = "contact-card";

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
    albumSubtitle.textContent = getPhotoShortcutLabel(album.type);

    albumLink.append(albumTitle, albumSubtitle);

    const editButton = document.createElement("button");
    editButton.className = "ghost-button";
    editButton.type = "button";
    editButton.textContent = "modifier";
    editButton.addEventListener("click", () => startOnlineAlbumEdit(index));

    const deleteButton = document.createElement("button");
    deleteButton.className = "card-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Supprimer ${album.name}`);
    deleteButton.addEventListener("click", () => deleteOnlineAlbum(index));

    const cardActions = document.createElement("div");
    cardActions.className = "card-actions";
    cardActions.append(editButton);

    const reorderControls = createReorderControls(index, onlineAlbums.length, moveOnlineAlbum);

    albumCard.append(albumLink, deleteButton, cardActions, reorderControls);
    onlineAlbumList.append(albumCard);
  });
}

function moveOnlineAlbum(index, direction) {
  if (!moveItem(onlineAlbums, index, direction)) {
    return;
  }

  saveOnlineAlbums();
  renderOnlineAlbums();
}

function deleteOnlineAlbum(index) {
  const album = onlineAlbums[index];
  if (!album) {
    return;
  }

  if (!window.confirm(`Supprimer ${album.name} ?`)) {
    return;
  }

  onlineAlbums.splice(index, 1);
  saveOnlineAlbums();
  renderOnlineAlbums();
}

function resetOnlineAlbumForm() {
  onlineAlbumEditIndexInput.value = "";
  onlineAlbumForm.reset();
  onlineAlbumTypeInput.value = "local-folder";
  onlineAlbumUrlInput.placeholder = getPhotoShortcutPlaceholder("local-folder");
  onlineAlbumSubmitButton.textContent = "Ajouter";
  onlineAlbumForm.hidden = true;
  newLocalFolderButton.hidden = false;
  newInternetAlbumButton.hidden = false;
}

function startOnlineAlbumCreate(type) {
  onlineAlbumEditIndexInput.value = "";
  onlineAlbumForm.reset();
  onlineAlbumTypeInput.value = type;
  onlineAlbumUrlInput.placeholder = getPhotoShortcutPlaceholder(type);
  onlineAlbumSubmitButton.textContent = getPhotoShortcutSubmitLabel(type);
  onlineAlbumForm.hidden = false;
  newLocalFolderButton.hidden = true;
  newInternetAlbumButton.hidden = true;
  onlineAlbumNameInput.focus();
}

function startOnlineAlbumEdit(index) {
  const album = onlineAlbums[index];
  if (!album) {
    return;
  }

  onlineAlbumEditIndexInput.value = String(index);
  onlineAlbumTypeInput.value = album.type || "web-page";
  onlineAlbumNameInput.value = album.name;
  onlineAlbumUrlInput.value = album.href;
  onlineAlbumUrlInput.placeholder = getPhotoShortcutPlaceholder(album.type);
  onlineAlbumSubmitButton.textContent = "Enregistrer";
  onlineAlbumForm.hidden = false;
  newLocalFolderButton.hidden = true;
  newInternetAlbumButton.hidden = true;
  onlineAlbumNameInput.focus();
}

closeNoticeButton.addEventListener("click", () => noticeDialog.close());
teamsButton.addEventListener("click", () => {
  renderTeamContacts();
  resetTeamForm();
  teamsDialog.showModal();
});
closeTeamsButton.addEventListener("click", () => teamsDialog.close());
newTeamContactButton.addEventListener("click", startTeamCreate);
cancelTeamEditButton.addEventListener("click", resetTeamForm);

teamContactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const editIndex = teamEditIndexInput.value === "" ? null : Number(teamEditIndexInput.value);
  const name = teamNameInput.value.trim();
  const email = teamEmailInput.value.trim().toLowerCase();

  if (!email) {
    showNotice("Ajoutez une adresse email Teams.");
    return;
  }

  if (editIndex !== null && Number.isInteger(editIndex) && editIndex >= 0 && teamContacts[editIndex]) {
    teamContacts[editIndex] = { name: name || createContactTitle(email), email };
    saveTeamContacts();
    renderTeamContacts();
    resetTeamForm();
    return;
  }

  const existingContact = teamContacts.find((contact) => contact.email === email);

  if (existingContact) {
    existingContact.name = name || existingContact.name || createContactTitle(email);
  } else {
    teamContacts.push({ name: name || createContactTitle(email), email });
  }

  saveTeamContacts();
  renderTeamContacts();
  resetTeamForm();
});

photosButton.addEventListener("click", () => {
  renderOnlineAlbums();
  resetOnlineAlbumForm();
  photosDialog.showModal();
});
closePhotosButton.addEventListener("click", () => photosDialog.close());
weatherButton.addEventListener("click", () => {
  weatherCityInput.value = weatherCity;
  loadWeather();
  weatherDialog.showModal();
});
closeWeatherButton.addEventListener("click", () => weatherDialog.close());
refreshWeatherButton.addEventListener("click", loadWeather);

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  weatherCity = weatherCityInput.value.trim();

  if (!weatherCity) {
    showNotice("Ajoutez une ville pour la météo.");
    return;
  }

  localStorage.setItem(WEATHER_CITY_STORAGE_KEY, weatherCity);
  loadWeather();
});

loadWeather();

newLocalFolderButton.addEventListener("click", () => startOnlineAlbumCreate("local-folder"));
newInternetAlbumButton.addEventListener("click", () => startOnlineAlbumCreate("web-page"));
cancelOnlineAlbumEditButton.addEventListener("click", resetOnlineAlbumForm);

onlineAlbumForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const editIndex = onlineAlbumEditIndexInput.value === "" ? null : Number(onlineAlbumEditIndexInput.value);
  const albumType = onlineAlbumTypeInput.value;
  const albumName = onlineAlbumNameInput.value.trim();
  const albumUrl = normalizePhotoShortcutHref(onlineAlbumUrlInput.value, albumType);

  if (!albumName || !albumUrl) {
    showNotice("Ajoutez un nom et un lien pour l'album.");
    return;
  }

  if (editIndex !== null && Number.isInteger(editIndex) && editIndex >= 0 && onlineAlbums[editIndex]) {
    onlineAlbums[editIndex] = { name: albumName, href: albumUrl, type: albumType };
    saveOnlineAlbums();
    renderOnlineAlbums();
    resetOnlineAlbumForm();
    return;
  }

  onlineAlbums.push({ name: albumName, href: albumUrl, type: albumType });
  saveOnlineAlbums();
  renderOnlineAlbums();
  resetOnlineAlbumForm();
});

settingsButton.addEventListener("click", () => settingsDialog.showModal());
closeSettingsButton.addEventListener("click", () => settingsDialog.close());

exportSettingsButton.addEventListener("click", downloadSettings);

importSettingsInput.addEventListener("change", async () => {
  const file = importSettingsInput.files?.[0];

  if (!file) {
    return;
  }

  try {
    const settings = JSON.parse(await file.text());
    applyImportedSettings(settings);
    renderTeamContacts();
    renderOnlineAlbums();
    showNotice("Reglages importes.");
  } catch {
    showNotice("Impossible d'importer ce fichier de reglages.");
  } finally {
    importSettingsInput.value = "";
  }
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "emergency") {
      window.location.href = getTeamViewerUrl();
      return;
    }
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
