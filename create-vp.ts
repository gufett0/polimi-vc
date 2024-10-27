import { agent } from './setup-agent'; // Importa l'agente configurato
import { VerifiablePresentation } from '@veramo/core'; // Veramo VP type
import { createPolimiVC, createStudentVC } from './create-vc'; // Importa la funzione per creare la VC

// Function to create a Verifiable Presentation (VP) and choose which fields to display
export async function createVerifiablePresentation(studentDid: string, email: string, dkimPubKey: string) {
  try {
    // Create Polimi's VC
    const polimiVC = await createPolimiVC(studentDid, email, dkimPubKey);

    // Create Student's Self-Attested VC
    const studentVC = await createStudentVC();

    // Filter fields from Student's Self-Attested VC (exclude amount and matricola in this example)
    const filteredStudentVC = {
      ...studentVC,
      credentialSubject: {
        ...studentVC.credentialSubject,
        amount: undefined, // Exclude the amount field
        matricola: undefined, // Exclude the matricola field
      },
    };

    // Combine both VCs into a Verifiable Presentation (VP)
    const verifiablePresentation = await agent.createVerifiablePresentation({
      presentation: {
        holder: studentDid,
        verifiableCredential: [filteredStudentVC, polimiVC], // Use the filtered Student VC
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