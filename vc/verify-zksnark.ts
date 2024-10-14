import * as snarkjs from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';

// Funzione per verificare la prova zkSNARK
export async function verifyProof(vp: any) {
  try {
    // Estrai la prova zkSNARK dalla Verifiable Presentation (VP)
    const proof = vp.proof.proofValue;
    const publicSignals = vp.proof.publicSignals; // Assicurati che i segnali pubblici siano inclusi nella VP

    // Percorso per il file di chiave di verifica
    const verificationKeyPath = path.resolve(__dirname, './verification_key.json');

    // Leggi la chiave di verifica dal file
    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));

    // Prepara i dati della prova zkSNARK
    const proofData = {
      pi_a: proof.pi_a,
      pi_b: proof.pi_b,
      pi_c: proof.pi_c
    };

    // Verifica la prova zkSNARK con snarkjs
    const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proofData);

    if (isValid) {
      console.log('La prova zkSNARK è valida!');
    } else {
      console.log('La prova zkSNARK NON è valida!');
    }

    return isValid;
  } catch (error) {
    console.error('Errore nella verifica della prova zkSNARK:', error);
    return false;
  }
}