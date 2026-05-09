# Architecture — Dashboard CRM Personnel

## 1. Vue d'ensemble

Application web de suivi commercial personnel, transformant un export CSV en dashboard d'aide à la décision. Aucun serveur, aucune authentification, lecture seule. Toutes les données restent dans le navigateur.

### Principes

- **Stateless côté serveur** : zéro backend, zéro API, zéro base de données.
- **Persistence locale** : `localStorage` uniquement, via Zustand `persist`.
- **Déploiement statique** : sortie `out/` deployable sur Netlify, GitHub Pages ou Vercel.

---

## 2. Stack Technique

| Rôle | Technologie | Justification |
|------|-------------|---------------|
| Framework | **Next.js 15** (App Router) | Structure de pages, routing, export statique |
| UI | **Ant Design v5** | Composants riches (Table, Upload, Statistic, Slider) |
| Graphiques | **Recharts** | FunnelChart first-party, API JSX déclarative |
| État | **Zustand** | Persist middleware natif pour localStorage |
| Parsing CSV | **PapaParse** | Gestion des encodages français, tags pipe-séparés |
| Langage | **TypeScript** | Typage du modèle de données CRM |

---

## 3. Configuration Next.js

L'application est 100% client-side. Next.js est configuré en mode export statique.

```js
// next.config.js
const nextConfig = {
  output: 'export',       // génère out/ statique — pas de serveur Node requis
  trailingSlash: true,    // compatibilité GitHub Pages / Netlify
  images: {
    unoptimized: true,    // next/image n'est pas compatible avec output: 'export'
  },
}
module.exports = nextConfig
```

**Règle `"use client"`** : tout composant utilisant des APIs navigateur (FileReader, localStorage, canvas) ou des hooks React/Zustand doit être marqué `"use client"`. Les `page.tsx` peuvent rester Server Components si ils ne font que composer des composants client.

**Anti-FOUC Ant Design** : le package `@ant-design/nextjs-registry` est requis dans `layout.tsx` pour injecter les styles CSS-in-JS côté serveur et éviter le flash de styles au chargement.

---

## 4. Modèle de Données

### Interface principale

```typescript
// src/lib/types.ts
export interface CRMRow {
  taskName: string
  status: CRMStatus
  dateCreated: Date | null
  dueDate: Date | null
  startDate: Date | null
  assignee: string
  priority: 'high' | 'medium' | 'low'
  tags: string[]           // split sur '|'
  montantDeal: number      // en €, 0 si absent
}

export type CRMStatus =
  | 'prospect'
  | 'qualifié'
  | 'négociation'
  | 'gagné - en cours'
  | 'à relancer'

export const STATUS_ORDER: CRMStatus[] = [
  'prospect',
  'qualifié',
  'négociation',
  'gagné - en cours',
  'à relancer',
]
```

### Colonnes CSV source → champs normalisés

| Colonne CSV | Champ TypeScript | Transformation |
|-------------|-----------------|----------------|
| `Task Name` | `taskName` | Trim |
| `Status` | `status` | Lowercase + trim |
| `Date Created` | `dateCreated` | Parse ISO ou DD/MM/YYYY → Date |
| `Due Date` | `dueDate` | Idem |
| `Start Date` | `startDate` | Idem |
| `Assignees` | `assignee` | Trim |
| `Priority` | `priority` | Lowercase |
| `Tags` | `tags` | Split `\|` + trim |
| `Montant Deal` | `montantDeal` | Supprime `€`, ` `, remplace `,`→`.`, parseFloat |

---

## 5. State Management (Zustand)

Trois stores indépendants. Les composants s'abonnent uniquement aux slices dont ils ont besoin.

### `src/stores/pipeline.ts` — Données courantes
Contient les `CRMRow[]` issus du dernier import CSV. Les KPIs sont des **sélecteurs calculés** (non stockés) pour rester en sync automatiquement.

```typescript
interface PipelineStore {
  rows: CRMRow[]
  setRows: (rows: CRMRow[]) => void
}
```

Sélecteurs dérivés (utilisés via `useMemo` dans les composants ou via `useShallow`) :
- `totalPipeline` : somme de `montantDeal` sur tous les deals
- `activeDeals` : count des statuts hors `'à relancer'`
- `byStatus` : `Record<CRMStatus, { count: number; total: number }>`

### `src/stores/filters.ts` — Filtres actifs
```typescript
interface FiltersStore {
  assignee: string | null
  tags: string[]
  setAssignee: (a: string | null) => void
  setTags: (t: string[]) => void
  reset: () => void
}
```

### `src/stores/history.ts` — Historique hebdomadaire (Phase 3)
Persisté en `localStorage` sous la clé `crm-weekly-history`.

```typescript
interface WeeklySnapshot {
  importedAt: string    // ISO 8601
  rows: CRMRow[]
}

interface HistoryStore {
  snapshots: WeeklySnapshot[]
  addSnapshot: (rows: CRMRow[]) => void
  clearHistory: () => void
}
```

