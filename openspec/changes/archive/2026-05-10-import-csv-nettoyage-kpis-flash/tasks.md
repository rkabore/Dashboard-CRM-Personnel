## 1. Modèle de données et types

- [x] 1.1 Créer `src/lib/types.ts` avec l'interface `CRMRow` et l'union `CRMStatus`
- [x] 1.2 Vérifier que tous les statuts du PRD sont couverts dans `CRMStatus`

## 2. Module de normalisation

- [x] 2.1 Créer `src/lib/normalizer.ts` avec la fonction `normalizeMontant(raw: string): number`
- [x] 2.2 Implémenter `normalizeDate(raw: string): Date | null` supportant ISO et format FR (`DD/MM/YYYY`)
- [x] 2.3 Implémenter `normalizeStatus(raw: string): CRMStatus` avec fallback `'prospect'`
- [x] 2.4 Implémenter `normalizeTags(raw: string): string[]` avec split sur `|`
- [x] 2.5 Implémenter `normalizeRow(raw: Record<string, string>): CRMRow` qui orchestre les fonctions précédentes
- [x] 2.6 Écrire les tests unitaires Playwright pour `normalizer.ts` (cas nominaux + edge cases du PRD)

## 3. Module de parsing CSV

- [x] 3.1 Créer `src/lib/csv-parser.ts` avec la fonction `parseCSV(file: File): Promise<CRMRow[]>`
- [x] 3.2 Configurer PapaParse avec `{ header: true, skipEmptyLines: true }` et lookup case-insensitive des colonnes
- [x] 3.3 Appeler `normalizeRow` sur chaque ligne parsée
- [x] 3.4 Écrire les tests unitaires pour `csv-parser.ts` (CSV valide, colonnes manquantes, lignes vides)

## 4. Store Zustand pipeline

- [x] 4.1 Créer `src/store/pipeline.ts` avec `usePipelineStore` exposant `rows: CRMRow[]` et `setRows(rows: CRMRow[])`
- [x] 4.2 Ajouter le middleware `persist` avec sérialisation des dates en ISO string et désérialisation au rechargement
- [x] 4.3 Vérifier la persistance localStorage après rechargement de page

## 5. Composant d'upload CSV

- [x] 5.1 Créer `src/components/CsvUploader.tsx` (marquer `"use client"`)
- [x] 5.2 Implémenter l'upload par clic (input `type="file"` acceptant `.csv`)
- [x] 5.3 Implémenter le drag & drop avec Ant Design `<Upload>` ou zone native
- [x] 5.4 Rejeter les fichiers non-CSV avec message d'erreur Ant Design `<message>` ou notification
- [x] 5.5 Appeler `parseCSV` puis `setRows` au succès de l'upload
- [x] 5.6 Afficher un indicateur de chargement pendant le parsing

## 6. KPI Cards

- [x] 6.1 Créer `src/components/KpiCard.tsx` avec props `label` et `value` (marquer `"use client"`)
- [x] 6.2 Utiliser le composant Ant Design `<Statistic>` pour l'affichage de la valeur
- [x] 6.3 Calculer `montantTotal` via `useMemo` sur `rows` (somme des `montantDeal`)
- [x] 6.4 Calculer `dealsActifs` via `useMemo` : count des rows dont statut ≠ `'gagné - en cours'`
- [x] 6.5 Formater le montant total en euros (séparateur milliers, symbole `€`)

## 7. Intégration page principale

- [x] 7.1 Modifier `app/page.tsx` pour intégrer `<CsvUploader>` en haut de page
- [x] 7.2 Ajouter les deux `<KpiCard>` côte à côte (layout Ant Design `<Row>` / `<Col>`) sous l'uploader
- [x] 7.3 Vérifier l'affichage responsive (cards sur la même ligne au-dessus de 768px)
- [x] 7.4 Vérifier que les cards affichent `0` / état vide quand le store est vide

## 8. Tests E2E Playwright

- [x] 8.1 Créer `tests/e2e/csv-upload.test.ts` : upload d'un CSV valide → KPIs affichés correctement
- [x] 8.2 Tester le rejet d'un fichier non-CSV
- [x] 8.3 Tester la persistance des KPIs après rechargement de la page
- [x] 8.4 Tester le remplacement complet des données au second upload
