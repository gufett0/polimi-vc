import { createVerifiablePresentation } from '../create-vp';
import { agent } from '../setup-agent'; // Import your Veramo agent

describe('Verifiable Presentation Creation', () => {
  it('should create a Verifiable Presentation with filtered Student VC and Polimi VC', async () => {
   const studentDid = 'did:ethr:sepolia:';
    const email = 'francesco1.carbone@mail.polimi.it';
    const dkimPubKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArrqfB98shqxeHsARHTc7LYDGgzdzhXUa1ByUw2+NZCmeKXk2fDbGCCw6sN5vS9spjhU9gvY8l5ghy840xMo8YispftRf01wf66YeoB+5wk1dERhE5H1DFWMXZ7z7G1/Hp/cXjRO5nWa4dvhFVLckGDk1bFfeelFaalHSTcuW9ZILMXi8SBs9hgou1GPkj2qoJDvqY6vR6qt0ac" "q+REyyY3DEgeIXN2y5ohHTFQerYLg5TWjtzk5MxjLanQSUrS2K50JlKGVLWbAixxFr45byHP1qVVef9vP2WMnnJNJsrETsP4sL1KD5wMftAb+Ri5WDGutC5zixeYWBIw3sg17BpwIDAQAB';

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