Implémentation avec middleware `persist` :
```typescript
export const useHistory = create(
  persist<HistoryStore>(
    (set) => ({
      snapshots: [],
      addSnapshot: (rows) => set((s) => ({
        snapshots: [...s.snapshots, { importedAt: new Date().toISOString(), rows }],
      })),
      clearHistory: () => set({ snapshots: [] }),
    }),
    {
      name: 'crm-weekly-history',
      skipHydration: true,   // évite les erreurs SSR
    }
  )
)
```
Les composants appellent `useEffect(() => useHistory.persist.rehydrate(), [])` au montage.

---

## 6. Structure du Projet

```
projetC/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # AntdRegistry + ConfigProvider (fr-FR)
│   │   ├── page.tsx                # Redirect → /dashboard
│   │   ├── dashboard/page.tsx      # Vue pipeline (Phase 1 & 2)
│   │   ├── history/page.tsx        # Comparaison hebdomadaire (Phase 3)
│   │   └── simulator/page.tsx      # Simulateur what-if (Phase 3)
│   ├── components/
│   │   ├── upload/
│   │   │   └── CsvUploader.tsx     # "use client" — AntD Upload drag & drop
│   │   ├── kpi/
│   │   │   └── KpiCards.tsx        # "use client" — 4× AntD Statistic
│   │   ├── charts/
│   │   │   ├── PipelineBar.tsx     # "use client" — BarChart par statut
│   │   │   ├── FunnelChart.tsx     # "use client" — Entonnoir conversion (Phase 2)
│   │   │   └── TrendLine.tsx       # "use client" — Évolution pipeline (Phase 3)
│   │   └── filters/
│   │       └── FilterBar.tsx       # "use client" — Select assigné + MultiSelect tags
│   ├── stores/
│   │   ├── pipeline.ts
│   │   ├── history.ts
│   │   └── filters.ts
│   └── lib/
│       ├── types.ts                # CRMRow, CRMStatus, STATUS_ORDER
│       ├── csv-parser.ts           # PapaParse wrapper + normalisation
│       ├── kpi.ts                  # weightedForecast(), stagnationScore()
│       └── dates.ts                # isOverdue(), formatDate()
├── next.config.js
├── package.json
├── tsconfig.json
├── crm_prospects_demo.csv
└── PRD.md
```

---

## 7. Routing des Pages

| Route | Fichier | Phase | Description |
|-------|---------|-------|-------------|
| `/` | `app/page.tsx` | 1 | Redirect vers `/dashboard` |
| `/dashboard` | `app/dashboard/page.tsx` | 1 & 2 | Upload, KPIs, graphiques, filtres |
| `/history` | `app/history/page.tsx` | 3 | Comparaison semaine N vs N-1 |
| `/simulator` | `app/simulator/page.tsx` | 3 | Simulateur what-if taux conversion |

---

## 8. Composants Clés

