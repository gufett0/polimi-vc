import { agent } from './setup-agent';
import { VerifiablePresentation } from '@veramo/core';

// Funzione per creare una Verifiable Presentation (VP) con campi selezionati
export async function createVerifiablePresentation(studentDid: string, studentVC: any, polimiVC: any) {
  try {
    // Crea una copia della VC dello studente con campi filtrati
    const filteredStudentVC = JSON.parse(JSON.stringify(studentVC));
    delete filteredStudentVC.credentialSubject.amount;
    delete filteredStudentVC.credentialSubject.matricola;

    // Combina le VC filtrate in una Verifiable Presentation (VP)
    const verifiablePresentation: VerifiablePresentation = await agent.createVerifiablePresentation({
      presentation: {
        holder: studentDid,
        verifiableCredential: [filteredStudentVC, polimiVC], // Usa la VC dello studente filtrata
      },
      proofFormat: 'jwt',
    });

    console.log('Verifiable Presentation created:', verifiablePresentation);
    return verifiablePresentation;
  } catch (error) {
    console.error('Error creating Verifiable Presentation:', error);
    throw error;
  }
}
