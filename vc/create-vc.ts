import { agent } from '../circuits/scripts/setup-agent'; // Importa l'agente configurato
import { VerifiableCredential } from '@veramo/core'; // Veramo VC type

// Funzione per creare una Verifiable Credential
export async function createVC() {
  const issuer = await agent.didManagerGet({ did: 'did:ethr:your-did' }); // Recupera il DID dell'issuer

  const verifiableCredential: VerifiableCredential = await agent.createVerifiableCredential({
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
      // Aggiungi i segnali pubblici necessari per la verifica zkSNARK
      publicSignals: [
        "0x456...", "0x789..." // Sostituisci con i segnali pubblici effettivi del circuito
      ],
    },
    save: true,
  });

  console.log('Verifiable Credential creata:', verifiableCredential);
  return verifiableCredential;
}