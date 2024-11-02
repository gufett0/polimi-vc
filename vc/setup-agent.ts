import { createAgent, IDIDManager, IKeyManager, IDataStore, ICredentialPlugin } from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getPolimiDidResolver } from './did/did-resolver';
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations, DataStore, DataStoreORM } from '@veramo/data-store';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { dbConnection, initializeDBConnection } from './db/db-connection.mjs';
import dotenv from 'dotenv';

dotenv.config();

const KMS_SECRET_KEY = process.env.KMS_SECRET_KEY || '0';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '0';

console.log(".ENV: ", KMS_SECRET_KEY, INFURA_PROJECT_ID);

async function setupDatabase() {
  try {
    await dbConnection.initialize();
    console.log("Database connection initialized");
    
    await dbConnection.runMigrations();
    console.log("Database migrations applied successfully");
  } catch (error) {
    console.error("Error applying migrations:", error);
    throw error;
  }
}

// Inizializza il database prima della creazione dell'agente
await setupDatabase();

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & ICredentialPlugin>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:sepolia',
      providers: {
        'did:ethr:sepolia': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'sepolia',
          rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...getPolimiDidResolver(),
      }),
    }),
    new CredentialPlugin(),
    new DataStore(dbConnection), // Aggiunge il supporto per la memorizzazione delle VC
    new DataStoreORM(dbConnection), // Aggiunge il supporto ORM per le query
  ],
});

// Funzione per pulire i DID dal database
export async function clearDIDs() {
  try {
    const dids = await agent.didManagerFind({});
    for (const did of dids) {
      await agent.didManagerDelete({ did: did.did });
      console.log(`DID eliminato: ${did.did}`);
    }
    console.log('Pulizia completata con successo.');
  } catch (error) {
    console.error('Errore durante la pulizia dei DID:', error);
    throw error;
  }
}



