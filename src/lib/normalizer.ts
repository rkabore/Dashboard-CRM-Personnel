import type { CRMRow, CRMStatus } from './types'

const VALID_STATUSES: CRMStatus[] = [
  'prospect',
  'qualifié',
  'négociation',
  'gagné - en cours',
  'à relancer',
]

export function normalizeMontant(raw: string): number {
  if (!raw || !raw.trim()) return 0
  // Remove €, spaces, then normalize decimal separator
  const withoutSymbols = raw.replace(/[€\s]/g, '')
  // Handle French thousands separator (.) vs decimal (,)
  // e.g. "18.500,00" → "18500.00", "18500,00" → "18500.00"
  const hasComma = withoutSymbols.includes(',')
  const normalized = hasComma
    ? withoutSymbols.replace(/\./g, '').replace(',', '.')
    : withoutSymbols
  const result = parseFloat(normalized)
  return isNaN(result) ? 0 : result
}

export function normalizeDate(raw: string): Date | null {
  if (!raw || !raw.trim()) return null

  // ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw.trim())) {
    const d = new Date(raw.trim())
    return isNaN(d.getTime()) ? null : d
  }

  // French format DD/MM/YYYY
  const frMatch = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (frMatch) {
    const [, day, month, year] = frMatch
    const d = new Date(`${year}-${month}-${day}`)
    return isNaN(d.getTime()) ? null : d
  }

  return null
}

export function normalizeStatus(raw: string): CRMStatus {
  const normalized = raw.trim().toLowerCase() as CRMStatus
  return VALID_STATUSES.includes(normalized) ? normalized : 'prospect'
}

export function normalizeTags(raw: string): string[] {
  if (!raw || !raw.trim()) return []
  return raw.split('|').map(t => t.trim()).filter(t => t.length > 0)
}

export function normalizePriority(raw: string): 'high' | 'medium' | 'low' {
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
    return normalized
  }
  return 'medium'
}

function findColumn(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const found = Object.keys(row).find(
      k => k.trim().toLowerCase() === key.toLowerCase()
    )
    if (found !== undefined) return row[found] ?? ''
  }
  return ''
}

export function normalizeRow(raw: Record<string, string>): CRMRow {
  return {
    taskName: findColumn(raw, ['task name', 'taskname']).trim(),
    status: normalizeStatus(findColumn(raw, ['status'])),
    dateCreated: normalizeDate(findColumn(raw, ['date created', 'datecreated'])),
    dueDate: normalizeDate(findColumn(raw, ['due date', 'duedate'])),
    startDate: normalizeDate(findColumn(raw, ['start date', 'startdate'])),
    assignee: findColumn(raw, ['assignees', 'assignee']).trim(),
    priority: normalizePriority(findColumn(raw, ['priority'])),
    tags: normalizeTags(findColumn(raw, ['tags'])),
    montantDeal: normalizeMontant(findColumn(raw, ['montant deal', 'montantdeal', 'montant'])),
  }
}
