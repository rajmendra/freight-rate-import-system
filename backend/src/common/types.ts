export interface FreightRate {
    id: number
    origin_port: string | null
    destination_port: string | null
    carrier: string | null
    container_type: string | null
    ocean_freight_rate: number | null
    effective_date: Date | null
    expiry_date: Date | null
    service: string | null
    transit_duration: string | null
    commodity: string | null
    remarks: string | null
    agent: string | null
    si_cut: Date | null
    departure_date: Date | null
    arrival_date: Date | null
    created_at: Date
    updated_at: Date
  }