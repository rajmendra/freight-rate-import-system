export const STANDARD_FIELDS = [
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
  
  export type StandardField = (typeof STANDARD_FIELDS)[number]
  