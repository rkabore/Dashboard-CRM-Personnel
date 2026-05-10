# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Objectif du projet

Application web légère de suivi hebdomadaire des prospects et clients. Elle transforme un export CSV brut en un dashboard d'aide à la décision (pipeline, alertes d'échéances, entonnoir de conversion). Usage personnel uniquement — pas d'authentification, pas de facturation, lecture seule.

## Architecture globale

Stack 100 % client-side, zéro backend :

| Rôle | Technologie |
|------|-------------|
| Framework | Next.js 15 (App Router, `output: 'export'`) |
| UI | Ant Design v5 + `@ant-design/nextjs-registry` |
| Graphiques | Recharts |
| État | Zustand (middleware `persist` → localStorage) |
| Parsing CSV | PapaParse |
| Langage | TypeScript |
| Tests | Playwright (`@playwright/test`) |

Toutes les données restent dans le navigateur (localStorage). Le build produit un dossier `out/` déployable statiquement sur Vercel/Netlify/GitHub Pages.

Les pages Next.js (`app/`) peuvent rester Server Components. Tout composant utilisant FileReader, localStorage ou des hooks React/Zustand doit être marqué `"use client"`.

## Commandes

```bash
# Installation
npm create next-app@latest . --typescript --app --no-tailwind --src-dir
npm install antd @ant-design/icons @ant-design/nextjs-registry recharts zustand papaparse
npm install --save-dev @types/papaparse @playwright/test
npx playwright install chromium

# Développement
npm run dev          # http://localhost:3000

# Build & prévisualisation
npm run build        # génère out/
npx serve out/       # vérification locale

# Tests
npm test                          # tous les tests
npm run test:unit                 # tests unitaires (Node, sans navigateur)
npm run test:e2e                  # tests E2E (Chromium)
npx playwright test tests/unit/csv-parser.test.ts   # un seul fichier
npx playwright test --grep "upload CSV"             # un seul test par nom

# Déploiement
npx vercel --prod
```

Scripts à ajouter dans `package.json` :
```json
"test": "playwright test",
"test:unit": "playwright test --project=unit",
"test:e2e": "playwright test --project=e2e"
```

## Feature flags (variables d'environnement)

Copier `.env.example` en `.env.local`. Les variables `NEXT_PUBLIC_ENABLE_PHASE2` et `NEXT_PUBLIC_ENABLE_PHASE3` activent les phases 2 et 3 de la roadmap. Les probabilités du pipeline pondéré (`NEXT_PUBLIC_PROB_*`) sont configurables ici ou via les sliders du simulateur (Phase 3).

## Modèle de données clé

```typescript
// src/lib/types.ts
interface CRMRow {
  taskName: string
  status: CRMStatus          // 'prospect' | 'qualifié' | 'négociation' | 'gagné - en cours' | 'à relancer'
  dateCreated: Date | null
  dueDate: Date | null
  startDate: Date | null
  assignee: string
  priority: 'high' | 'medium' | 'low'
  tags: string[]             // split sur '|'
  montantDeal: number        // en €, 0 si absent
}
```

Trois stores Zustand indépendants : `pipeline.ts` (données courantes), `filters.ts` (filtres actifs), `history.ts` (snapshots hebdomadaires persistés). Les KPIs sont des sélecteurs calculés via `useMemo`, jamais stockés.

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP
- Préférer les composants Ant Design existants avant d'ajouter une nouvelle bibliothèque UI

## Tests interface graphique

À la fin de chaque développement impliquant l'interface graphique, tester avec **playwright-skill** : l'interface doit être responsive, fonctionnelle et répondre au besoin développé.

## Context7

Utiliser systématiquement Context7 (MCP `mcp__context7__resolve-library-id` + `mcp__context7__query-docs`) pour toute génération de code faisant appel à une bibliothèque, toute étape de configuration/installation, et toute consultation de documentation d'API — sans attendre une demande explicite.

## Spécifications — Langue

Les spécifications OpenSpec (sections `purpose` et `scenarios`) sont rédigées en **français**. Les titres de Requirement utilisent l'**anglais** avec les mots-clés `SHALL`/`MUST`.

## Documentation

- Cahier des charges (PRD) : [PRD.md](./PRD.md)
- Architecture technique : [ARCHITECTURE.md](./ARCHITECTURE.md)
