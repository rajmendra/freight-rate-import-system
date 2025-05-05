import fs from 'fs'
import path from 'path'
import csv from 'csv-parse'
import xlsx from 'xlsx'
import pool from '../config/db'
import { validateRecord } from '../utils/validator'
import { FreightRate } from '../common/types'

type Mapping = Record<string, keyof FreightRate>

export const processFile = async (
  filePath: string,
  originalName: string,
  mapping: Mapping
): Promise<{ inserted: number; errors: { row: number; messages: string[] }[] }> => {
  const ext = path.extname(originalName).toLowerCase()
  let rawRows: any[]

  if (ext === '.csv') {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    rawRows = await parseCSV(fileContent)
  } else if (ext === '.xlsx') {
    rawRows = parseXLSX(filePath)
  } else {
    throw new Error(`Unsupported file type: ${ext}`)
  }

  const mapped: FreightRate[] = rawRows.map((row) =>
    Object.entries(mapping).reduce<Partial<FreightRate>>((acc, [src, dest]) => {
      acc[dest] = row[src]
      return acc
    }, {}) as FreightRate
  )

  const valid: FreightRate[] = [];
  const errors: { row: number; messages: string[] }[] = [];

  mapped.forEach((rec, i) => {
    const recErrors = validateRecord(rec)
    if (recErrors.length){
      errors.push({ row: i + 1, messages: recErrors });
    }
    else {
      valid.push(rec);
    }
  })
  if (errors.length) {
    throw new Error(
      `VALIDATION_ERRORS:${JSON.stringify(errors)}`
    )
  }
  await insertRecords(valid)
  fs.unlinkSync(filePath)

  return { inserted: valid.length, errors }
}

const parseCSV = (data: string): Promise<any[]> =>
  new Promise((resolve, reject) =>
    csv.parse(data, { columns: true, trim: true }, (err, out) =>
      err ? reject(err) : resolve(out)
    )
  )

const parseXLSX = (filePath: string): any[] => {
  const wb = xlsx.readFile(filePath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return xlsx.utils.sheet_to_json(sheet)
}

const insertRecords = async (records: FreightRate[]): Promise<void> => {
  const client = await pool.connect()
  try {
    const sql = `
      INSERT INTO freight_rates (
        origin_port, destination_port, carrier, container_type,
        ocean_freight_rate, effective_date, expiry_date, service,
        transit_duration, commodity, remarks, agent, si_cut,
        departure_date, arrival_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, NOW(), NOW()
      )
      ON CONFLICT (
        carrier, origin_port, destination_port, container_type, effective_date
      ) DO UPDATE SET
        ocean_freight_rate = EXCLUDED.ocean_freight_rate,
        expiry_date       = EXCLUDED.expiry_date,
        updated_at        = NOW()
    `

    for (const rec of records) {
      const {
        origin_port,
        destination_port,
        carrier,
        container_type,
        ocean_freight_rate,
        effective_date,
        expiry_date,
        service,
        transit_duration,
        commodity,
        remarks,
        agent,
        si_cut,
        departure_date,
        arrival_date,
      } = rec

      await client.query(sql, [
        origin_port,
        destination_port,
        carrier,
        container_type,
        ocean_freight_rate,
        effective_date,
        expiry_date,
        service,
        transit_duration,
        commodity,
        remarks,
        agent,
        si_cut,
        departure_date,
        arrival_date,
      ])
    }
  } finally {
    client.release()
  }
}
