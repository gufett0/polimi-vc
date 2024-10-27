// setup-agent.ts
import { createAgent, IDIDManager, IKeyManager, IDataStore, ICredentialPlugin } from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getPolimiDidResolver } from './did/did-resolver';  
import { DataSource } from 'typeorm';
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations } from '@veramo/data-store';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_FILE = 'database.sqlite';
const KMS_SECRET_KEY = process.env.KMS_SECRET_KEY || 'your_secret_key_here';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || 'your_infura_project_id_here';

const dbConnection = new DataSource({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
}).initialize();

// Setup agent
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
          rpcUrl: 'https://sepolia.infura.io/v3/' + INFURA_PROJECT_ID,
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...getPolimiDidResolver()  
      }),
    }),
    new CredentialPlugin(),
  ],
});




















