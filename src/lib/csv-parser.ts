import Papa from 'papaparse'
import { normalizeRow } from './normalizer'
import type { CRMRow } from './types'

export function parseCSV(raw: string): CRMRow[] {
  const result = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
  })

  return result.data
    .map(normalizeRow)
    .filter(row => row.taskName.length > 0)
}
