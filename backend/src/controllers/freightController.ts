import { Request, Response, NextFunction } from 'express';
import pool from '../models/FreightData';
import { processFile } from '../services/fileService';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;
  
      if (!file || !mapping) {
        res.status(400).json({ error: 'File and mapping are required' });
        return;
      }
  
      const result = await processFile(file.path, file.originalname, mapping);
      res.json({ message: 'File processed successfully!', inserted: result.inserted, errors: result.errors });
    } catch (err) {
      next(err);
    }
  };

export const getMappings = (req: Request, res: Response): void => {
  res.json({
    standardFields: [
      'origin_port', 'destination_port', 'carrier', 'container_type',
      'ocean_freight_rate', 'effective_date', 'expiry_date', 'service',
      'transit_duration', 'commodity', 'remarks', 'agent', 'si_cut',
      'departure_date', 'arrival_date'
    ],
  });
};

export const getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM freight_rates');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
