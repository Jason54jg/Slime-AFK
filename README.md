# Slime-AFK
Il s'agit d'un programme simple pour héberger et automatiser un bot slime pour Hypixel Skyblock.

## Caractéristiques
- Envoi automatique sur ton island.
- Visite une island
- Configuration simplifiée.

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
