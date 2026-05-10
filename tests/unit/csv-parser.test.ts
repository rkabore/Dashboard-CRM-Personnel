import { test, expect } from '@playwright/test'
import { parseCSV } from '../../src/lib/csv-parser'

const DEMO_CSV = `Task Name,Status,Date Created,Due Date,Start Date,Assignees,Priority,Tags,Task Content,Montant Deal
Laurent Petit - MediaPlus,gagné - en cours,2025-01-05,,,Marie Laurent,high,Marketing|Agence,"Agence média signée",18500
Julien Fournier - PharmaCare,négociation,2025-01-11,2025-02-14,,Marie Laurent,high,Pharmacie|Santé,"Réseau pharmacies",32000
Gabriel Perrin - FinancePro,à relancer,2025-01-26,2025-02-18,,Marie Laurent,low,Finance|Conseil,"Conseiller financier",14200`

test('parse un CSV valide et retourne le bon nombre de lignes', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows).toHaveLength(3)
})

test('normalise les montants correctement', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows[0].montantDeal).toBe(18500)
  expect(rows[1].montantDeal).toBe(32000)
  expect(rows[2].montantDeal).toBe(14200)
})

test('normalise les statuts en minuscules', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows[0].status).toBe('gagné - en cours')
  expect(rows[1].status).toBe('négociation')
  expect(rows[2].status).toBe('à relancer')
})

test('split les tags sur le pipe', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows[0].tags).toEqual(['Marketing', 'Agence'])
  expect(rows[1].tags).toEqual(['Pharmacie', 'Santé'])
  expect(rows[2].tags).toEqual(['Finance', 'Conseil'])
})

test('normalise les assignés', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows[0].assignee).toBe('Marie Laurent')
})

test('parse les dates ISO correctement', () => {
  const rows = parseCSV(DEMO_CSV)
  expect(rows[0].dateCreated).not.toBeNull()
  expect(rows[0].dateCreated!.getFullYear()).toBe(2025)
})

test('colonnes manquantes → valeurs par défaut', () => {
  const csv = `Task Name,Status\nTest Deal,prospect`
  const rows = parseCSV(csv)
  expect(rows).toHaveLength(1)
  expect(rows[0].montantDeal).toBe(0)
  expect(rows[0].tags).toEqual([])
  expect(rows[0].dateCreated).toBeNull()
  expect(rows[0].dueDate).toBeNull()
})

test('lignes vides ignorées', () => {
  const csv = `Task Name,Status,Montant Deal\nTest,prospect,5000\n\n\n`
  const rows = parseCSV(csv)
  expect(rows).toHaveLength(1)
})

test('lignes sans Task Name ignorées', () => {
  const csv = `Task Name,Status,Montant Deal\n,prospect,5000\nTest,qualifié,1000`
  const rows = parseCSV(csv)
  expect(rows).toHaveLength(1)
  expect(rows[0].taskName).toBe('Test')
})

test('normalise les montants avec symbole €', () => {
  const csv = 'Task Name,Status,Montant Deal\nTest,prospect,"8 500 €"'
  const rows = parseCSV(csv)
  expect(rows[0].montantDeal).toBe(8500)
})
