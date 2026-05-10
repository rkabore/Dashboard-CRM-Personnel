## ADDED Requirements

### Requirement: CSV File Upload Interface
L'interface SHALL proposer un composant d'upload permettant à l'utilisateur de charger un fichier CSV depuis son système de fichiers, par clic ou par drag & drop. Le composant MUST être marqué `"use client"` car il utilise FileReader.

#### Scenario: Upload par sélecteur de fichier
- **WHEN** l'utilisateur clique sur la zone d'upload et sélectionne un fichier `.csv`
- **THEN** le fichier est lu en mémoire et le parsing démarre immédiatement

#### Scenario: Upload par drag & drop
- **WHEN** l'utilisateur dépose un fichier `.csv` sur la zone d'upload
- **THEN** le fichier est accepté et le parsing démarre immédiatement

#### Scenario: Fichier non CSV rejeté
- **WHEN** l'utilisateur tente de déposer ou sélectionner un fichier dont l'extension n'est pas `.csv`
- **THEN** l'upload est rejeté et un message d'erreur indique que seuls les fichiers CSV sont acceptés

### Requirement: CSV Parsing vers CRMRow
Le module de parsing SHALL utiliser PapaParse avec `{ header: true, skipEmptyLines: true }` pour convertir le contenu CSV en tableau de `Record<string, string>`. Chaque enregistrement MUST être transmis au module de normalisation avant stockage.

#### Scenario: Parsing d'un CSV valide
- **WHEN** un fichier CSV avec en-têtes est uploadé
- **THEN** PapaParse retourne un tableau d'objets avec les noms de colonnes comme clés

#### Scenario: Colonnes manquantes tolérées
- **WHEN** le CSV ne contient pas une colonne attendue (ex: `Montant Deal`)
- **THEN** la valeur correspondante dans `CRMRow` prend sa valeur par défaut (`0` pour montant, `null` pour dates, `""` pour strings)

#### Scenario: Lignes vides ignorées
- **WHEN** le CSV contient des lignes vides en fin de fichier
- **THEN** ces lignes sont ignorées et n'apparaissent pas dans le résultat

### Requirement: Stockage dans le store pipeline
Après parsing et normalisation, les données MUST être stockées dans le store Zustand `usePipelineStore` via `setRows()`. Le store MUST utiliser le middleware `persist` pour sauvegarder en localStorage.

#### Scenario: Données persistées après rechargement
- **WHEN** l'utilisateur recharge la page après un import
- **THEN** les données du dernier CSV importé sont restaurées depuis localStorage

#### Scenario: Remplacement complet au nouvel import
- **WHEN** l'utilisateur importe un nouveau fichier CSV
- **THEN** les données précédentes sont entièrement remplacées par les nouvelles
