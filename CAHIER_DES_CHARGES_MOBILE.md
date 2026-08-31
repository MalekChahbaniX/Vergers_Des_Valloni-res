# Cahier des charges fonctionnel et technique

## Application mobile de gestion des stocks Palox – Vergers des Vallonières

### 1. Contexte du projet
Le projet consiste à développer une application mobile permettant aux utilisateurs de gérer et consulter les stocks de Palox au sein des chambres froides des **Vergers des Vallonières**.

L'application mobile sera une extension de la solution web existante. Elle devra permettre aux utilisateurs d'accéder aux informations essentielles depuis un smartphone ou une tablette, notamment lors des opérations réalisées directement sur le terrain ou dans les zones de stockage.

L'application devra être développée avec React Native CLI, avec une architecture permettant une connexion sécurisée au backend/API existant.

---

# 2. Objectifs de l'application

L'application devra permettre de :

* Consulter l'état des stocks en temps réel.
* Visualiser les chambres froides disponibles.
* Consulter le nombre de Palox stockés.
* Réceptionner un nouveau Palox.
* Affecter un Palox à une chambre froide et à un emplacement.
* Consulter les informations détaillées d'un Palox.
* Rechercher un Palox par code, identifiant ou variété.
* Consulter les statistiques principales.
* Consulter les mouvements et le registre des Palox.
* Visualiser les informations liées aux calibres et aux variétés.
* Permettre la gestion des utilisateurs selon leurs droits d'accès.
* Intégrer les données provenant du système existant via API.
* Prévoir l'intégration future de données IoT ou de télémétrie.

---

# 3. Utilisateurs concernés

L'application devra gérer plusieurs profils utilisateurs.

## 3.1 Administrateur

L'administrateur pourra notamment :

* Consulter l'ensemble des données.
* Accéder aux statistiques.
* Consulter les chambres froides.
* Gérer ou consulter les utilisateurs selon les droits définis par le système backend.
* Consulter l'historique des opérations.

## 3.2 Opérateur / Employé

L'opérateur utilisera principalement l'application pour les opérations quotidiennes :

* Réception d'un Palox.
* Consultation du stock.
* Recherche d'un Palox.
* Consultation de son emplacement.
* Consultation des informations liées au produit.

Les droits exacts devront être déterminés par le système d'authentification et les rôles disponibles dans le backend existant.

---

# 4. Plateformes

L'application devra être développée pour :

* Android.
* iOS.

Une base de code unique sera utilisée grâce à React Native CLI.

L'interface devra être adaptée aux :

* Smartphones.
* Tablettes.

---

# 5. Technologies imposées

## Application mobile

* React Native CLI.
* TypeScript.
* Architecture modulaire et maintenable.

## Navigation

Utilisation d'une solution de navigation adaptée à React Native, permettant notamment :

* Navigation par onglets.
* Navigation par pile.
* Gestion des écrans protégés après authentification.

## Gestion des données

L'application devra communiquer avec le backend existant à travers une API.

Les données principales pourront inclure :

* Palox.
* Variétés.
* Calibres.
* Chambres froides.
* Emplacements.
* Utilisateurs.
* Statistiques.
* Historique des mouvements.
* Données IoT, si disponibles.

Une solution de gestion du cache et des requêtes API devra être mise en place afin d'améliorer les performances et la fluidité de l'application.

## Stockage local

Un stockage local sécurisé devra être prévu pour :

* Le jeton d'authentification.
* Certaines préférences utilisateur.
* Les données nécessaires au fonctionnement hors ligne, si cette fonctionnalité est validée.

---

# 6. Fonctionnalités de l'application

## 6.1 Authentification

L'utilisateur devra pouvoir se connecter à l'application à l'aide de ses identifiants.

Fonctionnalités :

* Écran de connexion.
* Saisie de l'identifiant ou de l'adresse e-mail.
* Saisie du mot de passe.
* Validation des informations.
* Gestion des erreurs de connexion.
* Conservation sécurisée de la session.
* Déconnexion.

Après authentification, l'utilisateur sera redirigé vers le tableau de bord correspondant à ses droits.

---

# 6.2 Tableau de bord

Le tableau de bord permettra d'obtenir une vue rapide de l'état du stock.

