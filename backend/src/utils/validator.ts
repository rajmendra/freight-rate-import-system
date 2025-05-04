import { FreightRecord } from '../services/fileService';

export const validateRecord = (record: FreightRecord): string[] => {
  const errors: string[] = [];

  if (!record.origin_port) errors.push('origin_port is required');
  if (!record.destination_port) errors.push('destination_port is required');
  if (!record.carrier) errors.push('carrier is required');
  if (record.ocean_freight_rate && isNaN(Number(record.ocean_freight_rate))) {
    errors.push('ocean_freight_rate must be a number');
  }
  if (record.effective_date && isNaN(Date.parse(record.effective_date))) {
    errors.push('effective_date must be a valid date');
  }

  return errors;
};
