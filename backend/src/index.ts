import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import freightRoutes from './routes/freightRoutes';

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
async function startServer() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('Postgres connection OK — starting server');
    app.use('/api/freight', freightRoutes);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err: any) {
    console.error('Failed to connect to Postgres:', err.message);
    process.exit(1);
  }
}

startServer();