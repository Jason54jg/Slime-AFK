# Slime-AFK
Il s'agit d'un programme simple pour héberger et automatiser un bot slime pour Hypixel Skyblock.

## Caractéristiques
- Envoi automatique sur ton island.
- Visite une island
- Configuration simplifiée.
- Système de retry pour les interactions avec les menus
- Logs détaillés via Discord Webhook
- Gestion intelligente des erreurs
- Interface utilisateur améliorée dans Discord

## Vous avez besoin
- [winscp](https://winscp.net/eng/download.php) pour mettre les fichier sur votre vps
- [Terminus](https://termius.com/) pour lancer le script

## Hébergeur
- [Ionos](https://www.ionos.fr/serveurs/vps)
- il peut être utilisé sur Windows et Linux

## Installation
- Téléchargement de nodejs `curl -s https://deb.nodesource.com/setup_18.x | sudo bash`
- Installation de nodejs `sudo apt install nodejs -y`
- Installation de screen `sudo apt install screen`
- Remplissez les champs du `config.json`.
- cd `emplacement du bot`
- Exécutez `npm install`.
- Fait!

## Usage
- Création du screen `screen -S bot` (Pour retourner dans l'exécution du bot il vous faudra faire `screen -x bot` seulement si vous fermer la console)
- Pour démarrer le bot, exécutez `npm start` ou `node index.js`.
- Le bot rejoindra Hypixel et entrera automatiquement dans son island.

## Configuration
- `server`:
  - `ip` - IP du serveur auquel se connecter.
  - `port` - port du serveur auquel se connecter (le plus souvent `25565`).
- `account`:
  - `username` - Email de votre compte Microsoft.
- `visit`:
  - `username` - Pseudo de la personne que vous voulez que le bot visite.
- `bot`:
  - `logAllMessages` - s'il est défini sur `true`, enregistre tous les messages que le bot reçoit dans la console.
  - `logTime` - si défini sur `true`, enregistre l'heure de tous les événements du bot dans la console.
- `webhook`:
  - `url` - URL du webhook Discord pour les logs (optionnel).
  - `username` - Nom d'utilisateur du webhook (par défaut: "Slime Bot Logger").
  - `avatar` - URL de l'avatar du webhook.

## Nouvelles Fonctionnalités

### Système de Retry
- Tentatives multiples pour les interactions avec les menus
- Délai intelligent entre les tentatives
- Maximum de 3 essais avant de passer à une autre action

### Logs Discord Améliorés
- Messages formatés avec des embeds
- Utilisation d'émojis pour une meilleure lisibilité
- Informations détaillées sur les actions du bot
- Statut en temps réel des opérations

### Gestion des Erreurs
- Meilleure détection des têtes de joueur
- Analyse complète du contenu des menus
- Récupération automatique en cas d'échec
- Logs détaillés pour le débogage

### Optimisations
- Temps de réaction plus rapides
- Meilleure gestion des délais
- Réduction des faux positifs
- Structure de code modulaire et maintenable