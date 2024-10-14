import { agent } from '../circuits/scripts/setup-agent'; // Importa l'agente configurato
import { verifyProof } from './verify-zksnark'; // Funzione per verificare zkSNARK

// Funzione per verificare una Verifiable Presentation (VP)
export async function verifyVP(vp: any) {
  // Verifica la presentazione utilizzando Veramo
  const isValid = await agent.verifyPresentation({ presentation: vp });

  if (isValid) {
    console.log('Verifiable Presentation è valida:', isValid);
  } else {
    console.log('Verifiable Presentation NON valida');
    return false;
  }

  // Verifica la prova zkSNARK inclusa nella VP
  const zkResult = await verifyProof(vp);
  console.log('Esito della verifica zkSNARK nella VP:', zkResult);

  return zkResult;
}