'use client'

import { useRef, useState, useCallback, DragEvent } from 'react'
import { Alert, Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { parseCSV } from '@/lib/csv-parser'
import { usePipelineStore } from '@/stores/pipeline'

export function CsvUploader() {
  const setRows = usePipelineStore(s => s.setRows)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setSuccessMsg(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Seuls les fichiers CSV sont acceptés.')
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = parseCSV(text)
        setRows(rows)
        setSuccessMsg(`${rows.length} deals importés avec succès.`)
      } catch {
        setError('Erreur lors du parsing du fichier CSV.')
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier.')
      setLoading(false)
    }
    reader.readAsText(file, 'UTF-8')
  }, [setRows])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleClick = () => {
    if (!loading) inputRef.current?.click()
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Hidden file input — triggered by click on the drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
        style={{
          border: `2px dashed ${dragging ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: 8,
          padding: '32px 16px',
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: dragging ? '#e6f4ff' : '#fafafa',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <div style={{ fontSize: 48, color: '#1677ff', marginBottom: 8 }}>
          <InboxOutlined />
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 16, color: '#262626' }}>
          {loading ? <Spin /> : 'Cliquez ou déposez un fichier CSV'}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#8c8c8c' }}>
          Format attendu : export CRM avec colonnes Task Name, Status, Montant Deal, etc.
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          data-testid="upload-error"
          style={{ marginTop: 8 }}
        />
      )}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          closable
          onClose={() => setSuccessMsg(null)}
          data-testid="upload-success"
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  )
}
