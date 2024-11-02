import { Entities } from '@veramo/data-store';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';

// Configura la connessione al database SQLite

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbConnection = new DataSource({
  type: 'sqlite',
  database: 'db/veramo.sqlite',
  synchronize: false,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
  migrations: ['./dist/db/migrations/*.mjs'],
});

// Function to initialize the database connection only if not already connected
export async function initializeDBConnection() {
  if (!dbConnection.isInitialized) {
    try {
      await dbConnection.initialize();
      console.log("Database connection initialized");
    } catch (error) {
      console.error("Error during Data Source initialization", error);
      throw error;
    }
  } else {
    console.log("Database connection already initialized");
  }
}


