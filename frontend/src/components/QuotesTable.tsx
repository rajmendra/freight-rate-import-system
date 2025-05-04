import React, { useEffect, useState, useMemo } from 'react'
import { getRecords } from '../services/api'

interface FreightRow {
  id: number
  origin_port: string | null
  destination_port: string | null
  carrier: string | null
  container_type: string | null
  ocean_freight_rate: string | null
  effective_date: string | null
  expiry_date: string | null
  service: string | null
  transit_duration: string | null
  commodity: string | null
  remarks: string | null
  agent: string | null
  si_cut: string | null
  departure_date: string | null
  arrival_date: string | null
  created_at: string
  updated_at: string
}

const columns: { key: keyof FreightRow; label: string }[] = [
  { key: 'id',                 label: 'ID'                },
  { key: 'origin_port',        label: 'Origin Port'       },
  { key: 'destination_port',   label: 'Destination Port'  },
  { key: 'carrier',            label: 'Carrier'           },
  { key: 'container_type',     label: 'Container Type'    },
  { key: 'ocean_freight_rate', label: 'Freight Rate'      },
  { key: 'effective_date',     label: 'Effective Date'    },
  { key: 'expiry_date',        label: 'Expiry Date'       },
  { key: 'service',            label: 'Service'           },
  { key: 'transit_duration',   label: 'Transit Duration'  },
  { key: 'commodity',          label: 'Commodity'         },
  { key: 'remarks',            label: 'Remarks'           },
  { key: 'agent',              label: 'Agent'             },
  { key: 'si_cut',             label: 'SI Cut'            },
  { key: 'departure_date',     label: 'Departure Date'    },
  { key: 'arrival_date',       label: 'Arrival Date'      },
]

type SortConfig = {
  key: keyof FreightRow
  direction: 'asc' | 'desc'
} | null

export const QuotesTable: React.FC<{ refreshFlag?: number }> = ({ refreshFlag }) => {
  const [rows, setRows] = useState<FreightRow[]>([])
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const pageSize = 10

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getRecords()
        setRows(res.data)
      } catch {
        setRows([])
      }
    })()
  }, [refreshFlag])

  const formatDate = (iso: string | null): string => {
    if (!iso) return '–'
    const d = new Date(iso)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`
  }

  const formatCell = (key: keyof FreightRow, value: any) => {
    if (key.endsWith('_date') || key === 'created_at' || key === 'updated_at') {
      return formatDate(value)
    }
    return value ?? '–'
  }

  const filtered = useMemo(() => {
    return rows.filter(row =>
      columns.some(col => {
        const cell = row[col.key]
        return cell?.toString().toLowerCase().includes(searchText.toLowerCase())
      })
    )
  }, [rows, searchText])

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered
    const { key, direction } = sortConfig
    return [...filtered].sort((a, b) => {
      const aVal = a[key] ?? ''
      const bVal = b[key] ?? ''
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const requestSort = (key: keyof FreightRow) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIndicator = (key: keyof FreightRow) => {
    if (!sortConfig || sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
  }

  if (!rows.length) {
    return (
      <div className="flex justify-center py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-500">
          No data has been added!
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 bg-gray-100">
      <div className="w-full max-w-7xl px-4 mb-4">
        <input
          type="text"
          placeholder="Search…"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="max-w-7xl w-full px-4 overflow-x-auto">
        <div className="bg-white rounded-md shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide border-b border-gray-200 cursor-pointer select-none whitespace-nowrap"
                  >
                    {col.label}{getSortIndicator(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {pageRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columns.map(col => (
                    <td
                      key={col.key as string}
                      className="px-6 py-4 text-sm text-gray-800 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {formatCell(col.key, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm text-gray-700">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
