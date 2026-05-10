## Context

Le projet est un dashboard CRM 100 % client-side (Next.js 15, App Router, `output: 'export'`). Aucun backend n'existe ; toutes les données transitent par le navigateur et sont persistées en localStorage via Zustand. Le point de départ est un fichier CSV exporté manuellement depuis un CRM source. L'application est en lecture seule : elle analyse sans modifier.

Les trois fonctionnalités à implémenter — import CSV, nettoyage et KPIs Flash — constituent le socle du MVP. Sans elles, aucune autre fonctionnalité n'est utilisable.

## Goals / Non-Goals

**Goals:**

- Permettre l'upload d'un fichier CSV via l'interface (drag & drop ou sélecteur).
- Parser le CSV avec PapaParse en mappant chaque ligne vers `CRMRow`.
- Normaliser les données brutes : montants (supprimer `€`, convertir `,` → `.`), dates (ISO ou format FR), statuts (minuscules, trim), tags (split sur `|`).
- Stocker les données nettoyées dans le store Zustand `pipeline` avec persistance localStorage.
- Afficher deux KPI cards en haut de page : montant total pipeline (€) et nombre de deals actifs.

**Non-Goals:**

- Validation stricte du schéma CSV (erreurs de colonnes manquantes tolérées avec valeur par défaut).
- Support multi-fichiers ou fusion de plusieurs CSV.
- Édition des données après import.
- Historisation automatique des snapshots (Phase 3).
- Backend, base de données, ou API CRM.

## Decisions

### D1 — PapaParse en mode `header: true`

**Choix :** Utiliser `Papa.parse(file, { header: true, skipEmptyLines: true })` côté client (FileReader). Les noms de colonnes CSV sont utilisés directement comme clés d'objet.

**Raison :** PapaParse est déjà dans la stack définie dans CLAUDE.md. Le mode `header: true` évite une indexation fragile par numéro de colonne. `skipEmptyLines` prévient les lignes vides en fin de fichier.

**Alternative écartée :** Parsing manuel ligne par ligne — trop fragile face aux virgules dans les valeurs et aux guillemets CSV.

### D2 — Normalisation en couche séparée (`normalizer.ts`)

**Choix :** Le parsing CSV (`csv-parser.ts`) retourne un `Record<string, string>[]` brut. Un second module `normalizer.ts` transforme chaque ligne en `CRMRow` typé.

**Raison :** Séparation des responsabilités — le parser ne connaît pas les règles métier. La normalisation est testable unitairement sans avoir besoin d'un vrai fichier CSV.

**Alternative écartée :** Tout dans un seul fichier — couplage fort, difficile à tester.

### D3 — Store Zustand unique `pipeline` avec `persist`

**Choix :** Un seul store `usePipelineStore` expose `rows: CRMRow[]` et `setRows(rows: CRMRow[])`. Le middleware `persist` sérialise en localStorage. Les dates (`Date | null`) sont sérialisées en ISO string et désérialisées au rechargement.

**Raison :** Simple, conforme à l'architecture définie. L'utilisateur retrouve son dernier import après rechargement de la page.

**Alternative écartée :** State React local dans le composant — pas de persistance entre rechargements.

### D4 — KPIs calculés via `useMemo`, jamais stockés

**Choix :** Le montant total pipeline et le nombre de deals actifs sont calculés à la volée dans le composant via `useMemo(() => …, [rows])`. Pas de stockage dans le store.

**Raison :** Les KPIs sont une projection des données — les dupliquer dans le store crée un risque de désynchronisation. Conforme à la règle « KPIs sont des sélecteurs calculés via useMemo, jamais stockés » dans CLAUDE.md.

## Risks / Trade-offs

- **[Risque] Format CSV non standard** : le CSV source peut avoir des noms de colonnes légèrement différents (casse, espaces, accents).
  → Mitigation : mapping flexible avec lookup case-insensitive sur les noms de colonnes connus ; valeur par défaut `""` / `0` / `null` si colonne absente.

- **[Risque] Montants malformés** : valeurs comme `"32.000"` (séparateur milliers) vs `"32,000"` (décimal FR).
  → Mitigation : supprimer tous les espaces et points avant le dernier séparateur décimal ; tester sur les exemples du PRD.

- **[Risque] Sérialisation des dates dans localStorage** : `Date` n'est pas JSON-serializable nativement.
  → Mitigation : le reviver Zustand `persist` reconvertit les strings ISO en objets `Date` au chargement.

- **[Trade-off] Pas de validation stricte du CSV** : un CSV avec colonnes manquantes produit des `CRMRow` avec des valeurs par défaut silencieuses plutôt qu'une erreur bloquante.
  → Choix délibéré pour maximiser la tolérance aux exports imparfaits.
