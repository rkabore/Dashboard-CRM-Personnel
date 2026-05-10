'use client'

import { useEffect, useMemo } from 'react'
import { Card, Col, Row, Statistic } from 'antd'
import { usePipelineStore } from '@/stores/pipeline'

const EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function KpiCards() {
  const rows = usePipelineStore(s => s.rows)

  // Trigger rehydration from localStorage after SSR mount
  useEffect(() => {
    usePipelineStore.persist.rehydrate()
  }, [])

  const montantTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.montantDeal, 0),
    [rows]
  )

  const dealsActifs = useMemo(
    () => rows.filter(r => r.status !== 'gagné - en cours').length,
    [rows]
  )

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12}>
        <Card>
          <div data-testid="kpi-total-pipeline">
            <Statistic
              title="Pipeline total"
              value={EUR.format(montantTotal)}
            />
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card>
          <div data-testid="kpi-active-deals">
            <Statistic
              title="Deals actifs"
              value={dealsActifs}
            />
          </div>
        </Card>
      </Col>
    </Row>
  )
}
