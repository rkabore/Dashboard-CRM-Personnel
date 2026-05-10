import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'

export const metadata: Metadata = {
  title: 'Dashboard CRM',
  description: 'Dashboard CRM personnel pour le suivi hebdomadaire des prospects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: '#f5f5f5' }}>
        <AntdRegistry>
          <ConfigProvider locale={frFR}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
