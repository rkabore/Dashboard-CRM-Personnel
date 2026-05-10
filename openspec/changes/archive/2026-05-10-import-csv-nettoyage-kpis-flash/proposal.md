## Why

Le dashboard CRM n'a actuellement aucune capacité à ingérer des données : sans import CSV, aucune analyse n'est possible. Cette fonctionnalité constitue le socle obligatoire du MVP (Phase 1) — elle débloque toutes les visualisations et tous les KPIs définis dans le cahier des charges.

## What Changes

- Ajout d'un composant d'upload CSV (drag & drop + sélecteur de fichier) côté client.
- Ajout d'un parser CSV basé sur PapaParse qui mappe les colonnes vers `CRMRow`.
- Ajout d'un module de nettoyage : normalisation des montants (suppression symboles `€`, `,` → `.`) et des dates (parsing ISO/FR), et déduction du statut en minuscules normalisé.
- Ajout de deux KPIs Flash affichés en haut du dashboard : **montant total du pipeline** (en €) et **nombre de deals actifs**.
- Persistance des données parsées dans le store Zustand `pipeline` (localStorage).

## Capabilities

### New Capabilities

- `csv-import` : Upload et parsing d'un fichier CSV conforme à la structure CRM (colonnes Task Name, Status, dates, Assignees, Priority, Tags, Montant Deal) vers une liste de `CRMRow`.
- `data-normalization` : Nettoyage et normalisation des données brutes issues du CSV (montants, dates, statuts, tags) avant stockage dans le store.
- `kpis-flash` : Calcul et affichage des indicateurs synthétiques : montant total du pipeline actif et nombre de deals actifs, recalculés à chaque import.

### Modified Capabilities

<!-- Aucune spec existante à modifier — première itération du projet. -->

## Impact

- **Nouveaux fichiers** : `src/components/CsvUploader.tsx`, `src/lib/csv-parser.ts`, `src/lib/normalizer.ts`, `src/components/KpiCard.tsx`, `src/store/pipeline.ts`.
- **Page modifiée** : `app/page.tsx` intègre le composant d'upload et les cartes KPI.
- **Dépendances** : PapaParse (déjà prévu dans l'architecture), Zustand `persist`.
- **Aucune API externe** — tout reste client-side (localStorage).
