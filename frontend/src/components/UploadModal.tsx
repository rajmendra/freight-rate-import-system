import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { uploadFile } from '../services/api'

interface UploadModalProps {
  onClose(): void
  onSuccess(insertedCount: number): void
  setNotification(n: { type: 'success' | 'error'; message: string }): void
}

const STANDARD_FIELDS = [
  'shipment_id',
  'origin_port',
  'destination_port',
  'carrier',
  'container_type',
  'ocean_freight_rate',
  'effective_date',
  'expiry_date',
  'service',
  'transit_duration',
  'commodity',
  'remarks',
  'agent',
  'si_cut',
  'departure_date',
  'arrival_date',
] as const

type FieldName = typeof STANDARD_FIELDS[number]

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function autoMatchField(header: string): FieldName | '' {
  const norm = normalizeHeader(header)
  for (const field of STANDARD_FIELDS) {
    const normField = normalizeHeader(field)
    if (norm === normField || norm.includes(normField) || normField.includes(norm)) {
      return field
    }
  }
  return ''
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess, setNotification }) => {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, FieldName | ''>>({})
  const [filterText, setFilterText] = useState('')
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>([])

  useEffect(() => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const workbook = XLSX.read(reader.result as ArrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false })
      const firstRow = rows[0] as string[]
      setHeaders(firstRow)

      const initialMap: Record<string, FieldName | ''> = {}
      firstRow.forEach((h) => {
        initialMap[h] = autoMatchField(h)
      })
      setMapping(initialMap)
    }
    reader.readAsArrayBuffer(file)
  }, [file])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setErrors([])
  }

  const handleMappingChange = (header: string, field: FieldName | '') => {
    setMapping((m) => ({ ...m, [header]: field }))
  }

  const handleUpload = async () => {
    if (!file) {
      setNotification({ type: 'error', message: 'Please choose a file before proceeding.' })
      return
    }

    const form = new FormData()
    form.append('file', file)
    form.append('mapping', JSON.stringify(mapping))

    try {
      const resp = await uploadFile(form)
      const { inserted, errors: uploadErrors } = resp.data
      setErrors(uploadErrors || [])
      onSuccess(inserted)
      setNotification({ type: 'success', message: `${inserted} records imported.` })
    } catch {
      setNotification({ type: 'error', message: 'Upload failed—please try again.' })
    }
  }

  const chosenFields = new Set(Object.values(mapping).filter(Boolean) as FieldName[])
  const allMapped = headers.length > 0 && headers.every(h => !!mapping[h])
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
       
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Import Shipments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <input
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded file:border file:text-sm
                         file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            {file && <div className="mt-2 text-sm text-gray-600">Selected: {file.name}</div>}
          </div>

          {headers.length > 0 && (
            <p className="text-sm text-gray-700">
              We’ve auto-matched common columns. Please review below and map any remaining ones.
            </p>
          )}

          {headers.length > 0 && (
            <div className="flex justify-end">
              <input
                type="text"
                placeholder="Filter columns…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm w-60"
              />
            </div>
          )}

          {headers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CSV Column</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Database Field</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.filter((h) =>
                    h.toLowerCase().includes(filterText.toLowerCase())
                  ).map((header) => (
                    <tr key={header} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">{header}</td>
                      <td className="px-4 py-2">
                        <select
                          value={mapping[header] || ''}
                          onChange={(e) =>
                            handleMappingChange(header, e.target.value as FieldName)
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="">— select field —</option>
                          {STANDARD_FIELDS.map((field) => (
                            <option
                              key={field}
                              value={field}
                              disabled={chosenFields.has(field) && mapping[header] !== field}
                            >
                              {field}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!allMapped}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Process Shipments
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded max-h-48 overflow-y-auto">
              <h4 className="font-semibold mb-2">Import Errors</h4>
              {errors.map((err) => (
                <div key={err.row} className="text-sm mb-1">
                  <span className="font-medium">Row {err.row}:</span> {err.messages.join('; ')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadModal
