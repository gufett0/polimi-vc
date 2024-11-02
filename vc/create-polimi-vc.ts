// create-simulated-vc.ts
import jwt from 'jsonwebtoken';

/**
 * Crea una Verifiable Credential simulata per Polimi.
 * La VC viene firmata manualmente senza usare Veramo.
 * @param studentDid - DID dello studente
 * @param email - Email dello studente
 * @param dkimPubKey - Chiave pubblica DKIM del dominio
 * @returns Il token JWT rappresentante la VC
 */
export async function createSimulatedPolimiVC(studentDid: string, email: string, dkimPubKey: string): Promise<string> {
  // Struttura della Verifiable Credential
  const polimiVC = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"],
    "issuer": "did:emaildomain:polimi.it",
    "credentialSubject": {
    //   "id": studentDid,
      "email": email,
      "dkimPubKey": dkimPubKey,
    },
    "issuanceDate": new Date().toISOString(),
    "purpose": "Attestazione dell'autenticità dell'email dello studente"
  };

  // Firma la VC con una chiave statica (esempio, non usata per la produzione)
  const privateKey = "chiave-privata-dummy"; // Chiave privata simulata per firma fittizia
  const jwtToken = jwt.sign(polimiVC, privateKey, { algorithm: 'HS256' });

  console.log('Polimi VC JWT:', jwtToken);
  return jwtToken;
}
