import { agent } from './setup-agent';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { PrivateKey } from '@veramo/data-store';
import { ManagedKeyInfo, MinimalImportableKey } from '@veramo/core-types';

dotenv.config();

export async function ensureUserDid() {
  try {
    // Trova tutti i DID con l'alias 'userDid' ed elimina quelli esistenti
    const existingDids = await deleteExistingDids();

    // Recupera la chiave privata dal file .env e crea un wallet Ethereum
    const privateKey = process.env.KMS_SECRET_KEY as string;
    const wallet = new ethers.Wallet(privateKey);
    const expectedAddress = wallet.address.toLowerCase();
    const did = `did:ethr:sepolia:${wallet.address}`;

    console.log(`Indirizzo Ethereum atteso: ${expectedAddress}`);

    // Importa la chiave privata nel Key Manager dell'agente
    const importedKey = await importKey(privateKey);

    // Seleziona tra creazione e importazione del DID, evitando duplicati
    const newDid = await getOrCreateDid(did, wallet.address, importedKey);
    console.log(`Nuovo DID creato o trovato: ${newDid.did}`);
    return newDid;
  } catch (error) {
    console.error("Errore durante l'ottenimento o la creazione del DID:", error);
    throw error;
  }
}

async function deleteExistingDids() {
  const existingDids = await agent.didManagerFind({ alias: 'userDid' });
  for (const did of existingDids) {
    try {
      console.log(`Eliminazione del DID esistente: ${did.did}`);
      await agent.didManagerDelete({ did: did.did });
    } catch (deleteError) {
      if (deleteError instanceof Error) {
        console.warn(`Errore durante l'eliminazione del DID ${did.did}:`, deleteError.message);
      } else {
        console.warn(`Errore sconosciuto durante l'eliminazione del DID ${did.did}`);
      }
    }
  }
  return existingDids;
}

async function importKey(privateKey: string) {
  const importedKey = await agent.keyManagerImport({
    type: 'Secp256k1',
    kms: 'local',
    privateKeyHex: privateKey,
  });
  console.log(`Chiave importata con kid: ${importedKey.kid}`);
  const minimalKey: MinimalImportableKey = {
    type: importedKey.type,
    kms: importedKey.kms,
    privateKeyHex: privateKey,
  };
  return minimalKey;
}

async function getOrCreateDid(did: string, address: string, key: MinimalImportableKey) {
  const importArgs = {
    did,
    alias: 'userDid',
    provider: 'did:ethr:sepolia',
    controllerKeyId: address,
    keys: [key],
    services: [] as never[],
  };

  // Cerca o crea un nuovo DID
  return agent.didManagerImport(importArgs);
}







  
  