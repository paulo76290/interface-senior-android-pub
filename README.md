# Interface senior PC

Interface web simplifiée pour PC, pensée pour ouvrir rapidement les logiciels utiles avec de gros boutons lisibles.

## Utilisation rapide

Ouvrir `index.html` dans un navigateur sur le PC, ou utiliser la version publiée sur GitHub Pages.

Pour créer un raccourci sur le bureau Windows:

1. Ouvrir la page dans Chrome ou Edge.
2. Menu du navigateur > Plus d'outils / Applications.
3. Choisir "Créer un raccourci" ou "Installer cette page comme application".
4. Cocher l'option pour l'ajouter au bureau si elle est proposée.

## Applications

Le bouton Teams permet d'ajouter des contacts avec une adresse email. Chaque contact ouvre `https://teams.microsoft.com/l/chat/0/0?users=prenom.nom@entreprise.com`.

Le bouton WhatsApp utilise `whatsapp://`. Il ouvre WhatsApp Desktop si l'application est installée et si le protocole est enregistré.

Le bouton Photos ouvre une galerie locale. Les images peuvent être ajoutées depuis le sélecteur de fichiers du PC; elles sont conservées localement dans le navigateur. Des albums en ligne peuvent aussi être ajoutés avec un nom et un lien.

Le bouton Mail Orange ouvre `https://mail.orange.fr`.

Le bouton TeamViewer utilise `teamviewer10://`. Il ouvre TeamViewer si le protocole est enregistré sur le PC.

Important: un navigateur ne peut pas lancer directement n'importe quel fichier `.exe` pour des raisons de sécurité. Il peut seulement ouvrir des logiciels qui déclarent un protocole comme `msteams://`, `whatsapp://` ou `teamviewer10://`.
