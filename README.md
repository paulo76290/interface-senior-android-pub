# Interface tablette simple

Interface web pour tablette Android, pensée pour des personnes âgées: grande date et heure, gros boutons, accès direct à Teams, WhatsApp, Photos et bouton d'urgence vers TeamViewer.

## Utilisation rapide

Ouvrir `index.html` dans Chrome sur la tablette ou sur un ordinateur.

Pour une installation plus propre sur Android:

1. Mettre le dossier sur un petit serveur web local ou l'héberger sur un site interne.
2. Ouvrir l'adresse dans Chrome sur la tablette.
3. Menu Chrome > Ajouter à l'écran d'accueil.

## Personnaliser les contacts Teams

Les contacts apparaissent quand on appuie sur le bouton Teams. Modifier la liste `contacts` dans `app.js`.

Exemple:

```js
const contacts = [
  { name: "Marie", action: "Appel Teams", href: "https://teams.microsoft.com" },
  { name: "Paul", action: "Email", href: "mailto:paul@example.com" }
];
```

## Applications

Le bouton Teams ouvre les contacts favoris Teams. Le bouton "Ouvrir Teams" utilise `https://teams.microsoft.com`. Sur Android, si Microsoft Teams est installé et associé aux liens Teams, la tablette proposera généralement d'ouvrir l'application. Sinon, le site Teams s'ouvre dans le navigateur.

Le bouton WhatsApp utilise un lien Android qui tente d'ouvrir l'application WhatsApp. Si elle n'est pas installée, Chrome redirige vers le site WhatsApp.

Le bouton Photos ouvre une liste d'albums Amazon Photos nommés Mathilda 2020 à Mathilda 2024.

Le bouton Mail Orange ouvre `https://mail.orange.fr`.

Le bouton Play Store ouvre `https://play.google.com/store/apps`.

Le bouton Urgence tente d'ouvrir TeamViewer QuickSupport. Si l'application n'est pas installée, Chrome redirige vers la page de téléchargement Android de TeamViewer.