Les indicateurs principaux pourront comprendre :

* Nombre total de Palox.
* Masse ou tonnage global.
* Poids moyen par Palox.
* Nombre de variétés distinctes.
* Nombre de chambres froides.
* Taux d'occupation des chambres.
* Alertes ou informations importantes.

Les données devront être récupérées depuis l'API et actualisées à la demande de l'utilisateur.

Une fonctionnalité de **rafraîchissement par glissement** devra être disponible.

---

# 6.3 Gestion du stock

L'écran Stock permettra de consulter les Palox présents dans les différentes chambres froides.

L'utilisateur devra pouvoir :

* Sélectionner une chambre froide.
* Consulter le nombre total de Palox.
* Consulter la masse totale.
* Consulter le taux d'occupation.
* Visualiser les emplacements disponibles.
* Identifier les emplacements occupés.
* Consulter les Palox associés à un emplacement.

Exemple de chambres froides :

* CF1.
* CF2.
* CF3.

L'architecture devra permettre d'ajouter de nouvelles chambres sans modification majeure de l'application.

---

# 6.4 Recherche et filtres

L'utilisateur devra pouvoir rechercher rapidement un Palox ou filtrer les données.

Critères de recherche possibles :

* Code Palox.
* Identifiant.
* Code-barres.
* Variété.
* Calibre.
* Chambre froide.
* Emplacement.

Des filtres dynamiques devront permettre de combiner plusieurs critères.

L'application devra également proposer une option permettant de réinitialiser l'ensemble des filtres.

---

# 6.5 Réception d'un nouveau Palox

Cette fonctionnalité est centrale dans l'application.

L'utilisateur devra pouvoir enregistrer la réception d'un nouveau Palox.

Les informations principales seront :

* Variété de fruit.
* Calibre.
* Chambre froide de destination.
* Emplacement ou position.
* Format ou taille du Palox.

Exemple :

* Variété : Golden.
* Calibre : Brut.
* Chambre froide : CF1.
* Emplacement : A1.
* Format : 120/100 Standard.

Après validation, l'application devra :

1. Envoyer les informations au backend.
2. Vérifier la disponibilité de l'emplacement.
3. Créer ou enregistrer le Palox.
4. Mettre à jour le stock.
5. Mettre à jour les statistiques.
6. Enregistrer le mouvement dans le registre.
7. Afficher une confirmation de réussite ou un message d'erreur.

---

# 6.6 Consultation d'un Palox

Chaque Palox devra posséder une fiche détaillée.

Les informations affichées pourront inclure :

* Identifiant unique.
* Code-barres ou QR Code, si disponible.
* Variété.
* Calibre.
* Poids ou masse.
* Format.
* Chambre froide.
* Emplacement.
* Date de réception.
* Statut.
* Historique des mouvements.

L'application devra être conçue pour permettre l'ajout futur de fonctionnalités de scan.

---

# 6.7 Scan de code-barres ou QR Code – option recommandée

Pour faciliter les opérations sur le terrain, l'application devra prévoir l'intégration d'un système de scan.

L'utilisateur pourra :

* Scanner un Palox.
* Retrouver directement ses informations.
* Accéder à son emplacement.
* Réaliser certaines opérations sans recherche manuelle.

Cette fonctionnalité peut être incluse dans une version initiale ou proposée comme option supplémentaire selon le budget final.

---

# 6.8 Gestion des emplacements

L'application devra afficher les emplacements disponibles dans chaque chambre froide.

Pour chaque emplacement :

* Identifiant de l'emplacement.
* Statut : disponible ou occupé.
* Nombre de Palox.
* Capacité maximale.
* Informations du Palox stocké, si applicable.

Exemple :

* Emplacement A1.
* Emplacement A2.
* Emplacement B1.

L'interface mobile devra privilégier une présentation simple et rapide à utiliser sur le terrain.

---

# 6.9 Plan cartographique / visualisation des emplacements

Une vue visuelle des chambres froides pourra être proposée.

Cette fonctionnalité permettra de :

* Visualiser les zones de stockage.
* Identifier les emplacements.
* Voir les emplacements disponibles.
* Voir les emplacements occupés.
* Accéder aux informations d'un emplacement.

