import { agent } from '../circuits/scripts/setup-agent'; // Importa l'agente configurato
import { VerifiablePresentation } from '@veramo/core'; // Veramo VP type
import { createVC } from './create-vc'; // Importa la funzione per creare la VC

// Funzione per creare una Verifiable Presentation (VP) da una VC
export async function createVP() {
  // Crea prima la Verifiable Credential (VC)
  const vc = await createVC();

  // Ora crea la Verifiable Presentation (VP)
  const verifiablePresentation: VerifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      verifiableCredential: [vc], // Include la VC nella presentazione
      holder: 'did:ethr:subject-did', // DID del soggetto che detiene la VC
    },
    proofFormat: 'jwt', // O zkSNARK se supportato (aggiorna a seconda delle esigenze)
    proof: {
      type: "zkSNARK", // zkSNARK proof associata alla VP
      proofPurpose: "authentication", // Prova che il soggetto sta autenticando la presentazione
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
  });

  console.log('Verifiable Presentation creata:', verifiablePresentation);
  return verifiablePresentation;
}