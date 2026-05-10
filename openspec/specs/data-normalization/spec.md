## ADDED Requirements

### Requirement: Normalisation des montants
Le module de normalisation SHALL convertir la valeur brute de la colonne `Montant Deal` en nombre flottant exprimé en euros. Il MUST supprimer les symboles `€`, les espaces, et gérer les deux conventions décimales (`,` FR et `.` EN).

#### Scenario: Montant avec symbole euro et virgule décimale
- **WHEN** la valeur brute est `"18 500,00 €"` ou `"18500,00€"`
- **THEN** le montant normalisé est `18500.00`

#### Scenario: Montant numérique simple
- **WHEN** la valeur brute est `"32000"` ou `"32000.00"`
- **THEN** le montant normalisé est `32000`

#### Scenario: Montant absent ou vide
- **WHEN** la colonne `Montant Deal` est vide ou absente
- **THEN** le montant normalisé est `0`

#### Scenario: Valeur non parseable
- **WHEN** la valeur brute contient du texte non numérique (ex: `"N/A"`, `"TBD"`)
- **THEN** le montant normalisé est `0`

### Requirement: Normalisation des dates
Le module SHALL parser les colonnes `Date Created`, `Due Date` et `Start Date` en objets `Date`. Il MUST supporter les formats ISO 8601 (`YYYY-MM-DD`) et le format français (`DD/MM/YYYY`).

#### Scenario: Date au format ISO
- **WHEN** la valeur est `"2024-03-15"`
- **THEN** la date normalisée est un objet `Date` correspondant au 15 mars 2024

#### Scenario: Date au format français
- **WHEN** la valeur est `"15/03/2024"`
- **THEN** la date normalisée est un objet `Date` correspondant au 15 mars 2024

#### Scenario: Date absente ou invalide
- **WHEN** la colonne de date est vide ou contient une valeur non parseable
- **THEN** la date normalisée est `null`

### Requirement: Normalisation du statut
Le module SHALL mapper la valeur brute de la colonne `Status` vers l'union `CRMStatus` en appliquant une normalisation minuscules + trim. Les valeurs inconnues MUST retourner `'prospect'` par défaut.

#### Scenario: Statut reconnu avec casse mixte
- **WHEN** la valeur brute est `"Qualifié"` ou `" QUALIFIÉ "`
- **THEN** le statut normalisé est `"qualifié"`

#### Scenario: Statut multi-mots reconnu
- **WHEN** la valeur brute est `"Gagné - en cours"` ou `"gagné - en cours"`
- **THEN** le statut normalisé est `"gagné - en cours"`

#### Scenario: Statut inconnu
- **WHEN** la valeur brute ne correspond à aucun statut connu
- **THEN** le statut normalisé est `"prospect"`

### Requirement: Normalisation des tags
Le module SHALL splitter la colonne `Tags` sur le caractère `|` et retourner un tableau de strings trimmées. Une colonne vide MUST retourner un tableau vide `[]`.

#### Scenario: Tags multiples séparés par pipe
- **WHEN** la valeur brute est `"SaaS|B2B"` ou `"Marketing|Agence"`
- **THEN** le tableau normalisé est `["SaaS", "B2B"]` ou `["Marketing", "Agence"]`

#### Scenario: Tag unique
- **WHEN** la valeur brute est `"Pharmacie"`
- **THEN** le tableau normalisé est `["Pharmacie"]`

#### Scenario: Tags absents
- **WHEN** la colonne `Tags` est vide ou absente
- **THEN** le tableau normalisé est `[]`
