import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  //driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: 'wrangler.toml',
    dbName: 'lucia --local',
  },
  out: './migrations',
  migrations: {
    table: 'migrations',
    //schema: 'public',
  },
  verbose: true,
  strict: true,
})
