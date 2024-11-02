import { agent } from './setup-agent';
import { VerifiableCredential } from '@veramo/core';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { bigIntToStringLE } from './helpers/bigIntToString';
import { ensureUserDid } from './user-did-setup';

function cleanString(value: string): string {
  return value.replace(/\0/g, '').trim(); // Rimuove '\x00' e spazi vuoti
}

// Funzione per creare un hash unico per la VC basato sui contenuti
function generateUniqueHash(data: object): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Funzione per creare la VC auto-attestata dello studente
export async function createStudentVC() {
  try {
    const publicPath = path.join(__dirname, '../circuits/proofs/public.json');
    const proofPath = path.join(__dirname, '../circuits/proofs/proof.json');

    if (!fs.existsSync(publicPath) || !fs.existsSync(proofPath)) {
      throw new Error('I file public.json o proof.json non esistono nei percorsi specificati.');
    }

    const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    const nome = cleanString(bigIntToStringLE(BigInt(publicSignals[0])));
    const matricola = cleanString(bigIntToStringLE(BigInt(publicSignals[3])));
    const data = cleanString(bigIntToStringLE(BigInt(publicSignals[1])));
    const importo = cleanString(bigIntToStringLE(BigInt(publicSignals[2])));

    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));

    // Ottieni o crea il DID dell'utente
    const userDid = await ensureUserDid();

    // Crea il contenuto della credenziale
    const credentialContent = {
      issuer: { id: userDid.did },
      credentialSubject: {
        id: userDid.did,
        name: nome,
        matricola: matricola,
        date: data,
        amount: importo,
        currency: 'EUR',
      },
      issuanceDate: new Date().toISOString(),
    };

    // Genera un hash unico per garantire l'unicità nel database
    const uniqueHash = generateUniqueHash(credentialContent);

    // VC auto-attestata per lo studente con hash unico
    const studentVC: VerifiableCredential = await agent.createVerifiableCredential({
      credential: {
        ...credentialContent,
        id: uniqueHash, // Usare hash unico come ID per garantire l'unicità
      },
      proofFormat: 'jwt',
      proof: {
        type: 'zkSNARK',
        proofPurpose: 'assertionMethod',
        created: new Date().toISOString(),
        verificationMethod: userDid.did,
        proofValue: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c,
          protocol: 'groth16',
          curve: 'bn128',
        },
        publicSignals: publicSignals,
      },
      save: true,
    });

    console.log('Student VC created with JWT:', studentVC);
    return studentVC;
  } catch (error) {
    console.error('Error creating Student VC:', error);
    throw error;
  }
}









