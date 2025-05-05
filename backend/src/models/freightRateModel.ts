import pool from '../config/db';
import { FreightRate } from '../common/types'
export async function initFreightRatesTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.freight_rates (
      id SERIAL PRIMARY KEY,
      origin_port VARCHAR,
      destination_port VARCHAR,
      carrier VARCHAR,
      container_type VARCHAR,
      ocean_freight_rate NUMERIC,
      effective_date TIMESTAMPTZ,
      expiry_date TIMESTAMPTZ,
      service VARCHAR,
      transit_duration VARCHAR,
      commodity VARCHAR,
      remarks TEXT,
      agent VARCHAR,
      si_cut TIMESTAMPTZ,
      departure_date TIMESTAMPTZ,
      arrival_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (carrier, origin_port, destination_port, container_type, effective_date)
    );
  `)
}

export async function fetchAll(): Promise<FreightRate[]> {
  const { rows } = await pool.query<FreightRate>('SELECT * FROM public.freight_rates')
  return rows
}
