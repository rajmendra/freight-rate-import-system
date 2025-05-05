import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { processFile } from '../services/fileService';
import { STANDARD_FIELDS, StandardField } from '../constants/fields'

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file
    const rawMapping = req.body.mapping

    if (!file || !rawMapping) {
      res.status(400).json({ error: 'Both file and mapping are required.' })
      return
    }

    let mapping: Record<string, StandardField>
    try {
      mapping = JSON.parse(rawMapping)
    } catch {
      res.status(400).json({ error: 'Invalid JSON for mapping.' })
      return
    }

    const { inserted, errors } = await processFile(
      file.path,
      file.originalname,
      mapping
    )

    res.json({
      message: 'File processed successfully!',
      inserted,
      errors,
    })
  } catch (err: any) {
    if (
      typeof err.message === 'string' &&
      err.message.startsWith('VALIDATION_ERRORS:')
    ) {
      const raw = err.message.slice('VALIDATION_ERRORS:'.length)
      let details: { row: number; messages: string[] }[] = []
    
      details = JSON.parse(raw)
    
      res.status(400).json({
        error: `Please fix the ${details.length} validation error(s).`,
        details,
      })
      return
    }

    next(err)
  }
}

export const getMappings = (_req: Request, res: Response): void => {
  res.json({ standardFields: STANDARD_FIELDS })
}

export const getRecords = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rows } = await pool.query('SELECT * FROM freight_rates order by id desc')
    res.json(rows)
  } catch (err) {
    next(err)
  }
}