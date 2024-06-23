# TinyPet

## Description du projet
TinyPet est une application web de création et gestion de pétitions, inspirée par des plateformes telles qu'Avaaz et Change.org. Conçue pour supporter des millions d'utilisateurs et de pétitions, notre plateforme offre une interface robuste pour une interaction démocratique efficace.

## Fonctionnalités
- **Création de pétitions :** Les utilisateurs peuvent créer des pétitions pour soutenir des causes.
- **Signature de pétitions :** Les utilisateurs authentifiés peuvent signer une pétition, limitée à une signature par utilisateur.
- **Consultation des pétitions signées :** Les utilisateurs peuvent voir les pétitions qu'ils ont signées, triées par date.
- **Top 100 des pétitions :** Affiche les cent pétitions les plus récentes.
- **Gestion par tags :** Les pétitions peuvent être taguées et retrouvées par tag, avec un tri par date de création.
- **Liste des signataires :** Affiche tous les utilisateurs ayant signé une pétition spécifique.

## Technologies utilisées
- **Frontend :** Mithril.js
- **Backend :** Services REST implémentés avec Google Cloud Endpoint en Java
- **Base de données :** Google Datastore pour la persistance des données
- **Gestion du projet :** Maven pour la gestion des dépendances et la construction du projet

## Installation et utilisation
### Configuration et déploiement avec Maven
Pour configurer et déployer TinyPet, suivez ces instructions :
1. Clonez le dépôt GitHub :
git clone [[URL du dépôt](https://github.com/Magnion/TinyPets)]
2. Naviguez dans le dossier du projet et exécutez Maven pour construire le projet :
cd TinyPet
mvn clean install
3. Configurez votre environnement Google Cloud :
gcloud init
4. Déployez l'application :
mvn package appengine:deploy

### Accéder à l'application
L'application est accessible via l'URL suivante : [TinyPets](https://faculte-tp1.ew.r.appspot.com)

## Contributeurs
- **Maël Gibelot**
- **Zakarya Benkaballah**
- **Marion Thuaud**

## État du projet
### Ce qui fonctionne
- Connexion des utilisateurs.
- Création et signature de pétitions.
- Affichage des dernières 100 pétitions.
- Consultation des signataires d'une pétition.
- Affichage des mes pétitions créées et signées

### Limitations
- **Recherche par tag non fonctionnelle :** La fonctionnalité permettant de rechercher des pétitions par tag est actuellement en développement et n'est pas encore opérationnelle.

## Kinds de notre datastore

### Petition :
![image](https://github.com/Magnion/TinyPets/assets/72595888/979aabcc-fe78-4f36-aa45-76044c7fa54e)

### Client :
![image](https://github.com/Magnion/TinyPets/assets/72595888/ee3f1238-9e7a-4b27-831a-527b26070b76)