La solution devra être compatible avec les données ou services cartographiques existants.

Si le système actuel utilise des services de type WMS ou d'autres données géographiques, l'intégration exacte devra être définie selon la documentation technique de l'API existante.

---

# 6.10 Statistiques et analytics

L'application devra proposer un espace dédié aux statistiques.

Les principaux indicateurs pourront inclure :

* Total des Palox.
* Tonnage global.
* Poids moyen par Palox.
* Variétés distinctes.
* Répartition par variété.
* Répartition par calibre.
* Occupation des chambres froides.
* Évolution du stock selon une période.
* Nombre d'entrées et de mouvements.

Des filtres devront être disponibles selon :

* Produit ou variété.
* Calibre.
* Chambre froide.
* Date de début.
* Date de fin.

L'affichage devra être optimisé pour mobile, avec des cartes statistiques et des graphiques adaptés aux petits écrans.

---

# 6.11 Matrice des calibres et des seuils

Un écran spécifique permettra de consulter la matrice des calibres.

Les fonctionnalités pourront inclure :

* Liste des calibres.
* Quantité par calibre.
* Seuils minimum et maximum.
* Alertes en cas de dépassement ou de niveau faible.
* Filtrage par variété ou période.

Les données devront être récupérées depuis le système existant.

---

# 6.12 Registre des Palox et historique

L'application devra permettre de consulter le registre des Palox.

Pour chaque enregistrement :

* Identifiant.
* Variété.
* Calibre.
* Chambre froide.
* Emplacement.
* Date de réception.
* Statut.

L'utilisateur devra pouvoir accéder à l'historique des opérations associées.

Les mouvements pourront inclure :

* Réception.
* Affectation.
* Déplacement.
* Modification.
* Sortie du stock.

---

# 6.13 Télémétrie IoT

Une section devra être prévue pour l'intégration des données IoT.

Selon les équipements disponibles, elle pourra afficher :

* Température.
* Humidité.
* État des capteurs.
* Alertes.
* Historique des mesures.

Cette fonctionnalité dépendra de l'existence d'une API ou d'une infrastructure IoT permettant de transmettre les données à l'application.

L'application devra donc être conçue de manière à pouvoir intégrer ce module sans nécessiter une refonte complète.

---

# 6.14 Notifications et alertes

L'application pourra recevoir des notifications concernant :

* Une chambre froide.
* Un seuil dépassé.
* Un problème de télémétrie.
* Une capacité presque atteinte.
* Un événement important lié au stock.

Les notifications push devront être préparées dans l'architecture de l'application.

L'activation effective dépendra du backend et du service de notifications choisi.

---

# 7. Interface utilisateur

L'application devra reprendre l'identité visuelle générale de la solution existante tout en étant adaptée à une utilisation mobile.

Principes :

* Interface moderne.
* Navigation simple.
* Accès rapide aux opérations principales.
* Boutons suffisamment grands pour une utilisation sur le terrain.
* Informations importantes immédiatement visibles.
* Design responsive pour smartphone et tablette.
* Cohérence avec les couleurs et l'identité graphique de la solution web.

---

# 8. Structure de navigation proposée

## Navigation principale

Les sections principales pourront être :

* Accueil.
* Stock.
* Réception.
* Recherche.
* Statistiques.
* Profil.

## Navigation secondaire

Depuis ces sections, l'utilisateur pourra accéder à :

* Détails d'un Palox.
* Détails d'une chambre froide.
* Détails d'un emplacement.
* Filtres.
* Registre.
* Matrice des calibres.
* Télémétrie IoT.
* Paramètres.

---

# 9. API et intégration avec la solution existante

L'application mobile ne devra pas dupliquer inutilement la logique métier déjà présente dans la solution existante.

Elle devra communiquer avec un backend/API centralisé.

Les éléments suivants devront être disponibles ou développés côté backend :

* Authentification.
* Gestion des utilisateurs.
* Liste des Palox.
* Création d'un Palox.
* Consultation d'un Palox.
* Variétés.
* Calibres.
* Chambres froides.
* Emplacements.
* Statistiques.
* Historique et mouvements.
* Données IoT, si applicable.

Avant le démarrage du développement mobile, une analyse technique de l'API existante devra être réalisée.

---

