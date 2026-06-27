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

Le bouton Teams ouvre les contacts favoris Teams. Le bouton "Ouvrir Teams" tente d'ouvrir l'application Microsoft Teams. Si elle n'est pas installée, Android redirige vers le Play Store.

Le bouton WhatsApp tente d'ouvrir l'application WhatsApp. Si elle n'est pas installée, Android redirige vers le Play Store.

Le bouton Photos ouvre une liste d'albums personnalisable. Les albums peuvent être ajoutés depuis l'interface avec un nom et un lien; ils sont conservés dans le navigateur de la tablette.

Le bouton Mail Orange tente d'ouvrir l'application associée à `mail.orange.fr`. Si aucune application ne prend ce lien, Chrome ouvre le webmail Orange.

Le bouton Play Store tente d'ouvrir directement l'application Google Play Store.

Le bouton Urgence tente d'ouvrir TeamViewer QuickSupport. Si l'application n'est pas installée, Android redirige vers le Play Store.
