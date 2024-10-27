import { DataSource } from 'typeorm';

// Configura la connessione al database SQLite
export const dbConnection = new DataSource({
  type: 'sqlite',
  database: './db/veramo.sqlite', // Specifica il percorso del database SQLite
  synchronize: true, // Sincronizza lo schema del database
  entities: [], // Non serve specificare le entità, le gestisce internamente Veramo
});

// Funzione per inizializzare la connessione
export async function initializeDBConnection() {
  try {
    await dbConnection.initialize(); // Inizializza la connessione
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Error during Data Source initialization", error);
    throw error;
  }
}

