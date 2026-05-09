

# Cahier des Charges : Dashboard CRM Personnel

## 1. Vision du Projet

L'objectif est de développer une application web légère pour le suivi hebdomadaire des prospects et clients. L'application transforme un export CSV brut en un outil d'aide à la décision pour identifier les pertes de revenus et piloter la performance commerciale.

### Contraintes Générales

* **Usage :** Personnel uniquement.
* **Authentification :** Aucune (pas de login/password).
* **Paiement :** Aucun mécanisme de facturation ou de souscription.
* **Édition :** L'outil est en **lecture seule** pour l'analyse ; la modification des données se fait dans le CRM source.

---

## 2. Spécifications des Données (Input)

L'application doit accepter un fichier CSV respectant la structure suivante:

* **Task Name :** Nom du prospect/entreprise.
* **Status :** Étapes du tunnel (prospect, qualifié, négociation, gagné - en cours, à relancer).
* **Dates :** `Date Created`, `Due Date`, `Start Date`.
* **Assignees :** Responsable du dossier (ex: Alexandre Dubois, Marie Laurent).
* **Priority :** High, Medium, Low.
* **Tags :** Segments séparés par un pipe (ex: SaaS|B2B).
* **Montant Deal :** Valeur numérique du contrat.

---

## 3. Plan de Développement (Roadmap)

### 🚀 Phase 1 : MVP (Produit Minimum Viable)

*Focus : Visualisation immédiate du pipeline actuel.*

* 
**Import CSV :** Module d'upload et parsing des colonnes clés.


* **Nettoyage :** Normalisation des montants et des dates.
* **KPIs Flash :** Affichage du montant total du pipeline et du nombre de deals actifs.
* **Vue Statut :** Graphique de répartition financière par étape du tunnel de vente.
* **Filtre simple :** Sélecteur par Assigné (Responsable du dossier).

### 📈 Phase 2 : V1 (Analyse de la Friction & Alertes)

*Focus : Comprendre où les clients sont perdus.*

* **Entonnoir de Conversion :** Visualisation de la déperdition (volume et valeur) entre chaque statut.
* 
**Segmentation par Tags :** Filtrage par secteurs (extraits de la colonne `Tags`).


* 
**Focus "À Relancer" :** Section isolant les deals à risque (ex: Chloé Girard - 22 000 €).


* 
**Alertes d'Échéances :** Signalement visuel des dossiers dont la `Due Date` est dépassée.


* **Analyse de Priorité :** Corrélation entre le niveau de priorité et le succès du deal.

### 💎 Phase 3 : V2 (Intelligence & Automatisation)

*Focus : Historisation et prédiction.*

* **Historisation Automatique :** Comparaison de l'import actuel avec le précédent pour mesurer l'évolution hebdomadaire (sans saisie manuelle).
* **Pipeline Pondéré :** Calcul du CA prévisionnel basé sur des probabilités par statut.
* **Score de Stagnation :** Détection automatique des dossiers n'ayant pas changé de statut d'une semaine à l'autre.
* **Simulateur "What-if" :** Curseur interactif pour projeter les gains selon l'amélioration des taux de conversion.

---

## 4. Évolutions Futures & Hors Périmètre

* **Plus tard :** Migration vers une base de données structurée (PostgreSQL) et connexion via API au CRM.
* **Hors Périmètre :** Gestion multi-sources (un seul format CSV accepté), snapshotting manuel, et gestion multi-utilisateurs.

---

## 5. Exemples de Données de Test (Source CSV)

L'agent de codage pourra s'appuyer sur ces exemples pour les tests unitaires:

* 
**Deal Gagné :** Laurent Petit - MediaPlus (18 500 €, Marketing|Agence).


* 
**Deal en Négociation :** Julien Fournier - PharmaCare (32 000 €, Pharmacie|Santé).


* 
**Deal à Relancer :** Gabriel Perrin - FinancePro (14 200 €, Finance|Conseil).