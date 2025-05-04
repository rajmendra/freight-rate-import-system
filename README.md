Thought for a couple of seconds


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
git clone git@github.com:rajmendra/freight-rate-import-system.git
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

## 🧭 How It Works

1. **File Upload**

   * You choose a `.csv` or `.xlsx` file.
   * Example: **rates\_jan.csv** with headers `Origin`, `Dest`, `Rate_20`, `Rate_40`, `Date`.

2. **Header Parsing & Auto-Mapping**

   * The app reads the first row of your file.
   * It normalizes each header (lowercase, strip punctuation) and tries to match it to one of our **standard fields**.
   * Example mapping result:

     ```
     "Origin"      → "origin_port"
     "Dest"        → "destination_port"
     "Rate_20"     → "ocean_freight_rate"
     "Rate_40"     → ""  (no auto‐match)
     "Date"        → "effective_date"
     ```

3. **Manual Mapping**

   * Any header without a confident auto-match appears in a “please map” list.
   * You select from a dropdown of standard fields (no duplicates allowed).
   * Once every header is mapped, the **Process Shipments** button unlocks.

4. **Validation**

   * Each mapped record is checked:

     * Required fields (e.g. `origin_port`, `carrier`) must be present.
     * Numeric fields (e.g. `ocean_freight_rate`) must parse as numbers.
     * Date fields must be valid ISO dates.
   * Invalid rows are skipped, and you see detailed error messages listing row numbers and issues.

5. **Database Insert/Update**

   * Valid records are bulk‐inserted into `freight_rates`.
   * If a record conflicts on `(carrier, origin_port, destination_port, container_type, effective_date)`, its `ocean_freight_rate` and `expiry_date` get updated instead of inserting a duplicate.
   * Example SQL snippet under the hood:

     ```sql
     INSERT INTO freight_rates (...)
     VALUES (...)
     ON CONFLICT (carrier, origin_port, destination_port, container_type, effective_date)
     DO UPDATE SET
       ocean_freight_rate = EXCLUDED.ocean_freight_rate,
       expiry_date       = EXCLUDED.expiry_date,
       updated_at        = NOW();
     ```

6. **Feedback & Display**

   * You receive a success banner: “X records imported.”
   * Any validation errors show in a scrollable box labeled with row numbers.
   * The main table refreshes to display all stored rates, including new or updated entries.

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

```
```
