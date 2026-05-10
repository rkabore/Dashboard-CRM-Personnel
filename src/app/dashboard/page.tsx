import { CsvUploader } from '@/components/upload/CsvUploader'
import { KpiCards } from '@/components/kpi/KpiCards'

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ marginBottom: 24, fontSize: '24px', fontWeight: 600 }}>Dashboard CRM</h1>
      <CsvUploader />
      <KpiCards />
    </main>
  )
}
