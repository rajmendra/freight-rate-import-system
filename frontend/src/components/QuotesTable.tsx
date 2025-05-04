import React, { useEffect, useState } from 'react'
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
  { key: 'created_at',         label: 'Created At'        },
  { key: 'updated_at',         label: 'Updated At'        },
]

export const QuotesTable: React.FC<{ refreshFlag?: number }> = ({ refreshFlag }) => {
  const [rows, setRows] = useState<FreightRow[]>([])

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

  if (!rows.length) {
    return (
      <div className="flex justify-center py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-gray-500">
          No data has been added!
        </div>
      </div>
    )
  }

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

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-7xl w-full overflow-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    className="px-4 py-2 whitespace-nowrap text-gray-800 border-b border-gray-100 hover:bg-gray-50"
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
  )
}
