## ADDED Requirements

### Requirement: Affichage du montant total du pipeline
Le dashboard SHALL afficher le montant total en euros de tous les deals présents dans le store `pipeline`, sous forme de KPI card. Ce montant MUST être recalculé via `useMemo` à chaque modification des données et ne MUST jamais être stocké dans le store.

#### Scenario: Calcul après import réussi
- **WHEN** un CSV contenant plusieurs deals est importé
- **THEN** la KPI card affiche la somme des montants de tous les `CRMRow` du store, formatée en euros (ex: `"64 700 €"`)

#### Scenario: Aucune donnée importée
- **WHEN** aucun CSV n'a encore été importé (store vide)
- **THEN** la KPI card affiche `"0 €"` ou un état vide explicite

#### Scenario: Deals à montant nul inclus
- **WHEN** certains deals ont un `montantDeal` égal à `0`
- **THEN** ils sont inclus dans le calcul sans modifier le total (contribution nulle)

### Requirement: Affichage du nombre de deals actifs
Le dashboard SHALL afficher le nombre de deals dont le statut est différent de `"gagné - en cours"`, considérés comme actifs dans le pipeline. Ce décompte MUST être recalculé via `useMemo` à chaque modification des données.

#### Scenario: Comptage après import
- **WHEN** un CSV est importé avec 5 deals dont 2 en statut `"gagné - en cours"`
- **THEN** la KPI card affiche `3` (deals actifs = total minus gagnés)

#### Scenario: Tous les deals sont gagnés
- **WHEN** tous les deals sont en statut `"gagné - en cours"`
- **THEN** la KPI card affiche `0`

#### Scenario: Store vide
- **WHEN** aucun CSV n'a été importé
- **THEN** la KPI card affiche `0`

### Requirement: Mise en page des KPI cards
Les deux KPI cards SHALL être affichées côte à côte en haut de la page principale, au-dessus des graphiques et tableaux. Chaque card MUST utiliser un composant Ant Design `<Card>` et afficher un libellé clair (ex: "Pipeline total", "Deals actifs").

#### Scenario: Affichage responsive
- **WHEN** la page est affichée sur desktop (> 768px)
- **THEN** les deux cards sont sur la même ligne avec espacement uniforme

#### Scenario: Libellés explicites
- **WHEN** les cards sont affichées
- **THEN** chaque card porte un titre descriptif et la valeur est visuellement mise en avant (grande taille de police ou `<Statistic>` Ant Design)