### `CsvUploader`
- AntD `Upload` en mode `beforeUpload` (retourne `false` pour bloquer l'envoi HTTP).
- Lit le fichier via `FileReader` → passe la string à `csv-parser.ts`.
- Met à jour `pipeline.setRows()` et appelle `history.addSnapshot()`.

### `KpiCards`
Quatre métriques AntD `Statistic` en `Row` / `Col` :
1. Total pipeline (€)
2. Deals actifs (hors "à relancer")
3. Deals gagnés (statut `gagné - en cours`)
4. Montant moyen par deal

### `PipelineBar`
`BarChart` Recharts avec `STATUS_ORDER` en axe X. Deux barres : volume (nombre) et valeur (€) — axes Y distincts (`YAxis yAxisId`).

### `FunnelChart` (Phase 2)
`FunnelChart` Recharts avec statuts ordonnés `prospect → qualifié → négociation → gagné - en cours`. Données : montant total par étape. Affiche la déperdition en % entre chaque étape.

### `FilterBar`
- `Select` assigné (valeurs extraites depuis `rows`)
- `Select` mode `multiple` pour les tags (toutes les valeurs uniques extraites des `tags[]`)
- Bouton reset — appelle `filters.reset()`

Les composants graphiques et KPI lisent les données depuis un **sélecteur filtré** : `useMemo(() => applyFilters(rows, filters), [rows, filters])`.

---

## 9. Logique Métier (`src/lib/`)

### `csv-parser.ts`
```typescript
export function parseCSV(raw: string): CRMRow[]
```
Utilise `Papa.parse` en mode synchrone. Retourne un tableau de `CRMRow` normalisés. Les lignes avec `taskName` vide sont ignorées.

### `kpi.ts` (Phase 3)
```typescript
// Probabilités de conversion par statut (à confirmer — voir point ouvert §10)
export function weightedForecast(rows: CRMRow[], probabilities: StatusProbabilities): number

// Retourne les deals présents dans snapshot N-1 mais pas changés de statut dans N
export function stagnationScore(current: CRMRow[], previous: CRMRow[]): CRMRow[]
```

### `dates.ts`
```typescript
export function isOverdue(row: CRMRow): boolean   // dueDate < aujourd'hui ET statut actif
export function formatDate(d: Date | null): string // DD/MM/YYYY, '' si null
```

---

## 10. Point Ouvert

**Probabilités du pipeline pondéré (Phase 3)**

La fonctionnalité `weightedForecast()` nécessite des probabilités de conversion par statut. Les valeurs standard du secteur sont :

| Statut | Probabilité suggérée |
|--------|---------------------|
| prospect | 10% |
| qualifié | 25% |
| négociation | 60% |
| gagné - en cours | 100% |
| à relancer | 15% |

**Question :** Ces valeurs correspondent-elles à votre réalité commerciale, ou souhaitez-vous les ajuster ? Elles peuvent aussi être rendues configurables via les sliders du simulateur (Phase 3).

---

## 11. Dépendances

```bash
# Initialisation
npm create next-app@latest . --typescript --app --no-tailwind --src-dir

# Dépendances production
npm install antd @ant-design/icons @ant-design/nextjs-registry
npm install recharts
npm install zustand
npm install papaparse
npm install --save-dev @types/papaparse
```

---

## 12. Tests (Playwright)

Toute la couverture de test — unitaire et end-to-end — est gérée par **Playwright** (`@playwright/test`).

### Installation

```bash
npm install --save-dev @playwright/test
npx playwright install chromium   # navigateur pour les tests E2E
```

### Structure des tests

```
tests/
├── unit/
│   ├── csv-parser.test.ts     # parseCSV() : normalisation statuts, montants, tags
│   ├── kpi.test.ts            # weightedForecast(), stagnationScore()
│   └── dates.test.ts          # isOverdue(), formatDate()
└── e2e/
    ├── upload.spec.ts         # Upload CSV → données affichées
    ├── dashboard.spec.ts      # KPIs, graphiques, filtres
    ├── overdue.spec.ts        # Alertes échéances dépassées (Phase 2)
    └── history.spec.ts        # Snapshots localStorage (Phase 3)
```

### Tests unitaires (`tests/unit/`)

Les tests unitaires ciblent les fonctions pures de `src/lib/` — aucun navigateur requis. Playwright exécute ces tests en Node.js via `--project=unit`.

```typescript
// tests/unit/csv-parser.test.ts
import { test, expect } from '@playwright/test'
import { parseCSV } from '../../src/lib/csv-parser'

test('normalise les montants avec virgule et symbole €', () => {
  const rows = parseCSV('Task Name,Status,Montant Deal\nTest,prospect,"8 500 €"')
  expect(rows[0].montantDeal).toBe(8500)
})

test('split les tags sur le pipe', () => {
  const rows = parseCSV('Task Name,Status,Tags,Montant Deal\nTest,prospect,SaaS|B2B,0')
  expect(rows[0].tags).toEqual(['SaaS', 'B2B'])
})
```

Données de référence issues de `crm_prospects_demo.csv` :
- Laurent Petit - MediaPlus → 18 500 €, statut `gagné - en cours`, tags `['Marketing', 'Agence']`
- Julien Fournier - PharmaCare → 32 000 €, statut `négociation`
- Gabriel Perrin - FinancePro → 14 200 €, statut `à relancer`

### Tests E2E (`tests/e2e/`)

Les tests E2E démarrent l'application Next.js en mode dev (`npm run dev`) et pilotent un vrai navigateur Chromium.

```typescript
// tests/e2e/upload.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test('upload CSV affiche les KPIs corrects', async ({ page }) => {
  await page.goto('/dashboard')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(path.join(__dirname, '../../crm_prospects_demo.csv'))
  await expect(page.getByTestId('kpi-total-pipeline')).toContainText('€')
  await expect(page.getByTestId('kpi-active-deals')).not.toContainText('0')
})

test('filtre par assigné restreint les données', async ({ page }) => {
  // sélectionne Alexandre Dubois → vérifie que Marie Laurent n'apparaît plus
})
```

### Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  projects: [
    {
      name: 'unit',
      testDir: './tests/unit',
      use: { browserName: undefined },   // tests Node, pas de navigateur
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { baseURL: 'http://localhost:3000', browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Scripts npm

```json
"test": "playwright test",
"test:unit": "playwright test --project=unit",
"test:e2e": "playwright test --project=e2e"
```

---

## 13. Déploiement (Vercel)

Vercel détecte automatiquement `output: 'export'` dans `next.config.js` et traite le projet comme un site statique.

```bash
npm run build        # génère out/
npx serve out/       # vérification locale avant deploy
```

### Mise en production

```bash
npm install --save-dev vercel
npx vercel --prod
```

Ou via connexion Git : pousser sur `main` déclenche un déploiement automatique. Vercel attribue une URL de preview pour chaque branche.
