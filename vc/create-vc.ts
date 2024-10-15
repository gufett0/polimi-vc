import { agent } from '../circuits/scripts/setup-agent'; // Importa l'agente configurato
import { VerifiableCredential } from '@veramo/core'; // Veramo VC type

// Funzione per creare una Verifiable Credential
export async function createVC() {
  const userDid = await agent.didManagerGet({ did: 'did:ethr:your-did' }); // DID dell'utente come issuer

  const verifiableCredential: VerifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: userDid.did }, // L'utente diventa l'issuer
      credentialSubject: {
        id: userDid.did, // L'utente è anche il soggetto della credenziale
        name: 'John Doe',
        matricola: '10123456',
        IUV: '000000123456789',
        amount: '500.00',
        currency: 'EUR',
      },
    },
    proof: {
      type: "zkSNARK", // Prova zk-SNARK per dimostrare l'asserto
      proofPurpose: "assertionMethod", // L'utente asserisce la validità della sua dichiarazione
      created: new Date().toISOString(), // Data di creazione della credenziale
      verificationMethod: userDid.did, // Il DID dell'utente come metodo di verifica
      proofValue: {
        pi_a: ["0x123...", "0x456..."], // La prova zk-SNARK generata dal circuito
        pi_b: [["0x789...", "0xabc..."], ["0xdef...", "0xghi..."]],
        pi_c: ["0x123...", "0x456..."],
        protocol: "groth16",
        curve: "bn128"
      },
      publicSignals: [
        "0x456...", "0x789..." // I segnali pubblici del circuito zk-SNARK
      ],
    },
    save: true,
  });

  console.log('Verifiable Credential creata:', verifiableCredential);
  return verifiableCredential;
}