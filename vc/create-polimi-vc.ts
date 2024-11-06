// create-simulated-vc.ts
import { VerifiableCredential } from '@veramo/core';
import jwt from 'jsonwebtoken';
const path = require("path");
const fs = require("fs");

/**
 * Crea una Verifiable Credential simulata per Polimi.
 * La VC viene firmata manualmente senza usare Veramo.
 * @param studentDid - DID dello studente
 * @param email - Email dello studente
 * @param dkimPubKey - Chiave pubblica DKIM del dominio
 * @returns Il token JWT rappresentante la VC
 */
export async function createSimulatedPolimiVC(studentDid: string, email: string, dkimPubKey: string): Promise<VerifiableCredential> {
  // Struttura della Verifiable Credential
  const polimiVC = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"],
    "issuer": "did:emaildomain:polimi.it",
    "credentialSubject": {
      "id": studentDid,
      "email": email,
      "issuer_dkimPubKey": dkimPubKey,
    },
    "issuanceDate": new Date().toISOString(),
    "purpose": "Attestazione delle credenziali accademiche con verifica dell’origine istituzionale"
  };

  // Firma la VC con una chiave statica (esempio, non usata per la produzione)

  // Leggi la chiave privata nel formato PEM
  const privateKey = fs.readFileSync(path.resolve(__dirname, 'private_key.pem'), 'utf-8');

  const jwtToken = jwt.sign(polimiVC, privateKey, { algorithm: 'RS256' });

  const polimiVCWithProof = {
    ...polimiVC, // Mantiene tutti i campi della VC originale
    proof: {
      type: "JwtProof2020",
      jwt: jwtToken // Inserisci il JWT generato
    }
  };

  console.log('Polimi VC with Proof:', polimiVCWithProof);
  return polimiVCWithProof;

}
