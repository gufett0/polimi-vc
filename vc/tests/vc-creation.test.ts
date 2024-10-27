import { createStudentVC, createPolimiVC } from '../create-vc';

describe('Verifiable Credential Creation', () => {

  it('should create a self-attested Student VC with zkSNARK proof', async () => {
    const studentVC = await createStudentVC();
    
    expect(studentVC).toBeDefined();
    expect(studentVC.issuer).toBe('did:ethr:');
    expect(studentVC.credentialSubject).toHaveProperty('name');
    expect(studentVC.credentialSubject).toHaveProperty('date');
    expect(studentVC.credentialSubject).toHaveProperty('amount');
  });

  it('should create a Polimi VC with student email and DKIM public key', async () => {
    const studentDid = 'did:ethr:sepolia:';
    const email = 'francesco1.carbone@mail.polimi.it';
    const dkimPubKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArrqfB98shqxeHsARHTc7LYDGgzdzhXUa1ByUw2+NZCmeKXk2fDbGCCw6sN5vS9spjhU9gvY8l5ghy840xMo8YispftRf01wf66YeoB+5wk1dERhE5H1DFWMXZ7z7G1/Hp/cXjRO5nWa4dvhFVLckGDk1bFfeelFaalHSTcuW9ZILMXi8SBs9hgou1GPkj2qoJDvqY6vR6qt0ac" "q+REyyY3DEgeIXN2y5ohHTFQerYLg5TWjtzk5MxjLanQSUrS2K50JlKGVLWbAixxFr45byHP1qVVef9vP2WMnnJNJsrETsP4sL1KD5wMftAb+Ri5WDGutC5zixeYWBIw3sg17BpwIDAQAB';

    const polimiVC = await createPolimiVC(studentDid, email, dkimPubKey);
    
    expect(polimiVC).toBeDefined();
    expect(polimiVC.issuer).toBe('did:ethr:sepolia:polimi');
    expect(polimiVC.credentialSubject.id).toBe(studentDid);
    expect(polimiVC.credentialSubject).toHaveProperty('email');
    expect(polimiVC.credentialSubject).toHaveProperty('dkimPubKey');
  });
});
