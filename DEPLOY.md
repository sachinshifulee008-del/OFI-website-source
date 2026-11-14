# Running OFI locally

The project uses the bundled SQLite database at `db/custom.db`; no Supabase
project or database credentials are required for local development.

## Start the app

Install dependencies and generate Prisma Client:

```bash
npm install
npm run db:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default
`DATABASE_URL=file:../db/custom.db` is in `.env.example`.

## Optional: deploy on Vercel

The app can be imported into Vercel from GitHub. Include `db/custom.db` in the
repository and set `DATABASE_URL=file:../db/custom.db` in Vercel. The app copies
the bundled database to `/tmp` for serverless reads. Do not commit `.env`.

This workspace has not been deployed to Vercel.
