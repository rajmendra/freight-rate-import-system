
````markdown
# 🚢 Freight Rate Import System

A web app to upload, map, validate, and store freight rate data from `.csv` and `.xlsx` files.

---

## 📋 Prerequisites

- **Node.js** v16+  
- **npm**  
- **PostgreSQL** database server  

---

## 🔧 Setup & Run

### 1. Clone the project

```bash
git clone https://your-repo-url.git
cd freight-rate-import-system
````

---

### 2. Backend

```bash
cd backend
npm install
```

1. **Configure your database**:

   * Create a PostgreSQL database (e.g. `freight_rates_db`).
   * In `backend/.env`, set:

     ```env
     DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database_name>
     ```

2. **Create the `freight_rates` table** (run this SQL in your database):

   ```sql
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
   ```

3. **Start the backend**:

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000/api/freight`.

---

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Vite will serve the app (usually at `http://localhost:5173`).

---

## 🚀 Usage

1. Open the frontend URL in your browser.
2. Click **Import file**.
3. Select your `.csv` or `.xlsx` file.
4. Review the **auto-matched** columns.
5. For any **unmatched** columns, choose the corresponding database field from the dropdown.
6. Click **Process Shipments**.
7. On success, the table will refresh with the newly imported records.

---

## 🛠️ Commands Summary

```bash
# Clone
git clone https://your-repo-url.git
cd freight-rate-import-system

# Backend
cd backend
npm install
# configure .env
# run SQL to create table
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## 📄 Standard Fields

These are the database columns you can map to:

```
shipment_id, origin_port, destination_port, carrier, container_type,
ocean_freight_rate, effective_date, expiry_date, service,
transit_duration, commodity, remarks, agent, si_cut,
departure_date, arrival_date
```

Follow the on-screen prompts to map your file's headers to these fields.

---

If all steps are followed correctly, file uploads and imports should work seamlessly. Enjoy! 🎉
"# ffreight-rate-import-xystem" 
