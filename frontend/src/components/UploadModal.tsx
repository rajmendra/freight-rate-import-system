import React, { useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'

interface Props {
  onClose: () => void
  setNotification: (n: { type: 'success' | 'error'; message: string }) => void
  onSuccess: (insertedCount: number) => void
}

const standardFields = [
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

type Field = typeof standardFields[number]

const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const findAutoMatch = (header: string): Field | '' => {
  const nh = normalize(header)
  for (const field of standardFields) {
    const nf = normalize(field)
    if (nh === nf || nh.includes(nf) || nf.includes(nh)) {
      return field
    }
  }
  return ''
}

const UploadModal: React.FC<Props> = ({ onClose, setNotification, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, Field | ''>>({})
  const [filter, setFilter] = useState('')
  const [errors, setErrors] = useState<{ row: number; messages: string[] }[]>([])

  // load headers and build initial mapping
  const parseHeaders = (file: File) => {
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      const wb = XLSX.read(data, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const arr = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
      if (arr.length) {
        const hdrs = arr[0]
        setHeaders(hdrs)
        const initial: Record<string, Field | ''> = {}
        hdrs.forEach((h) => {
          initial[h] = findAutoMatch(h)
        })
        setMapping(initial)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const f = e.target.files[0]
    setFile(f)
    parseHeaders(f)
  }

  const handleSelect = (header: string, value: Field | '') => {
    setMapping((m) => ({ ...m, [header]: value }))
  }

  const handleUpload = async () => {
    if (!file) {
      setNotification({ type: 'error', message: 'Please select a file first.' })
      return
    }
    // ensure all required fields are mapped?
    // e.g. check mapping['Origin Port'] !== ''
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))
    try {
      const res = await axios.post('http://localhost:5000/api/freight/upload', formData)
      const { inserted, errors: uploadErrors } = res.data
      setErrors(uploadErrors || [])
      onSuccess(inserted)
    } catch {
      setNotification({ type: 'error', message: 'Upload failed' })
    }
  }

  const chosen = new Set(Object.values(mapping).filter((v) => v) as Field[])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Import Shipments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </header>

        <div className="p-6 space-y-4">
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
          </div>

          {headers.length > 0 && (
            <>    <p className="text-sm text-gray-700">
            We’ve automatically mapped columns for you. Please review them below,
            and select mappings for any that weren’t auto-matched.
          </p>
              <div className="flex justify-between items-center">

          
                <h3 className="font-medium">Map your columns</h3>
                <input
                  type="text"
                  placeholder="Filter headers..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CSV Column</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Map To Field</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {headers
                      .filter((h) => h.toLowerCase().includes(filter.toLowerCase()))
                      .map((h) => (
                        <tr key={h} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-800">{h}</td>
                          <td className="px-4 py-2">
                            <select
                              value={mapping[h] || ''}
                              onChange={(e) => handleSelect(h, e.target.value as Field)}
                              className="w-full border rounded px-2 py-1 text-sm"
                            >
                              <option value="">— select field —</option>
                              {standardFields.map((f) => (
                                <option
                                  key={f}
                                  value={f}
                                  disabled={chosen.has(f) && mapping[h] !== f}
                                >
                                  {f}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Process Shipments
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded max-h-40 overflow-y-auto">
              <h4 className="font-semibold mb-2">Row Errors:</h4>
              {errors.map((err) => (
                <p key={err.row} className="text-sm">
                  <span className="font-medium">Row {err.row}:</span> {err.messages.join(', ')}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadModal
