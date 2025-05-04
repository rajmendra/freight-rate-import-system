import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';
import xlsx from 'xlsx';
import pool from '../models/FreightData';
import { validateRecord } from '../utils/validator';

export interface FreightRecord {
  origin_port?: string;
  destination_port?: string;
  carrier?: string;
  container_type?: string;
  ocean_freight_rate?: number;
  effective_date?: string;
  expiry_date?: string;
  service?: string;
  transit_duration?: string;
  commodity?: string;
  remarks?: string;
  agent?: string;
  si_cut?: string;
  departure_date?: string;
  arrival_date?: string;
}

export const processFile = async (
    filePath: string,
    originalName: string,
    mapping: { [key: string]: string }
  ): Promise<any> => {
    const ext = path.extname(originalName).toLowerCase();
    let records: any[] = [];
  
    if (ext === '.csv') {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      records = await parseCSV(fileContent);
    } else if (ext === '.xlsx') {
      records = parseXLSX(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
  
    const mappedRecords = records.map((row) => {
      const mapped: any = {};
      Object.keys(mapping).forEach((sourceCol) => {
        mapped[mapping[sourceCol]] = row[sourceCol];
      });
      return mapped;
    });
  
    const validRecords: FreightRecord[] = [];
    const errors: { row: number; messages: string[] }[] = [];
  
    mappedRecords.forEach((rec, index) => {
      const recErrors = validateRecord(rec);
      if (recErrors.length > 0) {
        errors.push({ row: index + 1, messages: recErrors });
      } else {
        validRecords.push(rec);
      }
    });
  
    await insertRecords(validRecords);
    fs.unlinkSync(filePath);
  
    return { inserted: validRecords.length, errors };
  };
const parseCSV = (data: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    csv.parse(data, { columns: true, trim: true }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
};

const parseXLSX = (filePath: string): any[] => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};

const insertRecords = async (records: FreightRecord[]): Promise<void> => {
  const client = await pool.connect();
  try {
    for (const rec of records) {
      await client.query(
        `INSERT INTO freight_rates (
          origin_port, destination_port, carrier, container_type,
          ocean_freight_rate, effective_date, expiry_date, service,
          transit_duration, commodity, remarks, agent, si_cut,
          departure_date, arrival_date, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, NOW(), NOW()
        )
        ON CONFLICT (carrier, origin_port, destination_port, container_type, effective_date)
        DO UPDATE SET
          ocean_freight_rate = EXCLUDED.ocean_freight_rate,
          expiry_date = EXCLUDED.expiry_date,
          updated_at = NOW()`,
        [
          rec.origin_port,
          rec.destination_port,
          rec.carrier,
          rec.container_type,
          rec.ocean_freight_rate,
          rec.effective_date,
          rec.expiry_date,
          rec.service,
          rec.transit_duration,
          rec.commodity,
          rec.remarks,
          rec.agent,
          rec.si_cut,
          rec.departure_date,
          rec.arrival_date
        ]
      );
    }
  } finally {
    client.release();
  }
};
