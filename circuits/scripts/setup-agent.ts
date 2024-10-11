import { createAgent, ICredentialIssuer, IDIDManager, IKeyManager, TAgent } from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { DIDManager } from '@veramo/did-manager';
import { CredentialIssuer } from '@veramo/credential-w3c';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store';
import { KeyManagementSystem } from '@veramo/kms-local';
import { SecretBox } from '@veramo/kms-local';
import { DataSource } from 'typeorm';
import { getResolver } from 'ethr-did-resolver';
import { initializeDBConnection } from '../../../db/db-connection';
import * as fs from 'fs';
import * as path from 'path';

// Inizializza il database prima di configurare l'Agent
initializeDBConnection().then(() => {
  console.log('Database connected');

// Imposta una chiave segreta per crittografare e decrittografare le chiavi private
const secretKey = '32_byte_secret_key_for_encryption';

// Configurazione del database SQLite per memorizzare DIDs e chiavi
const dbConnection = new DataSource({
  type: 'sqlite',
  database: './db/veramo.sqlite',
  synchronize: true,
  entities: [],
});

// Inizializza il keyStore e il PrivateKeyStore
const privateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(secretKey));
const keyStore = new KeyStore(dbConnection); // Questo viene passato a KeyManager

// Configura l'Agent di Veramo con DID Manager, Key Manager e Credential Issuer
const agent: TAgent<IDIDManager & IKeyManager & ICredentialIssuer> = createAgent({
  plugins: [
    new KeyManager({
      store: keyStore, // Memorizzazione delle chiavi
      kms: {
        local: new KeyManagementSystem(privateKeyStore), // Uso del PrivateKeyStore per la gestione delle chiavi crittografate
      },
    }),
    new DIDManager({
      defaultProvider: 'did:ethr',
      store: new DIDStore(dbConnection),
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'sepolia',
          rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        }),
      },
    }),
    
    new DIDResolverPlugin({
      resolver: getResolver({
        networks: [
          { name: 'mainnet', rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID' },
        ],
      }) as any, // Casting temporaneo per risolvere eventuali problemi di tipo
    }),
  ],
});

// Funzione per creare un DID
async function createDID() {
  const identifier = await agent.didManagerCreate({
    provider: 'did:ethr',
    alias: 'your-identifier-alias',
  });
  console.log('Nuovo DID creato:', identifier);
}

//Verifico se il DID è valido
async function verifyDID(){
  const didDocument = await agent.resolveDid({
    didUrl: 'did:ethr:student-did',
  });
  console.log('DID Document:', didDocument);
  }

/// Funzione per creare una Verifiable Credential
async function createVC() {
  const issuer = await agent.didManagerGet({ did: 'did:ethr:your-did' }); // Recupera il DID dell'issuer
  
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: issuer.did }, // Utilizza un DID esistente
      credentialSubject: {
        id: 'did:ethr:subject-did', // Assicurati che questo sia un DID valido
        name: 'John Doe',
        matricola: '10123456',
        IUV: '000000123456789',
        amount: '500.00',
        currency: 'EUR',
      },
    },
    //proofFormat: 'jwt',
    proof: {
      type: "zkSNARK",
      proofPurpose: "assertionMethod",
      created: "2023-10-10T10:00:00Z",
      verificationMethod: "did:ethr:0x75y...dji#functionsignature",
      proofValue: {
        pi_a: ["0x123...", "0x456..."],
        pi_b: [["0x789...", "0xabc..."], ["0xdef...", "0xghi..."]],
        pi_c: ["0x123...", "0x456..."],
        protocol: "groth16",
        curve: "bn128"
      },
    },
    save: true,
  });

  console.log('Verifiable Credential creata:', verifiableCredential);
}


// Chiamate per testare
createDID().then(() => {
  createVC();
});

});
