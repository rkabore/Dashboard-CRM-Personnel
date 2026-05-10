import { test, expect } from '@playwright/test'
import { normalizeMontant, normalizeDate, normalizeStatus, normalizeTags, normalizeRow } from '../../src/lib/normalizer'

test.describe('normalizeMontant', () => {
  test('montant avec symbole euro et virgule décimale', () => {
    expect(normalizeMontant('18 500,00 €')).toBe(18500)
    expect(normalizeMontant('18500,00€')).toBe(18500)
  })

  test('montant numérique simple', () => {
    expect(normalizeMontant('32000')).toBe(32000)
    expect(normalizeMontant('32000.00')).toBe(32000)
  })

  test('montant absent ou vide', () => {
    expect(normalizeMontant('')).toBe(0)
    expect(normalizeMontant('   ')).toBe(0)
  })

  test('valeur non parseable', () => {
    expect(normalizeMontant('N/A')).toBe(0)
    expect(normalizeMontant('TBD')).toBe(0)
  })

  test('montant PRD — MediaPlus 18500', () => {
    expect(normalizeMontant('18500')).toBe(18500)
  })

  test('montant PRD — PharmaCare 32000', () => {
    expect(normalizeMontant('32000')).toBe(32000)
  })

  test('montant PRD — FinancePro 14200', () => {
    expect(normalizeMontant('14200')).toBe(14200)
  })
})

test.describe('normalizeDate', () => {
  test('date au format ISO YYYY-MM-DD', () => {
    const d = normalizeDate('2024-03-15')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
    expect(d!.getMonth()).toBe(2)
    expect(d!.getDate()).toBe(15)
  })

  test('date au format français DD/MM/YYYY', () => {
    const d = normalizeDate('15/03/2024')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2024)
    expect(d!.getMonth()).toBe(2)
    expect(d!.getDate()).toBe(15)
  })

  test('date absente', () => {
    expect(normalizeDate('')).toBeNull()
    expect(normalizeDate('   ')).toBeNull()
  })

  test('date invalide', () => {
    expect(normalizeDate('not-a-date')).toBeNull()
    expect(normalizeDate('32/13/2024')).toBeNull()
  })

  test('date CSV demo — Sophie Martin', () => {
    const d = normalizeDate('2025-01-15')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2025)
    expect(d!.getMonth()).toBe(0)
    expect(d!.getDate()).toBe(15)
  })
})

test.describe('normalizeStatus', () => {
  test('statut reconnu avec casse mixte', () => {
    expect(normalizeStatus('Qualifié')).toBe('qualifié')
    expect(normalizeStatus(' QUALIFIÉ ')).toBe('qualifié')
  })

  test('statut multi-mots', () => {
    expect(normalizeStatus('Gagné - en cours')).toBe('gagné - en cours')
    expect(normalizeStatus('gagné - en cours')).toBe('gagné - en cours')
  })

  test('à relancer', () => {
    expect(normalizeStatus('à relancer')).toBe('à relancer')
    expect(normalizeStatus('À Relancer')).toBe('à relancer')
  })

  test('statut inconnu → prospect', () => {
    expect(normalizeStatus('inconnu')).toBe('prospect')
    expect(normalizeStatus('')).toBe('prospect')
  })

  test('tous les statuts du PRD couverts', () => {
    expect(normalizeStatus('prospect')).toBe('prospect')
    expect(normalizeStatus('qualifié')).toBe('qualifié')
    expect(normalizeStatus('négociation')).toBe('négociation')
    expect(normalizeStatus('gagné - en cours')).toBe('gagné - en cours')
    expect(normalizeStatus('à relancer')).toBe('à relancer')
  })
})

test.describe('normalizeTags', () => {
  test('tags multiples séparés par pipe', () => {
    expect(normalizeTags('SaaS|B2B')).toEqual(['SaaS', 'B2B'])
    expect(normalizeTags('Marketing|Agence')).toEqual(['Marketing', 'Agence'])
  })

  test('tag unique', () => {
    expect(normalizeTags('Pharmacie')).toEqual(['Pharmacie'])
  })

  test('tags absents', () => {
    expect(normalizeTags('')).toEqual([])
    expect(normalizeTags('   ')).toEqual([])
  })
})

test.describe('normalizeRow — données PRD', () => {
  test('Laurent Petit - MediaPlus (gagné)', () => {
    const row = normalizeRow({
      'Task Name': 'Laurent Petit - MediaPlus',
      'Status': 'gagné - en cours',
      'Montant Deal': '18500',
      'Tags': 'Marketing|Agence',
      'Assignees': 'Marie Laurent',
      'Priority': 'high',
      'Date Created': '2025-01-05',
      'Due Date': '',
      'Start Date': '',
    })
    expect(row.taskName).toBe('Laurent Petit - MediaPlus')
    expect(row.status).toBe('gagné - en cours')
    expect(row.montantDeal).toBe(18500)
    expect(row.tags).toEqual(['Marketing', 'Agence'])
    expect(row.assignee).toBe('Marie Laurent')
    expect(row.priority).toBe('high')
  })

  test('Julien Fournier - PharmaCare (négociation)', () => {
    const row = normalizeRow({
      'Task Name': 'Julien Fournier - PharmaCare',
      'Status': 'négociation',
      'Montant Deal': '32000',
      'Tags': 'Pharmacie|Santé',
      'Priority': 'high',
      'Assignees': 'Marie Laurent',
      'Date Created': '2025-01-11',
      'Due Date': '2025-02-14',
      'Start Date': '',
    })
    expect(row.montantDeal).toBe(32000)
    expect(row.status).toBe('négociation')
    expect(row.tags).toEqual(['Pharmacie', 'Santé'])
  })

  test('Gabriel Perrin - FinancePro (à relancer)', () => {
    const row = normalizeRow({
      'Task Name': 'Gabriel Perrin - FinancePro',
      'Status': 'à relancer',
      'Montant Deal': '14200',
      'Tags': 'Finance|Conseil',
      'Priority': 'low',
      'Assignees': 'Marie Laurent',
      'Date Created': '2025-01-26',
      'Due Date': '2025-02-18',
      'Start Date': '',
    })
    expect(row.montantDeal).toBe(14200)
    expect(row.status).toBe('à relancer')
    expect(row.tags).toEqual(['Finance', 'Conseil'])
  })

  test('colonnes manquantes → valeurs par défaut', () => {
    const row = normalizeRow({ 'Task Name': 'Test', 'Status': 'prospect' })
    expect(row.montantDeal).toBe(0)
    expect(row.tags).toEqual([])
    expect(row.dateCreated).toBeNull()
    expect(row.dueDate).toBeNull()
    expect(row.priority).toBe('medium')
  })
})
