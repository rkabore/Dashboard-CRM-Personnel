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

export interface CRMRow {
  taskName: string
  status: CRMStatus
  dateCreated: Date | null
  dueDate: Date | null
  startDate: Date | null
  assignee: string
  priority: 'high' | 'medium' | 'low'
  tags: string[]
  montantDeal: number
}
