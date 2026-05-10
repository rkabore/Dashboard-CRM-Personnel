import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import type { CRMRow } from '../lib/types'

interface PipelineStore {
  rows: CRMRow[]
  setRows: (rows: CRMRow[]) => void
}

function reviveDates(rows: unknown[]): CRMRow[] {
  return (rows as Record<string, unknown>[]).map(row => ({
    ...row,
    dateCreated: row.dateCreated ? new Date(row.dateCreated as string) : null,
    dueDate: row.dueDate ? new Date(row.dueDate as string) : null,
    startDate: row.startDate ? new Date(row.startDate as string) : null,
  })) as CRMRow[]
}

// SSR-safe storage with Date revival
const storage: PersistStorage<PipelineStore> = {
  getItem: (name: string): StorageValue<PipelineStore> | null => {
    if (typeof window === 'undefined') return null
    const str = localStorage.getItem(name)
    if (!str) return null
    const parsed = JSON.parse(str) as StorageValue<PipelineStore>
    if (parsed?.state?.rows) {
      parsed.state.rows = reviveDates(parsed.state.rows as unknown[])
    }
    return parsed
  },
  setItem: (name: string, value: StorageValue<PipelineStore>): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set) => ({
      rows: [],
      setRows: (rows) => set({ rows }),
    }),
    {
      name: 'crm-pipeline',
      storage,
    }
  )
)