# 10. Exigences de sécurité

L'application devra intégrer les mesures suivantes :

* Communication sécurisée via HTTPS.
* Gestion sécurisée des jetons d'authentification.
* Stockage sécurisé des informations sensibles.
* Gestion de l'expiration des sessions.
* Contrôle des accès selon les rôles.
* Validation des données envoyées par l'utilisateur.
* Gestion des erreurs sans exposition d'informations sensibles.

---

# 11. Gestion des erreurs

L'application devra informer clairement l'utilisateur en cas de :

* Absence de connexion Internet.
* Erreur serveur.
* Session expirée.
* Données invalides.
* Emplacement indisponible.
* Échec lors de l'enregistrement d'un Palox.
* Droits insuffisants.

Des messages compréhensibles devront être affichés.

---

# 12. Mode hors connexion

Une analyse devra déterminer si certaines fonctionnalités doivent fonctionner sans connexion Internet.

Si cette option est retenue, l'application pourra permettre :

* Consultation des dernières données synchronisées.
* Enregistrement temporaire de certaines opérations.
* Synchronisation automatique lorsque la connexion est rétablie.

Cette fonctionnalité devra être étudiée séparément car elle peut augmenter significativement la complexité du projet.

---

# 13. Performances

L'application devra être optimisée afin de :

* Charger rapidement les listes.
* Gérer efficacement les données volumineuses.
* Utiliser un système de pagination pour les grands registres.
* Mettre en cache certaines données.
* Éviter les appels API inutiles.
* Assurer une navigation fluide.

---

# 14. Tests et validation

Avant livraison, les éléments suivants devront être testés :

* Authentification.
* Navigation.
* Consultation du stock.
* Recherche et filtres.
* Réception d'un Palox.
* Validation des emplacements.
* Synchronisation avec l'API.
* Statistiques.
* Gestion des erreurs.
* Compatibilité Android.
* Compatibilité iOS.
* Tests sur smartphone.
* Tests sur tablette.

Une phase de recette sera prévue avec le client.

---

# 15. Livrables

À la fin du projet, les livrables comprendront :

* Le code source complet de l'application React Native CLI.
* Une architecture de projet organisée et documentée.
* L'application Android de test.
* La version iOS, sous réserve des accès et comptes nécessaires.
* La documentation d'installation du projet.
* La documentation de configuration.
* La documentation des variables d'environnement nécessaires.
* Une version prête à être publiée, sous réserve de validation.
* La correction des anomalies identifiées durant la phase de recette prévue au contrat.

---

# 16. Éléments à fournir par le client

Avant ou pendant le développement, le client devra fournir :

* Accès à l'API existante.
* Documentation API.
* Environnement de test.
* Identifiants de test.
* Liste des rôles utilisateurs.
* Règles métier relatives aux Palox.
* Règles de capacité des chambres froides.
* Règles de gestion des emplacements.
* Données nécessaires aux statistiques.
* Accès aux services IoT, si disponibles.
* Identité graphique et logo.
* Comptes Google Play et Apple Developer pour la publication.

---

# 17. Fonctionnalités non incluses par défaut

Sauf mention explicite dans le devis, les éléments suivants ne sont pas inclus :

* Refonte complète du backend existant.
* Création d'une nouvelle infrastructure serveur.
* Développement du système IoT.
* Achat et installation de capteurs.
* Maintenance illimitée.
* Ajout de nouvelles fonctionnalités après validation du cahier des charges.
* Frais des services tiers.
* Frais Google Play.
* Frais Apple Developer.
* Hébergement serveur.
* Abonnements API ou services cartographiques payants.

Toute fonctionnalité supplémentaire devra faire l'objet d'une estimation complémentaire.

# Conclusion

L'objectif est de créer une application mobile professionnelle permettant aux équipes des Vergers des Vallonières de gérer et consulter efficacement les opérations liées aux Palox et aux chambres froides, directement depuis un smartphone ou une tablette.

L'application sera développée avec React Native CLI afin de disposer d'une base de code unique pour Android et iOS, tout en restant connectée à l'infrastructure et aux données de la solution existante.

Les fonctionnalités exactes dépendront de la validation finale du périmètre ainsi que des capacités techniques du backend et des API actuellement disponibles.
