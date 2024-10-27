import { createVerifiablePresentation } from '../create-vp';
import { agent } from '../setup-agent'; // Import your Veramo agent

describe('Verifiable Presentation Creation', () => {
  it('should create a Verifiable Presentation with filtered Student VC and Polimi VC', async () => {
    const studentDid = 'did:ethr:sepolia:student123';
    const email = 'student@polimi.it';
    const dkimPubKey = 'MIIBIjAN...';

    // Create the Verifiable Presentation
    const vp = await createVerifiablePresentation(studentDid, email, dkimPubKey);

    expect(vp).toBeDefined();

    // Ensure that verifiableCredential is defined
    const verifiableCredential = vp.verifiableCredential as string[];
    expect(verifiableCredential.length).toBe(2); // Polimi VC + Student VC

    // Decode the JWT (assuming the credentials are in JWT format)
    const studentVCJwt = verifiableCredential.find(vc => vc.includes(studentDid));
    expect(studentVCJwt).toBeDefined();

    // Verify and decode the student VC JWT
    const verifiedStudentVC = await agent.verifyCredential({ credential: studentVCJwt! });
    
    // Check that fields were filtered in the student VC
    expect(verifiedStudentVC.credentialSubject.amount).toBeUndefined(); // Field was omitted
    expect(verifiedStudentVC.credentialSubject.matricola).toBeUndefined(); // Field was omitted
  });
});
